const canMatch = typeof window !== 'undefined' && typeof window.matchMedia === 'function';

export const prefersReducedMotion = () => canMatch && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = () => canMatch && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const isSmallScreen = () => canMatch && window.matchMedia('(max-width: 767px)').matches;

let webglSupport;
/** True when the browser can create a WebGL2 context (cached). */
export function supportsWebGL() {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    webglSupport = Boolean(canvas.getContext('webgl2'));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/** Rough capability tier used to pick the 3D quality level. */
export function getDeviceTier() {
  if (typeof navigator === 'undefined') return 'medium';
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = navigator.deviceMemory ?? 4;
  if (isSmallScreen() || cores <= 4 || memory <= 4) return cores <= 2 || memory <= 2 ? 'low' : 'medium';
  return 'high';
}
