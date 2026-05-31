/**
 * ============================================================
 *  view/tickets.js — Mis tickets con QR | Teatro Eventual
 * ============================================================
 */

import { renderNavbar, attachNavbarHandlers, NAV_HEIGHT } from '../components/navbar.js';
import { getMyTickets } from '../api.events.js';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('T')[0].split('-');
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return `${parseInt(d)} de ${months[parseInt(m) - 1]} de ${y}`;
}

function formatTime(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

const STATUS_MAP = {
  Active:    { label: 'Válido',    cls: 'bg-green-900/40 text-green-300 border-green-700/40' },
  Used:      { label: 'Utilizado', cls: 'bg-gray-800/60 text-gray-400 border-gray-600/40' },
  Cancelled: { label: 'Cancelado', cls: 'bg-red-900/40 text-red-300 border-red-700/40' },
  Pending:   { label: 'Pendiente', cls: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40' },
};

function ticketCardHTML(ticket) {
  const status   = STATUS_MAP[ticket.status] ?? { label: ticket.status, cls: 'bg-gray-800 text-gray-400 border-gray-600' };
  const isActive = ticket.status === 'Active';
  const price    = new Intl.NumberFormat('es-CO',{ style:'currency', currency:'COP', maximumFractionDigits:0 }).format(ticket.price_at_purchase ?? 0);

  return `
    <div class="card-border-frame bg-black/40 overflow-hidden transition-all hover:border-theatreGold/50
                ${!isActive ? 'opacity-70' : ''}">
      <div class="bg-theatreBurgundy/20 border-b border-theatreGold/10 px-5 py-4 flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <p class="text-[9px] text-theatreGold/50 uppercase tracking-widest mb-1">Obra</p>
          <h3 class="font-serif text-theatreBeige text-lg leading-tight">${ticket.playName}</h3>
        </div>
        <span class="px-2.5 py-1 rounded-full text-[10px] font-medium border shrink-0 ${status.cls}">
          ${status.label}
        </span>
      </div>

      <div class="p-5 flex flex-col md:flex-row gap-6">
        <div class="flex-1 space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-[9px] text-theatreGray/50 uppercase tracking-widest mb-0.5">Fecha</p>
              <p class="text-theatreBeige text-sm">${formatDate(ticket.performanceDate)}</p>
            </div>
            <div>
              <p class="text-[9px] text-theatreGray/50 uppercase tracking-widest mb-0.5">Hora</p>
              <p class="text-theatreBeige text-sm">${formatTime(ticket.startTime)}</p>
            </div>
            <div>
              <p class="text-[9px] text-theatreGray/50 uppercase tracking-widest mb-0.5">Fila</p>
              <p class="text-theatreBeige text-sm font-medium">${ticket.rowName ?? '—'}</p>
            </div>
            <div>
              <p class="text-[9px] text-theatreGray/50 uppercase tracking-widest mb-0.5">Asiento</p>
              <p class="text-theatreBeige text-sm font-medium">${ticket.seatNumber ?? '—'}</p>
            </div>
          </div>
          <div class="border-t border-white/5 pt-3">
            <p class="text-[9px] text-theatreGray/50 uppercase tracking-widest mb-0.5">Correo</p>
            <p class="text-theatreGray text-xs truncate">${ticket.ownerEmail}</p>
          </div>
          ${ticket.status === 'Used' ? `
            <div class="flex items-center gap-2 text-gray-400 text-xs bg-gray-900/40 px-3 py-2">
              <span class="material-symbols-outlined" style="font-size:16px;">check_circle</span>
              Este ticket ya fue utilizado
            </div>` : ''}
        </div>

        <div class="flex flex-col items-center justify-center gap-3 shrink-0">
          ${isActive && ticket.qrUrl
            ? `<div class="p-3 bg-white rounded-lg">
                 <img src="${ticket.qrUrl}" alt="QR Boleta" class="w-32 h-32 block"
                      onerror="this.parentElement.innerHTML='<div style=\'width:128px;height:128px;display:flex;align-items:center;justify-content:center;background:#f0f0f0;\'><span style=\'color:#999;font-size:11px;\'>QR no disponible</span></div>'"/>
               </div>
               <p class="text-[9px] text-theatreGray/50 text-center max-w-[8rem] leading-relaxed">
                 Presenta este código en la entrada
               </p>`
            : `<div class="w-32 h-32 border border-white/10 flex items-center justify-center">
                 <span class="material-symbols-outlined text-white/20" style="font-size:2.5rem;">
                   ${ticket.status === 'Used' ? 'check_circle' : 'qr_code'}
                 </span>
               </div>`
          }
        </div>
      </div>
    </div>`;
}

export async function renderTickets() {
  const res     = await getMyTickets();
  const tickets = res.success && Array.isArray(res.data) ? res.data : [];
  const today   = new Date().toISOString().split('T')[0];
  const upcoming = tickets.filter(t => (t.performanceDate ?? '') >= today && t.status !== 'Cancelled');
  const past     = tickets.filter(t => (t.performanceDate ?? '') <  today || t.status === 'Used');

  // Handlers post-render
  setTimeout(() => {
    attachNavbarHandlers();

    document.querySelectorAll('[data-tab-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tabBtn;
        document.querySelectorAll('[data-tab-btn]').forEach(b => {
          const active = b.dataset.tabBtn === target;
          b.classList.toggle('border-theatreGold', active);
          b.classList.toggle('text-theatreGold',   active);
          b.classList.toggle('border-transparent',  !active);
          b.classList.toggle('text-theatreGray',    !active);
        });
        document.querySelectorAll('[data-tab]').forEach(p =>
          p.classList.toggle('hidden', p.dataset.tab !== target)
        );
      });
    });
  }, 0);

  return `
    ${renderNavbar('mis-tickets')}
    <main class="${NAV_HEIGHT} min-h-screen">
      <div class="max-w-5xl mx-auto px-4 md:px-6 py-10">

        <div class="mb-10">
          <p class="text-theatreGold text-[10px] tracking-[0.4em] uppercase mb-2">Mi cuenta</p>
          <h1 class="font-serif text-3xl md:text-4xl text-theatreBeige">Mis Entradas</h1>
        </div>

        ${!res.success
          ? `<div class="text-center text-theatreGray py-20">
               <span class="material-symbols-outlined text-5xl mb-4 block text-theatreGold/30">error</span>
               <p>No se pudieron cargar tus entradas.</p>
             </div>`
          : tickets.length === 0
            ? `<div class="text-center text-theatreGray py-20 card-border-frame bg-black/20 max-w-md mx-auto p-12">
                 <span class="material-symbols-outlined text-5xl mb-4 block text-theatreGold/30">confirmation_number</span>
                 <p class="text-theatreBeige font-serif text-lg mb-2">Aún no tienes entradas</p>
                 <p class="text-sm mb-6">Explora la cartelera y compra tu primera entrada</p>
                 <a href="#/cartelera"
                    class="px-6 py-2.5 bg-theatreBurgundy text-white text-[11px] font-bold tracking-[0.15em] uppercase hover:brightness-110 transition-all">
                   Ver Cartelera
                 </a>
               </div>`
            : `
              <div class="flex border-b border-white/5 mb-8">
                <button data-tab-btn="upcoming"
                        class="flex items-center gap-2 px-5 py-3 text-xs font-medium tracking-widest uppercase
                               border-b-2 transition-all border-theatreGold text-theatreGold">
                  <span class="material-symbols-outlined" style="font-size:16px;">upcoming</span>
                  Próximas
                  ${upcoming.length > 0 ? `<span class="ml-1 px-2 py-0.5 bg-theatreGold/20 text-theatreGold text-[10px] rounded-full">${upcoming.length}</span>` : ''}
                </button>
                <button data-tab-btn="past"
                        class="flex items-center gap-2 px-5 py-3 text-xs font-medium tracking-widest uppercase
                               border-b-2 transition-all border-transparent text-theatreGray hover:text-theatreBeige">
                  <span class="material-symbols-outlined" style="font-size:16px;">history</span>
                  Historial
                  ${past.length > 0 ? `<span class="ml-1 px-2 py-0.5 bg-white/10 text-theatreGray text-[10px] rounded-full">${past.length}</span>` : ''}
                </button>
              </div>

              <div data-tab="upcoming">
                ${upcoming.length === 0
                  ? `<div class="text-center text-theatreGray py-12">
                       <span class="material-symbols-outlined text-4xl mb-3 block text-theatreGold/30">event</span>
                       <p>No tienes funciones próximas</p>
                     </div>`
                  : `<div class="space-y-6">${upcoming.map(ticketCardHTML).join('')}</div>`}
              </div>

              <div data-tab="past" class="hidden">
                ${past.length === 0
                  ? `<div class="text-center text-theatreGray py-12">
                       <span class="material-symbols-outlined text-4xl mb-3 block text-theatreGold/30">history</span>
                       <p>No tienes entradas pasadas</p>
                     </div>`
                  : `<div class="space-y-6">${past.map(ticketCardHTML).join('')}</div>`}
              </div>
            `
        }
      </div>
    </main>
    <footer class="border-t border-white/5 py-6">
      <p class="text-center text-[9px] text-theatreGray/30 uppercase tracking-[0.4em]">© 2025 Teatro Eventual</p>
    </footer>
  `;
}