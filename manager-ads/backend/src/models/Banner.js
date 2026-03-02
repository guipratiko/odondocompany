import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String, default: '' },
  alt: { type: String, default: '' },
  active: { type: Boolean, default: true },
  /** Dispositivo alvo: any (todos), mobile, desktop */
  device: { type: String, enum: ['any', 'mobile', 'desktop'], default: 'any' },
  /** Tamanho em px (pré-requisito / informação) */
  width: { type: Number, default: null },
  height: { type: Number, default: null },
}, { timestamps: true });

export default mongoose.model('Banner', bannerSchema);
