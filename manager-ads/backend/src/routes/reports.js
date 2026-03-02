import { Router } from 'express';
import Impression from '../models/Impression.js';
import Click from '../models/Click.js';
import Slot from '../models/Slot.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

router.get('/', async (req, res) => {
  try {
    const { slotId, dateFrom, dateTo } = req.query;
    const from = parseDate(dateFrom);
    const to = parseDate(dateTo);
    const match = {};
    if (slotId) match.slotId = slotId;
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = from;
      if (to) {
        const end = new Date(to); end.setHours(23, 59, 59, 999);
        match.createdAt.$lte = end;
      }
    }

    const slots = await Slot.find(slotId ? { _id: slotId } : {}).sort({ code: 1 }).lean();
    const results = [];

    for (const slot of slots) {
      const slotMatch = { ...match, slotId: slot._id };
      const [impressions, clicks, uniqueImpressionIps, uniqueClickIps] = await Promise.all([
        Impression.countDocuments(slotMatch),
        Click.countDocuments(slotMatch),
        Impression.distinct('ip', slotMatch),
        Click.distinct('ip', slotMatch),
      ]);
      results.push({
        slotId: slot._id,
        slotCode: slot.code,
        slotName: slot.name,
        impressionsTotal: impressions,
        impressionsUniqueIp: uniqueImpressionIps.length,
        clicksTotal: clicks,
        clicksUniqueIp: uniqueClickIps.length,
      });
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

export default router;
