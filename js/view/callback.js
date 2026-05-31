/**
 * ============================================================
 *  view/callback.js — Captura token OAuth de Google
 * ============================================================
 */

import { navigate } from '../router.js';
import { me }       from '../api.js';

export async function renderCallback() {
  const params = new URLSearchParams(window.location.search);
  const token  = params.get('token');

  if (!token) {
    console.warn('[Callback] No se encontró token en la URL.');
    navigate('/');
    return '<div></div>';
  }

  localStorage.setItem('auth_token', token);

  const res = await me();
  if (res.success) {
    const user = res.data?.user ?? res.data;
    localStorage.setItem('auth_user', JSON.stringify(user));
    window.showToast?.(`Bienvenido, ${user?.name ?? ''}`, 'success');
  } else {
    console.warn('[Callback] No se pudo obtener el usuario:', res.message);
  }

  navigate('cartelera');
  return '<div></div>';
}
