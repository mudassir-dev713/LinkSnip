// @ts-check
import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'guest'],
      default: 'member',
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);

export default Team;