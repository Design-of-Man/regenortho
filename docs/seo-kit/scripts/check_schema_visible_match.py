#!/usr/bin/env python3
"""
check_schema_visible_match.py

Checks a page's JSON-LD against its visible text.
Usage:
    python3 check_schema_visible_match.py page.html            (local file)
    python3 check_schema_visible_match.py https://example.com/faq/   (URL)

Fails (exit 1) when:
  - JSON-LD does not parse
  - placeholder text (TODO, lorem, REPLACE, example.com) is present anywhere
  - a FAQPage question or answer is not found in the visible text
  - a DefinedTerm name is not found in the visible text
  - Review / AggregateRating markup is present (self-serving review markup)
  - the same @id is defined twice with different content
Heuristic only: it reads the HTML as served (not rendered JavaScript).
"""
import json, re, sys, html as htmlmod
from html.parser import HTMLParser
from urllib.request import Request, urlopen

PLACEHOLDER = re.compile(r"TODO|lorem ipsum|REPLACE-WITH|example\.com|\bDOMAIN\b", re.I)


class Visible(HTMLParser):
    SKIP = {"script", "style", "noscript", "template", "head"}

    def __init__(self):
        super().__init__()
        self.skip = 0
        self.parts = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in self.SKIP:
            self.skip += 1
        elif a.get("hidden") is not None or "display:none" in (a.get("style") or "").replace(" ", ""):
            self.skip += 1  # treat as not visible
            self._hidden_tag = tag

    def handle_endtag(self, tag):
        if tag in self.SKIP and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


def norm(t):
    t = htmlmod.unescape(t)
    t = re.sub(r"<[^>]+>", " ", t)
    t = t.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    t = re.sub(r"[*_`]", "", t)
    return re.sub(r"\s+", " ", t).strip().lower()


def load(src):
    if re.match(r"https?://", src):
        req = Request(src, headers={"User-Agent": "schema-check/1.0"})
        return urlopen(req, timeout=20).read().decode("utf-8", "replace")
    return open(src, encoding="utf-8").read()


def nodes(obj):
    if isinstance(obj, dict):
        if "@graph" in obj:
            for n in obj["@graph"]:
                yield from nodes(n)
        else:
            yield obj
            for v in obj.values():
                if isinstance(v, (dict, list)):
                    yield from nodes(v)
    elif isinstance(obj, list):
        for n in obj:
            yield from nodes(n)


def types(n):
    t = n.get("@type", [])
    return t if isinstance(t, list) else [t]


def main(src):
    raw = load(src)
    errors, warns = [], []
    blocks = re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', raw, re.S | re.I)
    if not blocks:
        warns.append("no JSON-LD found")
    parser = Visible()
    parser.feed(raw)
    visible = norm(" ".join(parser.parts))

    seen_ids = {}
    for i, b in enumerate(blocks, 1):
        if PLACEHOLDER.search(b):
            errors.append(f"block {i}: placeholder text present ({PLACEHOLDER.search(b).group(0)})")
        try:
            data = json.loads(b)
        except Exception as e:
            errors.append(f"block {i}: invalid JSON ({e})")
            continue
        for n in nodes(data):
            ts = types(n)
            nid = n.get("@id")
            if nid and "@type" in n:
                sig = json.dumps(n, sort_keys=True)
                if nid in seen_ids and seen_ids[nid] != sig:
                    errors.append(f"duplicate @id with different content: {nid}")
                seen_ids[nid] = sig
            if any(t in ("Review", "AggregateRating") for t in ts):
                errors.append("Review/AggregateRating markup found (do not mark up the clinic's own reviews)")
            if "FAQPage" in ts:
                for q in n.get("mainEntity", []):
                    qn = norm(q.get("name", ""))
                    an = norm(q.get("acceptedAnswer", {}).get("text", ""))
                    if qn and qn not in visible:
                        errors.append(f"FAQ question not visible on page: {q.get('name','')[:80]}")
                    if an and an[:80] not in visible:
                        errors.append(f"FAQ answer not visible on page: {an[:60]}...")
            if "DefinedTerm" in ts and n.get("name"):
                if norm(n["name"]) not in visible:
                    errors.append(f"DefinedTerm not visible on page: {n['name']}")
    page_ph = PLACEHOLDER.search(" ".join(parser.parts))
    if page_ph:
        errors.append(f"placeholder text visible on page ({page_ph.group(0)})")

    for w in warns:
        print("WARN:", w)
    for e in errors:
        print("FAIL:", e)
    print(f"{len(blocks)} JSON-LD block(s), {len(errors)} error(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
