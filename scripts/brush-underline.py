#!/usr/bin/env python3
"""A calligraphic underline stroke for the Many Hats desk hero.

Writes public/many-hats/brush-underline.webp: a white stroke on transparent,
used as a CSS mask (so it takes any hat color). Solid ink with crisp edges,
drawn left to right as a swish (a dip under the baseline, a rise, a settle,
a flick up and away), thick and thin like a broad nib, with pressure
swelling and easing along the way and a tapered tip. Procedural with a
fixed seed, so it rebuilds identically.

Usage: python3 scripts/brush-underline.py
"""

from __future__ import annotations

import os

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public/many-hats/brush-underline.webp")
W, H = 1000, 150  # output; drawn at 2x and reduced for clean edges
SS = 2
SEED = 7


def smooth_noise(rng: np.random.Generator, n: int, sigma: float) -> np.ndarray:
    """1D noise in about [-1, 1], low-passed with a Gaussian of `sigma` px."""
    raw = rng.standard_normal(n + int(sigma * 8))
    k = np.exp(-0.5 * (np.arange(-int(sigma * 4), int(sigma * 4) + 1) / sigma) ** 2)
    out = np.convolve(raw, k / k.sum(), mode="valid")[:n]
    return out / (np.abs(out).max() + 1e-6)


def main() -> None:
    rng = np.random.default_rng(SEED)
    w, h = W * SS, H * SS
    t = np.linspace(0, 1, w)

    # The swish, as a hand draws it: down into the stroke, a dip under the
    # baseline, a rise through the middle, a slight settle, then a flick up
    # and away. Control points are (progress, height as a fraction of H).
    path = np.array([
        (0.00, 0.56), (0.06, 0.64), (0.20, 0.65), (0.40, 0.54),
        (0.58, 0.51), (0.74, 0.54), (0.90, 0.46), (1.00, 0.36),
    ])
    yc = h * np.interp(t, path[:, 0], path[:, 1])
    yc = np.convolve(np.pad(yc, w // 20, mode="edge"), np.ones(w // 10) / (w // 10), mode="same")[w // 20 : w // 20 + w]
    yc += h * 0.006 * smooth_noise(rng, w, w / 8)

    # pressure along the stroke: light touch-down, heavy through the first
    # third, lighter across the middle, a second press, then the lift
    # a marker: nearly even width, with only a slight swell and ease
    press = np.array([
        (0.00, 0.80), (0.10, 0.95), (0.25, 1.00), (0.45, 0.88),
        (0.62, 0.84), (0.78, 0.92), (0.92, 0.86), (1.00, 0.80),
    ])
    pressure = np.interp(t, press[:, 0], press[:, 1])
    pressure = np.convolve(np.pad(pressure, w // 40, mode="edge"), np.ones(w // 20) / (w // 20), mode="same")[w // 40 : w // 40 + w]
    # a broad nib held at ~35°: the stroke is thickest where the path runs
    # across the nib and thins where it climbs along it, the calligraphic
    # thick-and-thin
    angle = np.arctan2(-np.gradient(yc), 1.0 / SS)
    nib = 0.85 + 0.15 * np.abs(np.cos(angle - np.radians(-35)))
    half = h * 0.072 * pressure * nib

    # ragged edges: each edge wanders on its own
    # crisp ink edges: only the faintest irregularity
    rough = lambda: 0.025 * smooth_noise(rng, w, w / 12) + 0.012 * smooth_noise(rng, w, 3)
    top = yc - half * (1 + rough())
    bot = yc + half * (1 + rough())

    ys = np.arange(h)[:, None]
    alpha = np.clip(np.minimum(ys - top[None, :], bot[None, :] - ys) / 2.0 + 0.5, 0, 1)
    # round felt-tip ends: a half-disc at each end of the stroke
    xs = np.arange(w)[None, :]
    for end in (0, w - 1):
        r = half[end]
        cx = end + r if end == 0 else end - r
        inside_cap = np.clip(r - np.hypot(xs - cx, ys - yc[end]) + 0.5, 0, 1)
        beyond = (xs < cx) if end == 0 else (xs > cx)
        alpha = np.where(beyond, inside_cap, alpha)

    img = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    img = img.resize((W, H), Image.LANCZOS)
    rgba = Image.merge("RGBA", (*(Image.new("L", (W, H), 255),) * 3, img))
    # lossless: lossy alpha leaves a faint haze over the whole box
    rgba.save(OUT, "WEBP", lossless=True, quality=100, method=6)
    print(f"{os.path.getsize(OUT) / 1024:.1f} KB  {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
