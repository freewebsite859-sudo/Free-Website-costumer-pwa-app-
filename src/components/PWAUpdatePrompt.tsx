import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Service-worker lifecycle UI:
 *  - "offline ready" confirmation the first time the app is cached
 *  - an update prompt when a new build is waiting
 *
 * `registerType: 'prompt'` is used (rather than autoUpdate) so the app never
 * reloads underneath a user who is mid-booking.
 */
export const PWAUpdatePrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Poll hourly so long-lived installs still pick up new versions.
      if (!registration) return;
      setInterval(() => void registration.update(), 60 * 60 * 1000);
      console.info('[pwa] service worker registered:', swUrl);
    },
    onRegisterError(error) {
      console.error('[pwa] service worker registration failed', error);
    },
  });

  const [isReloading, setIsReloading] = useState(false);

  // Auto-hide the "ready to work offline" toast; the update prompt stays until acted on.
  useEffect(() => {
    if (!offlineReady) return;
    const timer = window.setTimeout(() => setOfflineReady(false), 5000);
    return () => window.clearTimeout(timer);
  }, [offlineReady, setOfflineReady]);

  if (!offlineReady && !needRefresh) return null;

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md bg-white rounded-2xl px-4 py-3 shadow-2xl border border-[#f0d8e2] flex items-start gap-3 animate-in slide-in-from-bottom-4"
    >
      <div className="w-9 h-9 rounded-xl bg-[#fde7f3] text-[#e6007e] flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[20px]">
          {needRefresh ? 'system_update' : 'cloud_done'}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[#26181c]">
          {needRefresh ? 'A new version is available' : 'Ready to work offline'}
        </p>
        <p className="text-[11px] text-[#5a3f47] leading-relaxed mt-0.5">
          {needRefresh
            ? 'Reload to get the latest improvements and fixes.'
            : 'Nexora is installed and will keep working without a connection.'}
        </p>

        {needRefresh && (
          <div className="flex gap-2 mt-2.5">
            <button
              onClick={() => {
                setIsReloading(true);
                void updateServiceWorker(true);
              }}
              disabled={isReloading}
              className="px-3.5 py-1.5 bg-[#e6007e] hover:bg-[#c9006e] disabled:opacity-70 text-white text-[11px] font-bold rounded-xl transition-colors cursor-pointer"
            >
              {isReloading ? 'Updating...' : 'Reload'}
            </button>
            <button
              onClick={close}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        )}
      </div>

      {!needRefresh && (
        <button
          onClick={close}
          className="text-[#8c7077] hover:text-[#26181c] p-1 cursor-pointer shrink-0"
          aria-label="Dismiss"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
    </div>
  );
};
