import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, TrendingDown,
  IndianRupee, Activity, Target,
  BarChart3, PieChart, LineChart,
  Calendar, Download, Filter,
  CheckCircle, AlertCircle, Clock,
  Zap, Bot, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAnalyticsOverview, getCostAnalysis, getRecoveryByType } from '../services/api';

const Analytics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7d');

  const [overview, setOverview] = useState(null);
  const [recoveryByType, setRecoveryByType] = useState([]);
  const [actionEffectiveness, setActionEffectiveness] = useState([]);

  useEffect(() => {
    Promise.all([getAnalyticsOverview(timeRange), getRecoveryByType(), getCostAnalysis()])
      .then(([overviewResponse, typeResponse, costResponse]) => {
        setOverview(overviewResponse.data);
        setRecoveryByType(typeResponse.data.map((item, index) => ({ ...item, count: item.totalCases, amount: item.totalAmount, color: ['#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981'][index % 5] })));
        setActionEffectiveness(costResponse.data.actionBreakdown.map((item) => ({ action: item.action, count: item.count, cost: item.totalCost, successRate: item.totalRecovered > 0 ? 100 : 0 })));
      })
      .catch(() => { setOverview(null); setRecoveryByType([]); setActionEffectiveness([]); });
  }, [timeRange]);

  const summary = overview?.summary || {};
  const recoveryData = {
    totalRevenueAtRisk: summary.failedAmount || 0,
    totalRecovered: summary.recoveredAmount || 0,
    recoveryRate: summary.recoveryRate || 0,
    avgResponseTime: '-',
    totalCases: summary.totalCases || 0,
    recoveredCases: 0,
    stoppedCases: 0,
    activeCases: summary.totalCases || 0,
    costPerRecovery: 0,
    netRevenue: summary.recoveredAmount || 0,
  };
  const weeklyTrend = (overview?.dailyBreakdown || []).map((day) => ({ day: day.date, atRisk: day.amount, recovered: day.recovered }));

  const maxTrendValue = Math.max(...weeklyTrend.map(d => d.atRisk));

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
                <BarChart3 style={{ color: '#34d399' }} />
                Analytics Dashboard
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                Recovery performance and insights
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Time Range Selector */}
            <div style={{
              display: 'flex',
              gap: '4px',
              background: 'rgba(255,255,255,0.04)',
              padding: '4px',
              borderRadius: '12px',
            }}>
              {['24h', '7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                    background: timeRange === range
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'transparent',
                    color: timeRange === range ? 'white' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
            
            <button className="btn-secondary">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        {/* KPI Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'Total Revenue at Risk', value: `₹${(recoveryData.totalRevenueAtRisk / 100000).toFixed(1)}L`, icon: AlertCircle, color: '#fbbf24' },
            { label: 'Total Recovered', value: `₹${(recoveryData.totalRecovered / 100000).toFixed(1)}L`, icon: CheckCircle, color: '#34d399' },
            { label: 'Recovery Rate', value: `${recoveryData.recoveryRate}%`, icon: TrendingUp, color: '#818cf8' },
            { label: 'Net Revenue', value: `₹${(recoveryData.netRevenue / 100000).toFixed(1)}L`, icon: IndianRupee, color: '#10b981' },
            { label: 'Active Cases', value: recoveryData.activeCases, icon: Clock, color: '#a855f7' },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card"
                style={{ padding: '20px', textAlign: 'center' }}
              >
                <Icon className="w-6 h-6 mx-auto mb-8" style={{ color: kpi.color }} />
                <p style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {kpi.value}
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  {kpi.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Weekly Trend Chart */}
        <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
            Weekly Recovery Trend
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', height: '250px', padding: '20px 0' }}>
            {weeklyTrend.map((day, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '4px',
                  height: '200px',
                  width: '100%',
                }}>
                  {/* At Risk Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.atRisk / maxTrendValue) * 200}px` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    style={{
                      flex: 1,
                      background: 'rgba(245,158,11,0.3)',
                      borderRadius: '4px 4px 0 0',
                      border: '1px solid rgba(245,158,11,0.5)',
                    }}
                  />
                  {/* Recovered Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.recovered / maxTrendValue) * 200}px` }}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(180deg, #10b981, #34d399)',
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(245,158,11,0.5)' }} />
              At Risk
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#34d399' }} />
              Recovered
            </span>
          </div>
        </div>

        {/* Recovery by Type & Action Effectiveness */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}>
          {/* Recovery by Type */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
              Recovery by Type
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recoveryByType.map((item, i) => {
                const percentage = (item.count / 120) * 100;
                return (
                  <div key={i}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                        {item.type}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>
                        {item.count} cases • ₹{(item.amount / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        style={{
                          height: '100%',
                          background: item.color,
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Effectiveness */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
              Action Effectiveness
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Action', 'Success Rate', 'Count', 'Cost'].map((header, i) => (
                      <th key={i} style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'rgba(255,255,255,0.4)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {actionEffectiveness.map((action, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>{action.action}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '60px',
                            height: '6px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${action.successRate}%`,
                              background: action.successRate > 70 ? '#34d399' : action.successRate > 50 ? '#fbbf24' : '#f87171',
                              borderRadius: '3px',
                            }} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>
                            {action.successRate}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>{action.count}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                        {action.cost === 0 ? 'Free' : `₹${action.cost}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
            Cost Analysis
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}>
            <div style={{
              padding: '24px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '16px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                Average Cost per Recovery
              </p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#fbbf24' }}>
                ₹{recoveryData.costPerRecovery.toLocaleString()}
              </p>
            </div>
            
            <div style={{
              padding: '24px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '16px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                Average Response Time
              </p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#818cf8' }}>
                {recoveryData.avgResponseTime}
              </p>
            </div>
            
            <div style={{
              padding: '24px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '16px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                ROI on Recovery
              </p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#34d399' }}>
                11.2x
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;