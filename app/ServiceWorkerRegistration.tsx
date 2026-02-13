"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js")
        .then(reg => console.log("Service Worker Registered", reg))
        .catch(err => console.log("Service Worker registration failed:", err));
    }
  }, []);
  return null;
}
