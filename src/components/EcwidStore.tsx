'use client';

import { useEffect, useState } from 'react';

const STORE_ID = '9145043';
const STORE_CONTAINER_ID = `my-store-${STORE_ID}`;
const SCRIPT_ID = 'ecwid-storefront-script';

declare global {
  interface Window {
    xProductBrowser?: (...args: string[]) => void;
  }
}

export default function EcwidStore() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const initializeStore = () => {
      if (cancelled || !window.xProductBrowser) return;

      const container = document.getElementById(STORE_CONTAINER_ID);
      if (!container) return;

      container.innerHTML = '';
      window.xProductBrowser(
        'categoriesPerRow=3',
        'views=grid(20,3) list(60) table(60)',
        'categoryView=grid',
        'searchView=list',
        `id=${STORE_CONTAINER_ID}`,
      );
      setLoaded(true);
    };

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.xProductBrowser) {
        initializeStore();
      } else {
        existingScript.addEventListener('load', initializeStore, { once: true });
      }
      return () => {
        cancelled = true;
        existingScript.removeEventListener('load', initializeStore);
      };
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.charset = 'utf-8';
    script.src = `https://app.ecwid.com/script.js?${STORE_ID}&data_platform=code&lang=en`;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.addEventListener('load', initializeStore, { once: true });
    document.body.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener('load', initializeStore);
    };
  }, []);

  return (
    <div className="relative min-h-[520px]">
      {!loaded && (
        <div className="absolute inset-x-0 top-0 flex min-h-[320px] items-center justify-center rounded-lg border border-nursery-sage/20 bg-white text-sm font-semibold uppercase tracking-[0.25em] text-nursery-midnight/45">
          Loading Store
        </div>
      )}
      <div id={STORE_CONTAINER_ID} className="relative z-10 ecwid-storefront" />
    </div>
  );
}
