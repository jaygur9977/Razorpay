import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IndianRupee, TrendingUp, AlertCircle, 
  CheckCircle, Activity, Wallet,
  Search, Bell, LogOut, ChevronLeft,
  LayoutDashboard, Bot, FileText, BarChart3,
  Settings, Zap, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCases, getMerchantDashboard } from '../services/api';

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [dashboard, setDashboard] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [error, setError] = useState('');
  const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');

  useEffect(() => {
    Promise.all([getMerchantDashboard(), getCases({ limit: 4 })])
      .then(([dashboardResponse, casesResponse]) => {
        setDashboard(dashboardResponse.data);
        setRecentCases(casesResponse.data.map((item) => ({
          id: item.caseId || item._id,
          customer: item.customerName,
          amount: item.amount,
          type: item.type,
          status: item.status,
          time: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-',
        })));
      })
      .catch((requestError) => setError(requestError.message || 'Unable to load dashboard data'));
  }, []);

  const formatAmount = (value = 0) => `₹${Number(value).toLocaleString('en-IN')}`;
  const kpi = dashboard?.kpi || {};

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/merchant' },
    { icon: Activity, label: 'Revenue at Risk', path: '/revenue-risk' },
    { icon: Bot, label: 'AI Agents', path: '/agents' },
    { icon: FileText, label: 'Recovery Cases', path: '/cases' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      recovered: { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' },
      active: { background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' },
      escalated: { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' },
      stopped: { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' },
    };
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        ...styles[status],
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{
        width: isCollapsed ? '80px' : '280px',
        background: 'rgba(18, 18, 26, 0.9)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        transition: 'all 0.3s ease',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bot className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 style={{ fontWeight: 'bold', fontSize: '18px' }}>RevArb AI</h1>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Recovery Platform</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
          >
            <ChevronLeft style={{ width: '20px', height: '20px', transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  background: item.path === window.location.pathname ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: item.path === window.location.pathname ? 'white' : 'rgba(255,255,255,0.5)',
                  borderLeft: item.path === window.location.pathname ? '3px solid #6366f1' : '3px solid transparent',
                }}
                onClick={() => navigate(item.path)}
                onMouseEnter={(e) => {
                  if (item.path !== window.location.pathname) {
                    e.target.style.background = 'rgba(255,255,255,0.05)';
                    e.target.style.color = 'rgba(255,255,255,0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (item.path !== window.location.pathname) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'rgba(255,255,255,0.5)';
                  }
                }}
              >
                <Icon className="w-5 h-5" style={{ flexShrink: 0 }} />
                {!isCollapsed && <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}>
              {(user.name || 'Account').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{user.name || 'Account'}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Merchant</p>
              </div>
            )}
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: isCollapsed ? '80px' : '280px',
        transition: 'margin-left 0.3s ease',
      }}>
        {/* Top Bar */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Merchant Dashboard</h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Good Morning, {user.name || 'there'} 👋</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Live Badge */}
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#34d399',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#34d399',
                animation: 'pulse 2s infinite',
              }} />
              LIVE
            </span>
            
            <button
              onClick={() => navigate('/sandbox')}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
              }}
            >
              <Zap className="w-4 h-4" />
              Sandbox
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ padding: '32px' }}>
          {/* KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}>
            {[
              { title: 'Revenue At Risk', value: formatAmount(kpi.revenueAtRisk), change: '', icon: AlertCircle, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
              { title: 'Gross Recovered', value: formatAmount(kpi.grossRecovered), change: '', icon: TrendingUp, color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
              { title: 'Recovery Cost', value: formatAmount(kpi.recoveryCost), change: '', icon: Wallet, color: '#f472b6', bg: 'rgba(236,72,153,0.1)' },
              { title: 'Net Recovered', value: formatAmount(kpi.netRecovered), change: '', icon: IndianRupee, color: '#818cf8', bg: 'rgba(99,102,241,0.1)' },
            ].map((card, index) => {
              const Icon = card.icon;
              const isPositive = card.change.startsWith('+');
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card"
                  style={{ padding: '24px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: card.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon className="w-6 h-6" style={{ color: card.color }} />
                    </div>
                    {card.change && <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isPositive ? '#34d399' : '#f87171',
                    }}>
                      {card.change}
                    </span>}
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                    {card.title}
                  </p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
                    {card.value}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}>
            {/* Recovery Funnel */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
                Revenue Recovery Funnel
              </h3>
              {error && <p style={{ color: '#f87171' }}>{error}</p>}
              {[
                { label: 'Total Transactions', value: dashboard?.funnel?.totalTransactions || 0, color: '#94a3b8', width: '100%' },
                { label: 'Revenue at Risk', value: dashboard?.funnel?.atRisk || 0, color: '#fbbf24', width: '75%' },
                { label: 'Recovery Attempted', value: dashboard?.funnel?.attempted || 0, color: '#818cf8', width: '55%' },
                { label: 'Successfully Recovered', value: dashboard?.funnel?.recovered || 0, color: '#34d399', width: '40%' },
              ].map((stage, i) => (
                <div key={i} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{stage.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{stage.value}</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: stage.width }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      style={{
                        height: '100%',
                        background: stage.color,
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Agents Status */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
                AI Agents Status
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {[
                  { name: 'Detection', color: '#06b6d4', active: true },
                  { name: 'Diagnosis', color: '#8b5cf6', active: true },
                  { name: 'Priority', color: '#f59e0b', active: false },
                  { name: 'Decision', color: '#ec4899', active: false },
                  { name: 'Execution', color: '#10b981', active: false },
                  { name: 'Monitor', color: '#a855f7', active: true },
                  { name: 'Escalation', color: '#ef4444', active: false },
                  { name: 'Audit', color: '#94a3b8', active: true },
                ].map((agent, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: agent.active ? '#34d399' : '#64748b',
                      animation: agent.active ? 'pulse 2s infinite' : 'none',
                    }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                      {agent.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Cases Table */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Recent Recovery Cases</h3>
              <button onClick={() => navigate('/cases')} style={{
                background: 'none',
                border: 'none',
                color: '#818cf8',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}>
                View All →
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Case ID', 'Customer', 'Amount', 'Type', 'Status', 'Time'].map((header, i) => (
                      <th key={i} style={{
                        textAlign: 'left',
                        padding: '12px 16px',
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
                  {recentCases.map((case_, i) => (
                    <tr key={i} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.3s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    onClick={() => navigate(`/case/${case_.id}`)}
                    >
                      <td style={{ padding: '16px', fontSize: '13px', color: '#818cf8', fontFamily: 'monospace' }}>
                        {case_.id}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{case_.customer}</td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>
                        ₹{case_.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: 'rgba(99,102,241,0.12)',
                          color: '#a5b4fc',
                        }}>
                          {case_.type}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {getStatusBadge(case_.status)}
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                        {case_.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Pulse Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default MerchantDashboard;