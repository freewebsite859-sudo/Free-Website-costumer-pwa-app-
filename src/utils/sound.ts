// Web Audio API chime sound utility for push notifications.
//
// Previously this constructed a brand new AudioContext on every call. Browsers
// cap the number of concurrent AudioContexts (~6 in Chrome), so after a handful
// of notifications the sound silently stopped working and the contexts leaked.
// We now lazily create a single shared context and reuse it.

type WebkitWindow = typeof window & { webkitAudioContext?: typeof AudioContext };

let sharedCtx: AudioContext | null = null;
let unsupported = false;

function getContext(): AudioContext | null {
  if (unsupported) return null;
  if (sharedCtx && sharedCtx.state !== 'closed') return sharedCtx;

  const AudioCtx =
    typeof window !== 'undefined'
      ? window.AudioContext || (window as WebkitWindow).webkitAudioContext
      : undefined;

  if (!AudioCtx) {
    unsupported = true;
    return null;
  }

  try {
    sharedCtx = new AudioCtx();
    return sharedCtx;
  } catch (error) {
    unsupported = true;
    console.warn('AudioContext could not be created', error);
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startOffset: number,
  duration: number,
  peakGain: number,
) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, now + startOffset);

  // exponentialRampToValueAtTime() throws / does nothing when ramping from 0,
  // so we start from a tiny non-zero value.
  gain.gain.setValueAtTime(0.0001, now + startOffset);
  gain.gain.linearRampToValueAtTime(peakGain, now + startOffset + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now + startOffset);
  osc.stop(now + startOffset + duration);

  // Release the nodes once the tone finishes instead of leaving them attached.
  osc.onended = () => {
    try {
      osc.disconnect();
      gain.disconnect();
    } catch {
      /* already disconnected */
    }
  };
}

export function playNotificationSound() {
  const ctx = getContext();
  if (!ctx) return;

  try {
    // Autoplay policy: the context starts suspended until a user gesture.
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => undefined);
    }

    playTone(ctx, 587.33, 0, 0.4, 0.12); // D5
    playTone(ctx, 880, 0.12, 0.58, 0.18); // A5
  } catch (e) {
    console.warn('AudioContext not allowed or supported', e);
  }
}
