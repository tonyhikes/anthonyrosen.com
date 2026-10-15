#!/usr/bin/env python3
"""Web exports of the V21 at-the-desk portraits for the Masthead "desk" framing.

The V21 desk pack (public/many-hats/desk-v21/, see MANY_HATS_V12_HANDOFF.md)
places each approved close-up portrait on the original desk photograph with
one shared transform: the 1254px close-up canvas resized to 523px and placed
at [418, 68]. Flight sprites must use that same transform, so the browser
reuses the close-up cap crops from web-v19 and only their boxes change.

The pack's own `desk-bare` is the V20 aligned bare photograph, a separate
generated face. Cutting between it and the worn heads makes the head change
at every lift-off and landing, so the hat-off frame here is rebuilt instead:
the close-up hat-off frame from `hat_off_portrait` (worn face, bare hair),
put through the same transform onto the worn desk photograph.

  desk-off-{800,1000,1254}.webp       hat-off frame, shared by every role
  {role}-desk-{800,1000,1254}.webp    worn desk photograph per role
  desk-hair.webp                 loose hair beyond the cap's outline, cropped
  brim-shade.webp                the brim's shadow as pure shade (see
                                 `brim_shade`), cropped

Usage: python3 scripts/many-hats-web-desk-v21.py
"""

from __future__ import annotations

import importlib.util
import os

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESK = os.path.join(ROOT, "public/many-hats/desk-v21")
OUT = os.path.join(ROOT, "public/many-hats/web-desk-v21")
EXTENT, LEFT, TOP = 523, 418, 68  # the V21 close-up -> desk transform
# Desk rows above this come from the transformed hat-off frame; it equals
# the worn face below the brows (close-up row ~600 -> desk row ~318), so the
# seam blends between identical pixels.
SEAM_FROM, SEAM_TO = 322, 342
# 1000 fits most phones (a 1.45x-wide portrait at 2x density) between the
# 800 and full-size files, which keeps the hero's largest paint small
DESK_WIDTHS = (800, 1000, 1254)
SHADE = (0.22, 0.12, 0.08)  # brim-shadow color: skin in deep shade

spec = importlib.util.spec_from_file_location(
    "web_v19", os.path.join(ROOT, "scripts/many-hats-web-v19.py")
)
web = importlib.util.module_from_spec(spec)
spec.loader.exec_module(web)


def to_desk(close_up: Image.Image) -> Image.Image:
    head = close_up.convert("RGBa").resize((EXTENT, EXTENT), Image.LANCZOS).convert("RGBA")
    canvas = Image.new("RGBA", (web.CANVAS, web.CANVAS))
    canvas.paste(head, (LEFT, TOP))
    return canvas


def premultiplied(img: Image.Image) -> np.ndarray:
    a = np.asarray(img).astype(np.float32) / 255
    return np.dstack([a[..., :3] * a[..., 3:], a[..., 3:]])


def unpremultiplied(mix: np.ndarray) -> Image.Image:
    alpha = mix[..., 3:]
    rgb = np.where(alpha > 1e-4, mix[..., :3] / np.maximum(alpha, 1e-4), 0)
    return Image.fromarray((np.clip(np.dstack([rgb, alpha]), 0, 1) * 255 + 0.5).astype(np.uint8))


def brim_shade(desk_off: Image.Image, desk_worn: Image.Image, cap_c: Image.Image) -> Image.Image:
    """The brim's shadow as pure shade: a flat warm-dark layer whose alpha
    darkens the hat-off frame to the worn photograph's smoothed tone around
    the cap footprint (forehead under the brim, hair at the sides). No photo
    content, so a partial fade never ghosts skin over hair. The browser moves
    it with the arriving cap, so its top edge always sits under the brim; the
    edge is feathered a little way up under the cap, which covers it."""
    f = lambda im: np.asarray(im).astype(np.float32) / 255
    smooth = lambda a: np.dstack(
        [np.asarray(Image.fromarray((a[..., i] * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))) for i in range(3)]
    ).astype(np.float32) / 255
    off, worn = f(desk_off), f(desk_worn)
    so, sw = smooth(off), smooth(worn)
    shade = np.array(SHADE, np.float32)
    # least-squares alpha a for  off * (1 - a) + shade * a = worn
    num = ((so - sw) * (so - shade)).sum(-1)
    den = ((so - shade) ** 2).sum(-1) + 1e-4
    cap = np.asarray(to_desk(cap_c))[..., 3] > 8
    soft = lambda m, grow, blur: np.asarray(
        Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(grow)).filter(ImageFilter.GaussianBlur(blur))
    ).astype(np.float32) / 255
    outside_cap = 1 - soft(cap, 3, 0.8)
    rows = np.arange(web.CANVAS, dtype=np.float32)[:, None]
    band = np.clip((SEAM_TO - rows) / (SEAM_TO - SEAM_FROM), 0, 1)
    solid = np.minimum(off[..., 3], worn[..., 3])
    measured = np.clip(num / den, 0, 0.9) * band * outside_cap * solid
    # carry the edge ~16 desk px up under the cap, fading out
    edge = Image.fromarray((measured * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(5))
    edge = np.asarray(edge).astype(np.float32) / 255
    deep = np.asarray(Image.fromarray((cap * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(25)).filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255
    inner = edge * (1 - deep) * band
    alpha = measured * outside_cap + inner * (1 - outside_cap)
    return Image.fromarray((np.dstack([np.broadcast_to(shade, off[..., :3].shape), alpha]) * 255 + 0.5).astype(np.uint8))


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    bare = web.load("portrait-bare.png")
    full_off = web.hat_off_portrait(
        bare, web.load("marketing/portrait-worn.png"), web.load("marketing/marketing-c.png")
    )
    rows = np.arange(web.CANVAS, dtype=np.float32)[:, None, None]
    take = np.clip((SEAM_TO - rows) / (SEAM_TO - SEAM_FROM), 0, 1)

    def on_desk(close_up: Image.Image, folder: str) -> Image.Image:
        """A close-up head on that role's desk photograph, through the V21
        transform, joined to the original body below the seam."""
        desk = Image.open(os.path.join(DESK, f"desk-{folder}-worn.png")).convert("RGBA")
        return unpremultiplied(premultiplied(to_desk(close_up)) * take + premultiplied(desk) * (1 - take))

    # Every worn head carries the hat-off frame's side hair (see
    # `worn_with_side_hair`), so the sides never change when a cap lands.
    worn_close = {
        folder: web.worn_with_side_hair(
            web.load(f"{folder}/portrait-worn.png"), full_off, bare, web.load(f"{folder}/{folder}-c.png")
        )
        for folder in web.ROLES.values()
    }
    # the loose hair beyond the cap's outline is its own layer (see
    # `split_loose_hair`), faded as a cap presses it down
    hat_off, loose = web.split_loose_hair(
        full_off, worn_close["marketing"], web.load("marketing/marketing-c.png")
    )
    desk_worn = on_desk(worn_close["marketing"], "marketing")
    desk_off = on_desk(hat_off, "marketing")

    # the face below the hair must match the worn desk photograph
    a = np.asarray(desk_off).astype(int)
    b = np.asarray(desk_worn).astype(int)
    face = np.abs(a - b)[SEAM_FROM - 20 : 590, :, :3].max(-1)
    print(f"face rows {SEAM_FROM - 20}-590 vs worn desk: mean {face.mean():.2f}, max {face.max()}")

    web.OUT = OUT
    sizes: dict[str, int] = {}
    for w in DESK_WIDTHS:
        sizes[f"desk-off-{w}.webp"] = web.save(web.resize(desk_off, w), f"desk-off-{w}.webp")
    for role, folder in web.ROLES.items():
        worn = on_desk(worn_close[folder], folder)
        for w in DESK_WIDTHS:
            name = f"{role}-desk-{w}.webp"
            sizes[name] = web.save(web.resize(worn, w), name)
    loose_crop, box = web.crop_to_alpha(to_desk(loose))
    sizes["desk-hair.webp"] = web.save(loose_crop, "desk-hair.webp")
    print(f"desk-hair box: {box}")
    shade = brim_shade(desk_off, desk_worn, web.load("marketing/marketing-c.png"))
    ys, xs = np.where(np.asarray(shade)[..., 3] > 2)
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    sizes["brim-shade.webp"] = web.save(shade.crop((x0, y0, x1, y1)), "brim-shade.webp")
    print(f"brim-shade box: x {x0}, y {y0}, w {x1 - x0}, h {y1 - y0}")
    # check: hat-off + full shade + cap pose C should read as the worn photo
    test = desk_off.copy()
    test.alpha_composite(shade)
    test.alpha_composite(to_desk(web.load("marketing/marketing-c.png")))
    t, w_ = np.asarray(test).astype(int), np.asarray(desk_worn).astype(int)
    head = np.zeros(t.shape[:2], bool)
    head[100:SEAM_TO, 380:980] = True
    head &= w_[..., 3] > 250
    for label, img in (("without shade", None), ("with shade", t)):
        if img is None:
            img = desk_off.copy()
            img.alpha_composite(to_desk(web.load("marketing/marketing-c.png")))
            img = np.asarray(img).astype(int)
        d = np.abs(img - w_)[..., :3].max(-1)[head]
        print(f"contact vs worn desk, {label}: mean {d.mean():.1f}, px>20 {(d > 20).sum()}")
    for name, size in sorted(sizes.items()):
        print(f"{size / 1024:7.1f} KB  {name}")
    print(f"total {sum(sizes.values()) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
