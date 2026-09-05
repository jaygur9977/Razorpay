import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { processCSV, saveTransactions } from '../utils/csvProcessor.js';
import Case from '../models/Case.js';
import { enqueueCases } from '../utils/workflowQueue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV, XLSX, XLS files are allowed'));
    }
  },
});

// POST /api/upload/csv - Upload CSV file
router.post('/csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    // Process CSV
    const result = await processCSV(req.file.path);

    if (result.validRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid records found in file',
        data: result,
      });
    }

    // Save transactions
    const saved = await saveTransactions(result.data);
    const recoverableTransactions = saved.data.filter((transaction) => ['failed', 'abandoned', 'overdue', 'pending'].includes(transaction.status));
    const cases = await Case.insertMany(recoverableTransactions.map((transaction) => ({
      transaction: transaction._id,
      customerName: transaction.customerName,
      company: req.user?.company || '',
      amount: transaction.amount,
      type: transaction.type === 'checkout' ? 'checkout_abandonment' : transaction.type === 'invoice' ? 'invoice_overdue' : transaction.type === 'subscription' ? 'subscription_failure' : 'payment_failure',
      status: 'detected',
      priority: 'LOW',
    })), { ordered: false });
    if (cases.length) enqueueCases(cases);

    res.json({
      success: true,
      message: `Processed ${result.validRows} valid records out of ${result.totalRows} total rows`,
      data: {
        processed: {
          total: result.totalRows,
          valid: result.validRows,
          invalid: result.invalidRows,
          duplicates: saved.duplicates || 0,
          saved: saved.count,
          casesCreated: cases.length,
        },
        errors: result.errors,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/upload/template - Get CSV template structure
router.get('/template', (req, res) => {
  res.json({
    success: true,
    data: {
      requiredFields: ['customer_name', 'amount', 'type', 'status'],
      optionalFields: [
        'transaction_id',
        'customer_id',
        'email',
        'phone',
        'customer_type',
        'failure_reason',
        'payment_method',
        'gateway_response_code',
        'previous_orders',
        'avg_payment_time',
        'session_duration',
      ],
      validTypes: ['payment', 'checkout', 'subscription', 'invoice', 'refund'],
      validStatuses: ['failed', 'abandoned', 'overdue', 'pending', 'successful', 'recovered'],
    },
  });
});

router.get('/sample', (req, res) => {
  res.type('text/csv').send([
    'transaction_id,customer_name,amount,type,status,email,phone,customer_type,failure_reason,payment_method',
    'DEMO-1001,Demo Customer,5000,payment,failed,demo@example.com,+919999999999,regular,network_error,upi',
    'DEMO-1002,VIP Customer,25000,subscription,failed,vip@example.com,+919999999998,vip,gateway_timeout,card',
  ].join('\n'));
});

export default router;