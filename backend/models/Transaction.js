import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
    },
    customerId: {
      type: String,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      lowercase: true,
    },
    customerPhone: {
      type: String,
    },
    customerType: {
      type: String,
      enum: ['regular', 'new', 'vip', 'enterprise', 'chronic_late_payer', 'price_sensitive'],
      default: 'regular',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    type: {
      type: String,
      enum: ['payment', 'checkout', 'subscription', 'invoice', 'refund'],
      required: true,
    },
    status: {
      type: String,
      enum: ['successful', 'failed', 'abandoned', 'overdue', 'pending', 'recovered'],
      default: 'pending',
    },
    failureReason: {
      type: String,
      enum: [
        'gateway_timeout',
        'insufficient_balance',
        'otp_expired',
        'bank_server_down',
        'network_error',
        'user_exit',
        'price_comparison',
        'shipping_cost',
        'approval_delay',
        'invoice_lost',
        'cash_flow_issue',
        'none',
      ],
      default: 'none',
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'bank_transfer', 'na'],
      default: 'na',
    },
    gatewayResponseCode: {
      type: String,
    },
    attemptDate: {
      type: Date,
      default: Date.now,
    },
    previousOrders: {
      type: Number,
      default: 0,
    },
    avgPaymentTime: {
      type: String,
      default: '',
    },
    sessionDuration: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      enum: ['csv_upload', 'api_connect', 'live_simulation', 'manual_entry'],
      default: 'manual_entry',
    },
    metadata: {
      type: Map,
      of: String,
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;