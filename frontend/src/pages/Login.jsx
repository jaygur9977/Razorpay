import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Lock, ArrowRight, Sparkles, 
  Shield, Zap, TrendingUp, Globe, 
  IndianRupee, BarChart3, Bot, 
  Rocket, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState('merchant');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  const roles = [
    { id: 'merchant', label: 'Merchant', icon: Globe },
    { id: 'ops_manager', label: 'Ops Manager', icon: Shield },
    { id: 'admin', label: 'Admin', icon: Settings },
    { id: 'demo_tester', label: 'Demo Tester', icon: Rocket },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = isRegistering
        ? await registerUser({ name, email, password, company, role: activeRole })
        : await loginUser(email, password);
      setIsLoading(false);
      const role = response.data.role;
      if (!isRegistering && role !== activeRole) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error(`This account is registered as ${role.replace('_', ' ')}. Select that role to continue.`);
      }
      navigate(role === 'ops_manager' ? '/dashboard/ops' : role === 'admin' ? '/dashboard/admin' : role === 'demo_tester' ? '/sandbox' : '/dashboard/merchant');
    } catch (loginError) {
      setIsLoading(false);
      setError(loginError.message || 'Unable to sign in');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#0a0a0f',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated Background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '500px',
          height: '500px',
          background: 'rgba(99, 102, 241, 0.15)',
          borderRadius: '50%',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          right: '-100px',
          width: '500px',
          height: '500px',
          background: 'rgba(168, 85, 247, 0.12)',
          borderRadius: '50%',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          background: 'rgba(236, 72, 153, 0.08)',
          borderRadius: '50%',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* Left Side - Branding (Desktop only) */}
      <div style={{
        display: 'none',
        width: '50%',
        padding: '64px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
      }}
      className="lg:flex"
      >
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
            }}>
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>RevArb AI</h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                Autonomous Revenue Recovery
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ marginTop: '64px' }}
          >
            <h2 style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              Find Revenue That's
              <span style={{
                display: 'block',
                marginTop: '8px',
                background: 'linear-gradient(135deg, #818cf8, #c084fc, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Slipping Away
              </span>
            </h2>
            <p style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.6)',
              marginTop: '24px',
              lineHeight: 1.6,
              maxWidth: '500px',
            }}>
              AI-powered recovery agent that detects, diagnoses, and recovers 
              lost revenue with intelligent automation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{
              marginTop: '48px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
            }}
          >
            {[
              { icon: Zap, color: '#fbbf24', title: 'Real-time Detection', desc: 'Monitor transactions continuously' },
              { icon: TrendingUp, color: '#34d399', title: 'Smart Recovery', desc: 'AI-driven intervention strategies' },
              { icon: IndianRupee, color: '#818cf8', title: 'Net Revenue Focus', desc: 'Optimize recovery costs' },
              { icon: BarChart3, color: '#c084fc', title: 'Full Analytics', desc: 'Complete audit trail' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="glass-card" style={{ padding: '24px' }}>
                  <Icon className="w-8 h-8 mb-3" style={{ color: item.color }} />
                  <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
                </div>
              );
            })}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}
        >
          © 2026 RevArb AI. All rights reserved.
        </motion.p>
      </div>

      {/* Right Side - Login Form */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        position: 'relative',
        zIndex: 10,
      }}
      className="lg:w-1/2"
      >
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ width: '100%', maxWidth: '450px' }}
        >
          <div className="glass-card" style={{ padding: '48px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{ width: '72px', height: '72px', margin: '0 auto 16px' }}
              >
                <Sparkles className="w-full h-full" style={{ color: '#818cf8' }} />
              </motion.div>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
                Welcome Back
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                {isRegistering ? `Create a ${roles.find((role) => role.id === activeRole)?.label || 'role'} account` : 'Sign in to your account'}
              </p>
            </div>

            {/* Role Selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
              {roles.map((role) => {
                const Icon = role.icon;
                const isActive = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(role.id)}
                    style={{
                      flex: 1,
                      padding: '12px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      background: isActive
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : 'rgba(255,255,255,0.05)',
                      color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                      boxShadow: isActive ? '0 8px 20px rgba(99,102,241,0.4)' : 'none',
                    }}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1" />
                    {role.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {error && <p style={{ color: '#f87171', margin: 0 }}>{error}</p>}
              {isRegistering && <>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className="input-primary" />
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company (optional)" className="input-primary" />
              </>}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '8px',
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: 'rgba(255,255,255,0.35)',
                  }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="input-primary"
                    style={{ paddingLeft: '48px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '8px',
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: 'rgba(255,255,255,0.35)',
                  }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="input-primary"
                    style={{ paddingLeft: '48px', paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '18px',
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '16px' }}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    {isRegistering ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              margin: '32px 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <button
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '16px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 10px 25px rgba(245, 158, 11, 0.4)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'none';
              }}
            >
              <Rocket className="w-5 h-5" />
              {isRegistering ? 'Back to sign in' : `Create a ${roles.find((role) => role.id === activeRole)?.label || 'role'} account`}
            </button>

            <p style={{
              textAlign: 'center',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.35)',
              marginTop: '24px',
            }}>
              New accounts use the selected role.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;