/**
 * ============================================================
 *  view/register.js — Registro Cinematográfico Teatro
 * ============================================================
 */

import { register } from '../auth.js';
import { loginWithGoogle } from '../api.js';
import { navigate } from '../router.js';

// ─────────────────────────────────────────────────────────────
// Validaciones
// ─────────────────────────────────────────────────────────────

function validateForm(data) {
  const errors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres.';
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Correo inválido.';
  }

  if (!data.password || data.password.length < 8) {
    errors.password = 'La contraseña debe tener mínimo 8 caracteres.';
  }

  if (data.password !== data.password_confirmation) {
    errors.password_confirmation = 'Las contraseñas no coinciden.';
  }

  return errors;
}

function showFieldError(fieldId, msg) {
  const el = document.getElementById(`err-${fieldId}`);

  if (el) {
    el.textContent = msg;
    el.classList.remove('hidden');
  }
}

function clearErrors() {
  document.querySelectorAll('[id^="err-"]').forEach(el => {
    el.textContent = '';
    el.classList.add('hidden');
  });

  document
    .getElementById('registerError')
    ?.classList.add('hidden');
}

// ─────────────────────────────────────────────────────────────
// Submit
// ─────────────────────────────────────────────────────────────

async function handleSubmit(e) {
  e.preventDefault();

  clearErrors();

  const btn = document.getElementById('registerBtn');

  const data = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    password: document.getElementById('password').value,
    password_confirmation:
      document.getElementById('confirm_password').value
  };

  const errors = validateForm(data);

  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([field, msg]) => {
      showFieldError(field, msg);
    });

    return;
  }

  btn.disabled = true;

  btn.innerHTML = `
    <span class="material-symbols-outlined animate-spin">
      progress_activity
    </span>
    Creando cuenta...
  `;

  const res = await register(data);

  // SUCCESS
  if (res.success) {

    btn.innerHTML = `
      <span class="material-symbols-outlined">
        check_circle
      </span>
      ¡Cuenta Creada!
    `;

    btn.classList.remove('bg-[#7A1022]');
    btn.classList.add('bg-green-700');

    window.showToast?.(
      `Bienvenido ${res.user?.name ?? ''}`,
      'success'
    );

    setTimeout(() => navigate('dashboard'), 1000);

    return;
  }

  // ERROR
  btn.disabled = false;

  btn.innerHTML = `
    Crear Cuenta
    <span class="material-symbols-outlined">
      arrow_forward
    </span>
  `;

  if (res.data && typeof res.data === 'object') {

    Object.entries(res.data).forEach(([field, msgs]) => {
      showFieldError(
        field,
        Array.isArray(msgs) ? msgs[0] : msgs
      );
    });

  } else {

    const errBox =
      document.getElementById('registerError');

    if (errBox) {
      errBox.textContent =
        res.message || 'No se pudo crear la cuenta.';

      errBox.classList.remove('hidden');
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Google Login
// ─────────────────────────────────────────────────────────────

async function handleGoogleRegister() {

  const btn = document.getElementById('btnGoogle');

  btn.disabled = true;

  btn.innerHTML = `
    <span class="material-symbols-outlined animate-spin">
      progress_activity
    </span>
    Conectando...
  `;

  try {

    await loginWithGoogle();

  } catch (err) {

    console.error(err);

    window.showToast?.(
      'No se pudo conectar con Google.',
      'error'
    );

    btn.disabled = false;

    btn.innerHTML = `
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        class="w-5 h-5"
      />
      <span>Registrarse con Google</span>
    `;
  }
}

// ─────────────────────────────────────────────────────────────
// Campo reutilizable
// ─────────────────────────────────────────────────────────────

function fieldHTML({
  id,
  label,
  type = 'text',
  placeholder,
  icon,
  required = true
}) {

  return `
    <div class="space-y-2">

      <label
        for="${id}"
        class="text-sm text-white/80 font-medium"
      >
        ${label}
      </label>

      <div class="relative group">

        <span
          class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2
                 text-white/40 group-focus-within:text-[#D4AF37]
                 transition-colors"
        >
          ${icon}
        </span>

        <input
          id="${id}"
          type="${type}"
          placeholder="${placeholder}"
          ${required ? 'required' : ''}
          class="w-full rounded-xl
                 border border-white/10
                 bg-white/5
                 py-3.5 pl-12 pr-4
                 text-white
                 placeholder:text-white/30
                 outline-none
                 focus:border-[#D4AF37]
                 focus:ring-2 focus:ring-[#D4AF37]/20
                 transition-all"
        />
      </div>

      <p
        id="err-${id}"
        class="hidden text-red-300 text-xs"
      ></p>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────
// Render
// ─────────────────────────────────────────────────────────────

export async function renderRegister() {

  const appEl = document.querySelector('#app');

  if (appEl) {

    appEl.addEventListener(
      'view:mounted',
      () => {

        document
          .getElementById('registerForm')
          ?.addEventListener('submit', handleSubmit);

        document
          .getElementById('btnGoogle')
          ?.addEventListener('click', handleGoogleRegister);

      },
      { once: true }
    );
  }

  return `
  <div class="min-h-screen relative overflow-hidden bg-transparent">

    <!-- BACKGROUND -->
    <div class="absolute inset-0 z-0">

      <!-- Imagen -->
      <img
        src="./img/register-img.png"
        alt="Teatro"
        class="w-full h-full object-cover"
      />

      <!-- Overlay -->
      <div
        class="absolute inset-0"
        style="
          background:
            linear-gradient(
              to right,
              rgba(0,0,0,0.92) 0%,
              rgba(20,0,0,0.82) 35%,
              rgba(60,0,0,0.45) 65%,
              rgba(0,0,0,0.82) 100%
            ),
            );
        "
      ></div>

      <!-- Glow -->
      <div
        class="absolute inset-0"
        style="
          background:
            radial-gradient(
              circle at top left,
              rgba(212,175,55,0.12),
              transparent 30%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(120,0,30,0.25),
              transparent 40%
            );
        "
      ></div>

    </div>

    <!-- CONTENT -->
    <div class="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">

      <section
        class="w-full max-w-[520px]
               rounded-3xl
               border border-white/10
               bg-black/45
               backdrop-blur-2xl
               shadow-2xl
               overflow-hidden
               relative"
      >

        <!-- GOLD LIGHT -->
        <div
          class="absolute -top-24 right-0
                 w-72 h-72 rounded-full
                 bg-[#D4AF37]/10 blur-3xl"
        ></div>

        <div class="relative z-10 p-8 md:p-10">

          <!-- TITLE -->
          <div class="text-center mb-8">

            <div
              class="w-16 h-16 mx-auto rounded-full
                     border border-[#D4AF37]/30
                     bg-white/5
                     flex items-center justify-center mb-4"
            >
              <span class="material-symbols-outlined text-[#D4AF37] text-[28px]">
                theater_comedy
              </span>
            </div>

            <h1 class="text-4xl font-bold text-white">
              Crear Cuenta
            </h1>

            <p class="text-white/60 mt-2">
              Vive la experiencia del teatro
            </p>

          </div>

          <!-- ERROR -->
          <div
            id="registerError"
            class="hidden mb-5 rounded-xl border border-red-500/20
                   bg-red-500/10 px-4 py-3 text-sm text-red-200"
          ></div>

          <!-- FORM -->
          <form
            id="registerForm"
            class="space-y-5"
          >

            ${fieldHTML({
              id: 'name',
              label: 'Nombre completo',
              placeholder: 'Ej. Juan Pérez',
              icon: 'person'
            })}

            ${fieldHTML({
              id: 'email',
              label: 'Correo Electrónico',
              type: 'email',
              placeholder: 'correo@ejemplo.com',
              icon: 'mail'
            })}

            ${fieldHTML({
              id: 'phone',
              label: 'Teléfono',
              type: 'tel',
              placeholder: '+57 300 1234567',
              icon: 'call',
              required: false
            })}

            <div class="grid md:grid-cols-2 gap-4">

              ${fieldHTML({
                id: 'password',
                label: 'Contraseña',
                type: 'password',
                placeholder: '••••••••',
                icon: 'lock'
              })}

              ${fieldHTML({
                id: 'confirm_password',
                label: 'Confirmar',
                type: 'password',
                placeholder: '••••••••',
                icon: 'verified_user'
              })}

            </div>

            <!-- BUTTON -->
            <button
              id="registerBtn"
              type="submit"
              class="w-full mt-2
                     bg-[#7A1022]
                     hover:bg-[#98142b]
                     text-white
                     py-4 rounded-xl
                     font-semibold
                     flex items-center justify-center gap-2
                     transition-all duration-300
                     shadow-lg hover:shadow-[#7A1022]/40
                     active:scale-[0.98]"
            >

              Crear Cuenta

              <span class="material-symbols-outlined">
                arrow_forward
              </span>

            </button>

          </form>

          <!-- Divider -->
          <div class="flex items-center gap-3 my-6">

            <div class="h-px flex-1 bg-white/10"></div>

            <span class="text-xs uppercase tracking-widest text-white/40">
              o continúa con
            </span>

            <div class="h-px flex-1 bg-white/10"></div>

          </div>

          <!-- GOOGLE -->
          <button
            id="btnGoogle"
            class="w-full rounded-xl
                   border border-white/10
                   bg-white/5 hover:bg-white/10
                   py-3.5
                   flex items-center justify-center gap-3
                   transition-all duration-300"
          >

            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              class="w-5 h-5"
              alt="Google"
            />

            <span class="text-white/90 font-medium">
              Registrarse con Google
            </span>

          </button>

          <!-- LOGIN -->
          <p class="mt-7 text-center text-sm text-white/50">

            ¿Ya tienes cuenta?

            <a
              href="#/login"
              class="text-[#D4AF37] font-semibold hover:underline ml-1"
            >
              Inicia sesión
            </a>

          </p>

        </div>

      </section>

    </div>

  </div>
  `;
}