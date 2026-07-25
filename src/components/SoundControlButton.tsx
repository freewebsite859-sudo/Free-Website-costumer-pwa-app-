import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ambianceSynthesizer } from '../utils/ambianceSynthesizer';

interface SoundControlButtonProps {
  variant?: 'header' | 'overlay' | 'default';
  className?: string;
}

export const SoundControlButton: React.FC<SoundControlButtonProps> = ({
  variant = 'default',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => ambianceSynthesizer.getIsPlaying());
  const [volume, setVolume] = useState<number>(() => ambianceSynthesizer.getVolume());
  const [showSlider, setShowSlider] = useState<boolean>(false);
  const [isLongPress, setIsLongPress] = useState<boolean>(false);

  const longPressTimerRef = useRef<number | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubscribe = ambianceSynthesizer.subscribe((playing, _preset, vol) => {
      setIsPlaying(playing);
      setVolume(vol);
    });
    return () => unsubscribe();
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      ambianceSynthesizer.stop();
    } else {
      ambianceSynthesizer.start('zen_spa', volume > 0 ? volume : 0.6);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    ambianceSynthesizer.setVolume(val);
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowSlider(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setShowSlider(false);
    }, 400);
  };

  const handleTouchStart = () => {
    setIsLongPress(false);
    longPressTimerRef.current = window.setTimeout(() => {
      setIsLongPress(true);
      setShowSlider(true);
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }, 320);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = () => {
    if (!isLongPress) {
      handleTogglePlay();
    }
    setIsLongPress(false);
  };

  const getButtonStyles = () => {
    if (variant === 'header') {
      return isPlaying
        ? 'bg-[#e6007e] text-white border-[#e6007e] ring-2 ring-[#e6007e]/30'
        : 'bg-white text-[#26181c] border-[#e8e8e8] hover:border-[#e6007e]';
    }
    if (variant === 'overlay') {
      return isPlaying
        ? 'bg-[#e6007e] text-white ring-2 ring-white/50 backdrop-blur-md'
        : 'bg-white/90 text-[#26181c] hover:bg-white backdrop-blur-md';
    }
    return isPlaying
      ? 'bg-[#e6007e] text-white'
      : 'bg-white text-[#26181c] border border-[#e8e8e8]';
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        className={`px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer select-none border border-transparent ${getButtonStyles()} ${className}`}
        title={isPlaying ? 'Click to stop, hover/hold for volume' : 'Click to play salon ambiance, hover/hold for volume'}
      >
        <span className={`material-symbols-outlined text-[16px] ${isPlaying ? 'animate-pulse' : ''}`}>
          {isPlaying ? (volume === 0 ? 'volume_off' : 'volume_up') : 'volume_off'}
        </span>
        <span>{isPlaying ? `${Math.round(volume * 100)}%` : 'Ambiance'}</span>
        <span className="material-symbols-outlined text-[12px] opacity-70 ml-0.5">
          tune
        </span>
      </button>

      {/* Floating Non-Obtrusive Volume Slider Popover */}
      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 z-[100] w-52 p-3 bg-white/95 backdrop-blur-xl rounded-2xl border border-[#f5d0e0] shadow-xl text-[#26181c]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#e6007e]">
                  graphic_eq
                </span>
                <span className="text-[11px] font-bold text-[#26181c]">Ambiance Level</span>
              </div>
              <span className="text-[10px] font-bold text-[#e6007e] bg-[#fde7f3] px-1.5 py-0.5 rounded-full">
                {Math.round(volume * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newVol = volume > 0 ? 0 : 0.6;
                  setVolume(newVol);
                  ambianceSynthesizer.setVolume(newVol);
                }}
                className="text-[#5a3f47] hover:text-[#e6007e] transition-colors p-1 rounded-full hover:bg-[#fde7f3]"
                title={volume === 0 ? 'Unmute' : 'Mute'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {volume === 0 ? 'volume_off' : volume < 0.4 ? 'volume_down' : 'volume_up'}
                </span>
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-[#fce2e7] rounded-lg appearance-none cursor-pointer accent-[#e6007e]"
              />
            </div>

            {/* Quick preset buttons indicator */}
            <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-[#fce2e7]/60 text-[10px] text-[#8c7077]">
              <span>Soft</span>
              <span>Medium</span>
              <span>Loud</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
