import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Slot from '../models/Slot.js';

const SLOTS = [
  { code: 'AD_SLOT_1', name: 'Top Banner' },
  { code: 'AD_SLOT_2', name: 'Mid-Content' },
  { code: 'AD_SLOT_3', name: 'Inline Promo' },
  { code: 'AD_SLOT_4', name: 'Antes Depoimentos' },
  { code: 'AD_SLOT_5', name: 'Footer Banner' },
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
