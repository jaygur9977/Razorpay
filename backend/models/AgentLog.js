import mongoose from 'mongoose';

const agentLogSchema = new mongoose.Schema(
  {
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
    },
    agent: {
      type: String,
      enum: ['detection', 'diagnosis', 'priority', 'decision', 'execution', 'monitor', 'escalation', 'audit'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['processing', 'detected', 'diagnosed', 'prioritized', 'decided', 'executed', 'success', 'error', 'warning', 'info'],
      default: 'info',
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

agentLogSchema.index({ agent: 1 });
agentLogSchema.index({ createdAt: -1 });

const AgentLog = mongoose.model('AgentLog', agentLogSchema);

export default AgentLog;