import { Router } from 'express';
import Impression from '../models/Impression.js';
import Click from '../models/Click.js';
import Banner from '../models/Banner.js';
import Slot from '../models/Slot.js';

const router = Router();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0];
    return first?.trim() || req.ip || req.socket?.remoteAddress || '';
  }
  return req.ip || req.socket?.remoteAddress || '';
}

router.post('/impression', async (req, res) => {
  try {
    const { slotCode, bannerId } = req.body;
    if (!slotCode || !bannerId) {
      return res.status(400).json({ error: 'slotCode e bannerId obrigatórios' });
    }
    const slot = await Slot.findOne({ code: slotCode });
    if (!slot) return res.status(404).json({ error: 'Slot não encontrado' });
    const banner = await Banner.findOne({ _id: bannerId, slotId: slot._id, active: true });
    if (!banner) return res.status(404).json({ error: 'Banner não encontrado ou inativo' });
    await Impression.create({
      slotId: slot._id,
      bannerId: banner._id,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'] || '',
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar impressão' });
  }
});

router.post('/click', async (req, res) => {
  try {
    const { slotCode, bannerId } = req.body;
    if (!slotCode || !bannerId) {
      return res.status(400).json({ error: 'slotCode e bannerId obrigatórios' });
    }
    const slot = await Slot.findOne({ code: slotCode });
    if (!slot) return res.status(404).json({ error: 'Slot não encontrado' });
    const banner = await Banner.findOne({ _id: bannerId, slotId: slot._id });
    if (!banner) return res.status(404).json({ error: 'Banner não encontrado' });
    await Click.create({
      slotId: slot._id,
      bannerId: banner._id,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'] || '',
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar clique' });
  }
});

export default router;
