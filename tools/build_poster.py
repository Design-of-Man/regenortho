#!/usr/bin/env python3
"""Regenerate assets/video/juno-poster-2560.jpg from the graded hero loop.

There is no ffmpeg in the build sandbox, so Chromium's own decoder does the
work: seek the video to the documented poster timestamp, draw the frame to a
canvas at the video's native size, read the pixels back.

    python3 tools/build_poster.py

WHY IT IS THIS BIG. The <video> ships preload="none", so the poster is what
paints first and it stays on screen for the whole 17-28MB video download. At
1600x900 (the old poster) object-fit:cover upscaled it 1.94x on a Retina laptop
and 2.40x at 1920/DPR2 — visibly soft, and mistaken for the video being soft.
The 2688x1512 master only upscales 1.16-1.43x on those same screens, so the
poster was the weak link, not the encode.

SOURCE. juno-hd.webm (2560x1440 VP9) is the highest-resolution rendition a
headless Chromium can decode — the .mp4 tier needs H.264, which the bundled
build has no codec for. 2560 is therefore the ceiling here; if you ever run
this with ffmpeg available, pull from juno-max.mp4 at 2688 instead.

TIMESTAMP. 1.6s is the documented poster point: pier mid-approach, before the
drone's auto-exposure dips crossing the pier at ~7s.

QUALITY. 70, which lands at ~320KB. The frame is sand, surf and water — high
frequency detail that hides JPEG artifacts well — so resolution buys more here
than the last few quality points do. Raising it to 82 costs 114KB for no
visible gain at this size.
"""
import asyncio
import base64
import glob
import http.server
import os
import socket
import socketserver
import sys
import threading

SRC = "assets/video/juno-hd.webm"
OUT = "assets/video/juno-poster-2560.jpg"
TIMESTAMP = 1.6
QUALITY = 70
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def serve():
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=ROOT, **kw)

        def log_message(self, *a, **kw):
            pass

    class Quiet(socketserver.ThreadingTCPServer):
        allow_reuse_address = True
        daemon_threads = True

        def handle_error(self, *a):
            pass

    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        port = s.getsockname()[1]
    threading.Thread(target=Quiet(("127.0.0.1", port), Handler).serve_forever,
                     daemon=True).start()
    return port


async def main():
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("needs playwright: pip install playwright", file=sys.stderr)
        return 1
    from PIL import Image
    import io

    if not os.path.exists(os.path.join(ROOT, SRC)):
        print("missing %s — video renditions land out-of-band" % SRC, file=sys.stderr)
        return 1

    port = serve()
    exes = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
    launch = {"args": ["--no-sandbox"]}
    if exes:
        launch["executable_path"] = exes[-1]

    async with async_playwright() as p:
        browser = await p.chromium.launch(**launch)
        page = await (await browser.new_context()).new_page()
        await page.goto("http://127.0.0.1:%d/index.html" % port, wait_until="load")
        frame = await page.evaluate("""async ([src, t]) => {
            const v = document.createElement('video');
            v.muted = true; v.playsInline = true; v.src = src;
            await new Promise((ok, no) => {
              v.onloadeddata = ok;
              v.onerror = () => no('could not decode ' + src);
            });
            await new Promise((ok) => { v.onseeked = ok; v.currentTime = t; });
            const c = document.createElement('canvas');
            c.width = v.videoWidth; c.height = v.videoHeight;
            c.getContext('2d').drawImage(v, 0, 0);
            return { w: v.videoWidth, h: v.videoHeight,
                     png: c.toDataURL('image/png').split(',')[1] };
        }""", ["http://127.0.0.1:%d/%s" % (port, SRC), TIMESTAMP])
        await browser.close()

    im = Image.open(io.BytesIO(base64.b64decode(frame["png"]))).convert("RGB")
    out = os.path.join(ROOT, OUT)
    im.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    print("%s  %dx%d  %dKB" % (OUT, im.width, im.height,
                               os.path.getsize(out) // 1024))
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
