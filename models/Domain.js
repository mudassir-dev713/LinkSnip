// @ts-check
import mongoose from 'mongoose';

const DomainSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  verificationMethod: {
    type: String,
    enum: ['DNS', 'FILE', 'CNAME'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
});

const Domain = mongoose.models.Domain || mongoose.model('Domain', DomainSchema);
export default Domain;