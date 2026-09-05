import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
      default: () => `CASE-${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
    },
    customerId: {
      type: String,
    },
    customerName: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'payment_failure',
        'checkout_abandonment',
        'invoice_overdue',
        'subscription_failure',
        'promise_to_pay',
        'refund_leakage',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['detected', 'diagnosed', 'prioritized', 'decided', 'executing', 'recovered', 'failed', 'stopped', 'escalated'],
      default: 'detected',
    },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'LOW',
    },
    enrv: {
      type: Number,
      default: 0,
    },
    recoveryProbability: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    aiConfidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    diagnosis: {
      rootCause: {
        type: String,
        default: '',
      },
      category: {
        type: String,
        default: '',
      },
      confidence: {
        type: Number,
        default: 0,
      },
      sentiment: {
        type: String,
        default: 'neutral',
      },
    },
    decision: {
      selectedAction: {
        type: String,
        default: '',
      },
      fallbackAction: {
        type: String,
        default: '',
      },
      reasoning: {
        type: String,
        default: '',
      },
      expectedRecovery: {
        type: Number,
        default: 0,
      },
    },
    execution: {
      actionTaken: {
        type: String,
        default: '',
      },
      result: {
        type: String,
        default: '',
      },
      amountRecovered: {
        type: Number,
        default: 0,
      },
      timeTaken: {
        type: String,
        default: '',
      },
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalationApproved: {
      type: Boolean,
      default: false,
    },
    stoppedReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

caseSchema.index({ priority: 1 });
caseSchema.index({ status: 1 });
caseSchema.index({ enrv: -1 });

const Case = mongoose.model('Case', caseSchema);

export default Case;