"use client";

import { useEffect } from "react";

// Removes legacy service workers and their caches to avoid stale assets in browsers like Edge
export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const removeServiceWorkers = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if (typeof caches !== "undefined") {
          const cacheKeys = await caches.keys();
          await Promise.all(cacheKeys.map((key) => caches.delete(key)));
        }

        console.info("Service workers and caches cleared to prevent stale assets.");

        // In development, force a one-time hard reload after cleanup so the browser
        // boots from fresh runtime assets and stops using stale chunk references.
        const reloadFlag = "skilldash_dev_cache_reset_done";
        if (!sessionStorage.getItem(reloadFlag)) {
          sessionStorage.setItem(reloadFlag, "1");
          window.location.reload();
        }
      } catch (error) {
        console.error("Service worker cleanup failed", error);
      }
    };

    removeServiceWorkers();
  }, []);

  return null;
}
