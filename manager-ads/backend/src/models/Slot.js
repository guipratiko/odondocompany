import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema({
  device: { type: String, enum: ['mobile', 'desktop'], required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
}, { _id: false });

const slotSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  /** Pré-requisitos de tamanho por dispositivo (ex.: mobile 320x100, desktop 728x90) */
  recommendedSizes: [sizeSchema],
}, { timestamps: true });

export default mongoose.model('Slot', slotSchema);
