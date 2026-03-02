import React, { useState, useEffect } from 'react';
import { apiFetch } from '../App';
import { getSlotSizes } from '../constants/slotSizes';

export default function Banners() {
  const [slots, setSlots] = useState([]);
  const [banners, setBanners] = useState([]);
  const [slotFilter, setSlotFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const defaultSlide = () => ({ imageUrl: '', linkUrl: '', alt: '', durationSeconds: 4 });
  const [form, setForm] = useState({ slotId: '', active: true, device: 'any', width: '', height: '', sizePreset: '', slides: [defaultSlide()] });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const selectedSlot = form.slotId ? slots.find((s) => s._id === form.slotId) : null;
  const slotSizes = getSlotSizes(selectedSlot);

  const applySizePreset = (presetValue) => {
    if (!presetValue || presetValue === 'custom') {
      setForm((f) => ({ ...f, sizePreset: presetValue || '', device: presetValue === 'custom' ? f.device : 'any', width: '', height: '' }));
      return;
    }
    const [device, width, height] = presetValue.split('-');
    setForm((f) => ({ ...f, sizePreset: presetValue, device: device || 'any', width: width || '', height: height || '' }));
  };

  const loadSlots = () => apiFetch('/api/slots').then((r) => r.json()).then(setSlots);
  const loadBanners = () => apiFetch('/api/banners').then((r) => r.json()).then(setBanners);

  useEffect(() => {
    Promise.all([loadSlots(), loadBanners()])
      .then(() => setError(''))
      .catch(() => setError('Erro ao carregar'))
      .finally(() => setLoading(false));
  }, []);

  const addSlide = () => setForm((f) => ({ ...f, slides: [...(f.slides || []), defaultSlide()] }));
  const updateSlide = (index, field, value) => setForm((f) => ({
    ...f,
    slides: f.slides.map((s, i) => i === index ? { ...s, [field]: value } : s),
  }));
  const removeSlide = (index) => setForm((f) => ({
    ...f,
    slides: f.slides.length > 1 ? f.slides.filter((_, i) => i !== index) : f.slides,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validSlides = (form.slides || []).filter((s) => s.imageUrl?.trim());
    if (!form.slotId || validSlides.length === 0) return;
    setSaving(true);
    setError('');
    const payload = {
      slotId: form.slotId,
      active: form.active,
      device: form.device,
      width: form.width === '' ? null : Number(form.width),
      height: form.height === '' ? null : Number(form.height),
      slides: validSlides.map((s) => ({ ...s, durationSeconds: Math.max(1, Math.min(120, Number(s.durationSeconds) || 4)) })),
    };
    try {
      if (editingId) {
        const res = await apiFetch(`/api/banners/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
        if (!res.ok) {
          const d = await res.json(); setError(d.error || 'Erro'); return;
        }
        setEditingId(null);
        setForm({ slotId: '', active: true, device: 'any', width: '', height: '', sizePreset: '', slides: [defaultSlide()] });
      } else {
        const res = await apiFetch('/api/banners', { method: 'POST', body: JSON.stringify(payload) });
        if (!res.ok) {
          const d = await res.json(); setError(d.error || 'Erro'); return;
        }
        setForm({ slotId: '', active: true, device: 'any', width: '', height: '', sizePreset: '', slides: [defaultSlide()] });
      }
      loadBanners();
    } catch {
      setError('Falha ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (banner) => {
    try {
      await apiFetch(`/api/banners/${banner._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !banner.active }),
      });
      loadBanners();
    } catch {}
  };

  const remove = async (id) => {
    if (!confirm('Excluir este banner?')) return;
    try {
      await apiFetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (editingId === id) setEditingId(null);
      loadBanners();
    } catch {}
  };

  const startEdit = (banner) => {
    const slotId = banner.slotId?._id || banner.slotId;
    const device = banner.device || 'any';
    const width = banner.width != null ? String(banner.width) : '';
    const height = banner.height != null ? String(banner.height) : '';
    const sizePreset = (device && width && height) ? `${device}-${width}-${height}` : (width && height ? 'custom' : '');
    const slides = banner.slides?.length > 0
      ? banner.slides.map((s) => ({ imageUrl: s.imageUrl || '', linkUrl: s.linkUrl || '', alt: s.alt || '', durationSeconds: s.durationSeconds || 4 }))
      : [{ imageUrl: banner.imageUrl || '', linkUrl: banner.linkUrl || '', alt: banner.alt || '', durationSeconds: 4 }];
    setForm({ slotId, active: banner.active !== false, device, width, height, sizePreset, slides });
    setEditingId(banner._id);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ slotId: '', active: true, device: 'any', width: '', height: '', sizePreset: '', slides: [defaultSlide()] });
    setError('');
  };

  const filtered = slotFilter ? banners.filter((b) => b.slotId?._id === slotFilter || b.slotId === slotFilter) : banners;

  if (loading) return <p>Carregando…</p>;

  return (
    <>
      <h1>Banners</h1>
      <div className="card">
        {editingId && (
          <p style={{ marginBottom: 12, fontWeight: 500, color: '#2563eb' }}>Editando banner</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Slot</label>
            <select
              value={form.slotId}
              onChange={(e) => setForm((f) => ({ ...f, slotId: e.target.value, sizePreset: '', width: '', height: '', device: 'any' }))}
              required
            >
              <option value="">Selecione o slot</option>
              {slots.map((s) => (
                <option key={s._id} value={s._id}>{s.code} – {s.name}</option>
              ))}
            </select>
          </div>
          {form.slotId && (
            <div className="form-group">
              <label>Tamanho (conforme o slot)</label>
              {slotSizes.length > 0 ? (
                <>
                  <select
                    value={form.sizePreset || (form.width && form.height ? 'custom' : '')}
                    onChange={(e) => applySizePreset(e.target.value)}
                  >
                    <option value="">Selecione o tamanho</option>
                    {slotSizes.map((s, i) => (
                      <option key={i} value={`${s.device}-${s.width}-${s.height}`}>
                        {s.device === 'mobile' ? 'Mobile' : 'Desktop'} — {s.width}×{s.height} px
                      </option>
                    ))}
                    <option value="custom">Personalizado (informar abaixo)</option>
                  </select>
                  {form.sizePreset && form.sizePreset !== 'custom' && (
                    <p className="form-hint" style={{ marginTop: 4, fontSize: '0.875rem', color: '#6b7280' }}>
                      {form.device === 'mobile' ? 'Mobile' : 'Desktop'} — {form.width}×{form.height} px
                    </p>
                  )}
                </>
              ) : (
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: 8 }}>Nenhum tamanho pré-definido para este slot. Use personalizado.</p>
              )}
              {(form.sizePreset === 'custom' || slotSizes.length === 0) && (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  <div className="form-group" style={{ flex: '1 1 100px' }}>
                    <label>Dispositivo</label>
                    <select value={form.device} onChange={(e) => setForm((f) => ({ ...f, device: e.target.value }))}>
                      <option value="any">Todos (any)</option>
                      <option value="mobile">Mobile</option>
                      <option value="desktop">Desktop</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: '1 1 80px' }}>
                    <label>Largura (px)</label>
                    <input type="number" min="0" placeholder="ex.: 728" value={form.width} onChange={(e) => setForm((f) => ({ ...f, width: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ flex: '1 1 80px' }}>
                    <label>Altura (px)</label>
                    <input type="number" min="0" placeholder="ex.: 90" value={form.height} onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))} />
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="form-group">
            <label>Slides (carrossel) — tempo de exibição por imagem</label>
            {(form.slides?.length ? form.slides : [defaultSlide()]).map((slide, index) => (
              <div key={index} className="card" style={{ marginBottom: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong>Imagem {index + 1}</strong>
                  {(form.slides?.length ? form.slides.length : 1) > 1 && (
                    <button type="button" className="btn btn--small btn--secondary" onClick={() => removeSlide(index)}>Remover</button>
                  )}
                </div>
                <div className="form-group">
                  <label>URL da imagem</label>
                  <input value={slide.imageUrl} onChange={(e) => updateSlide(index, 'imageUrl', e.target.value)} placeholder="https://…" />
                </div>
                <div className="form-group">
                  <label>Link (opcional)</label>
                  <input value={slide.linkUrl} onChange={(e) => updateSlide(index, 'linkUrl', e.target.value)} placeholder="https://…" />
                </div>
                <div className="form-group">
                  <label>Texto alternativo (opcional)</label>
                  <input value={slide.alt} onChange={(e) => updateSlide(index, 'alt', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Exibir por (segundos)</label>
                  <input type="number" min={1} max={120} value={slide.durationSeconds} onChange={(e) => updateSlide(index, 'durationSeconds', e.target.value)} placeholder="4" style={{ maxWidth: 80 }} />
                </div>
              </div>
            ))}
            <button type="button" className="btn btn--secondary btn--small" onClick={addSlide}>+ Adicionar slide</button>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 6 }}>Várias imagens = carrossel. Uma imagem = banner fixo. Duração só vale no carrossel.</p>
          </div>
          <div className="form-group">
            <label><input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} /> Ativo</label>
          </div>
          {error && <p className="error">{error}</p>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Adicionar banner'}
            </button>
            {editingId && (
              <button type="button" className="btn btn--secondary" onClick={cancelEdit}>Cancelar</button>
            )}
          </div>
        </form>
      </div>
      <div className="form-group filters">
        <label>Filtrar por slot</label>
        <select value={slotFilter} onChange={(e) => setSlotFilter(e.target.value)}>
          <option value="">Todos</option>
          {slots.map((s) => (
            <option key={s._id} value={s._id}>{s.code}</option>
          ))}
        </select>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Slot</th>
              <th>Dispositivo</th>
              <th>Tamanho</th>
              <th>Slides</th>
              <th>Imagem</th>
              <th>Link</th>
              <th>Ativo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b._id}>
                <td>{b.slotId?.code || b.slotId}</td>
                <td>{b.device === 'any' ? 'Todos' : b.device === 'mobile' ? 'Mobile' : 'Desktop'}</td>
                <td>{(b.width != null || b.height != null) ? `${b.width ?? '?'}×${b.height ?? '?'}` : '–'}</td>
                <td>{b.slides?.length > 1 ? `Carrossel (${b.slides.length})` : '1'}</td>
                <td><a href={b.imageUrl} target="_blank" rel="noopener noreferrer">Abrir</a></td>
                <td>{b.linkUrl ? <a href={b.linkUrl} target="_blank" rel="noopener noreferrer">Link</a> : '–'}</td>
                <td><button type="button" className="btn btn--small btn--secondary" onClick={() => toggleActive(b)}>{b.active ? 'Ativo' : 'Inativo'}</button></td>
                <td>
                  <button type="button" className="btn btn--small btn--secondary" style={{ marginRight: 6 }} onClick={() => startEdit(b)}>Editar</button>
                  <button type="button" className="btn btn--small btn--danger" onClick={() => remove(b._id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={{ color: '#6b7280' }}>Nenhum banner cadastrado.</p>}
      </div>
    </>
  );
}
