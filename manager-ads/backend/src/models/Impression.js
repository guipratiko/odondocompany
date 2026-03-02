import mongoose from 'mongoose';

const impressionSchema = new mongoose.Schema({
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
  bannerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Banner', required: true },
  ip: { type: String, required: true },
  userAgent: { type: String, default: '' },
}, { timestamps: true });

impressionSchema.index({ slotId: 1, createdAt: 1 });
impressionSchema.index({ ip: 1, slotId: 1 });

export default mongoose.model('Impression', impressionSchema);
