/**
 * ============================================================
 *  api.js — Capa de servicios | Teatro Eventual
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
//  URLs base
// ─────────────────────────────────────────────────────────────

const AUTH_URL   = 'https://service.auth.nebula.andrescortes.dev';
const EVENTS_URL = 'https://service.events.nebula.andrescortes.dev';

// ─────────────────────────────────────────────────────────────
//  Helpers internos
// ─────────────────────────────────────────────────────────────

function buildHeaders(requiresAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  };
  if (requiresAuth) {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(baseUrl, endpoint, options = {}, auth = false) {
  const url = `${baseUrl}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: buildHeaders(auth),
    });

    let body = null;
    const contentType = response.headers.get('Content-Type') || '';

    if (contentType.includes('application/json')) {
      body = await response.json();
    } else {
      const text = await response.text();
      body = { success: false, message: text || 'Respuesta inesperada del servidor', data: null };
    }

    return {
      success: body.success ?? response.ok,
      message: body.message ?? '',
      data:    body.data    ?? null,
      errors:  body.errors  ?? null,
      status:  response.status,
    };

  } catch (err) {
    console.error('[API] Error de red:', err);
    return {
      success: false,
      message: 'Sin conexión. Verifica tu red e intenta de nuevo.',
      data:    null,
      status:  0,
    };
  }
}

// Shortcuts para cada base URL
const auth   = (endpoint, options, needsAuth) => request(AUTH_URL,   endpoint, options, needsAuth);
const events = (endpoint, options, needsAuth) => request(EVENTS_URL, endpoint, options, needsAuth);

// ─────────────────────────────────────────────────────────────
//  1. AUTENTICACIÓN PÚBLICA
// ─────────────────────────────────────────────────────────────

export async function register({ name, email, password, password_confirmation, phone = null }) {
  const body = { name, email, password, password_confirmation };
  if (phone) body.phone = phone;
  return auth('/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

export async function login({ email, password }) {
  return auth('/api/auth/login', {
    method: 'POST',
    body:   JSON.stringify({ email, password }),
  });
}

export async function loginWithGoogle() {
  const res = await auth('/api/auth/google/redirect', { method: 'GET' });
  if (res.success && res.data?.url) {
    window.location.href = res.data.url;
  } else {
    console.error('[API] No se pudo obtener la URL de Google:', res.message);
  }
}

export async function forgotPassword({ email }) {
  return auth('/api/auth/password/forgot', {
    method: 'POST',
    body:   JSON.stringify({ email }),
  });
}

export async function resetPassword({ token, email, password, password_confirmation }) {
  return auth('/api/auth/password/reset', {
    method: 'POST',
    body:   JSON.stringify({ token, email, password, password_confirmation }),
  });
}

// ─────────────────────────────────────────────────────────────
//  2. AUTENTICACIÓN PROTEGIDA
// ─────────────────────────────────────────────────────────────

export async function me() {
  return auth('/api/profile', { method: 'GET' }, true);
}

export async function logout() {
  return auth('/api/auth/logout', { method: 'POST' }, true);
}

export async function updateProfile(payload) {
  return auth('/api/profile', {
    method: 'PUT',
    body:   JSON.stringify(payload),
  }, true);
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  const token = localStorage.getItem('auth_token');
  const headers = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const response = await fetch(`${AUTH_URL}/api/profile/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });
    let body = null;
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      body = await response.json();
    } else {
      const text = await response.text();
      body = { success: false, message: text || 'Respuesta inesperada del servidor', data: null };
    }
    return {
      success: body.success ?? response.ok,
      message: body.message ?? '',
      data:    body.data    ?? null,
      errors:  body.errors  ?? null,
      status:  response.status,
    };
  } catch (err) {
    console.error('[API] Error de red (uploadAvatar):', err);
    return { success: false, message: 'Sin conexión. Verifica tu red e intenta de nuevo.', data: null, status: 0 };
  }
}

export async function changePassword({ current_password, password, password_confirmation }) {
  return auth('/api/auth/password', {
    method: 'PUT',
    body:   JSON.stringify({ current_password, password, password_confirmation }),
  }, true);
}

// ─────────────────────────────────────────────────────────────
//  3. VERIFICACIÓN DE EMAIL
// ─────────────────────────────────────────────────────────────

export async function resendVerificationEmail() {
  return auth('/api/auth/email/resend', { method: 'POST' }, true);
}

export async function verifyEmail({ code }) {
  return auth('/api/auth/email/verify', {
    method: 'POST',
    body:   JSON.stringify({ code }),
  }, true);
}

// ─────────────────────────────────────────────────────────────
//  4. OBRAS — /api/play
// ─────────────────────────────────────────────────────────────

export async function getPlays() {
  const res = await events('/api/play');
  if (!res.success) throw new Error(res.message);
  return res.data;
}

export async function getPlayById(id) {
  const res = await events(`/api/play/${id}`);
  if (!res.success) throw new Error(res.message);
  return res.data;
}

// ─────────────────────────────────────────────────────────────
//  5. FUNCIONES — /api/performance
// ─────────────────────────────────────────────────────────────

export async function getPerformances() {
  const res = await events('/api/performance');
  if (!res.success) throw new Error(res.message);
  return res.data;
}

export async function getPerformanceById(id) {
  const res = await events(`/api/performance/${id}`);
  if (!res.success) throw new Error(res.message);
  return res.data;
}

export async function getSeatMap(performanceId) {
  const res = await events(`/api/performance/${performanceId}/seats`);
  if (!res.success) throw new Error(res.message);
  return res.data;
}