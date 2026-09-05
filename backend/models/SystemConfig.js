import mongoose from 'mongoose';

const systemConfigSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  policies: { type: Map, of: Number, default: {} },
  stoppingRules: { type: Map, of: Boolean, default: {} },
}, { timestamps: true });

export default mongoose.model('SystemConfig', systemConfigSchema);