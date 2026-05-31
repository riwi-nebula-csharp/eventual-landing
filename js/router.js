/**
 * ============================================================
 *  router.js — Enrutador SPA | Teatro Eventual
 * ============================================================
 */

import { isAuthenticated }    from './auth.js';
import { renderHome }         from './view/home.js';
import { renderLogin }        from './view/login.js';
import { renderRegister }     from './view/register.js';
import { renderCallback }     from './view/callback.js';
import { renderPlays }        from './view/plays.js';
import { renderPerformances } from './view/performances.js';
import { renderSeats }        from './view/seats.js';
import { renderTickets }      from './view/tickets.js';
import { renderPqrs }         from './view/pqrs.js';
import { renderProfile }      from './view/profile.js';

const APP_CONTAINER = '#app';

// ── Rutas ─────────────────────────────────────────────────
// :param captura segmentos dinámicos
const routes = [
  { pattern: '/',                      render: renderHome,         guard: null    },
  { pattern: 'login',                  render: renderLogin,        guard: 'guest' },
  { pattern: 'register',               render: renderRegister,     guard: 'guest' },
  { pattern: 'auth/callback',          render: renderCallback,     guard: null    },
  { pattern: 'cartelera',              render: renderPlays,        guard: 'auth'  },
  { pattern: 'obras/:id/funciones',    render: renderPerformances, guard: 'auth'  },
  { pattern: 'funciones/:id/asientos', render: renderSeats,        guard: 'auth'  },
  { pattern: 'mis-tickets',            render: renderTickets,      guard: 'auth'  },
  { pattern: 'pqrs',                   render: renderPqrs,         guard: 'auth'  },
  { pattern: 'perfil',                 render: renderProfile,      guard: 'auth'  },
];

// ── Param parser ──────────────────────────────────────────
function matchRoute(path) {
  for (const route of routes) {
    const patternParts = route.pattern.split('/');
    const pathParts    = path.split('/');
    if (patternParts.length !== pathParts.length) continue;

    const params = {};
    let match = true;
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }
    if (match) return { route, params };
  }
  return null;
}

// ── 404 ───────────────────────────────────────────────────
function renderNotFound() {
  return `
    <section style="min-height:100vh;display:flex;flex-direction:column;
                    align-items:center;justify-content:center;text-align:center;
                    background:#0A0A0A;color:#F5F1E8;padding:1.5rem;">
      <p style="color:#D4AF37;font-size:10px;letter-spacing:0.4em;
                text-transform:uppercase;margin-bottom:1rem;">Error 404</p>
      <h1 style="font-family:'Playfair Display',serif;font-size:4rem;margin-bottom:1rem;">
        Página no encontrada
      </h1>
      <p style="color:#A9A9B3;margin-bottom:2rem;">La función que buscas no está en cartelera.</p>
      <a href="#/"
         style="padding:0.75rem 2rem;background:#6B111D;color:#fff;
                font-size:11px;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;">
        Volver al inicio
      </a>
    </section>`;
}

// ── Loader ────────────────────────────────────────────────
function renderLoader() {
  return `
    <div style="min-height:100vh;display:flex;align-items:center;
                justify-content:center;background:#0A0A0A;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
        <span class="material-symbols-outlined animate-spin" style="color:#D4AF37;font-size:2rem;">
          progress_activity
        </span>
        <p style="color:#A9A9B3;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;">
          Cargando...
        </p>
      </div>
    </div>`;
}

// ── Navegación programática ───────────────────────────────
export function navigate(path) {
  window.location.hash = path === '/' ? '/' : `/${path}`;
}

// ── Resolver ruta actual ──────────────────────────────────
async function resolve() {
  const app = document.querySelector(APP_CONTAINER);
  if (!app) return;

  const hash = window.location.hash.replace(/^#\/?/, '');
  const path = hash === '' ? '/' : hash;

  const matched = matchRoute(path);

  if (!matched) {
    app.innerHTML = renderNotFound();
    return;
  }

  const { route, params } = matched;
  const authed = isAuthenticated();

  if (route.guard === 'auth' && !authed) {
    navigate('login');
    return;
  }

  if (route.guard === 'guest' && authed) {
    navigate('cartelera');
    return;
  }

  app.innerHTML = renderLoader();

  try {
    const html = await route.render(params);
    app.innerHTML = html;
    app.dispatchEvent(new CustomEvent('view:mounted', { detail: { path, params } }));
  } catch (err) {
    console.error('[Router] Error al renderizar:', err);
    app.innerHTML = `
      <section style="min-height:100vh;display:flex;align-items:center;
                      justify-content:center;background:#0A0A0A;color:#F5F1E8;text-align:center;padding:1.5rem;">
        <div>
          <p style="color:#D4AF37;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;margin-bottom:1rem;">Error</p>
          <h2 style="font-family:'Playfair Display',serif;font-size:2rem;margin-bottom:1rem;">Algo salió mal</h2>
          <p style="color:#A9A9B3;margin-bottom:2rem;">${err.message}</p>
          <a href="#/" style="color:#D4AF37;text-decoration:underline;">Volver al inicio</a>
        </div>
      </section>`;
  }
}

export function initRouter() {
  window.addEventListener('hashchange', resolve);
  resolve();
}
