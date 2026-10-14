# Search Console deep dive, October 2026

Property: `sc-domain:regenorthopb.com` (the domain property; it includes the old `www` host).
Pulled 2026-10-14 with `gsc.py` (service account `claude-gsc-reader@designofman-seo`).
Search Console data for this property starts on 2026-08-18, so the "previous" window below is
really 27 days, and its first four weeks include the period when `www` still served the whole
site as a live duplicate (fixed 2026-09-17, see CLAUDE.md).

Windows used throughout (non-overlapping, ending three days back for the data lag):

| Window | Dates |
|---|---|
| Current 28 days | 2026-09-14 to 2026-10-11 |
| Previous 28 days | 2026-08-17 to 2026-09-13 |
| 90 days (query and page detail) | 2026-07-14 to 2026-10-11 |

## The five numbers

| Metric | Previous 28 days | Current 28 days | Change |
|---|---|---|---|
| Clicks | 127 | 143 | +16 (+13%) |
| Impressions | 14,534 | 15,455 | +921 (+6%) |
| CTR | 0.87% | 0.93% | +0.05 pp |
| Average position | 21.0 | 15.1 | 5.9 places better |
| Striking-distance queries (definition below) | 30 | 48 | +18 |

Totals come from the zero-dimension query (the true total), never from the query table.

**Striking distance**, as counted here: average position 4 to 20 in the window, 10 or more
impressions, not a brand query (regex below), and not another practice's name. All 48 current
striking-distance queries had **zero clicks**.

Brand regex: `matarazzo|cedeno|cedano|cedeño|regen ?ortho|bahnick|prosperity farms`. Queries naming
other practices are excluded from both brand and non-brand counts and are not listed in this
document (house rule: we do not name other practices).

## 1. Brand vs non-brand: the gap is real and unchanged

| Window | Query-attributed clicks | Brand | Non-brand | Brand impressions | Non-brand impressions |
|---|---|---|---|---|---|
| Previous 28 days | 44 | 40 | 4 | 5,150 | 6,687 |
| Current 28 days | 43 | 39 | 4 | 5,848 | 6,632 |

About 100 of the 143 clicks carry no query (Google anonymises rare queries), so the split above
covers the attributable third. Within it, non-brand search earns about one click a week. PRs #49
and #50 (2026-10-12) changed most service, condition and location pages two days before this
pull; their effect will not show for 2 to 6 weeks. **Section 6 is the baseline to measure them
against.**

The single largest query is **"mark matarazzo"**: 5,169 impressions, position 4.2, CTR 0.46% in
the current window, landing on `/dr-marc-matarazzo-md`. The CTR is far below what position 4
normally earns. Two causes, both outside this site: several other people share the "Mark"
spelling, and the searchers who do want this doctor are shown his Healthgrades, Doximity,
Stryker and hospital profiles first (see `docs/LOCAL-AUTHORITY-AUDIT-2026-10.md`). Until
2026-10-14 this page's title was nearly identical to his own surgical practice's profile at
elitesportsmed.org, so the two sister sites were also competing for the same result.

## 2. A caution about non-brand impressions

Many non-brand queries look machine-generated: city plus service in a fixed template ("palm beach
gardens endovenous ablation", "stem cell exosome pain management royal palm beach"), steady
impressions most days, desktop-heavy, and zero clicks over 90 days. That is the footprint of
rank-tracking software, not patients. Six query-days are unambiguous single-day spikes (742
impressions in 90 days, for example "stem cell therapy for joints jupiter": 217 impressions on
2026-09-02 and 2 on every other day). Those six spikes put 519 impressions in the previous window
and 223 in the current one.

What this changes:
- **Do not read "position 1, zero clicks" on those queries as a CTR problem.** PR #49 retitled the
  homepage partly because "stem cell therapy jupiter" showed 0 clicks from 187 impressions; 187 of
  its 215 impressions in 90 days fell on a single day. The retitle does no harm, but that number
  was not human demand.
- Question for Nick: is a rank tracker (ours, or a previous agency's) still checking this domain?

## 3. Striking distance, by the page that owns it (current 28 days)

| Topic | Queries | Impressions | Typical position | Page that ranks | Changed in #49/#50? | Action this PR |
|---|---|---|---|---|---|---|
| IV therapy (recovery, hydration, hangover, energy, drips) | 11 | about 300 | 10 to 19 | `/iv-therapy` | Only the Emily removal | **Deepened** (section 5) |
| Vein care (microphlebectomy, endovenous ablation, cosmetic vein) | 7 | about 320 | 6 to 18 | vein hub and sub-pages | Yes, heavily | Baseline only |
| Regenerative orthopedics / regenerative medicine + town | 6 | about 260 | 8 to 20 | `/our-services`, home | Yes | Baseline only |
| Exosome / stem cell + pain management | 1 | 90 | 15 | `/services/exosome-therapy` | Yes | Baseline only |
| GLP-1 microdosing and GLP-1 + town | 2 | 77 | 17 | `/services/medical-weight-loss` | Yes | None: the page does not publish microdosing and we will not add a service the practice has not confirmed (question for Nick) |
| Peptides by compound + PBG (tesamorelin, GHK-Cu, thymosin alpha-1, TB-500, CJC-1295/ipamorelin, epitalon) | 8 | about 120 | 4 to 14 | `/services/peptide-therapy` and the per-compound pages | Yes | None. Most of these compounds (TB-500, thymosin, CJC-1295/ipamorelin, epithalon, GHK-Cu, tesamorelin) are already named on `/services/peptide-therapy` or have their own page, and rank 4 to 14. A fuller section per compound would be new clinical copy (several are not FDA-approved), so it waits for the practice's sign-off (question for Nick) |
| IVIG / immunoglobulin | 5 | about 150 | 10 to 14 | old WordPress URL (301 to `/iv-therapy`) | Redirect fixed in #49 | None: IVIG is not on the current menu (CLAUDE.md) |
| Out-of-area (California tesamorelin queries) | 3 | 94 | 4 to 7 | `/services/tesamorelin` | | None, cannot convert |

## 4. Cannibalization

- **IV queries split between `/iv-therapy` and two blog posts** (90 days, IV queries only):
  `/iv-therapy` 647 impressions at 19.9, `/blog/iv-therapy-recovery-wellness` 580 at 29.6,
  `/blog/iv-hydration-in-palm-beach-gardens-...` 66 at 10.4. Fifteen queries put impressions on
  both the service page and a post. Both posts already link to `/iv-therapy`; the goal table shipped
  in this PR gives the service page the answer the queries ask for. Re-check at the next pull; if
  the recovery post still outranks the service page for "iv therapy for recovery palm beach
  gardens", add a sentence-level link from the post to `/iv-therapy#by-goal`.
- **Endovenous ablation** splits between the vein hub and `/services/endovenous-ablation`
  (90 days: 69 vs 55 impressions for "palm beach gardens endovenous ablation"). Both pages were
  rebuilt on 2026-10-12; measure before touching.

## 5. Old URLs still collecting impressions

Every page URL that earned an impression in the last 90 days (138 URLs, `www` and apex, old
WordPress paths included) was followed to its final status on 2026-10-14: **all 138 end on a 200**.
`www` URLs still carry 3,531 of the 17,142 page-table impressions in the current window (they 308
to the apex since 2026-09-17; Google is still recrawling them). One chain was three hops because
the destination on jupiterlaser.com itself redirects; the three `vercel.json` rules pointing there
now name the final URL.

The 14 links into this site from the old ivclinicpalmbeach.com page (including both encodings of
`/nad%E2%81%BA-500-mg/`) were checked the same way, on the apex and on `www`: all 14 resolve to a
200 on `/iv-therapy`, `/dr-marc-matarazzo-md` or `/dr-orlando-cedeno-dpm`.

## 6. Baseline for the pages PRs #49 and #50 changed (current 28 days, `www` and apex merged)

| Page | Clicks | Impressions | Avg position |
|---|---|---|---|
| `/dr-marc-matarazzo-md` | 42 | 5,916 | 4.6 |
| `/` | 49 | 2,785 | 22.6 |
| `/services/ghk-cu` | 3 | 548 | 9.5 |
| `/our-services` | 4 | 524 | 23.0 |
| `/dr-orlando-cedeno-dpm` | 10 | 470 | 5.3 |
| `/our-services/vein-care-medical-cosmetic` | 1 | 419 | 32.4 |
| `/locations/jupiter.html` | 0 | 397 | 42.5 |
| `/iv-therapy` | 3 | 370 | 17.0 |
| `/services/medical-weight-loss` | 2 | 353 | 26.1 |
| `/services/tesamorelin` | 1 | 221 | 10.6 |
| `/services/regenerative-medicine-orthobiologics` | 2 | 194 | 31.9 |
| `/locations/west-palm-beach.html` | 0 | 194 | 37.5 |
| `/services/microphlebectomy` | 0 | 185 | 30.4 |
| `/services/peptide-therapy` | 1 | 177 | 13.6 |
| `/services/exosome-therapy` | 1 | 148 | 23.3 |
| `/conditions/varicose-spider-veins.html` | 0 | 148 | 64.3 |
| `/locations/north-palm-beach.html` | 0 | 143 | 39.3 |
| `/conditions/shoulder-pain.html` | 0 | 133 | 50.0 |
| `/services/endovenous-ablation` | 0 | 100 | 23.8 |
| `/conditions/knee-pain.html` | 1 | 74 | 19.7 |

## 7. Title and description changes made in this PR (dated, so the next pull can measure them)

| Date | Page | Old title | New title | Why |
|---|---|---|---|---|
| 2026-10-14 | `/dr-marc-matarazzo-md` | Dr. Marc Matarazzo, MD \| Orthopedic Surgeon, Palm Beach Gardens | Dr. Marc Matarazzo, MD \| Regenerative Care, Palm Beach Gardens | Nearly identical to his surgical profile on elitesportsmed.org; Elite owns his surgical identity, this site his non-surgical care |
| 2026-10-14 | `/dr-orlando-cedeno-dpm` | Dr. Orlando Cedeno DPM \| Podiatrist Palm Beach Gardens | Dr. Orlando Cedeno, DPM \| Vein Care, Palm Beach Gardens | Podiatry is Abacoa Podiatry's territory (see `REGEN_TREATS` note in build.py); the old description sold foot surgery and orthotics |
| 2026-10-14 | `/glossary` (new) | | Regenerative Medicine Glossary \| PRP, Exosomes, Peptides | New page |

Both doctor descriptions were rewritten to match. `/iv-therapy` kept its title; it gained content.

## What to re-read, and when

- **2026-11-11** (four weeks after #49/#50 and this PR): rerun `gsc.py compare --days 28`, section 3
  and the section 6 table. Expect `/iv-therapy` IV queries to move first.
- **2026-12-09**: the 8-week read on the #49/#50 pages and the two doctor titles. Judge the doctor
  pages on clicks per name query, not on "mark matarazzo" CTR alone (section 1).
- Commands: `python3 /root/.claude/skills/search-console/scripts/gsc.py compare --property regenortho --days 28`
  and `... raw --property regenortho --dimensions query,page --days 90 --json`.
