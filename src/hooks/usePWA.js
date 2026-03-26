import { useState, useEffect } from 'react';

/**
 * Custom hook that manages PWA lifecycle:
 * - Service worker update detection
 * - Install prompt capture (beforeinstallprompt)
 * - Online/offline status
 */
export function usePWA() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updateSW, setUpdateSW] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ── Online / offline tracking ──────────────────────────────────────────────
  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  // ── Install prompt capture ─────────────────────────────────────────────────
  useEffect(() => {
    // Detect if already running as installed PWA
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installed = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener('appinstalled', installed);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  // ── Service worker update detection ───────────────────────────────────────
  useEffect(() => {
    // vite-plugin-pwa exposes the virtual module; we register manually
    // so we can hook into the update lifecycle here.
    if ('serviceWorker' in navigator) {
      import('virtual:pwa-register')
        .then(({ registerSW }) => {
          const sw = registerSW({
            immediate: true,
            onNeedRefresh() {
              setNeedsUpdate(true);
              setUpdateSW(() => sw);
            },
            onOfflineReady() {
              // App is cached and ready for offline use — silently noted
            },
            onRegisteredSW(swUrl, registration) {
              // Periodically check for SW updates every hour
              if (registration) {
                setInterval(() => registration.update(), 60 * 60 * 1000);
              }
            }
          });
        })
        .catch(() => {
          // Virtual module unavailable in non-PWA builds — safe to ignore
        });
    }
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const triggerUpdate = () => {
    if (updateSW) {
      updateSW(true);
      setNeedsUpdate(false);
    }
  };

  const triggerInstall = async () => {
    if (!installPrompt) return false;
    const result = await installPrompt.prompt();
    if (result?.outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
      return true;
    }
    return false;
  };

  const dismissUpdate = () => setNeedsUpdate(false);

  return {
    needsUpdate,
    installPrompt,
    isInstalled,
    isOnline,
    triggerUpdate,
    triggerInstall,
    dismissUpdate
  };
}
