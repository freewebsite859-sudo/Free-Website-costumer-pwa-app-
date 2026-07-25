// Web Audio API Soundscape Synthesizer for Salon Ambiance Simulation

export type AmbiancePresetId = 'zen_spa' | 'luxury_lounge' | 'botanical_flow' | 'calm_steam';

export interface AmbiancePreset {
  id: AmbiancePresetId;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const AMBIANCE_PRESETS: AmbiancePreset[] = [
  {
    id: 'zen_spa',
    name: 'Zen Spa Rain & Chimes',
    icon: 'spa',
    description: 'Tranquil water droplets, warm binaural pad & periodic singing bowl chimes',
    color: '#e6007e',
  },
  {
    id: 'luxury_lounge',
    name: 'Luxury Lounge Chords',
    icon: 'queue_music',
    description: 'Warm ambient rhodes chords & soothing soft vinyl warm noise',
    color: '#8e004b',
  },
  {
    id: 'botanical_flow',
    name: 'Botanical Waterfall',
    icon: 'water_drop',
    description: 'Gentle stream trickle with organic breeze sweeps & acoustic bell tones',
    color: '#0353db',
  },
  {
    id: 'calm_steam',
    name: 'Aromatherapy Steam',
    icon: 'air',
    description: 'Warm white noise steam acoustic texture with deep harmonic drone',
    color: '#059669',
  },
];

class AmbianceSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentPreset: AmbiancePresetId = 'zen_spa';
  private masterGain: GainNode | null = null;
  private activeNodes: (OscillatorNode | AudioBufferSourceNode | BiquadFilterNode | GainNode)[] = [];
  private chimeTimer: number | null = null;
  private volume: number = 0.6;
  private listeners: Set<(isPlaying: boolean, preset: AmbiancePresetId, volume: number) => void> = new Set();

  public subscribe(listener: (isPlaying: boolean, preset: AmbiancePresetId, volume: number) => void) {
    this.listeners.add(listener);
    // Notify immediately with current state
    listener(this.isPlaying, this.currentPreset, this.volume);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isPlaying, this.currentPreset, this.volume));
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentPreset(): AmbiancePresetId {
    return this.currentPreset;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  public start(presetId: AmbiancePresetId = 'zen_spa', volume: number = 0.6) {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    this.currentPreset = presetId;
    this.volume = volume;
    this.isPlaying = true;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 1.2);
    this.masterGain.connect(this.ctx.destination);

    if (presetId === 'zen_spa') {
      this.buildZenSpa();
    } else if (presetId === 'luxury_lounge') {
      this.buildLuxuryLounge();
    } else if (presetId === 'botanical_flow') {
      this.buildBotanicalFlow();
    } else {
      this.buildCalmSteam();
    }

    this.notify();
  }

  public stop() {
    if (this.chimeTimer !== null) {
      window.clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }

    if (this.masterGain && this.ctx && this.isPlaying) {
      try {
        this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.3);
      } catch (e) {
        console.warn('Gains sweep error', e);
      }
    }

    setTimeout(() => {
      this.activeNodes.forEach((node) => {
        try {
          if ('stop' in node && typeof node.stop === 'function') {
            (node as OscillatorNode).stop();
          }
          node.disconnect();
        } catch (e) {
          // ignore already stopped
        }
      });
      this.activeNodes = [];
      this.isPlaying = false;
      this.notify();
    }, 350);
  }

  // Preset 1: Zen Spa Rain & Singing Bowl Chimes
  private buildZenSpa() {
    if (!this.ctx || !this.masterGain) return;

    // 1. Soothing Rain Pink Noise
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);
    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, rainGain);

    // 2. Warm Sine Drone Pad (432Hz Healing Frequency Base)
    const droneOsc = this.ctx.createOscillator();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(108, this.ctx.currentTime); // A2 tuning

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    droneOsc.connect(droneGain);
    droneGain.connect(this.masterGain);
    droneOsc.start();
    this.activeNodes.push(droneOsc, droneGain);

    // 3. Periodic Singing Bowl Chimes
    const playBowl = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const frequencies = [528, 639, 741, 852, 432];
      const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      chimeGain.gain.setValueAtTime(0, this.ctx.currentTime);
      chimeGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.1);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.5);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.masterGain);

      chimeOsc.start();
      chimeOsc.stop(this.ctx.currentTime + 3.6);
    };

    playBowl();
    this.chimeTimer = window.setInterval(playBowl, 4200);
  }

  // Preset 2: Luxury Lounge Ambient Chords
  private buildLuxuryLounge() {
    if (!this.ctx || !this.masterGain) return;

    // Soft Rhodes Warm Triad (Fmaj7 / Cmaj7)
    const frequencies = [261.63, 329.63, 392.00, 523.25]; // C E G C
    frequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Tremolo LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(2.5 + idx * 0.3, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      lfo.connect(lfoGain.gain);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      lfo.start();
      osc.start();
      this.activeNodes.push(osc, gain, filter, lfo, lfoGain);
    });
  }

  // Preset 3: Botanical Waterfall Flow
  private buildBotanicalFlow() {
    if (!this.ctx || !this.masterGain) return;

    // Gentle Water Filtered Stream
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const biquad = this.ctx.createBiquadFilter();
    biquad.type = 'bandpass';
    biquad.frequency.setValueAtTime(1200, this.ctx.currentTime);
    biquad.Q.setValueAtTime(3, this.ctx.currentTime);

    // Filter Sweep LFO
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(400, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(biquad.frequency);

    const streamGain = this.ctx.createGain();
    streamGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    whiteNoise.connect(biquad);
    biquad.connect(streamGain);
    streamGain.connect(this.masterGain);

    lfo.start();
    whiteNoise.start();
    this.activeNodes.push(whiteNoise, biquad, lfo, lfoGain, streamGain);

    // Random Bell Tones
    const playBell = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const notes = [659.25, 783.99, 880.0, 1046.5];
      const note = notes[Math.floor(Math.random() * notes.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.6);
    };

    playBell();
    this.chimeTimer = window.setInterval(playBell, 3800);
  }

  // Preset 4: Aromatherapy Steam
  private buildCalmSteam() {
    if (!this.ctx || !this.masterGain) return;

    // Steam Texture
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, gain);
  }
}

export const ambianceSynthesizer = new AmbianceSynthesizer();
