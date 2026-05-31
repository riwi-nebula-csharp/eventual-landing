/**
 * ============================================================
 *  auth.js — Estado de sesión | Teatro Eventual
 * ============================================================
 */

import { login as apiLogin, register as apiRegister, logout as apiLogout, me } from './api.js';

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

let _user  = null;
let _token = null;

const _listeners = new Set();

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
  try { _user = raw ? JSON.parse(raw) : null; }
  catch { _user = null; }
}

function _notify() {
  for (const fn of _listeners) {
    try { fn(getUser()); } catch (e) { console.error('[Auth] listener error:', e); }
  }
}

export async function initAuth() {
  loadFromStorage();
  if (!_token) return false;

  const res = await me();

  if (res.success) {
    _user = res.data?.user ?? res.data;
    localStorage.setItem(USER_KEY, JSON.stringify(_user));
    return true;
  }

  clearSession();
  return false;
}

export async function login({ email, password }) {
  const res = await apiLogin({ email, password });
  if (res.success && res.data?.token) {
    saveSession(res.data.token, res.data.user);
    _notify();
  }
  return { success: res.success, message: res.message, user: res.data?.user ?? null };
}

export async function register({ name, email, password, password_confirmation, phone }) {
  const res = await apiRegister({ name, email, password, password_confirmation, phone });
  if (res.success && res.data?.token) {
    saveSession(res.data.token, res.data.user);
    _notify();
  }
  return { success: res.success, message: res.message, user: res.data?.user ?? null };
}

export async function logout() {
  await apiLogout();
  clearSession();
  _notify();
}

export function getUser()          { return _user ? { ..._user } : null; }
export function getToken()         { return _token; }
export function isAuthenticated()  { return Boolean(_token && _user); }
export function hasRole(role)      { return _user?.role === role; }

export function onAuthChange(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}
