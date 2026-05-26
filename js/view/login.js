/**
 * ============================================================
 *  view/login.js — Vista de inicio de sesión
 *  Conectada a POST /api/auth/login
 * ============================================================
 */

import { login }             from '../auth.js';
import { loginWithGoogle }  from '../api.js';
import { navigate }               from '../router.js';

// ─────────────────────────────────────────────────────────────
//  Handler del formulario
// ─────────────────────────────────────────────────────────────

async function handleSubmit(e) {
  e.preventDefault();

  const btn      = document.getElementById('loginBtn');
  const errorBox = document.getElementById('loginError');
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // ── UI: estado de carga ──
  btn.disabled     = true;
  btn.innerHTML    = `<span class="material-symbols-outlined animate-spin" style="font-size:20px;">progress_activity</span> Validando...`;
  errorBox.classList.add('hidden');

  const res = await login({ email, password });

  if (res.success) {
    btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:20px;">check_circle</span> ¡Bienvenido!`;
    btn.classList.remove('bg-[#8B1E3F]');
    btn.classList.add('bg-green-800');
    window.showToast?.(`Bienvenido, ${res.user?.name ?? ''}`, 'success');
    setTimeout(() => navigate('dashboard'), 700);
    return;
  }

  // ── Error ──
  btn.disabled  = false;
  btn.innerHTML = `Iniciar Sesión <span class="material-symbols-outlined">confirmation_number</span>`;
  errorBox.textContent = res.message || 'Credenciales inválidas.';
  errorBox.classList.remove('hidden');
}

function togglePassword() {
  const input = document.getElementById('password');
  const icon  = document.getElementById('toggleIcon');
  const show  = input.type === 'password';
  input.type  = show ? 'text' : 'password';
  icon.textContent = show ? 'visibility_off' : 'visibility';
}

// ─────────────────────────────────────────────────────────────
//  Render
// ─────────────────────────────────────────────────────────────

export async function renderLogin() {

  // Registrar handlers tras view:mounted
  const appEl = document.querySelector('#app');
  if (appEl) {
    appEl.addEventListener('view:mounted', () => {
      document.getElementById('loginForm')?.addEventListener('submit', handleSubmit);
      document.getElementById('togglePass')?.addEventListener('click', togglePassword);
      document.getElementById('btnGoogle')?.addEventListener('click', () => loginWithGoogle());
      document.getElementById('forgotLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.showToast?.('Función de recuperación próximamente.', 'info');
      });
    }, { once: true });
  }

  return `
    <!-- Fondo -->
    <div class="fixed inset-0 z-0">
      <img class="w-full h-full object-cover"
           src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGGQTzu5SYxlrsIw6kEJ2OlnQOkVUCFaISgPLsW1nrGkP_NLsdYASVIiam3xeizwPZejraT1g9DKdVnN2trEUUVzGzg0Uu5YzrWxed-DYVAVXQ2Y6moGvEQM5LZr0_lbwV4kTHiil1EoMJiFTu6UrBYQgGQjRuTLIcQ6CduP-fNC4RKdHGB-FoejW75BKrJertWF_NZYJJTR3VSUGkdKjnpbg0pjn4Nbil74iUaX9sZS4gBW6T7lSE0clqiRFNMX7iuCsDrGy4wmte"
           alt="Teatro"/>
      <div class="absolute inset-0 cinematic-vignette"></div>
    </div>

    <!-- Header mínimo -->
    <header class="fixed top-0 left-0 w-full z-50 flex items-center justify-between
                   px-gutter py-4 bg-surface/40 backdrop-blur-md border-b border-outline-variant/30">
      <a href="#/" class="font-headline-md font-bold tracking-tight text-tertiary text-xl">
        Teatro Eventual
      </a>
      <a href="#/register"
         class="text-[10px] tracking-widest uppercase text-theatreGray hover:text-theatreGold transition-colors">
        Crear cuenta →
      </a>
    </header>

    <!-- Contenido principal -->
    <main class="relative z-10 min-h-screen flex flex-col items-center justify-center
                 px-margin-mobile md:px-margin-desktop pt-20">

      <!-- Logo/título -->
      <header class="mb-8 text-center">
        <h1 class="font-headline-md font-bold tracking-tight text-tertiary text-2xl mb-1">
          Teatro Eventual
        </h1>
        <p class="text-body-md text-on-surface-variant italic max-w-xs mx-auto">
          "Vive la magia del teatro"
        </p>
      </header>

      <!-- Card -->
      <section class="w-full max-w-[440px] glass-card theatrical-glow rounded-xl p-8 md:p-10 shadow-2xl relative overflow-hidden">

        <!-- Línea dorada superior -->
        <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tertiary to-transparent opacity-50"></div>

        <div class="space-y-6">
          <!-- Título -->
          <div class="text-center">
            <h2 class="font-display-lg text-on-surface tracking-tighter" style="font-size:2.5rem;line-height:1.1;">
              Bienvenido
            </h2>
            <p class="text-on-surface-variant text-sm mt-1">Inicia sesión en tu cuenta</p>
          </div>

          <!-- Error global -->
          <div id="loginError"
               class="hidden bg-error-container/40 border border-error/30 text-error rounded-lg px-4 py-3 text-sm">
          </div>

          <!-- Formulario -->
          <form id="loginForm" class="space-y-4" novalidate>

            <!-- Email -->
            <div class="space-y-1.5">
              <label class="font-label-sm text-on-surface-variant px-1 block" for="email">
                Correo Electrónico
              </label>
              <div class="relative group">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                             text-on-surface-variant group-focus-within:text-tertiary transition-colors">
                  mail
                </span>
                <input id="email" type="email" placeholder="usuario@ejemplo.com" required
                       class="w-full bg-surface-container-lowest/50 border border-outline-variant
                              focus:border-tertiary focus:ring-1 focus:ring-tertiary rounded-lg
                              pl-10 pr-4 py-3 font-body-md transition-all outline-none
                              placeholder:text-on-surface-variant/40 text-on-surface"/>
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-center px-1">
                <label class="font-label-sm text-on-surface-variant" for="password">
                  Contraseña
                </label>
                <a id="forgotLink" href="#"
                   class="font-label-sm text-tertiary hover:underline transition-all">
                  ¿Olvidaste tu clave?
                </a>
              </div>
              <div class="relative group">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                             text-on-surface-variant group-focus-within:text-tertiary transition-colors">
                  lock
                </span>
                <input id="password" type="password" placeholder="••••••••" required
                       class="w-full bg-surface-container-lowest/50 border border-outline-variant
                              focus:border-tertiary focus:ring-1 focus:ring-tertiary rounded-lg
                              pl-10 pr-12 py-3 font-body-md transition-all outline-none
                              placeholder:text-on-surface-variant/40 text-on-surface"/>
                <button id="togglePass" type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <span id="toggleIcon" class="material-symbols-outlined">visibility</span>
                </button>
              </div>
            </div>

            <!-- Submit -->
            <button id="loginBtn" type="submit"
                    class="w-full mt-2 bg-[#8B1E3F] hover:bg-[#D4AF37] text-white hover:text-surface
                           font-headline-md py-4 rounded-lg shadow-lg active:scale-[0.98] transition-all
                           duration-300 flex items-center justify-center gap-2">
              Iniciar Sesión
              <span class="material-symbols-outlined">confirmation_number</span>
            </button>
          </form>

          <!-- Divisor -->
          <div class="flex items-center gap-3">
            <div class="h-px bg-outline-variant flex-1"></div>
            <span class="font-label-sm text-on-surface-variant whitespace-nowrap">O continúa con</span>
            <div class="h-px bg-outline-variant flex-1"></div>
          </div>

          <!-- Google OAuth -->
          <button id="btnGoogle"
                  class="w-full flex items-center justify-center gap-2 border border-outline-variant
                         hover:bg-surface-container-high py-3.5 rounded-lg transition-colors group">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVkZmvvF6JUEx71KFVvp3wjfOMdup0n6M2HiMZttyFruVbHpLEN3wpPGLt3X-Gq8enWlK6pmZhM0C2ztbEHDI-y9S_lxWLpUoSkzXUrYrgFdMnqyrI4swfpFLGJAmlC2kWwY6fuX49VuVDs2lPOgPhb61k-69GDub84AAoXTGPL-AMjiHPrGlfgNDkW5Onky12IcC0zLf93zFenM14Dl8CtFXcJqx1SWMO6y28nx-sHJJJNbhUMkZ0zbKZaWrXYW4XWXkkRedQdc3D"
                 alt="Google" class="w-5 h-5 grayscale group-hover:grayscale-0 transition-all"/>
            <span class="font-label-sm">Continuar con Google</span>
          </button>
        </div>

        <!-- Link a registro -->
        <div class="mt-6 text-center">
          <p class="font-body-md text-on-surface-variant text-sm">
            ¿Aún no tienes cuenta?
            <a href="#/register" class="text-tertiary font-bold hover:underline ml-1">Únete ahora</a>
          </p>
        </div>
      </section>

    </main>
  `;
}