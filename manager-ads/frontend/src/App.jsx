import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Login from './pages/Login';
import Slots from './pages/Slots';
import Banners from './pages/Banners';
import Reports from './pages/Reports';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('manager_ads_token');
}

export function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${API}${path}`, { ...options, headers });
}

export default function App() {
  const [auth, setAuth] = useState(!!getToken());
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken() && !window.location.pathname.startsWith('/login')) {
      setAuth(false);
    }
  }, []);

  const onLogin = () => setAuth(true);
  const onLogout = () => {
    localStorage.removeItem('manager_ads_token');
    setAuth(false);
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/login" element={auth ? <Navigate to="/" replace /> : <Login onLogin={onLogin} />} />
      <Route path="/" element={auth ? <Layout onLogout={onLogout} /> : <Navigate to="/login" replace />}>
        <Route index element={<Navigate to="/slots" replace />} />
        <Route path="slots" element={<Slots />} />
        <Route path="banners" element={<Banners />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to={auth ? '/slots' : '/login'} replace />} />
    </Routes>
  );
}
