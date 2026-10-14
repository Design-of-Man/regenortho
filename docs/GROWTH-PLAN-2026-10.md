# RegenOrtho growth audit and plan, October 2026

Written 2026-10-14. Evidence: `docs/GSC-DEEP-DIVE-2026-10.md` (Search Console),
`docs/LOCAL-AUTHORITY-AUDIT-2026-10.md` (NPPES, Google Business Profile, directories, the shared
suite), `docs/seo-kit/competitor-teardown-2026-10.md`. Index of everything: `docs/seo-kit/README.md`.

## 1. Bottom line: the levers, ranked

1. **Google Business Profile categories and reviews.** Three brands share Suite 204 and two of them
   compete with RegenOrtho in Maps (ELITE as "Orthopedic surgeon" and "Sports medicine clinic",
   Abacoa as "Podiatrist"). Only 8 reviews in 12 months. Fixing categories is free and fast; review
   velocity is the slow, compounding lever. Owner and Cowork work, not code.
2. **Physician entity.** "mark matarazzo" is the site's biggest query (5,169 impressions in 28 days,
   position 4.2, CTR 0.46%). Directories win it, and the RegenOrtho and ELITE profiles had nearly the
   same title. This PR splits the identities (ELITE: surgery; RegenOrtho: non-surgical regenerative
   care) and links the two schema nodes. The rest is fixing NPPES and the directories (section 6).
3. **Answer the non-brand questions on the page that already ranks.** 48 non-brand queries sit at
   positions 4 to 20 with zero clicks. The largest real cluster is IV therapy (115 queries, 1,475
   impressions in 90 days) on a page that had not been reworked; this PR adds the "which drip for
   which goal" answer, built from the published menu.
4. **Measure the 2026-10-12 rebuild before touching it again.** PRs #49 and #50 changed most service,
   condition and location pages. The baseline is recorded (deep dive section 6).
5. **Conversion path.** Every "Book" link on the site landed phones about 1,600px above the booking
   form, and the two sticky buttons covered the form's submit button. Both fixed here.

What is NOT a lever: more schema (we already out-mark every nearby page), more city pages (the map
pack answers city intent), a cost guide (only 11 cost-shaped impressions in 90 days; `/pricing`
already exists and is enough).

## 2. What the data says

- **Search Console, 28 days** (2026-09-14 to 10-11 vs 2026-08-17 to 09-13): clicks 143 vs 127,
  impressions 15,455 vs 14,534, CTR 0.93% vs 0.87%, average position 15.1 vs 21.0. Striking-distance
  queries: 48 vs 30.
- **Brand vs non-brand** (query-attributed clicks): 39 brand and 4 non-brand, against 40 and 4 the
  month before. The gap the brief describes is unchanged.
- **Rank-tracker noise:** several templated city-plus-service queries show single-day impression
  spikes and zero clicks over 90 days; non-brand impressions overstate human demand (deep dive
  section 2).
- **Vercel Web Analytics, US only** (2026-09-14 to 10-13): 574 visitors, 1,246 pageviews. Top pages:
  `/` (205 visitors), `/dr-marc-matarazzo-md` (113), `/contact` (70), `/about` (42), `/iv-therapy`
  (41), `/services/peptide-therapy` (40). Singapore and China add 183 more visitors that are crawler
  traffic; they are excluded here. Lead events (US): `appointment_cta` 42, `click_to_call` 10,
  `form_submit` 6 (confirmed deliveries).
- **GA4** (property G-2Z542HBXHS, same window): `appointment_cta` 34, `call_click` 5, `form_submit` 4,
  and **0 key events**: none of the lead events is marked as a key event yet. Channels (US sessions):
  Organic Search 269, Direct 182, AI Assistant 27, Referral 21, Organic Social 11.
- **Google Business Profile:** September 2026 had 273 impressions, 7 calls, 25 website clicks and 49
  direction requests (April: 379, 7, 27, 108). 38 reviews, 4.9 average, 8 in the last 12 months,
  newest 2026-09-08.
- **Old and doorway URLs:** all 138 URLs that earned an impression in 90 days, and all 14 links from
  ivclinicpalmbeach.com (both `%E2%81%BA` and `%e2%81%ba` encodings, apex and `www`), end on a 200.
  `www` returns 308 to the apex.

## 3. Shipped in this PR

| Change | Pages | Why (data) |
|---|---|---|
| "Which IV drip is right for my goal?" section with a goal / drip / price / ingredients table, generated from `IV_MENU` (`IV_GOALS` in build.py) | `/iv-therapy` | 115 goal-shaped IV queries, 1,475 impressions, 0 clicks in 90 days; the page listed drips but never mapped them to goals. Every row restates the published menu. |
| Physician schema: Person type, `alternateName` (legal name per NPPES), NPI plus Florida license ME85839 (Dr. Matarazzo) shown on the page and in `identifier`, `worksFor` linking each doctor to his sister practice's org node, `sameAs` adds the sister-site physician pages, Stryker and Jupiter Medical Center; `jobTitle` no longer carries a literal `&amp;` | both doctor profiles | Entity consolidation for the name searches; each URL fetched and checked 2026-10-14 |
| Doctor titles and descriptions split from the sister practices (dates in the deep dive, section 7) | both doctor profiles | RegenOrtho's Matarazzo title was near-identical to ELITE's; Cedeno's sold podiatry, which the repo assigns to Abacoa |
| Contextual links from each doctor's credentials card to his own practice's physician page | both doctor profiles | Makes the ELITE / Abacoa relationship visible, matching the schema |
| `#book` moved from the contact section to the form's own heading | every page (all "Book" links point to `contact#book`) | At 393px the form started 1,635px down the page; every booking link landed above the contact details, not the form |
| Sticky Call pill and assistant launcher fade out while a form's submit button is on screen (neither moves) | every page with a form | At 393px both covered "Book Appointment" when it sat at the bottom of the screen |
| Confirmed leads also sent to GA4 as `generate_lead` | site-wide (main.js) | GA4's enhanced measurement fires its own `form_submit` on every submit attempt, so the GA4 `form_submit` count mixes confirmed and failed sends. `generate_lead` fires only after FormSubmit confirms delivery. Vercel unchanged. |
| Patient glossary, 24 terms, `DefinedTermSet` generated from the same list as the visible page; Florida notice and the regenerative disclaimer shown verbatim | new `/glossary`, linked from `/patient-resources` and `llms.txt` | No glossary existed; definitions restate the site's own copy |
| Three redirects to jupiterlaser.com now point at the final URL | `vercel.json` | One three-hop chain found |
| `docs/` evidence and plan; `docs/seo-kit/scripts/check_schema_visible_match.py` | | |

Not changed, deliberately: statute text, `/forms/*`, the lead inbox address, any page rebuilt in
#49/#50 other than the two doctor profiles, prices (none added), the hours (conflict unresolved).

## 4. Verification (Phase 6)

- `python3 build.py`: clean. Every JSON-LD block on every page parses.
- Schema visible-match (`docs/seo-kit/scripts/check_schema_visible_match.py`) on all pages: the
  glossary and both doctor pages pass. 15 pages flag the same pre-existing pattern (an org or
  service node referenced by `@id` inside another node); those are reference stubs, present before
  this PR, and not errors.
- axe (WCAG 2.0/2.1/2.2 A and AA) at 393px and 1440px on 15 pages (home, IV, both doctors, peptide,
  exosome, vein hub, weight loss, knee pain, contact, pricing, about, a location, glossary, patient
  resources): **0 violations before, 0 after**, no JS errors, no horizontal overflow.
- Conversion checks at 393px: `contact#book` now lands with the form heading at the top of the
  screen; with the submit button in view, both sticky buttons are hidden; scrolled away, both return.
- Lighthouse mobile: see the PR body (median of three runs per page, before vs after, local static
  server; lab numbers on a shared sandbox vary by 20+ points run to run, so read the medians).

## 5. Owner actions (no code), in order

1. **GA4: mark `generate_lead`, `call_click` and `appointment_cta` as key events** (Admin, Events).
   Optionally turn off Enhanced measurement, "Form interactions", so the automatic `form_submit`
   stops muddying the custom one.
2. **Google Business Profile categories**: proposal approved 2026-10-14. Run
   `docs/COWORK-LOCAL-FIXES.md` task 1 to apply it.
3. **Confirm Friday hours** (profile says 2 PM, site says 5 PM), IVIG (offered or not), the
   "Black-owned" and "Veteran-owned" attributes, and Suite "204" vs "204-208".
4. **Ask for reviews** from every satisfied patient, using the profile link. No incentives.
5. **Dr. Matarazzo**: update NPPES (closed Jupiter office is still his primary location; PBG missing;
   fax equals phone), claim Healthgrades and Doximity, and ask Jupiter Medical Center to update his
   office. Coordinate with ELITE, which owns his listings.
6. **Dr. Cedeno**: update NPPES (dead 561-624-4800 phone; PBG office missing; last updated 2021) and
   Healthgrades.

## 6. Questions for Nick

1. **Billing entity.** NPPES has no organization NPI for RegenOrtho (no "REGEN*" NPI-2 in Florida,
   nothing at Suite 204 to 208). Which entity bills for RegenOrtho services, under which NPI? Two
   "ORTHO FLORIDA, LLC" organization NPIs carry ELITE's phone at ELITE's Port St. Lucie suite and
   the closed Jupiter office; is that ELITE's billing entity?
2. **Friday hours:** 2 PM (Google) or 5 PM (site)?
3. **Dr. Cedeno's directory profiles:** should Healthgrades and NPPES show Abacoa, RegenOrtho or
   both, and which phone?
4. **Vein care in Maps:** Abacoa's name is "Leg Vein Center" and RegenOrtho also sells vein care.
   Which brand should own vein searches?
5. **IVIG:** offered or not? The Google profile still lists it.
6. **"Black-owned" and "Veteran-owned"** attributes on the Google profile: accurate?
7. **GLP-1 microdosing** (154 impressions in 90 days at position 17) and **epithalon / thymosin /
   TB-500 detail**: does the practice offer microdosing, and will it sign off on a fuller paragraph
   per peptide? Until then, nothing is added.
8. **Disambiguation line:** add "RegenOrtho Palm Beach has one office, in Palm Beach Gardens" near
   the footer address? (An unrelated practice with a similar name operates in West Palm Beach.)
9. **Florida notice placement:** the statute notice renders on the six regenerative pages and now on
   the glossary (which defines stem cell terms). It does not render on the homepage, which names
   stem cell therapy in its title, or on `/pricing`, which publishes its price. Attorney's call whether they need it.
10. **Rank tracker:** is any tool (ours or a past agency's) still rank-checking this domain? Its
    queries inflate non-brand impressions.
11. **info@regenorthopb.com** is published on ivclinicpalmbeach.com. Does that inbox exist?

## 7. Next 90 days and how we will know

| Measure | Now (2026-09-14 to 10-11) | Target by 2027-01-15 | Source |
|---|---|---|---|
| Non-brand query-attributed clicks per 28 days | 4 | 15 | GSC, brand regex above |
| Striking-distance queries with at least 1 click | 0 of 48 | 8 | GSC |
| `/iv-therapy` average position on IV goal queries | ~17 to 20 | under 12 | GSC, deep dive section 3 |
| GBP reviews in the trailing 12 months | 8 | 20 | Windsor `google_my_business` |
| GBP calls per month | 7 (September) | 15 | Windsor |
| Confirmed leads (`generate_lead` in GA4, `form_submit` in Vercel) per 28 days | 6 (Vercel, US) | 12 | Vercel / GA4 |

Re-read dates: 2026-11-11 (four weeks) and 2026-12-09 (eight weeks), per the deep dive.

## 8. Guardrails

No invented facts, prices, reviews or credentials; schema only for what a page shows; no review or
AggregateRating markup; no `reviewedBy`; no new city or doorway pages; statute text verbatim; no
analytics on `/forms/*`; payloads carry placement and path only; never name or report another
practice; DNS, Google Ads, GBP, NPPES and directories are changed only by the owner or the Cowork
task, never by us.
