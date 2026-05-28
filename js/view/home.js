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
//  Helpers
// ─────────────────────────────────────────────────────────────

function cardHTML({ title, genre, date, room, img }) {
  return `
    <div class="card-border-frame p-6 bg-black/40 flex flex-col group
                hover:border-theatreGold/60 transition-colors duration-500">
      <div class="aspect-[4/5] mb-6 overflow-hidden">
        <img src="${img}" alt="${title.replace(/<br\/>/g, ' ')}"
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
              class="flex items-center gap-2 px-4 py-2 bg-theatreGold text-theatreDark
                     text-[9px] font-bold tracking-[0.1em] hover:brightness-110 transition-all duration-300">
        <span class="material-symbols-outlined text-[14px]">person</span>
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
       class="flex items-center gap-2 px-4 py-2 bg-theatreBurgundy text-white text-[9px]
              font-semibold tracking-[0.1em] hover:brightness-110 transition-all duration-300">
      <span class="material-symbols-outlined text-[14px]">confirmation_number</span>
      REGISTRARSE
    </a>`;
}

// ─────────────────────────────────────────────────────────────
//  Render
// ─────────────────────────────────────────────────────────────

export async function renderHome() {

  const app = document.querySelector('#app');
  if (app) {
    app.addEventListener('view:mounted', () => {
      document.getElementById('btn-dashboard')?.addEventListener('click',      () => navigate('dashboard'));
      document.getElementById('btn-hero-dashboard')?.addEventListener('click', () => navigate('dashboard'));

      // Scroll activo en nav
      const navLinks = document.querySelectorAll('[data-nav-link]');
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            navLinks.forEach(l => l.classList.remove('text-theatreGold', 'border-b', 'border-theatreGold/50'));
            const active = document.querySelector(`[data-nav-link="${entry.target.id}"]`);
            active?.classList.add('text-theatreGold', 'border-b', 'border-theatreGold/50');
          }
        });
      }, { threshold: 0.4 });

      document.querySelectorAll('[data-section]').forEach(s => observer.observe(s));
    }, { once: true });
  }

  return `
    <!-- ══════════════════════════════════════════
         HEADER
    ════════════════════════════════════════════ -->
    <header class="fixed top-0 w-full z-50 bg-theatreDark/90 backdrop-blur-md border-b border-white/5">
      <nav class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">

        <!-- ── Logo ── -->
        <a href="#/" class="flex items-center gap-3 flex-shrink-0 group">
          <svg class="w-8 h-8 text-theatreGold group-hover:scale-110 transition-transform duration-300"
               fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M2 10l10-7 10 7M10 14h4"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="flex flex-col leading-none">
            <span class="font-serif text-theatreGold text-sm tracking-[0.15em] uppercase">
              Teatro
            </span>
            <span class="font-serif text-theatreBeige text-[10px] tracking-[0.3em] uppercase opacity-60">
              Eventual
            </span>
          </div>
        </a>

        <!-- ── Nav links (desktop) ── -->
        <div class="hidden md:flex items-center gap-8">
          <a href="#/"
             data-nav-link="hero"
             class="text-theatreGold text-[9px] font-semibold tracking-[0.2em] uppercase
                    border-b border-theatreGold/50 pb-0.5 transition-all duration-300">
            INICIO
          </a>
          <a href="#cartelera"
             data-nav-link="cartelera"
             class="text-theatreGray text-[9px] font-semibold tracking-[0.2em] uppercase
                    hover:text-theatreGold transition-all duration-300 pb-0.5
                    border-b border-transparent hover:border-theatreGold/50">
            CARTELERA
          </a>
          <a href="#/cartelera"
             class="text-theatreGray text-[9px] font-semibold tracking-[0.2em] uppercase
                    hover:text-theatreGold transition-all duration-300 pb-0.5
                    border-b border-transparent hover:border-theatreGold/50">
            VER TODO
          </a>
        </div>

        <!-- ── Separador visual ── -->
        <div class="hidden md:block w-px h-5 bg-white/10 flex-shrink-0"></div>

        <!-- ── Auth buttons ── -->
        <div class="flex items-center gap-3">
          ${navAuthButtons()}

          <!-- Menú móvil (hamburger) -->
          <button id="mobile-menu-btn"
                  class="md:hidden flex flex-col gap-1 p-2 hover:opacity-70 transition-opacity">
            <span class="w-5 h-px bg-theatreBeige block"></span>
            <span class="w-5 h-px bg-theatreBeige block"></span>
            <span class="w-3 h-px bg-theatreGold block"></span>
          </button>
        </div>
      </nav>

      <!-- ── Menú móvil desplegable ── -->
      <div id="mobile-menu"
           class="md:hidden hidden border-t border-white/5 bg-theatreDark/95 backdrop-blur-md">
        <div class="flex flex-col px-6 py-4 gap-4">
          <a href="#/"
             class="text-theatreGold text-[10px] tracking-[0.2em] uppercase font-semibold">
            INICIO
          </a>
          <a href="#cartelera"
             class="text-theatreGray text-[10px] tracking-[0.2em] uppercase font-semibold
                    hover:text-theatreGold transition-colors"
             onclick="document.getElementById('mobile-menu').classList.add('hidden')">
            CARTELERA
          </a>
          <a href="#/cartelera"
             class="text-theatreGray text-[10px] tracking-[0.2em] uppercase font-semibold
                    hover:text-theatreGold transition-colors">
            VER TODO
          </a>
          <div class="w-full h-px bg-white/5 my-1"></div>
          ${isAuthenticated()
            ? `<button onclick="navigate('dashboard')"
                       class="text-left text-theatreGold text-[10px] tracking-[0.2em] uppercase font-semibold">
                 MI CUENTA
               </button>`
            : `<a href="#/login"  class="text-theatreBeige text-[10px] tracking-[0.2em] uppercase">INICIAR SESIÓN</a>
               <a href="#/register" class="text-theatreBeige text-[10px] tracking-[0.2em] uppercase">REGISTRARSE</a>`
          }
        </div>
      </div>
    </header>

    <!-- ══════════════════════════════════════════
         HERO
    ════════════════════════════════════════════ -->
    <section data-section id="hero"
             class="hero-section"
             style="position:relative;height:100vh;display:flex;align-items:center;overflow:hidden;">
      <div class="hero-bg" style="position:absolute;inset:0;z-index:0;"></div>
      <div class="hero-overlay" style="position:absolute;inset:0;z-index:1;
        background: linear-gradient(to right,rgba(10,10,10,1) 0%,rgba(10,10,10,.85) 40%,rgba(10,10,10,.2) 70%,rgba(10,10,10,0) 100%),
                    linear-gradient(to top,rgba(10,10,10,.7) 0%,rgba(10,10,10,0) 40%),
                    linear-gradient(to bottom,rgba(10,10,10,.5) 0%,rgba(10,10,10,0) 20%);"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div class="max-w-2xl">
          <div class="fade-up flex items-center gap-3 mb-6">
            <div class="w-8 h-px bg-theatreGold/60"></div>
            <p class="text-theatreGold text-[10px] tracking-[0.4em] uppercase font-medium opacity-80">
              Temporada 2025
            </p>
          </div>
          <h1 class="fade-up delay-1 text-white text-5xl md:text-7xl font-serif mb-6 leading-tight tracking-tight">
            VIVE LA MAGIA <br/>
            <span class="gold-text-gradient uppercase tracking-widest">DEL TEATRO</span>
          </h1>
          <p class="fade-up delay-2 text-theatreGray text-lg md:text-xl mb-10 font-light tracking-wide max-w-lg leading-relaxed">
            Donde las historias cobran vida y el arte trasciende el tiempo.
            Descubre nuestra temporada actual.
          </p>
          <div class="fade-up delay-3 flex flex-wrap gap-4">
            <a href="#/cartelera"
               class="flex items-center gap-2 px-8 py-3 bg-theatreBurgundy text-white text-[11px]
                      font-bold tracking-[0.2em] uppercase hover:brightness-110 transition-all duration-300">
              <span class="material-symbols-outlined text-[16px]">theater_comedy</span>
              VER CARTELERA
            </a>
            ${isAuthenticated()
              ? `<button id="btn-hero-dashboard"
                         class="flex items-center gap-2 px-8 py-3 border border-theatreGold/50 text-theatreGold
                                text-[11px] font-bold tracking-[0.2em] uppercase
                                hover:bg-theatreGold/10 transition-all duration-300">
                   <span class="material-symbols-outlined text-[16px]">person</span>
                   MI CUENTA
                 </button>`
              : `<a href="#/login"
                   class="flex items-center gap-2 px-8 py-3 border border-theatreGold/50 text-theatreGold
                          text-[11px] font-bold tracking-[0.2em] uppercase
                          hover:bg-theatreGold/10 transition-all duration-300">
                   <span class="material-symbols-outlined text-[16px]">confirmation_number</span>
                   RESERVAR ENTRADAS
                 </a>`
            }
          </div>

          <!-- Stats rápidas -->
        
        </div>
      </div>

      <!-- Scroll hint -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-40">
        <span class="text-[8px] tracking-[0.3em] uppercase text-white">Desplaza</span>
        <div class="w-px h-10 bg-white/30 animate-pulse"></div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         CARTELERA
    ════════════════════════════════════════════ -->
    <section data-section id="cartelera" class="py-24 bg-theatreDark relative">

      <!-- Línea decorativa lateral -->
      <div class="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-theatreGold/20 to-transparent"></div>

      <div class="max-w-7xl mx-auto px-6">

        <!-- Título con badge -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p class="text-theatreGold text-[9px] tracking-[0.4em] uppercase mb-3 opacity-70">
              En escena ahora
            </p>
            <h2 class="text-theatreBeige text-3xl md:text-4xl tracking-[0.1em] font-serif uppercase">
              Próximas Funciones
            </h2>
            <div class="flex items-center gap-3 mt-3">
              <div class="w-10 h-px bg-theatreGold/40"></div>
              <div class="w-1.5 h-1.5 rotate-45 border border-theatreGold/40"></div>
              <div class="w-10 h-px bg-theatreGold/40"></div>
            </div>
          </div>
          <a href="#/cartelera"
             class="flex items-center gap-2 text-theatreGold text-[9px] tracking-[0.2em]
                    uppercase hover:gap-3 transition-all duration-300 self-end md:self-auto">
            Ver cartelera completa
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>

        <!-- Grid de obras -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          ${SHOWS.map(cardHTML).join('')}
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         FEATURES BAR
    ════════════════════════════════════════════ -->
    <section class="bg-black py-16 border-t border-white/5 relative overflow-hidden">

      <!-- Glow de fondo -->
      <div class="absolute inset-0 pointer-events-none"
           style="background:radial-gradient(ellipse at 50% 100%,rgba(107,17,29,.12),transparent 60%);"></div>

      <div class="max-w-7xl mx-auto px-6 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          ${[
            { icon: 'confirmation_number', title: 'Reserva en Línea',  desc: 'Compra tus entradas de forma segura desde cualquier dispositivo.' },
            { icon: 'star',                title: 'Experiencia Única',  desc: 'Más de 50 años llevando el mejor teatro a tu ciudad.'             },
            { icon: 'workspace_premium',   title: 'Palcos Exclusivos',  desc: 'Acceso prioritario para miembros y abonados de temporada.'         },
          ].map((f, i) => `
            <div class="flex flex-col items-center group">
              <div class="w-14 h-14 rounded-full border border-theatreGold/20 flex items-center justify-center
                          mb-5 group-hover:border-theatreGold/50 group-hover:bg-theatreGold/5 transition-all duration-300">
                <span class="material-symbols-outlined text-theatreGold text-[28px]">${f.icon}</span>
              </div>
              <h3 class="font-serif text-theatreBeige text-base tracking-widest uppercase mb-3">${f.title}</h3>
              <p class="text-theatreGray text-sm font-light leading-relaxed max-w-xs">${f.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         CTA MEMBRESÍA
    ════════════════════════════════════════════ -->
    <section class="py-20 relative overflow-hidden"
             style="background:linear-gradient(135deg,#0A0A0A 0%,#1a0a0e 50%,#0A0A0A 100%);">
      <div class="absolute inset-0 pointer-events-none"
           style="background:radial-gradient(ellipse at 30% 50%,rgba(212,175,55,.06),transparent 55%),
                             radial-gradient(ellipse at 70% 50%,rgba(107,17,29,.1),transparent 55%);"></div>
      <div class="max-w-4xl mx-auto px-6 text-center relative z-10">
        <p class="text-theatreGold text-[9px] tracking-[0.4em] uppercase mb-4 opacity-70">Membresía</p>
        <h2 class="font-serif text-3xl md:text-5xl text-theatreBeige uppercase tracking-tight mb-6">
          Únete al Círculo<br/>
          <span class="gold-text-gradient">Gran Teatro</span>
        </h2>
        <p class="text-theatreGray text-lg font-light leading-relaxed max-w-2xl mx-auto mb-10">
          Acceso anticipado a preventas, contenido exclusivo detrás de escena
          y beneficios únicos en cada función de la temporada.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#/register"
             class="flex items-center gap-2 px-10 py-4 bg-theatreBurgundy text-white text-[11px]
                    font-bold tracking-[0.2em] uppercase hover:brightness-110 transition-all duration-300">
            <span class="material-symbols-outlined text-[16px]">workspace_premium</span>
            CREAR CUENTA
          </a>
          <a href="#/login"
             class="flex items-center gap-2 px-10 py-4 border border-white/15 text-theatreBeige
                    text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-white/5 transition-all duration-300">
            YA TENGO CUENTA
          </a>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         FOOTER
    ════════════════════════════════════════════ -->
    <footer class="bg-black py-12 border-t border-white/5">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">

          <!-- Marca -->
          <div class="flex flex-col gap-4 max-w-xs">
            <div class="flex items-center gap-3">
              <svg class="w-7 h-7 text-theatreGold" fill="none" stroke="currentColor"
                   stroke-width="1.5" viewBox="0 0 24 24">
                <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M2 10l10-7 10 7M10 14h4"
                      stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="font-serif text-theatreGold tracking-[0.3em] uppercase text-sm">Teatro Eventual</span>
            </div>
            <p class="text-theatreGray text-xs font-light leading-relaxed">
              El epicentro de las artes escénicas. Donde la tradición se encuentra con la innovación.
            </p>
          </div>

          <!-- Links -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-8 text-[10px]">
            <div class="flex flex-col gap-3">
              <span class="text-theatreGold tracking-[0.2em] uppercase font-semibold">Programa</span>
              <a href="#/cartelera" class="text-theatreGray hover:text-theatreGold transition-colors">Cartelera</a>
              <a href="#"           class="text-theatreGray hover:text-theatreGold transition-colors">Abonos</a>
              <a href="#"           class="text-theatreGray hover:text-theatreGold transition-colors">Archivo</a>
            </div>
            <div class="flex flex-col gap-3">
              <span class="text-theatreGold tracking-[0.2em] uppercase font-semibold">Teatro</span>
              <a href="#" class="text-theatreGray hover:text-theatreGold transition-colors">Prensa</a>
              <a href="#" class="text-theatreGray hover:text-theatreGold transition-colors">Contacto</a>
              <a href="#" class="text-theatreGray hover:text-theatreGold transition-colors">Donaciones</a>
            </div>
            <div class="flex flex-col gap-3">
              <span class="text-theatreGold tracking-[0.2em] uppercase font-semibold">Cuenta</span>
              <a href="#/login"    class="text-theatreGray hover:text-theatreGold transition-colors">Iniciar sesión</a>
              <a href="#/register" class="text-theatreGray hover:text-theatreGold transition-colors">Registrarse</a>
              <a href="#/dashboard" class="text-theatreGray hover:text-theatreGold transition-colors">Mi dashboard</a>
            </div>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="flex flex-col md:flex-row justify-between items-center gap-4
                    pt-8 border-t border-white/5">
          <p class="text-[8px] text-theatreGray/40 uppercase tracking-[0.5em] font-medium">
            © 2025 Gran Teatro. Todos los derechos reservados.
          </p>
          <div class="flex items-center gap-1 text-[8px] text-theatreGray/30 uppercase tracking-widest">
            Hecho con
            <span class="material-symbols-outlined text-theatreBurgundy text-[12px]"
                  style="font-variation-settings:'FILL' 1;">favorite</span>
            para las artes
          </div>
        </div>
      </div>
    </footer>
  `;
}