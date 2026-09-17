# -*- coding: utf-8 -*-
"""Generate the RegenOrtho Palm Beach client performance report PDF.

    pip install reportlab
    python3 tools/performance_report.py

Writes RegenOrtho-Performance-Report-<period>.pdf to the repo root, which is
GITIGNORED on purpose: Vercel serves this repo's root as the static site, so a
report committed there would be public at regenorthopb.com/<filename>. This
script lives under tools/, which .vercelignore keeps out of the deploy.

EVERY NUMBER BELOW IS HARDCODED. Re-running this without refreshing the data
re-emits last period's figures under a new date. To refresh, re-derive each
block from its source and edit it here:

  Search totals (authoritative, zero-dimension — never read totals off a
  query or page table, GSC truncates those):
    gsc.py summary --property regenortho --days 28

  Per-day baseline for the old site (its last full run of data):
    gsc.py summary --property regenortho --days 81 --end 2026-03-29

  Host split (www vs canonical). Use the PAGE dimension, not query+page:
  page reconciles clicks exactly against the summary totals, query+page is
  truncated and under-reports clicks by ~65%.
    gsc.py raw --property regenortho --dimensions page --days 28 \
        --limit 1000 --sort impressions --json

  Non-branded demand by service line:
    gsc.py raw --property regenortho --dimensions query --days 28 \
        --limit 1000 --sort impressions --json
  then bucket by regex and exclude the brand pattern
  (matarazzo|cedeno|cedano|regen ?ortho|prosperity farms|bahnick).

  Traffic (Vercel Web Analytics, began collecting 2026-08-25; max 62 days
  per aggregate query):
    mcp__Vercel__get_web_analytics  projectId prj_bRwdjB3yeI2WrZpm7qwLIAsOIV2q
                                    teamId    team_VWA1Ar7nCeuyUifvSyeFTT1T

TRAPS THAT HAVE ALREADY PRODUCED WRONG NUMBERS IN THIS REPORT:
  * GSC has a 141-day hole (2026-03-30 to 08-17) with no impressions at all.
    `gsc.py compare` straddles it and returns meaningless ratios — it once
    reported +449% by comparing 11 live days against 28. Compare per-day
    rates between contiguous runs of data instead.
  * The site launched 2026-08-18. That is NOT the first repo commit
    (2026-07-30). Ask; do not infer it from git.
  * Compare the canonical host only. Counting www duplicate impressions as
    reach turned a roughly flat quarter into a fictional +80%.
  * 'mark matarazzo' (4,543 impr) is a different, internationally known
    person — 57% of that volume is outside the US. It is not the practice's
    Dr. Marc Matarazzo, whose real footprint is ~165 impr on correctly
    spelled variants. Do not put it in a brand campaign.

Rendered pages are verified by rendering to PNG and reading them back; a
clipped tile label does not raise, it just ships looking wrong.
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, NextPageTemplate,
                                Spacer, Table, TableStyle, Image, PageBreak,
                                Flowable, KeepTogether)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, "RegenOrtho-Performance-Report-2026-09.pdf")

NAVY      = colors.HexColor("#092D5C")
NAVY_DEEP = colors.HexColor("#061F40")
GOLD      = colors.HexColor("#FDC929")
PORC      = colors.HexColor("#F9F7F2")
BRONZE    = colors.HexColor("#74590A")
INK       = colors.HexColor("#1B2430")
MUTED     = colors.HexColor("#5A6472")
RULE      = colors.HexColor("#DCD8CC")
GREEN     = colors.HexColor("#1E7A4B")

PW, PH = letter
M = 0.72 * inch

def P(txt, size=10, leading=None, color=INK, font="Helvetica",
      space_after=0, align=TA_LEFT, tracking=0):
    return Paragraph(txt, ParagraphStyle(
        "s", fontName=font, fontSize=size, leading=leading or size * 1.45,
        textColor=color, spaceAfter=space_after, alignment=align))

# ---------------------------------------------------------------- flowables
class Rule(Flowable):
    def __init__(self, width, thickness=0.75, color=RULE, pad=0):
        Flowable.__init__(self); self.width = width; self.t = thickness
        self.c = color; self.pad = pad; self.height = thickness + pad
    def wrap(self, *a): return (self.width, self.height)
    def draw(self):
        self.canv.setStrokeColor(self.c); self.canv.setLineWidth(self.t)
        self.canv.line(0, self.height / 2, self.width, self.height / 2)

class KPI(Flowable):
    """A single stat tile."""
    def __init__(self, w, h, value, label, sub=None, accent=GOLD, badge=None):
        Flowable.__init__(self)
        self.width, self.height = w, h
        self.value, self.label, self.sub = value, label, sub
        self.accent, self.badge = accent, badge
    def wrap(self, *a): return (self.width, self.height)
    def draw(self):
        c = self.canv
        c.setFillColor(colors.white); c.setStrokeColor(RULE); c.setLineWidth(0.75)
        c.roundRect(0, 0, self.width, self.height, 5, stroke=1, fill=1)
        c.setFillColor(self.accent)
        c.rect(0, self.height - 3.2, self.width, 3.2, stroke=0, fill=1)
        y = self.height - 34
        c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 25)
        c.drawString(13, y, self.value)
        vw = c.stringWidth(self.value, "Helvetica-Bold", 25)
        if self.badge:
            c.setFont("Helvetica-Bold", 8.5); c.setFillColor(GREEN)
            c.drawString(13 + vw + 7, y + 3, self.badge)
        c.setFillColor(MUTED); c.setFont("Helvetica-Bold", 7.6)
        c.drawString(13, y - 15, self.label.upper())
        if self.sub:
            c.setFillColor(MUTED); c.setFont("Helvetica", 7.4)
            c.drawString(13, y - 27, self.sub)

class GrowthChart(Flowable):
    """Paired bars: previous vs current period."""
    def __init__(self, w, h, series, leg_prev, leg_cur):
        Flowable.__init__(self); self.width, self.height = w, h
        self.series = series          # [(label, prev, cur, fmt)]
        self.leg_prev, self.leg_cur = leg_prev, leg_cur
    def wrap(self, *a): return (self.width, self.height)
    def draw(self):
        c = self.canv
        n = len(self.series)
        gw = self.width / n
        base = 30
        top  = self.height - 30
        for i, (label, prev, cur, fmt) in enumerate(self.series):
            x0 = i * gw
            mx = max(prev, cur) or 1
            bw = 40; gap = 16
            cx = x0 + gw / 2 - (bw * 2 + gap) / 2
            for j, (val, col) in enumerate(((prev, colors.HexColor("#C4CEDC")), (cur, NAVY))):
                h = (val / mx) * (top - base)
                bx = cx + j * (bw + gap)
                c.setFillColor(col); c.rect(bx, base, bw, h, stroke=0, fill=1)
                c.setFillColor(NAVY if j else MUTED)
                c.setFont("Helvetica-Bold" if j else "Helvetica", 8)
                c.drawCentredString(bx + bw / 2, base + h + 6, fmt(val))
            c.setFillColor(MUTED); c.setFont("Helvetica-Bold", 7.4)
            c.drawCentredString(x0 + gw / 2, base - 13, label.upper())
        c.setStrokeColor(RULE); c.setLineWidth(0.75)
        c.line(0, base, self.width, base)
        # legend
        c.setFillColor(colors.HexColor("#C9D2DE")); c.rect(0, self.height - 12, 9, 9, stroke=0, fill=1)
        c.setFillColor(MUTED); c.setFont("Helvetica", 7.6)
        c.drawString(13, self.height - 9.5, self.leg_prev)
        lw = c.stringWidth(self.leg_prev, "Helvetica", 7.6)
        c.setFillColor(NAVY); c.rect(26 + lw, self.height - 12, 9, 9, stroke=0, fill=1)
        c.setFillColor(MUTED); c.drawString(39 + lw, self.height - 9.5, self.leg_cur)

class DemandBars(Flowable):
    """Horizontal bars - impressions by service line."""
    def __init__(self, w, h, rows):
        Flowable.__init__(self); self.width, self.height = w, h
        self.rows = rows              # [(label, impressions, position)]
    def wrap(self, *a): return (self.width, self.height)
    def draw(self):
        c = self.canv
        n = len(self.rows)
        rh = self.height / n
        labw, posw = 150, 52
        barmax = self.width - labw - posw - 52
        mx = max(r[1] for r in self.rows)
        for i, (label, imp, pos) in enumerate(self.rows):
            y = self.height - (i + 1) * rh + rh * 0.30
            c.setFillColor(INK); c.setFont("Helvetica", 8.4)
            c.drawString(0, y, label)
            bw = (imp / mx) * barmax
            c.setFillColor(colors.HexColor("#EDE7D6"))
            c.rect(labw, y - 2.5, barmax, 11, stroke=0, fill=1)
            c.setFillColor(GOLD)
            c.rect(labw, y - 2.5, bw, 11, stroke=0, fill=1)
            c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 8.4)
            c.drawString(labw + barmax + 8, y, f"{imp:,}")
            c.setFillColor(MUTED); c.setFont("Helvetica", 8)
            c.drawRightString(self.width, y, f"pos {pos}")

def tile_row(tiles, total_w, h, gap=11):
    w = (total_w - gap * (len(tiles) - 1)) / len(tiles)
    cells = [KPI(w, h, *t[:3], accent=t[3], badge=t[4]) for t in tiles]
    t = Table([cells], colWidths=[w] * len(tiles), rowHeights=[h])
    t.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), gap),
        ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (-1, 0), (-1, -1), 0), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    return t

def data_table(header, rows, widths, aligns=None):
    right = {c for c, a in (aligns or []) if a == "RIGHT"}
    def al(i): return TA_RIGHT if i in right else TA_LEFT
    body = [[P(h, 7.4, color=colors.white, font="Helvetica-Bold", align=al(i))
             for i, h in enumerate(header)]]
    for r in rows:
        body.append([P(str(cell), 8.6, align=al(i)) for i, cell in enumerate(r)])
    t = Table(body, colWidths=widths, repeatRows=1)
    st = [("BACKGROUND", (0, 0), (-1, 0), NAVY),
          ("TOPPADDING", (0, 0), (-1, 0), 6), ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
          ("TOPPADDING", (0, 1), (-1, -1), 5), ("BOTTOMPADDING", (0, 1), (-1, -1), 5),
          ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
          ("LINEBELOW", (0, 1), (-1, -2), 0.5, RULE),
          ("VALIGN", (0, 0), (-1, -1), "MIDDLE")]
    for i in range(1, len(body)):
        if i % 2 == 0:
            st.append(("BACKGROUND", (0, i), (-1, i), PORC))
    for col, al in (aligns or []):
        st.append(("ALIGN", (col, 0), (col, -1), al))
    t.setStyle(TableStyle(st))
    return t

def h1(txt):  return P(txt, 17, 21, NAVY, "Helvetica-Bold", 3)
def eyebrow(txt): return P(txt.upper(), 7.6, 10, BRONZE, "Helvetica-Bold", 2)
def body(txt, sa=0): return P(txt, 9.3, 14, INK, space_after=sa)

# ---------------------------------------------------------------- page deco
def cover_page(c, doc):
    c.saveState()
    c.setFillColor(NAVY); c.rect(0, 0, PW, PH, stroke=0, fill=1)
    c.setFillColor(NAVY_DEEP); c.rect(0, 0, PW, 2.1 * inch, stroke=0, fill=1)
    c.setFillColor(GOLD); c.rect(0, PH - 9, PW, 9, stroke=0, fill=1)
    logo = os.path.join(ROOT, "assets/media/logo-dark.png")
    if os.path.exists(logo):
        c.drawImage(logo, M, PH - 2.35 * inch, width=2.5 * inch,
                    height=2.5 * inch * 318 / 1024, mask="auto")
    c.setFillColor(GOLD); c.setFont("Helvetica-Bold", 9)
    c.drawString(M, 3.62 * inch, "P E R F O R M A N C E   R E P O R T")
    c.setFillColor(colors.white); c.setFont("Helvetica-Bold", 37)
    c.drawString(M, 2.92 * inch, "Digital Performance")
    c.drawString(M, 2.42 * inch, "Review")
    c.setStrokeColor(GOLD); c.setLineWidth(2)
    c.line(M, 2.18 * inch, M + 1.5 * inch, 2.18 * inch)
    c.setFillColor(colors.HexColor("#B9C6DA")); c.setFont("Helvetica", 11)
    c.drawString(M, 1.74 * inch, "RegenOrtho Palm Beach  |  regenorthopb.com")
    c.setFont("Helvetica", 9.5)
    c.drawString(M, 1.48 * inch, "Reporting through September 17, 2026")
    c.setFillColor(colors.HexColor("#7F90AC")); c.setFont("Helvetica", 8)
    c.drawString(M, 0.72 * inch, "Prepared by The Design of Man")
    c.drawRightString(PW - M, 0.72 * inch,
                      "Sources: Google Search Console - Vercel Web Analytics - Post Bridge")
    c.restoreState()

def interior_page(c, doc):
    c.saveState()
    c.setFillColor(PORC); c.rect(0, 0, PW, PH, stroke=0, fill=1)
    c.setFillColor(NAVY); c.rect(0, PH - 0.52 * inch, PW, 0.52 * inch, stroke=0, fill=1)
    c.setFillColor(GOLD); c.rect(0, PH - 0.545 * inch, PW, 0.025 * inch, stroke=0, fill=1)
    c.setFillColor(colors.white); c.setFont("Helvetica-Bold", 8.4)
    c.drawString(M, PH - 0.335 * inch, "REGENORTHO PALM BEACH")
    c.setFillColor(colors.HexColor("#9FB2CC")); c.setFont("Helvetica", 8.4)
    c.drawRightString(PW - M, PH - 0.335 * inch, "Digital Performance Review  |  September 2026")
    c.setStrokeColor(RULE); c.setLineWidth(0.75)
    c.line(M, 0.62 * inch, PW - M, 0.62 * inch)
    c.setFillColor(MUTED); c.setFont("Helvetica", 7.6)
    c.drawString(M, 0.44 * inch, "The Design of Man")
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 7.6)
    c.drawRightString(PW - M, 0.44 * inch, f"{doc.page - 1}")
    c.restoreState()

# ---------------------------------------------------------------- document
doc = BaseDocTemplate(OUT, pagesize=letter,
                      leftMargin=M, rightMargin=M, topMargin=M, bottomMargin=M,
                      title="RegenOrtho Palm Beach - Digital Performance Review",
                      author="The Design of Man", subject="Performance report through September 2026")
CW = PW - 2 * M
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[Frame(M, M, CW, PH - 2 * M, id="c")], onPage=cover_page),
    PageTemplate(id="body", frames=[Frame(M, 0.78 * inch, CW, PH - 0.78 * inch - 0.78 * inch, id="b")],
                 onPage=interior_page),
])

S = []
S.append(NextPageTemplate("body"))
S.append(PageBreak())          # leave cover empty

# ---------------------------------------------------------------- page 1
S.append(eyebrow("The headline"))
S.append(h1("The migration held, and uncovered a costly defect"))
S.append(body(
    "RegenOrtho Palm Beach launched its new site on August 18, 2026. Site migrations normally cost "
    "20 to 40% of search visibility in the first months. Measured on the canonical host and per day, "
    "this one retained 93% of the old site's impression rate and 90% of its clicks inside four weeks "
    "- effectively holding ground while tripling the number of distinct searches the practice "
    "appears for. The audit also found roughly half of all search visibility being absorbed by a "
    "duplicate copy of the site on the wrong hostname. That defect has been identified and fixed.", 12))

S.append(tile_row([
    ("93%",  "Impression rate retained", "298 to 278 per day", GOLD, None),
    ("90%",  "Click rate retained",      "3.5 to 3.2 per day", GOLD, None),
    ("814",  "Queries ranking in 4 weeks", "780 of them non-branded", GOLD, None),
], CW, 74))
S.append(Spacer(1, 11))
S.append(tile_row([
    ("48%",   "Lost to a duplicate host", "~7,200 in four weeks", BRONZE, None),
    ("1.8x",  "Canonical host converts better",       "1.14% CTR vs 0.62%",   BRONZE, None),
    ("Fixed", "Duplicate host redirected",            "Shipped September 17", GREEN, None),
], CW, 74))

S.append(Spacer(1, 20))
S.append(eyebrow("Per-day performance on the canonical host - old site vs. new site"))
S.append(Spacer(1, 6))
S.append(GrowthChart(CW, 168, [
    ("Impressions / day", 298, 278, lambda v: f"{v:,.0f}"),
    ("Clicks / day",      3.5, 3.2, lambda v: f"{v:.1f}"),
    ("Queries / day",     10.7, 29.1, lambda v: f"{v:.1f}"),
], "Old site - Jan 8 to Mar 29, 2026", "New site - Aug 18 to Sep 14, 2026"))
S.append(Spacer(1, 12))
S.append(P("Per-day rates on regenorthopb.com only, excluding the duplicate host. Clicks reconcile "
           "exactly against Search Console's totals; impressions are apportioned by page share. "
           "Search Console finalises data on a three-day lag, so the window closes September 14.",
           7.8, 11, MUTED))

S.append(Spacer(1, 16))
S.append(Rule(CW, pad=8))
S.append(Spacer(1, 4))
S.append(P("<b>Reading the numbers honestly:</b> impressions and clicks per day are each down "
           "slightly against the old site, and average position moved from 13.1 to 20.9. Both are "
           "normal four weeks after a rebuild, and both are better than a typical migration. The "
           "meaningful number is the 48%: nearly half of what the practice earns in Google is "
           "currently landing on a duplicate that converts at a third the rate. That is the "
           "recoverable ground, and the fix is already written.", 9, 13.5, INK))

S.append(PageBreak())

# ---------------------------------------------------------------- page 2
S.append(eyebrow("Where the traffic goes"))
S.append(h1("A site that sends people to the services"))
S.append(body(
    "The site launched August 18, 2026; Vercel Web Analytics began collecting a week later, on "
    "August 25. In the 23 full days measured since, the site drew 409 visitors and 782 pageviews - "
    "and they are not bouncing off the homepage. Provider profiles, IV therapy and the contact page "
    "are the top destinations after the front door.", 12))

S.append(tile_row([
    ("409", "Visitors", "Aug 25 - Sep 16, 2026", GOLD, None),
    ("782", "Pageviews", "1.91 pages per visitor", GOLD, None),
    ("~18", "Visitors per day", "Steady, no decay", GOLD, None),
], CW, 74))

S.append(Spacer(1, 20))
S.append(eyebrow("Most visited pages"))
S.append(Spacer(1, 6))
S.append(data_table(
    ["PAGE", "VISITORS", "PAGEVIEWS"],
    [["Homepage", "139", "169"],
     ["Dr. Marc Matarazzo, MD", "55", "57"],
     ["IV Therapy", "40", "43"],
     ["Contact", "34", "44"],
     ["Medical Weight Loss", "24", "25"],
     ["Dr. Orlando Cedeno, DPM", "23", "34"],
     ["Peptide Therapy", "20", "24"],
     ["About", "19", "23"]],
    [CW * 0.58, CW * 0.21, CW * 0.21],
    aligns=[(1, "RIGHT"), (2, "RIGHT")]))

S.append(Spacer(1, 18))

left = [eyebrow("How they arrive"),
        Spacer(1, 5),
        data_table(["SOURCE", "VISITORS"],
                   [["Direct", "291"], ["Google", "130"], ["Bing", "10"],
                    ["Facebook", "4"], ["Yahoo", "3"], ["ChatGPT", "2"]],
                   [CW * 0.30, CW * 0.16], aligns=[(1, "RIGHT")])]
right = [eyebrow("Device split"),
         Spacer(1, 5),
         data_table(["DEVICE", "VISITORS", "PAGEVIEWS"],
                    [["Desktop", "178", "275"], ["Mobile", "177", "423"],
                     ["Tablet", "16", "18"], ["Unknown", "38", "66"]],
                    [CW * 0.17, CW * 0.15, CW * 0.16],
                    aligns=[(1, "RIGHT"), (2, "RIGHT")])]
two = Table([[left, right]], colWidths=[CW * 0.48, CW * 0.52])
two.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                         ("LEFTPADDING", (0, 0), (-1, -1), 0),
                         ("RIGHTPADDING", (0, 0), (-1, -1), 0)]))
S.append(two)
S.append(Spacer(1, 10))
S.append(P("Mobile visitors go 1.7x deeper than desktop - 423 pageviews from 177 people. The site is "
           "already being read on phones, in waiting rooms and parking lots.", 8.6, 12.5, MUTED))

S.append(PageBreak())

# ---------------------------------------------------------------- page 3
S.append(eyebrow("The opportunity"))
S.append(h1("6,933 impressions earned in four weeks, uncashed"))
S.append(body(
    "Of the 814 queries ranking since launch, 780 are non-branded - people searching for a treatment, "
    "not for RegenOrtho by name. In four weeks those queries produced 6,933 impressions. The practice "
    "is already visible to them. It is visible at position 27 to 42, which is where visibility stops "
    "converting. Closing that gap is the single largest growth lever on the account.", 12))

S.append(eyebrow("Non-branded demand by service line - Aug 18 to Sep 14, 2026"))
S.append(Spacer(1, 10))
S.append(DemandBars(CW, 150, [
    ("Regenerative / stem cell", 2540, 26.9),
    ("IV therapy & infusion",     992, 41.6),
    ("Vein care",                 622, 36.6),
    ("Peptides / weight loss",    502, 33.3),
    ("Hip, shoulder & back",      415, 40.7),
    ("Knee",                      249, 34.0),
    ("Foot & ankle",              109, 29.6),
]))
S.append(Spacer(1, 6))
S.append(P("Bars show search impressions. 'Pos' is the weighted average Google ranking for that group.",
           7.8, 11, MUTED))

S.append(Spacer(1, 18))
S.append(eyebrow("Already winning"))
S.append(Spacer(1, 6))
S.append(data_table(
    ["SEARCH TERM", "GOOGLE RANK", "IMPRESSIONS"],
    [["regen ortho palm beach", "#1", "82"],
     ["stem cell therapy for joints jupiter", "#1.1", "217"],
     ["stem cell therapy jupiter", "#2.7", "198"],
     ["regenortho", "#3.7", "195"],
     ["mako tka", "#3.6", "8"],
     ["orlando cedeno", "#4.9", "39"]],
    [CW * 0.54, CW * 0.23, CW * 0.23],
    aligns=[(1, "RIGHT"), (2, "RIGHT")]))

S.append(Spacer(1, 18))
S.append(Rule(CW, pad=8))
S.append(Spacer(1, 4))
S.append(P("<b>The standout:</b> the single largest finding of this audit is not a keyword. Until "
           "September 17 the site was being served in full on both regenorthopb.com and "
           "www.regenorthopb.com, with no redirect between them. The duplicate absorbed 48% of all "
           "impressions at an average rank of 38.8 and a 0.62% click rate, against the canonical "
           "host's 11.8 and 1.14%. The redirect is now in place. Consolidation typically takes two "
           "to six weeks to show in Search Console.", 9, 13.5, INK))

S.append(PageBreak())

# ---------------------------------------------------------------- page 4
S.append(eyebrow("What happens next"))
S.append(h1("Turning visibility into booked patients"))
S.append(body(
    "The foundation is built and indexed. The next phase converts reach into measurable appointments.", 14))

steps = [
    ("01", "Let the redirect consolidate",
     "The duplicate-host fix ships with this report. Over the next two to six weeks Search Console "
     "impressions on the www copies should fall and reappear on the canonical pages at better "
     "positions. No further action required - but this is the number to watch."),
    ("02", "Close the measurement loop",
     "Add conversion tracking for form submissions and phone calls, and route contact enquiries to a "
     "recorded destination rather than an inbox. Until this exists, no channel can be credited with "
     "a booked patient, and no advertising spend can be judged."),
    ("03", "Buy the service lines that rank low",
     "Vein care, IV therapy, medical weight loss and non-surgical joint pain all show real local "
     "demand at rankings too low to earn clicks. Paid search covers that gap immediately while the "
     "pages climb. Brand terms are worth defending too, though the volume there is modest."),
    ("04", "Point service queries at service pages",
     "Searches for 'jupiter sclerotherapy' and 'jupiter varicose vein' currently surface the Jupiter "
     "location page rather than the vein care page, at ranks 38 to 53. Internal linking and on-page "
     "work should hand those queries to the page that can answer them."),
]
for num, title, txt in steps:
    box = Table([[P(num, 18, 21, GOLD, "Helvetica-Bold"),
                  [P(title, 11.5, 15, NAVY, "Helvetica-Bold", 4), P(txt, 9, 13.2, INK)]]],
                colWidths=[0.70 * inch, CW - 0.70 * inch - 0.26 * inch])
    box.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                             ("LEFTPADDING", (0, 0), (0, 0), 13),
                             ("LEFTPADDING", (1, 0), (1, 0), 0),
                             ("RIGHTPADDING", (0, 0), (-1, -1), 13),
                             ("TOPPADDING", (0, 0), (-1, -1), 11),
                             ("BOTTOMPADDING", (0, 0), (-1, -1), 11),
                             ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                             ("BOX", (0, 0), (-1, -1), 0.75, RULE),
                             ("LINEBEFORE", (0, 0), (0, 0), 3, NAVY)]))
    S.append(KeepTogether([box, Spacer(1, 9)]))

S.append(Spacer(1, 12))
S.append(eyebrow("Scope of this report"))
S.append(Spacer(1, 5))
S.append(P(
    "The site launched August 18, 2026. Search data from Google Search Console for the domain "
    "property regenorthopb.com; the baseline is the old site's last full run of data, January 8 to "
    "March 29, 2026. Search Console recorded no impressions for this domain between March 30 and "
    "August 17 - 141 days - so the two periods are compared as per-day rates rather than totals, and "
    "no like-for-like quarter-over-quarter figure is available. Host-level splits are taken from the "
    "page dimension, which reconciles clicks exactly against Search Console's own totals; impression "
    "shares are apportioned from it. The old site recorded no impressions on the www hostname, so "
    "the duplicate arose with the new site. Traffic data from Vercel Web Analytics, which began "
    "collecting August 25, one week after launch; that first week is unmeasured rather than empty. "
    "Social data from Post Bridge; Google Business Profile engagement is not returned through that "
    "connector and is reported from post counts only. Lead volume is not included: enquiries "
    "currently deliver by email and are not recorded in a countable system. Step 02 resolves this.",
    8.2, 12.2, MUTED))

doc.build(S)
print("wrote", OUT, os.path.getsize(OUT), "bytes")
