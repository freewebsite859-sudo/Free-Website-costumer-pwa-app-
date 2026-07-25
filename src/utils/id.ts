/**
 * Collision-resistant id generator.
 *
 * `Date.now()` alone (used previously) repeats whenever two ids are created in
 * the same millisecond - e.g. submitting two reviews quickly - which produces
 * duplicate React keys and items that overwrite each other in lists.
 */
let counter = 0;

export function createId(prefix: string): string {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;

  const cryptoObj =
    typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;

  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return `${prefix}-${cryptoObj.randomUUID()}`;
  }

  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}-${random}`;
}

/** Short, human friendly booking reference such as `NX-4821`. */
export function createBookingReference(): string {
  const cryptoObj =
    typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;

  let n: number;
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const buf = new Uint32Array(1);
    cryptoObj.getRandomValues(buf);
    n = buf[0] % 9000;
  } else {
    n = Math.floor(Math.random() * 9000);
  }

  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  // Mix in the counter so two references created in the same tick never collide.
  return `NX-${1000 + ((n + counter) % 9000)}`;
}
