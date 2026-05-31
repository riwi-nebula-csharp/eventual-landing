/**
 * ============================================================
 *  view/performances.js — FESTA ES LA LOCAL
 * ============================================================
 */

import { navigate }                                      from '../router.js';
import { renderNavbar, attachNavbarHandlers, NAV_HEIGHT } from '../components/navbar.js';
import { getPlay, getPerformances }                      from '../api.events.js';

const STATUS_LABEL = {
  0:         { label: 'Próximamente', cls: 'bg-blue-900/40 text-blue-300 border-blue-700/40' },
  1:         { label: 'En venta',     cls: 'bg-green-900/40 text-green-300 border-green-700/40' },
  2:         { label: 'Agotado',      cls: 'bg-red-900/40 text-red-300 border-red-700/40' },
  3:         { label: 'Finalizado',   cls: 'bg-gray-800/60 text-gray-400 border-gray-600/40' },
  scheduled: { label: 'Próximamente', cls: 'bg-blue-900/40 text-blue-300 border-blue-700/40' },
  on_sale:   { label: 'En venta',     cls: 'bg-green-900/40 text-green-300 border-green-700/40' },
  sold_out:  { label: 'Agotado',      cls: 'bg-red-900/40 text-red-300 border-red-700/40' },
  finished:  { label: 'Finalizado',   cls: 'bg-gray-800/60 text-gray-400 border-gray-600/40' },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function formatTime(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12  = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
}

function performanceCardHTML(perf) {
  const status = STATUS_LABEL[perf.status] ?? {
    label: perf.status,
    cls: 'bg-gray-800 text-gray-400 border-gray-600'
  };

  const canBuy = perf.status === 1 || perf.status === 'on_sale';

  return `
    <div class="card-border-frame bg-black/40 p-6 flex flex-col gap-5
                ${canBuy ? 'hover:border-theatreGold/60' : 'opacity-70'} transition-colors duration-300">

      <div class="flex justify-between items-start">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-medium border uppercase tracking-wider ${status.cls}">
          ${status.label}
        </span>
        <span class="text-theatreGold font-serif text-xl font-bold">
          ${formatCurrency(perf.ticketPrice)}
        </span>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-theatreGold/60" style="font-size:18px;">calendar_today</span>
          <div>
            <p class="text-[9px] text-theatreGray/50 uppercase tracking-widest">Fecha</p>
            <p class="text-theatreBeige text-sm font-medium">${formatDate(perf.performanceDate)}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-theatreGold/60" style="font-size:18px;">schedule</span>
          <div>
            <p class="text-[9px] text-theatreGray/50 uppercase tracking-widest">Horario</p>
            <p class="text-theatreBeige text-sm font-medium">
              ${formatTime(perf.startTime)} — ${formatTime(perf.endTime)}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-theatreGold/60" style="font-size:18px;">confirmation_number</span>
          <div>
            <p class="text-[9px] text-theatreGray/50 uppercase tracking-widest">Precio por boleta</p>
            <p class="text-theatreBeige text-sm font-medium">${formatCurrency(perf.ticketPrice)}</p>
          </div>
        </div>

        ${canBuy ? `
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-theatreGold/60" style="font-size:18px;">sell</span>
            <div>
              <p class="text-[9px] text-theatreGray/50 uppercase tracking-widest">Venta hasta</p>
              <p class="text-theatreBeige text-sm font-medium">
                ${formatDate(perf.salesEndDate?.split('T')[0])}
              </p>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="mt-auto pt-2">
        ${canBuy
          ? `<button class="btn-comprar w-full py-3 bg-theatreGold text-theatreDark text-[11px]
                           font-bold tracking-[0.2em] uppercase hover:brightness-110 transition-all"
                    data-perf-id="${perf.id}">
               Comprar Entradas
             </button>`
          : `<div class="w-full py-3 bg-white/5 text-theatreGray text-[11px]
                         font-bold tracking-[0.2em] uppercase text-center border border-white/10">
               ${status.label}
             </div>`
        }
      </div>
    </div>`;
}

export async function renderPerformances({ id: playId }) {

  // Cargar obra y todas las funciones en paralelo
  const [playRes, perfsRes] = await Promise.all([
    getPlay(playId),
    getPerformances(),
  ]);

  const play     = playRes.success ? playRes.data : null;
  const allPerfs = perfsRes.success && Array.isArray(perfsRes.data) ? perfsRes.data : [];

  // Filtrar funciones de esta obra
  const perfs = allPerfs.filter(p => String(p.playId) === String(playId));
  // Adjuntar handlers DESPUÉS de que el HTML ya está en el DOM
  setTimeout(() => {
    attachNavbarHandlers();

    document.querySelectorAll('.btn-comprar').forEach(btn => {
      btn.addEventListener('click', () => {
        navigate(`funciones/${btn.dataset.perfId}/asientos`);
      });
    });

    document.getElementById('btn-back')?.addEventListener('click', () => navigate('cartelera'));
  }, 0);

  return `
    ${renderNavbar('cartelera')}

    <main class="${NAV_HEIGHT} min-h-screen">
      <div class="max-w-7xl mx-auto px-4 md:px-6 py-10">

        <!-- Volver -->
        <button id="btn-back"
                class="flex items-center gap-2 text-theatreGray hover:text-theatreGold transition-colors mb-8 text-sm">
          <span class="material-symbols-outlined" style="font-size:18px;">arrow_back</span>
          Volver a la cartelera
        </button>

        <!-- Cabecera de la obra -->
        ${play ? `
          <div class="flex flex-col md:flex-row gap-8 mb-14">
            ${play.posterUrl
              ? `<div class="w-full md:w-48 aspect-[3/4] md:aspect-auto flex-shrink-0 overflow-hidden">
                   <img src="${play.posterUrl}" alt="${play.name}"
                        class="w-full h-full object-cover border border-theatreGold/20"/>
                 </div>`
              : ''}
            <div class="flex flex-col justify-end">
              <p class="text-theatreGold text-[10px] tracking-[0.4em] uppercase mb-2">Obra</p>
              <h1 class="font-serif text-3xl md:text-5xl text-theatreBeige mb-4">${play.name}</h1>
              ${play.description
                ? `<p class="text-theatreGray text-sm font-light leading-relaxed max-w-lg">${play.description}</p>`
                : ''}
            </div>
          </div>` : `
          <div class="mb-14">
            <h1 class="font-serif text-3xl text-theatreBeige">Funciones</h1>
          </div>`
        }

        <!-- Título sección funciones -->
        <div class="mb-10">
          <h2 class="text-theatreGold text-xl tracking-[0.3em] font-serif uppercase mb-3">
            Funciones Disponibles
          </h2>
          <div class="flex items-center space-x-4">
            <div class="w-12 h-px bg-theatreGold/30"></div>
            <div class="w-2 h-2 rotate-45 border border-theatreGold/40"></div>
            <div class="w-12 h-px bg-theatreGold/30"></div>
          </div>
        </div>

        <!-- Grid de funciones -->
        ${perfs.length === 0
          ? `<div class="text-center text-theatreGray py-20">
               <span class="material-symbols-outlined text-5xl mb-4 block text-theatreGold/30">event_busy</span>
               <p>No hay funciones programadas para esta obra en este momento.</p>
             </div>`
          : `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               ${perfs.map(performanceCardHTML).join('')}
             </div>`
        }
      </div>
    </main>

    <footer class="border-t border-white/5 py-6">
      <p class="text-center text-[9px] text-theatreGray/30 uppercase tracking-[0.4em]">
        © 2025 Teatro Eventual
      </p>
    </footer>
  `;
}