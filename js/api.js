/**
 * ============================================================
 *  api.js — Capa de servicios | Teatro Eventual
 *  Base URL: https://service.auth.nebula.andrescortes.dev
 * ============================================================
 */

const BASE_URL = 'https://service.auth.nebula.andrescortes.dev';

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

async function request(endpoint, options = {}, auth = false) {
  const url = `${BASE_URL}${endpoint}`;
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
      data:    body.data   ?? null,
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

// ─────────────────────────────────────────────────────────────
//  1. AUTENTICACIÓN PÚBLICA
// ─────────────────────────────────────────────────────────────

export async function register({ name, email, password, password_confirmation, phone = null }) {
  const body = { name, email, password, password_confirmation };
  if (phone) body.phone = phone;
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

export async function login({ email, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    body:   JSON.stringify({ email, password }),
  });
}

export async function loginWithGoogle() {
  const res = await request('/api/auth/google/redirect', { method: 'GET' });
  if (res.success && res.data?.url) {
    window.location.href = res.data.url;
  } else {
    console.error('[API] No se pudo obtener la URL de Google:', res.message);
  }
}

export async function forgotPassword({ email }) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    body:   JSON.stringify({ email }),
  });
}

export async function resetPassword({ token, email, password, password_confirmation }) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body:   JSON.stringify({ token, email, password, password_confirmation }),
  });
}

// ─────────────────────────────────────────────────────────────
//  2. AUTENTICACIÓN PROTEGIDA
// ─────────────────────────────────────────────────────────────

export async function me() {
  return request('/api/auth/me', { method: 'GET' }, true);
}

export async function logout() {
  return request('/api/auth/logout', { method: 'POST' }, true);
}

export async function updateProfile(payload) {
  return request('/api/auth/profile', {
    method: 'PUT',
    body:   JSON.stringify(payload),
  }, true);
}

export async function changePassword({ current_password, password, password_confirmation }) {
  return request('/api/auth/password', {
    method: 'PUT',
    body:   JSON.stringify({ current_password, password, password_confirmation }),
  }, true);
}

// ─────────────────────────────────────────────────────────────
//  3. VERIFICACIÓN DE EMAIL
// ─────────────────────────────────────────────────────────────

export async function resendVerificationEmail() {
  return request('/api/auth/email/resend', { method: 'POST' }, true);
}

export async function verifyEmail({ code }) {
  return request('/api/auth/email/verify', {
    method: 'POST',
    body:   JSON.stringify({ code }),
  }, true);
}