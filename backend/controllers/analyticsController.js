import Transaction from '../models/Transaction.js';
import Case from '../models/Case.js';
import AgentLog from '../models/AgentLog.js';
import AuditTrail from '../models/AuditTrail.js';

// @desc    Get comprehensive analytics
// @route   GET /api/analytics/overview
export const getAnalyticsOverview = async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
    }

    // Get all relevant data
    const [transactions, cases, agentLogEntries] = await Promise.all([
      Transaction.find({ createdAt: { $gte: startDate } }),
      Case.find({ createdAt: { $gte: startDate } }),
      AgentLog.find({ createdAt: { $gte: startDate } }),
    ]);

    // Calculate metrics
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const failedAmount = transactions.filter(t => t.status === 'failed').reduce((sum, t) => sum + t.amount, 0);
    const recoveredAmount = cases.filter(c => c.status === 'recovered' || c.execution?.result === 'success').reduce((sum, c) => sum + (c.execution?.amountRecovered || c.amount), 0);
    
    const recoveryRate = cases.length > 0 ? (cases.filter(c => c.status === 'recovered' || c.execution?.result === 'success').length / cases.length) * 100 : 0;

    // Agent performance
    const agentPerformance = {};
    const agentNames = ['detection', 'diagnosis', 'priority', 'decision', 'execution', 'monitor', 'escalation', 'audit'];
    
    for (const agent of agentNames) {
      const logsForAgent = agentLogEntries.filter(log => log.agent === agent);
      const successCount = logsForAgent.filter(log => log.type === 'success').length;
      const totalCount = logsForAgent.length;
      
      agentPerformance[agent] = {
        totalLogs: totalCount,
        successRate: totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0,
        avgResponseTime: '2.5s', // This would need more detailed tracking
      };
    }

    // Daily breakdown
    const dailyBreakdown = [];
    const days = Math.ceil((now - startDate) / (24 * 60 * 60 * 1000));
    
    for (let i = 0; i < days; i++) {
      const dayDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDay = new Date(dayDate.getTime() + 24 * 60 * 60 * 1000);
      
      const dayTransactions = transactions.filter(t => t.createdAt >= dayDate && t.createdAt < nextDay);
      const dayCases = cases.filter(c => c.createdAt >= dayDate && c.createdAt < nextDay);
      
      dailyBreakdown.push({
        date: dayDate.toISOString().split('T')[0],
        transactions: dayTransactions.length,
        atRisk: dayTransactions.filter(t => t.status !== 'successful').length,
        recovered: dayCases.filter(c => c.status === 'recovered').length,
        amount: dayTransactions.reduce((sum, t) => sum + t.amount, 0),
      });
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalTransactions: transactions.length,
          totalCases: cases.length,
          totalAmount,
          failedAmount,
          recoveredAmount,
          recoveryRate: Math.round(recoveryRate),
          avgCaseValue: cases.length > 0 ? Math.round(totalAmount / cases.length) : 0,
        },
        agentPerformance,
        dailyBreakdown,
        timeRange,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get agent performance analytics
// @route   GET /api/analytics/agents
export const getAgentAnalytics = async (req, res) => {
  try {
    const agentLogs = await AgentLog.find();
    
    const agents = ['detection', 'diagnosis', 'priority', 'decision', 'execution', 'monitor', 'escalation', 'audit'];
    const performance = [];

    for (const agent of agents) {
      const logs = agentLogs.filter(log => log.agent === agent);
      const successLogs = logs.filter(log => log.type === 'success');
      const errorLogs = logs.filter(log => log.type === 'error');
      const warningLogs = logs.filter(log => log.type === 'warning');
      
      performance.push({
        agent,
        label: agent.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Agent',
        totalLogs: logs.length,
        successCount: successLogs.length,
        errorCount: errorLogs.length,
        warningCount: warningLogs.length,
        successRate: logs.length > 0 ? Math.round((successLogs.length / logs.length) * 100) : 0,
      });
    }

    res.json({
      success: true,
      data: performance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recovery analytics by type
// @route   GET /api/analytics/recovery-types
export const getRecoveryByType = async (req, res) => {
  try {
    const cases = await Case.find();
    
    const typeStats = {};
    
    for (const caseData of cases) {
      const type = caseData.type || 'unknown';
      
      if (!typeStats[type]) {
        typeStats[type] = {
          type,
          totalCases: 0,
          recoveredCases: 0,
          totalAmount: 0,
          recoveredAmount: 0,
        };
      }
      
      typeStats[type].totalCases++;
      typeStats[type].totalAmount += caseData.amount;
      
      if (caseData.status === 'recovered') {
        typeStats[type].recoveredCases++;
        typeStats[type].recoveredAmount += caseData.execution?.amountRecovered || caseData.amount;
      }
    }
    
    const result = Object.values(typeStats).map(stat => ({
      ...stat,
      recoveryRate: stat.totalCases > 0 ? Math.round((stat.recoveredCases / stat.totalCases) * 100) : 0,
    }));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get cost analysis
// @route   GET /api/analytics/costs
export const getCostAnalysis = async (req, res) => {
  try {
    const cases = await Case.find({ status: 'recovered' });
    
    const actionCosts = {
      'Auto Retry': 0,
      'WhatsApp Reminder': 10,
      'Email Follow-up': 5,
      'Voice Call': 100,
      'Smart Discount': 500,
    };
    
    let totalCost = 0;
    let totalRecovered = 0;
    const actionBreakdown = {};

    for (const caseData of cases) {
      const action = caseData.execution?.actionTaken || 'Auto Retry';
      const cost = (caseData.attempts * 34) + (actionCosts[action] || 0);
      const recovered = caseData.execution?.amountRecovered || caseData.amount;
      
      totalCost += cost;
      totalRecovered += recovered;
      
      if (!actionBreakdown[action]) {
        actionBreakdown[action] = {
          action,
          count: 0,
          totalCost: 0,
          totalRecovered: 0,
        };
      }
      
      actionBreakdown[action].count++;
      actionBreakdown[action].totalCost += cost;
      actionBreakdown[action].totalRecovered += recovered;
    }

    res.json({
      success: true,
      data: {
        totalRecovered,
        totalCost,
        netRecovery: totalRecovered - totalCost,
        roi: totalCost > 0 ? Math.round((totalRecovered - totalCost) / totalCost * 100) / 100 : 0,
        avgCostPerRecovery: cases.length > 0 ? Math.round(totalCost / cases.length) : 0,
        actionBreakdown: Object.values(actionBreakdown),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};