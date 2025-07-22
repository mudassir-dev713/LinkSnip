// @ts-check
import mongoose from 'mongoose';
const ClickSchema = new mongoose.Schema(
  {
    urlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Url', required: true },
    ip: String,
    country: String,
    browser: String,
    deviceType: String,
    isBot: Boolean,
    referrer: String,
    hour: Number,
  },
  { timestamps: true }
);

const Click = mongoose.models.Click || mongoose.model('Click', ClickSchema);
export default Click;
