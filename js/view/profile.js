/**
 * ============================================================
 *  view/profile.js — Mi Perfil | Teatro Eventual
 * ============================================================
 */

import { getUser }                                           from '../auth.js';
import { me, updateProfile, uploadAvatar }                  from '../api.js';
import { renderNavbar, attachNavbarHandlers, NAV_HEIGHT }   from '../components/navbar.js';

function avatarInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO',{ year:'numeric', month:'long', day:'numeric' });
}

export async function renderProfile() {
  const res  = await me();
  const user = res.success ? (res.data?.user ?? res.data) : getUser();

  requestAnimationFrame(() => {
    attachNavbarHandlers();

    // Actualizar perfil
    document.getElementById('form-profile')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn   = document.getElementById('btn-save-profile');
      const name  = document.getElementById('profile-name').value.trim();
      const phone = document.getElementById('profile-phone').value.trim() || null;
      const errEl = document.getElementById('profile-error');
      const okEl  = document.getElementById('profile-ok');

      if (!name) {
        if (errEl) { errEl.textContent = 'El nombre es requerido.'; errEl.classList.remove('hidden'); }
        return;
      }

      btn.disabled  = true;
      btn.innerHTML = `<span class="material-symbols-outlined animate-spin" style="font-size:16px;">progress_activity</span> Guardando...`;

      const r = await updateProfile({ name, phone });
      btn.disabled  = false;
      btn.innerHTML = `Guardar cambios <span class="material-symbols-outlined" style="font-size:16px;">save</span>`;

      if (r.success) {
        const stored = JSON.parse(localStorage.getItem('auth_user') || '{}');
        stored.name = name; stored.phone = phone;
        localStorage.setItem('auth_user', JSON.stringify(stored));
        errEl?.classList.add('hidden');
        if (okEl) { okEl.textContent = '✓ Perfil actualizado.'; okEl.classList.remove('hidden'); }
        window.showToast?.('Perfil actualizado', 'success');
        setTimeout(() => okEl?.classList.add('hidden'), 4000);
      } else {
        if (errEl) { errEl.textContent = r.message || 'Error al actualizar.'; errEl.classList.remove('hidden'); }
      }
    });

    // Subir avatar
    document.getElementById('input-avatar')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!['image/jpeg','image/png','image/webp','image/jpg'].includes(file.type)) {
        window.showToast?.('Formato no permitido. Usa JPG, PNG o WEBP', 'error'); return;
      }
      if (file.size > 2 * 1024 * 1024) {
        window.showToast?.('La imagen no puede superar 2MB', 'error'); return;
      }

      const previewEl = document.getElementById('avatar-preview');
      if (previewEl) previewEl.innerHTML = `
        <div class="w-24 h-24 rounded-full bg-theatreBurgundy/40 flex items-center justify-center border-2 border-theatreGold/30">
          <span class="material-symbols-outlined animate-spin text-theatreGold" style="font-size:1.5rem;">progress_activity</span>
        </div>`;

      const formData = new FormData();
      formData.append('avatar', file);
      const r = await uploadAvatar(formData);

      if (r.success) {
        const url = r.data?.avatar_url;
        if (previewEl && url)
          previewEl.innerHTML = `<img src="${url}" alt="Avatar" class="w-24 h-24 rounded-full object-cover border-2 border-theatreGold/30"/>`;
        const stored = JSON.parse(localStorage.getItem('auth_user') || '{}');
        stored.avatar_url = url;
        localStorage.setItem('auth_user', JSON.stringify(stored));
        window.showToast?.('Foto de perfil actualizada', 'success');
      } else {
        window.showToast?.(r.message || 'Error al subir la foto', 'error');
        if (previewEl) previewEl.innerHTML = user?.avatar_url
          ? `<img src="${user.avatar_url}" alt="Avatar" class="w-24 h-24 rounded-full object-cover border-2 border-theatreGold/30"/>`
          : `<div class="w-24 h-24 rounded-full bg-theatreBurgundy flex items-center justify-center text-theatreGold text-2xl font-serif font-bold border-2 border-theatreGold/30">${avatarInitials(user?.name)}</div>`;
      }
    });
  });

  return `
    ${renderNavbar('perfil')}
    <main class="${NAV_HEIGHT} min-h-screen">
      <div class="max-w-4xl mx-auto px-4 md:px-6 py-10">

        <div class="mb-10">
          <p class="text-theatreGold text-[10px] tracking-[0.4em] uppercase mb-2">Mi cuenta</p>
          <h1 class="font-serif text-3xl md:text-4xl text-theatreBeige">Mi Perfil</h1>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Sidebar -->
          <aside class="lg:col-span-1">
            <div class="card-border-frame bg-black/40 p-6 text-center">
              <div id="avatar-preview" class="flex justify-center mb-4">
                ${user?.avatar_url
                  ? `<img src="${user.avatar_url}" alt="Avatar" class="w-24 h-24 rounded-full object-cover border-2 border-theatreGold/30"/>`
                  : `<div class="w-24 h-24 rounded-full bg-theatreBurgundy flex items-center justify-center text-theatreGold text-2xl font-serif font-bold border-2 border-theatreGold/30">
                       ${avatarInitials(user?.name)}
                     </div>`
                }
              </div>
              <h2 class="font-serif text-theatreBeige text-lg mb-0.5">${user?.name ?? '—'}</h2>
              <p class="text-theatreGray text-xs mb-4 truncate">${user?.email ?? ''}</p>
              <label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-theatreGold/30
                            text-theatreGold text-[10px] uppercase tracking-widest hover:bg-theatreGold/10 transition-all">
                <span class="material-symbols-outlined" style="font-size:14px;">photo_camera</span>
                Cambiar foto
                <input id="input-avatar" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"/>
              </label>
              <p class="text-[9px] text-theatreGray/40 mt-2">JPG, PNG o WEBP · máx 2MB</p>
              <div class="border-t border-white/5 mt-6 pt-4 space-y-3 text-left">
                ${[
                  { icon:'phone',    label:'Teléfono',      val: user?.phone || '—' },
                  { icon:'badge',    label:'Proveedor',     val: user?.provider || 'local' },
                  { icon:'schedule', label:'Miembro desde', val: fmtDate(user?.created_at) },
                ].map(r => `
                  <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-theatreGold/40" style="font-size:16px;">${r.icon}</span>
                    <div>
                      <p class="text-[9px] text-theatreGray/40 uppercase tracking-widest">${r.label}</p>
                      <p class="text-theatreBeige text-sm">${r.val}</p>
                    </div>
                  </div>`).join('')}
              </div>
            </div>
          </aside>

          <!-- Panel -->
          <div class="lg:col-span-2 card-border-frame bg-black/40 p-6">
            <h3 class="font-serif text-theatreGold text-lg mb-1">Información Personal</h3>
            <p class="text-theatreGray text-xs mb-6">Actualiza tu nombre y teléfono.</p>
            <p id="profile-error" class="hidden text-red-400 text-sm mb-4"></p>
            <p id="profile-ok"    class="hidden text-green-400 text-sm mb-4"></p>
            <form id="form-profile" class="space-y-5" novalidate>
              <div>
                <label class="block text-[10px] text-theatreGray uppercase tracking-widest mb-2" for="profile-name">
                  Nombre completo *
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-theatreGray/40" style="font-size:18px;">person</span>
                  <input id="profile-name" type="text" value="${user?.name ?? ''}"
                         class="w-full py-3 pl-10 pr-4 text-sm rounded-sm border"/>
                </div>
              </div>
              <div class="opacity-60">
                <label class="block text-[10px] text-theatreGray uppercase tracking-widest mb-2">Correo electrónico</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-theatreGray/40" style="font-size:18px;">mail</span>
                  <input type="email" value="${user?.email ?? ''}" readonly disabled
                         class="w-full py-3 pl-10 pr-4 text-sm rounded-sm border cursor-not-allowed"/>
                </div>
                <p class="text-[9px] text-theatreGray/40 mt-1">El correo no se puede cambiar.</p>
              </div>
              <div>
                <label class="block text-[10px] text-theatreGray uppercase tracking-widest mb-2" for="profile-phone">
                  Teléfono
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-theatreGray/40" style="font-size:18px;">call</span>
                  <input id="profile-phone" type="tel" value="${user?.phone ?? ''}"
                         placeholder="+57 300 1234567"
                         class="w-full py-3 pl-10 pr-4 text-sm rounded-sm border"/>
                </div>
              </div>
              <button id="btn-save-profile" type="submit"
                      class="flex items-center gap-2 px-6 py-3 bg-theatreBurgundy text-white
                             text-[11px] font-bold tracking-[0.15em] uppercase hover:brightness-110 transition-all">
                Guardar cambios
                <span class="material-symbols-outlined" style="font-size:16px;">save</span>
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
