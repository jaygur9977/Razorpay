import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  runSingleSimulation, 
  runBatchSimulation,
  runCustomSimulation,
  getSimulationHistory,
  clearSimulationData,
  processPendingCases,
  getWorkflowQueueStatus,
  monitorPendingCases
} from '../controllers/simulationController.js';

const router = express.Router();
router.use(protect);

// POST /api/simulation/single - Run single simulation
router.post('/single', runSingleSimulation);

// POST /api/simulation/batch - Run batch simulation
router.post('/batch', runBatchSimulation);

// POST /api/simulation/custom - Run custom simulation
router.post('/custom', runCustomSimulation);

// POST /api/simulation/process-pending - Process pending cases
router.post('/process-pending', processPendingCases);
router.get('/queue', getWorkflowQueueStatus);
router.post('/monitor-pending', monitorPendingCases);

// GET /api/simulation/history - Get simulation history
router.get('/history', getSimulationHistory);

// DELETE /api/simulation/clear - Clear simulation data
router.delete('/clear', clearSimulationData);

export default router;