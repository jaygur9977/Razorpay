import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { 
  getCases, 
  getCaseById, 
  createCase,
  updateCase,
  deleteCase,
  getCaseStats,
  approveCase,
  rejectCase,
  escalateCase,
  retryCase
} from '../controllers/caseController.js';

const router = express.Router();

// GET /api/cases - Get all cases with filters
router.get('/', getCases);

// GET /api/cases/stats - Get case statistics
router.get('/stats', getCaseStats);

// GET /api/cases/:id - Get single case
router.get('/:id', getCaseById);

// POST /api/cases - Create new case
router.post('/', createCase);

// PUT /api/cases/:id - Update case
router.put('/:id', updateCase);

// DELETE /api/cases/:id - Delete case
router.delete('/:id', deleteCase);

// POST /api/cases/:id/approve - Approve escalated case
router.post('/:id/approve', protect, authorize('ops_manager', 'admin'), approveCase);

// POST /api/cases/:id/reject - Reject escalated case
router.post('/:id/reject', protect, authorize('ops_manager', 'admin'), rejectCase);

// POST /api/cases/:id/escalate - Escalate case
router.post('/:id/escalate', escalateCase);
router.post('/:id/retry', protect, authorize('merchant', 'ops_manager', 'admin'), retryCase);

export default router;