import React, { useState, useEffect } from 'react';
import { apiFetch } from '../App';

export default function Slots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/slots')
      .then((r) => r.json())
      .then((data) => { setSlots(Array.isArray(data) ? data : []); setError(''); })
      .catch(() => setError('Erro ao carregar slots'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando slots…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <h1>Slots</h1>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Slots disponíveis para banners (ex.: AD_SLOT_1 … AD_SLOT_5 na página Odonnto).</p>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s._id}>
                <td><code>{s.code}</code></td>
                <td>{s.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
