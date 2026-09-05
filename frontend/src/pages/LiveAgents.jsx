import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bot, Search, Stethoscope, Target,
  Zap, Eye, Shield, FileCheck, Activity,
  Cpu, Database, GitBranch, Terminal,
  Play, Pause, RotateCcw, TrendingUp,
  Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAgentLogs, getAgentStatus } from '../services/api';

const LiveAgents = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [logs, setLogs] = useState([]);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const refresh = () => Promise.all([getAgentStatus(), getAgentLogs({ limit: 50 })])
      .then(([statusResponse, logsResponse]) => {
        setAgents(statusResponse.data.agents.map((agent) => ({
          ...agent,
          name: agent.label,
          icon: { Search, Stethoscope, Target, Zap, Bot, Eye, Shield, FileCheck }[agent.icon],
          status: agent.isActive ? 'running' : 'idle',
          task: agent.lastMessage,
          progress: agent.isActive ? 100 : 0,
        })));
        setLogs(logsResponse.data);
      })
      .catch(() => { setAgents([]); setLogs([]); });
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, []);
  const getAgentStatusColor = (status) => {
    switch (status) {
      case 'running': return '#34d399';
      case 'idle': return '#64748b';
      case 'error': return '#ef4444';
      default: return '#64748b';
    }
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
                <Cpu style={{ color: '#06b6d4' }} />
                Live Agent Monitor
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                Real-time AI agent activity and performance
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={isRunning ? 'btn-secondary' : 'btn-primary'}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={() => setLogs([])}
              className="btn-secondary"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        {/* Agents Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            const statusColor = getAgentStatusColor(agent.status);
            
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="glass-card glass-card-hover"
                style={{ padding: '24px' }}
                onClick={() => setSelectedAgent(agent)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${agent.color}15`,
                    border: `1px solid ${agent.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon className="w-6 h-6" style={{ color: agent.color }} />
                  </div>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: statusColor,
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: statusColor,
                      animation: agent.status === 'running' ? 'pulse 1.5s infinite' : 'none',
                    }} />
                    {agent.status.toUpperCase()}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                  {agent.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                  {agent.task}
                </p>
                
                {/* Progress Bar */}
                {agent.status === 'running' && (
                  <div>
                    <div style={{
                      height: '4px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        animate={{ width: `${agent.progress}%` }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                        style={{
                          height: '100%',
                          background: agent.color,
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                      Processing... {agent.progress}%
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Live Logs Terminal */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal className="w-5 h-5" style={{ color: '#10b981' }} />
              Live Agent Logs
            </h3>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#34d399',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#34d399',
                animation: 'pulse 1s infinite',
              }} />
              Streaming
            </span>
          </div>
          
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '12px',
            padding: '20px',
            fontFamily: 'monospace',
            fontSize: '13px',
          }}>
            {logs.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                Waiting for agent activity...
              </p>
            ) : (
              <AnimatePresence>
                {logs.map((log) => {
                  const agent = agents.find(a => a.id === log.agent);
                  const Icon = agent?.icon || Bot;
                  const color = agent?.color || '#94a3b8';
                  
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                      }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                        {log.timestamp}
                      </span>
                      <Icon className="w-4 h-4" style={{ color }} />
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '12px' }}>
                        [{agent?.name || log.agent}]
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                        {log.message}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Selected Agent Detail Modal */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
              }}
              onClick={() => setSelectedAgent(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card"
                style={{ padding: '32px', maxWidth: '500px', width: '100%' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: `${selectedAgent.color}15`,
                    border: `1px solid ${selectedAgent.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <selectedAgent.icon className="w-10 h-10" style={{ color: selectedAgent.color }} />
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 'bold' }}>
                    {selectedAgent.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                    {selectedAgent.task}
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  {[
                    { label: 'Status', value: selectedAgent.status.toUpperCase(), color: getAgentStatusColor(selectedAgent.status) },
                    { label: 'Color', value: selectedAgent.color, color: selectedAgent.color },
                    { label: 'Queue', value: '3 items', color: '#94a3b8' },
                    { label: 'Success Rate', value: '87%', color: '#34d399' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '10px',
                    }}>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: item.color }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="btn-secondary"
                  style={{ width: '100%', marginTop: '24px' }}
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </main>
    </div>
  );
};

export default LiveAgents;