// @ts-check
import mongoose from 'mongoose';
const UrlSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: null,
    },
    fullUrl: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      default: null,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    anonId: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    retargetingRules: [
      {
        condition: {
          type: String,
          enum: ['device', 'country', 'browser', 'time', 'referrer'],
        },
        value: String,
        redirectUrl: String,
      }
    ],
  },
  { timestamps: true }
);

// Index for expiration
UrlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ShortUrl =
  mongoose.models.ShortUrl || mongoose.model('ShortUrl', UrlSchema);
export default ShortUrl;