import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Bell, Shield, Zap,
  Globe, Database, Save, Camera,
  Mail, Phone, Building2, Lock,
  ToggleLeft, ToggleRight, CheckCircle,
  CreditCard, Key, Download, Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({ name: '', email: '', phone: '', company: '', role: '' });

  const [notifications, setNotifications] = useState({
    emailAlerts: false, pushNotifications: false, whatsappAlerts: false, dailyDigest: false,
    weeklyReport: false, recoveryAlerts: false, escalationAlerts: false,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false, sessionTimeout: false, ipWhitelisting: false, auditLogging: false,
  });

  useEffect(() => {
    getProfile().then((response) => {
      const data = response.data;
      setProfile({ name: data.name || '', email: data.email || '', phone: data.phone || '', company: data.company || '', role: data.role || '' });
      setNotifications((current) => ({ ...current, ...data.notificationPreferences }));
      setSecurity((current) => ({ ...current, ...data.securitySettings }));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    await updateProfile({ ...profile, notificationPreferences: notifications, securitySettings: security });
    localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user') || '{}'), ...profile }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSecurity = (key) => {
    setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'billing', label: 'Billing', icon: CreditCard },
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
              <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Settings</h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                Manage your account preferences
              </p>
            </div>
          </div>
          
          <button onClick={handleSave} className="btn-primary">
            <Save className="w-5 h-5" />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        {/* Saved Toast */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'fixed',
              top: '100px',
              right: '32px',
              zIndex: 100,
              padding: '16px 24px',
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <CheckCircle className="w-5 h-5" style={{ color: '#34d399' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#34d399' }}>
              Changes saved successfully!
            </span>
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: '32px' }}>
          {/* Sidebar */}
          <div style={{
            width: '250px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            position: 'sticky',
            top: '100px',
            alignSelf: 'flex-start',
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    background: activeTab === tab.id
                      ? 'rgba(99,102,241,0.15)'
                      : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)',
                    borderLeft: activeTab === tab.id ? '3px solid #6366f1' : '3px solid transparent',
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '32px' }}
              >
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '32px' }}>
                  Profile Information
                </h3>
                
                {/* Avatar */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    fontWeight: 'bold',
                    margin: '0 auto 16px',
                    position: 'relative',
                  }}>
                    JD
                    <button style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#818cf8',
                      border: '3px solid #0a0a0f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                    Click to upload new photo
                  </p>
                </div>

                {/* Form */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '24px',
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'rgba(255,255,255,0.3)' }} />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="input-primary"
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'rgba(255,255,255,0.3)' }} />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="input-primary"
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                      Phone Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'rgba(255,255,255,0.3)' }} />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="input-primary"
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                      Company
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Building2 style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'rgba(255,255,255,0.3)' }} />
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        className="input-primary"
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '32px' }}
              >
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '32px' }}>
                  Notification Preferences
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive recovery updates via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get real-time push notifications' },
                    { key: 'whatsappAlerts', label: 'WhatsApp Alerts', desc: 'Receive alerts on WhatsApp' },
                    { key: 'dailyDigest', label: 'Daily Digest', desc: 'Daily summary of all recovery activities' },
                    { key: 'weeklyReport', label: 'Weekly Report', desc: 'Weekly performance report' },
                    { key: 'recoveryAlerts', label: 'Recovery Alerts', desc: 'Instant alerts when revenue is recovered' },
                    { key: 'escalationAlerts', label: 'Escalation Alerts', desc: 'Alerts for high-value cases needing approval' },
                  ].map((item) => (
                    <div key={item.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600 }}>{item.label}</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                          {item.desc}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleNotification(item.key)}
                        style={{
                          width: '50px',
                          height: '28px',
                          borderRadius: '14px',
                          border: 'none',
                          cursor: 'pointer',
                          background: notifications[item.key]
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
                          left: notifications[item.key] ? '26px' : '4px',
                          transition: 'all 0.3s ease',
                        }} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '32px' }}
              >
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '32px' }}>
                  Security Settings
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { key: 'twoFactorAuth', label: 'Two-Factor Authentication', desc: 'Add extra security layer' },
                    { key: 'sessionTimeout', label: 'Auto Session Timeout', desc: 'Logout after 30 minutes of inactivity' },
                    { key: 'ipWhitelisting', label: 'IP Whitelisting', desc: 'Restrict access to specific IPs' },
                    { key: 'auditLogging', label: 'Audit Logging', desc: 'Track all account activities' },
                  ].map((item) => (
                    <div key={item.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600 }}>{item.label}</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                          {item.desc}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleSecurity(item.key)}
                        style={{
                          width: '50px',
                          height: '28px',
                          borderRadius: '14px',
                          border: 'none',
                          cursor: 'pointer',
                          background: security[item.key]
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
                          left: security[item.key] ? '26px' : '4px',
                          transition: 'all 0.3s ease',
                        }} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Change Password */}
                <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
                    Change Password
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                        Current Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'rgba(255,255,255,0.3)' }} />
                        <input type="password" className="input-primary" style={{ paddingLeft: '44px' }} placeholder="••••••••" />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                        New Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'rgba(255,255,255,0.3)' }} />
                        <input type="password" className="input-primary" style={{ paddingLeft: '44px' }} placeholder="••••••••" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '32px' }}
              >
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '32px' }}>
                  API Keys
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { name: 'Production Key', key: 'pk_live_••••••••••••8f3a', created: '2026-01-15', status: 'Active' },
                    { name: 'Test Key', key: 'pk_test_••••••••••••2b7c', created: '2026-02-20', status: 'Active' },
                    { name: 'Development Key', key: 'pk_dev_••••••••••••9e1d', created: '2026-03-10', status: 'Revoked' },
                  ].map((apiKey, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600 }}>{apiKey.name}</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', marginTop: '4px' }}>
                          {apiKey.key}
                        </p>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                          Created: {apiKey.created}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: apiKey.status === 'Active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                          color: apiKey.status === 'Active' ? '#34d399' : '#f87171',
                        }}>
                          {apiKey.status}
                        </span>
                        <button style={{
                          padding: '8px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.05)',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'rgba(255,255,255,0.5)',
                        }}>
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn-primary" style={{ marginTop: '24px' }}>
                  <Key className="w-5 h-5" />
                  Generate New Key
                </button>
              </motion.div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '32px' }}
              >
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '32px' }}>
                  Billing Information
                </h3>
                
                {/* Current Plan */}
                <div style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: '16px',
                  marginBottom: '24px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                        Current Plan
                      </p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Enterprise Plan</p>
                    </div>
                    <span style={{
                      padding: '8px 16px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'rgba(16,185,129,0.15)',
                      color: '#34d399',
                    }}>
                      Active
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '12px' }}>
                    ₹2,500/month • Billed annually
                  </p>
                </div>

                {/* Usage */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px',
                }}>
                  {[
                    { label: 'Transactions Processed', value: '1,250', limit: '5,000' },
                    { label: 'Recovery Cases', value: '120', limit: 'Unlimited' },
                    { label: 'API Calls', value: '8,500', limit: '50,000' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: '20px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      textAlign: 'center',
                    }}>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {item.value}
                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>
                          {' '}/ {item.limit}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>

                <button className="btn-secondary">
                  <CreditCard className="w-5 h-5" />
                  Update Payment Method
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;