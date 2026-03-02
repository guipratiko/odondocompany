import React, { useState, useEffect } from 'react';
import { apiFetch } from '../App';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    apiFetch(`/api/reports?${params}`)
      .then((r) => r.json())
      .then((data) => { setReports(Array.isArray(data) ? data : []); setError(''); })
      .catch(() => setError('Erro ao carregar relatórios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <h1>Relatórios</h1>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Impressões e cliques por slot, com totais e por IP único (métricas sem inflar).</p>
      <div className="filters">
        <div className="form-group">
          <label>De</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Até</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <button type="button" className="btn btn--primary" onClick={load} disabled={loading}>
          {loading ? 'Carregando…' : 'Filtrar'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="reports-grid">
        {reports.map((r) => (
          <div key={r.slotId} className="card">
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem' }}>{r.slotCode} – {r.slotName}</h3>
            <div className="report-card">
              <div><strong>Impressões (total)</strong><br /><span>{r.impressionsTotal ?? 0}</span></div>
              <div><strong>Impressões (IP único)</strong><br /><span>{r.impressionsUniqueIp ?? 0}</span></div>
              <div><strong>Cliques (total)</strong><br /><span>{r.clicksTotal ?? 0}</span></div>
              <div><strong>Cliques (IP único)</strong><br /><span>{r.clicksUniqueIp ?? 0}</span></div>
            </div>
          </div>
        ))}
      </div>
      {!loading && reports.length === 0 && <p style={{ color: '#6b7280' }}>Nenhum dado no período.</p>}
    </>
  );
}
