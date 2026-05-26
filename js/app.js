import { initAuth }   from './auth.js';
import { initRouter } from './router.js';
 
// Tema guardado por el usuario
const tema = localStorage.getItem('tema') ?? 'dark';
document.documentElement.setAttribute('data-theme', tema);
 
// Inicializar sesión — si falla la API, el router igual arranca
try {
  await initAuth();
} catch (e) {
  console.warn('[App] initAuth falló, arrancando sin sesión:', e);
}
 
initRouter();