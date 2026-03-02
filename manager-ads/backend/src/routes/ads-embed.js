import { Router } from 'express';
import Banner from '../models/Banner.js';
import Slot from '../models/Slot.js';

const router = Router();

// API pública para o embed: banner ativo do slot (query: device=mobile|desktop)
router.get('/slot/:code', async (req, res) => {
  try {
    const slot = await Slot.findOne({ code: req.params.code });
    if (!slot) return res.status(404).json({ error: 'Slot não encontrado' });
    const device = (req.query.device === 'mobile' || req.query.device === 'desktop') ? req.query.device : 'desktop';
    // Preferir banner para o dispositivo; senão usar device=any
    let banner = await Banner.findOne({ slotId: slot._id, active: true, device }).sort({ createdAt: -1 }).lean();
    if (!banner) banner = await Banner.findOne({ slotId: slot._id, active: true, device: 'any' }).sort({ createdAt: -1 }).lean();
    if (!banner) return res.status(200).json({ slotCode: slot.code, banner: null });
    res.json({
      slotCode: slot.code,
      banner: { id: banner._id, imageUrl: banner.imageUrl, linkUrl: banner.linkUrl, alt: banner.alt, width: banner.width, height: banner.height },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar banner' });
  }
});

// Servir ads.js: script que injeta banner e registra impressão/clique
export function serveAdsJs(req, res) {
  const api = (req.query.api || req.get('referer') || '').replace(/\/$/, '') || 'http://localhost:3001';
  res.set('Content-Type', 'application/javascript; charset=utf-8');
  res.set('Cache-Control', 'no-cache');
  res.send(`
(function(){
  var script = document.currentScript;
  var api = script.getAttribute('data-api') || '${api}';
  var slotCode = script.getAttribute('data-slot');
  if (!slotCode) return;
  var placeholder = document.querySelector('[data-ad-slot="' + slotCode + '"] .ad-slot__placeholder');
  if (!placeholder) return;
  var device = (typeof window.innerWidth !== 'undefined' && window.innerWidth < 768) ? 'mobile' : 'desktop';
  fetch(api + '/api/embed/slot/' + encodeURIComponent(slotCode) + '?device=' + device)
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(data){
      if (!data || !data.banner) return;
      var b = data.banner;
      if (b.imageUrl && b.imageUrl.indexOf('http://') === 0 && typeof location !== 'undefined' && location.protocol === 'https:') b.imageUrl = 'https://' + b.imageUrl.slice(7);
      if (b.linkUrl && b.linkUrl.indexOf('http://') === 0 && typeof location !== 'undefined' && location.protocol === 'https:') b.linkUrl = 'https://' + b.linkUrl.slice(7);
      var a = document.createElement('a');
      a.href = b.linkUrl || '#';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.addEventListener('click', function(){
        fetch(api + '/api/track/click', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ slotCode: slotCode, bannerId: b.id })
        }).catch(function(){});
      });
      var img = document.createElement('img');
      img.src = b.imageUrl;
      img.alt = b.alt || 'Publicidade';
      img.loading = 'lazy';
      if (b.width) img.width = b.width;
      if (b.height) img.height = b.height;
      a.appendChild(img);
      placeholder.appendChild(a);
      fetch(api + '/api/track/impression', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ slotCode: slotCode, bannerId: b.id })
      }).catch(function(){});
    })
    .catch(function(){});
})();
`);
}

export default router;
