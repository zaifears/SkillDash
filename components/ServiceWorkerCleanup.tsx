"use client";

import { useEffect } from "react";

// Removes legacy service workers and their caches to avoid stale assets in browsers like Edge
export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const removeServiceWorkers = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if (typeof caches !== "undefined") {
          const cacheKeys = await caches.keys();
          const skilldashKeys = cacheKeys.filter((key) => key.toLowerCase().includes("skilldash"));
          await Promise.all(skilldashKeys.map((key) => caches.delete(key)));
        }

        console.info("Service workers and caches cleared to prevent stale assets.");
      } catch (error) {
        console.error("Service worker cleanup failed", error);
      }
    };

    removeServiceWorkers();
  }, []);

  return null;
}
