#!/usr/bin/env python3
"""Web exports of the approved V19 Many Hats pack for the redesign directions.

The V19 pack (public/many-hats/all-poses-v19/) is the source of truth: lossless
1254x1254 RGBA masters sharing one canvas and the crown anchor [617,130].
Lossless runs ~300 KB per cap pose and ~900 KB per portrait, far too heavy for
a page that must keep a 100 PageSpeed score, so this writes lossy-alpha WebP
derivatives without changing geometry:

  portrait-bare-{800,1254}.webp        shared hat-off photograph, rebuilt on
                                       the worn photograph's face (see
                                       `hat_off_portrait`), minus the loose
                                       hair beyond the cap's outline
  bare-hair.webp                       that loose hair, cropped; its box is
                                       in poses.json ("hair")
  {role}-worn-{800,1254}.webp          complete worn photograph per role
  {role}-{a..e}.webp                   cap poses, cropped to their outline and
                                       scaled; offsets recorded in poses.json so
                                       the browser places each crop back on the
                                       1254 canvas exactly
  {role}-rack.webp                     320px square thumbnail of pose C
  portrait-bare-mono.webp,             black-and-white versions (poster
  {role}-worn-mono.webp                direction); the cap keeps its color,
                                       masked by pose C, which is the exact fit

Usage: python3 scripts/many-hats-web-v19.py
"""

from __future__ import annotations

import json
import os

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public/many-hats/all-poses-v19")
OUT = os.path.join(ROOT, "public/many-hats/web-v19")
CANVAS = 1254
# site role id -> V19 folder
ROLES = {
    "marketing": "marketing",
    "product": "product",
    "projects": "project-management",
    "design": "design",
    "operations": "operations",
}
POSES = "abcde"
POSE_SCALE = 0.7  # caps render at <= ~0.9 device px per canvas px
PORTRAIT_WIDTHS = (800, 1254)
QUALITY = dict(quality=80, alpha_quality=85, method=6)


def load(path: str) -> Image.Image:
    return Image.open(os.path.join(SRC, path)).convert("RGBA")


def resize(img: Image.Image, width: int) -> Image.Image:
    if img.width == width:
        return img
    height = round(img.height * width / img.width)
    # premultiplied resize so transparent edges don't darken
    return img.convert("RGBa").resize((width, height), Image.LANCZOS).convert("RGBA")


def save(img: Image.Image, name: str) -> int:
    path = os.path.join(OUT, name)
    img.save(path, "WEBP", **QUALITY)
    return os.path.getsize(path)


def _soft(mask: np.ndarray, grow: int, blur: float) -> np.ndarray:
    im = Image.fromarray((mask * 255).astype(np.uint8))
    if grow:
        im = im.filter(ImageFilter.MaxFilter(grow))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(blur))).astype(np.float32) / 255


def side_hair(bare: Image.Image) -> np.ndarray:
    """Soft mask of the bare photograph's hair at the sides, from the brim
    down to the tops of the ears (hair pixels only: dark and opaque)."""
    b = np.asarray(bare).astype(np.float32) / 255
    lum = b[..., :3] @ np.array([0.299, 0.587, 0.114], np.float32)
    cols = np.arange(CANVAS)[None, :]
    sides = ((cols < 335) | (cols > 915)) & (np.arange(CANVAS)[:, None] < 690)
    return _soft(sides & (lum < 0.33) & (b[..., 3] > 0.5), 3, 2.5)


def _mix(top: Image.Image, under: Image.Image, amount: np.ndarray) -> Image.Image:
    """Premultiplied blend: `top` where amount is 1, `under` where it is 0."""
    t = np.asarray(top).astype(np.float32) / 255
    u = np.asarray(under).astype(np.float32) / 255
    pt = np.dstack([t[..., :3] * t[..., 3:], t[..., 3:]])
    pu = np.dstack([u[..., :3] * u[..., 3:], u[..., 3:]])
    a = amount[..., None]
    mix = pt * a + pu * (1 - a)
    alpha = mix[..., 3:]
    rgb = np.where(alpha > 1e-4, mix[..., :3] / np.maximum(alpha, 1e-4), 0)
    return Image.fromarray((np.clip(np.dstack([rgb, alpha]), 0, 1) * 255 + 0.5).astype(np.uint8))


def worn_with_side_hair(worn: Image.Image, hat_off: Image.Image, bare: Image.Image, cap_c: Image.Image) -> Image.Image:
    """A worn photograph whose hair below the brim at the sides is the same
    hair as the hat-off frame, so the sides never change when a cap lands
    or lifts (the generated worn photo presses that hair thinner). The cap
    itself is untouched: pose C is its exact outline."""
    cap = np.asarray(cap_c)[..., 3] > 8
    return _mix(hat_off, worn, side_hair(bare) * (1 - _soft(cap, 3, 1)))


def hat_off_portrait(
    bare: Image.Image, worn: Image.Image, cap_c: Image.Image
) -> Image.Image:
    """The worn photograph with only the cap area swapped for the bare curls.

    The approved bare and worn photographs are separate generated images: the
    face, ears and sharpness differ slightly, so cutting between them made the
    head jump at every lift-off and landing. Both are already registered below
    the brim (a scale/offset search finds identity best), so taking the hair
    from the bare photograph over the cap footprint, and everything from the
    eyebrows down from the worn one, gives a hat-off frame that shares the
    worn face pixel for pixel. Every worn photograph is identical outside the
    cap, so one hat-off frame serves all roles.
    """
    b = np.asarray(bare).astype(np.float32) / 255
    w = np.asarray(worn).astype(np.float32) / 255
    # The brim casts a shadow on the forehead that reaches past the hair cut,
    # down to the eyebrows. Lift it rather than replace it (replacing would
    # swap the brows): scale the worn pixels by the ratio of the bare photo's
    # smoothed brightness to the worn one's, only where the worn is darker,
    # fading out by the top of the eyes.
    lum = lambda a: Image.fromarray(
        (np.clip(a[..., :3] @ np.array([0.299, 0.587, 0.114], np.float32), 0, 1) * 255).astype(np.uint8)
    ).filter(ImageFilter.GaussianBlur(7))
    lb = np.asarray(lum(b)).astype(np.float32) + 1
    lw = np.asarray(lum(w)).astype(np.float32) + 1
    gain = np.clip(lb / lw, 1.0, 2.5)
    rows = np.arange(CANVAS)[:, None].astype(np.float32)
    band = np.clip((660 - rows) / 60, 0, 1)  # full above y 600, gone by 660
    solid = np.minimum(b[..., 3], w[..., 3])
    gain = 1 + (gain - 1) * band * solid
    w = w.copy()
    w[..., :3] = np.clip(w[..., :3] * gain[..., None], 0, 1)
    cap = np.asarray(cap_c)[..., 3] > 8
    above_brows = (np.arange(CANVAS)[:, None] < 575) * np.ones((1, CANVAS))
    # The cap presses the hair flat at the sides, down to the ears; take
    # that hair from the bare photograph too, or the dent stays after the
    # hat has gone. Hair pixels only (dark in either photo), so the ears and
    # temples keep the worn face.
    take = np.maximum.reduce([_soft(cap, 21, 4), _soft(above_brows, 0, 10), side_hair(bare)])[..., None]
    pb = np.dstack([b[..., :3] * b[..., 3:], b[..., 3:]])
    pw = np.dstack([w[..., :3] * w[..., 3:], w[..., 3:]])
    mix = pb * take + pw * (1 - take)
    alpha = mix[..., 3:]
    rgb = np.where(alpha > 1e-4, mix[..., :3] / np.maximum(alpha, 1e-4), 0)
    return Image.fromarray((np.clip(np.dstack([rgb, alpha]), 0, 1) * 255 + 0.5).astype(np.uint8))


def split_loose_hair(
    portrait: Image.Image, worn: Image.Image, cap_c: Image.Image
) -> tuple[Image.Image, Image.Image]:
    """Split the hat-off frame into the head as it sits under a cap and the
    loose hair beyond the cap's outline (the curls above the crown). The browser fades the loose hair as a cap comes down, as if
    pressed flat, so no curls poke out above a landing hat. Over each other
    the two layers give back the hat-off frame."""
    p = np.asarray(portrait).astype(np.float32) / 255
    inside = (np.asarray(worn)[..., 3] > 128) | (np.asarray(cap_c)[..., 3] > 128)
    inside = np.asarray(Image.fromarray((inside * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))) > 0
    # only the curls above the crown: the sides carry the same hair hat-on
    # and hat-off (`worn_with_side_hair`), so nothing there is loose
    inside[400:] = True
    base, loose = p.copy(), p.copy()
    base[..., 3] *= inside
    loose[..., 3] *= ~inside
    as_image = lambda a: Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))
    return as_image(base), as_image(loose)


def crop_to_alpha(img: Image.Image) -> tuple[Image.Image, dict]:
    ys, xs = np.where(np.asarray(img)[..., 3] > 2)
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    return img.crop((x0, y0, x1, y1)), {"x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0}


def mono(img: Image.Image, keep: np.ndarray | None = None) -> Image.Image:
    arr = np.asarray(img).astype(np.float32)
    gray = arr[..., :3] @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    gray = np.clip(128 + (gray - 128) * 1.08, 0, 255)[..., None].repeat(3, -1)
    rgb = gray if keep is None else arr[..., :3] * keep + gray * (1 - keep)
    return Image.fromarray(np.dstack([rgb, arr[..., 3:]]).astype(np.uint8))


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    sizes: dict[str, int] = {}
    poses: dict[str, dict] = {}

    hat_off = hat_off_portrait(
        load("portrait-bare.png"),
        load("marketing/portrait-worn.png"),
        load("marketing/marketing-c.png"),
    )
    bare, loose = split_loose_hair(
        hat_off,
        worn_with_side_hair(
            load("marketing/portrait-worn.png"), hat_off, load("portrait-bare.png"), load("marketing/marketing-c.png")
        ),
        load("marketing/marketing-c.png"),
    )
    loose_crop, poses["hair"] = crop_to_alpha(loose)
    sizes["bare-hair.webp"] = save(loose_crop, "bare-hair.webp")
    for w in PORTRAIT_WIDTHS:
        sizes[f"portrait-bare-{w}.webp"] = save(resize(bare, w), f"portrait-bare-{w}.webp")
    sizes["portrait-bare-mono.webp"] = save(resize(mono(hat_off), 800), "portrait-bare-mono.webp")

    for role, folder in ROLES.items():
        worn = worn_with_side_hair(
            load(f"{folder}/portrait-worn.png"),
            hat_off,
            load("portrait-bare.png"),
            load(f"{folder}/{folder}-c.png"),
        )
        for w in PORTRAIT_WIDTHS:
            name = f"{role}-worn-{w}.webp"
            sizes[name] = save(resize(worn, w), name)
        cap_c = np.asarray(load(f"{folder}/{folder}-c.png"))[..., 3:4].astype(np.float32) / 255
        name = f"{role}-worn-mono.webp"
        sizes[name] = save(resize(mono(worn, keep=cap_c), 800), name)

        for pose in POSES:
            img = load(f"{folder}/{folder}-{pose}.png")
            alpha = np.asarray(img)[..., 3]
            ys, xs = np.where(alpha > 2)
            x0, y0 = max(0, xs.min() - 2), max(0, ys.min() - 2)
            x1, y1 = min(CANVAS, xs.max() + 3), min(CANVAS, ys.max() + 3)
            crop = img.crop((x0, y0, x1, y1))
            name = f"{role}-{pose}.webp"
            sizes[name] = save(resize(crop, round(crop.width * POSE_SCALE)), name)
            # geometry is identical across roles within a pose; record once
            poses.setdefault(pose.upper(), {"x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0)})
            if pose == "c":
                side = max(crop.width, crop.height)
                square = Image.new("RGBA", (side, side))
                square.alpha_composite(crop, ((side - crop.width) // 2, (side - crop.height) // 2))
                name = f"{role}-rack.webp"
                sizes[name] = save(resize(square, 320), name)
                poses.setdefault("rack", {"x": int(x0 - (side - crop.width) // 2), "y": int(y0 - (side - crop.height) // 2), "w": side, "h": side})

    with open(os.path.join(OUT, "poses.json"), "w") as f:
        json.dump({"canvas": CANVAS, "anchor": [617, 130], "poses": poses}, f, indent=2)
    for name, size in sorted(sizes.items()):
        print(f"{size / 1024:7.1f} KB  {name}")
    print(f"total {sum(sizes.values()) / 1024:.0f} KB")
    print(json.dumps(poses))


if __name__ == "__main__":
    main()
