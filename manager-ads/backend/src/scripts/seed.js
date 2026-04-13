import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Slot from '../models/Slot.js';

const SLOTS = [
  { code: 'AD_SLOT_1', name: 'Top Banner', recommendedSizes: [{ device: 'mobile', width: 320, height: 100 }, { device: 'desktop', width: 728, height: 90 }, { device: 'desktop', width: 970, height: 90 }] },
  { code: 'AD_SLOT_2', name: 'Mid-Content', recommendedSizes: [{ device: 'mobile', width: 300, height: 250 }, { device: 'desktop', width: 728, height: 90 }, { device: 'desktop', width: 970, height: 250 }] },
  { code: 'AD_SLOT_3', name: 'Inline Promo', recommendedSizes: [{ device: 'mobile', width: 320, height: 100 }, { device: 'desktop', width: 728, height: 90 }] },
  { code: 'AD_SLOT_4', name: 'Antes Depoimentos', recommendedSizes: [{ device: 'mobile', width: 300, height: 250 }, { device: 'desktop', width: 970, height: 250 }] },
  { code: 'AD_SLOT_5', name: 'Footer Banner', recommendedSizes: [{ device: 'mobile', width: 320, height: 100 }, { device: 'desktop', width: 728, height: 90 }, { device: 'desktop', width: 970, height: 90 }] },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = 'guilherme.santos@me.com';
  const password = 'Bingo3945"!';
  const hash = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate(
    { email },
    { email, passwordHash: hash },
    { upsert: true, new: true }
  );
  console.log('Usuário criado/atualizado:', email);
  for (const s of SLOTS) {
    await Slot.findOneAndUpdate({ code: s.code }, s, { upsert: true, new: true });
    console.log('Slot:', s.code);
  }
  console.log('Seed concluído.');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
