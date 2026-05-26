/**
 * ============================================================
 *  view/register.js — Vista de registro
 *  Conectada a POST /api/auth/register
 * ============================================================
 */

import { register }          from '../auth.js';
import { loginWithGoogle }  from '../api.js';
import { navigate }                  from '../router.js';

// ─────────────────────────────────────────────────────────────
//  Validaciones locales
// ─────────────────────────────────────────────────────────────

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
    el.textContent = '';
    el.classList.add('hidden');
  });
  document.getElementById('registerError')?.classList.add('hidden');
}

// ─────────────────────────────────────────────────────────────
//  Handler del formulario
// ─────────────────────────────────────────────────────────────

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

  // Validación client-side
  const errors = validateForm(data);
  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([field, msg]) => showFieldError(field, msg));
    return;
  }

  // ── UI: cargando ──
  btn.disabled  = true;
  btn.innerHTML = `<span class="material-symbols-outlined animate-spin" style="font-size:20px;">progress_activity</span> Creando cuenta...`;

  const res = await register(data);

  if (res.success) {
    btn.innerHTML = `<span class="material-symbols-outlined">check_circle</span> ¡Cuenta Creada!`;
    btn.classList.remove('bg-[#800020]', 'hover:bg-[#a00028]');
    btn.classList.add('bg-green-800');
    window.showToast?.(`Bienvenido, ${res.user?.name ?? ''}`, 'success');
    setTimeout(() => navigate('dashboard'), 800);
    return;
  }

  // ── Error del servidor ──
  btn.disabled  = false;
  btn.innerHTML = `Crear Cuenta <span class="material-symbols-outlined">arrow_forward</span>`;

  // Si la API devuelve errores de validación por campo (422)
  if (res.data && typeof res.data === 'object') {
    Object.entries(res.data).forEach(([field, msgs]) => {
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

// ─────────────────────────────────────────────────────────────
//  Campo helper
// ─────────────────────────────────────────────────────────────

function fieldHTML({ id, label, type = 'text', placeholder, icon, required = true }) {
  return `
    <div>
      <label class="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1" for="${id}">
        ${label}${required ? ' <span class="text-error opacity-70">*</span>' : ''}
      </label>
      <div class="relative">
        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2
                     text-on-surface-variant text-[20px]">${icon}</span>
        <input id="${id}" type="${type}" placeholder="${placeholder}" ${required ? 'required' : ''}
               class="w-full bg-surface-container-low border border-outline-variant text-on-surface
                      rounded-lg py-3 pl-12 pr-4 font-body-md input-theatre transition-all
                      placeholder:text-on-surface-variant/30"/>
      </div>
      <p id="err-${id}" class="hidden text-error text-xs mt-1 ml-1"></p>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
//  Render
// ─────────────────────────────────────────────────────────────

export async function renderRegister() {

  const appEl = document.querySelector('#app');
  if (appEl) {
    appEl.addEventListener('view:mounted', () => {
      document.getElementById('registerForm')?.addEventListener('submit', handleSubmit);
      document.getElementById('btnGoogle')?.addEventListener('click', () => loginWithGoogle());

      // Tilt effect en la card
      const card = document.querySelector('.glass-card');
      if (card) {
        document.addEventListener('mousemove', (ev) => {
          const xAxis = (window.innerWidth  / 2 - ev.pageX) / 60;
          const yAxis = (window.innerHeight / 2 - ev.pageY) / 60;
          card.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });
      }
    }, { once: true });
  }

  return `
    <!-- Fondo -->
    <div class="fixed inset-0 z-0">
      <div class="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 z-10"></div>
      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDw2dA63c716tE0K5Wqqj2GAJfPV0KQzZH6GD8N5Sp-8mkJxYKGachKfiXHBXZWeNuk1A_Li60e6z07FAa5IZ01YSsip_eifZ6zqAi82ZtmOa3DLBlfjRvylbP4Ahx291a7LmqiNZjD5F3AMRDUQ_vtv0MVfaDcK7_YEFXRsMbEX8L_kMG81dERdhpc7kHPOxsR4FRY1pbqGEA0Fb0IdQw9YnhEKuNHmpkTajNCa6UO1fm-V2JICwSafoQF0w7LqcXOzvytc87GS2wK"
           alt="Teatro" class="w-full h-full object-cover opacity-60"/>
    </div>

    <!-- Header -->
    <header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center
                   px-gutter py-4 bg-surface/40 backdrop-blur-md border-b border-outline-variant/30">
      <a href="#/" class="font-headline-md font-bold tracking-tight text-tertiary text-xl">
        Teatro Eventual
      </a>
      <a href="#/login"
         class="text-[10px] tracking-widest uppercase text-theatreGray hover:text-theatreGold transition-colors">
        ← Iniciar sesión
      </a>
    </header>

    <!-- Main -->
    <main class="relative z-20 flex-grow flex items-center justify-center
                 px-4 pt-28 pb-16 min-h-screen">

      <div class="glass-card theatrical-glow w-full max-w-lg p-8 md:p-10 rounded-xl">

        <!-- Encabezado -->
        <div class="text-center mb-8">
          <h1 class="font-headline-md text-tertiary leading-tight mb-2" style="font-size:2.25rem;">
            Crear Cuenta
          </h1>
          <p class="font-body-md text-on-surface-variant text-sm">
            Únete y accede a experiencias exclusivas.
          </p>
        </div>

        <!-- Error global -->
        <div id="registerError"
             class="hidden mb-5 bg-error-container/40 border border-error/30 text-error rounded-lg px-4 py-3 text-sm">
        </div>

        <!-- Formulario -->
        <form id="registerForm" class="space-y-4" novalidate>

          ${fieldHTML({ id: 'name',  label: 'Nombre completo', placeholder: 'Ej. Juan Pérez',      icon: 'person'  })}
          ${fieldHTML({ id: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'email@ejemplo.com', icon: 'mail'   })}
          ${fieldHTML({ id: 'phone', label: 'Teléfono',  type: 'tel',  placeholder: '+57 300 1234567', icon: 'call', required: false })}

          <!-- Contraseñas en grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1" for="password">
                Contraseña <span class="text-error opacity-70">*</span>
              </label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2
                             text-on-surface-variant text-[20px]">lock</span>
                <input id="password" type="password" placeholder="••••••••" required
                       class="w-full bg-surface-container-low border border-outline-variant text-on-surface
                              rounded-lg py-3 pl-12 pr-4 font-body-md input-theatre transition-all
                              placeholder:text-on-surface-variant/30"/>
              </div>
              <p id="err-password" class="hidden text-error text-xs mt-1 ml-1"></p>
            </div>
            <div>
              <label class="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1" for="confirm_password">
                Confirmar <span class="text-error opacity-70">*</span>
              </label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2
                             text-on-surface-variant text-[20px]">verified_user</span>
                <input id="confirm_password" type="password" placeholder="••••••••" required
                       class="w-full bg-surface-container-low border border-outline-variant text-on-surface
                              rounded-lg py-3 pl-12 pr-4 font-body-md input-theatre transition-all
                              placeholder:text-on-surface-variant/30"/>
              </div>
              <p id="err-password_confirmation" class="hidden text-error text-xs mt-1 ml-1"></p>
            </div>
          </div>

          <!-- Submit -->
          <button id="registerBtn" type="submit"
                  class="w-full bg-[#800020] hover:bg-[#a00028] text-white font-headline-md
                         py-4 rounded-lg mt-2 transition-all duration-300 shadow-xl active:scale-[0.98]
                         transform flex items-center justify-center gap-2">
            Crear Cuenta
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>

          <!-- Google OAuth -->
          <button id="btnGoogle" type="button"
                  class="w-full flex items-center justify-center gap-2 border border-outline-variant
                         hover:bg-surface-container-high py-3.5 rounded-lg transition-colors group">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVkZmvvF6JUEx71KFVvp3wjfOMdup0n6M2HiMZttyFruVbHpLEN3wpPGLt3X-Gq8enWlK6pmZhM0C2ztbEHDI-y9S_lxWLpUoSkzXUrYrgFdMnqyrI4swfpFLGJAmlC2kWwY6fuX49VuVDs2lPOgPhb61k-69GDub84AAoXTGPL-AMjiHPrGlfgNDkW5Onky12IcC0zLf93zFenM14Dl8CtFXcJqx1SWMO6y28nx-sHJJJNbhUMkZ0zbKZaWrXYW4XWXkkRedQdc3D"
                 alt="Google" class="w-5 h-5 grayscale group-hover:grayscale-0 transition-all"/>
            <span class="font-label-sm">Registrarse con Google</span>
          </button>

          <!-- Link a login -->
          <p class="text-center font-body-md text-on-surface-variant text-sm">
            ¿Ya tienes cuenta?
            <a href="#/login" class="text-tertiary font-bold hover:underline ml-1">Inicia sesión</a>
          </p>

        </form>
      </div>
    </main>

    <!-- Footer mínimo -->
    <footer class="relative z-20 w-full bg-surface-container-lowest/80 backdrop-blur-xl
                   border-t border-outline-variant/30 py-6 px-gutter">
      <div class="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <span class="font-headline-md font-bold text-tertiary">Teatro Eventual</span>
        <p class="font-label-sm text-on-surface-variant text-xs">
          © 2026 Teatro Eventual — Sistema de Gestión Escénica
        </p>
      </div>
    </footer>
  `;
}