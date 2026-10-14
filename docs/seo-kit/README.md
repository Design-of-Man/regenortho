# SEO and growth research kit: START HERE

Everything from the October 2026 takeover research is in this repo. This page says what each file
is, whether it is current, and which file wins when two disagree.

**Order of authority.** When two documents disagree, follow the first one on this list:
1. `CLAUDE.md` (repo rules, Nick's standing decisions)
2. `build.py` (what the site actually ships)
3. The dated audits in `docs/` listed below
4. This kit (`docs/seo-kit/`), which is background and reference

## The current plan and evidence (read these first)

| File | Status | What it is |
|---|---|---|
| `docs/GROWTH-PLAN-2026-10.md` | Current (2026-10-14) | Levers ranked, what the data says, what shipped in the takeover PR, verification, owner actions, questions for Nick, 90-day targets |
| `docs/GSC-DEEP-DIVE-2026-10.md` | Current; re-read 2026-11-11 and 2026-12-09 | Search Console: the five numbers, brand vs non-brand, the rank-tracker caution, striking distance by page, cannibalization, old-URL check, the baseline for the pages PRs #49/#50 rebuilt, dated title changes |
| `docs/LOCAL-AUTHORITY-AUDIT-2026-10.md` | Current; items open until the owner acts | Why non-brand search is thin (not schema), the name collision and inherited listing, every wrong record (NPPES, Healthgrades, Doximity, Jupiter Medical Center, the Google profile), the three brands in Suite 204 and their categories, directories and links |
| `docs/COWORK-LOCAL-FIXES.md` | Ready to run; tasks marked "needs answer first" wait on Nick | Paste-ready Cowork prompt for the third-party fixes. Owner-run, not Code |
| `docs/seo-kit/competitor-teardown-2026-10.md` | Current, with a stated limitation (no geolocated SERP pull) | Title, H1, schema types and word count for the pages that win the physician-name searches and the practices surfacing for the money terms (anonymised) |

## The kit files

| File | Status | What it is |
|---|---|---|
| `docs/seo-kit/scripts/check_schema_visible_match.py` | Tool | Checks every JSON-LD block on a page parses, that FAQ and DefinedTerm content is visible, and that no review markup exists. Run: `python3 docs/seo-kit/scripts/check_schema_visible_match.py glossary.html`. It flags `@id` reference stubs (a node referenced inside another node) as "duplicate @id"; on this site those are expected, not errors |

## Questions that keep coming up

- **Should we add more schema?** No. The site already carries more medical markup than any nearby
  page. Keep it accurate and matched to what each page shows.
- **Should we add city pages?** No. The map pack answers city searches; see CLAUDE.md.
- **Why does "mark matarazzo" have such a low CTR?** Other people share that spelling, and the
  directories rank for the rest. Judge the doctor pages on clicks, not on that one CTR.
- **Can we rewrite the Florida stem cell notice?** No. Statute text, verbatim; placement is the
  attorney's call.
- **Who owns which searches in the suite?** ELITE: orthopedic surgery. Abacoa: podiatry. RegenOrtho:
  non-surgical regenerative care, IV therapy, peptides, medical weight loss. Vein care is an open
  question (growth plan, question 4).

## Facts every file must use

- RegenOrtho Palm Beach, 11380 Prosperity Farms Road, Suite 204-208, Palm Beach Gardens, FL 33410
- 833-783-6561 (833-STEM561), emily@regenorthopb.com (the lead inbox, kept on purpose)
- Hours as published on the site: Mon to Fri 8 AM to 5 PM (the Google profile disagrees on Friday;
  unresolved)
- Dr. Marc Matarazzo, MD, NPI 1083678452, Florida license ME85839. Dr. Orlando Cedeno, DPM,
  NPI 1700076437. Nobody else is on the roster.
- Search Console: `sc-domain:regenorthopb.com`, data from 2026-08-18. GA4: G-2Z542HBXHS. Vercel
  project `prj_bRwdjB3yeI2WrZpm7qwLIAsOIV2q`; report the US-filtered series. Google profile:
  `locations/10759729345634424165`.
