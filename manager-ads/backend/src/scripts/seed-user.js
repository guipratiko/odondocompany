/**
 * Cria ou atualiza apenas o usuário de acesso ao dashboard.
 * Uso: npm run seed:user
 * Credenciais padrão (podem ser sobrescritas por env):
 *   SEED_USER_EMAIL, SEED_USER_PASSWORD
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const email = (process.env.SEED_USER_EMAIL || 'guilherme.santos@me.com').trim().toLowerCase();
const password = process.env.SEED_USER_PASSWORD || 'Bingo3945"!';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hash = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate(
    { email },
    { email, passwordHash: hash },
    { upsert: true, new: true }
  );
  console.log('Usuário criado/atualizado:', email);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
