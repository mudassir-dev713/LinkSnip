// models/Subscription.js
import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  stripeCustomerId: {
    type: String,
    required: true,
    unique: true
  },
  stripeSubscriptionId: {
    type: String,
    sparse: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'business'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid'],
    default: 'trialing'
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  usage: {
    urlsCreated: {
      type: Number,
      default: 0
    },
    apiCalls: {
      type: Number,
      default: 0
    },
    teamMembers: {
      type: Number,
      default: 0
    },
    resetDate: {
      type: Date,
      default: Date.now
    }
  },
  planLimits: {
    maxUrls: {
      type: Number,
      default: 10 // Free plan
    },
    maxApiCalls: {
      type: Number,
      default: 1000
    },
    maxTeamMembers: {
      type: Number,
      default: 0 // Free plan
    }
  }
}, { timestamps: true });

SubscriptionSchema.index({ user: 1 });
SubscriptionSchema.index({ plan: 1, status: 1 });

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
export default Subscription;