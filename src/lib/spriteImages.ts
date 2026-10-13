/**
 * Client-side image cache for hero and monster artwork.
 *
 * Images are drawn repeatedly by the canvas battle renderer, so cache the
 * Image objects, wait for successful decoding before returning them, and
 * discard broken sources so a later render can retry instead of staying blank.
 */
const cache = new Map<string, HTMLImageElement>();
const failed = new Set<string>();

export interface SpritePreloadResult {
  loaded: number;
  failed: string[];
}

/** Wait for real image load/decode completion and report actual byte-backed assets. */
export function waitForSprites(
  srcs: Array<string | undefined | null>,
  onProgress?: (loaded: number, total: number) => void,
  timeoutMs = 12000,
): Promise<SpritePreloadResult> {
  const unique = Array.from(new Set(srcs.filter((src): src is string => Boolean(src))));
  let completed = 0;
  const failures: string[] = [];
  const report = () => onProgress?.(completed, unique.length);

  if (unique.length === 0) {
    onProgress?.(0, 0);
    return Promise.resolve({ loaded: 0, failed: [] });
  }

  return new Promise((resolve) => {
    let finished = false;
    const pending = new Set(unique);
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      resolve({ loaded: completed, failed: failures });
    };
    const timeout = window.setTimeout(() => {
      failures.push(...pending);
      completed += pending.size;
      pending.clear();
      report();
      finish();
    }, timeoutMs);

    unique.forEach((src) => {
      const image = new Image();
      image.decoding = "async";
      const settle = (ok: boolean) => {
        if (!pending.delete(src)) return;
        if (ok) {
          try { cache.set(src, image); failed.delete(src); }
          catch { /* cache is an optimization only */ }
        } else {
          failures.push(src);
          failed.add(src);
          cache.delete(src);
        }
        completed += 1;
        report();
        if (pending.size === 0) finish();
      };
      image.onload = async () => {
        try {
          if (typeof image.decode === "function") await image.decode();
          settle(image.naturalWidth > 0);
        } catch {
          settle(image.naturalWidth > 0);
        }
      };
      image.onerror = () => settle(false);
      image.src = src;
      if (image.complete && image.naturalWidth > 0) {
        void image.decode?.().catch(() => undefined).then(() => settle(image.naturalWidth > 0));
      }
    });
  });
}

export function getSpriteImage(src?: string | null): HTMLImageElement | null {
  if (!src || typeof window === "undefined" || failed.has(src)) return null;

  let img = cache.get(src);
  if (!img) {
    img = new Image();
    img.decoding = "async";
    img.onload = () => {
      // A successful load makes the cached image available on the next frame.
      failed.delete(src);
    };
    img.onerror = () => {
      failed.add(src);
      cache.delete(src);
    };
    cache.set(src, img);
    img.src = src;
  }

  // naturalWidth protects against broken URLs and images that are still loading.
  return img.complete && img.naturalWidth > 0 ? img : null;
}

/** Start loading the artwork early; the canvas renderer will pick it up once decoded. */
export function preloadSprites(srcs: Array<string | undefined | null>) {
  srcs.forEach((src) => {
    if (src) getSpriteImage(src);
  });
}

export interface PortraitCrop {
  /** normalized center-x of the face inside the source image (0..1) */
  u: number;
  /** normalized center-y of the face inside the source image (0..1) */
  v: number;
  /** normalized radius of the face crop relative to image width (0..0.5) */
  r: number;
}

/** Tight head crop for painted/vector hero portraits */
export const HERO_CROP: PortraitCrop = { u: 0.5, v: 0.395, r: 0.235 };

/** Wider crop for monster / boss portraits (face fills more of the frame) */
export const MONSTER_CROP: PortraitCrop = { u: 0.5, v: 0.46, r: 0.3 };
