import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import GlassCard from './GlassCard';
import AnimatedCounter from './AnimatedCounter';

const StatCard = ({ 
  title, 
  value, 
  prefix = '₹', 
  suffix = '', 
  change, 
  icon: Icon,
  gradient = 'from-indigo-500 to-purple-500',
  delay = 0 
}) => {
  const isPositive = change >= 0;
  
  return (
    <GlassCard hover delay={delay} className="p-6 relative overflow-hidden group">
      {/* Gradient Background Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
            {Icon && <Icon className="w-6 h-6" />}
          </div>
          
          {change !== undefined && (
            <span className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        
        <p className="text-sm text-white/60 mb-2 font-medium">{title}</p>
        
        <div className="text-3xl font-bold font-display">
          <AnimatedCounter 
            value={value} 
            prefix={prefix} 
            suffix={suffix}
            duration={2000}
          />
        </div>
      </div>
    </GlassCard>
  );
};

export default StatCard;