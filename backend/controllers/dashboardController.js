import asyncHandler from 'express-async-handler';
import Transaction from '../models/Transaction.js';
import Case from '../models/Case.js';
import AgentLog from '../models/AgentLog.js';

// @desc    Get merchant dashboard data
// @route   GET /api/dashboard/merchant
// @access  Private (Merchant, Admin)
export const getMerchantDashboard = asyncHandler(async (req, res) => {
  // Get all at-risk transactions
  const atRiskTransactions = await Transaction.find({
    status: { $in: ['failed', 'abandoned', 'overdue'] },
  });

  // Get all cases
  const cases = await Case.find();

  const transactions = await Transaction.find();
  const recoveredTransactionIds = new Set(transactions.filter(t => t.status === 'recovered').map(t => String(t._id)));
  const isRecovered = (caseData) => caseData.status === 'recovered' || caseData.execution?.result === 'success' || recoveredTransactionIds.has(String(caseData.transaction));
  const totalAtRiskAmount = atRiskTransactions.reduce((sum, t) => sum + t.amount, 0);
  const recoveredCases = cases.filter(isRecovered);
  const totalRecoveredAmount = recoveredCases.reduce((sum, c) => sum + (c.execution?.amountRecovered || c.amount), 0);
  const activeCases = cases.filter(c => !isRecovered(c) && !['stopped', 'failed'].includes(c.status)).length;
  const stoppedCases = cases.filter(c => c.status === 'stopped').length;
  const attemptedCases = cases.filter(c => c.attempts > 0).length;
  const actionCosts = { 'Auto Retry': 0, 'WhatsApp Reminder': 10, 'Email Follow-up': 5, 'Voice Call': 100, 'Smart Discount': 500 };
  const recoveryCost = cases.reduce((sum, c) => c.attempts > 0 ? sum + (c.attempts * 34) + (actionCosts[c.execution?.actionTaken] || 0) : sum, 0);

  res.json({
    success: true,
    data: {
      kpi: {
        revenueAtRisk: totalAtRiskAmount,
        grossRecovered: totalRecoveredAmount,
        recoveryCost,
        netRecovered: totalRecoveredAmount - recoveryCost,
        recoveryRate: cases.length > 0 ? (recoveredCases.length / cases.length) * 100 : 0,
      },
      funnel: {
        totalTransactions: transactions.length,
        atRisk: atRiskTransactions.length,
        attempted: attemptedCases,
        recovered: recoveredCases.length,
      },
      caseStats: {
        total: cases.length,
        recovered: recoveredCases.length,
        active: activeCases,
        stopped: stoppedCases,
      },
    },
  });
});

// @desc    Get ops dashboard data
// @route   GET /api/dashboard/ops
// @access  Private (Ops Manager, Admin)
export const getOpsDashboard = asyncHandler(async (req, res) => {
  const escalatedCases = await Case.find({ isEscalated: true, escalationApproved: false })
    .sort({ priority: -1, amount: -1 });

  const approvedCases = await Case.find({ escalationApproved: true })
    .sort({ updatedAt: -1 })
    .limit(10);

  res.json({
    success: true,
    data: {
      pendingEscalations: escalatedCases,
      recentApprovals: approvedCases,
      pendingCount: escalatedCases.length,
    },
  });
});

// @desc    Get admin dashboard data
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const totalCases = await Case.countDocuments();
  const totalTransactions = await Transaction.countDocuments();
  const totalRecovered = await Case.countDocuments({ status: 'recovered' });

  res.json({
    success: true,
    data: {
      stats: {
        totalCases,
        totalTransactions,
        totalRecovered,
        recoveryRate: totalCases > 0 ? (totalRecovered / totalCases) * 100 : 0,
      },
    },
  });
});