import express from 'express';
import { 
  getAgentLogs,
  getLogsByAgent,
  getAgentStatus,
  getAllAgentStatus,
  clearAgentLogs 
} from '../controllers/agentController.js';

const router = express.Router();

// GET /api/agents/logs - Get all agent logs
router.get('/logs', getAgentLogs);

// GET /api/agents/logs/:agent - Get logs by specific agent
router.get('/logs/:agent', getLogsByAgent);

// GET /api/agents/status/:agent - Get status of specific agent
router.get('/status/:agent', getAgentStatus);

// GET /api/agents/status - Get status of all agents
router.get('/status', getAllAgentStatus);

// DELETE /api/agents/logs - Clear all agent logs
router.delete('/logs', clearAgentLogs);

export default router;