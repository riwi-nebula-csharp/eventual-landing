import { initAuth }   from './auth.js';
import { initRouter } from './router.js';

// Inicializar sesión
try {
  await initAuth();
} catch (e) {
  console.warn('[App] initAuth falló, arrancando sin sesión:', e);
}

initRouter();

/*// Registrar Service Worker solo en producción (en local interfiere con los cambios en vivo)
const IS_LOCAL = ['localhost', '127.0.0.1'].includes(window.location.hostname);

if ('serviceWorker' in navigator && !IS_LOCAL) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('[SW] Registrado:', reg.scope))
      .catch(err => console.warn('[SW] Error al registrar:', err));
  });
}*/