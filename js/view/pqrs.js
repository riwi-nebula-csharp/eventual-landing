/**
 * ============================================================
 *  view/pqrs.js — PQRS | Teatro Eventual
 * ============================================================
 */

import { renderNavbar, attachNavbarHandlers, NAV_HEIGHT } from '../components/navbar.js';
import { getMyPqrs, createPqrs } from '../api.events.js';
import { navigate } from '../router.js';

const STATUS_MAP = {
  Pending:     { label: 'Pendiente',  cls: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40' },
  In_progress: { label: 'En proceso', cls: 'bg-blue-900/40 text-blue-300 border-blue-700/40' },
  Completed:   { label: 'Respondida', cls: 'bg-green-900/40 text-green-300 border-green-700/40' },
  Cancelled:   { label: 'Cancelada',  cls: 'bg-gray-800/60 text-gray-400 border-gray-600/40' },
};

const TYPE_MAP = {
  Petitions:  { label: 'Petición',  icon: 'help' },
  Complaints: { label: 'Queja',     icon: 'sentiment_dissatisfied' },
  Concerns:   { label: 'Inquietud', icon: 'info' },
  Grievances: { label: 'Reclamo',   icon: 'report' },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { year:'numeric', month:'short', day:'numeric' });
}

function pqrsCardHTML(pqrs) {
  const status = STATUS_MAP[pqrs.status] ?? { label: pqrs.status, cls: 'bg-gray-800 text-gray-400 border-gray-600' };
  const type   = TYPE_MAP[pqrs.type]    ?? { label: pqrs.type,   icon: 'chat' };
  return `
    <div class="card-border-frame bg-black/40 p-6 transition-colors hover:border-theatreGold/40">
      <div class="flex items-start justify-between gap-4 mb-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-theatreGold/50" style="font-size:16px;">${type.icon}</span>
            <span class="text-[9px] text-theatreGray/50 uppercase tracking-widest">${type.label}</span>
          </div>
          <h3 class="text-theatreBeige font-medium text-sm leading-snug">${pqrs.subject}</h3>
        </div>
        <span class="px-2.5 py-1 rounded-full text-[10px] font-medium border shrink-0 ${status.cls}">
          ${status.label}
        </span>
      </div>
      <p class="text-theatreGray text-xs leading-relaxed mb-4 line-clamp-2">${pqrs.description}</p>
      <p class="text-[9px] text-theatreGray/40 mb-4">Enviada el ${formatDate(pqrs.createdAt)}</p>
      ${pqrs.response
        ? `<div class="border-t border-theatreGold/15 pt-4">
             <div class="flex items-center gap-2 mb-2">
               <span class="material-symbols-outlined text-theatreGold/60" style="font-size:15px;">reply</span>
               <span class="text-[9px] text-theatreGold/60 uppercase tracking-widest">
                 Respuesta — ${formatDate(pqrs.respondedAt)}
               </span>
             </div>
             <p class="text-theatreBeige text-xs leading-relaxed bg-theatreGold/5 p-3 border border-theatreGold/10">
               ${pqrs.response}
             </p>
           </div>`
        : `<div class="border-t border-white/5 pt-4">
             <p class="text-theatreGray/40 text-xs italic">Aún no hay respuesta de nuestro equipo.</p>
           </div>`
      }
    </div>`;
}

export async function renderPqrs() {
  const res  = await getMyPqrs();
  const list = res.success && Array.isArray(res.data) ? res.data : [];
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  setTimeout(() => {
    attachNavbarHandlers();

    // Tabs
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

    // Formulario nueva PQRS
    document.getElementById('form-pqrs')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn     = document.getElementById('btn-enviar-pqrs');
      const subject = document.getElementById('pqrs-subject').value.trim();
      const desc    = document.getElementById('pqrs-description').value.trim();
      const type    = document.getElementById('pqrs-type').value;
      const errEl   = document.getElementById('pqrs-error');

      if (!subject || !desc || !type) {
        if (errEl) { errEl.textContent = 'Completa todos los campos.'; errEl.classList.remove('hidden'); }
        return;
      }

      btn.disabled  = true;
      btn.innerHTML = `<span class="material-symbols-outlined animate-spin" style="font-size:16px;">progress_activity</span> Enviando...`;

      const r = await createPqrs({ subject, description: desc, type });

      if (r.success) {
        window.showToast?.('PQRS enviada. Te responderemos pronto.', 'success');
        btn.disabled  = false;
        btn.innerHTML = `Enviar <span class="material-symbols-outlined" style="font-size:16px;">send</span>`;
        // Limpiar formulario
        document.getElementById('pqrs-subject').value     = '';
        document.getElementById('pqrs-description').value = '';
        document.getElementById('pqrs-type').value        = '';
        // Forzar re-render ya que navigate a la misma ruta no recarga
        window.location.hash = '';
        setTimeout(() => { window.location.hash = '/pqrs'; }, 50);
      } else {
        if (errEl) { errEl.textContent = r.message || 'No se pudo enviar.'; errEl.classList.remove('hidden'); }
        btn.disabled  = false;
        btn.innerHTML = `Enviar <span class="material-symbols-outlined" style="font-size:16px;">send</span>`;
      }
    });
  }, 0);

  return `
    ${renderNavbar('pqrs')}
    <main class="${NAV_HEIGHT} min-h-screen">
      <div class="max-w-4xl mx-auto px-4 md:px-6 py-10">

        <div class="mb-10">
          <p class="text-theatreGold text-[10px] tracking-[0.4em] uppercase mb-2">Atención al cliente</p>
          <h1 class="font-serif text-3xl md:text-4xl text-theatreBeige">PQRS</h1>
        </div>

        <div class="flex border-b border-white/5 mb-8">
          <button data-tab-btn="list"
                  class="flex items-center gap-2 px-5 py-3 text-xs font-medium tracking-widest uppercase
                         border-b-2 transition-all border-theatreGold text-theatreGold">
            <span class="material-symbols-outlined" style="font-size:16px;">list</span>
            Mis PQRS
            ${list.length > 0 ? `<span class="ml-1 px-2 py-0.5 bg-theatreGold/20 text-theatreGold text-[10px] rounded-full">${list.length}</span>` : ''}
          </button>
          <button data-tab-btn="new"
                  class="flex items-center gap-2 px-5 py-3 text-xs font-medium tracking-widest uppercase
                         border-b-2 transition-all border-transparent text-theatreGray hover:text-theatreBeige">
            <span class="material-symbols-outlined" style="font-size:16px;">add</span>
            Nueva PQRS
          </button>
        </div>

        <div data-tab="list">
          ${!res.success
            ? `<div class="text-center text-theatreGray py-12">
                 <span class="material-symbols-outlined text-4xl mb-3 block text-theatreGold/30">error</span>
                 <p>No se pudieron cargar tus PQRS.</p>
               </div>`
            : list.length === 0
              ? `<div class="text-center text-theatreGray py-16 card-border-frame bg-black/20 max-w-sm mx-auto p-10">
                   <span class="material-symbols-outlined text-5xl mb-4 block text-theatreGold/30">support_agent</span>
                   <p class="text-theatreBeige font-serif text-lg mb-2">Sin solicitudes</p>
                   <p class="text-sm mb-6">¿Tienes alguna pregunta o reclamo?</p>
                   <button data-tab-btn="new"
                           class="px-6 py-2.5 bg-theatreBurgundy text-white text-[11px] font-bold tracking-[0.15em] uppercase hover:brightness-110 transition-all">
                     Nueva PQRS
                   </button>
                 </div>`
              : `<div class="space-y-6">${list.map(pqrsCardHTML).join('')}</div>`
          }
        </div>

        <div data-tab="new" class="hidden">
          <div class="card-border-frame bg-black/40 p-6 max-w-2xl">
            <h2 class="font-serif text-theatreGold text-xl mb-1">Nueva solicitud</h2>
            <p class="text-theatreGray text-xs mb-6">Cuéntanos tu situación y te responderemos a la brevedad.</p>
            <p id="pqrs-error" class="hidden text-red-400 text-sm mb-4"></p>
            <form id="form-pqrs" class="space-y-5" novalidate>
              <div>
                <label class="block text-[10px] text-theatreGray uppercase tracking-widest mb-2" for="pqrs-type">
                  Tipo de solicitud *
                </label>
                <select id="pqrs-type" class="w-full py-3 px-4 text-sm rounded-sm border">
                  <option value="">Selecciona un tipo</option>
                  <option value="Petitions">Petición</option>
                  <option value="Complaints">Queja</option>
                  <option value="Concerns">Inquietud</option>
                  <option value="Grievances">Reclamo</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] text-theatreGray uppercase tracking-widest mb-2" for="pqrs-subject">
                  Asunto *
                </label>
                <input id="pqrs-subject" type="text" maxlength="200"
                       placeholder="Ej: No pude descargar mi boleta"
                       class="w-full py-3 px-4 text-sm rounded-sm border"/>
              </div>
              <div>
                <label class="block text-[10px] text-theatreGray uppercase tracking-widest mb-2" for="pqrs-description">
                  Descripción *
                </label>
                <textarea id="pqrs-description" rows="5"
                          placeholder="Describe tu situación con el mayor detalle posible..."
                          class="w-full py-3 px-4 text-sm rounded-sm border resize-none"></textarea>
              </div>
              <button id="btn-enviar-pqrs" type="submit"
                      class="flex items-center gap-2 px-6 py-3 bg-theatreBurgundy text-white
                             text-[11px] font-bold tracking-[0.15em] uppercase hover:brightness-110 transition-all">
                Enviar
                <span class="material-symbols-outlined" style="font-size:16px;">send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
    <footer class="border-t border-white/5 py-6">
      <p class="text-center text-[9px] text-theatreGray/30 uppercase tracking-[0.4em]">© 2025 Teatro Eventual</p>
    </footer>
  `;
}