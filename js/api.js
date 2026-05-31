/**
 * ============================================================
 *  api.js — Auth Service | Teatro Eventual
 *  Base URL: https://service.auth.nebula.andrescortes.dev
 * ============================================================
 */

const AUTH_URL = 'https://service.auth.nebula.andrescortes.dev';

function buildHeaders(requiresAuth = false, isFormData = false) {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
    headers['Accept']       = 'application/json';
  } else {
    headers['Accept'] = 'application/json';
  }
  if (requiresAuth) {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}, auth = false, isFormData = false) {
  const url = `${AUTH_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...buildHeaders(auth, isFormData), ...(options.headers || {}) },
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
      errors:  body.errors ?? null,
      status:  response.status,
    };

  } catch (err) {
    console.error('[API Auth] Error de red:', err);
    return { success: false, message: 'Sin conexión. Verifica tu red.', data: null, status: 0 };
  }
}

// ── Autenticación pública ──────────────────────────────────

export async function register({ name, email, password, password_confirmation, phone = null }) {
  const body = { name, email, password, password_confirmation };
  if (phone) body.phone = phone;
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

export async function login({ email, password }) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
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
  return request('/api/auth/password/forgot', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function resetPassword({ token, password, password_confirmation }) {
  return request('/api/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ token, password, password_confirmation }),
  });
}

// ── Autenticación protegida ────────────────────────────────

export async function me() {
  return request('/api/profile', { method: 'GET' }, true);
}

export async function logout() {
  return request('/api/auth/logout', { method: 'POST' }, true);
}

export async function updateProfile(payload) {
  return request('/api/profile', { method: 'PUT', body: JSON.stringify(payload) }, true);
}

export async function uploadAvatar(formData) {
  return request('/api/profile/avatar', { method: 'POST', body: formData }, true, true);
}
