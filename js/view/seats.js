/**
 * ============================================================
 *  view/seats.js — Mapa de asientos + Stripe | Teatro Eventual
 * ============================================================
 */

import { navigate }                                      from '../router.js';
import { renderNavbar, attachNavbarHandlers, NAV_HEIGHT } from '../components/navbar.js';
import {
  getPerformance, getPerformanceSeats,
  getPaymentConfig, createPaymentIntent, createPurchase,
} from '../api.events.js';

const ROWS = ['A','B','C','D','E','F','G','H','I','J'];

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function formatTime(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export async function renderSeats({ id: perfId }) {
  const app = document.querySelector('#app');

  // Cargar función y mapa de asientos
  const [perfRes, seatsRes] = await Promise.all([
    getPerformance(perfId),
    getPerformanceSeats(perfId),
  ]);

  if (!perfRes.success || !seatsRes.success) {
    return `
      ${renderNavbar()}
      <main class="${NAV_HEIGHT} min-h-screen flex items-center justify-center">
        <div class="text-center text-theatreGray">
          <span class="material-symbols-outlined text-5xl mb-4 block text-theatreGold/30">error</span>
          <p>No se pudo cargar el mapa de asientos.</p>
          <button onclick="window.history.back()"
                  class="mt-4 px-6 py-2 border border-white/20 text-sm hover:bg-white/5 transition-all">
            Volver
          </button>
        </div>
      </main>`;
  }

  const perf      = perfRes.data;
  const seatMap   = seatsRes.data;
  const pricePerSeat = perf.ticketPrice;

  // Construir mapa flat: seatOrder → status
  const seatStatusMap = {};
  if (seatMap.rows) {
    seatMap.rows.forEach(row => {
      row.seats.forEach(seat => {
        seatStatusMap[seat.seatOrder] = seat.status;
      });
    });
  }

  setTimeout(async () => {
    if (!document.getElementById('btn-iniciar-pago')) return;
    attachNavbarHandlers();

      document.getElementById('btn-back')?.addEventListener('click', () => window.history.back());

      // Estado local de selección
      const selected = new Set();

      function updateSummary() {
        const count = selected.size;
        const total = count * pricePerSeat;
        const el = document.getElementById('purchase-summary');
        const btnComprar = document.getElementById('btn-iniciar-pago');
        if (el) {
          el.innerHTML = count === 0
            ? `<p class="text-theatreGray/60 text-sm text-center py-4">Selecciona al menos un asiento</p>`
            : `
              <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm">
                  <span class="text-theatreGray">Asientos</span>
                  <span class="text-theatreBeige">${[...selected].join(', ')}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-theatreGray">Cantidad</span>
                  <span class="text-theatreBeige">${count}</span>
                </div>
                <div class="border-t border-white/10 pt-2 flex justify-between">
                  <span class="text-theatreGold font-medium">Total</span>
                  <span class="text-theatreGold font-bold text-lg">${formatCurrency(total)}</span>
                </div>
              </div>`;
        }
        if (btnComprar) btnComprar.disabled = count === 0;
      }

      // Clicks en asientos
      document.querySelectorAll('.seat-btn.seat-available').forEach(btn => {
        btn.addEventListener('click', () => {
          const seatOrder = Number(btn.dataset.seatOrder);
          if (selected.has(seatOrder)) {
            selected.delete(seatOrder);
            btn.classList.remove('seat-selected');
            btn.classList.add('seat-available');
          } else {
            if (selected.size >= 10) {
              window.showToast?.('Máximo 10 asientos por compra', 'error');
              return;
            }
            selected.add(seatOrder);
            btn.classList.remove('seat-available');
            btn.classList.add('seat-selected');
          }
          updateSummary();
        });
      });

      updateSummary();

      // Iniciar pago
      document.getElementById('btn-iniciar-pago')?.addEventListener('click', async () => {
        if (selected.size === 0) return;

        const modal = document.getElementById('payment-modal');
        modal?.classList.remove('hidden');

        try {
          // Cargar Stripe
          console.log('[Pago] 1. Cargando config...');
          const configRes = await getPaymentConfig();
          console.log('[Pago] configRes:', configRes);

          if (!configRes.success) {
            window.showToast?.('Error al cargar pasarela de pago', 'error');
            modal?.classList.add('hidden');
            return;
          }

          const publishableKey =
            configRes.data?.publishableKey ||
            configRes.data?.publishable_key ||
            configRes.data?.key ||
            configRes.data?.stripeKey ||
            configRes.body?.publishableKey ||
            configRes.body?.publishable_key ||
            configRes.body?.key;

          console.log('[Pago] 2. publishableKey:', publishableKey);

          if (!publishableKey) {
            console.error('[Pago] publishableKey no encontrado en la respuesta:', configRes);
            window.showToast?.('Error al cargar pasarela de pago', 'error');
            modal?.classList.add('hidden');
            return;
          }

          // Crear PaymentIntent
          console.log('[Pago] 3. Creando PaymentIntent...');
          const intentRes = await createPaymentIntent({
            performanceId: Number(perfId),
            ticketCount: selected.size,
          });
          console.log('[Pago] intentRes:', intentRes);

          if (!intentRes.success) {
            window.showToast?.(intentRes.message || 'Error al crear el pago', 'error');
            modal?.classList.add('hidden');
            return;
          }

          const { clientSecret, paymentIntentId } = intentRes.data;

          // Cargar Stripe.js dinámicamente
          if (!window.Stripe) {
            console.log('[Pago] 4. Cargando Stripe.js...');
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://js.stripe.com/v3/';
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }

          const stripe   = window.Stripe(publishableKey);
          const elements = stripe.elements();
          const cardEl   = elements.create('card', {
            disableLink: true,
            style: {
              base: {
                color: '#F5F1E8',
                fontFamily: 'Hanken Grotesk, sans-serif',
                fontSize: '15px',
                '::placeholder': { color: 'rgba(169,169,179,0.5)' },
              },
              invalid: { color: '#ef4444' },
            },
          });

          const mountEl = document.getElementById('stripe-card-element');
          if (mountEl) cardEl.mount(mountEl);

          const total = selected.size * pricePerSeat;
          const summaryEl = document.getElementById('modal-summary');
          if (summaryEl) {
            summaryEl.innerHTML = `
              <p class="text-theatreGray text-sm">
                ${selected.size} asiento${selected.size > 1 ? 's' : ''} · Asientos: ${[...selected].join(', ')}
              </p>
              <p class="text-theatreGold font-bold text-xl mt-1">${formatCurrency(total)}</p>`;
          }

          const btnPagar = document.getElementById('btn-confirmar-pago');
          if (btnPagar) btnPagar.textContent = `Pagar ${formatCurrency(total)}`;

          document.getElementById('btn-confirmar-pago')?.addEventListener('click', async () => {
            const btn = document.getElementById('btn-confirmar-pago');
            btn.disabled = true;
            btn.innerHTML = `<span class="material-symbols-outlined animate-spin" style="font-size:18px;">progress_activity</span> Procesando...`;

            const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
              payment_method: { card: cardEl },
            });

            if (error) {
              document.getElementById('stripe-error').textContent = error.message;
              document.getElementById('stripe-error').classList.remove('hidden');
              btn.disabled = false;
              btn.textContent = `Pagar ${formatCurrency(total)}`;
              return;
            }

            if (paymentIntent.status === 'succeeded') {
              btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;">check_circle</span> ¡Pago exitoso!`;

              const purchaseRes = await createPurchase({
                performanceId:   Number(perfId),
                seatNumbers:     [...selected],
                paymentMethod:   'online',
                stripePaymentId: paymentIntent.id,
              });

              if (purchaseRes.success) {
                window.showToast?.('¡Compra completada! Tus entradas están listas.', 'success');
                setTimeout(() => navigate('mis-tickets'), 1200);
              } else {
                window.showToast?.(purchaseRes.message || 'Error al registrar la compra', 'error');
                modal?.classList.add('hidden');
              }
            }
          }, { once: true });

        } catch (err) {
          console.error('[Pago] Error inesperado:', err);
          window.showToast?.('Error inesperado al iniciar el pago', 'error');
          document.getElementById('payment-modal')?.classList.add('hidden');
        }
      });

      // Cerrar modal
      document.getElementById('btn-cerrar-modal')?.addEventListener('click', () => {
        document.getElementById('payment-modal')?.classList.add('hidden');
      });

    }, 0); // fin setTimeout — listeners montados después del render

  // Renderizar mapa
  const seatRows = ROWS.map((rowName, rowIdx) => {
    const seats = Array.from({ length: 10 }, (_, colIdx) => {
      const seatOrder  = rowIdx * 10 + colIdx + 1;
      const seatNumber = colIdx + 1;
      const status     = seatStatusMap[seatOrder] ?? 'available';
      const cls = status === 'occupied' ? 'seat-occupied' : 'seat-available';
      return `
        <button class="seat-btn ${cls}"
                data-seat-order="${seatOrder}"
                data-row="${rowName}"
                data-num="${seatNumber}"
                title="Fila ${rowName} — Asiento ${seatNumber}"
                ${status === 'occupied' ? 'disabled' : ''}>
          ${seatNumber}
        </button>`;
    });

    return `
      <div class="flex items-center gap-2 mb-2">
        <span class="text-[10px] text-theatreGold/50 w-5 text-right font-mono shrink-0">${rowName}</span>
        <div class="flex gap-1.5 flex-wrap">${seats.join('')}</div>
      </div>`;
  });

  return `
    ${renderNavbar()}

    <main class="${NAV_HEIGHT} min-h-screen">
      <div class="max-w-7xl mx-auto px-4 md:px-6 py-10">

        <!-- Volver -->
        <button id="btn-back"
                class="flex items-center gap-2 text-theatreGray hover:text-theatreGold transition-colors mb-8 text-sm">
          <span class="material-symbols-outlined" style="font-size:18px;">arrow_back</span>
          Volver a las funciones
        </button>

        <!-- Info de la función -->
        <div class="mb-10 card-border-frame bg-black/40 p-6">
          <div class="flex flex-wrap gap-6 items-center justify-between">
            <div>
              <p class="text-theatreGold text-[10px] tracking-[0.4em] uppercase mb-1">Función</p>
              <h1 class="font-serif text-2xl md:text-3xl text-theatreBeige">${perf.playName ?? 'Función'}</h1>
            </div>
            <div class="flex flex-wrap gap-6">
              <div>
                <p class="text-[9px] text-theatreGray/50 uppercase tracking-widest mb-0.5">Fecha</p>
                <p class="text-theatreBeige text-sm">${formatDate(perf.performanceDate)}</p>
              </div>
              <div>
                <p class="text-[9px] text-theatreGray/50 uppercase tracking-widest mb-0.5">Hora</p>
                <p class="text-theatreBeige text-sm">${formatTime(perf.startTime)}</p>
              </div>
              <div>
                <p class="text-[9px] text-theatreGray/50 uppercase tracking-widest mb-0.5">Precio / asiento</p>
                <p class="text-theatreGold font-bold text-sm">${formatCurrency(pricePerSeat)}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col xl:flex-row gap-8">

          <!-- MAPA DE ASIENTOS -->
          <div class="flex-1">

            <!-- Escenario -->
            <div class="mb-8">
              <div class="relative border-2 border-theatreGold/40 bg-theatreGold/5 py-4 text-center mx-4 md:mx-16">
                <div class="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-theatreGold/60 to-transparent"></div>
                <span class="text-theatreGold text-[11px] font-bold tracking-[0.5em] uppercase">Escenario</span>
                <div class="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-theatreGold/60 to-transparent"></div>
              </div>
              <div class="flex justify-center mt-2 gap-2 opacity-40">
                <div class="w-16 h-2 bg-gradient-to-t from-theatreGold/30 to-transparent"></div>
                <div class="w-24 h-2 bg-gradient-to-t from-theatreGold/50 to-transparent"></div>
                <div class="w-16 h-2 bg-gradient-to-t from-theatreGold/30 to-transparent"></div>
              </div>
            </div>

            <!-- Leyenda -->
            <div class="flex items-center gap-6 mb-6 justify-center text-[10px] text-theatreGray">
              <div class="flex items-center gap-2">
                <div class="seat-btn seat-available" style="cursor:default;width:22px;height:22px;"></div>
                <span>Disponible</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="seat-btn seat-selected" style="cursor:default;width:22px;height:22px;"></div>
                <span>Seleccionado</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="seat-btn seat-occupied" style="cursor:default;width:22px;height:22px;"></div>
                <span>Ocupado</span>
              </div>
            </div>

            <!-- Números de columna -->
            <div class="flex items-center gap-2 mb-1 pl-7">
              <div class="flex gap-1.5">
                ${Array.from({ length: 10 }, (_, i) => `
                  <span class="text-[9px] text-theatreGray/30 font-mono"
                        style="width:28px;text-align:center;">${i + 1}</span>
                `).join('')}
              </div>
            </div>

            <!-- Filas -->
            <div class="overflow-x-auto pb-2">
              ${seatRows.join('')}
            </div>

            <!-- Disponibilidad -->
            <div class="mt-6 text-center text-theatreGray text-xs">
              <span class="text-theatreGold font-medium">${seatMap.availableSeats ?? '—'}</span>
              de ${seatMap.totalSeats ?? 100} asientos disponibles
            </div>
          </div>

          <!-- RESUMEN DE COMPRA -->
          <div class="w-full xl:w-80 shrink-0">
            <div class="card-border-frame bg-black/40 p-6 sticky top-28">
              <h3 class="font-serif text-theatreGold text-lg mb-4">Resumen</h3>
              <div id="purchase-summary">
                <p class="text-theatreGray/60 text-sm text-center py-4">Selecciona al menos un asiento</p>
              </div>
              <button id="btn-iniciar-pago" disabled
                      class="w-full py-3 bg-theatreGold text-theatreDark text-[11px] font-bold
                             tracking-[0.2em] uppercase transition-all
                             disabled:opacity-40 disabled:cursor-not-allowed
                             hover:brightness-110">
                Proceder al Pago
              </button>
              <p class="text-[9px] text-theatreGray/40 text-center mt-3">
                Máximo 10 asientos por compra
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- MODAL DE PAGO -->
    <div id="payment-modal"
         class="hidden fixed inset-0 z-50 flex items-center justify-center p-4"
         style="background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);">
      <div class="card-border-frame bg-black w-full max-w-md p-8 relative">
        <!-- Cerrar -->
        <button id="btn-cerrar-modal"
                class="absolute top-4 right-4 text-theatreGray hover:text-theatreBeige transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>

        <h2 class="font-serif text-theatreGold text-2xl mb-2">Pago seguro</h2>
        <div id="modal-summary" class="mb-6 border-b border-white/10 pb-4"></div>

        <label class="block text-[10px] text-theatreGray uppercase tracking-widest mb-2">
          Datos de tarjeta
        </label>
        <div id="stripe-card-element" class="mb-2"></div>
        <p id="stripe-error" class="hidden text-red-400 text-xs mt-1 mb-3"></p>

        <p class="text-[9px] text-theatreGray/40 mb-6">
          Tarjeta de prueba: 4242 4242 4242 4242 · cualquier fecha futura · cualquier CVC
        </p>

        <button id="btn-confirmar-pago"
                class="w-full py-3 bg-theatreGold text-theatreDark text-[11px] font-bold
                       tracking-[0.2em] uppercase hover:brightness-110 transition-all
                       disabled:opacity-50 flex items-center justify-center gap-2">
          Pagar
        </button>
      </div>
    </div>

    <footer class="border-t border-white/5 py-6">
      <p class="text-center text-[9px] text-theatreGray/30 uppercase tracking-[0.4em]">
        © 2025 Teatro Eventual
      </p>
    </footer>
  `;
}