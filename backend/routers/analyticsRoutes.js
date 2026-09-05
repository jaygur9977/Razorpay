import express from 'express';
import {
  getAnalyticsOverview,
  getAgentAnalytics,
  getRecoveryByType,
  getCostAnalysis,
} from '../controllers/analyticsController.js';

const router = express.Router();

// GET /api/analytics/overview - Comprehensive analytics
router.get('/overview', getAnalyticsOverview);

// GET /api/analytics/agents - Agent performance
router.get('/agents', getAgentAnalytics);

// GET /api/analytics/recovery-types - Recovery by type
router.get('/recovery-types', getRecoveryByType);

// GET /api/analytics/costs - Cost analysis
router.get('/costs', getCostAnalysis);

export default router;