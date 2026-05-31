/**
 * ============================================================
 *  api.events.js — Events Service | Teatro Eventual
 *  Base URL: https://service.events.nebula.andrescortes.dev
 * ============================================================
 */

const EVENTS_URL = 'https://service.events.nebula.andrescortes.dev';

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
  const url = `${EVENTS_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...buildHeaders(auth), ...(options.headers || {}) },
    });

    let body = null;
    const contentType = response.headers.get('Content-Type') || '';

    if (contentType.includes('application/json')) {
      body = await response.json();
    } else {
      const text = await response.text();
      body = { success: false, message: text || 'Respuesta inesperada', data: null };
    }

    return {
      success: body.success ?? response.ok,
      message: body.message ?? '',
      data:    body.data    ?? null,
      body,                        // respuesta completa por si el backend no usa body.data
      status:  response.status,
    };

  } catch (err) {
    console.error('[API Events] Error de red:', err);
    return { success: false, message: 'Sin conexión. Verifica tu red.', data: null, status: 0 };
  }
}

// ── Obras ──────────────────────────────────────────────────

/** GET /api/play — Listar todas las obras */
export async function getPlays() {
  return request('/api/play', { method: 'GET' });
}

/** GET /api/play/{id} — Ver obra por ID */
export async function getPlay(id) {
  return request(`/api/play/${id}`, { method: 'GET' });
}

// ── Funciones ──────────────────────────────────────────────

/** GET /api/performance — Listar todas las funciones */
export async function getPerformances() {
  return request('/api/performance', { method: 'GET' });
}

/** GET /api/performance/{id} — Ver función por ID */
export async function getPerformance(id) {
  return request(`/api/performance/${id}`, { method: 'GET' });
}

/** GET /api/performance/{id}/seats — Mapa de asientos */
export async function getPerformanceSeats(id) {
  return request(`/api/performance/${id}/seats`, { method: 'GET' });
}

// ── Pagos ──────────────────────────────────────────────────

/** GET /api/payment/config — Obtener publishableKey de Stripe */
export async function getPaymentConfig() {
  return request('/api/payment/config', { method: 'GET' }, true);
}

/** POST /api/payment/create-intent — Crear PaymentIntent */
export async function createPaymentIntent({ performanceId, ticketCount }) {
  return request('/api/payment/create-intent', {
    method: 'POST',
    body: JSON.stringify({ performanceId, ticketCount }),
  }, true);
}

// ── Compras ────────────────────────────────────────────────

/** POST /api/purchase — Crear compra */
export async function createPurchase({ performanceId, seatNumbers, paymentMethod, stripePaymentId }) {
  return request('/api/purchase', {
    method: 'POST',
    body: JSON.stringify({ performanceId, seatNumbers, paymentMethod, stripePaymentId }),
  }, true);
}

/** GET /api/purchase/my — Mis compras */
export async function getMyPurchases() {
  return request('/api/purchase/my', { method: 'GET' }, true);
}

// ── Tickets ────────────────────────────────────────────────

/** GET /api/ticket/my — Mis tickets */
export async function getMyTickets() {
  return request('/api/ticket/my', { method: 'GET' }, true);
}

/** GET /api/ticket/{id} — Ver ticket por ID */
export async function getTicket(id) {
  return request(`/api/ticket/${id}`, { method: 'GET' }, true);
}

// ── PQRS ───────────────────────────────────────────────────

/** GET /api/pqrs/my — Mis PQRS */
export async function getMyPqrs() {
  return request('/api/pqrs/my', { method: 'GET' }, true);
}

/** POST /api/pqrs — Crear PQRS */
export async function createPqrs({ subject, description, type }) {
  return request('/api/pqrs', {
    method: 'POST',
    body: JSON.stringify({ subject, description, type }),
  }, true);
}

// ── Favoritos ──────────────────────────────────────────────

/** GET /api/favorite — Mis favoritos */
export async function getMyFavorites() {
  return request('/api/favorite', { method: 'GET' }, true);
}

/** POST /api/favorite — Agregar favorito */
export async function addFavorite(playId) {
  return request('/api/favorite', {
    method: 'POST',
    body: JSON.stringify({ playId }),
  }, true);
}

/** DELETE /api/favorite/{id} — Eliminar favorito (id del favorito, no de la obra) */
export async function removeFavorite(favoriteId) {
  return request(`/api/favorite/${favoriteId}`, { method: 'DELETE' }, true);
}