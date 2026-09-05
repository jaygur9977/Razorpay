import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const GlassCard = ({ 
  children, 
  className, 
  hover = false, 
  onClick,
  animate = true,
  delay = 0 
}) => {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 30 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.16, 1, 0.3, 1] 
      }}
      onClick={onClick}
      className={clsx(
        'glass-card',
        hover && 'glass-card-hover',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;