// models/APIKey.js
import mongoose from 'mongoose';

const APIKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  usage: {
    total: {
      type: Number,
      default: 0
    },
    monthly: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date
    }
  },
  permissions: {
    createUrls: { type: Boolean, default: true },
    readAnalytics: { type: Boolean, default: true },
    manageTeam: { type: Boolean, default: false }
  },
  expiresAt: {
    type: Date
  },
  lastFour: {
    type: String
  }
}, { timestamps: true });

APIKeySchema.index({ user: 1 });
APIKeySchema.index({ key: 1 });

const APIKey = mongoose.models.APIKey || mongoose.model('APIKey', APIKeySchema);
export default APIKey;