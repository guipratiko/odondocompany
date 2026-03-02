import React, { useState, useEffect } from 'react';
import { apiFetch } from '../App';

export default function Banners() {
  const [slots, setSlots] = useState([]);
  const [banners, setBanners] = useState([]);
  const [slotFilter, setSlotFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ slotId: '', imageUrl: '', linkUrl: '', alt: '', active: true });
  const [saving, setSaving] = useState(false);

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
      const res = await apiFetch('/api/banners', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json(); setError(d.error || 'Erro'); return;
      }
      setForm({ slotId: '', imageUrl: '', linkUrl: '', alt: '', active: true });
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
            <select value={form.slotId} onChange={(e) => setForm((f) => ({ ...f, slotId: e.target.value }))} required>
              <option value="">Selecione</option>
              {slots.map((s) => (
                <option key={s._id} value={s._id}>{s.code} – {s.name}</option>
              ))}
            </select>
          </div>
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
