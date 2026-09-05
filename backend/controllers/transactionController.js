import Transaction from '../models/Transaction.js';

// @desc    Get all transactions with filters
// @route   GET /api/transactions
export const getTransactions = async (req, res) => {
  try {
    const { status, type, customerType, source, limit = 50, page = 1, sort = '-createdAt' } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (customerType) filter.customerType = customerType;
    if (source) filter.source = source;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
export const getTransactionStats = async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
    const failedTransactions = await Transaction.countDocuments({ status: 'failed' });
    const abandonedTransactions = await Transaction.countDocuments({ status: 'abandoned' });
    const overdueTransactions = await Transaction.countDocuments({ status: 'overdue' });
    const recoveredTransactions = await Transaction.countDocuments({ status: 'recovered' });

    const totalAmount = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalTransactions,
        failed: failedTransactions,
        abandoned: abandonedTransactions,
        overdue: overdueTransactions,
        recovered: recoveredTransactions,
        totalAmount: totalAmount[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
export const createTransaction = async (req, res) => {
  try {
    const { transactionId, customerName, amount, type, status } = req.body;

    // Validate required fields
    if (!customerName || !amount || !type || !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customerName, amount, type, and status',
      });
    }

    // Generate transactionId if not provided
    const finalTransactionId = transactionId || `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const transaction = await Transaction.create({
      ...req.body,
      transactionId: finalTransactionId,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Transaction ID already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};