import axios from './axios';

export const logVisit = async (data: { path: string; publicationId?: string; userId?: string; referrer?: string }) => {
  try {
    // client-side dedupe: avoid calling server if we recorded a visit recently in this session/localStorage
    const publicationKey = data.publicationId ? `visit_${data.publicationId}` : `visit_path_${data.path}`;

    // create or reuse a session id for per-tab/session dedupe
    let sessionId = sessionStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
      sessionStorage.setItem('visitor_session_id', sessionId);
    }

    // include session id and (if present) auth token prefix to make key specific
    const token = localStorage.getItem('token');
    const tokenPart = token ? `_${token.slice(0,8)}` : '';
    const key = `${publicationKey}_${sessionId}${tokenPart}`;

    const last = Number(localStorage.getItem(key) || '0');
    const now = Date.now();
    const dedupeSeconds = Number((import.meta.env.VITE_VISIT_DEDUPE_SECONDS) || 30);
    if (last && (now - last) < (dedupeSeconds * 1000)) {
      // skip calling server
      return;
    }

    // set timestamp optimistically to avoid race conditions
    try { localStorage.setItem(key, String(now)); } catch {}

    await axios.post('/visits', data);
  } catch (e) {
    // don't block user if logging fails
    console.warn('Failed to log visit', e);
  }
};

export const getVisitStats = async (params?: { publicationId?: string; days?: number }) => {
  const res = await axios.get('/visits/stats', { params });
  return res.data;
};

export default { logVisit, getVisitStats };
