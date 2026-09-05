import AgentLog from '../models/AgentLog.js';
import Case from '../models/Case.js';

// @desc    Get all agent logs
// @route   GET /api/agents/logs
export const getAgentLogs = async (req, res) => {
  try {
    const { limit = 100, page = 1, agent, type, case: caseId } = req.query;
    
    const filter = {};
    if (agent) filter.agent = agent;
    if (type) filter.type = type;
    if (caseId) filter.case = caseId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AgentLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('case', 'caseId customerName amount status priority');

    const total = await AgentLog.countDocuments(filter);

    res.json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logs by specific agent
// @route   GET /api/agents/logs/:agent
export const getLogsByAgent = async (req, res) => {
  try {
    const { agent } = req.params;
    const { limit = 50 } = req.query;

    const validAgents = ['detection', 'diagnosis', 'priority', 'decision', 'execution', 'monitor', 'escalation', 'audit'];
    
    if (!validAgents.includes(agent)) {
      return res.status(400).json({
        success: false,
        message: `Invalid agent. Valid agents: ${validAgents.join(', ')}`,
      });
    }

    const logs = await AgentLog.find({ agent })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('case', 'caseId customerName amount status');

    const stats = {
      totalLogs: await AgentLog.countDocuments({ agent }),
      lastLogTime: logs[0]?.createdAt || null,
      recentActivity: logs.slice(0, 5),
    };

    res.json({
      success: true,
      count: logs.length,
      stats,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get status of specific agent
// @route   GET /api/agents/status/:agent
export const getAgentStatus = async (req, res) => {
  try {
    const { agent } = req.params;

    const validAgents = ['detection', 'diagnosis', 'priority', 'decision', 'execution', 'monitor', 'escalation', 'audit'];
    
    if (!validAgents.includes(agent)) {
      return res.status(400).json({
        success: false,
        message: `Invalid agent. Valid agents: ${validAgents.join(', ')}`,
      });
    }

    const lastLog = await AgentLog.findOne({ agent })
      .sort({ createdAt: -1 });

    const totalLogs = await AgentLog.countDocuments({ agent });
    
    // Get logs from last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const logs24h = await AgentLog.countDocuments({ 
      agent, 
      createdAt: { $gte: last24Hours } 
    });

    // Get success rate
    const successLogs = await AgentLog.countDocuments({ 
      agent, 
      type: 'success' 
    });
    const errorLogs = await AgentLog.countDocuments({ 
      agent, 
      type: { $in: ['error', 'warning'] } 
    });

    const successRate = (successLogs + errorLogs) > 0 
      ? Math.round((successLogs / (successLogs + errorLogs)) * 100) 
      : 100;

    res.json({
      success: true,
      data: {
        agent,
        label: agent.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Agent',
        isActive: lastLog ? (Date.now() - new Date(lastLog.createdAt)) < 15000 : false,
        lastActivity: lastLog?.createdAt || null,
        lastMessage: lastLog?.message || 'No activity yet',
        totalLogs,
        logsLast24h: logs24h,
        successRate,
        recentLogs: await AgentLog.find({ agent })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('message type createdAt'),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get status of all agents
// @route   GET /api/agents/status
export const getAllAgentStatus = async (req, res) => {
  try {
    const agents = [
      { id: 'detection', label: 'Detection Agent', icon: 'Search' },
      { id: 'diagnosis', label: 'Diagnosis Agent', icon: 'Stethoscope' },
      { id: 'priority', label: 'Priority Agent', icon: 'Target' },
      { id: 'decision', label: 'Decision Agent', icon: 'Zap' },
      { id: 'execution', label: 'Execution Agent', icon: 'Bot' },
      { id: 'monitor', label: 'Monitor Agent', icon: 'Eye' },
      { id: 'escalation', label: 'Escalation Agent', icon: 'Shield' },
      { id: 'audit', label: 'Audit Agent', icon: 'FileCheck' },
    ];

    const statusPromises = agents.map(async (agent) => {
      const lastLog = await AgentLog.findOne({ agent: agent.id })
        .sort({ createdAt: -1 });

      const totalLogs = await AgentLog.countDocuments({ agent: agent.id });
      
      const successLogs = await AgentLog.countDocuments({ 
        agent: agent.id, 
        type: 'success' 
      });
      
      const errorLogs = await AgentLog.countDocuments({ 
        agent: agent.id, 
        type: { $in: ['error', 'warning'] } 
      });

      return {
        ...agent,
        isActive: lastLog ? (Date.now() - new Date(lastLog.createdAt)) < 300000 : false,
        lastActivity: lastLog?.createdAt || null,
        lastMessage: lastLog?.message || 'No activity',
        totalLogs,
        successRate: (successLogs + errorLogs) > 0 
          ? Math.round((successLogs / (successLogs + errorLogs)) * 100) 
          : 100,
      };
    });

    const statuses = await Promise.all(statusPromises);

    // Overall stats
    const totalLogs = await AgentLog.countDocuments();
    const activeAgents = statuses.filter(a => a.isActive).length;
    const totalCases = await Case.countDocuments();

    res.json({
      success: true,
      data: {
        agents: statuses,
        summary: {
          totalAgents: statuses.length,
          activeAgents,
          totalLogs,
          totalCases,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create agent log
// @route   POST /api/agents/logs
export const createAgentLog = async (req, res) => {
  try {
    const { case: caseId, agent, message, type } = req.body;

    if (!agent || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide agent and message',
      });
    }

    const validAgents = ['detection', 'diagnosis', 'priority', 'decision', 'execution', 'monitor', 'escalation', 'audit'];
    
    if (!validAgents.includes(agent)) {
      return res.status(400).json({
        success: false,
        message: `Invalid agent. Valid agents: ${validAgents.join(', ')}`,
      });
    }

    const logData = {
      agent,
      message,
      type: type || 'info',
    };

    if (caseId) {
      logData.case = caseId;
    }

    const log = await AgentLog.create(logData);

    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear all agent logs
// @route   DELETE /api/agents/logs
export const clearAgentLogs = async (req, res) => {
  try {
    const result = await AgentLog.deleteMany({});
    
    res.json({
      success: true,
      message: 'All agent logs cleared successfully',
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear logs for specific agent
// @route   DELETE /api/agents/logs/:agent
export const clearAgentLogsByAgent = async (req, res) => {
  try {
    const { agent } = req.params;

    const validAgents = ['detection', 'diagnosis', 'priority', 'decision', 'execution', 'monitor', 'escalation', 'audit'];
    
    if (!validAgents.includes(agent)) {
      return res.status(400).json({
        success: false,
        message: `Invalid agent. Valid agents: ${validAgents.join(', ')}`,
      });
    }

    const result = await AgentLog.deleteMany({ agent });
    
    res.json({
      success: true,
      message: `All logs for ${agent} agent cleared`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};