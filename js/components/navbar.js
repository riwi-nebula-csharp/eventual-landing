/**
 * ============================================================
 *  components/navbar.js — Navbar autenticado | Teatro Eventual
 * ============================================================
 */

import { getUser, logout } from '../auth.js';
import { navigate }        from '../router.js';

function avatarInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

export function renderNavbar(activePage = '') {
  const user = getUser();
  const links = [
    { href: 'cartelera',  label: 'Cartelera',    icon: 'theater_comedy' },
    { href: 'mis-tickets', label: 'Mis Tickets',  icon: 'confirmation_number' },
    { href: 'pqrs',        label: 'PQRS',         icon: 'support_agent' },
    { href: 'perfil',      label: 'Mi Perfil',    icon: 'person' },
  ];

  return `
    <header class="fixed top-0 w-full z-50 bg-theatreDark/90 backdrop-blur-md border-b border-white/5">
      <nav class="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">

        <!-- Logo -->
        <a href="#/" class="flex items-center gap-2.5 group">
          <svg class="w-8 h-8 text-theatreGold" fill="none" stroke="currentColor"
               stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M2 10l10-7 10 7M10 14h4"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="text-[10px] tracking-[0.3em] font-serif text-theatreGold uppercase hidden sm:block">
            Eventual Teatro
          </span>
        </a>

        <!-- Nav links (desktop) -->
        <div class="hidden md:flex items-center space-x-1">
          ${links.map(l => `
            <a href="#/${l.href}"
               class="flex items-center gap-1.5 px-3 py-2 text-[10px] tracking-[0.12em] uppercase font-medium
                      transition-all duration-200 rounded
                      ${activePage === l.href
                        ? 'text-theatreGold bg-theatreGold/10'
                        : 'text-theatreGray hover:text-theatreGold hover:bg-white/5'}">
              <span class="material-symbols-outlined" style="font-size:15px;">${l.icon}</span>
              ${l.label}
            </a>
          `).join('')}
        </div>

        <!-- Usuario + logout -->
        <div class="flex items-center gap-3">
          ${user?.avatar_url
            ? `<img src="${user.avatar_url}" alt="Avatar"
                    class="w-8 h-8 rounded-full object-cover border border-theatreGold/30"/>`
            : `<div class="w-8 h-8 rounded-full bg-theatreBurgundy flex items-center justify-center
                          text-theatreGold text-xs font-bold font-serif select-none border border-theatreGold/20">
                 ${avatarInitials(user?.name)}
               </div>`
          }
          <span class="hidden md:block text-xs text-theatreBeige/70 max-w-[100px] truncate">
            ${user?.name?.split(' ')[0] ?? ''}
          </span>
          <button id="navbar-logout-btn"
                  class="flex items-center gap-1 px-3 py-1.5 border border-white/10 text-[10px]
                         tracking-widest uppercase text-theatreGray hover:border-red-800/60
                         hover:text-red-400 transition-all duration-300">
            <span class="material-symbols-outlined" style="font-size:14px;">logout</span>
            <span class="hidden sm:inline">Salir</span>
          </button>
        </div>
      </nav>

      <!-- Mobile nav -->
      <div class="md:hidden flex border-t border-white/5 overflow-x-auto">
        ${links.map(l => `
          <a href="#/${l.href}"
             class="flex flex-col items-center gap-1 px-4 py-2.5 text-[9px] tracking-widest uppercase
                    whitespace-nowrap transition-all flex-1
                    ${activePage === l.href
                      ? 'text-theatreGold bg-theatreGold/10'
                      : 'text-theatreGray hover:text-theatreGold'}">
            <span class="material-symbols-outlined" style="font-size:18px;">${l.icon}</span>
            ${l.label}
          </a>
        `).join('')}
      </div>
    </header>`;
}

export function attachNavbarHandlers() {
  document.getElementById('navbar-logout-btn')?.addEventListener('click', async () => {
    await logout();
    window.showToast?.('Sesión cerrada. ¡Hasta pronto!', 'info');
    navigate('/');
  });
}

/** Altura del header para padding-top en cada vista */
export const NAV_HEIGHT = 'pt-28 md:pt-20';
