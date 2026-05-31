/**
 * ============================================================
 *  view/register.js — Vista de registro | Teatro Eventual
 * ============================================================
 */

import { register }        from '../auth.js';
import { loginWithGoogle } from '../api.js';
import { navigate }        from '../router.js';

function validateForm(data) {
  const errors = {};
  if (!data.name || data.name.trim().length < 2)
    errors.name = 'El nombre debe tener al menos 2 caracteres.';
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = 'Ingresa un correo electrónico válido.';
  if (!data.password || data.password.length < 8)
    errors.password = 'La contraseña debe tener mínimo 8 caracteres.';
  if (data.password !== data.password_confirmation)
    errors.password_confirmation = 'Las contraseñas no coinciden.';
  return errors;
}

function showFieldError(fieldId, msg) {
  const el = document.getElementById(`err-${fieldId}`);
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}

function clearErrors() {
  document.querySelectorAll('[id^="err-"]').forEach(el => {
    el.textContent = ''; el.classList.add('hidden');
  });
  document.getElementById('registerError')?.classList.add('hidden');
}

async function handleSubmit(e) {
  e.preventDefault();
  clearErrors();

  const btn  = document.getElementById('registerBtn');
  const data = {
    name:                  document.getElementById('name').value.trim(),
    email:                 document.getElementById('email').value.trim(),
    phone:                 document.getElementById('phone').value.trim() || null,
    password:              document.getElementById('password').value,
    password_confirmation: document.getElementById('confirm_password').value,
  };

  const errors = validateForm(data);
  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([field, msg]) => showFieldError(field, msg));
    return;
  }

  btn.disabled  = true;
  btn.innerHTML = `<span class="material-symbols-outlined animate-spin" style="font-size:20px;">progress_activity</span> Creando cuenta...`;

  const res = await register(data);

  if (res.success) {
    btn.innerHTML = `<span class="material-symbols-outlined">check_circle</span> ¡Cuenta Creada!`;
    btn.classList.add('bg-green-800');
    window.showToast?.(`Bienvenido, ${res.user?.name ?? ''}`, 'success');
    setTimeout(() => navigate('cartelera'), 800);
    return;
  }

  btn.disabled  = false;
  btn.innerHTML = `Crear Cuenta <span class="material-symbols-outlined">arrow_forward</span>`;

  if (res.errors && typeof res.errors === 'object') {
    Object.entries(res.errors).forEach(([field, msgs]) => {
      showFieldError(field, Array.isArray(msgs) ? msgs[0] : msgs);
    });
  } else {
    const errBox = document.getElementById('registerError');
    if (errBox) {
      errBox.textContent = res.message || 'Error al crear la cuenta.';
      errBox.classList.remove('hidden');
    }
  }
}

function fieldHTML({ id, label, type = 'text', placeholder, icon, required = true }) {
  return `
    <div>
      <label class="block text-[10px] text-theatreGray uppercase tracking-widest mb-1.5 ml-1" for="${id}">
        ${label}${required ? ' <span class="text-red-400 opacity-70">*</span>' : ''}
      </label>
      <div class="relative">
        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2
                     text-theatreGray/50 text-[20px]">${icon}</span>
        <input id="${id}" type="${type}" placeholder="${placeholder}" ${required ? 'required' : ''}
               class="w-full border py-3 pl-12 pr-4 text-sm rounded-sm outline-none transition-all
                      placeholder:text-theatreGray/30"/>
      </div>
      <p id="err-${id}" class="hidden text-red-400 text-xs mt-1 ml-1"></p>
    </div>`;
}

export async function renderRegister() {
  requestAnimationFrame(() => {
      document.getElementById('registerForm')?.addEventListener('submit', handleSubmit);
      document.getElementById('btnGoogle')?.addEventListener('click', () => loginWithGoogle());
  });

  return `
    <div class="fixed inset-0 z-0">
      <div class="absolute inset-0 z-10"
           style="background:linear-gradient(to top,rgba(10,10,10,0.9) 0%,rgba(10,10,10,0.4) 60%,rgba(10,10,10,0.6) 100%);"></div>
      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDw2dA63c716tE0K5Wqqj2GAJfPV0KQzZH6GD8N5Sp-8mkJxYKGachKfiXHBXZWeNuk1A_Li60e6z07FAa5IZ01YSsip_eifZ6zqAi82ZtmOa3DLBlfjRvylbP4Ahx291a7LmqiNZjD5F3AMRDUQ_vtv0MVfaDcK7_YEFXRsMbEX8L_kMG81dERdhpc7kHPOxsR4FRY1pbqGEA0Fb0IdQw9YnhEKuNHmpkTajNCa6UO1fm-V2JICwSafoQF0w7LqcXOzvytc87GS2wK"
           alt="Teatro" class="w-full h-full object-cover opacity-60"/>
    </div>

    <header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center
                   px-6 py-4 bg-theatreDark/40 backdrop-blur-md border-b border-white/10">
      <a href="#/" class="font-serif font-bold tracking-tight text-theatreGold text-xl">
        Teatro Eventual
      </a>
      <a href="#/login"
         class="text-[10px] tracking-widest uppercase text-theatreGray hover:text-theatreGold transition-colors">
        ← Iniciar sesión
      </a>
    </header>

    <main class="relative z-20 flex items-center justify-center px-4 pt-28 pb-16 min-h-screen">
      <div class="glass-card theatrical-glow w-full max-w-lg p-8 md:p-10">

        <div class="text-center mb-8">
          <h1 class="font-serif text-theatreGold leading-tight mb-2" style="font-size:2.25rem;">
            Crear Cuenta
          </h1>
          <p class="text-theatreGray text-sm">Únete y accede a experiencias exclusivas.</p>
        </div>

        <div id="registerError"
             class="hidden mb-5 bg-red-900/40 border border-red-700/30 text-red-300 px-4 py-3 text-sm">
        </div>

        <form id="registerForm" class="space-y-4" novalidate>
          ${fieldHTML({ id: 'name',  label: 'Nombre completo',    placeholder: 'Ej. Juan Pérez',     icon: 'person' })}
          ${fieldHTML({ id: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'email@ejemplo.com', icon: 'mail' })}
          ${fieldHTML({ id: 'phone', label: 'Teléfono',           type: 'tel',  placeholder: '+57 300 1234567',   icon: 'call', required: false })}

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] text-theatreGray uppercase tracking-widest mb-1.5 ml-1" for="password">
                Contraseña <span class="text-red-400 opacity-70">*</span>
              </label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-theatreGray/50 text-[20px]">lock</span>
                <input id="password" type="password" placeholder="••••••••" required
                       class="w-full border py-3 pl-12 pr-4 text-sm rounded-sm outline-none transition-all"/>
              </div>
              <p id="err-password" class="hidden text-red-400 text-xs mt-1 ml-1"></p>
            </div>
            <div>
              <label class="block text-[10px] text-theatreGray uppercase tracking-widest mb-1.5 ml-1" for="confirm_password">
                Confirmar <span class="text-red-400 opacity-70">*</span>
              </label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-theatreGray/50 text-[20px]">verified_user</span>
                <input id="confirm_password" type="password" placeholder="••••••••" required
                       class="w-full border py-3 pl-12 pr-4 text-sm rounded-sm outline-none transition-all"/>
              </div>
              <p id="err-password_confirmation" class="hidden text-red-400 text-xs mt-1 ml-1"></p>
            </div>
          </div>

          <button id="registerBtn" type="submit"
                  class="w-full bg-theatreBurgundy hover:brightness-110 text-white font-bold
                         py-4 mt-2 transition-all duration-300 active:scale-[0.98]
                         flex items-center justify-center gap-2 text-[11px] tracking-widest uppercase">
            Crear Cuenta
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>

          <button id="btnGoogle" type="button"
                  class="w-full flex items-center justify-center gap-2 border border-white/15
                         hover:bg-white/5 py-3.5 transition-colors group">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVkZmvvF6JUEx71KFVvp3wjfOMdup0n6M2HiMZttyFruVbHpLEN3wpPGLt3X-Gq8enWlK6pmZhM0C2ztbEHDI-y9S_lxWlpUoSkzXUrYrgFdMnqyrI4swfpFLGJAmlC2kWwY6fuX49VuVDs2lPOgPhb61k-69GDub84AAoXTGPL-AMjiHPrGlfgNDkW5Onky12IcC0zLf93zFenM14Dl8CtFXcJqx1SWMO6y28nx-sHJJJNbhUMkZ0zbKZaWrXYW4XWXkkRedQdc3D"
                 alt="Google" class="w-5 h-5 grayscale group-hover:grayscale-0 transition-all"/>
            <span class="text-theatreGray text-sm group-hover:text-theatreBeige transition-colors">
              Registrarse con Google
            </span>
          </button>

          <p class="text-center text-theatreGray text-sm">
            ¿Ya tienes cuenta?
            <a href="#/login" class="text-theatreGold font-bold hover:underline ml-1">Inicia sesión</a>
          </p>
        </form>
      </div>
    </main>
  `;
}
