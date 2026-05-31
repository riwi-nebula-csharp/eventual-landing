/**
 * ============================================================
 *  view/home.js — Landing pública | Teatro Eventual
 * ============================================================
 */

import { isAuthenticated } from '../auth.js';
import { navigate }        from '../router.js';
import { getPlays }        from '../api.events.js';

// ── Helpers ───────────────────────────────────────────────

function playCardHTML(play) {
  return `
    <div class="card-border-frame p-6 bg-black/40 flex flex-col group
                hover:border-theatreGold/60 transition-colors duration-500 cursor-pointer"
         data-play-id="${play.id}">
      <div class="aspect-[4/5] mb-6 overflow-hidden">
        ${play.posterUrl
          ? `<img src="${play.posterUrl}" alt="${play.name}"
                  class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"/>`
          : `<div class="w-full h-full bg-theatreBurgundy/20 flex items-center justify-center">
               <span class="material-symbols-outlined text-theatreGold/30" style="font-size:3rem;">theater_comedy</span>
             </div>`
        }
      </div>
      <h3 class="text-theatreGold font-serif text-lg text-center mb-6 uppercase
                 tracking-[0.1em] leading-tight px-2 min-h-[2.5rem] flex items-center justify-center">
        ${play.name}
      </h3>
      ${play.description ? `
        <p class="text-theatreGray text-xs text-center mb-4 font-light leading-relaxed line-clamp-2 px-2">
          ${play.description}
        </p>` : ''}
      <div class="mt-auto">
        <button class="btn-ver-funciones relative z-10 w-full py-2.5 bg-theatreBurgundy text-white text-[10px]
                       font-bold tracking-[0.15em] hover:brightness-110 transition-all uppercase"
                data-play-id="${play.id}">
          Ver Funciones
        </button>
      </div>
    </div>`;
}

function skeletonCard() {
  return `
    <div class="card-border-frame p-6 bg-black/40 animate-pulse">
      <div class="aspect-[4/5] mb-6 bg-white/5 rounded"></div>
      <div class="h-4 bg-white/5 rounded mb-3 mx-4"></div>
      <div class="h-3 bg-white/5 rounded mb-2 mx-8"></div>
      <div class="h-8 bg-white/5 rounded mt-6"></div>
    </div>`;
}

// ── Render ────────────────────────────────────────────────

export async function renderHome() {
  const authed = isAuthenticated();

  // Si está autenticado, ir directo a cartelera
  if (authed) {
    navigate('cartelera');
    return '<div></div>';
  }

  // Cargar obras de la API para mostrar en la landing pública
  let plays = [];
  let loadError = false;
  try {
    const res = await getPlays();
    if (res.success && Array.isArray(res.data)) {
      plays = res.data.slice(0, 4);
    } else {
      loadError = true;
    }
  } catch {
    loadError = true;
  }

  setTimeout(() => {
    document.querySelectorAll('.btn-ver-funciones').forEach(btn => {
      btn.addEventListener('click', () => {
        window.showToast?.('Inicia sesión para comprar entradas.', 'info');
        navigate('login');
      });
    });
  }, 0);

  return `
    <!-- HEADER -->
    <header class="fixed top-0 w-full z-50 bg-theatreDark/80 backdrop-blur-md border-b border-white/5">
      <nav class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="flex flex-col items-center">
            <svg class="w-10 h-10 text-theatreGold" fill="none" stroke="currentColor"
                 stroke-width="1.5" viewBox="0 0 24 24">
              <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M2 10l10-7 10 7M10 14h4"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="text-[9px] tracking-[0.3em] font-serif text-theatreGold mt-1 leading-none uppercase">
              Eventual Teatro
            </span>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <a href="#/login"
             class="px-4 py-2 border border-white/20 text-[9px] font-semibold tracking-[0.1em]
                    hover:bg-white/5 transition-all duration-300 text-theatreBeige">
            INICIAR SESIÓN
          </a>
          <a href="#/register"
             class="px-4 py-2 bg-theatreBurgundy text-white text-[9px] font-semibold
                    tracking-[0.1em] hover:brightness-110 transition-all duration-300">
            REGISTRARSE
          </a>
        </div>
      </nav>
    </header>

    <!-- HERO -->
    <section class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      <div class="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div class="max-w-2xl">
          <p class="fade-up text-theatreGold text-[10px] tracking-[0.4em] uppercase font-medium mb-4 opacity-80">
            Temporada 2025
          </p>
          <h1 class="fade-up delay-1 text-white text-5xl md:text-7xl font-serif mb-6 leading-tight tracking-tight">
            VIVE LA MAGIA <br/>
            <span class="gold-text-gradient uppercase tracking-widest">DEL TEATRO</span>
          </h1>
          <p class="fade-up delay-2 text-theatreGray text-lg md:text-xl mb-10 font-light tracking-wide max-w-lg leading-relaxed">
            Donde las historias cobran vida y el arte trasciende el tiempo.
            Descubre nuestra temporada actual.
          </p>
          <div class="fade-up delay-3 flex flex-wrap gap-4">
            <a href="#cartelera"
               class="px-8 py-3 bg-theatreBurgundy text-white text-[11px] font-bold tracking-[0.2em]
                      uppercase hover:brightness-110 transition-all duration-300">
              VER CARTELERA
            </a>
            <a href="#/login"
               class="px-8 py-3 border border-theatreGold/50 text-theatreGold text-[11px]
                      font-bold tracking-[0.2em] uppercase hover:bg-theatreGold/10 transition-all duration-300">
              RESERVAR ENTRADAS
            </a>
          </div>
        </div>
      </div>
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center space-y-2 opacity-40">
        <span class="text-[8px] tracking-[0.3em] uppercase text-white">Desplaza</span>
        <div class="w-px h-10 bg-white/30 animate-pulse"></div>
      </div>
    </section>

    <!-- CARTELERA -->
    <section class="py-24 bg-theatreDark relative" id="cartelera">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-theatreGold text-2xl tracking-[0.3em] font-serif uppercase mb-4">
            Cartelera
          </h2>
          <div class="flex items-center justify-center space-x-4">
            <div class="w-12 h-px bg-theatreGold/30"></div>
            <div class="w-2 h-2 rotate-45 border border-theatreGold/40"></div>
            <div class="w-12 h-px bg-theatreGold/30"></div>
          </div>
          <p class="mt-4 text-theatreGray text-sm">
            <a href="#/login" class="text-theatreGold hover:underline">Inicia sesión</a>
            para comprar tus entradas
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          ${loadError
            ? `<div class="col-span-4 text-center text-theatreGray py-12">
                 <span class="material-symbols-outlined text-4xl mb-3 block text-theatreGold/40">theater_comedy</span>
                 No se pudo cargar la cartelera en este momento.
               </div>`
            : plays.length > 0
              ? plays.map(playCardHTML).join('')
              : [1,2,3,4].map(skeletonCard).join('')
          }
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="bg-black py-16 border-t border-white/5">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          ${[
            { icon: 'confirmation_number', title: 'Reserva en Línea',   desc: 'Compra tus entradas de forma segura desde cualquier dispositivo.' },
            { icon: 'star',               title: 'Experiencia Única',   desc: 'Llevando el mejor teatro a tu ciudad.' },
            { icon: 'workspace_premium',  title: 'Boleta Digital',      desc: 'Recibe tu código QR y preséntalo en la puerta del teatro.' },
          ].map(f => `
            <div class="flex flex-col items-center">
              <span class="material-symbols-outlined text-theatreGold text-4xl mb-4">${f.icon}</span>
              <h3 class="font-serif text-theatreBeige text-lg tracking-widest uppercase mb-2">${f.title}</h3>
              <p class="text-theatreGray text-sm font-light leading-relaxed max-w-xs">${f.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="bg-black py-12 border-t border-white/5">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <div class="flex flex-col items-center">
          <span class="font-serif text-theatreGold tracking-[0.3em] uppercase text-sm mb-2">Teatro Eventual</span>
          <div class="w-8 h-px bg-theatreGold/20 mb-6"></div>
          <p class="text-[8px] text-theatreGray/40 uppercase tracking-[0.5em] font-medium">
            © 2025 Teatro Eventual. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  `;
}