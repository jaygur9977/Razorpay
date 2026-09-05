import express from 'express';
import { 
  getTransactions, 
  getTransactionById, 
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats 
} from '../controllers/transactionController.js';

const router = express.Router();

// GET /api/transactions - Get all transactions with filters
router.get('/', getTransactions);

// GET /api/transactions/stats - Get transaction statistics
router.get('/stats', getTransactionStats);

// GET /api/transactions/:id - Get single transaction
router.get('/:id', getTransactionById);

// POST /api/transactions - Create new transaction
router.post('/', createTransaction);

// PUT /api/transactions/:id - Update transaction
router.put('/:id', updateTransaction);

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', deleteTransaction);

export default router;