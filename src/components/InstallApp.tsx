import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstallAppProps {
  onClose?: () => void;
  onInstall?: () => void;
}

export const InstallApp: React.FC<InstallAppProps> = ({ onClose, onInstall }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(true);

  const handleInstallClick = () => {
    // Tracking event for conversion funnel analysis
    try {
      const trackingData = JSON.parse(localStorage.getItem('nexora_install_attempts') || '[]');
      trackingData.push({
        timestamp: new Date().toISOString(),
        method: 'direct_pwa_link',
        status: 'initiated',
        isOnline: navigator.onLine
      });
      // Limit to last 20 events to save space
      localStorage.setItem('nexora_install_attempts', JSON.stringify(trackingData.slice(-20)));
    } catch (e) {
      console.warn('Failed to log install tracking', e);
    }
    
    if (onInstall) onInstall();
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="bg-white rounded-[28px] overflow-hidden border border-[#e8e8e8] shadow-2xl flex flex-col max-w-sm w-full relative">
      {/* Persistent Offline Mode Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#26181c] text-white py-2 px-4 flex items-center justify-center gap-2 overflow-hidden"
          >
            <span className="material-symbols-outlined text-[16px] text-[#e6007e]">wifi_off</span>
            <span className="text-[11px] font-bold tracking-tight uppercase">Offline Mode Active</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 flex flex-col items-center text-center">
        {/* App Icon Visual */}
        <div className="w-20 h-20 bg-gradient-to-br from-[#e6007e] to-[#b90064] rounded-[22px] flex items-center justify-center shadow-lg mb-6 relative group overflow-hidden">
          <span className="material-symbols-outlined text-white text-[44px]">content_cut</span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <h3 className="text-[20px] font-extrabold text-[#26181c] mb-2 font-headline">Install Nexora Beauty</h3>
        <p className="text-[13px] text-[#5a3f47] leading-relaxed mb-6 px-2">
          Add Nexora to your home screen for a faster, seamless booking experience.
        </p>

        {/* Offline Value Proposition Card */}
        <div className="w-full bg-[#fff0f2] rounded-2xl p-4 border border-[#fcd5e8] mb-6 flex items-start gap-3 text-left">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#e6007e] flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">cloud_off</span>
          </div>
          <div>
            <h4 className="text-[12px] font-extrabold text-[#26181c] uppercase tracking-wider mb-0.5">Stay Prepared</h4>
            <p className="text-[11px] text-[#5a3f47] leading-tight">
              You can still view your <strong>existing salon schedule</strong> and appointment details even without an active internet connection.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={onClose}
            className="h-12 rounded-xl bg-[#fff8f8] border border-[#e8e8e8] text-[#5a3f47] font-bold text-xs hover:bg-[#ffe8ed] transition-colors cursor-pointer"
          >
            Not Now
          </button>
          <button
            onClick={handleInstallClick}
            className="h-12 rounded-xl bg-[#e6007e] text-white font-bold text-xs shadow-md hover:bg-[#b90064] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Install Now
          </button>
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#ffd9e2]/20 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
