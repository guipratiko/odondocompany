import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function Layout({ onLogout }) {
  return (
    <>
      <nav>
        <div className="container" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/slots">Slots</Link>
          <Link to="/banners">Banners</Link>
          <Link to="/reports">Relatórios</Link>
          <button type="button" className="btn btn--secondary btn--small logout" onClick={onLogout}>Sair</button>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
