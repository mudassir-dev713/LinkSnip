// @ts-check
import mongoose from 'mongoose';

const LinkHistorySchema = new mongoose.Schema({
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShortUrl',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'EXPIRE'],
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const LinkHistory = mongoose.models.LinkHistory || mongoose.model('LinkHistory', LinkHistorySchema);
export default LinkHistory;