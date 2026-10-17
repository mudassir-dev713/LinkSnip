// @ts-check
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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
    tags: {
      type: [String],
      default: [],
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    // ---- Smart link settings ----
    utmSource: { type: String, default: null },
    utmMedium: { type: String, default: null },
    utmCampaign: { type: String, default: null },
    abTesting: [
      {
        url: String,
        weight: { type: Number, default: 50 },
      },
    ],
    geoRedirects: [
      {
        country: String, // ISO country code, e.g. "US"
        url: String,
      },
    ],
    deviceRedirects: [
      {
        device: String, // ios | android | mobile | tablet | desktop
        url: String,
      },
    ],
    oneTimeLink: { type: Boolean, default: false },
    usedAt: { type: Date, default: null },
    scheduledActiveTimes: [
      {
        start: Date,
        end: Date,
      },
    ],
    qrCodeBranding: { type: String, default: null },
    retargetingRules: [
      {
        condition: {
          type: String,
          enum: ['device', 'country', 'browser', 'time', 'referrer'],
        },
        value: String,
        redirectUrl: String,
      },
    ],
  },
  { timestamps: true }
);

// Index for expiration
UrlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Dashboard filtering + per-user listings
UrlSchema.index({ user: 1, createdAt: -1 });
UrlSchema.index({ user: 1, folder: 1 });
UrlSchema.index({ anonId: 1, createdAt: -1 });
UrlSchema.index({ tags: 1 });

// Hash link passwords with bcrypt before saving.
// `$2` prefix guard makes the hook idempotent: re-saving an already-hashed
// value (e.g. editing another field) won't re-hash it.
UrlSchema.pre('save', async function (next) {
  if (!this.password) return next();
  if (this.isModified('password') && !this.password.startsWith('$2')) {
    try {
      this.password = await bcrypt.hash(this.password, 12);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const ShortUrl =
  mongoose.models.ShortUrl || mongoose.model('ShortUrl', UrlSchema);
export default ShortUrl;
