import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import slotRoutes from './routes/slots.js';
import bannerRoutes from './routes/banners.js';
import trackRoutes from './routes/track.js';
import reportRoutes from './routes/reports.js';
import adsEmbedRoutes, { serveAdsJs } from './routes/ads-embed.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: aceita várias origens separadas por vírgula (ex.: http://localhost:3000,https://ads.onlyflow.com.br)
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : ['*'];
const corsOptions = corsOrigins.length && corsOrigins[0] === '*'
  ? { origin: '*' }
  : { origin: (origin, cb) => (corsOrigins.includes(origin) ? cb(null, true) : cb(null, false)), credentials: true };
app.use(cors(corsOptions));
app.use(express.json());

// Embed script (público, sem auth)
app.get('/promo.js', serveAdsJs);
app.use('/api/embed', adsEmbedRoutes);

// API
app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/reports', reportRoutes);

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado');
  } catch (err) {
    console.error('Erro ao conectar MongoDB:', err.message);
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`Manager-ADS API http://localhost:${PORT}`));
}

start().catch(console.error);
