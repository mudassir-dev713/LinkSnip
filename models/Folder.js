// @ts-check
import mongoose from 'mongoose';

const FolderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 40,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

FolderSchema.index({ user: 1, name: 1 }, { unique: true });

const Folder = mongoose.models.Folder || mongoose.model('Folder', FolderSchema);
export default Folder;
