import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  linkUrl: { type: String, default: '' },
  alt: { type: String, default: '' },
  /** Tempo de exibição em segundos (ex.: 4 = 4 segundos) */
  durationSeconds: { type: Number, default: 4, min: 1, max: 120 },
}, { _id: false });

const bannerSchema = new mongoose.Schema({
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
  imageUrl: { type: String, default: '' },
  linkUrl: { type: String, default: '' },
  alt: { type: String, default: '' },
  active: { type: Boolean, default: true },
  /** Dispositivo alvo: any (todos), mobile, desktop */
  device: { type: String, enum: ['any', 'mobile', 'desktop'], default: 'any' },
  /** Tamanho em px (pré-requisito / informação) */
  width: { type: Number, default: null },
  height: { type: Number, default: null },
  /** Carrossel: múltiplas imagens com tempo de exibição por slide. Se vazio, usa imageUrl/linkUrl/alt (banner único) */
  slides: [slideSchema],
}, { timestamps: true });

export default mongoose.model('Banner', bannerSchema);
