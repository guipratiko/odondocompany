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
    const hasSlides = banner.slides?.length > 0;
    const payload = {
      slotCode: slot.code,
      banner: {
        id: banner._id,
        width: banner.width,
        height: banner.height,
        imageUrl: hasSlides ? banner.slides[0].imageUrl : banner.imageUrl,
        linkUrl: hasSlides ? banner.slides[0].linkUrl : banner.linkUrl,
        alt: hasSlides ? banner.slides[0].alt : banner.alt,
      },
    };
    if (hasSlides) payload.banner.slides = banner.slides.map((s) => ({ imageUrl: s.imageUrl, linkUrl: s.linkUrl || '', alt: s.alt || '', durationSeconds: s.durationSeconds || 4 }));
    else payload.banner.slides = null;
    res.json(payload);
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
  function toHttps(url){ if (!url || url.indexOf('http://') !== 0) return url; if (typeof location !== 'undefined' && location.protocol === 'https:') return 'https://' + url.slice(7); return url; }
  fetch(api + '/api/embed/slot/' + encodeURIComponent(slotCode) + '?device=' + device)
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(data){
      if (!data || !data.banner) return;
      var b = data.banner;
      var slides = b.slides && b.slides.length > 1 ? b.slides : null;
      if (slides) { for (var i = 0; i < slides.length; i++) { slides[i].imageUrl = toHttps(slides[i].imageUrl); slides[i].linkUrl = toHttps(slides[i].linkUrl); } }
      else { b.imageUrl = toHttps(b.imageUrl); b.linkUrl = toHttps(b.linkUrl); }
      var a = document.createElement('a');
      a.href = slides ? slides[0].linkUrl || '#' : (b.linkUrl || '#');
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.addEventListener('click', function(){ fetch(api + '/api/track/click', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ slotCode: slotCode, bannerId: b.id }) }).catch(function(){}); });
      var img = document.createElement('img');
      img.alt = slides ? (slides[0].alt || 'Publicidade') : (b.alt || 'Publicidade');
      img.loading = 'lazy';
      if (b.width) img.width = b.width;
      if (b.height) img.height = b.height;
      if (slides && slides.length > 1) {
        img.src = slides[0].imageUrl;
        a.appendChild(img);
        placeholder.appendChild(a);
        var idx = 0;
        function scheduleNext() {
          var dur = (slides[idx].durationSeconds || 4) * 1000;
          setTimeout(function(){
            idx = (idx + 1) % slides.length;
            img.src = slides[idx].imageUrl;
            a.href = slides[idx].linkUrl || '#';
            img.alt = slides[idx].alt || 'Publicidade';
            scheduleNext();
          }, dur);
        }
        scheduleNext();
      } else {
        img.src = slides ? slides[0].imageUrl : b.imageUrl;
        a.appendChild(img);
        placeholder.appendChild(a);
      }
      fetch(api + '/api/track/impression', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ slotCode: slotCode, bannerId: b.id }) }).catch(function(){});
    })
    .catch(function(){});
})();
`);
}

export default router;
