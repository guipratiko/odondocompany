import { Router } from 'express';
import Banner from '../models/Banner.js';
import Slot from '../models/Slot.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { slotId } = req.query;
    const filter = slotId ? { slotId } : {};
    const banners = await Banner.find(filter).populate('slotId', 'code name').sort({ createdAt: -1 }).lean();
    res.json(banners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar banners' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { slotId, imageUrl, linkUrl, alt, active } = req.body;
    if (!slotId || !imageUrl?.trim()) {
      return res.status(400).json({ error: 'slotId e imageUrl obrigatórios' });
    }
    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ error: 'Slot não encontrado' });
    const banner = await Banner.create({
      slotId,
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl?.trim() || '',
      alt: alt?.trim() || '',
      active: active !== false,
    });
    await banner.populate('slotId', 'code name');
    res.status(201).json(banner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar banner' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { imageUrl, linkUrl, alt, active } = req.body;
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { ...(imageUrl !== undefined && { imageUrl: imageUrl.trim() }), ...(linkUrl !== undefined && { linkUrl: linkUrl.trim() }), ...(alt !== undefined && { alt: alt.trim() }), ...(active !== undefined && { active }) },
      { new: true }
    ).populate('slotId', 'code name');
    if (!banner) return res.status(404).json({ error: 'Banner não encontrado' });
    res.json(banner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar banner' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Banner não encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir banner' });
  }
});

export default router;
