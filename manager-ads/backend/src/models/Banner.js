import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String, default: '' },
  alt: { type: String, default: '' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Banner', bannerSchema);
