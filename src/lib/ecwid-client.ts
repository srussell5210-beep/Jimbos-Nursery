'use client';

// Client-side helper for the Ecwid Storefront JS API — loading the script
// once (shared across any number of mounted checkout buttons on a page) and
// wrapping its callback-based Cart methods in promises. Mirrors the script
// tag logic in src/components/EcwidStore.tsx, but that component embeds the
// product browser widget; this one only needs Cart.addProduct/gotoCheckout,
// which work anywhere on the page once the script is loaded.

const ECWID_STORE_ID = '9145043';
const SCRIPT_ID = 'ecwid-storefront-script';

type EcwidCartCallback = (success: boolean, product: unknown, cart: unknown, error?: string) => void;

export interface EcwidApi {
  OnAPILoaded: { add: (cb: () => void) => void };
  Cart: {
    addProduct: (
      product: { id: number; quantity: number; options?: Record<string, string> },
      callback?: EcwidCartCallback,
    ) => void;
    gotoCheckout: (callback?: () => void) => void;
  };
}

declare global {
  interface Window {
    Ecwid?: EcwidApi;
  }
}

let apiPromise: Promise<EcwidApi> | null = null;

export function loadEcwidApi(): Promise<EcwidApi> {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    const onScriptReady = () => {
      if (!window.Ecwid) {
        reject(new Error('Ecwid failed to load.'));
        return;
      }
      window.Ecwid.OnAPILoaded.add(() => resolve(window.Ecwid as EcwidApi));
    };

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.Ecwid) onScriptReady();
      else existingScript.addEventListener('load', onScriptReady, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.charset = 'utf-8';
    script.src = `https://app.ecwid.com/script.js?${ECWID_STORE_ID}&data_platform=code&lang=en`;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.addEventListener('load', onScriptReady, { once: true });
    script.addEventListener('error', () => reject(new Error('Could not load the checkout script.')), { once: true });
    document.body.appendChild(script);
  });

  return apiPromise;
}

export async function addProductToCart(id: number, quantity: number, options?: Record<string, string>): Promise<void> {
  const Ecwid = await loadEcwidApi();
  return new Promise<void>((resolve, reject) => {
    let settled = false;
    // Ecwid's addProduct callback is unreliable on pages without an embedded
    // storefront container (e.g. /events, which only uses the Cart/Checkout
    // API, not xProductBrowser) — the product still gets added to the cart,
    // but the callback can simply never fire. Don't hang forever waiting on
    // it: fall back to assuming success after a short wait.
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve();
    }, 2500);
    Ecwid.Cart.addProduct({ id, quantity, ...(options ? { options } : {}) }, (success, _product, _cart, error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (success) resolve();
      else reject(new Error(error || 'Could not add this item to your cart.'));
    });
  });
}

export async function goToEcwidCheckout(): Promise<void> {
  const Ecwid = await loadEcwidApi();
  return new Promise<void>((resolve) => {
    Ecwid.Cart.gotoCheckout(() => resolve());
  });
}
