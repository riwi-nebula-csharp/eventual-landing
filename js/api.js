
const BASE_URL = 'https://service.auth.nebula.andrescortes.dev';

// ── Helpers internos ─────────────────────────────────────────

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

/**
 * POST /api/auth/register
 * @param {{ name, email, password, password_confirmation, phone? }} payload
 */
export async function register({ name, email, password, password_confirmation, phone = null }) {
  const body = { name, email, password, password_confirmation };
  if (phone) body.phone = phone;
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

/**
 * POST /api/auth/login
 * @param {{ email, password }} payload
 */
export async function login({ email, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    body:   JSON.stringify({ email, password }),
  });
}

/**
 * GET /api/auth/google/redirect
 * Redirige el navegador al flujo OAuth de Google.
 */
export function loginWithGoogle() {
  window.location.href = `${BASE_URL}/api/auth/google/redirect`;
}

/**
 * POST /api/auth/forgot-password
 * @param {{ email }} payload
 */
export async function forgotPassword({ email }) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    body:   JSON.stringify({ email }),
  });
}

/**
 * POST /api/auth/reset-password
 * @param {{ token, email, password, password_confirmation }} payload
 */
export async function resetPassword({ token, email, password, password_confirmation }) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body:   JSON.stringify({ token, email, password, password_confirmation }),
  });
}

// ─────────────────────────────────────────────────────────────
//  2. AUTENTICACIÓN PROTEGIDA
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/auth/me
 * Retorna los datos del usuario autenticado.
 */
export async function me() {
  return request('/api/auth/me', { method: 'GET' }, true);
}

/**
 * POST /api/auth/logout
 */
export async function logout() {
  return request('/api/auth/logout', { method: 'POST' }, true);
}

/**
 * PUT /api/auth/profile
 * @param {{ name?, phone? }} payload
 */
export async function updateProfile(payload) {
  return request('/api/auth/profile', {
    method: 'PUT',
    body:   JSON.stringify(payload),
  }, true);
}

/**
 * PUT /api/auth/password
 * @param {{ current_password, password, password_confirmation }} payload
 */
export async function changePassword({ current_password, password, password_confirmation }) {
  return request('/api/auth/password', {
    method: 'PUT',
    body:   JSON.stringify({ current_password, password, password_confirmation }),
  }, true);
}

// ─────────────────────────────────────────────────────────────
//  3. VERIFICACIÓN DE EMAIL
// ─────────────────────────────────────────────────────────────

/** POST /api/auth/email/resend */
export async function resendVerificationEmail() {
  return request('/api/auth/email/resend', { method: 'POST' }, true);
}

/**
 * POST /api/auth/email/verify
 * @param {{ code }} payload
 */
export async function verifyEmail({ code }) {
  return request('/api/auth/email/verify', {
    method: 'POST',
    body:   JSON.stringify({ code }),
  }, true);
}