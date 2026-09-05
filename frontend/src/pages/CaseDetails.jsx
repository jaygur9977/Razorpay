import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, AlertCircle, CheckCircle, XCircle,
  Clock, IndianRupee, User, Building2,
  Phone, Mail, MessageSquare, ChevronRight,
  Zap, TrendingUp, Activity, Bot,
  Search, Stethoscope, Target, Eye,
  Shield, FileCheck, CreditCard,
  ShoppingCart, FileText, RefreshCw,
  BarChart3, Wallet, Calendar
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAgentLogs, getCaseById, retryCase } from '../services/api';

const CaseDetails = () => {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [caseData, setCaseData] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!caseId) return;
    getCaseById(caseId).then(async (caseResponse) => {
      const item = caseResponse.data;
      const transaction = item.transaction || {};
      const logsResponse = await getAgentLogs({ limit: 100, case: item._id });
      setCaseData({
      id: item.caseId || item._id,
      customer: {
        name: item.customerName || '-',
        email: transaction.customerEmail || '-',
        phone: transaction.customerPhone || '-',
        type: transaction.customerType || '-',
        company: item.company || '-',
        avatar: (item.customerName || '--').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      },
      transaction: {
        amount: transaction.amount || item.amount || 0,
        type: transaction.type || item.type || '-',
        method: transaction.paymentMethod || '-',
        date: transaction.attemptDate || item.createdAt || '-',
        gatewayResponse: transaction.gatewayResponseCode || '-',
        attemptNumber: item.attempts || 0,
      },
      diagnosis: {
        rootCause: item.diagnosis?.rootCause || '-',
        category: item.diagnosis?.category || '-',
        confidence: item.diagnosis?.confidence || 0,
        recoveryProbability: item.recoveryProbability || 0,
        sentiment: item.diagnosis?.sentiment || '-',
      },
      priority: {
        enrv: item.enrv || 0,
        queuePosition: '-',
        score: item.priorityScore || 0,
      },
      decision: {
        selectedAction: item.decision?.selectedAction || '-',
        fallback: item.decision?.fallbackAction || '-',
        reasoning: item.decision?.reasoning || '-',
        expectedRecovery: item.decision?.expectedRecovery || 0,
      },
      execution: {
        status: item.status || '-',
        actionTaken: item.execution?.actionTaken || '-',
        result: item.execution?.result || '-',
        amountRecovered: item.execution?.amountRecovered || 0,
        timeTaken: item.execution?.timeTaken || '-',
      },
      stoppedReason: item.stoppedReason || '',
      attempts: item.attempts || 0,
      maxAttempts: item.maxAttempts || 5,
      isEscalated: item.isEscalated || false,
      escalationApproved: item.escalationApproved || false,
      timeline: logsResponse.data.slice().reverse().map((log) => ({ time: log.createdAt, agent: log.agent, message: log.message, type: log.type })),
    });
    }).catch(() => setCaseData(null));
  }, [caseId]);

  if (!caseData) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  const agentIcons = {
    detection: Search,
    diagnosis: Stethoscope,
    priority: Target,
    decision: Zap,
    execution: Bot,
    monitor: Eye,
    escalation: Shield,
    audit: FileCheck,
  };

  const agentColors = {
    detection: '#06b6d4',
    diagnosis: '#8b5cf6',
    priority: '#f59e0b',
    decision: '#ec4899',
    execution: '#10b981',
    monitor: '#a855f7',
    escalation: '#ef4444',
    audit: '#94a3b8',
  };

  const agentLabels = {
    detection: 'Detection Agent',
    diagnosis: 'Diagnosis Agent',
    priority: 'Priority Agent',
    decision: 'Decision Agent',
    execution: 'Execution Agent',
    monitor: 'Monitor Agent',
    escalation: 'Escalation Agent',
    audit: 'Audit Agent',
  };

  const getStatusBadge = (status) => {
    const styles = {
      recovered: { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)', label: 'RECOVERED' },
      active: { background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)', label: 'ACTIVE' },
      pending: { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)', label: 'PENDING' },
      escalated: { background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.35)', label: 'ESCALATED (PENDING OPS APPROVAL)' },
      stopped: { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.35)', label: 'STOPPED (UNRECOVERED)' },
      failed: { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.35)', label: 'FAILED' },
    };
    
    const style = styles[status] || styles.active;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 16px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.05em',
        ...style,
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: style.color }} />
        {style.label || status.toUpperCase()}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/dashboard/merchant')}
              style={{
                padding: '10px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h1 style={{
                  fontSize: '22px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  color: '#818cf8',
                }}>
                  {caseData.id}
                </h1>
                {getStatusBadge(caseData.execution.status)}
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                Recovery Case Details
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary">
              <FileText className="w-4 h-4" />
              Export Report
            </button>
            <button
              className="btn-primary"
              disabled={retrying || !['stopped', 'failed'].includes(caseData.execution.status)}
              onClick={async () => {
                setRetrying(true);
                try {
                  await retryCase(caseId);
                  window.location.reload();
                } catch (error) {
                  alert(error.message || 'Retry failed');
                } finally {
                  setRetrying(false);
                }
              }}
            >
              <Zap className="w-4 h-4" />
              {retrying ? 'Retrying...' : 'Retry Recovery'}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          background: 'rgba(255,255,255,0.04)',
          padding: '8px',
          borderRadius: '16px',
          width: 'fit-content',
        }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'timeline', label: 'Agent Timeline' },
            { id: 'actions', label: 'Actions Taken' },
            { id: 'customer', label: 'Customer Info' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 24px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'all 0.3s ease',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'transparent',
                color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Top Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
            }}>
              {[
                { label: 'Transaction Amount', value: `₹${caseData.transaction.amount.toLocaleString()}`, icon: IndianRupee, color: '#fbbf24' },
                { label: 'Recovery Probability', value: `${caseData.diagnosis.recoveryProbability}%`, icon: TrendingUp, color: '#34d399' },
                { label: 'AI Confidence', value: `${caseData.diagnosis.confidence}%`, icon: Zap, color: '#818cf8' },
                { label: 'Amount Recovered', value: `₹${caseData.execution.amountRecovered.toLocaleString()}`, icon: CheckCircle, color: '#10b981' },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card"
                    style={{ padding: '24px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: `${card.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Icon className="w-5 h-5" style={{ color: card.color }} />
                      </div>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                        {card.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{card.value}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Diagnosis & Decision */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px',
              marginBottom: '24px',
            }}>
              {/* Diagnosis Card */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Stethoscope className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                  AI Diagnosis
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                      Root Cause
                    </p>
                    <p style={{ fontSize: '16px', fontWeight: 600 }}>{caseData.diagnosis.rootCause}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                      Category
                    </p>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'rgba(139,92,246,0.12)',
                      color: '#c084fc',
                      textTransform: 'uppercase',
                    }}>
                      {caseData.diagnosis.category}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                      Confidence Score
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        flex: 1,
                        height: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${caseData.diagnosis.confidence}%`,
                          background: 'linear-gradient(90deg, #8b5cf6, #c084fc)',
                          borderRadius: '4px',
                        }} />
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#c084fc' }}>
                        {caseData.diagnosis.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decision Card */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap className="w-5 h-5" style={{ color: '#ec4899' }} />
                  AI Decision
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                      Selected Action
                    </p>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#ec4899' }}>
                      {caseData.decision.selectedAction}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                      Fallback Action
                    </p>
                    <p style={{ fontSize: '14px' }}>{caseData.decision.fallback}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                      Reasoning
                    </p>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                      {caseData.decision.reasoning}
                    </p>
                  </div>
                  <div style={{
                    padding: '16px',
                    background: 'rgba(236,72,153,0.08)',
                    border: '1px solid rgba(236,72,153,0.2)',
                    borderRadius: '12px',
                  }}>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                      Expected Net Recovery
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ec4899' }}>
                      ₹{caseData.decision.expectedRecovery.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Info */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target className="w-5 h-5" style={{ color: '#f59e0b' }} />
                Priority Analysis
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
              }}>
                <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                    Queue Position
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                    #{caseData.priority.queuePosition}
                  </p>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                    Priority Score
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                    {caseData.priority.score}
                  </p>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                    ENRV
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#34d399' }}>
                    ₹{caseData.priority.enrv.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* ESCALATED BANNER: If case is paused waiting for Ops Manager approval */}
            {caseData.execution.status === 'escalated' && !caseData.escalationApproved && (
              <div style={{
                marginTop: '24px',
                padding: '24px 28px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.14) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(245, 158, 11, 0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#fbbf24',
                    flexShrink: 0,
                  }}>
                    <Shield className="w-6 h-6" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⏸️ Case Escalated — Awaiting Operations Manager Approval
                      </h3>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'rgba(245, 158, 11, 0.25)',
                        color: '#fde68a',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                      }}>
                        HUMAN APPROVAL REQUIRED
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, marginBottom: '14px' }}>
                      This case was flagged by the <strong>Escalation Agent</strong> because its transaction value (₹{caseData.transaction.amount.toLocaleString()}) or Priority ({caseData.priority.score || 'CRITICAL'}) exceeds policy thresholds. Automated recovery execution is safely paused until an Operations Manager reviews and authorizes it.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => navigate('/dashboard/ops')}
                        style={{ padding: '10px 20px', fontSize: '13px' }}
                      >
                        Go to Ops Manager Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STOPPED CASE DIAGNOSTIC NOTIFICATION: Explaining why stopped and why revenue was not recovered */}
            {['stopped', 'failed'].includes(caseData.execution.status) && (
              <div style={{
                marginTop: '24px',
                padding: '24px 28px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(185, 28, 28, 0.15) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.12)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    flexShrink: 0,
                  }}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Recovery Stopped — Revenue Unrecovered Report
                      </h3>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'rgba(239, 68, 68, 0.25)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                      }}>
                        {caseData.attempts} of {caseData.maxAttempts} ATTEMPTS USED
                      </span>
                    </div>

                    <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, marginBottom: '16px' }}>
                      <strong>Reason for Halting:</strong> {caseData.stoppedReason || 'Automated recovery actions exhausted without customer payment confirmation. Workflow halted in compliance with safety stopping policies.'}
                    </p>

                    {/* 2-Column Diagnostic Breakdown */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '16px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '18px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      marginBottom: '18px',
                    }}>
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                          🔍 Why did recovery stop?
                        </h4>
                        <ul style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, paddingLeft: '18px' }}>
                          <li><strong>Primary Intervention Failed:</strong> The Execution Agent triggered <em>{caseData.decision.selectedAction || 'Auto Retry'}</em>, but the payment gateway did not confirm success.</li>
                          <li><strong>Fallback Intervention Failed:</strong> Secondary channel <em>{caseData.decision.fallback || 'WhatsApp Reminder'}</em> was attempted, but no settlement was received from the customer.</li>
                          <li><strong>Stopping Policy Enforced:</strong> Monitor Agent halted additional automated calls to prevent merchant cost escalation and customer friction.</li>
                        </ul>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                          💸 Why was revenue NOT recovered?
                        </h4>
                        <ul style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, paddingLeft: '18px' }}>
                          <li><strong>Diagnosed Root Cause:</strong> {caseData.diagnosis.rootCause || 'Payment authorization / gateway timeout'}.</li>
                          <li><strong>Customer Authorization Incomplete:</strong> The customer did not complete 2-factor authentication or authorize the UPI mandate before expiry.</li>
                          <li><strong>Bank/Network Outage:</strong> Acquiring bank or issuer switch did not return a successful transaction token.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Operator Recommended Action */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', paddingTop: '6px' }}>
                      <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', flex: 1, minWidth: '240px' }}>
                        💡 <strong>Recommended Next Steps:</strong> Contact customer <strong>{caseData.customer.name}</strong> ({caseData.customer.phone !== '-' ? caseData.customer.phone : caseData.customer.email}) directly or send a custom payment link with an incentive discount.
                      </div>
                      <button
                        className="btn-primary"
                        disabled={retrying}
                        onClick={async () => {
                          setRetrying(true);
                          try {
                            await retryCase(caseId);
                            window.location.reload();
                          } catch (error) {
                            alert(error.message || 'Retry failed');
                          } finally {
                            setRetrying(false);
                          }
                        }}
                        style={{ padding: '10px 22px', fontSize: '13px' }}
                      >
                        <Zap className="w-4 h-4" />
                        {retrying ? 'Retrying...' : 'Re-attempt Recovery Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card"
            style={{ padding: '32px' }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '32px' }}>
              Agent Activity Timeline
            </h3>
            
            <div style={{ position: 'relative', paddingLeft: '40px' }}>
              {/* Vertical Line */}
              <div style={{
                position: 'absolute',
                left: '15px',
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'linear-gradient(180deg, #6366f1, #8b5cf6, #ec4899)',
              }} />
              
              {caseData.timeline.map((event, index) => {
                const Icon = agentIcons[event.agent] || Bot;
                const color = agentColors[event.agent] || '#94a3b8';
                const label = agentLabels[event.agent] || event.agent;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    style={{
                      position: 'relative',
                      marginBottom: '24px',
                    }}
                  >
                    {/* Timeline Dot */}
                    <div style={{
                      position: 'absolute',
                      left: '-32px',
                      top: '8px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: color,
                      border: '3px solid #0a0a0f',
                      boxShadow: `0 0 10px ${color}`,
                    }} />
                    
                    <div style={{
                      padding: '16px 20px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icon className="w-4 h-4" style={{ color }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color }}>
                            {label}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.4)',
                          fontFamily: 'monospace',
                        }}>
                          {event.time}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                        {event.message}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Customer Info Tab */}
        {activeTab === 'customer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card"
            style={{ padding: '32px' }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '32px' }}>
              Customer Information
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              {/* Customer Profile */}
              <div style={{
                padding: '24px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '16px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  margin: '0 auto 16px',
                }}>
                  {caseData.customer.avatar}
                </div>
                <h4 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
                  {caseData.customer.name}
                </h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                  {caseData.customer.company}
                </p>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: 'rgba(99,102,241,0.12)',
                  color: '#a5b4fc',
                }}>
                  {caseData.customer.type}
                </span>
              </div>

              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: Mail, label: 'Email', value: caseData.customer.email },
                  { icon: Phone, label: 'Phone', value: caseData.customer.phone },
                  { icon: Building2, label: 'Company', value: caseData.customer.company },
                  { icon: User, label: 'Customer Type', value: caseData.customer.type },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                    }}>
                      <Icon className="w-5 h-5" style={{ color: '#818cf8' }} />
                      <div>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>
                          {item.label}
                        </p>
                        <p style={{ fontSize: '14px', fontWeight: 500 }}>{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Transaction History */}
              <div style={{
                padding: '24px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '16px',
              }}>
                <h5 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                  Transaction History
                </h5>
                {[
                  { date: '2026-08-15', amount: 12000, status: 'Successful' },
                  { date: '2026-07-20', amount: 8000, status: 'Successful' },
                  { date: '2026-06-10', amount: 15000, status: 'Successful' },
                  { date: '2026-05-05', amount: 5000, status: 'Successful' },
                ].map((txn, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                      {txn.date}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      ₹{txn.amount.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '12px', color: '#34d399' }}>
                      {txn.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default CaseDetails;