import { registerSW } from 'virtual:pwa-register'

// Guarded service-worker auto-update.
//
// vite-plugin-pwa's default `autoUpdate` registration calls window.location.reload()
// the instant a new deployment's worker activates. That gives returning visitors
// the new bundle on their FIRST visit — but it fires unconditionally, so it would
// reload the page out from under a customer who is halfway through typing their
// checkout details.
//
// We register the worker ourselves and supply our own `onNeedReload` so we keep
// the first-visit freshness, but hold the reload while the checkout page is
// mounted and perform it only once the customer leaves. The cart is persisted in
// localStorage and survives a reload; the only state a reload would destroy is the
// un-submitted checkout form, which is exactly what we protect.

let checkoutActive = false
let updatePending = false

/**
 * Checkout calls this on mount (true) and unmount (false). If a new deployment
 * arrived while the customer was on the checkout page, the deferred reload runs
 * as soon as they leave it.
 */
export function setCheckoutActive(active: boolean): void {
  checkoutActive = active
  if (!active && updatePending) {
    updatePending = false
    window.location.reload()
  }
}

/** Register the service worker with the guarded auto-update behaviour. */
export function registerServiceWorker(): void {
  registerSW({
    immediate: true,
    onNeedReload() {
      // A newer deployment has taken control. Refresh now so this visit gets the
      // new bundle — unless the customer is mid-checkout, in which case defer.
      if (checkoutActive) {
        updatePending = true
        return
      }
      window.location.reload()
    },
  })
}
