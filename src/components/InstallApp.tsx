import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const screenshots = [
  { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400', label: 'Explore Premium Salons' },
  { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400', label: 'Choose Your Services' },
  { url: 'https://images.unsplash.com/photo-1595475243692-3929201f9720?auto=format&fit=crop&q=80&w=400', label: 'Select Preferred Time' },
  { url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=400', label: 'Fast & Secure Checkout' },
];

interface InstallAppProps {
  onClose?: () => void;
  onInstall?: () => void;
}

export const InstallApp: React.FC<InstallAppProps> = ({ onClose, onInstall }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showStatus, setShowStatus] = useState(true);
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(() => {
    return localStorage.getItem('nexora_pwa_dismissed') === 'true';
  });

  const handleToggleDontShow = () => {
    const newValue = !dontShowAgain;
    setDontShowAgain(newValue);
    if (newValue) {
      localStorage.setItem('nexora_pwa_dismissed', 'true');
    } else {
      localStorage.removeItem('nexora_pwa_dismissed');
    }
  };

  const prevScreenshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoPlaying(false);
    setActiveScreenshot(prev => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const nextScreenshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoPlaying(false);
    setActiveScreenshot(prev => (prev + 1) % screenshots.length);
  };

  useEffect(() => {
    if (!isSuccess || !onClose) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, onClose]);

  useEffect(() => {
    if (isInstalling || isSuccess || !isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveScreenshot(prev => (prev + 1) % screenshots.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isInstalling, isSuccess, isAutoPlaying]);

  const handleInstallClick = async () => {
    setIsInstalling(true);
    setInstallProgress(10);
    
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

    // Progress simulation
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 150);
    
    if (onInstall) {
      await onInstall();
    }
    
    setTimeout(() => {
      clearInterval(interval);
      setInstallProgress(100);
      setTimeout(() => {
        setIsInstalling(false);
        setIsSuccess(true);
      }, 500);
    }, 2000);
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: "spring",
        damping: 15,
        stiffness: 200,
        duration: 0.5
      }}
      className="bg-[var(--color-surface-container-lowest)] rounded-[28px] overflow-hidden border border-[var(--color-outline-subtle)] shadow-2xl flex flex-col max-w-sm w-full relative"
    >
      {/* Top Indicators Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none flex items-center justify-between px-4">
        {/* Persistent Offline Mode Indicator */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[var(--color-on-surface)] text-white py-2 px-4 flex items-center justify-center gap-2 overflow-hidden rounded-b-xl pointer-events-auto shadow-md"
            >
              <span className="material-symbols-outlined text-[16px] text-[var(--color-primary-pink)]">wifi_off</span>
              <span className="text-[10px] font-bold tracking-tight uppercase">Offline Active</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* App Installed Status Indicator */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-50 text-green-600 py-1.5 px-3 flex items-center gap-1.5 rounded-full border border-green-200 mt-2 pointer-events-auto shadow-sm"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[10px] font-bold">check</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Installed</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center w-full"
            >
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg mb-6 text-white relative"
              >
                {/* Pulse ripple effect */}
                <motion.div
                  animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 bg-green-500 rounded-full"
                />
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="material-symbols-outlined text-[44px] z-10"
                >
                  check
                </motion.span>
              </motion.div>
              
              <h3 className="text-[20px] font-extrabold text-[var(--color-on-surface)] mb-2 font-headline">Ready to Go!</h3>
              <p className="text-[13px] text-[var(--color-on-surface-variant)] leading-relaxed mb-8 px-2">
                Nexora Beauty has been added. You can now access it directly from your home screen.
              </p>

              <button
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-[var(--color-primary-pink)] text-white font-bold text-xs shadow-md hover:bg-[var(--color-primary)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Done
                <span className="opacity-60 text-[10px] font-normal bg-white/20 px-1.5 py-0.5 rounded-md">
                  {countdown}s
                </span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full"
            >
              {/* App Icon Visual */}
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary-pink)] to-[var(--color-primary)] rounded-[22px] flex items-center justify-center shadow-lg mb-6 relative group overflow-hidden">
                <span className="material-symbols-outlined text-white text-[44px]">content_cut</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <h3 className="text-[20px] font-extrabold text-[var(--color-on-surface)] mb-2 font-headline">Install Nexora Beauty</h3>
              <p className="text-[13px] text-[var(--color-on-surface-variant)] leading-relaxed mb-6 px-2">
                Add Nexora to your home screen for a faster, seamless booking experience.
              </p>

              {/* Screenshot Carousel */}
              <div className="w-full mb-6 flex flex-col gap-2.5">
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] shadow-inner group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeScreenshot}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <img 
                        src={screenshots[activeScreenshot].url} 
                        alt={screenshots[activeScreenshot].label}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
                        <span className="text-white text-[12px] font-bold text-left drop-shadow-md">
                          {screenshots[activeScreenshot].label}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Manual Navigation Arrows */}
                  <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                    <button 
                      onClick={prevScreenshot}
                      className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 transition-colors pointer-events-auto active:scale-90"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <button 
                      onClick={nextScreenshot}
                      className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 transition-colors pointer-events-auto active:scale-90"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                  </div>
                </div>
                {/* Carousel Indicators */}
                <div className="flex justify-center gap-1.5">
                  {screenshots.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeScreenshot ? 'w-5 bg-[var(--color-primary-pink)]' : 'w-1.5 bg-[var(--color-outline-variant)]'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Offline Value Proposition Card */}
              <div className="w-full bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)] mb-6 flex items-start gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[var(--color-primary-pink)] flex-shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">cloud_off</span>
                </div>
                <div>
                  <h4 className="text-[12px] font-extrabold text-[var(--color-on-surface)] uppercase tracking-wider mb-0.5">Stay Prepared</h4>
                  <p className="text-[11px] text-[var(--color-on-surface-variant)] leading-tight">
                    You can still view your <strong>existing salon schedule</strong> and appointment details even without an active internet connection.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={onClose}
                  className="h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-subtle)] text-[var(--color-on-surface-variant)] font-bold text-xs hover:bg-[var(--color-surface-container)] transition-colors cursor-pointer"
                >
                  Not Now
                </button>
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="h-12 rounded-xl bg-[var(--color-primary-pink)] text-white font-bold text-xs shadow-md hover:bg-[var(--color-primary)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isInstalling ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  )}
                  {isInstalling ? 'Installing...' : 'Install Now'}
                </button>
              </div>

              {/* Don't show again toggle */}
              {!isInstalling && (
                <button 
                  onClick={handleToggleDontShow}
                  className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[var(--color-surface-container)] transition-colors cursor-pointer group"
                >
                  <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${dontShowAgain ? 'bg-[var(--color-primary-pink)] border-[var(--color-primary-pink)]' : 'border-[var(--color-outline)] group-hover:border-[var(--color-primary-pink)]'}`}>
                    {dontShowAgain && <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>}
                  </div>
                  <span className="text-[11px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Don't show again</span>
                </button>
              )}

              {/* Progress Bar */}
              <AnimatePresence>
                {isInstalling && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full mt-4 overflow-hidden"
                  >
                    <div className="w-full h-1.5 bg-[var(--color-surface-container-high)] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[var(--color-primary-pink)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${installProgress}%` }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                      />
                    </div>
                    <p className="text-[9px] text-[var(--color-on-surface-variant)] mt-1.5 font-bold uppercase tracking-widest">
                      Preparing Application... {installProgress}%
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative background element */}
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[var(--color-surface-container-high)]/20 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
};
