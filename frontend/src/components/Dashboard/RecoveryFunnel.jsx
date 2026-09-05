import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';

const RecoveryFunnel = ({ data }) => {
  const stages = [
    { label: 'Total Transactions', value: data.total, color: 'from-gray-400 to-gray-500' },
    { label: 'Revenue at Risk', value: data.atRisk, color: 'from-amber-500 to-orange-500' },
    { label: 'Recovery Attempted', value: data.attempted, color: 'from-indigo-500 to-purple-500' },
    { label: 'Successfully Recovered', value: data.recovered, color: 'from-emerald-500 to-green-500' },
  ];

  const maxValue = stages[0].value;

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-6">Revenue Recovery Funnel</h3>
      
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const percentage = (stage.value / maxValue) * 100;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white/80">{stage.label}</span>
                <span className="text-sm font-bold text-white">{stage.value.toLocaleString()}</span>
              </div>
              <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full bg-gradient-to-r ${stage.color} rounded-lg relative`}
                >
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                    {percentage.toFixed(0)}%
                  </span>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default RecoveryFunnel;