import { Router } from 'express';
import Slot from '../models/Slot.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const slots = await Slot.find().sort({ code: 1 }).lean();
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar slots' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { code, name } = req.body;
    if (!code?.trim()) return res.status(400).json({ error: 'Código obrigatório' });
    const slot = await Slot.create({ code: code.trim(), name: name?.trim() || code.trim() });
    res.status(201).json(slot);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Slot com este código já existe' });
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar slot' });
  }
});

export default router;
