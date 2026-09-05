import React from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', maxWidth: '500px' }}
      >
        {/* 404 Animation */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ marginBottom: '32px' }}
        >
          <h1 style={{
            fontSize: '120px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
          }}>
            404
          </h1>
        </motion.div>

        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
          Page Not Found
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/dashboard/merchant')}
            className="btn-primary"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Decorative Elements */}
        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: ['#6366f1', '#8b5cf6', '#ec4899'][i],
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;