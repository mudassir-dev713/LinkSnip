const mongoose = require('mongoose');

const QrCodeSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    qrCode: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    anonId: {
      type: String,
      default: null,
    },
    size: Number,
    margin: Number,
    color: String,
    bgColor: String,
    errorCorrection: String,
  },
  { timestamps: true }
);

const QrCode = mongoose.models.QrCode || mongoose.model('QrCode', QrCodeSchema);
export default QrCode;
