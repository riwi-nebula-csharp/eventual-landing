/**
 * ============================================================
 *  view/callback.js — Captura token OAuth de Google
 * ============================================================
 *  Se activa cuando el backend redirige a:
 *  https://tu-dominio.com/#/auth/callback?token=eyJ...
 * ============================================================
 */

import { navigate } from '../router.js';
import { me }       from '../api.js';

export async function renderCallback() {

  // Leer token de la query string
  const params = new URLSearchParams(window.location.search);
  const token  = params.get('token');

  if (!token) {
    console.warn('[Callback] No se encontró token en la URL.');
    navigate('/');
    return '<div></div>';
  }

  // Guardar token
  localStorage.setItem('auth_token', token);

  // Traer datos del usuario con el token recién guardado
  const res = await me();

  if (res.success) {
    localStorage.setItem('auth_user', JSON.stringify(res.data));
  } else {
    console.warn('[Callback] No se pudo obtener el usuario:', res.message);
  }

  // Redirigir al inicio
  navigate('/');
  return '<div></div>';
}