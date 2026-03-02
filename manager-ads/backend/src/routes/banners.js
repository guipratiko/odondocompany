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
    const banners = await Banner.find(filter).populate('slotId', 'code name recommendedSizes').sort({ createdAt: -1 }).lean();
    res.json(banners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar banners' });
  }
});

function normalizeSlides(slides) {
  if (!Array.isArray(slides) || slides.length === 0) return [];
  return slides.map((s) => ({
    imageUrl: (s.imageUrl && String(s.imageUrl).trim()) || '',
    linkUrl: (s.linkUrl && String(s.linkUrl).trim()) || '',
    alt: (s.alt && String(s.alt).trim()) || '',
    durationSeconds: Math.min(120, Math.max(1, Number(s.durationSeconds) || 4)),
  })).filter((s) => s.imageUrl);
}

router.post('/', async (req, res) => {
  try {
    const { slotId, imageUrl, linkUrl, alt, active, device, width, height, slides: slidesRaw } = req.body;
    const slides = normalizeSlides(slidesRaw);
    const hasSlides = slides.length > 0;
    const singleImage = imageUrl?.trim();
    if (!slotId || (!singleImage && !hasSlides)) {
      return res.status(400).json({ error: 'Informe slotId e (imageUrl ou pelo menos um slide com imageUrl)' });
    }
    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ error: 'Slot não encontrado' });
    const firstUrl = hasSlides ? slides[0].imageUrl : singleImage;
    const firstLink = hasSlides ? slides[0].linkUrl : (linkUrl?.trim() || '');
    const firstAlt = hasSlides ? slides[0].alt : (alt?.trim() || '');
    const banner = await Banner.create({
      slotId,
      imageUrl: firstUrl,
      linkUrl: firstLink,
      alt: firstAlt,
      active: active !== false,
      device: ['any', 'mobile', 'desktop'].includes(device) ? device : 'any',
      width: width != null && Number(width) >= 0 ? Number(width) : null,
      height: height != null && Number(height) >= 0 ? Number(height) : null,
      slides: hasSlides ? slides : [],
    });
    await banner.populate('slotId', 'code name recommendedSizes');
    res.status(201).json(banner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar banner' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { slotId, imageUrl, linkUrl, alt, active, device, width, height, slides: slidesRaw } = req.body;
    const update = {};
    if (slotId) {
      const slot = await Slot.findById(slotId);
      if (slot) update.slotId = slotId;
    }
    if (imageUrl !== undefined) update.imageUrl = imageUrl.trim();
    if (linkUrl !== undefined) update.linkUrl = linkUrl.trim();
    if (alt !== undefined) update.alt = alt.trim();
    if (active !== undefined) update.active = active;
    if (['any', 'mobile', 'desktop'].includes(device)) update.device = device;
    if (width != null) update.width = Number(width) >= 0 ? Number(width) : null;
    if (height != null) update.height = Number(height) >= 0 ? Number(height) : null;
    if (slidesRaw !== undefined) {
      const slides = normalizeSlides(slidesRaw);
      update.slides = slides;
      if (slides.length > 0) {
        update.imageUrl = slides[0].imageUrl;
        update.linkUrl = slides[0].linkUrl || '';
        update.alt = slides[0].alt || '';
      }
    }
    const banner = await Banner.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('slotId', 'code name recommendedSizes');
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
