import React from 'react';

interface SyncBannerProps {
  message: string | null;
  onDismiss: () => void;
  /** Shown persistently when the app is running without a Supabase project. */
  offline?: boolean;
}

/**
 * Non-blocking status strip for background sync problems. Previously these
 * failures were only visible in the console, so a user whose booking failed to
 * save had no idea anything went wrong.
 */
export const SyncBanner: React.FC<SyncBannerProps> = ({ message, onDismiss, offline }) => {
  if (!message && !offline) return null;

  const isError = Boolean(message);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md rounded-2xl px-4 py-3 shadow-lg border flex items-start gap-2.5 animate-in slide-in-from-bottom-4 ${
        isError
          ? 'bg-[#26181c] text-white border-rose-400/40'
          : 'bg-amber-50 text-amber-900 border-amber-300'
      }`}
    >
      <span
        className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
          isError ? 'text-rose-300' : 'text-amber-600'
        }`}
      >
        {isError ? 'cloud_off' : 'info'}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold leading-snug">
          {isError ? 'Sync problem' : 'Demo mode'}
        </p>
        <p className={`text-[11px] leading-relaxed ${isError ? 'text-white/80' : ''}`}>
          {message ??
            'Supabase is not configured, so your data stays only in this browser.'}
        </p>
      </div>

      {isError && (
        <button
          onClick={onDismiss}
          className="text-white/60 hover:text-white p-1 cursor-pointer shrink-0"
          aria-label="Dismiss message"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
    </div>
  );
};
