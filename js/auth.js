/**
 * ============================================================
 *  auth.js — Estado de sesión | Teatro Eventual
 * ============================================================
 *  Responsabilidades:
 *   - Guardar / leer / borrar el token de localStorage
 *   - Mantener el usuario actual en memoria
 *   - Exponer helpers reactivos (onAuthChange)
 *   - Wrappers de login/register/logout con side-effects
 * ============================================================
 */

import { login as apiLogin, register as apiRegister, logout as apiLogout, me } from './api.js';

// ── Claves de almacenamiento ──────────────────────────────────
const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

// ── Estado en memoria ─────────────────────────────────────────
let _user  = null;
let _token = null;

// Listeners para reaccionar a cambios de sesión
// Se registran con onAuthChange(fn) y se llaman con _notify()
const _listeners = new Set();

// ── Helpers de storage ────────────────────────────────────────

function saveSession(token, user) {
  _token = token;
  _user  = user;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY,  JSON.stringify(user));
}

function clearSession() {
  _token = null;
  _user  = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function loadFromStorage() {
  _token = localStorage.getItem(TOKEN_KEY) ?? null;
  const raw = localStorage.getItem(USER_KEY);
  try {
    _user = raw ? JSON.parse(raw) : null;
  } catch {
    _user = null;
  }
}

// ── Notificar a listeners ─────────────────────────────────────

function _notify() {
  for (const fn of _listeners) {
    try { fn(getUser()); } catch (e) { console.error('[Auth] listener error:', e); }
  }
}

// ─────────────────────────────────────────────────────────────
//  API PÚBLICA
// ─────────────────────────────────────────────────────────────

/**
 * Inicializa el módulo.
 * Llama esto UNA VEZ al arrancar la app (en app.js).
 * Si hay token guardado, verifica con el servidor que siga válido.
 *
 * @returns {Promise<boolean>} true si hay sesión activa válida
 */
export async function initAuth() {
  loadFromStorage();

  if (!_token) return false;

  // Verificamos con el servidor que el token siga vigente
  const res = await me();

  if (res.success) {
    _user = res.data.user;
    localStorage.setItem(USER_KEY, JSON.stringify(_user));
    return true;
  }

  // Token expirado o inválido → limpiamos
  clearSession();
  return false;
}

/**
 * Inicia sesión y guarda la sesión localmente.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ success: boolean, message: string, user?: object }>}
 */
export async function login({ email, password }) {
  const res = await apiLogin({ email, password });

  if (res.success && res.data?.token) {
    saveSession(res.data.token, res.data.user);
    _notify();
  }

  return {
    success: res.success,
    message: res.message,
    user:    res.data?.user ?? null,
  };
}

/**
 * Registra un nuevo usuario e inicia sesión automáticamente.
 *
 * @param {{ name, email, password, password_confirmation, phone? }} payload
 * @returns {Promise<{ success: boolean, message: string, user?: object }>}
 */
export async function register({ name, email, password, password_confirmation, phone }) {
  const res = await apiRegister({ name, email, password, password_confirmation, phone });

  if (res.success && res.data?.token) {
    saveSession(res.data.token, res.data.user);
    _notify();
  }

  return {
    success: res.success,
    message: res.message,
    user:    res.data?.user ?? null,
  };
}

/**
 * Cierra la sesión en el servidor y limpia el estado local.
 *
 * @returns {Promise<void>}
 */
export async function logout() {
  await apiLogout();   // Intentamos notificar al servidor (no bloqueamos si falla)
  clearSession();
  _notify();
}

// ── Getters ───────────────────────────────────────────────────

/** Retorna el usuario actual (o null si no hay sesión). */
export function getUser() {
  return _user ? { ..._user } : null;   // copia defensiva
}

/** Retorna el token actual (o null). */
export function getToken() {
  return _token;
}

/** true si hay sesión activa. */
export function isAuthenticated() {
  return Boolean(_token && _user);
}

/** true si el usuario tiene el rol indicado. */
export function hasRole(role) {
  return _user?.role === role;
}

/**
 * Registra un callback que se ejecuta cada vez que cambia la sesión
 * (login, logout, register).
 *
 * @param {(user: object|null) => void} fn
 * @returns {() => void} función para cancelar la suscripción
 *
 * @example
 * const unsub = onAuthChange((user) => {
 *   if (user) console.log('Bienvenido', user.name);
 *   else console.log('Sesión cerrada');
 * });
 *
 * // Para cancelar:
 * unsub();
 */
export function onAuthChange(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}