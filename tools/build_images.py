#!/usr/bin/env python3
"""Generate the responsive WebP + JPEG derivatives that build.py's photo() emits.

Sources are the untouched originals in assets/media/ and assets/team/; output is
assets/img/{stem}-{width}.{webp,jpg}. Run after adding or replacing a photo:

    python3 tools/build_images.py

Needs Pillow, which the site build deliberately does NOT — build.py must run on a
clean checkout with no pip step, so derivative generation lives here instead and
its output is committed. photo() falls back to the original JPEG for any photo
whose derivatives are missing, so a forgotten run degrades rather than breaks.
"""
import glob
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WIDTHS = (480, 900, 1400)
QUALITY = 82

# og-*.jpg are share cards, sized and cropped for scrapers that fetch one exact
# URL; clinic-team.jpg is a logo banner, not a photograph.
SKIP = {"og-image.jpg", "og-team.jpg", "clinic-team.jpg"}


def main():
    out = os.path.join(ROOT, "assets/img")
    os.makedirs(out, exist_ok=True)
    srcs = [p for p in sorted(glob.glob(os.path.join(ROOT, "assets/media/*.jpg"))
                              + glob.glob(os.path.join(ROOT, "assets/team/*.jpg")))
            if os.path.basename(p) not in SKIP]
    if not srcs:
        print("no source photographs found", file=sys.stderr)
        return 1

    made = 0
    for s in srcs:
        stem = os.path.splitext(os.path.basename(s))[0]
        with Image.open(s) as im:
            im = im.convert("RGB")
            nw, nh = im.size
            emitted = []
            for w in WIDTHS:
                # never upscale past native, but do emit the native width itself:
                # clamping 900 to a 700px-wide original is the sharpest rendition
                # that photo has, and dropping it left tiles stuck on the 480.
                tw = min(w, nw)
                if tw in emitted:
                    continue
                r = im.resize((tw, round(tw * nh / nw)), Image.LANCZOS)
                r.save(os.path.join(out, "%s-%d.webp" % (stem, tw)),
                       "WEBP", quality=QUALITY, method=6)
                r.save(os.path.join(out, "%s-%d.jpg" % (stem, tw)),
                       "JPEG", quality=QUALITY, optimize=True, progressive=True)
                emitted.append(tw)
                made += 2
        print("%-24s %5dx%-5d -> %s" % (stem, nw, nh,
                                        ",".join(str(w) for w in emitted)))
    print("\n%d photographs, %d files in assets/img/" % (len(srcs), made))
    return 0


if __name__ == "__main__":
    sys.exit(main())
