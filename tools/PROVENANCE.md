# Content provenance — RegenOrtho Palm Beach

**Status: resolved. Every page carrying the previous vendor's copy has been rewritten.**

Measured 2026-09-17 against pre-takeover Wayback snapshots of regenorthopb.com
(takeover was 2026-08-18). Method at the end of this file.

## What was found

Nineteen live pages reproduced the previous vendor's copy, nine of them above 85%.
Unlike the Elite rebuild — where the copied content had never shipped — **this was live
and had been since takeover.**

| page | was | now |
|---|---|---|
| `blog/five-pillar-concierge-orthopedic-recovery` | 94.7% | 2.3% |
| `blog/orthopedic-sports-medicine-pain-free-living` | 93.1% | 0.9% |
| `blog/iv-therapy-recovery-wellness` | 92.0% | 0.0% |
| `blog/minimally-invasive-foot-ankle-surgery` | 91.5% | 1.0% |
| `blog/regenerative-medicine-vs-joint-replacement` | 90.7% | 0.7% |
| `blog/prp-therapy-knee-osteoarthritis` | 89.5% | 1.5% |
| `blog/regenerative-medicine-future-of-healing` | 86.6% | 0.3% |
| `blog/healing-without-surgery` | 85.3% | 0.0% |
| `blog/modern-vein-care-varicose-spider-veins` | 85.3% | 0.0% |
| `patient-resources` | 62.7% | 7.8% |
| `providers/dr-marc-matarazzo` | 53.1% | 7.8% |
| `providers/dr-orlando-cedeno` | 44.0% | 5.3% |
| `about` | 34.0% | 1.0% |
| `services/concierge-care` | 29.5% | 3.3% |
| `services/regenerative-medicine-orthobiologics` | 26.0% | 0.6% |
| `services/vein-care` | 26.0% | 4.1% |
| `iv-therapy` | 23.6% | 0.6% |
| `services/advanced-non-surgical-therapies` | 18.6% | 0.0% |
| `contact` | 15.7% | 5.3% |

All rewritten in original wording. Facts, clinical claims, timelines, internal links
and keyword targeting preserved; only the expression changed.

## Two things deliberately left alone

**Doctor credentials.** The provider bios sit at 7.8% and 5.3% and will not go lower,
because most of their remaining overlap is institution names and appointments —
"Lewis Katz School of Medicine at Temple University", "American Board of Foot & Ankle
Surgery", "Assistant Team Physician to the New York Jets". Those are facts. Paraphrasing
them to reduce a similarity score would risk misstating a credential, which is a worse
problem than the one being solved. All 35 credential facts were verified present after
the rewrite.

**Address, hours and service names** on the contact page. Same reasoning.

## A fabrication found along the way, and removed

`blog/regenerative-medicine-future-of-healing` carried three invented patient case
studies — specific ages, diagnoses and outcomes ("returning to sports within 10 weeks",
"cutting recovery time in half"), presented as real patients.

These were unsubstantiated outcome claims for therapies that are not FDA-approved, and
they were live. They violate the facts-discipline rule in CLAUDE.md ("never invent
credentials, statistics, outcomes, or testimonials"). Removed rather than rewritten, and
the post now carries the standard regenerative disclaimer.

A search confirmed the same cases appear nowhere else in this repo. **Worth checking
whether they were also published to Google Business, social, or print.**

## Jupiter Laser was checked too, and is clean

The same comparison was run against pre-takeover snapshots of jupiterlaser.com across
its 17 highest-traffic pages. Worst overlap **3.5%**, median **0.0%** — that site's
content was written from scratch. No action needed.

## Method

For each page, fetch the pre-takeover Wayback snapshot (`/web/<timestamp>id_/<url>`),
strip nav/header/footer/script/style, normalise whitespace and case, and compare sets of
overlapping 8-word runs against the current build.

One trap worth recording: taking the **first** `<main>`/`<article>` match returns ~11
words on Elementor pages whose first `<article>` wraps only the title. That reads as 0%
overlap — indistinguishable from a clean pass, when it is really no data at all. Take the
largest candidate container instead. The first run of this audit reported nine blog posts
as clean for exactly that reason.

Tooling: `/tmp/rw/rocheck.py` at time of writing; the jobs file maps each old URL to its
current equivalent, since most paths changed at the rebuild.
