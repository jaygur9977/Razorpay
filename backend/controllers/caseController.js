import Case from '../models/Case.js';
import Transaction from '../models/Transaction.js';
import AgentLog from '../models/AgentLog.js';
import AuditTrail from '../models/AuditTrail.js';
import mongoose from 'mongoose';
import { runRecoveryWorkflow } from '../utils/agentEngine.js';
import { emitCaseUpdate } from '../utils/socketManager.js';

const findCaseByRouteId = (routeId) => {
  const conditions = [{ caseId: routeId }];
  if (mongoose.Types.ObjectId.isValid(routeId)) conditions.push({ _id: routeId });
  return Case.findOne({ $or: conditions });
};

const normalizeRecoveryState = async (caseData) => {
  if (caseData?.transaction?.status === 'recovered' || caseData?.execution?.result === 'success') {
    const wasComplete = caseData.status === 'recovered'
      && !caseData.isEscalated
      && caseData.execution?.actionTaken
      && caseData.execution?.timeTaken
      && caseData.execution?.amountRecovered;
    caseData.execution = {
      ...(caseData.execution?.toObject?.() || caseData.execution || {}),
      actionTaken: caseData.execution?.actionTaken || caseData.decision?.selectedAction || 'Auto Retry',
      result: 'success',
      amountRecovered: caseData.execution?.amountRecovered || caseData.transaction.amount,
      timeTaken: caseData.execution?.timeTaken || 'completed',
    };
    if (!wasComplete || caseData.status !== 'recovered' || caseData.isEscalated) {
      caseData.status = 'recovered';
      caseData.isEscalated = false;
      await caseData.save();
    }
  }
  return caseData;
};

// @desc    Get all cases with filters
// @route   GET /api/cases
export const getCases = async (req, res) => {
  try {
    const { status, priority, type, limit = 50, page = 1, sort = '-enrv' } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const cases = await Case.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('transaction');
    await Promise.all(cases.map(normalizeRecoveryState));

    const total = await Case.countDocuments(filter);

    res.json({
      success: true,
      count: cases.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: cases,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get case statistics
// @route   GET /api/cases/stats
export const getCaseStats = async (req, res) => {
  try {
    const totalCases = await Case.countDocuments();
    const recoveredCases = await Case.countDocuments({ status: 'recovered' });
    const activeCases = await Case.countDocuments({ 
      status: { $in: ['detected', 'diagnosed', 'prioritized', 'escalated'] } 
    });
    const stoppedCases = await Case.countDocuments({ status: 'stopped' });
    const failedCases = await Case.countDocuments({ status: 'failed' });

    const totalAmount = await Case.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recoveredAmount = await Case.aggregate([
      { $match: { status: 'recovered' } },
      { $group: { _id: null, total: { $sum: '$execution.amountRecovered' } } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalCases,
        recovered: recoveredCases,
        active: activeCases,
        stopped: stoppedCases,
        failed: failedCases,
        totalAmount: totalAmount[0]?.total || 0,
        recoveredAmount: recoveredAmount[0]?.total || 0,
        recoveryRate: totalCases > 0 ? Math.round((recoveredCases / totalCases) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single case
// @route   GET /api/cases/:id
export const getCaseById = async (req, res) => {
  try {
    const caseData = await findCaseByRouteId(req.params.id).populate('transaction');
    
    if (!caseData) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    await normalizeRecoveryState(caseData);

    res.json({ success: true, data: caseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create case
// @route   POST /api/cases
export const createCase = async (req, res) => {
  try {
    const { customerName, amount, type } = req.body;

    if (!customerName || !amount || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customerName, amount, and type',
      });
    }

    const caseData = await Case.create(req.body);

    res.status(201).json({ success: true, data: caseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update case
// @route   PUT /api/cases/:id
export const updateCase = async (req, res) => {
  try {
    const caseData = await Case.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!caseData) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    res.json({ success: true, data: caseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete case
// @route   DELETE /api/cases/:id
export const deleteCase = async (req, res) => {
  try {
    const caseData = await Case.findByIdAndDelete(req.params.id);

    if (!caseData) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    res.json({ success: true, message: 'Case deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve escalated case
// @route   POST /api/cases/:id/approve
export const approveCase = async (req, res) => {
  try {
    const caseData = await findCaseByRouteId(req.params.id);

    if (!caseData) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    caseData.escalationApproved = true;
    caseData.isEscalated = false;
    caseData.status = 'prioritized';
    await caseData.save();

    await AgentLog.create({
      case: caseData._id,
      agent: 'escalation',
      message: `✅ Operations Manager manually approved recovery for case ${caseData.caseId}. Workflow resuming.`,
      type: 'success',
    });

    await AuditTrail.create({
      case: caseData._id,
      action: 'Authorized by Operations Manager',
      performedBy: 'human',
      details: 'Human operator approved recovery workflow execution from the Operations Dashboard.',
      complianceStatus: 'compliant',
    });

    emitCaseUpdate(caseData);

    res.json({ 
      success: true, 
      message: 'Case approved successfully. Recovery execution resuming.',
      data: caseData,
    });
    setImmediate(() => runRecoveryWorkflow(caseData).catch((error) => console.error('Approved workflow error:', error)));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject escalated case
// @route   POST /api/cases/:id/reject
export const rejectCase = async (req, res) => {
  try {
    const caseData = await findCaseByRouteId(req.params.id);

    if (!caseData) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    caseData.escalationApproved = false;
    caseData.isEscalated = false;
    caseData.status = 'stopped';
    caseData.stoppedReason = 'Rejected by Operations Manager. Recovery halted to prevent customer friction or financial loss.';
    await caseData.save();

    await AgentLog.create({
      case: caseData._id,
      agent: 'escalation',
      message: `❌ Operations Manager rejected case ${caseData.caseId}. Automated recovery stopped.`,
      type: 'warning',
    });

    await AuditTrail.create({
      case: caseData._id,
      action: 'Rejected by Operations Manager',
      performedBy: 'human',
      details: 'Operations Manager reviewed and decided not to proceed with automated recovery.',
      complianceStatus: 'compliant',
    });

    emitCaseUpdate(caseData);

    res.json({ 
      success: true, 
      message: 'Case rejected successfully',
      data: caseData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Escalate case
// @route   POST /api/cases/:id/escalate
export const escalateCase = async (req, res) => {
  try {
    const caseData = await Case.findByIdAndUpdate(
      req.params.id,
      { 
        isEscalated: true,
        status: 'escalated',
      },
      { new: true }
    );

    if (!caseData) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    res.json({ 
      success: true, 
      message: 'Case escalated successfully',
      data: caseData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Retry a failed or stopped recovery case
// @route   POST /api/cases/:id/retry
export const retryCase = async (req, res) => {
  try {
    const caseData = await findCaseByRouteId(req.params.id);
    if (!caseData) return res.status(404).json({ success: false, message: 'Case not found' });
    if (!['failed', 'stopped'].includes(caseData.status)) return res.status(400).json({ success: false, message: 'Only failed or stopped cases can be retried' });

    // If maximum attempts were reached but the operator explicitly triggered a retry, extend max attempts
    if (caseData.attempts >= caseData.maxAttempts) {
      caseData.maxAttempts = caseData.attempts + 2;
    }

    // If an outcome is passed in the retry request body (e.g. for testing success/fallback_success)
    if (req.body?.outcome) {
      const transaction = await Transaction.findById(caseData.transaction);
      if (transaction) {
        if (!transaction.metadata) transaction.metadata = new Map();
        transaction.metadata.set('outcome', req.body.outcome);
        await transaction.save();
      }
    }

    caseData.status = 'prioritized';
    caseData.stoppedReason = '';
    caseData.isEscalated = false;
    await caseData.save();

    await AgentLog.create({
      case: caseData._id,
      agent: 'monitor',
      message: `Manual retry initiated by operator. Re-entering recovery queue with attempt ${caseData.attempts + 1}/${caseData.maxAttempts}.`,
      type: 'info',
    });

    await AuditTrail.create({
      case: caseData._id,
      action: 'Manual Retry Requested',
      performedBy: 'human',
      details: `Operator re-opened stopped recovery case for re-attempt.`,
      complianceStatus: 'compliant',
    });

    emitCaseUpdate(caseData);

    res.status(202).json({ success: true, message: 'Recovery retry started', data: caseData });
    setImmediate(() => runRecoveryWorkflow(caseData).catch((error) => console.error('Retry workflow error:', error)));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};