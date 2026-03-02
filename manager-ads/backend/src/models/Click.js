import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema({
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
  bannerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Banner', required: true },
  ip: { type: String, required: true },
  userAgent: { type: String, default: '' },
}, { timestamps: true });

clickSchema.index({ slotId: 1, createdAt: 1 });
clickSchema.index({ ip: 1, slotId: 1 });

export default mongoose.model('Click', clickSchema);
