/**
 * ============================================================
 *  router.js — Enrutador SPA | Teatro Eventual
 * ============================================================
 */

import { isAuthenticated } from './auth.js';
import { renderHome }      from './view/home.js';
import { renderLogin }     from './view/login.js';
import { renderRegister }  from './view/register.js';
import { renderDashboard } from './view/dashboard.js';

// ── Contenedor principal ──────────────────────────────────────
const APP_CONTAINER = '#app';

// ── Rutas ─────────────────────────────────────────────────────
const routes = [
  { path: '/',         render: renderHome,      guard: null    },
  { path: 'login',     render: renderLogin,     guard: 'guest' },
  { path: 'register',  render: renderRegister,  guard: 'guest' },
  { path: 'dashboard', render: renderDashboard, guard: 'auth'  },
];

// ── 404 ───────────────────────────────────────────────────────
function renderNotFound() {
  return `
    <section style="min-height:100vh; display:flex; flex-direction:column;
                    align-items:center; justify-content:center; text-align:center;
                    background:#0A0A0A; color:#F5F1E8; padding: 1.5rem;">
      <p style="color:#D4AF37; font-size:10px; letter-spacing:0.4em;
                text-transform:uppercase; margin-bottom:1rem;">Error 404</p>
      <h1 style="font-family:'Playfair Display',serif; font-size:4rem; margin-bottom:1rem;">
        Página no encontrada
      </h1>
      <p style="color:#A9A9B3; margin-bottom:2rem;">
        La función que buscas no está en cartelera.
      </p>
      <a href="#/"
         style="padding:0.75rem 2rem; background:#6B111D; color:#fff;
                font-size:11px; letter-spacing:0.15em; text-transform:uppercase;
                text-decoration:none;">
        Volver al inicio
      </a>
    </section>`;
}

// ── Loader ────────────────────────────────────────────────────
function renderLoader() {
  return `
    <div style="min-height:100vh; display:flex; align-items:center;
                justify-content:center; background:#0A0A0A;">
      <div style="display:flex; flex-direction:column; align-items:center; gap:1rem;">
        <span class="material-symbols-outlined"
              style="color:#D4AF37; font-size:2rem; animation:spin 1s linear infinite;">
          progress_activity
        </span>
        <p style="color:#A9A9B3; font-size:11px; letter-spacing:0.3em; text-transform:uppercase;">
          Cargando...
        </p>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
//  Navegación programática
// ─────────────────────────────────────────────────────────────

/**
 * Navega a una ruta cambiando el hash.
 * @param {string} path  - Ej: '/', 'login', 'dashboard'
 */
export function navigate(path) {
  window.location.hash = path === '/' ? '/' : `/${path}`;
}

// ─────────────────────────────────────────────────────────────
//  Resolver ruta actual
// ─────────────────────────────────────────────────────────────

async function resolve() {
  const app = document.querySelector(APP_CONTAINER);
  if (!app) {
    console.error(`[Router] No se encontró "${APP_CONTAINER}" en el DOM.`);
    return;
  }

  // '#/login' → 'login' | '#/' → '/'
  const hash = window.location.hash.replace(/^#\/?/, '');
  const path = hash === '' ? '/' : hash;

  // Buscar ruta
  const route = routes.find(r => r.path === path);

  if (!route) {
    app.innerHTML = renderNotFound();
    return;
  }

  // Guards
  const authed = isAuthenticated();

  if (route.guard === 'auth' && !authed) {
    navigate('login');
    return;
  }

  if (route.guard === 'guest' && authed) {
    navigate('dashboard');
    return;
  }

  // Mostrar loader mientras renderiza
  app.innerHTML = renderLoader();

  try {
    const html = await route.render();
    app.innerHTML = html;

    // Las vistas escuchan este evento para enganchar sus handlers
    app.dispatchEvent(new CustomEvent('view:mounted', { detail: { path } }));

  } catch (err) {
    console.error('[Router] Error al renderizar:', err);
    app.innerHTML = `
      <section style="min-height:100vh; display:flex; align-items:center;
                      justify-content:center; background:#0A0A0A;
                      color:#F5F1E8; text-align:center; padding:1.5rem;">
        <div>
          <p style="color:#D4AF37; font-size:10px; letter-spacing:0.4em;
                    text-transform:uppercase; margin-bottom:1rem;">Error</p>
          <h2 style="font-family:'Playfair Display',serif; font-size:2rem; margin-bottom:1rem;">
            Algo salió mal
          </h2>
          <p style="color:#A9A9B3; margin-bottom:2rem;">${err.message}</p>
          <a href="#/" style="color:#D4AF37; text-decoration:underline;">Volver al inicio</a>
        </div>
      </section>`;
  }
}

// ─────────────────────────────────────────────────────────────
//  Inicialización
// ─────────────────────────────────────────────────────────────

/**
 * Inicia el router. Llamar UNA VEZ desde app.js.
 */
export function initRouter() {
  window.addEventListener('hashchange', resolve);
  resolve();
}