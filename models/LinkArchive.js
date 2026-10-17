// @ts-check
import mongoose from 'mongoose';

const LinkArchiveSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShortUrl',
      required: true,
      unique: true,
    },
    originalUrl: { type: String, required: true },
    title: { type: String, default: null },
    description: { type: String, default: null },
    excerpt: { type: String, default: null },
    status: {
      type: String,
      enum: ['ok', 'error'],
      default: 'ok',
    },
    error: { type: String, default: null },
    archivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const LinkArchive =
  mongoose.models.LinkArchive || mongoose.model('LinkArchive', LinkArchiveSchema);
export default LinkArchive;
