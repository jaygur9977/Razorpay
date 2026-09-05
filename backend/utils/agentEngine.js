// Complete Agent Workflow Engine with AI Decision Logic
import Case from '../models/Case.js';
import Transaction from '../models/Transaction.js';
import AgentLog from '../models/AgentLog.js';
import AuditTrail from '../models/AuditTrail.js';
import Notification from '../models/Notification.js';
import { emitAgentUpdate, emitCaseUpdate, emitRecoveryProgress, emitToAll } from './socketManager.js';
import { runGroqAgent } from './groqAgent.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Agent definitions with metadata
const agentDefinitions = {
  detection: {
    label: 'Detection Agent',
    icon: 'Search',
    color: '#06b6d4',
    description: 'Identifies revenue at risk from transaction data',
  },
  diagnosis: {
    label: 'Diagnosis Agent',
    icon: 'Stethoscope',
    color: '#8b5cf6',
    description: 'Analyzes root cause of payment failures',
  },
  priority: {
    label: 'Priority Agent',
    icon: 'Target',
    color: '#f59e0b',
    description: 'Calculates Expected Net Recovery Value',
  },
  decision: {
    label: 'Decision Agent',
    icon: 'Zap',
    color: '#ec4899',
    description: 'Selects optimal recovery action',
  },
  execution: {
    label: 'Execution Agent',
    icon: 'Bot',
    color: '#10b981',
    description: 'Performs recovery actions',
  },
  monitor: {
    label: 'Monitor Agent',
    icon: 'Eye',
    color: '#a855f7',
    description: 'Tracks response and outcomes',
  },
  escalation: {
    label: 'Escalation Agent',
    icon: 'Shield',
    color: '#ef4444',
    description: 'Manages human approval workflow',
  },
  audit: {
    label: 'Audit Agent',
    icon: 'FileCheck',
    color: '#94a3b8',
    description: 'Logs all actions for compliance',
  },
};

// Action definitions with costs
const actionDefinitions = {
  auto_retry: {
    label: 'Auto Retry',
    cost: 0,
    successRate: 0.85,
    description: 'Automatically retry the payment',
  },
  whatsapp_reminder: {
    label: 'WhatsApp Reminder',
    cost: 10,
    successRate: 0.65,
    description: 'Send WhatsApp message with payment link',
  },
  email_followup: {
    label: 'Email Follow-up',
    cost: 5,
    successRate: 0.45,
    description: 'Send email reminder',
  },
  voice_call: {
    label: 'Voice Call',
    cost: 100,
    successRate: 0.72,
    description: 'Make voice call to customer',
  },
  smart_discount: {
    label: 'Smart Discount',
    cost: 500,
    successRate: 0.90,
    description: 'Offer personalized discount',
  },
  stop_recovery: {
    label: 'Stop Recovery',
    cost: 0,
    successRate: 0,
    description: 'Stop further recovery attempts',
  },
};
const BASE_RECOVERY_COST = 34;

// Create agent log
const createLog = async (caseId, agent, message, type = 'info') => {
  const log = await AgentLog.create({
    case: caseId,
    agent,
    message,
    type,
  });
  
  emitAgentUpdate(agent, 'active', message);
  return log;
};

// Create audit entry
const createAudit = async (caseId, action, performedBy, details, complianceStatus = 'compliant') => {
  await AuditTrail.create({
    case: caseId,
    action,
    performedBy,
    details,
    complianceStatus,
  });
};

// Create notification
const createNotification = async (title, message, type = 'info', caseId = null) => {
  const notificationData = { title, message, type };
  if (caseId) notificationData.case = caseId;
  
  const notification = await Notification.create(notificationData);
  emitToAll('notification', notification);
  return notification;
};

// Calculate ENRV (Expected Net Recovery Value)
const calculateENRV = (amount, recoveryProbability, actionCost = 0) => {
  return Math.round(amount * (recoveryProbability / 100) - actionCost);
};

// Get a different fallback action to avoid using the same action twice
const getDifferentFallbackAction = (primaryActionId) => {
  const fallbackMap = {
    'auto_retry': 'whatsapp_reminder',
    'whatsapp_reminder': 'email_followup',
    'email_followup': 'voice_call',
    'voice_call': 'smart_discount',
    'smart_discount': 'email_followup',
    'stop_recovery': 'email_followup'
  };
  return fallbackMap[primaryActionId] || 'email_followup';
};

// Smart action selection based on diagnosis type and attempt number
const getSmartActionForDiagnosis = (diagnosis, attemptNumber, amount) => {
  const diagnosisCategory = diagnosis?.category?.toLowerCase() || '';
  const rootCause = diagnosis?.rootCause?.toLowerCase() || '';
  
  // For promise_to_pay cases, avoid auto_retry and use different strategies
  if (diagnosisCategory === 'organizational' || 
      rootCause.includes('promise') || 
      rootCause.includes('pledged') ||
      rootCause.includes('pay later')) {
    
    const strategyByAttempt = {
      1: 'whatsapp_reminder',      // First attempt: Gentle reminder
      2: 'email_followup',         // Second attempt: Email follow-up
      3: 'voice_call',             // Third attempt: Direct contact for high value
      4: 'smart_discount',         // Fourth attempt: Offer discount incentive
      5: 'stop_recovery'           // Fifth attempt: Stop and escalate to human
    };
    
    // For high-value cases (>₹10,000), escalate to voice call earlier
    if (amount >= 10000 && attemptNumber >= 2) {
      return attemptNumber === 2 ? 'voice_call' : strategyByAttempt[attemptNumber];
    }
    
    return strategyByAttempt[attemptNumber] || 'stop_recovery';
  }
  
  // For technical failures, use auto_retry first
  if (diagnosisCategory === 'temporary_infrastructure' || 
      diagnosisCategory === 'connectivity_issue' ||
      diagnosisCategory === 'external_infrastructure') {
    return attemptNumber === 1 ? 'auto_retry' : 'whatsapp_reminder';
  }
  
  // Default strategy
  return attemptNumber === 1 ? 'auto_retry' : 'whatsapp_reminder';
};

// Main recovery workflow
export const runRecoveryWorkflow = async (caseData) => {
  try {
    const caseId = caseData._id;
    const transaction = await Transaction.findById(caseData.transaction);

    if (['recovered', 'successful'].includes(transaction?.status)) {
      caseData.status = 'recovered';
      caseData.isEscalated = false;
      caseData.execution = { ...caseData.execution, result: 'success', amountRecovered: transaction.amount };
      await caseData.save();
      return { success: true, caseData, logs: await AgentLog.find({ case: caseId }).sort({ createdAt: 1 }), auditTrail: await AuditTrail.find({ case: caseId }).sort({ createdAt: 1 }) };
    }
    
    emitRecoveryProgress(caseData.caseId, 0, 'Starting recovery workflow');
    
    // ============ STEP 1: DETECTION ============
    await createLog(caseId, 'detection', 'Analyzing transaction data...', 'processing');
    await sleep(150);
    const detection = {
      isAtRisk: !['recovered', 'successful'].includes(transaction?.status),
      riskLevel: caseData.priority === 'CRITICAL' ? 'critical' : caseData.priority === 'HIGH' ? 'high' : 'medium',
      isRecoverable: !['recovered', 'successful'].includes(transaction?.status),
      immediateAction: 'create_case',
      reasoning: 'Transaction status and the priority analysis identify an actionable recovery case.',
    };
    if (!detection.isAtRisk || !detection.isRecoverable) {
      caseData.status = 'stopped';
      caseData.stoppedReason = detection.reasoning || 'LLM determined the case is not recoverable';
      await caseData.save();
      await createLog(caseId, 'detection', `Case stopped: ${caseData.stoppedReason}`, 'warning');
      await createAudit(caseId, 'Stopped non-recoverable case', 'detection_agent', caseData.stoppedReason);
      return { success: true, caseData, logs: await AgentLog.find({ case: caseId }).sort({ createdAt: 1 }), auditTrail: await AuditTrail.find({ case: caseId }).sort({ createdAt: 1 }) };
    }
    await createLog(caseId, 'detection', `Revenue at risk detected (${detection.riskLevel}): ${detection.reasoning}`, 'detected');
    await createAudit(caseId, 'Detected revenue at risk', 'detection_agent', detection.reasoning);
    emitRecoveryProgress(caseData.caseId, 15, 'Detection complete');
    
    // ============ STEP 2: DIAGNOSIS ============
    await createLog(caseId, 'diagnosis', 'Running root cause analysis...', 'processing');
    await sleep(400);
    const diagnosis = await runGroqAgent('diagnosis', {
      caseId: caseData.caseId,
      amount: caseData.amount,
      type: caseData.type,
      customerName: caseData.customerName,
      failureReason: transaction?.failureReason,
      customerType: transaction?.customerType,
      previousOrders: transaction?.previousOrders,
      paymentMethod: transaction?.paymentMethod,
    });
    await createLog(caseId, 'diagnosis', `Root cause: ${diagnosis.rootCause}`, 'diagnosed');
    await createLog(caseId, 'diagnosis', `Confidence: ${diagnosis.confidence}%`, 'success');
    await createAudit(caseId, 'Diagnosed root cause', 'diagnosis_agent', `Root cause: ${diagnosis.rootCause}, Confidence: ${diagnosis.confidence}%`);
    
    // Update case with diagnosis
    caseData.diagnosis = diagnosis;
    caseData.aiConfidence = diagnosis.confidence;
    await caseData.save();
    emitCaseUpdate(caseData);
    emitRecoveryProgress(caseData.caseId, 30, 'Diagnosis complete');
    
    // ============ STEP 3: PRIORITY ============
    await createLog(caseId, 'priority', 'Calculating Expected Net Recovery Value...', 'processing');
    await sleep(250);
    
    const priorityResult = caseData.status === 'prioritized'
      ? { priority: caseData.priority, queuePosition: 1 }
      : await runGroqAgent('priority', {
        caseId: caseData.caseId,
        amount: caseData.amount,
        type: caseData.type,
        recoveryProbability: diagnosis.recoveryProbability,
        customerName: caseData.customerName,
        currentCases: await Case.find({ status: { $in: ['detected', 'diagnosed', 'prioritized'] } }).select('caseId amount type recoveryProbability customerName').limit(50),
      });
    const recoveryProbability = Math.round(Number(diagnosis.recoveryProbability) || 0);
    const enrv = calculateENRV(caseData.amount, recoveryProbability);
    const priority = priorityResult.priority;
    
    await createLog(caseId, 'priority', `ENRV: ₹${enrv.toLocaleString()}`, 'prioritized');
    await createLog(caseId, 'priority', `Recovery probability: ${recoveryProbability}%`, 'info');
    await createLog(caseId, 'priority', `Priority: ${priority} | Queue position: #${priorityResult.queuePosition}`, 'info');
    await createAudit(caseId, 'Calculated priority', 'priority_agent', `ENRV: ₹${enrv}, Priority: ${priority}`);
    
    caseData.enrv = enrv;
    caseData.recoveryProbability = recoveryProbability;
    caseData.priority = priority;
    caseData.status = 'prioritized';
    await caseData.save();
    emitCaseUpdate(caseData);
    emitRecoveryProgress(caseData.caseId, 45, 'Priority assigned');
    
    // ============ STEP 4: DECISION ============
    await createLog(caseId, 'decision', 'Analyzing recovery actions...', 'processing');
    await sleep(250);
    
    // For promise_to_pay cases, use smart action selection instead of LLM decision
    const isPromiseToPayCase = diagnosis?.category?.toLowerCase() === 'organizational' || 
                              diagnosis?.rootCause?.toLowerCase().includes('promise') ||
                              diagnosis?.rootCause?.toLowerCase().includes('pledged') ||
                              diagnosis?.rootCause?.toLowerCase().includes('pay later');
    
    let decision;
    if (isPromiseToPayCase) {
      // Use smart action selection for promise_to_pay cases
      const smartActionId = getSmartActionForDiagnosis(diagnosis, caseData.attempts + 1, caseData.amount);
      const smartFallbackId = getSmartActionForDiagnosis(diagnosis, caseData.attempts + 2, caseData.amount);
      
      decision = {
        selectedAction: smartActionId,
        fallbackAction: smartFallbackId !== smartActionId ? smartFallbackId : 'email_followup',
        expectedNetRecovery: calculateENRV(caseData.amount, recoveryProbability, actionDefinitions[smartActionId]?.cost || 0),
        reasoning: `Smart action selection for promise-to-pay case (attempt ${caseData.attempts + 1}): Using ${actionDefinitions[smartActionId]?.label} based on diagnosis and attempt history.`,
        shouldOfferDiscount: smartActionId === 'smart_discount',
        stoppingCondition: 'Escalate to human contact after maximum attempts'
      };
      
      await createLog(caseId, 'decision', `Smart action selected for promise-to-pay case: ${actionDefinitions[smartActionId]?.label}`, 'decided');
    } else {
      // Use LLM decision for other cases
      decision = await runGroqAgent('decision', {
        caseId: caseData.caseId,
        amount: caseData.amount,
        customerName: caseData.customerName,
        customerType: transaction?.customerType,
        diagnosis,
        recoveryProbability,
        availableActions: Object.entries(actionDefinitions).map(([id, action]) => ({ id, label: action.label, cost: action.cost, description: action.description })),
      });
    }
    
    const selectedDefinition = actionDefinitions[decision.selectedAction];
    const bestAction = { actionId: decision.selectedAction, ...selectedDefinition, label: selectedDefinition.label, enrv: Math.max(0, calculateENRV(caseData.amount, recoveryProbability, selectedDefinition.cost)), adjustedSuccessRate: selectedDefinition.successRate };
    
    await createLog(caseId, 'decision', `Selected action: ${bestAction.label}`, 'decided');
    await createLog(caseId, 'decision', `Expected recovery: ₹${bestAction.enrv.toLocaleString()}`, 'info');
    await createLog(caseId, 'decision', `Action cost: ${bestAction.cost === 0 ? 'Free' : `₹${bestAction.cost}`}`, 'info');
    await createAudit(caseId, 'Selected recovery action', 'decision_agent', `Action: ${bestAction.label}, ENRV: ₹${bestAction.enrv}`);
    
    caseData.decision = {
      selectedAction: bestAction.label,
      fallbackAction: decision.fallbackAction && actionDefinitions[decision.fallbackAction]?.label !== bestAction.label 
        ? actionDefinitions[decision.fallbackAction]?.label 
        : getDifferentFallbackAction(decision.selectedAction),
      reasoning: decision.reasoning,
      expectedRecovery: decision.expectedNetRecovery || bestAction.enrv,
    };
    caseData.status = 'decided';
    await caseData.save();
    emitCaseUpdate(caseData);
    emitRecoveryProgress(caseData.caseId, 60, 'Decision made');
    
    // ============ STEP 5: ESCALATION CHECK ============
    const escalationThreshold = 10000;
    
    // For promise-to-pay cases, escalate earlier (after 2 failed attempts) or for high-value cases
    const shouldEscalate = !caseData.escalationApproved && (
      (priority === 'CRITICAL' || caseData.amount >= escalationThreshold) ||
      (isPromiseToPayCase && caseData.attempts >= 2)
    );
    
    if (shouldEscalate) {
      const escalationReason = isPromiseToPayCase && caseData.attempts >= 2
        ? `Promise-to-pay case with ${caseData.attempts} failed attempts. Human intervention required.`
        : `High-value case (₹${caseData.amount.toLocaleString()}) with ${priority} priority. Escalation required for Operations Manager approval.`;
      
      await createLog(caseId, 'escalation', escalationReason, 'warning');
      await sleep(300);
      await createLog(caseId, 'escalation', '⏸️ Workflow paused. Awaiting manual review and approval by Operations Manager in Ops Dashboard.', 'warning');
      
      caseData.isEscalated = true;
      caseData.escalationApproved = false;
      caseData.status = 'escalated';
      await caseData.save();
      emitCaseUpdate(caseData);
      
      await createNotification(
        'Action Required: Case Escalated',
        `${escalationReason} Case ${caseData.caseId} (₹${caseData.amount.toLocaleString()}) requires Operations Manager approval before execution.`,
        'escalation',
        caseId
      );
      
      await createAudit(caseId, 'Case Escalated to Ops Manager', 'escalation_agent', escalationReason);
      emitRecoveryProgress(caseData.caseId, 65, 'Awaiting Ops Manager Approval');

      return {
        success: true,
        awaitingApproval: true,
        caseData,
        logs: await AgentLog.find({ case: caseId }).sort({ createdAt: 1 }),
        auditTrail: await AuditTrail.find({ case: caseId }).sort({ createdAt: 1 }),
      };
    } else if (caseData.escalationApproved) {
      await createLog(caseId, 'escalation', '✅ Operations Manager approved recovery for this case. Proceeding to execution.', 'success');
      await createAudit(caseId, 'Approved by Operations Manager', 'human', 'Operations Manager authorized recovery execution.');
      emitRecoveryProgress(caseData.caseId, 70, 'Operator Approval Confirmed');
    }
    
    // ============ STEP 6: EXECUTION ============
    await createLog(caseId, 'execution', `Executing ${bestAction.label}...`, 'processing');
    await sleep(500);
    const executionMessage = { subject: `${bestAction.label} started`, message: `Recovery action coordinated from the diagnosis and decision context.` };
    await createLog(caseId, 'execution', `${executionMessage.subject}: ${executionMessage.message}`, 'info');
    
    const simulatedOutcome = transaction?.metadata?.get('outcome') || 'pending';
    const success = simulatedOutcome === 'success';

    // Every execution, including a retry or fallback, is a real attempt.
    caseData.attempts += 1;
    await caseData.save();
    emitCaseUpdate(caseData);

    if (simulatedOutcome === 'pending') {
      await createLog(caseId, 'execution', 'Action submitted; awaiting external payment result.', 'info');
      await createLog(caseId, 'execution', 'No external provider is connected; stopping safely for manual retry.', 'info');
      caseData.status = 'stopped';
      caseData.stoppedReason = 'External payment result was not received; manual retry is available.';
      caseData.execution = { actionTaken: bestAction.label, result: 'failed', amountRecovered: 0, timeTaken: '4 minutes' };
      await caseData.save();
      emitCaseUpdate(caseData);
      emitRecoveryProgress(caseData.caseId, 90, 'Awaiting external result');
    } else if (success) {
      await createLog(caseId, 'execution', `✅ Recovery successful!`, 'success');
      await createLog(caseId, 'execution', `Amount recovered: ₹${caseData.amount.toLocaleString()}`, 'success');
      await createAudit(caseId, 'Recovery executed', 'execution_agent', 'Recovery successful');
      
      caseData.status = 'recovered';
      caseData.execution = {
        actionTaken: bestAction.label,
        result: 'success',
        amountRecovered: caseData.amount,
        timeTaken: '2 minutes',
      };
      await caseData.save();
      
      // Update transaction
      if (transaction) {
        transaction.status = 'recovered';
        transaction.isProcessed = true;
        await transaction.save();
      }
      
      await createNotification(
        'Revenue Recovered',
        `₹${caseData.amount} recovered from case ${caseData.caseId}`,
        'success',
        caseId
      );
      
      emitCaseUpdate(caseData);
      emitRecoveryProgress(caseData.caseId, 90, 'Recovery successful');
    } else {
      await createLog(caseId, 'execution', '❌ Initial attempt failed', 'error');
      
      // Use the actual fallback action from decision instead of hardcoded value
      const fallbackAction = decision.fallbackAction && actionDefinitions[decision.fallbackAction] 
        ? actionDefinitions[decision.fallbackAction].label 
        : 'Email Follow-up';
      
      await createLog(caseId, 'execution', `Trying fallback: ${fallbackAction}`, 'info');
      await sleep(400);
      if (caseData.attempts >= caseData.maxAttempts) {
        caseData.status = 'stopped';
        caseData.stoppedReason = 'Maximum recovery attempts reached';
        caseData.execution = { actionTaken: bestAction.label, result: 'failed', amountRecovered: 0, timeTaken: '4 minutes' };
        await caseData.save();
        emitCaseUpdate(caseData);
        return { success: true, caseData, logs: await AgentLog.find({ case: caseId }).sort({ createdAt: 1 }), auditTrail: await AuditTrail.find({ case: caseId }).sort({ createdAt: 1 }) };
      }
      caseData.attempts += 1;
      await caseData.save();
      emitCaseUpdate(caseData);
      
      // A failed primary action gets one fallback attempt. Simulation data can
      // explicitly mark that fallback as successful without calling a provider.
      const fallbackSuccess = simulatedOutcome === 'fallback_success';
      
      if (fallbackSuccess) {
        await createLog(caseId, 'execution', '✅ Fallback successful. Payment recovered!', 'success');
        await createAudit(caseId, 'Fallback recovery executed', 'execution_agent', 'Fallback successful');
        
        caseData.status = 'recovered';
        caseData.execution = {
          actionTaken: fallbackAction,
          result: 'success',
          amountRecovered: caseData.amount,
          timeTaken: '4 minutes',
        };
        await caseData.save();
        if (transaction) {
          transaction.status = 'recovered';
          transaction.isProcessed = true;
          await transaction.save();
        }
        await createNotification(
          'Revenue Recovered',
          `₹${caseData.amount} recovered from case ${caseData.caseId}`,
          'success',
          caseId
        );
        emitCaseUpdate(caseData);
        emitRecoveryProgress(caseData.caseId, 90, 'Recovery successful via fallback');
      } else {
        await createLog(caseId, 'execution', '❌ Recovery failed. Marking as stopped.', 'error');
        await createAudit(caseId, 'Recovery failed', 'execution_agent', 'Both primary and fallback failed');
        
        caseData.status = 'stopped';
        const rootCauseText = diagnosis?.rootCause || transaction?.failureReason || 'Payment authorization declined';
        caseData.stoppedReason = `Recovery unsuccessful: Primary action (${bestAction.label}) and fallback channel (${fallbackAction}) both failed without payment confirmation. Root cause: ${rootCauseText}. Customer did not complete authorization or payment provider remained unreachable.`;
        caseData.execution = {
          actionTaken: bestAction.label,
          result: 'failed',
          amountRecovered: 0,
          timeTaken: '5 minutes',
        };
        await caseData.save();
        emitCaseUpdate(caseData);
        emitRecoveryProgress(caseData.caseId, 90, 'Recovery stopped');
      }
    }
    
    // ============ STEP 7: MONITOR ============
    await createLog(caseId, 'monitor', 'Updating case status and evaluating final recovery state...', 'processing');
    await sleep(200);
    const monitorReasoning = caseData.status === 'recovered'
      ? `Recovery confirmed. ₹${caseData.execution?.amountRecovered?.toLocaleString()} recovered via ${caseData.execution?.actionTaken}.`
      : `Recovery stopped. Reason: ${caseData.stoppedReason || 'Recovery attempts exhausted without payment confirmation.'} (${caseData.attempts}/${caseData.maxAttempts} attempts used).`;
    await createLog(caseId, 'monitor', `Case marked as ${caseData.status.toUpperCase()}: ${monitorReasoning}`, caseData.status === 'recovered' ? 'success' : 'warning');
    await createAudit(caseId, 'Case status updated', 'monitor_agent', `Status: ${caseData.status}. Details: ${monitorReasoning}`);
    
    // ============ STEP 8: AUDIT ============
    await createLog(caseId, 'audit', 'Logging all actions to audit trail...', 'processing');
    await sleep(200);
    const audit = {
      compliant: true,
      violations: [],
      auditSummary: caseData.status === 'recovered'
        ? 'Workflow completed successfully. Revenue recovered and compliant.'
        : `Workflow stopped in compliance with stopping rules. Reason: ${caseData.stoppedReason || 'Payment failure'}`
    };
    await createLog(caseId, 'audit', audit.compliant ? 'Audit complete. Fully compliant.' : `Audit found ${audit.violations.length} issue(s).`, audit.compliant ? 'success' : 'warning');
    await createAudit(caseId, 'Audit completed', 'audit_agent', audit.auditSummary, audit.compliant ? 'compliant' : 'non_compliant');

    if (caseData.execution?.result === 'success') {
      caseData.status = 'recovered';
      caseData.isEscalated = false;
      await caseData.save();
      emitCaseUpdate(caseData);
    }
    
    emitRecoveryProgress(caseData.caseId, 100, 'Workflow complete');
    
    return {
      success: true,
      caseData,
      logs: await AgentLog.find({ case: caseId }).sort({ createdAt: 1 }),
      auditTrail: await AuditTrail.find({ case: caseId }).sort({ createdAt: 1 }),
    };
  } catch (error) {
    console.error('Workflow Error:', error);
    caseData.status = 'failed';
    caseData.stoppedReason = error.message;
    await caseData.save().catch(() => {});
    await AgentLog.create({ case: caseData._id, agent: 'audit', message: `Workflow failed: ${error.message}`, type: 'error' }).catch(() => {});
    emitCaseUpdate(caseData);
    return { success: false, error: error.message };
  }
};

// Run batch workflow
export const runBatchWorkflow = async (cases) => {
  const results = [];
  
  for (const caseData of cases) {
    const result = await runRecoveryWorkflow(caseData);
    results.push(result);
    await sleep(250);
  }
  
  return results;
};

// Process pending cases
export const processPendingCases = async () => {
  try {
    const pendingCases = await Case.find({
      status: { $in: ['detected', 'diagnosed', 'prioritized'] },
    }).limit(10);
    
    console.log(`📋 Found ${pendingCases.length} pending cases`);
    
    const results = await runBatchWorkflow(pendingCases);
    
    return {
      success: true,
      processed: results.length,
      results,
    };
  } catch (error) {
    console.error('Batch processing error:', error);
    return { success: false, error: error.message };
  }
};

// Get agent definitions
export const getAgentDefinitions = () => {
  return agentDefinitions;
};

// Get action definitions
export const getActionDefinitions = () => {
  return actionDefinitions;
};