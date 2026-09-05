import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Shield, Settings, Users,
  Sliders, ToggleLeft, ToggleRight,
  Save, Plus, Trash2, Edit,
  CheckCircle, AlertCircle, Database,
  Globe, Lock, Bell, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAdminPolicies, getAdminSystemStatus, getAdminUsers, updateAdminPolicies } from '../services/api';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('policies');
  const [policies, setPolicies] = useState({
    maxAttempts: 5,
    maxCostPerCase: 500,
    maxDiscount: 20,
    minENRV: 100,
    escalationThreshold: 10000,
    voiceCallThreshold: 50000,
  });
  const [stoppingRules, setStoppingRules] = useState({});

  const [users, setUsers] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    Promise.all([getAdminUsers(), getAdminPolicies(), getAdminSystemStatus()]).then(([usersResponse, policiesResponse, statusResponse]) => {
      setUsers(usersResponse.data);
      setPolicies(policiesResponse.data);
      setStoppingRules(policiesResponse.data.stoppingRules || {});
      setSystemStatus(statusResponse.data);
    }).catch(() => { setUsers([]); });
  }, []);

  const handleSave = () => updateAdminPolicies({ ...policies, stoppingRules });

  const sections = [
    { id: 'policies', label: 'Policies', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'system', label: 'System Config', icon: Settings },
  ];

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
                <Settings style={{ color: '#c084fc' }} />
                Admin Panel
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                Manage policies, users, and system configuration
              </p>
            </div>
          </div>
          
          <button className="btn-primary" onClick={handleSave}>
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        {/* Sidebar Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          background: 'rgba(255,255,255,0.04)',
          padding: '8px',
          borderRadius: '16px',
          width: 'fit-content',
        }}>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  background: activeSection === section.id
                    ? 'linear-gradient(135deg, #8b5cf6, #d946ef)'
                    : 'transparent',
                  color: activeSection === section.id ? 'white' : 'rgba(255,255,255,0.5)',
                }}
              >
                <Icon className="w-5 h-5" />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Policies Section */}
        {activeSection === 'policies' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
                Recovery Policies
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {[
                  { label: 'Max Attempts per Case', value: policies.maxAttempts, min: 1, max: 10, key: 'maxAttempts' },
                  { label: 'Max Cost per Case (₹)', value: policies.maxCostPerCase, min: 100, max: 5000, key: 'maxCostPerCase' },
                  { label: 'Max Discount (%)', value: policies.maxDiscount, min: 5, max: 50, key: 'maxDiscount' },
                  { label: 'Min ENRV Threshold (₹)', value: policies.minENRV, min: 10, max: 1000, key: 'minENRV' },
                  { label: 'Escalation Threshold (₹)', value: policies.escalationThreshold, min: 1000, max: 100000, key: 'escalationThreshold' },
                  { label: 'Voice Call Threshold (₹)', value: policies.voiceCallThreshold, min: 5000, max: 500000, key: 'voiceCallThreshold' },
                ].map((policy, index) => (
                  <div key={index} style={{
                    padding: '24px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: '12px',
                    }}>
                      {policy.label}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <input
                        type="range"
                        min={policy.min}
                        max={policy.max}
                        value={policy.value}
                        onChange={(e) => setPolicies(prev => ({
                          ...prev,
                          [policy.key]: Number(e.target.value)
                        }))}
                        style={{ flex: 1, accentColor: '#8b5cf6' }}
                      />
                      <span style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#c084fc',
                        minWidth: '60px',
                        textAlign: 'right',
                      }}>
                        {policy.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stopping Rules */}
            <div className="glass-card" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
                Stopping Rules
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Stop after no response for 3 attempts', key: 'noResponseAfterThreeAttempts' },
                  { label: 'Stop when marginal ROI < 1.0', key: 'marginalRoiBelowOne' },
                  { label: 'Stop when customer opts out', key: 'customerOptsOut' },
                  { label: 'Stop after 7 days of no activity', key: 'noActivityAfterSevenDays' },
                  { label: 'Stop for fraudulent transactions', key: 'fraudulentTransactions' },
                ].map((rule, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <span style={{ fontSize: '14px' }}>{rule.label}</span>
                    <button
                      onClick={() => {
                        setStoppingRules((current) => ({ ...current, [rule.key]: !current[rule.key] }))
                      }}
                      style={{
                        width: '50px',
                        height: '28px',
                        borderRadius: '14px',
                        border: 'none',
                        cursor: 'pointer',
                        background: stoppingRules[rule.key]
                          ? 'linear-gradient(135deg, #10b981, #34d399)'
                          : 'rgba(255,255,255,0.1)',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '4px',
                        left: stoppingRules[rule.key] ? '26px' : '4px',
                        transition: 'all 0.3s ease',
                      }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card"
            style={{ padding: '32px' }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600 }}>User Management</h3>
              <button className="btn-primary">
                <Plus className="w-5 h-5" />
                Add User
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Role', 'Status', 'Actions'].map((header, i) => (
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
                  {users.map((user) => (
                    <tr key={user.id} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <td style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '14px',
                        }}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{user.name}</span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                        {user.email}
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
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: 'rgba(16,185,129,0.12)',
                          color: '#34d399',
                        }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                        <button style={{
                          padding: '8px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.05)',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'rgba(255,255,255,0.6)',
                        }}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button style={{
                          padding: '8px',
                          borderRadius: '8px',
                          background: 'rgba(239,68,68,0.1)',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#f87171',
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* System Config Section */}
        {activeSection === 'system' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
                System Configuration
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {[
                  { icon: Database, label: 'Database Connection', status: systemStatus?.database || 'Loading', color: systemStatus?.database === 'Connected' ? '#34d399' : '#fbbf24' },
                  { icon: Globe, label: 'API Gateway', status: systemStatus?.api || 'Loading', color: systemStatus?.api === 'Operational' ? '#34d399' : '#fbbf24' },
                  { icon: Zap, label: 'AI Model', status: systemStatus?.aiModel || 'Loading', color: systemStatus?.aiModel === 'Not configured' ? '#f87171' : '#818cf8' },
                  { icon: Bell, label: 'Notification Service', status: systemStatus?.notifications || 'Loading', color: '#34d399' },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} style={{
                      padding: '24px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                      }}>
                        <Icon className="w-8 h-8" style={{ color: item.color }} />
                        <span style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: item.color,
                          animation: 'pulse 2s infinite',
                        }} />
                      </div>
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: '18px', fontWeight: 600, color: item.color }}>
                        {item.status}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
              }
            `}</style>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;