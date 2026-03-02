import React, { useState, useEffect } from 'react';
import { apiFetch } from '../App';

export default function Banners() {
  const [slots, setSlots] = useState([]);
  const [banners, setBanners] = useState([]);
  const [slotFilter, setSlotFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ slotId: '', imageUrl: '', linkUrl: '', alt: '', active: true, device: 'any', width: '', height: '', sizePreset: '' });
  const [saving, setSaving] = useState(false);

  const selectedSlot = form.slotId ? slots.find((s) => s._id === form.slotId) : null;
  const slotSizes = selectedSlot?.recommendedSizes || [];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.slotId || !form.imageUrl?.trim()) return;
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      payload.width = form.width === '' ? null : Number(form.width);
      payload.height = form.height === '' ? null : Number(form.height);
      const res = await apiFetch('/api/banners', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json(); setError(d.error || 'Erro'); return;
      }
      setForm({ slotId: '', imageUrl: '', linkUrl: '', alt: '', active: true, device: 'any', width: '', height: '', sizePreset: '' });
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
      loadBanners();
    } catch {}
  };

  const filtered = slotFilter ? banners.filter((b) => b.slotId?._id === slotFilter || b.slotId === slotFilter) : banners;

  if (loading) return <p>Carregando…</p>;

  return (
    <>
      <h1>Banners</h1>
      <div className="card">
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
            <label>URL da imagem</label>
            <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" required />
          </div>
          <div className="form-group">
            <label>Link (opcional)</label>
            <input value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} placeholder="https://…" />
          </div>
          <div className="form-group">
            <label>Texto alternativo (opcional)</label>
            <input value={form.alt} onChange={(e) => setForm((f) => ({ ...f, alt: e.target.value }))} />
          </div>
          <div className="form-group">
            <label><input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} /> Ativo</label>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Salvando…' : 'Adicionar banner'}</button>
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
                <td><a href={b.imageUrl} target="_blank" rel="noopener noreferrer">Abrir</a></td>
                <td>{b.linkUrl ? <a href={b.linkUrl} target="_blank" rel="noopener noreferrer">Link</a> : '–'}</td>
                <td><button type="button" className="btn btn--small btn--secondary" onClick={() => toggleActive(b)}>{b.active ? 'Ativo' : 'Inativo'}</button></td>
                <td><button type="button" className="btn btn--small btn--danger" onClick={() => remove(b._id)}>Excluir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={{ color: '#6b7280' }}>Nenhum banner cadastrado.</p>}
      </div>
    </>
  );
}
