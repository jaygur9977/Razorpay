import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bot, Search, Stethoscope, Target, Zap, Eye, Shield, FileCheck, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAgentLogs } from '../services/api';

const agentInfo = {
  detection: { label: 'Detection Agent', icon: Search, purpose: 'Finds revenue at risk and explains why a transaction needs a case.', color: '#06b6d4' },
  diagnosis: { label: 'Diagnosis Agent', icon: Stethoscope, purpose: 'Identifies the likely root cause, confidence, sentiment, and recovery probability.', color: '#8b5cf6' },
  priority: { label: 'Priority Agent', icon: Target, purpose: 'Ranks cases with LLM reasoning and queue context before work starts.', color: '#f59e0b' },
  decision: { label: 'Decision Agent', icon: Zap, purpose: 'Chooses an allowed recovery action and fallback with expected recovery reasoning.', color: '#ec4899' },
  execution: { label: 'Execution Agent', icon: Bot, purpose: 'Creates the customer-facing action message and records the controlled execution result.', color: '#10b981' },
  monitor: { label: 'Monitor Agent', icon: Eye, purpose: 'Interprets the result and decides whether to retry, stop, or escalate.', color: '#a855f7' },
  escalation: { label: 'Escalation Agent', icon: Shield, purpose: 'Explains urgency and approval requirements for human review.', color: '#ef4444' },
  audit: { label: 'Audit Agent', icon: FileCheck, purpose: 'Reviews the workflow for policy and compliance issues.', color: '#94a3b8' },
};

const AgentWorkbench = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  const refresh = () => getAgentLogs({ limit: 50 }).then((response) => setLogs(response.data)).catch((requestError) => setError(requestError.message || 'Unable to load agent evidence'));

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, []);

  const grouped = Object.keys(agentInfo).map((agent) => ({
    agent,
    info: agentInfo[agent],
    logs: logs.filter((log) => log.agent === agent).slice(0, 8),
  }));

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <header style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/sandbox')} className="btn-secondary"><ArrowLeft className="w-4 h-4" /></button>
          <div><h1 style={{ fontSize: '24px', fontWeight: 700 }}>Agent Reasoning Workbench</h1><p style={{ color: 'rgba(255,255,255,0.5)' }}>Evidence of what each LLM agent analyzed and decided</p></div>
        </div>
        <button onClick={refresh} className="btn-secondary"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </header>
      <main style={{ maxWidth: '1500px', margin: '0 auto', padding: '32px' }}>
        {error && <p style={{ color: '#f87171', marginBottom: '16px' }}>{error}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '20px' }}>
          {grouped.map(({ agent, info, logs: agentLogs }) => {
            const Icon = info.icon;
            return <section key={agent} className="glass-card" style={{ padding: '24px', borderTop: `3px solid ${info.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}><Icon style={{ color: info.color }} /><h2 style={{ fontSize: '17px' }}>{info.label}</h2></div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>{info.purpose}</p>
              {agentLogs.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>No evidence yet. Trigger an event.</p> : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{agentLogs.map((log) => <div key={log._id} style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', color: info.color, fontSize: '11px' }}><span>{log.type}</span><span>{new Date(log.createdAt).toLocaleTimeString()}</span></div><p style={{ marginTop: '6px', fontSize: '13px', lineHeight: 1.5 }}>{log.message}</p></div>)}</div>}
            </section>;
          })}
        </div>
      </main>
    </div>
  );
};

export default AgentWorkbench;
