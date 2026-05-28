/**
 * ============================================================
 *  view/cartelera.js — Cartelera | Gran Teatro
 * ============================================================
 */

import { navigate } from '../router.js';

// ─────────────────────────────────────────────────────────────
//  Datos de obras (en producción vendrán de la API)
// ─────────────────────────────────────────────────────────────
const OBRAS = [
  {
    id: 'bella-bestia',
    title: 'La Bella y la Bestia',
    genre: 'MUSICAL',
    dateRange: '24 MAY - 15 JUN',
    time: '20:00 hrs',
    room: 'Sala Principal',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADCSiVhUx-28oy6FrDalh6Bgv9CiYDAsCL3hagM5KnYbCVRBSmNKrIemayhHw1EjBJTz19VOyh9_UgVf-cGoSDskX_14HOWl-LHzTGAniNIUKWvT8J2GVPSz0ImaQdw7ncblGoun-VRaxXDX3lqYQeRavw4r82xhJNDYr4CkszLdsFi6g4k4nfLOFwPlPzERTZeMRQ1kFL53acBU3hI2Xxpk6dWJPfOAYI_O8vtBZXMnKF8gOII3YWphnLlfjdrQLWBifNDBaJqzxG',
  },
  {
    id: 'miserables',
    title: 'Los Miserables',
    genre: 'DRAMA',
    dateRange: '12 JUN - 30 JUL',
    time: '19:30 hrs',
    room: 'Sala Principal',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD09eijxatHtCzXIwiBhCsGqIu9Tfqa-mD1_VEIUJ6hCBtTD7wtUJCJ1mqO2_fyUPahWfgB8QkCK8Gw7Uln8cNwg294kQwMUaZ3dvAvQLyvpBAiJixgmxyi2EVgX73FkYxRxjfY-FniqQtcaDdjV2yaZ41sTcU-fO3m_DhhrfH9QQWOUQfLiM-IFforP9FETPZRoWQ18nVlHzTiJlgqQd_OUblbpQiRTt4BozAJmBtuuj8QvRI6jJVE4lTZ7H3Kh40wG-opSkVe303N',
  },
  {
    id: 'lago-cisnes',
    title: 'El Lago de los Cisnes',
    genre: 'BALLET',
    dateRange: '05 AGO - 15 AGO',
    time: '21:00 hrs',
    room: 'Sala B',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjXH1i1gFkgbBufEa9BhBo4MU5_SLiSzRyq_3DQ4IdNzW8Rpz409Dcvxh6XZLWJ_BjJgqUHUwwBCkLhcZPdtJ4TpKdnLoMX3mu5ht_vIK4pIrERXqS8SJIMMTK647bCuuqnIYaCY3SAqUAi0bY_0cyTy3V0OUNR1aEnfs_RgQD5-KRKBbX1cJdqSLjx85OQbLfqjenqKoCpCxhekdmebZGFwYtoPzzVnYcfBZSzMfhBPlQcDLTFPDbWZquSEqG1UgEdqwI333YWISA',
  },
  {
    id: 'chicago',
    title: 'Chicago',
    genre: 'MUSICAL',
    dateRange: '20 SEP - 10 OCT',
    time: '20:30 hrs',
    room: 'Sala Principal',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfQa5HFmcYD4aDa0xUG0MUsKPXanYsII-brPn_6FwAG0SSjOJZCiGXp-pHWxqCLEEofHcmMGUe8xKWONIl_lveGfiA3SC0FRXB5seXodTRwsYXci9ILtTyiFzbmlaQhxQ7sBGLgWi_QDeoH-svulaSJ2Dsbxp2-v49zTa50gocLX73L1cm_l11OSM_nYwS2ry9AIg-SCXrg5YK-cbSYiq1sFYKUCfYVtMeX7_rwd-0wjsZaL0N7jSnuh-tyNv0zEEz0tYUhEMFiH_X',
  },
  {
    id: 'carmen',
    title: 'Carmen',
    genre: 'ÓPERA',
    dateRange: '15 NOV - 30 NOV',
    time: '19:00 hrs',
    room: 'Sala Principal',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkU4u5JFQwKuPu65eh78e6QhFftC9llOuvYU4M1xJsTQO0dfKPB_h-gARs8xD37jUGLFOWx6dFwoGvWvxqhmfcx0gIfftTAOtrD-m2rwrjTxcUsuDbsjTwDkRG5PNJddyK8slSviQ3Zvn28HxMeSRoDoOXbG0z0J6eWOVx8RyfdKD0x7U4tK21orjHIAvBzZaTgSbHxRN3Q2rMQjI8EvA4SDTBrU3MwO2YFdgYNeWAe--F--BoAKwK0R8N5OACvri9LRm_Z334AD1R',
  },
  {
    id: 'hamlet',
    title: 'Hamlet',
    genre: 'DRAMA',
    dateRange: '01 OCT - 20 OCT',
    time: '20:00 hrs',
    room: 'Sala Experimental',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSXESY4tIyUpKDCFr5KSp_12B4YVG9Vi5T28ojJJbw8BBBFsuVc9l_YL10Bpiq7ZP7GznNhD6ySagc6bgav-GfQGVo6vo1Rv8k2EX63HPZ7QF5b4TNgOR33yWqE_Jm_2yLwzVFpZ-3Oy9pHcaFLI8b9Fjhe038984KXWH9n-XrzIj9qTDoK_7_J4GKk-6VizrLJnYf1L8xb2d7aKPsqks-K6yusMqDz0JZoa2ZU97giKsHcWu64ZtTtCcm9yzeOOgt-9UlcKNanuw5',
  },
  {
    id: 'giselle',
    title: 'Giselle',
    genre: 'BALLET',
    dateRange: '05 DIC - 15 DIC',
    time: '19:30 hrs',
    room: 'Sala B',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkNvj3qRMmTizXGD-WkUPCrGj5VP_ckEZrCoVKGU3TONda3_1u8mOM6v5JfLbx6eGLb6bIjm1fpXnT1lQ0OZJJZlCY2ulMqxQ5vIGJEYW4bCoaJlrre28zWPYp3qZvFrZet5ndleUEW83gW0ufA40TLtBhafR10QWUVECRbpAHAKSfNL_YuaC4_qgNfKOdD0J_jyq5x8aaQ6l_Yu2Ar5tB4O3z7PgbZz9HElwvI8LRbspgc14-NrkqzVOmbmal6XcR7U38UggbZSfk',
  },
  {
    id: 'cascanueces',
    title: 'Cascanueces',
    genre: 'BALLET',
    dateRange: '20 DIC - 05 ENE',
    time: '18:00 hrs',
    room: 'Sala Principal',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBTrdeiDXb5LhQJXGsHVUBgf-LruxJjWtUUpso_xNOPKjPxh2mVGru1UqTGJ3N3aS1OyEMhsNElnZAM1vihthwFB_1XHw14sQ_aB4NmW3gxmiqbNd-UmWUMdsev5I9jOO193TY-nqPJvsh6CRVE0p2OWGJmUX9g3VXk_DuGxS_YpiONfP9oMNlkXAicpp6KQza_VLIw1BL-F0hIJTPkrs-ca1ZmTHdgTOxyJW1XYxp1EXPqJomwOG0TaNKx9mU0SIrrcd7tNGOEDlO',
  },
];

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function cardHTML(obra) {
  return `
    <div class="group flex flex-col bg-surface-container-low card-inner-glow transition-all hover:translate-y-[-4px]"
         data-id="${obra.id}" data-genre="${obra.genre}">
      <div class="relative aspect-[2/3] overflow-hidden">
        <img alt="${obra.title}"
             class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
             src="${obra.img}">
        <div class="absolute top-4 left-4">
          <span class="bg-surface-dim/80 backdrop-blur-md border border-tertiary/30 text-tertiary
                       px-3 py-1 text-label-sm font-label-sm">${obra.genre}</span>
        </div>
      </div>
      <div class="p-6 flex flex-col flex-grow">
        <h3 class="font-headline-md text-headline-md mb-2 leading-tight uppercase
                   group-hover:text-tertiary transition-colors">${obra.title}</h3>
        <div class="space-y-1 mb-6 text-on-surface-variant">
          <div class="flex items-center gap-2 text-label-sm font-label-sm">
            <span class="material-symbols-outlined text-[16px] text-tertiary">event</span>
            ${obra.dateRange}
          </div>
          <div class="flex items-center gap-2 text-label-sm font-label-sm">
            <span class="material-symbols-outlined text-[16px] text-tertiary">schedule</span>
            ${obra.time}
          </div>
          <div class="flex items-center gap-2 text-label-sm font-label-sm">
            <span class="material-symbols-outlined text-[16px] text-tertiary">meeting_room</span>
            ${obra.room}
          </div>
        </div>
        <div class="mt-auto space-y-2">
          <button class="btn-comprar w-full bg-tertiary text-on-tertiary py-3
                         font-label-sm text-label-sm tracking-widest hover:opacity-90 transition-all">
            COMPRAR ENTRADAS
          </button>
          <button class="btn-detalle w-full border border-outline-variant text-on-surface-variant py-3
                         font-label-sm text-label-sm tracking-widest hover:bg-surface-variant transition-all">
            VER DETALLES
          </button>
        </div>
      </div>
    </div>`;
}

function detailHTML(obra) {
  return `
    <section class="relative h-[85vh] w-full flex items-end">
      <div class="absolute inset-0 z-0">
        <img alt="${obra.title}" class="w-full h-full object-cover" src="${obra.img}"/>
        <div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
      </div>
      <div class="relative z-10 w-full max-w-container-max mx-auto px-margin-desktop pb-24">
        <div class="flex flex-col gap-6 max-w-3xl">
          <div class="flex gap-3">
            <span class="bg-error-container text-on-error-container px-3 py-1 rounded-lg
                         font-label-sm text-label-sm uppercase tracking-widest">${obra.genre}</span>
            <span class="bg-surface-container-highest text-on-surface px-3 py-1 rounded-lg
                         font-label-sm text-label-sm uppercase tracking-widest">${obra.room}</span>
          </div>
          <h1 class="text-display-lg font-display-lg text-tertiary uppercase leading-tight">${obra.title}</h1>
          <div class="flex gap-8 text-on-surface-variant">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-tertiary">schedule</span>
              <span class="font-body-md text-body-md">2h 45m</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-tertiary">event_seat</span>
              <span class="font-body-md text-body-md">Desde $750</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-tertiary">calendar_month</span>
              <span class="font-body-md text-body-md">${obra.dateRange}</span>
            </div>
          </div>
          <div class="flex gap-4 mt-4">
            <button class="bg-tertiary text-on-tertiary px-10 py-4 rounded-full font-bold text-lg
                           hover:brightness-110 transition-all flex items-center gap-2">
              <span class="material-symbols-outlined">confirmation_number</span> Comprar Entradas
            </button>
            <button id="btn-back-cartelera"
                    class="border border-outline-variant bg-surface/20 backdrop-blur-md text-on-surface
                           px-10 py-4 rounded-full font-bold text-lg hover:bg-surface-container-highest/30 transition-all">
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
            Una producción monumental que trae a escena lo mejor del teatro contemporáneo.
            Con un despliegue escénico sin precedentes y una interpretación impecable de todos los actores,
            esta obra promete emocionar al público durante toda la temporada.
          </p>
        </div>
        <div class="lg:col-span-4 bg-surface-container-low p-gutter rounded-xl">
          <h3 class="text-headline-md font-headline-md text-tertiary mb-6">Próximas Funciones</h3>
          <div class="space-y-4">
            <div class="p-4 rounded-lg bg-surface-container-high border border-outline-variant/20
                        hover:border-tertiary transition-all cursor-pointer">
              <div class="flex justify-between items-center">
                <div>
                  <p class="font-bold text-on-surface">${obra.dateRange.split(' - ')[0]}</p>
                  <p class="text-sm text-on-surface-variant">${obra.time}</p>
                </div>
                <span class="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

// ─────────────────────────────────────────────────────────────
//  Render principal
// ─────────────────────────────────────────────────────────────

export async function renderCartelera() {

  // ── Handler de detalle (se inyecta en el mismo contenedor) ──
  function mountDetailHandlers(app) {
    app.addEventListener('click', e => {
      const btn = e.target.closest('.btn-detalle');
      if (!btn) return;
      const card = btn.closest('[data-id]');
      const id   = card?.dataset.id;
      const obra = OBRAS.find(o => o.id === id);
      if (!obra) return;

      const main = document.getElementById('cartelera-main');
      if (!main) return;
      main.innerHTML = detailHTML(obra);

      document.getElementById('btn-back-cartelera')?.addEventListener('click', () => {
        navigate('cartelera');
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Lógica de filtros y vista (se registra en view:mounted) ──
  const app = document.querySelector('#app');
  if (app) {
    app.addEventListener('view:mounted', ({ detail }) => {
      if (detail?.path !== 'cartelera') return;

      // Montar handler de detalle
      mountDetailHandlers(app);

      // Filtros de género
      const filterBtns = document.querySelectorAll('[data-filter]');
      const cards      = document.querySelectorAll('#billboard-container [data-id]');

      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const genre = btn.dataset.filter;

          filterBtns.forEach(b => {
            b.classList.remove('text-tertiary', 'border-b', 'border-tertiary');
            b.classList.add('text-on-surface-variant');
          });
          btn.classList.add('text-tertiary', 'border-b', 'border-tertiary');
          btn.classList.remove('text-on-surface-variant');

          cards.forEach(card => {
            const match = genre === 'TODAS' || card.dataset.genre === genre;
            card.style.display = match ? '' : 'none';
          });
        });
      });

      // Vista cuadrícula / lista
      const gridBtn  = document.getElementById('grid-view-btn');
      const listBtn  = document.getElementById('list-view-btn');
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

    }, { once: true });
  }

  // ── Template ─────────────────────────────────────────────────
  return `
  <!-- ╔══════════════════════════════════════╗
       ║  HEADER                              ║
       ╚══════════════════════════════════════╝ -->
 <header class="fixed top-0 w-full z-50 bg-surface-dim/80 backdrop-blur-md border-b border-outline-variant/30"
        style="background:rgba(20,18,24,0.85);">
  <div class="max-w-container-max mx-auto flex justify-between items-center px-margin-desktop py-base">
  <div class="flex items-center gap-gutter">
    <h1 class="tracking-tight text-tertiary font-bold"
        style="font-size:1.5rem;line-height:1.2;font-family:'Playfair Display',serif;">Gran Teatro</h1>
      <nav class="hidden md:flex items-center gap-gutter ml-8">
        <a href="#/" class="font-label-sm text-label-sm text-on-surface-variant
                            hover:text-tertiary transition-colors">INICIO</a>
        <a href="#/cartelera" class="font-label-sm text-label-sm text-tertiary
                                     border-b-2 border-tertiary pb-1">CARTELERA</a>
      </nav>
    </div>
    <div class="flex items-center gap-gutter">
      <div class="hidden lg:flex items-center bg-surface-container px-4 py-2 rounded-full border border-outline-variant/20">
        <span class="material-symbols-outlined text-on-surface-variant text-[20px] mr-2">search</span>
        <input class="bg-transparent border-none focus:ring-0 text-label-sm font-label-sm
                      text-on-surface w-40 placeholder:text-on-surface-variant"
               placeholder="Buscar obras..." type="text" id="search-input">
      </div>
      <button class="bg-tertiary-container text-on-tertiary-container px-6 py-2 rounded-full
                     font-label-sm text-label-sm hover:bg-tertiary hover:text-on-tertiary
                     transition-all scale-95 duration-200 ease-in-out flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">confirmation_number</span>
        Tickets
      </button>
    </div>
    </div>
    </div>
  </header>

  <!-- ╔══════════════════════════════════════╗
       ║  MAIN (contenido intercambiable)     ║
       ╚══════════════════════════════════════╝ -->
  <main class="pt-[80px]" id="cartelera-main">

    <!-- ── Hero ──────────────────────────────── -->
    <section class="relative h-[85vh] w-full overflow-hidden flex items-end">
      <div class="absolute inset-0 z-0">
        <img alt="Featured Play"
             class="w-full h-full object-cover"
             src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDKIfGTVEsM4Xf2tc-Sbaxptpu2eybcWYShkWKIQ08io-Vw5UuosjcE4zRiW2pZskY_aBjQkD_3UQrNNUk6ThzTQb-Aqhtfs73qzPJqp5tkmD6vvn2zbFUDcRSMUkUuTBz9VyPQ3imyyqyv6H_dEne7HLKXzylH6zIqjRE5njwEj1ivZ6PPk7f1LkqsaAP0PVF7rqD_UZoA98C-JRgqGM9WALLcNElx6rO-zfyeWO3CRBpoUFkNB6Zxn_ONpD_nB0CYh4qlUz7rPNq">
        <div class="absolute inset-0 hero-gradient"></div>
      </div>
      <div class="relative z-10 px-margin-desktop pb-gutter max-w-4xl">
        <div class="flex items-center gap-2 mb-4">
          <span class="bg-tertiary text-on-tertiary px-3 py-1 text-label-sm font-label-sm rounded-full tracking-widest">MUSICAL</span>
          <span class="text-on-surface-variant text-label-sm font-label-sm flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">star</span>
            FUNCIÓN DESTACADA
          </span>
        </div>
        <h2 class="font-display-lg text-display-lg text-white mb-6 uppercase tracking-tighter">
          El Fantasma de la Ópera
        </h2>
        <p class="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-2xl">
          Sumérgete en la trágica historia de amor y obsesión que ha cautivado al mundo.
          Una producción monumental con orquesta en vivo y un despliegue escénico sin precedentes.
        </p>
        <div class="flex flex-wrap gap-4">
          <button class="bg-tertiary text-on-tertiary px-10 py-4 font-label-sm text-label-sm
                         tracking-widest hover:bg-tertiary-fixed-dim transition-all flex items-center gap-3">
            <span class="material-symbols-outlined">payments</span>
            COMPRAR ENTRADAS
          </button>
          <button class="border border-white/30 text-white px-10 py-4 font-label-sm text-label-sm
                         tracking-widest hover:bg-white/10 transition-all">
            VER DETALLES
          </button>
        </div>
      </div>
    </section>

    <!-- ── Filtros ────────────────────────────── -->
    <section class="sticky top-[72px] z-40 bg-surface-dim/95 backdrop-blur-md
                    border-y border-outline-variant/20 px-margin-desktop py-4">
      <div class="max-w-container-max mx-auto flex flex-col md:flex-row
                  justify-between items-center gap-gutter">
        <div class="flex items-center gap-6 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <button data-filter="TODAS"
                  class="text-tertiary font-label-sm text-label-sm whitespace-nowrap border-b border-tertiary">
            TODAS
          </button>
          <button data-filter="DRAMA"
                  class="text-on-surface-variant hover:text-tertiary transition-colors font-label-sm text-label-sm whitespace-nowrap">
            DRAMA
          </button>
          <button data-filter="MUSICAL"
                  class="text-on-surface-variant hover:text-tertiary transition-colors font-label-sm text-label-sm whitespace-nowrap">
            MUSICAL
          </button>
          <button data-filter="BALLET"
                  class="text-on-surface-variant hover:text-tertiary transition-colors font-label-sm text-label-sm whitespace-nowrap">
            BALLET
          </button>
          <button data-filter="ÓPERA"
                  class="text-on-surface-variant hover:text-tertiary transition-colors font-label-sm text-label-sm whitespace-nowrap">
            ÓPERA
          </button>
        </div>
        <div class="flex items-center gap-gutter w-full md:w-auto">
          <div class="flex items-center gap-2 bg-surface-container-high px-4 py-2
                      border border-outline-variant/30 w-full md:w-48 cursor-pointer">
            <span class="material-symbols-outlined text-[18px] text-tertiary">calendar_month</span>
            <span class="text-label-sm font-label-sm">Fecha: Todo</span>
          </div>
          <div class="flex items-center gap-2 bg-surface-container-high px-4 py-2
                      border border-outline-variant/30 w-full md:w-48 cursor-pointer">
            <span class="material-symbols-outlined text-[18px] text-tertiary">location_on</span>
            <span class="text-label-sm font-label-sm">Sala: Todas</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Toggle vista ───────────────────────── -->
    <div class="px-margin-desktop mb-6 mt-6 max-w-container-max mx-auto flex justify-end">
      <div class="flex bg-surface-container-high rounded-lg p-1 border border-outline-variant/30">
        <button id="grid-view-btn"
                class="p-2 rounded-md transition-all bg-tertiary text-on-tertiary"
                title="Vista Cuadrícula">
          <span class="material-symbols-outlined">grid_view</span>
        </button>
        <button id="list-view-btn"
                class="p-2 rounded-md transition-all hover:text-tertiary text-on-surface-variant"
                title="Vista Lista">
          <span class="material-symbols-outlined">list</span>
        </button>
      </div>
    </div>

    <!-- ── Grid de obras ──────────────────────── -->
    <section class="px-margin-desktop py-gutter max-w-container-max mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter"
           id="billboard-container">
        ${OBRAS.map(cardHTML).join('')}
      </div>
    </section>

    <!-- ── Newsletter ─────────────────────────── -->
    <section class="px-margin-desktop py-gutter bg-surface-container-lowest border-y border-outline-variant/10">
      <div class="max-w-container-max mx-auto flex flex-col lg:flex-row
                  items-center justify-between gap-gutter">
        <div class="max-w-xl">
          <h2 class="font-headline-md text-headline-md text-tertiary mb-4 uppercase">
            Únete al Círculo del Gran Teatro
          </h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Acceso anticipado a preventas, contenido exclusivo detrás de escena
            y beneficios únicos en cada función.
          </p>
        </div>
        <div class="flex w-full lg:w-auto gap-2">
          <input class="bg-surface-dim border border-outline-variant/30 px-6 py-3
                        font-body-md text-on-surface focus:ring-1 focus:ring-tertiary
                        outline-none min-w-[300px]"
                 placeholder="Correo electrónico" type="email">
          <button class="bg-tertiary text-on-tertiary px-8 py-3 font-label-sm text-label-sm
                         tracking-widest hover:bg-tertiary-fixed-dim transition-all">
            SUSCRIBIRSE
          </button>
        </div>
      </div>
    </section>

  </main>

  <!-- ╔══════════════════════════════════════╗
       ║  FOOTER                              ║
       ╚══════════════════════════════════════╝ -->
  <footer class="w-full px-margin-desktop py-gutter flex flex-col md:flex-row
                 justify-between items-start gap-gutter bg-surface-container-lowest mt-gutter">
    <div class="flex flex-col gap-4">
      <h2 class="font-headline-md text-headline-md text-tertiary-fixed">Gran Teatro</h2>
      <p class="font-body-md text-body-md text-on-surface-variant max-w-xs">
        El epicentro de las artes escénicas. Donde la tradición se encuentra con la innovación.
      </p>
      <div class="flex gap-4 mt-2">
        <a class="text-on-surface-variant hover:text-tertiary transition-colors" href="#">
          <span class="material-symbols-outlined">public</span>
        </a>
        <a class="text-on-surface-variant hover:text-tertiary transition-colors" href="#">
          <span class="material-symbols-outlined">alternate_email</span>
        </a>
        <a class="text-on-surface-variant hover:text-tertiary transition-colors" href="#">
          <span class="material-symbols-outlined">share</span>
        </a>
      </div>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-gutter w-full md:w-auto">
      <div class="flex flex-col gap-3">
        <span class="font-label-sm text-label-sm text-tertiary font-bold">PROGRAMA</span>
        <a class="font-label-sm text-label-sm text-on-surface-variant hover:text-tertiary transition-colors" href="#">Próximas Obras</a>
        <a class="font-label-sm text-label-sm text-on-surface-variant hover:text-tertiary transition-colors" href="#">Abonos</a>
        <a class="font-label-sm text-label-sm text-on-surface-variant hover:text-tertiary transition-colors" href="#">Archivo</a>
      </div>
      <div class="flex flex-col gap-3">
        <span class="font-label-sm text-label-sm text-tertiary font-bold">INSTITUCIONAL</span>
        <a class="font-label-sm text-label-sm text-on-surface-variant hover:text-tertiary transition-colors" href="#">Prensa</a>
        <a class="font-label-sm text-label-sm text-on-surface-variant hover:text-tertiary transition-colors" href="#">Contacto</a>
        <a class="font-label-sm text-label-sm text-on-surface-variant hover:text-tertiary transition-colors" href="#">Donaciones</a>
      </div>
      <div class="flex flex-col gap-3">
        <span class="font-label-sm text-label-sm text-tertiary font-bold">LEGAL</span>
        <a class="font-label-sm text-label-sm text-on-surface-variant hover:text-tertiary transition-colors" href="#">Privacidad</a>
        <a class="font-label-sm text-label-sm text-on-surface-variant hover:text-tertiary transition-colors" href="#">Términos</a>
      </div>
      <div class="flex flex-col gap-3">
        <span class="font-label-sm text-label-sm text-tertiary font-bold">ACCESO</span>
        <a class="font-label-sm text-label-sm text-on-surface-variant hover:text-tertiary
                  transition-colors flex items-center gap-2" href="#/dashboard">
          <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span> Mi cuenta
        </a>
      </div>
    </div>
    <div class="w-full pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row
                justify-between items-center gap-4">
      <span class="font-label-sm text-label-sm text-on-surface-variant">
        © 2024 Gran Teatro. Todos los derechos reservados.
      </span>
      <div class="flex items-center gap-1 font-label-sm text-label-sm text-tertiary">
        Hecho con
        <span class="material-symbols-outlined text-[16px] text-error"
              style="font-variation-settings:'FILL' 1;">favorite</span>
        para las artes
      </div>
    </div>
  </footer>`;
}