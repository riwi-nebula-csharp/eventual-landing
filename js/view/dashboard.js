/**
 * ============================================================
 *  view/dashboard.js — Panel de usuario autenticado
 *  Conectado a:
 *   GET  /api/auth/me
 *   PUT  /api/auth/profile
 *   PUT  /api/auth/password
 *   POST /api/auth/logout
 *   POST /api/auth/email/resend
 * ============================================================
 */

import { logout, getUser }             from '../auth.js';
import { me, updateProfile,
         changePassword,
         resendVerificationEmail }      from '../api.js';
import { navigate }                    from '../router.js';

// ─────────────────────────────────────────────────────────────
//  Utilidades UI
// ─────────────────────────────────────────────────────────────

function setLoading(btnId, loading, label = '') {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="material-symbols-outlined animate-spin" style="font-size:18px;">progress_activity</span>`
    : label;
}

function showStatus(id, msg, type = 'success') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className   = type === 'success'
    ? 'mt-2 text-sm text-green-400'
    : 'mt-2 text-sm text-error';
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

// Badge de rol / estado
function roleBadge(role) {
  const map = {
    admin:  { label: 'Admin',   cls: 'bg-purple-900/50 text-purple-300 border-purple-700/50' },
    client: { label: 'Cliente', cls: 'bg-theatreBurgundy/40 text-theatreGold border-theatreGold/30' },
  };
  const b = map[role] ?? { label: role, cls: 'bg-surface-container text-on-surface-variant border-outline-variant' };
  return `<span class="px-2 py-0.5 rounded-full text-xs border font-label-sm ${b.cls}">${b.label}</span>`;
}

function statusBadge(status) {
  const map = {
    active:   { label: 'Activo',   cls: 'bg-green-900/50 text-green-400 border-green-700/40' },
    inactive: { label: 'Inactivo', cls: 'bg-gray-700/50 text-gray-400 border-gray-600/40'    },
    banned:   { label: 'Baneado',  cls: 'bg-red-900/50 text-red-400 border-red-700/40'       },
  };
  const b = map[status] ?? { label: status, cls: 'bg-surface-container text-on-surface-variant border-outline-variant' };
  return `<span class="px-2 py-0.5 rounded-full text-xs border font-label-sm ${b.cls}">${b.label}</span>`;
}

function avatarInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ─────────────────────────────────────────────────────────────
//  Handlers
// ─────────────────────────────────────────────────────────────

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
    // Actualizar nombre en header si existe
    const nameEl = document.getElementById('dashUserName');
    if (nameEl) nameEl.textContent = name;
  } else {
    showStatus('profileStatus', res.message || 'No se pudo actualizar el perfil.', 'error');
  }
}

async function handleChangePassword(e) {
  e.preventDefault();
  const current              = document.getElementById('currentPassword').value;
  const password             = document.getElementById('newPassword').value;
  const password_confirmation = document.getElementById('confirmPassword').value;

  if (password.length < 8) {
    showStatus('passwordStatus', 'La contraseña debe tener mínimo 8 caracteres.', 'error'); return;
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
    window.showToast?.('Contraseña cambiada con éxito.', 'success');
    document.getElementById('pwForm').reset();
  } else {
    showStatus('passwordStatus', res.message || 'Error al cambiar contraseña.', 'error');
  }
}

async function handleResendVerification() {
  setLoading('resendBtn', true);
  const res = await resendVerificationEmail();
  setLoading('resendBtn', false, 'Reenviar verificación');
  window.showToast?.(res.success ? 'Correo de verificación enviado.' : res.message, res.success ? 'success' : 'error');
}

// ─────────────────────────────────────────────────────────────
//  Render
// ─────────────────────────────────────────────────────────────

export async function renderDashboard() {

  // Cargar datos frescos del usuario
  const res  = await me();
  const user = res.success ? (res.data?.user ?? res.data) : getUser();

  const appEl = document.querySelector('#app');
  if (appEl) {
    appEl.addEventListener('view:mounted', () => {
      document.getElementById('profileForm')?.addEventListener('submit', handleUpdateProfile);
      document.getElementById('pwForm')?.addEventListener('submit', handleChangePassword);
      document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
      document.getElementById('resendBtn')?.addEventListener('click', handleResendVerification);

      // Tab switching
      document.querySelectorAll('[data-tab-btn]').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.tabBtn;
          document.querySelectorAll('[data-tab-btn]').forEach(b => {
            b.classList.toggle('border-theatreGold', b.dataset.tabBtn === target);
            b.classList.toggle('text-theatreGold',   b.dataset.tabBtn === target);
            b.classList.toggle('border-transparent',  b.dataset.tabBtn !== target);
            b.classList.toggle('text-on-surface-variant', b.dataset.tabBtn !== target);
          });
          document.querySelectorAll('[data-tab]').forEach(panel => {
            panel.classList.toggle('hidden', panel.dataset.tab !== target);
          });
        });
      });
    }, { once: true });
  }

  const emailVerified = user?.email_verified_at;

  return `
    <!-- Fondo sutil -->
    <div class="fixed inset-0 z-0"
         style="background: radial-gradient(ellipse at 20% 50%, rgba(107,17,29,0.12) 0%, transparent 60%),
                            radial-gradient(ellipse at 80% 20%, rgba(212,175,55,0.06) 0%, transparent 50%),
                            #0A0A0A;">
    </div>

    <div class="relative z-10 min-h-screen flex flex-col">

      <!-- ── Topbar ── -->
      <header class="sticky top-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/5">
        <div class="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">

          <!-- Logo -->
          <a href="#/" class="flex items-center gap-3 group">
            <svg class="w-8 h-8 text-theatreGold" fill="none" stroke="currentColor"
                 stroke-width="1.5" viewBox="0 0 24 24">
              <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M2 10l10-7 10 7M10 14h4"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="text-[10px] tracking-[0.3em] font-serif text-theatreGold uppercase hidden sm:block">
              eventual Teatro
            </span>
          </a>

          <!-- Usuario + logout -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-theatreBurgundy flex items-center justify-center
                          text-theatreGold text-xs font-bold font-serif select-none">
                ${avatarInitials(user?.name)}
              </div>
              <div class="hidden md:flex flex-col">
                <span id="dashUserName" class="text-xs text-theatreBeige font-medium leading-none">
                  ${user?.name ?? '—'}
                </span>
                <span class="text-[10px] text-theatreGray/60 leading-none mt-0.5">
                  ${user?.email ?? ''}
                </span>
              </div>
            </div>
            <button id="logoutBtn"
                    class="flex items-center gap-1.5 px-3 py-1.5 border border-white/10
                           text-[10px] tracking-widest uppercase text-theatreGray
                           hover:border-error/50 hover:text-error transition-all duration-300">
              <span class="material-symbols-outlined" style="font-size:14px;">logout</span>
              Salir
            </button>
          </div>
        </div>
      </header>

      <!-- ── Contenido ── -->
      <div class="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8">

        <!-- Título página -->
        <div class="mb-8">
          <p class="text-theatreGold text-[10px] tracking-[0.4em] uppercase mb-1">Mi Panel</p>
          <h1 class="font-serif text-3xl md:text-4xl text-theatreBeige">
            Bienvenido, <span class="gold-text-gradient">${user?.name?.split(' ')[0] ?? 'Usuario'}</span>
          </h1>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- ═══ SIDEBAR — TARJETA DE USUARIO ═══ -->
          <aside class="lg:col-span-1 space-y-4">

            <!-- Card perfil -->
            <div class="card-border-frame bg-black/40 p-6 rounded-sm">
              <!-- Avatar -->
              <div class="flex flex-col items-center text-center mb-5">
                <div class="relative mb-4">
                  ${user?.avatar_url
                    ? `<img src="${user.avatar_url}" alt="Avatar"
                            class="w-20 h-20 rounded-full object-cover border-2 border-theatreGold/30"/>`
                    : `<div class="w-20 h-20 rounded-full bg-gradient-to-br from-theatreBurgundy to-black
                                  flex items-center justify-center text-theatreGold text-2xl font-serif font-bold
                                  border-2 border-theatreGold/30">
                         ${avatarInitials(user?.name)}
                       </div>`
                  }
                  <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center
                              ${user?.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}">
                  </div>
                </div>
                <h2 class="font-serif text-theatreBeige text-lg leading-tight">${user?.name ?? '—'}</h2>
                <p class="text-theatreGray text-xs mt-0.5">${user?.email ?? ''}</p>
                <div class="flex flex-wrap gap-2 justify-center mt-3">
                  ${roleBadge(user?.role ?? 'client')}
                  ${statusBadge(user?.status ?? 'active')}
                </div>
              </div>

              <!-- Detalles -->
              <div class="space-y-3 border-t border-white/5 pt-4">
                ${[
                  { icon: 'phone',     label: 'Teléfono',     val: user?.phone     || '—'              },
                  { icon: 'badge',     label: 'Proveedor',    val: user?.provider  || 'local'           },
                  { icon: 'schedule',  label: 'Miembro desde', val: fmtDate(user?.created_at)           },
                ].map(r => `
                  <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-theatreGold/60 mt-0.5" style="font-size:16px;">
                      ${r.icon}
                    </span>
                    <div>
                      <p class="text-theatreGray/60 text-[10px] uppercase tracking-widest">${r.label}</p>
                      <p class="text-theatreBeige text-sm">${r.val}</p>
                    </div>
                  </div>`).join('')}
              </div>

              <!-- Verificación de email -->
              ${!emailVerified ? `
                <div class="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/20 rounded-sm">
                  <p class="text-yellow-400 text-xs mb-2">
                    <span class="material-symbols-outlined align-middle mr-1" style="font-size:14px;">warning</span>
                    Email sin verificar
                  </p>
                  <button id="resendBtn"
                          class="text-[10px] uppercase tracking-widest text-theatreGold hover:underline transition-colors">
                    Reenviar verificación
                  </button>
                </div>` : `
                <div class="mt-4 flex items-center gap-2 text-green-400 text-xs">
                  <span class="material-symbols-outlined" style="font-size:16px;">verified</span>
                  Email verificado
                </div>`}
            </div>

            <!-- Accesos rápidos -->
            <div class="card-border-frame bg-black/40 p-4 rounded-sm">
              <p class="text-theatreGold/60 text-[9px] uppercase tracking-[0.3em] mb-3">Accesos Rápidos</p>
              <div class="space-y-2">
                ${[
                  { icon: 'home',               label: 'Ir al inicio',    href: '#/'        },
                  { icon: 'confirmation_number', label: 'Mis reservas',    href: '#/'        },
                  { icon: 'star',               label: 'Favoritos',       href: '#/'        },
                ].map(l => `
                  <a href="${l.href}"
                     class="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/5 transition-colors group">
                    <span class="material-symbols-outlined text-theatreGold/50 group-hover:text-theatreGold transition-colors"
                          style="font-size:18px;">${l.icon}</span>
                    <span class="text-xs text-theatreGray group-hover:text-theatreBeige transition-colors">
                      ${l.label}
                    </span>
                  </a>`).join('')}
              </div>
            </div>
          </aside>

          <!-- ═══ PANEL PRINCIPAL ═══ -->
          <main class="lg:col-span-2 space-y-4">

            <!-- Tabs -->
            <div class="flex border-b border-white/5">
              ${[
                { key: 'profile',  label: 'Mi Perfil',   icon: 'person'    },
                { key: 'password', label: 'Contraseña',  icon: 'lock'      },
              ].map((t, i) => `
                <button data-tab-btn="${t.key}"
                        class="flex items-center gap-2 px-5 py-3 text-xs font-medium tracking-widest uppercase
                               border-b-2 transition-all duration-200
                               ${i === 0
                                 ? 'border-theatreGold text-theatreGold'
                                 : 'border-transparent text-on-surface-variant hover:text-theatreBeige'}">
                  <span class="material-symbols-outlined" style="font-size:16px;">${t.icon}</span>
                  ${t.label}
                </button>`).join('')}
            </div>

            <!-- ── Tab: Mi Perfil ── -->
            <div data-tab="profile" class="card-border-frame bg-black/40 p-6 rounded-sm">
              <h3 class="font-serif text-theatreGold text-lg mb-1">Información Personal</h3>
              <p class="text-theatreGray text-xs mb-6">Actualiza tu nombre y teléfono de contacto.</p>

              <form id="profileForm" class="space-y-5" novalidate>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <!-- Nombre -->
                  <div class="md:col-span-2">
                    <label class="block text-xs text-on-surface-variant mb-1.5" for="profileName">
                      Nombre completo
                    </label>
                    <div class="relative">
                      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                                   text-on-surface-variant" style="font-size:18px;">person</span>
                      <input id="profileName" type="text" value="${user?.name ?? ''}"
                             class="w-full bg-surface-container-low border border-outline-variant text-on-surface
                                    rounded-sm py-3 pl-10 pr-4 font-body-md input-theatre transition-all text-sm"/>
                    </div>
                  </div>

                  <!-- Email (readonly) -->
                  <div>
                    <label class="block text-xs text-on-surface-variant mb-1.5">Correo electrónico</label>
                    <div class="relative opacity-60">
                      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                                   text-on-surface-variant" style="font-size:18px;">mail</span>
                      <input type="email" value="${user?.email ?? ''}" readonly disabled
                             class="w-full bg-surface-container-lowest border border-outline-variant/50 text-on-surface
                                    rounded-sm py-3 pl-10 pr-4 text-sm cursor-not-allowed"/>
                    </div>
                    <p class="text-[10px] text-on-surface-variant/50 mt-1">El correo no se puede cambiar.</p>
                  </div>

                  <!-- Teléfono -->
                  <div>
                    <label class="block text-xs text-on-surface-variant mb-1.5" for="profilePhone">
                      Teléfono
                    </label>
                    <div class="relative">
                      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                                   text-on-surface-variant" style="font-size:18px;">call</span>
                      <input id="profilePhone" type="tel" value="${user?.phone ?? ''}"
                             placeholder="+57 300 1234567"
                             class="w-full bg-surface-container-low border border-outline-variant text-on-surface
                                    rounded-sm py-3 pl-10 pr-4 font-body-md input-theatre transition-all text-sm
                                    placeholder:text-on-surface-variant/30"/>
                    </div>
                  </div>
                </div>

                <p id="profileStatus" class="hidden text-sm"></p>

                <button id="profileBtn" type="submit"
                        class="flex items-center gap-2 px-6 py-2.5 bg-theatreBurgundy text-white
                               text-[11px] font-bold tracking-[0.15em] uppercase
                               hover:brightness-110 transition-all duration-300">
                  Guardar Cambios
                  <span class="material-symbols-outlined" style="font-size:16px;">save</span>
                </button>
              </form>
            </div>

            <!-- ── Tab: Contraseña ── -->
            <div data-tab="password" class="hidden card-border-frame bg-black/40 p-6 rounded-sm">
              <h3 class="font-serif text-theatreGold text-lg mb-1">Cambiar Contraseña</h3>
              <p class="text-theatreGray text-xs mb-6">
                Mínimo 8 caracteres. Tu sesión se mantendrá activa.
              </p>

              <form id="pwForm" class="space-y-4" novalidate>
                ${[
                  { id: 'currentPassword', label: 'Contraseña actual',    icon: 'lock'          },
                  { id: 'newPassword',     label: 'Nueva contraseña',     icon: 'lock_reset'     },
                  { id: 'confirmPassword', label: 'Confirmar nueva',      icon: 'verified_user'  },
                ].map(f => `
                  <div>
                    <label class="block text-xs text-on-surface-variant mb-1.5" for="${f.id}">
                      ${f.label}
                    </label>
                    <div class="relative">
                      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                                   text-on-surface-variant" style="font-size:18px;">${f.icon}</span>
                      <input id="${f.id}" type="password" placeholder="••••••••" required
                             class="w-full bg-surface-container-low border border-outline-variant text-on-surface
                                    rounded-sm py-3 pl-10 pr-4 font-body-md input-theatre transition-all text-sm
                                    placeholder:text-on-surface-variant/30"/>
                    </div>
                  </div>`).join('')}

                <p id="passwordStatus" class="hidden text-sm"></p>

                <button id="passwordBtn" type="submit"
                        class="flex items-center gap-2 px-6 py-2.5 bg-theatreBurgundy text-white
                               text-[11px] font-bold tracking-[0.15em] uppercase
                               hover:brightness-110 transition-all duration-300">
                  Cambiar Contraseña
                  <span class="material-symbols-outlined" style="font-size:16px;">lock_reset</span>
                </button>
              </form>
            </div>

          </main>
        </div>
      </div>

      <!-- Footer -->
      <footer class="border-t border-white/5 py-6 px-6">
        <p class="text-center text-[9px] text-theatreGray/30 uppercase tracking-[0.4em]">
          © 2025 Teatro Eventual — Todos los derechos reservados
        </p>
      </footer>
    </div>
  `;
}