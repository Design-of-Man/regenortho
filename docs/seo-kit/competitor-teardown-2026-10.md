# Competitor teardown, 2026-10-14

Raw HTML of each page below was pulled on 2026-10-14 and parsed for title, H1, JSON-LD types
(deduplicated) and visible word count. The raw HTML is third-party content and is not committed.
Conclusions and actions are in `docs/LOCAL-AUTHORITY-AUDIT-2026-10.md` and
`docs/GROWTH-PLAN-2026-10.md`.

**House rule:** other practices are not named in this repo. They appear as Practice A, B, C with a
description of what they are. Directories and hospitals are named, because they are where the
citation fixes happen.

**Limitation, stated plainly:** no geolocated Google results page could be pulled this session (the
scraping account was out of credits and the sandbox cannot run a Maps query). The practice pages
below are the ones that surfaced for our money terms in a general web search, plus the pages that
outrank Dr. Matarazzo's profile for his own name. Re-run with a real local SERP pull before
drawing ranking conclusions from this table.

## Pages that win the physician-name searches ("mark matarazzo", "marc matarazzo")

| Page | Title tag | H1 | JSON-LD types | Words | Notes |
|---|---|---|---|---|---|
| Healthgrades profile | Dr. Marc Matarazzo, MD - Orthopedic Surgeon in Jupiter, FL \| Healthgrades | Dr. Marc Matarazzo, MD | IndividualPhysician, Person, MedicalClinic, Hospital, MedicalWebPage, AggregateRating, Review, BreadcrumbList | ~3,700 | Shows 160 ratings (4.7). Lists his city as Jupiter and a former group's phone first. |
| Doximity profile | Dr. Marc Matarazzo, MD – Palm Beach Gardens, FL \| Orthopaedic Surgery | Marc Francis Matarazzo MD | Person, ProfilePage | ~720 | Uses his legal name. Still says employed by a former group since 2022. Fax equals phone (copied from NPPES). |
| Stryker surgeon locator | Dr. Marc F. Matarazzo \| Palm Beach Gardens, FL Orthopaedic Surgeon \| Knee, Robotic-Arm Ass… | Marc F. Matarazzo, M.D. | (unparseable) | ~1,240 | Surgical (MAKO) identity. |
| Jupiter Medical Center directory | (blocked to the sandbox; read via fetch tool) | Marc Matarazzo, MD | n/a | n/a | Lists the CLOSED Jupiter office (108 Intracoastal Pointe Dr). |
| elitesportsmed.org/marc-f-matarazzo/ (sister site) | Marc Matarazzo, MD \| Orthopedic Surgeon, Palm Beach Gardens | Marc F. Matarazzo, MD | Physician (#physician), EducationalOccupationalCredential, Organization, WebPage, BreadcrumbList, SpeakableSpecification | ~610 | The canonical physician node. |
| **Ours before this PR**: /dr-marc-matarazzo-md | Dr. Marc Matarazzo, MD \| Orthopedic Surgeon, Palm Beach Gardens | Dr. Marc Matarazzo, MD | Physician, MedicalClinic org graph, BreadcrumbList | ~600 | Title near-identical to the Elite page above. |

Reading it: the directories win on review count shown (Healthgrades 160) and on being the place
people expect a doctor lookup to land. We will not out-review Healthgrades on our own page and must
not add review markup. What we can do is (1) stop competing with Elite for the surgical result,
(2) tie our node to his canonical one with `sameAs` and `worksFor`, and (3) get the directories'
wrong city, phone and practice fixed so they reinforce, rather than contradict, the two sites. All
three are in this PR or its owner actions.

## Practices surfacing for our money terms

| Practice (anonymised) | Page | Title tag | H1 | JSON-LD types | Words | Reviews shown on page |
|---|---|---|---|---|---|---|
| Practice A: national IV-hydration franchise, Palm Beach Gardens location | location page | Best IV Therapy In Palm Beach Gardens, FL - (brand) | IV Therapy in Palm Beach Gardens, FL | Organization, WebPage, WebSite, BreadcrumbList, SearchAction | ~3,400 | none |
| Practice B: weight-loss and hormone center, Palm Beach Gardens | home | Weight Loss Center Palm Beach Gardens, Florida \| (brand) | Weight Loss Center | WebSite, SearchAction | ~1,750 | none |
| Practice B | hormone therapy page | Bioidentical Hormone Therapy in Palm Beach Gardens, Florida | Bioidentical Hormone Therapy in Palm Beach Gardens | WebSite, SearchAction | ~700 | none |
| Practice C: headache and pain center, Palm Beach Gardens | home | Home - (brand) | (a news headline) | none | ~1,100 | none |

## What we ship, for comparison

MedicalClinic + MedicalBusiness org node (address, geo, hours, areaServed, sameAs); Physician +
Person per doctor with NPI and verified sameAs (this PR adds the sister-site physician pages, the
legal name as alternateName and the license where verified); MedicalTherapy per service with
OfferCatalog where a price is published; MedicalCondition per condition; FAQPage from visible lists;
DefinedTermSet (glossary, this PR); BreadcrumbList; SpeakableSpecification. No review markup,
deliberately.

## Reading it

1. **Schema is not the gap.** None of these practices carries a medical entity type at all; we
   carry more than all of them combined. Keep the markup accurate and matched to the page; do not
   spend more time on it to win rankings.
2. **The IV franchise page is long (about 3,400 words) and answers goal-by-goal.** Ours listed
   twelve drips but never said which one is for recovery, hydration or a hangover, which is how
   the queries are phrased (`docs/GSC-DEEP-DIVE-2026-10.md` section 3). This PR adds that answer
   from our own published menu. We should not chase its word count with filler.
3. **Their titles front-load the town they are in, and they are in it.** Ours already do the same
   for Palm Beach Gardens. We do not do it for towns without an office (no new city pages).
4. **The off-page levers decide the map pack:** review count and recency, correct directory data,
   and GBP categories that do not compete with the two sister practices in the same suite. Those
   are in the local authority audit.
