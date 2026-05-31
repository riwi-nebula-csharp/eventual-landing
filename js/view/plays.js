/**
 * ============================================================
 *  view/plays.js — Cartelera autenticada | Teatro Eventual
 * ============================================================
 */

import { navigate }                                          from '../router.js';
import { renderNavbar, attachNavbarHandlers, NAV_HEIGHT }    from '../components/navbar.js';
import { getPlays, getMyFavorites, addFavorite, removeFavorite } from '../api.events.js';

function skeletonCard() {
  return `
    <div class="card-border-frame p-6 bg-black/40 animate-pulse">
      <div class="aspect-[4/5] mb-6 bg-white/5 rounded"></div>
      <div class="h-4 bg-white/5 rounded mb-3 mx-4"></div>
      <div class="h-3 bg-white/5 rounded mb-4 mx-8"></div>
      <div class="h-9 bg-white/5 rounded mt-4"></div>
    </div>`;
}

function playCardHTML(play, isFav, favId) {
  return `
    <div class="card-border-frame p-6 bg-black/40 flex flex-col group
                hover:border-theatreGold/60 transition-colors duration-500"
         data-play-id="${play.id}"
         data-is-fav="${isFav}">
      <div class="aspect-[4/5] mb-5 overflow-hidden relative">
        ${play.posterUrl
          ? `<img src="${play.posterUrl}" alt="${play.name}"
                  class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"/>`
          : `<div class="w-full h-full bg-theatreBurgundy/20 flex items-center justify-center">
               <span class="material-symbols-outlined text-theatreGold/30" style="font-size:3rem;">theater_comedy</span>
             </div>`
        }
        <button class="btn-fav absolute top-3 right-3 w-8 h-8 flex items-center justify-center
                       rounded-full transition-all duration-200
                       ${isFav ? 'bg-theatreGold text-theatreDark' : 'bg-black/60 text-theatreGray hover:text-theatreGold hover:bg-black/80'}"
                data-play-id="${play.id}"
                data-fav-id="${favId || ''}"
                data-is-fav="${isFav}"
                title="${isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
          <span class="material-symbols-outlined" style="font-size:16px;font-variation-settings:'FILL' ${isFav ? 1 : 0};">favorite</span>
        </button>
      </div>
      <h3 class="text-theatreGold font-serif text-lg text-center mb-3 uppercase
                 tracking-[0.1em] leading-tight px-2 min-h-[2.5rem] flex items-center justify-center">
        ${play.name}
      </h3>
      ${play.description ? `
        <p class="text-theatreGray text-xs text-center mb-4 font-light leading-relaxed line-clamp-2 px-2">
          ${play.description}
        </p>` : ''}
      <div class="mt-auto pt-2">
        <button class="btn-ver-funciones w-full py-2.5 bg-theatreBurgundy text-white text-[10px]
                       font-bold tracking-[0.15em] hover:brightness-110 transition-all uppercase"
                data-play-id="${play.id}">
          Ver Funciones
        </button>
      </div>
    </div>`;
}

export async function renderPlays() {
  const [playsRes, favsRes] = await Promise.all([getPlays(), getMyFavorites()]);

  const plays = playsRes.success && Array.isArray(playsRes.data) ? playsRes.data : [];
  const favs  = favsRes.success  && Array.isArray(favsRes.data)  ? favsRes.data  : [];
  const favMap = {};
  favs.forEach(f => { favMap[f.playId] = { isFav: true, favId: f.id }; });

  // Handlers post-render
  setTimeout(() => {
    attachNavbarHandlers();

    document.querySelectorAll('.btn-ver-funciones').forEach(btn => {
      btn.addEventListener('click', () => navigate(`obras/${btn.dataset.playId}/funciones`));
    });

    // Filtro favoritos
    const btnFavFilter = document.getElementById('btn-filter-favs');
    const grid         = document.getElementById('plays-grid');
    let showOnlyFavs   = false;

    function applyFilter() {
      const cards = grid?.querySelectorAll('div[data-play-id]');
      cards?.forEach(card => {
        const isFav = card.dataset.isFav === 'true';
        card.style.display = showOnlyFavs && !isFav ? 'none' : '';
      });

      const empty = document.getElementById('favs-empty');
      if (showOnlyFavs) {
        const anyVisible = [...(cards ?? [])].some(c => c.style.display !== 'none');
        if (empty) empty.classList.toggle('hidden', anyVisible);
      } else {
        empty?.classList.add('hidden');
      }

      if (btnFavFilter) {
        btnFavFilter.classList.toggle('bg-theatreGold',     showOnlyFavs);
        btnFavFilter.classList.toggle('text-theatreDark',   showOnlyFavs);
        btnFavFilter.classList.toggle('border-theatreGold', showOnlyFavs);
        btnFavFilter.classList.toggle('text-theatreGold',  !showOnlyFavs);
        btnFavFilter.classList.toggle('border-white/20',   !showOnlyFavs);
      }
    }

    btnFavFilter?.addEventListener('click', () => {
      showOnlyFavs = !showOnlyFavs;
      applyFilter();
    });

    document.querySelectorAll('.btn-fav').forEach(btn => {
      btn.addEventListener('click', async () => {
        const playId = Number(btn.dataset.playId);
        const isFav  = btn.dataset.isFav === 'true';
        const favId  = btn.dataset.favId;
        btn.disabled = true;
        btn.innerHTML = `<span class="material-symbols-outlined animate-spin" style="font-size:14px;">progress_activity</span>`;

        if (isFav && favId) {
          const res = await removeFavorite(favId);
          if (res.success) {
            btn.dataset.isFav = 'false'; btn.dataset.favId = '';
            btn.closest('[data-play-id]').dataset.isFav = 'false';
            btn.classList.remove('bg-theatreGold','text-theatreDark');
            btn.classList.add('bg-black/60','text-theatreGray');
            btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:16px;font-variation-settings:'FILL' 0;">favorite</span>`;
            window.showToast?.('Eliminado de favoritos','info');
          } else {
            window.showToast?.('No se pudo quitar de favoritos','error');
            btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:16px;font-variation-settings:'FILL' 1;">favorite</span>`;
          }
        } else {
          const res = await addFavorite(playId);
          if (res.success) {
            btn.dataset.isFav = 'true'; btn.dataset.favId = res.data?.id || '';
            btn.closest('[data-play-id]').dataset.isFav = 'true';
            btn.classList.add('bg-theatreGold','text-theatreDark');
            btn.classList.remove('bg-black/60','text-theatreGray');
            btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:16px;font-variation-settings:'FILL' 1;">favorite</span>`;
            window.showToast?.('Agregado a favoritos','success');
          } else {
            window.showToast?.('No se pudo agregar a favoritos','error');
            btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:16px;font-variation-settings:'FILL' 0;">favorite</span>`;
          }
        }
        btn.disabled = false;
        // Re-aplicar filtro por si cambió el estado de fav mientras filtramos
        if (showOnlyFavs) applyFilter();
      });
    });
  }, 0);

  return `
    ${renderNavbar('cartelera')}
    <main class="${NAV_HEIGHT} min-h-screen">
      <div class="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div class="text-center mb-10">
          <p class="text-theatreGold text-[10px] tracking-[0.4em] uppercase mb-2">Temporada 2025</p>
          <h1 class="font-serif text-3xl md:text-4xl text-theatreBeige mb-4">Cartelera</h1>
          <div class="flex items-center justify-center space-x-4">
            <div class="w-12 h-px bg-theatreGold/30"></div>
            <div class="w-2 h-2 rotate-45 border border-theatreGold/40"></div>
            <div class="w-12 h-px bg-theatreGold/30"></div>
          </div>
        </div>

        <!-- Filtro -->
        <div class="flex justify-end mb-8">
          <button id="btn-filter-favs"
                  class="flex items-center gap-2 px-4 py-2 border border-white/20 text-theatreGold
                         text-[10px] uppercase tracking-widest transition-all duration-200 hover:border-theatreGold">
            <span class="material-symbols-outlined" style="font-size:16px;font-variation-settings:'FILL' 0;">favorite</span>
            Solo favoritos
          </button>
        </div>

        ${!playsRes.success
          ? `<div class="text-center text-theatreGray py-20">
               <span class="material-symbols-outlined text-5xl mb-4 block text-theatreGold/30">theater_comedy</span>
               <p>No se pudo cargar la cartelera. Intenta de nuevo más tarde.</p>
             </div>`
          : plays.length === 0
            ? `<div class="text-center text-theatreGray py-20">
                 <span class="material-symbols-outlined text-5xl mb-4 block text-theatreGold/30">theater_comedy</span>
                 <p>No hay obras disponibles en este momento.</p>
               </div>`
            : `<div id="plays-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                 ${plays.map(p => playCardHTML(p, favMap[p.id]?.isFav ?? false, favMap[p.id]?.favId ?? '')).join('')}
               </div>
               <div id="favs-empty" class="hidden text-center text-theatreGray py-20">
                 <span class="material-symbols-outlined text-5xl mb-4 block text-theatreGold/30">favorite</span>
                 <p>No tienes obras en favoritos aún.</p>
               </div>`
        }
      </div>
    </main>
    <footer class="border-t border-white/5 py-6">
      <p class="text-center text-[9px] text-theatreGray/30 uppercase tracking-[0.4em]">© 2025 Teatro Eventual</p>
    </footer>
  `;
}