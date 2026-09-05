import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import { Bot, Search, Stethoscope, Target, Zap, Eye, Shield, FileCheck } from 'lucide-react';

const AgentsStatus = ({ agents }) => {
  const agentConfigs = {
    detection: { label: 'Detection Agent', icon: Search, color: 'from-cyan-500 to-blue-500' },
    diagnosis: { label: 'Diagnosis Agent', icon: Stethoscope, color: 'from-indigo-500 to-purple-500' },
    priority: { label: 'Priority Agent', icon: Target, color: 'from-amber-500 to-orange-500' },
    decision: { label: 'Decision Agent', icon: Zap, color: 'from-pink-500 to-rose-500' },
    execution: { label: 'Execution Agent', icon: Bot, color: 'from-emerald-500 to-green-500' },
    monitor: { label: 'Monitor Agent', icon: Eye, color: 'from-purple-500 to-violet-500' },
    escalation: { label: 'Escalation Agent', icon: Shield, color: 'from-red-500 to-orange-500' },
    audit: { label: 'Audit Agent', icon: FileCheck, color: 'from-gray-400 to-gray-500' },
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-6">AI Agents Status</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(agents).map(([key, agent], index) => {
          const config = agentConfigs[key];
          if (!config) return null;
          
          const Icon = config.icon;
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-white/80">{config.label}</p>
                <p className="text-[10px] text-white/40">
                  {agent.active ? 'Running...' : 'Idle'}
                </p>
              </div>
              <span className={`w-2 h-2 rounded-full ${agent.active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default AgentsStatus;