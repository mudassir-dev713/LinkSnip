// @ts-check
import mongoose from 'mongoose';
const ClickSchema = new mongoose.Schema(
  {
    urlId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShortUrl', required: true },
    ip: String, // HMAC-hashed — raw IPs are never stored
    country: String,
    browser: String,
    deviceType: String,
    isBot: Boolean,
    referrer: String,
    hour: Number,
    // Which routing rule produced this click (ab-testing | geo | device |
    // retargeting | default) and the final destination URL — powers the
    // A/B split and destination breakdown in analytics.
    matchedBy: { type: String, default: null },
    destination: { type: String, default: null },
  },
  { timestamps: true }
);

// Analytics queries always filter by urlId + createdAt — this covers every
// aggregate in the analytics route.
ClickSchema.index({ urlId: 1, createdAt: -1 });
ClickSchema.index({ urlId: 1, ip: 1 });

const Click = mongoose.models.Click || mongoose.model('Click', ClickSchema);
export default Click;
