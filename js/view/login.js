/**
 * ============================================================
 *  view/login.js — Login Cinemático + Google OAuth
 * ============================================================
 */

import { login } from '../auth.js';
import { loginWithGoogle } from '../api.js';
import { navigate } from '../router.js';

// ============================================================
// LOGIN NORMAL
// ============================================================

async function handleSubmit(e) {
  e.preventDefault();

  const btn = document.getElementById('loginBtn');
  const errorBox = document.getElementById('loginError');

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  btn.disabled = true;

  btn.innerHTML = `
    <span class="material-symbols-outlined animate-spin text-[20px]">
      progress_activity
    </span>
    <span>Verificando...</span>
  `;

  errorBox.classList.add('hidden');

  try {

    const res = await login({ email, password });

    // SUCCESS
    if (res.success) {

      btn.innerHTML = `
        <span class="material-symbols-outlined text-[20px]">
          check_circle
        </span>
        <span>¡Bienvenido!</span>
      `;

      btn.classList.remove('bg-[#8B1E3F]');
      btn.classList.add('bg-green-700');

      window.showToast?.(
        `Bienvenido ${res.user?.name ?? ''}`,
        'success'
      );

      setTimeout(() => {
        navigate('dashboard');
      }, 800);

      return;
    }

    // ERROR
    btn.disabled = false;

    btn.innerHTML = `
      <span>Iniciar Sesión</span>
      <span class="material-symbols-outlined">
        confirmation_number
      </span>
    `;

    errorBox.textContent =
      res.message || 'Credenciales inválidas';

    errorBox.classList.remove('hidden');

  } catch (err) {

    console.error(err);

    btn.disabled = false;

    btn.innerHTML = `
      <span>Iniciar Sesión</span>
      <span class="material-symbols-outlined">
        confirmation_number
      </span>
    `;

    errorBox.textContent =
      'Error interno del servidor';

    errorBox.classList.remove('hidden');
  }
}

// ============================================================
// TOGGLE PASSWORD
// ============================================================

function togglePassword() {

  const input = document.getElementById('password');
  const icon = document.getElementById('toggleIcon');

  if (!input) return;

  const hidden = input.type === 'password';

  input.type = hidden ? 'text' : 'password';

  icon.textContent =
    hidden
      ? 'visibility_off'
      : 'visibility';
}

// ============================================================
// GOOGLE LOGIN
// ============================================================

async function handleGoogleLogin() {

  const btn = document.getElementById('btnGoogle');

  btn.disabled = true;

  btn.innerHTML = `
    <span class="material-symbols-outlined animate-spin text-[20px]">
      progress_activity
    </span>
    <span>Conectando...</span>
  `;

  try {

    await loginWithGoogle();

  } catch (err) {

    console.error(err);

    window.showToast?.(
      'No se pudo iniciar sesión con Google',
      'error'
    );

    btn.disabled = false;

    btn.innerHTML = `
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        class="w-5 h-5"
        alt="Google"
      />
      <span>Continuar con Google</span>
    `;
  }
}

// ============================================================
// RENDER LOGIN
// ============================================================

export async function renderLogin() {

  const appEl = document.querySelector('#app');

  if (appEl) {

    appEl.addEventListener(
      'view:mounted',
      () => {

        document
          .getElementById('loginForm')
          ?.addEventListener('submit', handleSubmit);

        document
          .getElementById('togglePass')
          ?.addEventListener('click', togglePassword);

        document
          .getElementById('btnGoogle')
          ?.addEventListener('click', handleGoogleLogin);

        document
          .getElementById('forgotLink')
          ?.addEventListener('click', (e) => {

            e.preventDefault();

            window.showToast?.(
              'Recuperación próximamente',
              'info'
            );
          });

        setTimeout(() => {
          document
            .getElementById('email')
            ?.focus();
        }, 300);

      },
      { once: true }
    );
  }

  return `
  <div class="relative min-h-screen overflow-hidden bg-black">

    <!-- BACKGROUND -->
    <div class="absolute inset-0 z-0">

      <img
        src="./img/login-img.png"
        alt="Theatre"
        class="w-full h-full object-cover"
      />

      <!-- OVERLAY -->
      <div class="absolute inset-0 bg-black/70"></div>

      <!-- GOLD LIGHT -->
      <div
        class="absolute inset-0"
        style="
          background:
            radial-gradient(circle at center,
            rgba(212,175,55,0.12),
            transparent 60%);
        "
      ></div>

    </div>

    <!-- HEADER -->
    <header
      class="fixed top-0 left-0 w-full z-50
             flex items-center justify-between
             px-6 md:px-10 py-4
             bg-black/30 backdrop-blur-xl
             border-b border-white/10"
    >

<a
  href="#/home"
  onclick="history.back(); return false;"
  class="flex items-center gap-2"
>
  <span class="material-symbols-outlined text-[#D4AF37]">
    arrow_back
  </span>

  <span class="text-[#D4AF37] font-bold text-lg">
    Volver
  </span>
</a>



    </header>

    <!-- MAIN -->
    <main
      class="relative z-10
             min-h-screen
             flex items-center justify-center
             px-6 py-24"
    >

      <!-- CARD -->
      <section
        id="loginCard"
        class="w-full max-w-[430px]
               rounded-3xl
               border border-white/10
               bg-white/5
               backdrop-blur-2xl
               shadow-2xl
               p-8 md:p-10
               relative overflow-hidden"
      >

        <!-- GLOW -->
        <div
          class="absolute -top-24 left-1/2 -translate-x-1/2
                 w-72 h-72 rounded-full
                 bg-[#D4AF37]/10 blur-3xl"
        ></div>

        <!-- HEADER -->
        <div class="relative z-10 text-center mb-8">

          <div
            class="w-16 h-16 rounded-full
                   border border-[#D4AF37]/30
                   bg-white/5
                   flex items-center justify-center
                   mx-auto mb-4"
          >

            <span
              class="material-symbols-outlined
                     text-[#D4AF37] text-[28px]"
            >
              confirmation_number
            </span>

          </div>

          <h1 class="text-4xl font-bold text-white">
            Bienvenido
          </h1>

          <p class="text-white/60 mt-2">
            Accede a tu cuenta
          </p>

        </div>

        <!-- ERROR -->
        <div
          id="loginError"
          class="hidden mb-5
                 rounded-xl
                 border border-red-500/20
                 bg-red-500/10
                 text-red-200
                 text-sm
                 px-4 py-3"
        ></div>

        <!-- FORM -->
        <form
          id="loginForm"
          class="space-y-5"
        >

          <!-- EMAIL -->
          <div class="space-y-2">

            <label class="text-sm text-white/80">
              Correo Electrónico
            </label>

            <div class="relative">

              <span
                class="material-symbols-outlined
                       absolute left-4 top-1/2 -translate-y-1/2
                       text-white/40"
              >
                mail
              </span>

              <input
                id="email"
                type="email"
                required
                autocomplete="email"
                placeholder="usuario@ejemplo.com"
                class="w-full
                       rounded-xl
                       border border-white/10
                       bg-white/5
                       py-3.5 pl-12 pr-4
                       text-white
                       placeholder:text-white/30
                       outline-none
                       focus:border-[#D4AF37]
                       focus:ring-2 focus:ring-[#D4AF37]/20"
              />

            </div>

          </div>

          <!-- PASSWORD -->
          <div class="space-y-2">

            <div class="flex items-center justify-between">

              <label class="text-sm text-white/80">
                Contraseña
              </label>

              <a
                id="forgotLink"
                href="#"
                class="text-xs text-[#D4AF37] hover:underline"
              >
                ¿Olvidaste tu clave?
              </a>

            </div>

            <div class="relative">

              <span
                class="material-symbols-outlined
                       absolute left-4 top-1/2 -translate-y-1/2
                       text-white/40"
              >
                lock
              </span>

              <input
                id="password"
                type="password"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full
                       rounded-xl
                       border border-white/10
                       bg-white/5
                       py-3.5 pl-12 pr-12
                       text-white
                       placeholder:text-white/30
                       outline-none
                       focus:border-[#D4AF37]
                       focus:ring-2 focus:ring-[#D4AF37]/20"
              />

              <button
                id="togglePass"
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2
                       text-white/40 hover:text-white"
              >

                <span
                  id="toggleIcon"
                  class="material-symbols-outlined"
                >
                  visibility
                </span>

              </button>

            </div>

          </div>

          <!-- BUTTON -->
          <button
            id="loginBtn"
            type="submit"
            class="w-full
                   py-4
                   rounded-xl
                   bg-[#8B1E3F]
                   hover:bg-[#a8244c]
                   text-white
                   font-semibold
                   flex items-center justify-center gap-2
                   transition-all duration-300"
          >

            <span>Iniciar Sesión</span>

            <span class="material-symbols-outlined">
              confirmation_number
            </span>

          </button>

        </form>

        <!-- DIVIDER -->
        <div class="flex items-center gap-3 my-6">

          <div class="h-px flex-1 bg-white/10"></div>

          <span
            class="text-xs uppercase tracking-widest text-white/40"
          >
            o continúa con
          </span>

          <div class="h-px flex-1 bg-white/10"></div>

        </div>

        <!-- GOOGLE -->
        <button
          id="btnGoogle"
          class="w-full
                 rounded-xl
                 border border-white/10
                 bg-white/5 hover:bg-white/10
                 py-3.5
                 flex items-center justify-center gap-3
                 transition-all"
        >

          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            class="w-5 h-5"
            alt="Google"
          />

          <span class="text-white/90 font-medium">
            Continuar con Google
          </span>

        </button>

        <!-- REGISTER -->
        <p class="mt-7 text-center text-sm text-white/50">

          ¿Aún no tienes cuenta?

          <a
            href="#/register"
            class="text-[#D4AF37]
                   font-semibold
                   hover:underline ml-1"
          >
            Únete ahora →
          </a>

        </p>

      </section>

    </main>

  </div>
  `;
}