/**
 * view/dashboard.js — Mis Boletas | Gran Teatro
 * Panel enfocado en boletería, no en configuración de perfil
 */

import { logout, getUser }             from '../auth.js';
import { me, updateProfile,
         changePassword,
         resendVerificationEmail }      from '../api.js';
import { navigate }                    from '../router.js';

// ─── Utilitarios ────────────────────────────────────────────────────────────

function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

function avatarInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

function setLoading(btnId, loading, label = '') {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled  = loading;
  btn.innerHTML = loading
    ? `<span class="material-symbols-outlined animate-spin" style="font-size:18px;">progress_activity</span>`
    : label;
}

function showStatus(id, msg, type = 'success') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className   = `mt-2 text-sm ${type === 'success' ? 'text-green-400' : 'text-error'}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

// ─── Handlers ───────────────────────────────────────────────────────────────

async function handleLogout() {
  await logout();
  window.showToast?.('Sesión cerrada. ¡Hasta pronto!', 'info');
  navigate('/');
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const name  = document.getElementById('profileName').value.trim();
  const phone = document.getElementById('profilePhone').value.trim() || null;
  if (!name) { showStatus('profileStatus', 'El nombre es requerido.', 'error'); return; }

  setLoading('profileBtn', true);
  const res = await updateProfile({ name, phone });
  setLoading('profileBtn', false,
    `Guardar Cambios <span class="material-symbols-outlined" style="font-size:16px;">save</span>`);

  if (res.success) {
    showStatus('profileStatus', '✓ Perfil actualizado correctamente.', 'success');
    window.showToast?.('Perfil actualizado.', 'success');
    const nameEl = document.getElementById('dashUserName');
    if (nameEl) nameEl.textContent = name;
  } else {
    showStatus('profileStatus', res.message || 'No se pudo actualizar.', 'error');
  }
}

async function handleChangePassword(e) {
  e.preventDefault();
  const current               = document.getElementById('currentPassword').value;
  const password              = document.getElementById('newPassword').value;
  const password_confirmation = document.getElementById('confirmPassword').value;

  if (password.length < 8) {
    showStatus('passwordStatus', 'Mínimo 8 caracteres.', 'error'); return;
  }
  if (password !== password_confirmation) {
    showStatus('passwordStatus', 'Las contraseñas no coinciden.', 'error'); return;
  }

  setLoading('passwordBtn', true);
  const res = await changePassword({ current_password: current, password, password_confirmation });
  setLoading('passwordBtn', false,
    `Cambiar Contraseña <span class="material-symbols-outlined" style="font-size:16px;">lock_reset</span>`);

  if (res.success) {
    showStatus('passwordStatus', '✓ Contraseña actualizada.', 'success');
    window.showToast?.('Contraseña cambiada.', 'success');
    document.getElementById('pwForm').reset();
  } else {
    showStatus('passwordStatus', res.message || 'Error al cambiar contraseña.', 'error');
  }
}

// ─── Render de boleta ────────────────────────────────────────────────────────

function ticketCard(t) {
  const isPast = false; // simplificado
  return `
    <div class="flex flex-col sm:flex-row bg-surface-container rounded-xl overflow-hidden
                border border-outline-variant/20 hover:border-tertiary/30 transition-all">
      <div class="w-full sm:w-24 h-28 sm:h-auto overflow-hidden flex-shrink-0">
        <img src="${t.img}" alt="${t.show}" class="w-full h-full object-cover"/>
      </div>
      <div class="flex-1 p-5 flex flex-col sm:flex-row justify-between gap-4">
        <div class="space-y-1">
          <span class="text-xs text-tertiary uppercase tracking-widest">${t.category}</span>
          <h4 class="font-bold text-on-surface">${t.show}</h4>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant mt-1">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-tertiary text-[14px]">calendar_today</span>
              ${t.date}
            </span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-tertiary text-[14px]">location_on</span>
              ${t.location}
            </span>
          </div>
          <div class="flex gap-2 mt-2 flex-wrap">
            <span class="px-2 py-0.5 rounded-full text-xs bg-tertiary/15 text-tertiary border border-tertiary/25">
              ${t.tipo}
            </span>
            <span class="px-2 py-0.5 rounded-full text-xs bg-surface-container-highest text-on-surface-variant border border-outline-variant/30">
              ${t.qty} entrada${t.qty > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div class="flex flex-col items-end justify-between gap-2">
          <span class="text-lg font-black text-tertiary">${formatCOP(t.total)}</span>
          <div class="flex items-center gap-1 text-xs text-green-400">
            <span class="material-symbols-outlined text-[14px]">check_circle</span>
            Confirmada
          </div>
          <span class="text-[10px] text-on-surface-variant/50">
            ${new Date(t.purchasedAt).toLocaleDateString('es-CO')}
          </span>
        </div>
      </div>
    </div>`;
}

// ─── Render principal ────────────────────────────────────────────────────────

export async function renderDashboard() {
  const res     = await me();
  const user    = res.success ? (res.data?.user ?? res.data) : getUser();
  const tickets = JSON.parse(localStorage.getItem('gt_tickets') ?? '[]').reverse();

  const appEl = document.querySelector('#app');
  if (appEl) {
    appEl.addEventListener('view:mounted', () => {

      document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

      // Tabs
      document.querySelectorAll('[data-tab-btn]').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.tabBtn;
          document.querySelectorAll('[data-tab-btn]').forEach(b => {
            const isActive = b.dataset.tabBtn === target;
            b.classList.toggle('border-tertiary',          isActive);
            b.classList.toggle('text-tertiary',            isActive);
            b.classList.toggle('border-transparent',       !isActive);
            b.classList.toggle('text-on-surface-variant',  !isActive);
          });
          document.querySelectorAll('[data-tab]').forEach(p => {
            p.classList.toggle('hidden', p.dataset.tab !== target);
          });
        });
      });

      // Profile form
      document.getElementById('profileForm')?.addEventListener('submit', handleUpdateProfile);
      document.getElementById('pwForm')?.addEventListener('submit', handleChangePassword);
      document.getElementById('resendBtn')?.addEventListener('click', async () => {
        setLoading('resendBtn', true);
        const r = await resendVerificationEmail();
        setLoading('resendBtn', false, 'Reenviar verificación');
        window.showToast?.(r.success ? 'Correo de verificación enviado.' : r.message,
                           r.success ? 'success' : 'error');
      });
    }, { once: true });
  }

  const emailVerified = user?.email_verified_at;

  return `
  <!-- Fondo -->
  <div class="fixed inset-0 z-0"
       style="background: radial-gradient(ellipse at 20% 50%,rgba(107,17,29,0.1) 0%,transparent 60%),
                          radial-gradient(ellipse at 80% 20%,rgba(212,175,55,0.05) 0%,transparent 50%),#141218;">
  </div>

  <div class="relative z-10 min-h-screen flex flex-col">

    <!-- Topbar -->
    <header class="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
      <div class="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <a href="#/dashboard" class="flex items-center gap-3 group">
          <span class="material-symbols-outlined text-tertiary group-hover:scale-110 transition-transform">theater_comedy</span>
          <span class="font-bold text-tertiary text-base tracking-tight hidden sm:block">Gran Teatro</span>
        </a>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-tertiary/20 border border-tertiary/40
                        flex items-center justify-center text-tertiary text-sm font-bold select-none">
              ${avatarInitials(user?.name)}
            </div>
            <div class="hidden md:flex flex-col">
              <span id="dashUserName" class="text-sm text-on-surface font-medium leading-none">
                ${user?.name ?? '—'}
              </span>
              <span class="text-xs text-on-surface-variant/60 leading-none mt-0.5">
                ${user?.email ?? ''}
              </span>
            </div>
          </div>
          <button id="logoutBtn"
                  class="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant/50
                         text-xs text-on-surface-variant rounded-lg
                         hover:border-error/50 hover:text-error transition-all">
            <span class="material-symbols-outlined text-[15px]">logout</span>
            Salir
          </button>
        </div>
      </div>
    </header>

    <!-- Contenido -->
    <div class="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-8">

      <div class="mb-8">
        <p class="text-tertiary text-xs uppercase tracking-widest mb-1">Panel personal</p>
        <h1 class="text-3xl font-black text-on-surface">
          Hola, <span class="text-tertiary">${user?.name?.split(' ')[0] ?? 'Usuario'}</span>
        </h1>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-outline-variant/30 mb-6 gap-1">
        ${[
          { key: 'tickets',  label: 'Mis Boletas',  icon: 'confirmation_number' },
          { key: 'profile',  label: 'Mi Cuenta',    icon: 'person'              },
        ].map((t, i) => `
          <button data-tab-btn="${t.key}"
                  class="flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-widest uppercase
                         border-b-2 transition-all duration-200
                         ${i === 0
                           ? 'border-tertiary text-tertiary'
                           : 'border-transparent text-on-surface-variant hover:text-on-surface'}">
            <span class="material-symbols-outlined" style="font-size:16px;">${t.icon}</span>
            ${t.label}
          </button>`).join('')}
      </div>

      <!-- ══ TAB: MIS BOLETAS ══ -->
      <div data-tab="tickets">
        ${tickets.length === 0 ? `
          <div class="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div class="w-20 h-20 rounded-full bg-surface-container border border-outline-variant/30
                        flex items-center justify-center">
              <span class="material-symbols-outlined text-tertiary/40 text-[40px]">confirmation_number</span>
            </div>
            <div>
              <h3 class="text-xl font-bold text-on-surface mb-2">No tienes boletas aún</h3>
              <p class="text-sm text-on-surface-variant max-w-xs leading-relaxed">
                Explora nuestra cartelera y compra entradas para los mejores espectáculos.
              </p>
            </div>
            <a href="#/"
               class="flex items-center gap-2 px-6 py-3 bg-tertiary text-on-tertiary font-bold text-sm rounded-xl
                      hover:bg-tertiary-fixed transition-colors">
              <span class="material-symbols-outlined text-[18px]">theater_comedy</span>
              Ver Cartelera
            </a>
          </div>
        ` : `
          <div class="space-y-4">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm text-on-surface-variant">
                <span class="text-on-surface font-bold">${tickets.length}</span> entrada${tickets.length !== 1 ? 's' : ''} adquirida${tickets.length !== 1 ? 's' : ''}
              </p>
              <a href="#/"
                 class="flex items-center gap-1 text-xs text-tertiary hover:underline">
                <span class="material-symbols-outlined text-[14px]">add</span>
                Comprar más
              </a>
            </div>
            ${tickets.map(ticketCard).join('')}
          </div>
        `}
      </div>

      <!-- ══ TAB: MI CUENTA ══ -->
      <div data-tab="profile" class="hidden space-y-6">

        <!-- Verificación -->
        ${!emailVerified ? `
          <div class="p-4 bg-yellow-900/15 border border-yellow-600/20 rounded-xl flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-yellow-400 text-[20px]">warning</span>
              <p class="text-yellow-400 text-sm">Email sin verificar</p>
            </div>
            <button id="resendBtn"
                    class="text-xs text-tertiary border border-tertiary/30 px-3 py-1.5 rounded-lg hover:bg-tertiary/10 transition-colors">
              Reenviar verificación
            </button>
          </div>
        ` : `
          <div class="flex items-center gap-2 text-green-400 text-sm">
            <span class="material-symbols-outlined text-[18px]">verified</span>
            Email verificado
          </div>
        `}

        <!-- Datos personales -->
        <div class="bg-surface-container rounded-xl border border-outline-variant/20 p-6">
          <h3 class="font-bold text-on-surface mb-1">Información Personal</h3>
          <p class="text-xs text-on-surface-variant mb-5">Actualiza tu nombre y teléfono de contacto.</p>
          <form id="profileForm" class="space-y-4" novalidate>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-xs text-on-surface-variant mb-1.5" for="profileName">Nombre completo</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                               text-on-surface-variant text-[18px]">person</span>
                  <input id="profileName" type="text" value="${user?.name ?? ''}"
                         class="w-full bg-surface-container-low border border-outline-variant text-on-surface
                                rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-tertiary/50 focus:ring-1 focus:ring-tertiary/30 outline-none transition-all"/>
                </div>
              </div>
              <div>
                <label class="block text-xs text-on-surface-variant mb-1.5">Correo (no editable)</label>
                <div class="relative opacity-50">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                               text-on-surface-variant text-[18px]">mail</span>
                  <input type="email" value="${user?.email ?? ''}" readonly disabled
                         class="w-full bg-surface-container-lowest border border-outline-variant/50 text-on-surface
                                rounded-lg py-2.5 pl-10 pr-4 text-sm cursor-not-allowed"/>
                </div>
              </div>
              <div>
                <label class="block text-xs text-on-surface-variant mb-1.5" for="profilePhone">Teléfono</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                               text-on-surface-variant text-[18px]">call</span>
                  <input id="profilePhone" type="tel" value="${user?.phone ?? ''}"
                         placeholder="+57 300 1234567"
                         class="w-full bg-surface-container-low border border-outline-variant text-on-surface
                                rounded-lg py-2.5 pl-10 pr-4 text-sm placeholder:text-on-surface-variant/30
                                focus:border-tertiary/50 focus:ring-1 focus:ring-tertiary/30 outline-none transition-all"/>
                </div>
              </div>
            </div>
            <p id="profileStatus" class="hidden text-sm"></p>
            <button id="profileBtn" type="submit"
                    class="flex items-center gap-2 px-5 py-2.5 bg-tertiary text-on-tertiary
                           text-xs font-bold tracking-widest uppercase rounded-lg
                           hover:bg-tertiary-fixed transition-all">
              Guardar Cambios
              <span class="material-symbols-outlined" style="font-size:16px;">save</span>
            </button>
          </form>
        </div>

        <!-- Cambiar contraseña -->
        <div class="bg-surface-container rounded-xl border border-outline-variant/20 p-6">
          <h3 class="font-bold text-on-surface mb-1">Cambiar Contraseña</h3>
          <p class="text-xs text-on-surface-variant mb-5">Mínimo 8 caracteres.</p>
          <form id="pwForm" class="space-y-4" novalidate>
            ${[
              { id: 'currentPassword', label: 'Contraseña actual',  icon: 'lock'         },
              { id: 'newPassword',     label: 'Nueva contraseña',   icon: 'lock_reset'    },
              { id: 'confirmPassword', label: 'Confirmar nueva',    icon: 'verified_user' },
            ].map(f => `
              <div>
                <label class="block text-xs text-on-surface-variant mb-1.5" for="${f.id}">${f.label}</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                               text-on-surface-variant text-[18px]">${f.icon}</span>
                  <input id="${f.id}" type="password" placeholder="••••••••" required
                         class="w-full bg-surface-container-low border border-outline-variant text-on-surface
                                rounded-lg py-2.5 pl-10 pr-4 text-sm placeholder:text-on-surface-variant/30
                                focus:border-tertiary/50 focus:ring-1 focus:ring-tertiary/30 outline-none transition-all"/>
                </div>
              </div>`).join('')}
            <p id="passwordStatus" class="hidden text-sm"></p>
            <button id="passwordBtn" type="submit"
                    class="flex items-center gap-2 px-5 py-2.5 bg-tertiary/10 text-tertiary border border-tertiary/30
                           text-xs font-bold tracking-widest uppercase rounded-lg
                           hover:bg-tertiary/20 transition-all">
              Cambiar Contraseña
              <span class="material-symbols-outlined" style="font-size:16px;">lock_reset</span>
            </button>
          </form>
        </div>

        <!-- Info adicional -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          ${[
            { icon: 'badge',    label: 'Proveedor',    val: user?.provider  || 'local'        },
            { icon: 'schedule', label: 'Miembro desde', val: fmtDate(user?.created_at)         },
            { icon: 'star',     label: 'Boletas',       val: `${tickets.length} adquirida${tickets.length !== 1 ? 's' : ''}` },
          ].map(r => `
            <div class="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
              <span class="material-symbols-outlined text-tertiary/60 text-[18px]">${r.icon}</span>
              <p class="text-[10px] text-on-surface-variant uppercase tracking-widest mt-2">${r.label}</p>
              <p class="text-sm font-semibold text-on-surface mt-0.5">${r.val}</p>
            </div>
          `).join('')}
        </div>

      </div>
    </div>

    <footer class="border-t border-outline-variant/20 py-5 px-6 text-center">
      <p class="text-xs text-on-surface-variant/40 uppercase tracking-widest">
        © 2025 Gran Teatro — Todos los derechos reservados
      </p>
    </footer>
  </div>`;
}
