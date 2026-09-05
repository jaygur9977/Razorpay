import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, AlertCircle, CheckCircle, XCircle,
  Clock, IndianRupee, User, Building2,
  Phone, Mail, MessageSquare, ChevronRight,
  Shield, Zap, TrendingUp, Activity,
  Search, Filter, MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { approveCase, getOpsDashboard, rejectCase } from '../services/api';

const OpsManagerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedCase, setSelectedCase] = useState(null);

  const [pendingCases, setPendingCases] = useState([]);
  const [approvedCases, setApprovedCases] = useState([]);
  const [actionError, setActionError] = useState('');

  const loadCases = () => getOpsDashboard().then((response) => {
    const mapCase = (item) => ({
      ...item,
      id: item.caseId || item._id,
      customer: item.customerName,
      type: item.type || '-',
      aiRecommendation: item.decision?.selectedAction || '-',
      confidence: item.aiConfidence || 0,
      reason: item.diagnosis?.rootCause || '-',
      approvedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-',
      recoveredAmount: item.execution?.amountRecovered || null,
    });
    setPendingCases(response.data.pendingEscalations.map(mapCase));
    setApprovedCases(response.data.recentApprovals.map(mapCase));
  });

  useEffect(() => {
    loadCases().catch(() => { setPendingCases([]); setApprovedCases([]); });
  }, []);

  const handleDecision = async (caseId, action) => {
    setActionError('');
    try {
      if (action === 'approve') await approveCase(caseId);
      else await rejectCase(caseId);
      await loadCases();
    } catch (error) {
      setActionError(error.message || `Unable to ${action} case`);
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      HIGH: { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' },
      MEDIUM: { background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' },
      CRITICAL: { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' },
      LOW: { background: 'rgba(148,163,184,0.12)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.25)' },
    };
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.05em',
        ...styles[priority],
      }}>
        {priority}
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
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Shield style={{ color: '#818cf8' }} />
                Operations Manager
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                Review and approve AI recovery actions
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#fbbf24',
            }}>
              <AlertCircle className="w-4 h-4" />
              {pendingCases.length} Pending Approvals
            </span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        {actionError && <p style={{ color: '#f87171', marginBottom: '16px' }}>{actionError}</p>}
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
            { id: 'pending', label: 'Pending Approvals', count: pendingCases.length },
            { id: 'approved', label: 'Approved', count: approvedCases.length },
            { id: 'history', label: 'History', count: 0 },
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
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '12px',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pending Approvals List */}
        {activeTab === 'pending' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {pendingCases.map((case_, index) => (
              <motion.div
                key={case_.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card"
                style={{ padding: '28px' }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '20px',
                }}>
                  {/* Case Info */}
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        color: '#818cf8',
                        fontWeight: 600,
                      }}>
                        {case_.id}
                      </span>
                      {getPriorityBadge(case_.priority)}
                    </div>
                    
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                      {case_.customer}
                    </h3>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.5)',
                      }}>
                        <Building2 className="w-4 h-4" />
                        {case_.company}
                      </span>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.5)',
                      }}>
                        <Clock className="w-4 h-4" />
                        {case_.daysOverdue} days
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'rgba(255,255,255,0.4)',
                      marginBottom: '4px',
                    }}>
                      Amount
                    </p>
                    <p style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#fbbf24',
                    }}>
                      ₹{case_.amount.toLocaleString()}
                    </p>
                  </div>

                  {/* AI Recommendation */}
                  <div style={{
                    flex: 1,
                    minWidth: '250px',
                    padding: '16px',
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '12px',
                  }}>
                    <p style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#a5b4fc',
                      marginBottom: '8px',
                      fontWeight: 600,
                    }}>
                      AI Recommendation
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                      {case_.aiRecommendation}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                      {case_.reason}
                    </p>
                    <p style={{ fontSize: '12px', color: '#34d399', marginTop: '8px' }}>
                      Confidence: {case_.confidence}%
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}>
                    <button
                      onClick={() => handleDecision(case_.id, 'approve')}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '13px',
                        background: 'linear-gradient(135deg, #10b981, #34d399)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecision(case_.id, 'reject')}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '13px',
                        background: 'rgba(239,68,68,0.1)',
                        color: '#f87171',
                        border: '1px solid rgba(239,68,68,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      style={{
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '13px',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                      Modify
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Approved Cases */}
        {activeTab === 'approved' && (
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Case ID', 'Customer', 'Amount', 'Type', 'Approved At', 'Status', 'Recovered'].map((header, i) => (
                      <th key={i} style={{
                        textAlign: 'left',
                        padding: '16px',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'rgba(255,255,255,0.4)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {approvedCases.map((case_, i) => (
                    <tr key={i} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.3s',
                    }}>
                      <td style={{
                        padding: '16px',
                        fontSize: '13px',
                        color: '#818cf8',
                        fontFamily: 'monospace',
                      }}>
                        {case_.id}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{case_.customer}</td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>
                        ₹{case_.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px' }}>{case_.type}</td>
                      <td style={{ padding: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                        {case_.approvedAt}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: case_.status === 'RECOVERED'
                            ? 'rgba(16,185,129,0.12)'
                            : 'rgba(99,102,241,0.12)',
                          color: case_.status === 'RECOVERED' ? '#34d399' : '#a5b4fc',
                        }}>
                          {case_.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#34d399' }}>
                        {case_.recoveredAmount ? `₹${case_.recoveredAmount.toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OpsManagerDashboard;