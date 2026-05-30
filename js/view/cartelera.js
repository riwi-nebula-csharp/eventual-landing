/**
 * ============================================================
 *  view/cartelera.js — Cartelera | Gran Teatro
 * ============================================================
 */

import { navigate }                  from '../router.js';
import { getPlays, getPerformances } from '../api.js';
import { getUser, logout }           from '../auth.js';

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function formatDate(perf) {
  if (!perf) return 'Fecha por confirmar';
  const d   = new Date(perf.performanceDate);
  const day = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).toUpperCase();
  return `${day} • ${perf.startTime.slice(0, 5)}`;
}

function formatPrice(perf) {
  if (!perf) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(perf.ticketPrice);
}

function statusBadge(status) {
  const map = {
    on_sale:   { label: 'EN VENTA',      cls: 'bg-green-900/60  text-green-300  border-green-700/40'  },
    sold_out:  { label: 'AGOTADO',       cls: 'bg-red-900/60    text-red-300    border-red-700/40'    },
    scheduled: { label: 'PRÓXIMAMENTE',  cls: 'bg-yellow-900/60 text-yellow-300 border-yellow-700/40' },
    finished:  { label: 'FINALIZADA',    cls: 'bg-surface-container-high text-on-surface-variant border-outline-variant/30' },
  };
  const s = map[status] ?? map['scheduled'];
  return `<span class="px-2 py-0.5 text-[9px] font-label-sm border rounded-sm ${s.cls}">${s.label}</span>`;
}

function nextPerf(playId, funcs) {
  return funcs
    .filter(f => f.playId === playId && f.status !== 'finished')
    .sort((a, b) => new Date(a.performanceDate) - new Date(b.performanceDate))[0] ?? null;
}

function cardHTML(obra, funcs) {
  const perf    = nextPerf(obra.id, funcs);
  const buyable = perf && perf.status === 'on_sale';
  return `
    <div class="group flex flex-col bg-surface-container-low card-inner-glow
                transition-all hover:translate-y-[-4px]"
         data-id="${obra.id}">
      <div class="relative aspect-[2/3] overflow-hidden">
        <img alt="${obra.name}"
             class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
             src="${obra.posterUrl || 'https://placehold.co/400x600/1d1b20/e7c365?text=' + encodeURIComponent(obra.name)}"
             onerror="this.src='https://placehold.co/400x600/1d1b20/e7c365?text=${encodeURIComponent(obra.name)}'">
        <div class="absolute top-4 left-4">
          ${perf ? statusBadge(perf.status) : ''}
        </div>
        ${perf ? `
        <div class="absolute bottom-0 left-0 right-0 p-3
                    bg-gradient-to-t from-black/80 to-transparent">
          <p class="text-tertiary text-label-sm font-label-sm font-bold">${formatPrice(perf)}</p>
        </div>` : ''}
      </div>
      <div class="p-6 flex flex-col flex-grow">
        <h3 class="font-headline-md text-headline-md mb-2 leading-tight uppercase
                   group-hover:text-tertiary transition-colors line-clamp-2">
          ${obra.name}
        </h3>
        ${obra.description ? `
        <p class="text-on-surface-variant text-label-sm font-label-sm mb-4
                  line-clamp-2 leading-relaxed">
          ${obra.description}
        </p>` : ''}
        <div class="space-y-1 mb-6 text-on-surface-variant">
          <div class="flex items-center gap-2 text-label-sm font-label-sm">
            <span class="material-symbols-outlined text-[16px] text-tertiary">event</span>
            ${formatDate(perf)}
          </div>
          ${perf ? `
          <div class="flex items-center gap-2 text-label-sm font-label-sm">
            <span class="material-symbols-outlined text-[16px] text-tertiary">schedule</span>
            ${perf.startTime.slice(0, 5)} – ${perf.endTime.slice(0, 5)} hrs
          </div>` : ''}
        </div>
        <div class="mt-auto space-y-2">
          <button class="btn-comprar w-full bg-tertiary text-on-tertiary py-3
                         font-label-sm text-label-sm tracking-widest transition-all
                         ${buyable ? 'hover:opacity-90' : 'opacity-40 cursor-not-allowed'}"
                  data-perf-id="${perf?.id ?? ''}"
                  ${buyable ? '' : 'disabled'}>
            ${perf?.status === 'sold_out' ? 'AGOTADO' : 'COMPRAR ENTRADAS'}
          </button>
          <button class="btn-detalle w-full border border-outline-variant text-on-surface-variant
                         py-3 font-label-sm text-label-sm tracking-widest
                         hover:bg-surface-variant transition-all">
            VER DETALLES
          </button>
        </div>
      </div>
    </div>`;
}

function detailHTML(obra, perf) {
  return `
    <section class="relative h-[85vh] w-full flex items-end">
      <div class="absolute inset-0 z-0">
        <img alt="${obra.name}" class="w-full h-full object-cover"
             src="${obra.posterUrl || 'https://placehold.co/1280x720/1d1b20/e7c365?text=' + encodeURIComponent(obra.name)}"/>
        <div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
      </div>
      <div class="relative z-10 w-full max-w-container-max mx-auto px-margin-desktop pb-24">
        <div class="flex flex-col gap-6 max-w-3xl">
          <div class="flex gap-3 flex-wrap">
            ${perf ? statusBadge(perf.status) : ''}
          </div>
          <h1 class="text-display-lg font-display-lg text-tertiary uppercase leading-tight">
            ${obra.name}
          </h1>
          <div class="flex flex-wrap gap-8 text-on-surface-variant">
            ${perf ? `
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-tertiary">schedule</span>
              <span class="font-body-md text-body-md">${perf.startTime.slice(0,5)} – ${perf.endTime.slice(0,5)}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-tertiary">event_seat</span>
              <span class="font-body-md text-body-md">${formatPrice(perf)}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-tertiary">calendar_month</span>
              <span class="font-body-md text-body-md">${formatDate(perf)}</span>
            </div>` : ''}
          </div>
          <div class="flex gap-4 mt-4 flex-wrap">
            ${(perf && perf.status === 'on_sale') ? `
            <button class="bg-tertiary text-on-tertiary px-10 py-4 rounded-full font-bold text-lg
                           hover:brightness-110 transition-all flex items-center gap-2">
              <span class="material-symbols-outlined">confirmation_number</span>
              Comprar Entradas
            </button>` : ''}
            <button id="btn-back-cartelera"
                    class="border border-outline-variant bg-surface/20 backdrop-blur-md text-on-surface
                           px-10 py-4 rounded-full font-bold text-lg
                           hover:bg-surface-container-highest/30 transition-all">
              Volver a Cartelera
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-container-max mx-auto px-margin-desktop py-24">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div class="lg:col-span-8">
          <h2 class="text-headline-md font-headline-md text-on-surface mb-4">Sinopsis</h2>
          <p class="text-body-lg font-body-lg text-on-surface-variant leading-relaxed text-justify">
            ${obra.description || 'Descripción no disponible.'}
          </p>
        </div>
        ${perf ? `
        <div class="lg:col-span-4 bg-surface-container-low p-gutter rounded-xl">
          <h3 class="text-headline-md font-headline-md text-tertiary mb-6">Próxima Función</h3>
          <div class="p-4 rounded-lg bg-surface-container-high border border-outline-variant/20
                      hover:border-tertiary transition-all">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-bold text-on-surface">${formatDate(perf)}</p>
                <p class="text-sm text-on-surface-variant mt-1">${formatPrice(perf)} por entrada</p>
              </div>
              <span class="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>
          </div>
        </div>` : ''}
      </div>
    </section>`;
}

function errorHTML(msg) {
  return `
    <div class="col-span-4 flex flex-col items-center justify-center py-24 gap-4">
      <span class="material-symbols-outlined text-error text-[48px]">error</span>
      <p class="text-on-surface-variant text-body-md">No se pudo cargar la cartelera.</p>
      <p class="text-outline text-label-sm">${msg}</p>
      <button onclick="location.reload()"
              class="mt-2 border border-outline-variant px-6 py-2 text-label-sm
                     font-label-sm text-on-surface-variant hover:bg-surface-variant transition-all">
        Reintentar
      </button>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
//  Render
// ─────────────────────────────────────────────────────────────

export async function renderCartelera() {

  // ── 1. Cargar datos ──────────────────────────────────────
  let obras    = [];
  let funcs    = [];
  let errorMsg = null;

  try {
    [obras, funcs] = await Promise.all([getPlays(), getPerformances()]);
  } catch (e) {
    errorMsg = e.message;
  }

  // ── 2. Registrar handlers post-mount ────────────────────
  const app = document.querySelector('#app');
  if (app) {
    app.addEventListener('view:mounted', ({ detail }) => {
      if (detail?.path !== 'cartelera') return;

      // Filtros
      document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-filter]').forEach(b => {
            b.classList.remove('text-tertiary', 'border-b', 'border-tertiary');
            b.classList.add('text-on-surface-variant');
          });
          btn.classList.add('text-tertiary', 'border-b', 'border-tertiary');
          btn.classList.remove('text-on-surface-variant');

          const genre = btn.dataset.filter;
          document.querySelectorAll('#billboard-container [data-id]').forEach(card => {
            card.style.display = (genre === 'TODAS' || card.dataset.status === genre) ? '' : 'none';
          });
        });
      });

      // Grid / Lista
      const gridBtn   = document.getElementById('grid-view-btn');
      const listBtn   = document.getElementById('list-view-btn');
      const container = document.getElementById('billboard-container');

      gridBtn?.addEventListener('click', () => {
        container.classList.remove('list-view-active');
        gridBtn.classList.add('bg-tertiary', 'text-on-tertiary');
        gridBtn.classList.remove('text-on-surface-variant');
        listBtn.classList.remove('bg-tertiary', 'text-on-tertiary');
        listBtn.classList.add('text-on-surface-variant');
      });

      listBtn?.addEventListener('click', () => {
        container.classList.add('list-view-active');
        listBtn.classList.add('bg-tertiary', 'text-on-tertiary');
        listBtn.classList.remove('text-on-surface-variant');
        gridBtn.classList.remove('bg-tertiary', 'text-on-tertiary');
        gridBtn.classList.add('text-on-surface-variant');
      });

      // Detalle de obra — navega a la ruta dedicada
      app.addEventListener('click', e => {
        const btn = e.target.closest('.btn-detalle');
        if (!btn) return;
        const card = btn.closest('[data-id]');
        const id   = card?.dataset.id;
        if (!id) return;
        navigate(`play/${id}`);
      });

      // Logout
      document.getElementById('btn-logout')?.addEventListener('click', async () => {
        await logout();
        navigate('/');
      });

      // Profile
      document.getElementById('btn-profile')?.addEventListener('click', () => {
        navigate('dashboard');
      });

    }, { once: true });
  }

  // ── 3. Template ─────────────────────────────────────────
  const user = getUser();
  return `
  <header class="fixed top-0 w-full z-50 border-b border-outline-variant/30"
          style="background:rgba(20,18,24,0.9);backdrop-filter:blur(12px);">
    <div class="max-w-container-max mx-auto flex justify-between items-center px-margin-desktop py-base">
      <div class="flex items-center gap-8">
        <h1 class="tracking-tight text-tertiary font-bold"
            style="font-size:1.5rem;font-family:'Playfair Display',serif;">Gran Teatro</h1>
        <nav class="hidden md:flex items-center gap-6">
          <a href="#/cartelera"
             class="text-tertiary font-label-sm text-label-sm tracking-[0.15em] uppercase
                    border-b border-tertiary pb-0.5">
            CARTELERA
          </a>
        </nav>
      </div>
      <div class="flex items-center gap-4">
        <div class="hidden lg:flex items-center bg-surface-container px-4 py-2 rounded-full
                    border border-outline-variant/20">
          <span class="material-symbols-outlined text-on-surface-variant text-[20px] mr-2">search</span>
          <input class="bg-transparent border-none focus:ring-0 text-label-sm font-label-sm
                        text-on-surface w-40 placeholder:text-on-surface-variant"
                 placeholder="Buscar obras..." type="text" id="search-input">
        </div>
        ${user ? `
        <button id="btn-profile"
                class="flex items-center gap-2 text-on-surface-variant hover:text-tertiary
                       transition-colors font-label-sm text-label-sm tracking-widest">
          <span class="material-symbols-outlined text-[20px]">person</span>
          <span class="hidden md:inline">${user.name?.split(' ')[0] ?? 'Mi cuenta'}</span>
        </button>
        <button id="btn-logout"
                class="flex items-center gap-2 px-4 py-2 border border-outline-variant/30
                       text-on-surface-variant hover:text-error hover:border-error/40
                       transition-all font-label-sm text-label-sm tracking-widest rounded-full">
          <span class="material-symbols-outlined text-[18px]">logout</span>
          <span class="hidden md:inline">SALIR</span>
        </button>` : ''}
      </div>
    </div>
  </header>

  <main class="pt-[72px]" id="cartelera-main">

    <!-- Hero -->
    <section class="relative h-[45vh] w-full overflow-hidden flex items-end"
             style="background:linear-gradient(135deg,#0f0d13,#1d1b20);">
      <div class="absolute inset-0 pointer-events-none"
           style="background:radial-gradient(ellipse at 60% 50%,rgba(231,195,101,.08),transparent 60%),
                             radial-gradient(ellipse at 20% 80%,rgba(107,17,29,.12),transparent 50%);"></div>
      <div class="relative z-10 px-margin-desktop pb-10 max-w-4xl">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-6 h-px bg-tertiary/60"></div>
          <span class="text-tertiary text-label-sm font-label-sm tracking-[0.3em] opacity-80">
            TEMPORADA 2025–2026
          </span>
        </div>
        <h2 class="font-display-lg text-white mb-4 uppercase tracking-tighter"
            style="font-size:clamp(2rem,5vw,3.5rem);font-weight:700;">
          Cartelera
        </h2>
        <p class="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
          ${errorMsg
            ? 'No se pudo conectar con el servidor.'
            : `${obras.length} obra${obras.length !== 1 ? 's' : ''} · ${funcs.filter(f => f.status === 'on_sale').length} en venta ahora`
          }
        </p>
      </div>
    </section>

    <!-- Filtros + toggle vista -->
    <section class="sticky top-[72px] z-40 border-y border-outline-variant/20 px-margin-desktop py-4"
             style="background:rgba(20,18,24,0.97);backdrop-filter:blur(12px);">
      <div class="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-gutter">
        <div class="flex items-center gap-6 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <button data-filter="TODAS"
                  class="text-tertiary font-label-sm text-label-sm whitespace-nowrap border-b border-tertiary">
            TODAS
          </button>
          <button data-filter="on_sale"
                  class="text-on-surface-variant hover:text-tertiary transition-colors
                         font-label-sm text-label-sm whitespace-nowrap">
            EN VENTA
          </button>
          <button data-filter="scheduled"
                  class="text-on-surface-variant hover:text-tertiary transition-colors
                         font-label-sm text-label-sm whitespace-nowrap">
            PRÓXIMAMENTE
          </button>
        </div>
        <div class="flex items-center gap-2 bg-surface-container-high rounded-lg p-1 border border-outline-variant/30">
          <button id="grid-view-btn"
                  class="p-2 rounded-md transition-all bg-tertiary text-on-tertiary">
            <span class="material-symbols-outlined">grid_view</span>
          </button>
          <button id="list-view-btn"
                  class="p-2 rounded-md transition-all text-on-surface-variant hover:text-tertiary">
            <span class="material-symbols-outlined">list</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Grid -->
    <section class="px-margin-desktop py-gutter max-w-container-max mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter"
           id="billboard-container">
        ${errorMsg
          ? errorHTML(errorMsg)
          : obras.length === 0
            ? `<div class="col-span-4 text-center py-24 text-on-surface-variant">
                 No hay obras disponibles en este momento.
               </div>`
            : obras.map(o => cardHTML(o, funcs)).join('')
        }
      </div>
    </section>

    <!-- Newsletter -->
    <section class="px-margin-desktop py-gutter bg-surface-container-lowest border-y border-outline-variant/10">
      <div class="max-w-container-max mx-auto flex flex-col lg:flex-row
                  items-center justify-between gap-gutter">
        <div class="max-w-xl">
          <h2 class="font-headline-md text-headline-md text-tertiary mb-4 uppercase">
            Únete al Círculo del Gran Teatro
          </h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Acceso anticipado a preventas, contenido exclusivo y beneficios únicos en cada función.
          </p>
        </div>
        <div class="flex w-full lg:w-auto gap-2">
          <input class="bg-surface-dim border border-outline-variant/30 px-6 py-3
                        font-body-md text-on-surface focus:ring-1 focus:ring-tertiary
                        outline-none min-w-[260px]"
                 placeholder="Correo electrónico" type="email">
          <button class="bg-tertiary text-on-tertiary px-8 py-3 font-label-sm text-label-sm
                         tracking-widest hover:bg-tertiary-fixed-dim transition-all">
            SUSCRIBIRSE
          </button>
        </div>
      </div>
    </section>
  </main>

  <footer class="w-full px-margin-desktop py-gutter flex flex-col md:flex-row
                 justify-between items-center gap-gutter bg-surface-container-lowest mt-gutter
                 border-t border-outline-variant/10">
    <h2 class="font-headline-md text-headline-md text-tertiary-fixed">Gran Teatro</h2>
    <span class="font-label-sm text-label-sm text-on-surface-variant">
      © 2025 Gran Teatro. Todos los derechos reservados.
    </span>
    <div class="flex items-center gap-1 font-label-sm text-label-sm text-tertiary">
      Hecho con
      <span class="material-symbols-outlined text-[16px] text-error"
            style="font-variation-settings:'FILL' 1;">favorite</span>
      para las artes
    </div>
  </footer>`;
}