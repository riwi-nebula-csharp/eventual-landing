/**
 * ============================================================
 *  view/home.js — Vista principal (Landing)
 *  Teatro Eventual
 * ============================================================
 */

import { isAuthenticated, getUser } from '../auth.js';
import { navigate }                 from '../router.js';

// ─────────────────────────────────────────────────────────────
//  Datos de cartelera (en producción vendrían de la API)
// ─────────────────────────────────────────────────────────────
const SHOWS = [
  {
    title: 'La Bella y<br/>la Bestia',
    genre: 'Musical',
    date:  '24 MAY • 20:00',
    room:  'Sala Principal',
    img:   'https://lh3.googleusercontent.com/aida-public/AB6AXuCQKrU5Rk9yUX0U0CY-W5C3ciz4Pz3FGg7k8GPCDM3Xjc35Fe7f5ccufTQfxfdjnteM8ZSx73NAjIg7dnbU462HwA-i9YISpB2VR5FEVRsyYD-AHR8rs4ogtff_me--z59Zzp1HPj7s3bBwv9LbvrLLZtu3xdn7Te_NmzUFw13qLIe3Xg7rtDCxC4p_Ew2Y5oC9bPMFwxYE8VvjMbcQEbuHJJRSAoHPXRHB4jx3NXZUjjnBZ5Wft8v9RSy_AkXvh-V0n2muXWvGPgmB',
  },
  {
    title: 'El Fantasma<br/>de la Ópera',
    genre: 'Musical',
    date:  '25 MAY • 19:00',
    room:  'Sala Principal',
    img:   'https://lh3.googleusercontent.com/aida-public/AB6AXuDxZXrYfiL6E1ZhVAi-rDdbinzAiDjIqbCSvViaTo6EGwwUJu3fL1zdDEX5ad5rS5UGCZ1-jABkXSRwdU730DBkUzG2wmJF02awW39aDO-Mb1_0rUstDl6oWf_fVwYJTTm5gQ9YpZxcclf3eWUvyeeaiEozggUV898u0fRjEFbl18yX9fYNU3NvEUW4EJyZRNPIDnRvxpHNj3-DiyBzJNK2jvGVS-WosRVIQHHSZz4cX9GQ_w3_3AMeZeb8kI52AdqMyQ1yQiSGnfDH',
  },
  {
    title: 'Los<br/>Miserables',
    genre: 'Drama',
    date:  '25 MAY • 19:00',
    room:  'Sala Principal',
    img:   'https://lh3.googleusercontent.com/aida-public/AB6AXuBTZlRRvX_Sv6cB2BBsvWh-HWJtbhq-lYj8ZBgokIJNd0zD5XcU-xibfQbcrz_ODlzHgX1ugFkiHhXMpPia0dKKYca3A7EdUbTrmExq5e-jLlJ0EPM4JVUjDUwqPve4yJC4u2jfGPfUEg3oneaC9gx5TKVwzUC0I6u0as2y5nwkpbGm8bxyk_JX21fze9xtwQOKD6AsVa26OB6WeeEiiY8Tx-HOjCxmG5-8BSntLGcg9g2ZnemoVDy1pok3FlhqR4Rque_tJ6khNG5N',
  },
  {
    title: 'El Lago<br/>de los Cisnes',
    genre: 'Ballet',
    date:  '29 MAY • 18:00',
    room:  'Sala Principal',
    img:   'https://lh3.googleusercontent.com/aida-public/AB6AXuBMf8Eltu4RdWgeg8azB1XKFELibTQ5XbzlPaRkvKSNS_C8a8YaJ5r3bL1F6hE5iBFLncjE8wFuzTNWCh431mEpSsVpdiFaOvDYAPkkajzLYPthcTKGpDs9b6ZVhOqIMlHexzf7cr9U-YM_FuKMv3gIsOD3z7WjL3DH46_JlOefFtt0Pulwmb1sEIG9kS7bXu93lQ7uQS6Jh-GnaEYueaA0KxQyeB2Xs9x3Rm2LIu0jXYDAreRk_zxuYK0A6UG0vSm9LsacUDXgYFJm',
  },
];

// ─────────────────────────────────────────────────────────────
//  Helpers de plantilla
// ─────────────────────────────────────────────────────────────

function cardHTML({ title, genre, date, room, img }) {
  return `
    <div class="card-border-frame p-6 bg-black/40 flex flex-col group
                hover:border-theatreGold/60 transition-colors duration-500">
      <div class="aspect-[4/5] mb-6 overflow-hidden">
        <img src="${img}" alt="${title.replace(/<br\/>/g,' ')}"
             class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"/>
      </div>
      <h3 class="text-theatreGold font-serif text-lg text-center mb-6 uppercase
                 tracking-[0.1em] leading-tight px-2 h-10 flex items-center justify-center">
        ${title}
      </h3>
      <div class="space-y-2 text-left text-[10px] text-theatreGray mb-8 px-2 font-light">
        <p class="opacity-60">${genre}</p>
        <p class="flex items-center tracking-wider">
          <span class="material-symbols-outlined text-[12px] mr-2 text-theatreGold">calendar_today</span>
          ${date}
        </p>
        <p class="flex items-center tracking-wider">
          <span class="material-symbols-outlined text-[12px] mr-2 text-theatreGold">location_on</span>
          ${room}
        </p>
      </div>
      <button class="relative z-10 w-full py-2.5 bg-theatreBurgundy text-white text-[10px]
                     font-bold tracking-[0.15em] hover:brightness-110 transition-all uppercase">
        Ver Detalles
      </button>
    </div>`;
}

function navAuthButtons() {
  if (isAuthenticated()) {
    const user = getUser();
    return `
      <span class="text-theatreGray text-[9px] tracking-widest hidden md:block">
        Hola, ${user?.name?.split(' ')[0] ?? 'Usuario'}
      </span>
      <button id="btn-dashboard"
              class="px-4 py-2 bg-theatreGold text-theatreDark text-[9px] font-bold
                     tracking-[0.1em] hover:brightness-110 transition-all duration-300">
        MI CUENTA
      </button>`;
  }
  return `
    <a href="#/login"
       class="px-4 py-2 border border-white/20 text-[9px] font-semibold tracking-[0.1em]
              hover:bg-white/5 transition-all duration-300 text-theatreBeige">
      INICIAR SESIÓN
    </a>
    <a href="#/register"
       class="px-4 py-2 bg-theatreBurgundy text-white text-[9px] font-semibold
              tracking-[0.1em] hover:brightness-110 transition-all duration-300">
      REGISTRARSE
    </a>`;
}

// ─────────────────────────────────────────────────────────────
//  Render
// ─────────────────────────────────────────────────────────────

export async function renderHome() {

  // Registrar handlers ANTES de retornar (se ejecutan tras view:mounted)
  const app = document.querySelector('#app');
  if (app) {
    app.addEventListener('view:mounted', () => {
      document.getElementById('btn-dashboard')?.addEventListener('click', () => navigate('dashboard'));
    }, { once: true });
  }

  return `
    <!-- ══════════════════════════════════════════
         HEADER
    ════════════════════════════════════════════ -->
    <header class="fixed top-0 w-full z-50 bg-theatreDark/80 backdrop-blur-md border-b border-white/5">
      <nav class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <!-- Logo -->
        <div class="flex items-center space-x-3">
          <div class="flex flex-col items-center">
            <svg class="w-10 h-10 text-theatreGold" fill="none" stroke="currentColor"
                 stroke-width="1.5" viewBox="0 0 24 24">
              <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M2 10l10-7 10 7M10 14h4"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="text-[9px] tracking-[0.3em] font-serif text-theatreGold mt-1 leading-none uppercase">
              eventual Teatro
            </span>
          </div>
        </div>
        <div>
          <a href="#/cartelera" class="text-theatreBeige text-[9px] tracking-[0.1em] uppercase
              hover:text-theatreGold transition-colors duration-300">
              Cartelera
            </a>
        </div>


        <!-- Auth Buttons -->
        <div class="flex items-center space-x-3">
          ${navAuthButtons()}
        </div>
      </nav>
    </header>

    <!-- ══════════════════════════════════════════
         HERO
    ════════════════════════════════════════════ -->
    <section class="hero-section" style="position:relative;height:100vh;display:flex;align-items:center;overflow:hidden;">
      <div class="hero-bg" style="position:absolute;inset:0;z-index:0;"></div>
      <div class="hero-overlay" style="position:absolute;inset:0;z-index:1;
        background: linear-gradient(to right, rgba(10,10,10,1) 0%, rgba(10,10,10,.85) 40%, rgba(10,10,10,.2) 70%, rgba(10,10,10,0) 100%),
                    linear-gradient(to top, rgba(10,10,10,.7) 0%, rgba(10,10,10,0) 40%),
                    linear-gradient(to bottom, rgba(10,10,10,.5) 0%, rgba(10,10,10,0) 20%);"></div>

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
            <a href="#/login"
               class="px-8 py-3 bg-theatreBurgundy text-white text-[11px] font-bold tracking-[0.2em]
                      uppercase hover:brightness-110 transition-all duration-300">
              VER CARTELERA
            </a>
            ${isAuthenticated()
              ? `<button id="btn-hero-dashboard"
                         class="px-8 py-3 border border-theatreGold/50 text-theatreGold text-[11px]
                                font-bold tracking-[0.2em] uppercase hover:bg-theatreGold/10 transition-all duration-300">
                   MI CUENTA
                 </button>`
              : `<a href="#/login"
                   class="px-8 py-3 border border-theatreGold/50 text-theatreGold text-[11px]
                          font-bold tracking-[0.2em] uppercase hover:bg-theatreGold/10 transition-all duration-300">
                   RESERVAR ENTRADAS
                 </a>`
            }
          </div>
        </div>
      </div>

      <!-- Scroll hint -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center space-y-2 opacity-40">
        <span class="text-[8px] tracking-[0.3em] uppercase text-white">Desplaza</span>
        <div class="w-px h-10 bg-white/30 animate-pulse"></div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         CARTELERA
    ════════════════════════════════════════════ -->
    <section class="py-24 bg-theatreDark relative" id="cartelera">
      <div class="max-w-7xl mx-auto px-6">
        <!-- Título -->
        <div class="text-center mb-20">
          <h2 class="text-theatreGold text-2xl tracking-[0.3em] font-serif uppercase mb-4">
            Próximas Funciones
          </h2>
          <div class="flex items-center justify-center space-x-4">
            <div class="w-12 h-px bg-theatreGold/30"></div>
            <div class="w-2 h-2 rotate-45 border border-theatreGold/40"></div>
            <div class="w-12 h-px bg-theatreGold/30"></div>
          </div>
        </div>
        <!-- Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          ${SHOWS.map(cardHTML).join('')}
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         FEATURES BAR
    ════════════════════════════════════════════ -->
    <section class="bg-black py-16 border-t border-white/5">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          ${[
            { icon: 'confirmation_number', title: 'Reserva en Línea',   desc: 'Compra tus entradas de forma segura desde cualquier dispositivo.' },
            { icon: 'star',               title: 'Experiencia Única',   desc: 'Más de 50 años llevando el mejor teatro a tu ciudad.'             },
            { icon: 'workspace_premium',  title: 'Palcos Exclusivos',   desc: 'Acceso prioritario para miembros y abonados de temporada.'         },
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

    <!-- ══════════════════════════════════════════
         FOOTER
    ════════════════════════════════════════════ -->
    <footer class="bg-black py-12 border-t border-white/5">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <div class="flex flex-col items-center">
          <span class="font-serif text-theatreGold tracking-[0.3em] uppercase text-sm mb-2">
            Teatro Eventual
          </span>
          <div class="w-8 h-px bg-theatreGold/20 mb-6"></div>
          <p class="text-[8px] text-theatreGray/40 uppercase tracking-[0.5em] font-medium">
            © 2025 Gran Teatro. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  `;
}