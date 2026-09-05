import mongoose from 'mongoose';

const auditTrailSchema = new mongoose.Schema(
  {
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
    },
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: String,
      enum: ['detection_agent', 'diagnosis_agent', 'priority_agent', 'decision_agent', 'execution_agent', 'monitor_agent', 'escalation_agent', 'audit_agent', 'human'],
      required: true,
    },
    details: {
      type: String,
    },
    complianceStatus: {
      type: String,
      enum: ['compliant', 'non_compliant', 'pending_review'],
      default: 'compliant',
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

auditTrailSchema.index({ case: 1 });
auditTrailSchema.index({ performedBy: 1 });
auditTrailSchema.index({ createdAt: -1 });

const AuditTrail = mongoose.model('AuditTrail', auditTrailSchema);

export default AuditTrail;