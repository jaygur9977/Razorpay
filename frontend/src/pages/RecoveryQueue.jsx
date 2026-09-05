import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Filter, ChevronDown,
  TrendingUp, TrendingDown, IndianRupee,
  Clock, CheckCircle, AlertCircle,
  Zap, Target, User, Building2,
  ArrowUpDown, MoreVertical, Play,
  Pause, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCases } from '../services/api';

const RecoveryQueue = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('enrv');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [queueItems, setQueueItems] = useState([]);

  useEffect(() => {
    getCases({ limit: 100 })
      .then((response) => setQueueItems(response.data.filter((item) => item.status !== 'recovered' && item.execution?.result !== 'success' && item.attempts < (item.maxAttempts || 5)).map((item) => ({
        id: item.caseId || item._id,
        customer: item.customerName,
        company: item.company || '-',
        amount: item.amount || 0,
        type: item.type || 'Unknown',
        enrv: item.enrv || 0,
        priority: item.priority || 'LOW',
        probability: item.recoveryProbability || 0,
        agent: item.decision?.selectedAction || '-',
      }))))
      .catch(() => setQueueItems([]));
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' };
      case 'HIGH': return { background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' };
      case 'MEDIUM': return { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' };
      case 'LOW': return { background: 'rgba(148,163,184,0.15)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.3)' };
      default: return { background: 'rgba(148,163,184,0.15)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.3)' };
    }
  };

  const filteredItems = queueItems.filter(item => {
    if (filterType !== 'all' && !item.type.toLowerCase().includes(filterType.toLowerCase())) return false;
    if (searchTerm && !item.customer.toLowerCase().includes(searchTerm.toLowerCase()) && !item.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'enrv') return b.enrv - a.enrv;
    if (sortBy === 'amount') return b.amount - a.amount;
    if (sortBy === 'priority') return a.priority.localeCompare(b.priority);
    return 0;
  });

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
                <Target style={{ color: '#f59e0b' }} />
                Recovery Queue
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                Prioritized cases by Expected Net Recovery Value
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'rgba(255,255,255,0.3)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cases..."
                className="input-primary"
                style={{ paddingLeft: '44px', width: '250px' }}
              />
            </div>
            
            {/* Filter Dropdown */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="select-primary"
              style={{ width: '180px' }}
            >
              <option value="all">All Types</option>
              <option value="payment">Payment Failure</option>
              <option value="checkout">Checkout Drop</option>
              <option value="invoice">Invoice Overdue</option>
              <option value="subscription">Subscription</option>
            </select>
            
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-primary"
              style={{ width: '180px' }}
            >
              <option value="enrv">Sort by ENRV</option>
              <option value="amount">Sort by Amount</option>
              <option value="priority">Sort by Priority</option>
            </select>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        {/* Summary Bar */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          {[
            { label: 'Total in Queue', value: queueItems.length, color: '#818cf8' },
            { label: 'Critical', value: queueItems.filter(i => i.priority === 'CRITICAL').length, color: '#f87171' },
            { label: 'High Priority', value: queueItems.filter(i => i.priority === 'HIGH').length, color: '#fbbf24' },
            { label: 'Total ENRV', value: `₹${(queueItems.reduce((sum, i) => sum + i.enrv, 0) / 1000).toFixed(0)}K`, color: '#34d399' },
          ].map((stat, i) => (
            <div key={i} className="glass-card" style={{
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: stat.color,
              }} />
              <div>
                <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{stat.value}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Queue List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {sortedItems.map((item, index) => {
              const priorityStyle = getPriorityColor(item.priority);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="glass-card glass-card-hover"
                  style={{ padding: '20px' }}
                  onClick={() => navigate(`/case/${item.id}`)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    flexWrap: 'wrap',
                  }}>
                    {/* Queue Position */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      color: 'rgba(255,255,255,0.5)',
                    }}>
                      {index + 1}
                    </div>

                    {/* Case Info */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          color: '#818cf8',
                          fontWeight: 600,
                        }}>
                          {item.id}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          ...priorityStyle,
                        }}>
                          {item.priority}
                        </span>
                      </div>
                      <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>
                        {item.customer}
                      </p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        {item.company} • {item.type}
                      </p>
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
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24' }}>
                        ₹{item.amount.toLocaleString()}
                      </p>
                    </div>

                    {/* ENRV */}
                    <div style={{ textAlign: 'center' }}>
                      <p style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'rgba(255,255,255,0.4)',
                        marginBottom: '4px',
                      }}>
                        ENRV
                      </p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#34d399' }}>
                        ₹{item.enrv.toLocaleString()}
                      </p>
                    </div>

                    {/* Probability */}
                    <div style={{ width: '120px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                          Probability
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>
                          {item.probability}%
                        </span>
                      </div>
                      <div style={{
                        height: '6px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${item.probability}%`,
                          background: item.probability > 80 ? '#34d399' : item.probability > 60 ? '#fbbf24' : '#f87171',
                          borderRadius: '3px',
                        }} />
                      </div>
                    </div>

                    {/* Agent */}
                    <div style={{
                      padding: '8px 16px',
                      background: 'rgba(99,102,241,0.1)',
                      border: '1px solid rgba(99,102,241,0.25)',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#a5b4fc',
                    }}>
                      {item.agent}
                    </div>

                    {/* Action Button */}
                    <button style={{
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.5)',
                    }}>
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default RecoveryQueue;