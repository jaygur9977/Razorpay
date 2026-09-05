import React from 'react';
import { CheckCircle, AlertCircle, Clock, XCircle, TrendingUp, TrendingDown } from 'lucide-react';

const StatusBadge = ({ status, size = 'md' }) => {
  const configs = {
    detected: {
      label: 'Detected',
      icon: AlertCircle,
      className: 'badge-info',
    },
    diagnosed: {
      label: 'Diagnosed',
      icon: Clock,
      className: 'badge-warning',
    },
    prioritized: {
      label: 'Prioritized',
      icon: TrendingUp,
      className: 'badge-purple',
    },
    executed: {
      label: 'Executing',
      icon: Clock,
      className: 'badge-warning',
    },
    recovered: {
      label: 'Recovered',
      icon: CheckCircle,
      className: 'badge-success',
    },
    failed: {
      label: 'Failed',
      icon: XCircle,
      className: 'badge-danger',
    },
    stopped: {
      label: 'Stopped',
      icon: TrendingDown,
      className: 'badge-danger',
    },
    escalated: {
      label: 'Escalated',
      icon: AlertCircle,
      className: 'badge-warning',
    },
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'badge-warning',
    },
    active: {
      label: 'Active',
      icon: TrendingUp,
      className: 'badge-success',
    },
  };

  const config = configs[status] || {
    label: status,
    icon: Clock,
    className: 'badge-info',
  };

  const Icon = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

export default StatusBadge;