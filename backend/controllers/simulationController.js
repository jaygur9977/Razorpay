import Transaction from '../models/Transaction.js';
import Case from '../models/Case.js';
import AgentLog from '../models/AgentLog.js';
import { enqueueCases, getQueueStatus, scanAndQueuePendingCases } from '../utils/workflowQueue.js';

// @desc    Run single simulation
// @route   POST /api/simulation/single
export const runSingleSimulation = async (req, res) => {
  try {
    const { eventType, amount, persona, customerName } = req.body;
    if (!customerName || !amount) return res.status(400).json({ success: false, message: 'customerName and amount are required' });
    const finalCustomerName = customerName;
    
    // Determine transaction type
    let transactionType = 'payment';
    let caseType = eventType || 'payment_failure';
    const supportedCaseTypes = {
      voice_recovery: 'payment_failure',
      payment: 'payment_failure',
      checkout: 'checkout_abandonment',
      invoice: 'invoice_overdue',
      subscription: 'subscription_failure',
    };
    caseType = supportedCaseTypes[eventType] || caseType;
    
    if (eventType?.includes('checkout')) {
      transactionType = 'checkout';
      caseType = 'checkout_abandonment';
    }
    if (eventType?.includes('invoice')) {
      transactionType = 'invoice';
      caseType = 'invoice_overdue';
    }
    if (eventType?.includes('subscription')) {
      transactionType = 'subscription';
      caseType = 'subscription_failure';
    }

    // Create transaction
    const transaction = await Transaction.create({
      transactionId: `SIM${Date.now()}${Math.floor(Math.random() * 1000)}`,
      customerName: finalCustomerName,
      customerEmail: `${finalCustomerName.toLowerCase().replace(' ', '.')}@email.com`,
      customerPhone: `+91 98${Math.floor(Math.random() * 10000000)}`,
      customerType: persona || 'regular',
      amount: amount || 5000,
      type: transactionType,
      status: 'failed',
      failureReason: req.body.failureReason || 'none',
      paymentMethod: 'upi',
      source: 'live_simulation',
      metadata: { outcome: ['success', 'failure', 'fallback_success', 'pending'].includes(req.body.outcome) ? req.body.outcome : 'pending' },
    });

    // Create case
    const caseData = await Case.create({
      transaction: transaction._id,
      customerName: finalCustomerName,
      company: req.user.company || '',
      amount: amount || 5000,
      type: caseType,
      status: 'detected',
      priority: 'LOW',
      recoveryProbability: 0,
      aiConfidence: 0,
    });

    const queueStatus = enqueueCases([caseData]);

    res.status(202).json({
      success: true,
      message: 'Simulation queued for LLM priority processing',
      data: {
        transaction,
        case: caseData,
        queue: queueStatus,
      },
    });
  } catch (error) {
    console.error('Single Simulation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Run batch simulation
// @route   POST /api/simulation/batch
export const runBatchSimulation = async (req, res) => {
  try {
    const events = req.body.events;
    if (!Array.isArray(events) || events.length === 0) return res.status(400).json({ success: false, message: 'At least one event is required' });

    const results = [];

    for (const event of events) {
      const customerName = event.customerName || req.user.name;
      
      const transaction = await Transaction.create({
        transactionId: `BATCH${Date.now()}${Math.floor(Math.random() * 10000)}`,
        customerName,
        customerEmail: `${customerName.toLowerCase().replace(' ', '.')}@email.com`,
        customerPhone: `+91 98${Math.floor(Math.random() * 10000000)}`,
        customerType: event.persona || 'regular',
        amount: event.amount,
        type: event.type?.includes('payment') ? 'payment' : 'invoice',
        status: 'failed',
        failureReason: req.body.failureReason || 'none',
        paymentMethod: 'upi',
        source: 'live_simulation',
        metadata: { outcome: ['success', 'failure', 'fallback_success', 'pending'].includes(event.outcome) ? event.outcome : 'pending' },
      });

      const caseData = await Case.create({
        transaction: transaction._id,
        customerName,
        company: req.user.company || '',
        amount: event.amount,
        type: event.type,
        status: 'detected',
        priority: 'LOW',
        enrv: 0,
        recoveryProbability: 0,
        aiConfidence: 0,
      });

      results.push({ transaction, case: caseData });
    }

    const queueStatus = enqueueCases(results.map((result) => result.case));

    res.status(202).json({
      success: true,
      message: `Batch simulation queued: ${results.length} events awaiting LLM priority`,
      data: { results, queue: queueStatus },
    });
  } catch (error) {
    console.error('Batch Simulation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Run custom simulation
// @route   POST /api/simulation/custom
export const runCustomSimulation = async (req, res) => {
  try {
    const { 
      customerName, 
      customerType, 
      customerEmail,
      customerPhone,
      amount, 
      eventType, 
      failureReason,
      paymentMethod 
    } = req.body;
    if (!customerName || !amount || !eventType) return res.status(400).json({ success: false, message: 'customerName, amount, and eventType are required' });

    const transaction = await Transaction.create({
      transactionId: `CUSTOM${Date.now()}`,
      customerName,
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      customerType: customerType || 'regular',
      amount,
      type: eventType?.includes('payment') ? 'payment' : 'checkout',
      status: 'failed',
      failureReason: failureReason || 'none',
      paymentMethod: paymentMethod || 'unknown',
      source: 'live_simulation',
    });

    const caseData = await Case.create({
      transaction: transaction._id,
      customerName: transaction.customerName,
      company: req.user.company || '',
      amount: transaction.amount,
      type: eventType || 'payment_failure',
      status: 'detected',
      priority: 'LOW',
      enrv: 0,
      recoveryProbability: 0,
      aiConfidence: 0,
    });

    const queueStatus = enqueueCases([caseData]);

    res.status(202).json({
      success: true,
      message: 'Custom simulation completed',
      data: { transaction, case: caseData, queue: queueStatus },
    });
  } catch (error) {
    console.error('Custom Simulation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get simulation history
// @route   GET /api/simulation/history
export const getSimulationHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ source: 'live_simulation' })
      .sort({ createdAt: -1 })
      .limit(50);

    const cases = await Case.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: {
        transactions,
        cases,
        totalSimulations: transactions.length,
        totalCases: cases.length,
      },
    });
  } catch (error) {
    console.error('Get Simulation History Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorkflowQueueStatus = async (req, res) => {
  res.json({ success: true, data: getQueueStatus() });
};

export const monitorPendingCases = async (req, res) => {
  try {
    const data = await scanAndQueuePendingCases();
    res.json({ success: true, message: 'Pending recovery cases scanned by monitor agent', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear simulation data
// @route   DELETE /api/simulation/clear
export const clearSimulationData = async (req, res) => {
  try {
    // Delete simulation transactions
    const transactionsResult = await Transaction.deleteMany({ source: 'live_simulation' });
    
    // Delete all cases
    const casesResult = await Case.deleteMany({});
    
    // Delete all agent logs
    const logsResult = await AgentLog.deleteMany({});

    res.json({
      success: true,
      message: 'Simulation data cleared successfully',
      data: {
        transactionsDeleted: transactionsResult.deletedCount,
        casesDeleted: casesResult.deletedCount,
        logsDeleted: logsResult.deletedCount,
      },
    });
  } catch (error) {
    console.error('Clear Simulation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process pending cases
// @route   POST /api/simulation/process-pending
export const processPendingCases = async (req, res) => {
  try {
    const pendingCases = await Case.find({
      status: { $in: ['detected', 'diagnosed', 'prioritized', 'escalated'] },
      $expr: { $lt: ['$attempts', '$maxAttempts'] },
    }).limit(10);

    const queueStatus = enqueueCases(pendingCases);

    res.json({
      success: true,
      message: `Queued ${pendingCases.length} pending cases for LLM processing`,
      data: queueStatus,
    });
  } catch (error) {
    console.error('Process Pending Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};