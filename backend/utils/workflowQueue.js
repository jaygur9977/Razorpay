import Case from '../models/Case.js';
import AgentLog from '../models/AgentLog.js';
import { runRecoveryWorkflow } from './agentEngine.js';
import { runGroqAgent } from './groqAgent.js';
import { emitCaseUpdate, emitRecoveryProgress } from './socketManager.js';

const queue = [];
const queuedCaseIds = new Set();
const inFlightCaseIds = new Set();
let processing = false;

const priorityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

const rankCase = async (caseData) => {
  const result = await runGroqAgent('priority', {
    caseId: caseData.caseId,
    amount: caseData.amount,
    type: caseData.type,
    recoveryProbability: caseData.recoveryProbability,
    customerName: caseData.customerName,
    queueContext: queue.map((item) => ({ caseId: item.caseId, amount: item.amount, type: item.type, recoveryProbability: item.recoveryProbability })),
  });
  caseData.priority = result.priority;
  caseData.enrv = Math.max(0, Math.round(caseData.amount * (caseData.recoveryProbability / 100)));
  caseData.status = 'prioritized';
  await caseData.save();
  await AgentLog.create({ case: caseData._id, agent: 'priority', message: `Queue ranking: ${result.priority}, position ${result.queuePosition}. ${result.reasoning}`, type: 'prioritized' });
  emitCaseUpdate(caseData);
  return { caseData, queuePosition: result.queuePosition };
};

const pump = async () => {
  if (processing) return;
  processing = true;
  try {
    while (queue.length) {
      const ranked = [];
      for (const queuedCase of queue) {
        ranked.push(await rankCase(queuedCase));
      }
      ranked.sort((left, right) => (priorityWeight[right.caseData.priority] - priorityWeight[left.caseData.priority]) || (right.caseData.amount - left.caseData.amount));
      const nextCase = ranked[0].caseData;
      const index = queue.findIndex((item) => String(item._id) === String(nextCase._id));
      if (index >= 0) queue.splice(index, 1);
      queuedCaseIds.delete(String(nextCase._id));
      inFlightCaseIds.add(String(nextCase._id));
      await AgentLog.create({ case: nextCase._id, agent: 'priority', message: `Selected next case for processing: ${nextCase.caseId}`, type: 'info' });
      emitRecoveryProgress(nextCase.caseId, 5, 'Selected by LLM priority queue');
      try {
        const workflow = await runRecoveryWorkflow(nextCase);
        if (!workflow.success) {
          nextCase.status = 'failed';
          nextCase.stoppedReason = workflow.error || 'Workflow failed';
          await nextCase.save();
        }
      } catch (workflowError) {
        nextCase.status = 'failed';
        nextCase.stoppedReason = workflowError.message;
        await nextCase.save();
        await AgentLog.create({ case: nextCase._id, agent: 'audit', message: `Case failed but queue continued: ${workflowError.message}`, type: 'error' });
        emitCaseUpdate(nextCase);
      } finally {
        inFlightCaseIds.delete(String(nextCase._id));
      }
    }
  } catch (error) {
    const failedCase = queue.shift();
    if (failedCase) {
      failedCase.status = 'failed';
      failedCase.stoppedReason = error.message;
      await failedCase.save();
      await AgentLog.create({ case: failedCase._id, agent: 'priority', message: `Queue processing failed: ${error.message}`, type: 'error' });
      emitCaseUpdate(failedCase);
    }
    if (queue.length) setImmediate(pump);
  } finally {
    processing = false;
  }
};

export const enqueueCases = (cases) => {
  const newCases = cases.filter((caseData) => !queuedCaseIds.has(String(caseData._id)));
  newCases.forEach((caseData) => queuedCaseIds.add(String(caseData._id)));
  queue.push(...newCases);
  newCases.forEach((caseData) => emitRecoveryProgress(caseData.caseId, 0, 'Waiting in LLM priority queue'));
  setImmediate(pump);
  return { queued: newCases.length, queueLength: queue.length };
};

export const getQueueStatus = () => ({ processing, queueLength: queue.length, cases: queue.map((caseData) => ({ caseId: caseData.caseId, amount: caseData.amount, priority: caseData.priority, status: caseData.status })) });

export const scanAndQueuePendingCases = async () => {
  const candidates = await Case.find({
    $or: [
      { status: { $in: ['detected', 'diagnosed', 'prioritized'] } },
      { status: 'escalated', escalationApproved: true },
    ],
    $expr: { $lt: ['$attempts', '$maxAttempts'] },
  }).sort({ enrv: -1, amount: -1 }).limit(50);
  const pendingCases = candidates.filter((caseData) => !queuedCaseIds.has(String(caseData._id)) && !inFlightCaseIds.has(String(caseData._id)));
  if (pendingCases.length) enqueueCases(pendingCases);
  return { found: pendingCases.length, ...getQueueStatus() };
};
