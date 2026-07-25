import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ambianceSynthesizer,
  AMBIANCE_PRESETS,
  AmbiancePresetId,
} from '../utils/ambianceSynthesizer';
import { Salon } from '../types';
import { readString, writeString } from '../utils/storage';

const AUTOPLAY_KEY = 'autoplay_ambiance';

interface AmbianceWidgetProps {
  salon: Salon;
}

export const AmbianceWidget: React.FC<AmbianceWidgetProps> = ({ salon }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => ambianceSynthesizer.getIsPlaying());
  const [selectedPreset, setSelectedPreset] = useState<AmbiancePresetId>(() =>
    ambianceSynthesizer.getCurrentPreset(),
  );
  const [volume, setVolume] = useState<number>(() => ambianceSynthesizer.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(
    () => readString(AUTOPLAY_KEY) === 'true',
  );

  // Remember the last non-zero level so unmuting restores it.
  const lastVolumeRef = useRef<number>(volume > 0 ? volume : 0.6);

  useEffect(() => {
    // Keep the widget in sync with the shared synthesizer (the header
    // SoundControlButton drives the same singleton).
    const unsubscribe = ambianceSynthesizer.subscribe((playing, preset, vol) => {
      setIsPlaying(playing);
      if (preset) setSelectedPreset(preset);
      setVolume(vol);
      setIsMuted(vol === 0);
      if (vol > 0) lastVolumeRef.current = vol;
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Autoplay is a preference, so re-evaluate it whenever the salon changes.
    if (readString(AUTOPLAY_KEY) !== 'true') return;
    if (ambianceSynthesizer.getIsPlaying()) return;
    ambianceSynthesizer.start(
      ambianceSynthesizer.getCurrentPreset(),
      lastVolumeRef.current,
    );
  }, [salon.id]);

  useEffect(() => {
    // Stop the soundscape when leaving the salon page.
    return () => {
      if (ambianceSynthesizer.getIsPlaying()) {
        ambianceSynthesizer.stop();
      }
    };
  }, []);

  const handleToggleAutoPlay = () => {
    const nextVal = !autoPlay;
    setAutoPlay(nextVal);
    writeString(AUTOPLAY_KEY, String(nextVal));
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      ambianceSynthesizer.stop();
    } else {
      ambianceSynthesizer.start(selectedPreset, isMuted ? 0 : volume);
    }
  };

  const handleSelectPreset = (presetId: AmbiancePresetId) => {
    setSelectedPreset(presetId);
    if (isPlaying) {
      ambianceSynthesizer.start(presetId, isMuted ? 0 : volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    // Previously this read the stale `isMuted` value and pushed 0 to the
    // synthesizer even though the slider had just been dragged above zero.
    const nextMuted = newVol === 0;
    setVolume(newVol);
    setIsMuted(nextMuted);
    if (newVol > 0) lastVolumeRef.current = newVol;
    ambianceSynthesizer.setVolume(newVol);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    const nextVolume = nextMute ? 0 : lastVolumeRef.current || 0.6;
    if (!nextMute) setVolume(nextVolume);
    ambianceSynthesizer.setVolume(nextVolume);
  };

  const currentPresetObj = AMBIANCE_PRESETS.find((p) => p.id === selectedPreset) || AMBIANCE_PRESETS[0];

  return (
    <div className="w-full bg-gradient-to-br from-[#fff0f5] via-[#fff8f8] to-[#fde7f3] rounded-3xl p-4 sm:p-5 border border-[#f5d0e0] shadow-sm relative overflow-hidden my-3">
      {/* Decorative Glow Background */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#e6007e]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[#0353db]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#e6007e] text-white flex items-center justify-center shadow-md shrink-0">
            <span className="material-symbols-outlined text-[20px] animate-pulse">graphic_eq</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-[#26181c]">Salon Ambiance Soundscape</h3>
              <button
                onClick={handleToggleAutoPlay}
                title="Toggle Auto-play Ambiance on page view"
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all cursor-pointer border ${
                  autoPlay
                    ? 'bg-[#e6007e] text-white border-[#e6007e]'
                    : 'bg-[#fde7f3] text-[#5a3f47] border-[#fcd5e8] hover:bg-[#fbd3e8]'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {autoPlay ? 'autoplay' : 'motion_photos_paused'}
                </span>
                <span>Auto-play: {autoPlay ? 'ON' : 'OFF'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#5a3f47]">
              Simulates {salon.name}'s tranquil acoustic atmosphere
            </p>
          </div>
        </div>

        {/* Master Play Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTogglePlay}
          className={`h-10 px-4 rounded-full font-bold text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer select-none shrink-0 ${
            isPlaying
              ? 'bg-[#26181c] text-white ring-2 ring-[#e6007e]/40'
              : 'bg-[#e6007e] text-white hover:bg-[#c9006e]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isPlaying ? 'pause_circle' : 'play_circle'}
          </span>
          <span>{isPlaying ? 'Pause Loop' : 'Play Ambiance'}</span>
        </motion.button>
      </div>

      {/* Animated Equalizer Visualizer Bar when Playing */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 px-3 py-2 bg-white/80 backdrop-blur-md rounded-2xl border border-[#f0d8e2] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#e6007e]">volume_up</span>
              <span className="text-[11px] font-bold text-[#26181c]">
                Now Playing: {currentPresetObj.name}
              </span>
            </div>

            {/* Framer Motion Equalizer Waveform Bars */}
            <div className="flex items-end gap-1 h-4">
              {[0.4, 0.9, 0.6, 1, 0.5, 0.8, 0.3].map((heightScale, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: ['20%', `${heightScale * 100}%`, '20%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6 + (i % 3) * 0.2,
                    ease: 'easeInOut',
                  }}
                  className="w-1 bg-[#e6007e] rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset Selector Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {AMBIANCE_PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset.id;
          return (
            <motion.button
              key={preset.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelectPreset(preset.id)}
              className={`p-2.5 rounded-2xl text-left border flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#e6007e] shadow-sm ring-1 ring-[#e6007e]/30'
                  : 'bg-white/60 border-[#f0d8e2] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ color: preset.color }}
                >
                  {preset.icon}
                </span>
                {isSelected && isPlaying && (
                  <span className="w-2 h-2 rounded-full bg-[#e6007e] animate-ping" />
                )}
              </div>
              <span className="text-[12px] font-bold text-[#26181c] leading-snug line-clamp-1">
                {preset.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Volume Controls Bar */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#fce2e7]">
        <span className="text-[11px] text-[#5a3f47] font-medium hidden sm:inline">
          {currentPresetObj.description}
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleToggleMute}
            className="text-[#5a3f47] hover:text-[#e6007e] transition-colors p-1"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isMuted || volume === 0 ? 'volume_off' : 'volume_down'}
            </span>
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-24 sm:w-28 h-1.5 bg-[#fce2e7] rounded-lg appearance-none cursor-pointer accent-[#e6007e]"
          />

          <span className="text-[10px] font-bold text-[#8c7077] w-7 text-right">
            {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
