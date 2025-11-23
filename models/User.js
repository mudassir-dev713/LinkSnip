// @ts-check
import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
      default: Date.now,
    },
    resetPasswordExpires: {
      type: Date,
      default: Date.now,
    },
    plan: {
      type: String,
      enum: ['Free', 'Pro', 'Business'],
      default: 'Free',
    },
    stripeCustomerId: {
      type: String,
    },
    apiKeys: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;