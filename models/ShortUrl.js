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
  },
  { timestamps: true }
);

const ShortUrl =
  mongoose.models.ShortUrl || mongoose.model('ShortUrl', UrlSchema);
export default ShortUrl;
