import User from '../models/User.js';
import SystemConfig from '../models/SystemConfig.js';
import mongoose from 'mongoose';

const defaultPolicies = {
  maxAttempts: 5,
  maxCostPerCase: 500,
  maxDiscount: 20,
  minENRV: 100,
  escalationThreshold: 10000,
  voiceCallThreshold: 50000,
};

const defaultStoppingRules = {
  noResponseAfterThreeAttempts: true,
  marginalRoiBelowOne: true,
  customerOptsOut: true,
  noActivityAfterSevenDays: false,
  fraudulentTransactions: true,
};

export const getAdminPolicies = async (req, res) => {
  const config = await SystemConfig.findOne({ key: 'recovery-policies' });
  res.json({ success: true, data: { ...defaultPolicies, ...Object.fromEntries(config?.policies || []), stoppingRules: { ...defaultStoppingRules, ...Object.fromEntries(config?.stoppingRules || []) } } });
};

export const updateAdminPolicies = async (req, res) => {
  const policies = Object.fromEntries(Object.entries(defaultPolicies).map(([key, value]) => [key, Number(req.body[key] ?? value)]));
  const stoppingRules = { ...defaultStoppingRules, ...(req.body.stoppingRules || {}) };
  await SystemConfig.findOneAndUpdate(
    { key: 'recovery-policies' },
    { key: 'recovery-policies', policies, stoppingRules },
    { upsert: true, new: true, runValidators: true },
  );
  res.json({ success: true, data: { ...policies, stoppingRules } });
};

export const getUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, data: users });
};

export const getSystemStatus = async (req, res) => {
  res.json({ success: true, data: {
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Unavailable',
    api: 'Operational',
    aiModel: process.env.GROQ_API_KEY ? (process.env.GROQ_MODEL || 'configured') : 'Not configured',
    notifications: 'Configured through Socket.IO',
  } });
};