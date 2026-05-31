/**
 * ============================================================
 *  view/login.js — Vista de inicio de sesión | Teatro Eventual
 * ============================================================
 */

import { login }           from '../auth.js';
import { loginWithGoogle } from '../api.js';
import { navigate }        from '../router.js';

async function handleSubmit(e) {
  e.preventDefault();
  const btn      = document.getElementById('loginBtn');
  const errorBox = document.getElementById('loginError');
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  btn.disabled  = true;
  btn.innerHTML = `<span class="material-symbols-outlined animate-spin" style="font-size:20px;">progress_activity</span> Validando...`;
  errorBox.classList.add('hidden');

  const res = await login({ email, password });

  if (res.success) {
    btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:20px;">check_circle</span> ¡Bienvenido!`;
    btn.classList.remove('bg-[#8B1E3F]');
    btn.classList.add('bg-green-800');
    window.showToast?.(`Bienvenido, ${res.user?.name ?? ''}`, 'success');
    setTimeout(() => navigate('cartelera'), 700);
    return;
  }

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

export async function renderLogin() {
  requestAnimationFrame(() => {
      document.getElementById('loginForm')?.addEventListener('submit', handleSubmit);
      document.getElementById('togglePass')?.addEventListener('click', togglePassword);
      document.getElementById('btnGoogle')?.addEventListener('click', () => loginWithGoogle());
      document.getElementById('forgotLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.showToast?.('Función de recuperación próximamente.', 'info');
      });
  });

  return `
    <div class="fixed inset-0 z-0">
      <img class="w-full h-full object-cover"
           src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGGQTzu5SYxlrsIw6kEJ2OlnQOkVUCFaISgPLsW1nrGkP_NLsdYASVIiam3xeizwPZejraT1g9DKdVnN2trEUUVzGzg0Uu5YzrWxed-DYVAVXQ2Y6moGvEQM5LZr0_lbwV4kTHiil1EoMJiFTu6UrBYQgGQjRuTLIcQ6CduP-fNC4RKdHGB-FoejW75BKrJertWF_NZYJJTR3VSUGkdKjnpbg0pjn4Nbil74iUaX9sZS4gBW6T7lSE0clqiRFNMX7iuCsDrGy4wmte"
           alt="Teatro"/>
      <div class="absolute inset-0" style="background:linear-gradient(to top,rgba(10,10,10,0.85) 0%,rgba(10,10,10,0.4) 60%,rgba(10,10,10,0.5) 100%);"></div>
    </div>

    <header class="fixed top-0 left-0 w-full z-50 flex items-center justify-between
                   px-6 py-4 bg-theatreDark/40 backdrop-blur-md border-b border-white/10">
      <a href="#/" class="font-serif font-bold tracking-tight text-theatreGold text-xl">
        Teatro Eventual
      </a>
      <a href="#/register"
         class="text-[10px] tracking-widest uppercase text-theatreGray hover:text-theatreGold transition-colors">
        Crear cuenta →
      </a>
    </header>

    <main class="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20">
      <header class="mb-8 text-center">
        <h1 class="font-serif font-bold text-theatreGold text-2xl mb-1">Teatro Eventual</h1>
        <p class="text-theatreGray italic text-sm max-w-xs mx-auto">"Vive la magia del teatro"</p>
      </header>

      <section class="w-full max-w-[440px] glass-card theatrical-glow p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-theatreGold to-transparent opacity-50"></div>

        <div class="space-y-6">
          <div class="text-center">
            <h2 class="font-serif text-theatreBeige tracking-tighter" style="font-size:2.5rem;line-height:1.1;">
              Bienvenido
            </h2>
            <p class="text-theatreGray text-sm mt-1">Inicia sesión en tu cuenta</p>
          </div>

          <div id="loginError"
               class="hidden bg-red-900/40 border border-red-700/30 text-red-300 px-4 py-3 text-sm">
          </div>

          <form id="loginForm" class="space-y-4" novalidate>
            <div class="space-y-1.5">
              <label class="text-[10px] text-theatreGray uppercase tracking-widest block ml-1" for="email">
                Correo Electrónico
              </label>
              <div class="relative group">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                             text-theatreGray/50 group-focus-within:text-theatreGold transition-colors">
                  mail
                </span>
                <input id="email" type="email" placeholder="usuario@ejemplo.com" required
                       class="w-full border pl-10 pr-4 py-3 text-sm rounded-sm outline-none transition-all"/>
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center ml-1">
                <label class="text-[10px] text-theatreGray uppercase tracking-widest" for="password">
                  Contraseña
                </label>
                <a id="forgotLink" href="#"
                   class="text-[10px] text-theatreGold hover:underline transition-all">
                  ¿Olvidaste tu clave?
                </a>
              </div>
              <div class="relative group">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                             text-theatreGray/50 group-focus-within:text-theatreGold transition-colors">
                  lock
                </span>
                <input id="password" type="password" placeholder="••••••••" required
                       class="w-full border pl-10 pr-12 py-3 text-sm rounded-sm outline-none transition-all"/>
                <button id="togglePass" type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-theatreGray hover:text-theatreBeige transition-colors">
                  <span id="toggleIcon" class="material-symbols-outlined">visibility</span>
                </button>
              </div>
            </div>

            <button id="loginBtn" type="submit"
                    class="w-full mt-2 bg-theatreBurgundy hover:bg-theatreGold text-white hover:text-theatreDark
                           font-bold py-4 active:scale-[0.98] transition-all duration-300
                           flex items-center justify-center gap-2 text-[11px] tracking-widest uppercase">
              Iniciar Sesión
              <span class="material-symbols-outlined">confirmation_number</span>
            </button>
          </form>

          <div class="flex items-center gap-3">
            <div class="h-px bg-white/10 flex-1"></div>
            <span class="text-theatreGray/50 text-xs whitespace-nowrap">O continúa con</span>
            <div class="h-px bg-white/10 flex-1"></div>
          </div>

          <button id="btnGoogle"
                  class="w-full flex items-center justify-center gap-2 border border-white/15
                         hover:bg-white/5 py-3.5 transition-colors group">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVkZmvvF6JUEx71KFVvp3wjfOMdup0n6M2HiMZttyFruVbHpLEN3wpPGLt3X-Gq8enWlK6pmZhM0C2ztbEHDI-y9S_lxWlpUoSkzXUrYrgFdMnqyrI4swfpFLGJAmlC2kWwY6fuX49VuVDs2lPOgPhb61k-69GDub84AAoXTGPL-AMjiHPrGlfgNDkW5Onky12IcC0zLf93zFenM14Dl8CtFXcJqx1SWMO6y28nx-sHJJJNbhUMkZ0zbKZaWrXYW4XWXkkRedQdc3D"
                 alt="Google" class="w-5 h-5 grayscale group-hover:grayscale-0 transition-all"/>
            <span class="text-theatreGray text-sm group-hover:text-theatreBeige transition-colors">
              Continuar con Google
            </span>
          </button>
        </div>

        <div class="mt-6 text-center">
          <p class="text-theatreGray text-sm">
            ¿Aún no tienes cuenta?
            <a href="#/register" class="text-theatreGold font-bold hover:underline ml-1">Únete ahora</a>
          </p>
        </div>
      </section>
    </main>
  `;
}
