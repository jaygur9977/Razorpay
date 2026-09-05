import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import AnimatedCounter from '../common/AnimatedCounter';

const KPICard = ({ 
  title, 
  value, 
  prefix = '₹', 
  change = 0, 
  icon: Icon,
  color = 'indigo',
  sparkline = [],
  delay = 0 
}) => {
  const colorMap = {
    indigo: 'from-indigo-500 to-purple-500',
    emerald: 'from-emerald-500 to-green-500',
    amber: 'from-amber-500 to-orange-500',
    pink: 'from-pink-500 to-rose-500',
    cyan: 'from-cyan-500 to-blue-500',
  };

  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card glass-card-hover p-6 relative overflow-hidden group"
    >
      {/* Animated Gradient Border */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color]} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} text-white shadow-lg`}>
            {Icon && <Icon className="w-6 h-6" />}
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{change}%
            </span>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>
        
        <p className="text-sm text-white/60 mb-2 font-medium">{title}</p>
        
        <div className="text-3xl font-bold font-display mb-4">
          <AnimatedCounter value={value} prefix={prefix} duration={2000} />
        </div>

        {/* Mini Sparkline */}
        {sparkline.length > 0 && (
          <div className="flex items-end gap-1 h-10">
            {sparkline.map((val, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${val}%` }}
                transition={{ duration: 0.5, delay: delay + i * 0.1 }}
                className={`flex-1 rounded-t bg-gradient-to-t ${colorMap[color]}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KPICard;