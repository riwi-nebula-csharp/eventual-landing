/**
 * ============================================================
 *  view/detail.js — Detalle de Obra | Teatro Eventual
 *  Muestra info de la obra + listado de funciones on_sale
 * ============================================================
 */

import { navigate }                  from '../router.js';
import { getPlayById, getPerformances } from '../api.js';
import { isAuthenticated, getUser, logout } from '../auth.js';

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(n);
}

function formatDateLong(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatTime(hms) {
  return hms ? hms.slice(0, 5) : '';
}

function badgeHTML(status) {
  const map = {
    on_sale:   { label: 'EN VENTA',     cls: 't-card__badge--on-sale'  },
    sold_out:  { label: 'AGOTADO',      cls: 't-card__badge--sold-out' },
    scheduled: { label: 'PRÓXIMAMENTE', cls: 't-card__badge--scheduled'},
    finished:  { label: 'FINALIZADA',   cls: 't-card__badge--finished' },
  };
  const s = map[status] ?? map['scheduled'];
  return `<span class="t-card__badge ${s.cls}">${s.label}</span>`;
}

function perfItemHTML(perf) {
  const date  = formatDateLong(perf.performanceDate);
  const start = formatTime(perf.startTime);
  const end   = formatTime(perf.endTime);
  const price = formatCOP(perf.ticketPrice);

  return `
    <div class="t-perf-item">
      <div class="t-perf-item__info">
        <p class="t-perf-item__date" style="text-transform:capitalize;">${date}</p>
        <p class="t-perf-item__time">
          <span class="material-symbols-outlined" style="font-size:14px;color:var(--c-gold);">schedule</span>
          ${start} – ${end} hrs
        </p>
      </div>
      <div style="display:flex;align-items:center;gap:20px;flex-shrink:0;">
        <span class="t-perf-item__price">${price}</span>
        <button
          class="t-btn t-btn--primary"
          style="white-space:nowrap;"
          data-perf-id="${perf.id}"
        >
          <span class="material-symbols-outlined" style="font-size:16px;">confirmation_number</span>
          Comprar
        </button>
      </div>
    </div>`;
}

function noPerfsHTML() {
  return `
    <div class="t-perf-empty">
      <span class="material-symbols-outlined t-perf-empty__icon">event_busy</span>
      <p class="t-perf-empty__text">No hay funciones disponibles en este momento.</p>
      <p style="font-size:12px;margin-top:6px;opacity:.45;">
        Revisa más adelante — pronto se abrirá la venta de nuevas funciones.
      </p>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
//  Render principal
// ─────────────────────────────────────────────────────────────

export async function renderDetail(playId) {

  // ── 1. Fetch ──────────────────────────────────────────────
  let obra       = null;
  let onSalePerfs = [];
  let errorMsg   = null;

  try {
    const [obraData, allPerfs] = await Promise.all([
      getPlayById(playId),
      getPerformances(),
    ]);
    obra = obraData;
    onSalePerfs = allPerfs
      .filter(p => p.playId === Number(playId) && p.status === 'on_sale')
      .sort((a, b) => new Date(a.performanceDate) - new Date(b.performanceDate));
  } catch (e) {
    errorMsg = e.message;
  }

  // ── 2. Handlers post-mount ────────────────────────────────
  const app = document.querySelector('#app');
  if (app) {
    app.addEventListener('view:mounted', ({ detail }) => {
      if (detail?.path !== `play/${playId}`) return;

      // Botón volver
      document.getElementById('btn-back-detail')?.addEventListener('click', () => {
        navigate('cartelera');
      });

      // Logout
      document.getElementById('btn-logout-detail')?.addEventListener('click', async () => {
        await logout();
        navigate('/');
      });

      // Profile
      document.getElementById('btn-profile-detail')?.addEventListener('click', () => {
        navigate('dashboard');
      });

      // Botones comprar — si no está autenticado, redirige a login
      document.querySelectorAll('[data-perf-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (!isAuthenticated()) {
            window.showToast?.('Debes iniciar sesión para comprar entradas.', 'info');
            navigate('login');
            return;
          }
          const perfId = btn.dataset.perfId;
          window.showToast?.(`Compra para función #${perfId} — próximamente disponible.`, 'info');
        });
      });

    }, { once: true });
  }

  // ── 3. Error de carga ─────────────────────────────────────
  if (errorMsg || !obra) {
    return `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
                  flex-direction:column;gap:16px;padding:40px;text-align:center;">
        <span class="material-symbols-outlined" style="font-size:48px;color:#ef4444;">error</span>
        <p style="color:var(--c-text-muted);font-size:16px;">No se pudo cargar la obra.</p>
        <p style="font-size:12px;color:rgba(255,255,255,.3);">${errorMsg ?? 'Obra no encontrada'}</p>
        <button id="btn-back-detail"
                class="t-btn t-btn--ghost"
                style="margin-top:8px;padding:12px 24px;border-radius:8px;">
          <span class="material-symbols-outlined" style="font-size:16px;">arrow_back</span>
          Volver a Cartelera
        </button>
      </div>`;
  }

  // ── 4. Template ───────────────────────────────────────────
  const posterUrl = obra.posterUrl
    || `https://placehold.co/1280x720/1d1b20/e7c365?text=${encodeURIComponent(obra.name)}`;
  const user = getUser();

  return `
    <!-- ── NAV ───────────────────────────────────────────────── -->
    <nav class="t-nav">
      <a href="#/cartelera" class="t-nav__logo">
        <svg class="t-nav__logo-icon" fill="none" stroke="currentColor"
             stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M2 10l10-7 10 7M10 14h4"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="t-nav__logo-text">
          <span>Teatro</span><span>Eventual</span>
        </div>
      </a>
      <div class="t-nav__links">
        <a href="#/cartelera" class="t-nav__link t-nav__link--active">Cartelera</a>
      </div>
      <div class="t-nav__actions">
        <button id="btn-back-detail" class="t-back-btn">
          <span class="material-symbols-outlined" style="font-size:16px;">arrow_back</span>
          Volver
        </button>
        ${user ? `
        <button id="btn-profile-detail" class="t-btn t-btn--outline"
                style="padding:8px 14px;font-size:9px;display:flex;align-items:center;gap:6px;">
          <span class="material-symbols-outlined" style="font-size:16px;">person</span>
          <span style="display:none;" class="md-show">${user.name?.split(' ')[0] ?? 'Mi cuenta'}</span>
        </button>
        <button id="btn-logout-detail" class="t-btn t-btn--ghost"
                style="padding:8px 14px;font-size:9px;display:flex;align-items:center;gap:6px;">
          <span class="material-symbols-outlined" style="font-size:16px;">logout</span>
        </button>` : ''}
      </div>
    </nav>

    <!-- ── HERO ──────────────────────────────────────────────── -->
    <div style="padding-top:var(--nav-h);">
    <div class="t-detail-hero">
      <img class="t-detail-hero__img"
           src="${posterUrl}"
           alt="${obra.name}"
           onerror="this.src='https://placehold.co/1280x720/1d1b20/e7c365?text=${encodeURIComponent(obra.name)}'">
      <div class="t-detail-hero__overlay"></div>
      <div class="t-detail-hero__content t-fade-up">
        ${badgeHTML(onSalePerfs.length > 0 ? 'on_sale' : 'scheduled')}
        <h1 class="t-detail-hero__title">${obra.name}</h1>
        ${onSalePerfs.length > 0 ? `
        <div class="t-detail-hero__meta">
          <div class="t-detail-hero__meta-item">
            <span class="material-symbols-outlined t-detail-hero__meta-icon">event</span>
            Próxima: ${formatDateLong(onSalePerfs[0].performanceDate)}
          </div>
          <div class="t-detail-hero__meta-item">
            <span class="material-symbols-outlined t-detail-hero__meta-icon">confirmation_number</span>
            Desde ${formatCOP(onSalePerfs[0].ticketPrice)}
          </div>
        </div>` : ''}
      </div>
    </div>
    </div>

    <!-- ── BODY ──────────────────────────────────────────────── -->
    <div class="t-detail-body">

      <!-- Sinopsis -->
      <div class="t-detail-synopsis t-fade-up t-delay-1">
        <h2>Sinopsis</h2>
        <p>${obra.description || 'Descripción no disponible para esta obra.'}</p>
      </div>

      <!-- Sidebar: funciones -->
      <aside class="t-fade-up t-delay-2">
        <p class="t-detail-sidebar__title">Funciones disponibles</p>
        <div class="t-perf-list">
          ${onSalePerfs.length > 0
            ? onSalePerfs.map(perfItemHTML).join('')
            : noPerfsHTML()
          }
        </div>
      </aside>

    </div>
  `;
}
