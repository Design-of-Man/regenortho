# RegenOrtho Palm Beach — Website (regenorthopb.com)

Static site, 56 pages, generated — do not edit HTML files directly.

## Architecture
- **`build.py`** is the single source of truth: all page content, services, team, conditions,
  locations, IV menu/pricing, FAQs, testimonials. Edit it, run `python3 build.py` (from this
  directory) to regenerate every page in place. `blog_content.py` holds blog post bodies.
- Fonts are SELF-HOSTED in assets/fonts/ (Fraunces + Manrope variable woff2, @font-face at
  the top of styles.css, preloads in head()) — do not add Google Fonts links.
- All CSS/JS links carry build-time content-hash cache-busters (`asset_v()` in build.py) —
  never link an asset without one.
- `assets/css/styles.css` — design system: navy #092D5C + gold #FDC929 (from the logo),
  porcelain #F9F7F2, bronze text accent #74590A (AA on porcelain — don't lighten).
  Signature elements: the CSS-animated golden-hour coastline hero (a real <video> can drop
  into .hero-video-slot as assets/video/hero-beach.mp4 + hero-poster.jpg — slot + CSS are
  ready, just uncomment the snippet in build.py), the detailed skeletal anatomy section
  (#body-map — skull/ribs/spine/pelvis/capsules generated in figure_svg(), draws in on
  scroll, interactive labeled nodes), aurora gradients, orbit rings + scan line, social
  marquee, gold outlined numerals.
- `assets/js/main.js` — nav (Escape closes; matchMedia 1100px must stay in sync with the
  CSS breakpoint), reveals, counters, seamless marquees (children cloned once; per-item
  margins, NOT flex gap), quote rotator, figure attract cycle, FAQ filter/search.
- MOBILE ASSISTANT (iOS): on <=600px the panel is a full sheet pinned to the
  VISUAL viewport — assist.js sets --rga-h/--rga-top from window.visualViewport
  on its resize+scroll events. iOS does NOT shrink the layout viewport for the
  keyboard, so a position:fixed panel anchored to bottom lands behind it and you
  can't see what you're typing; dvh does not help (it tracks browser chrome, not
  the keyboard). Body gets .rga-locked (position:fixed + top:-scrollY) while
  open or the background drifts underneath; the restore forces
  scroll-behavior:auto because the site's global smooth scrolling turns
  scrollTo() into an animation that lands elsewhere. Panel z-index is 95 — it
  must outrank the fixed site header (90) now that the sheet starts at top:0.
- `assets/js/assist.js` — concierge assistant. SET ANSWERS only (FAQ array) — no AI, no
  external API, no medical advice; route unknowns to 833-783-6561. Leads deliver via
  FormSubmit (formsubmit.co/ajax/info@regenorthopalmbeach.com) with a localStorage retry queue.
  Never put secret keys in it.

## Business facts (canonical)
- RegenOrtho Palm Beach · "The Regeneration of Orthopedics"
- 11380 Prosperity Farms Road, Suite 204–208, Palm Beach Gardens, FL 33410
- 833-STEM561 = 833-783-6561 · info@regenorthopalmbeach.com · Mon–Fri 8 AM–5 PM
- Instagram: @regenortho_palmbeach (only real social profile — X/YouTube don't exist)
- Dr. Marc Matarazzo, MD (ortho/sports medicine, MAKO-certified) · Dr. Orlando Cedeno, DPM
  (podiatric surgery + vein) · Dr. Michael Carpino (concierge provider) · Emily Bahnick,
  MSN, RN (IV infusion nurse)
- Palm Beach Gardens deliberately has NO location page — the homepage owns that keyword;
  8 nearby cities have /locations/ pages, linked in the header dropdown + footer.

## CSS gotchas (inherited from hard-won experience — don't reintroduce)
- Header backdrop-filter becomes the containing block for fixed descendants: keep the
  `body.nav-locked .site-header { backdrop-filter: none }` override or the mobile menu
  clips to the header box (iOS + Chromium).
- Desktop dropdowns use translateX(-50%); mobile keeps a `transform: none` override.
- Mobile menu: `justify-content: flex-start` + `overscroll-behavior: contain` (centered
  flex clips the top of an overflowing list unreachably).
- Marquees: spacing via per-item margins; content cloned once in JS for the -50% loop.
- Mobile Call Now pill is fixed bottom-LEFT; the assistant launcher owns bottom-right.
  Don't move either.

## The homepage figure
`aura.py` renders it: a luminous human form built from soft masses (head, trunk,
arms, legs) under a blur + bloom, with gold treatment points and drifting light
threads between them. It replaced an anatomically-correct skeleton — that read as
clinical beside an IV lounge and a peptide menu, which is the wrong half of this
practice's identity. Do not put anatomy back without asking.

`figure.py` is now the geometry source: the LANDMARKS block drives the aura form,
the hotspots and the label leaders together. Its skeleton/muscle renderers are
retained but unused — keep the landmarks if you delete them.

Two traps that cost real time here:
- `auBody` MUST stay `gradientUnits="userSpaceOnUse"`. The objectBoundingBox
  default maps a fresh gradient onto every shape, so head, torso and each limb
  light separately and the body breaks into seamed parts.
- The arm masses deliberately overlap the trunk. Drawn clear of it, the gap shows
  background through the lit figure as a hard black void.

## Hero video (do not regress)
Source of truth: "Juno.MP4" in the Dropbox /kashuba folder — 2688×1512@59.94,
15.65s drone shot of the Juno Beach Pier. Native camera resolution: there is NO
true-4K master; never upscale past 2688. ALWAYS re-encode from this master via a
GitHub Actions relay (sandbox can't reach Dropbox and has no ffmpeg).

Pipeline (per-frame luma analysis drove every number): the drone's auto-exposure
dips to Y=110 while crossing the dark pier (7-8.5s) then snaps +24 at 9.0s; the
APPROACH (0-6.5s, pier front and centre) is stable Y 126-130 and the post-pier
glide (9.6-15.65s) is stable Y 134-140. The loop keeps the pier by hiding the
snap inside a deliberate dissolve — three branches, all setpts/0.8 then fps=30
(xfade needs CFR):
  A trim 1.0:8.2   pier approach          -> 9.0s slowed
  B trim 9.6:15.65 post-pier glide        -> 7.5625s
  C trim 0.55:1.15 wrap stub              -> 0.75s
  xfade A->B 1.2s @ 7.8 (hides the AE snap), xfade ->C 0.6s @ 14.7625
  = 15.5s loop whose wrap lands 0.15s from restart.
Grade baked in: eq=gamma=1.12:brightness=0.02:saturation=1.12 (gamma-led, no
sand clipping; lifts the pier-shadow dip most). Encode: libx264 veryslow, -g 60,
faststart, bt709 tags, no audio. Poster: -ss 1.6 of juno-hd = pier mid-approach.
NOTE: .scene-fronds (a CSS palm silhouette from the old hand-drawn hero) used to
paint OVER the video at z-index 3 — removed; do not re-add decorations above
.hero-video-slot.

Renditions in assets/video/ (all crf/preset as noted, single generation):
  juno-max.mp4     2688×1512 crf22  ~28MB  — screens ≥2200 effective px
  juno-hd.mp4      1920×1080 crf21  ~17MB  — desktop default
  juno-hd.webm     2560×1440 VP9    ~21MB  — no-H.264 fallback
  juno-mobile.mp4  1280×720  crf24  ~5.3MB — phones (<768px)
  juno-mobile.webm 1280×720  VP9    ~4.7MB
  juno-poster.jpg  1600×900 from the GRADED loop, so it matches frame one
PORTRAIT PHONES get their own 9:16 crop: crop=850:1512:919:0 from the master,
crf 25 (~5.9MB) + VP9 twin + its own poster. Why: .hero is 92vh and the video is
object-fit:cover, so a 1280×720 LANDSCAPE file covering a 393×930 portrait hero
was scaled 2.9× AND lost 68% of the frame — that was the "extremely blurry"
report. The crop drops it to 1.85×, which is the physical ceiling (master is only
1512 tall; 3 × 930 CSS px = 2790 device px wanted). Going below 1.85× needs a
shorter mobile hero, not a better encode.
The max tier is gated on window.innerWidth >= 1200 AS WELL AS dpr*width >= 2200 —
a landscape phone is 852px at DPR 3 = 2556 and was being shipped the 28MB file.
The <video> ships with NO <source> children and preload="none"; main.js attaches
ONE rendition pair via matchMedia, mp4 before webm; nothing downloads under
reduced-motion or Save-Data. .hero-video-scrim stays LIGHT (desktop .34→0 across,
mobile .2/.16/.3) — the client asked twice for a bright hero; legibility comes
from the text shadow. The marquee under the hero keeps its flat rgba(4,16,31,.72)
band (flat fill, NOT backdrop-filter — compositing cost over playing video). The
CSS coastline scene stays underneath as the no-video fallback. asset_v() returns
"pending" for missing files so builds work before renditions land.

## SEO — keep maximized
- Org node: MedicalClinic+MedicalBusiness @id https://www.regenorthopb.com/#organization.
  Per page: Physician (providers), MedicalTherapy (services), MedicalCondition (conditions),
  FAQPage (faq + service/condition pages), Service-per-city (locations), BlogPosting (posts),
  BreadcrumbList (interior). sitemap.xml/robots.txt/llms.txt regenerate on build.
- The homepage canonical is the ROOT (`canonical=""` -> https://www.regenorthopb.com/), not
  /index.html, and the sitemap emits the root to match. Inbound links, GBP and the social
  profiles all point at the root — canonicalising to /index.html consolidates the wrong way.
  If you ever change one of the two, change both or they contradict each other.
- `page_lastmod()` derives per-page dates from the last commit that touched the file (one
  `git log` walk, cached). It feeds sitemap <lastmod>, WebPage.dateModified and
  BlogPosting.dateModified. Do NOT put SITE_UPDATED back in those three places — a sitewide
  frozen constant is noise Google learns to discount. It falls back to SITE_UPDATED outside
  a git checkout, so the build still works from a tarball. Known and harmless: a page's date
  comes from its LAST commit, so the build that introduces a change still emits the previous
  date; the next build after committing picks up the new one. Don't "fix" this by stamping
  today's date at build time — that makes every page look changed on every build.
- Clinical pages (services, conditions, infusions, IV) pass `webpage_type="MedicalWebPage"`;
  pages built on `page_hero()` pass `speakable=True` (selectors `.page-hero h1` /
  `.page-hero .lede` — if you rename either class, update the SpeakableSpecification).
- DELIBERATE: no aggregateRating in our own schema (Google guideline). Do not add.
- DELIBERATE: no `reviewedBy` / `lastReviewed` on MedicalWebPage. Both assert that a named
  clinician vetted the page for accuracy; that sign-off does not exist on record. Add them
  only when the practice names a reviewer and a real review date — not from a build script.
- Prices in schema come from `SERVICE_FROM_PRICE` (the two services that publish a "from"
  price) and `IV_MENU` (the 12-item OfferCatalog). Never add an offer for a service that
  does not publish a price on the page — an invented price is a fact violation and a
  structured-data penalty.
- New pages: unique title (~50–60 chars, keyword + city front-loaded), desc (~150–160),
  canonical, entry in build_meta() pages list.
- Condition page H2s are deliberately QUESTION-SHAPED ("What are my options for knee
  pain?", "How do we treat knee pain?") — AI engines retrieve passages under the heading
  matching how the question was asked, and the old "Understanding X"/"How we treat it"/
  "Sound familiar?" matched nothing anyone types. Keep them phrased as questions and keep
  the condition name in each. Service pages keep their brand-voice headings on purpose.
- `condition_faqs()` tops a condition's own FAQs up to `CONDITION_FAQ_CAP` (5) using the
  FAQs of the services in its `services` list. Every Q&A is already-published copy, so
  nothing needs fresh clinical sign-off — do NOT write new condition Q&As in build.py
  without the practice approving the medical content. The visible <details> list and the
  FAQPage schema are built from the SAME list; Google requires FAQ schema content to be
  visible on the page, so never let those two diverge.
- `/pricing.md` is the machine-readable price sheet for AI assistants and buying
  agents (generated in build_meta(), linked from llms.txt, served as text/plain via
  vercel.json). It restates ONLY published figures — `SERVICE_FROM_PRICE` and
  `IV_MENU` — and explicitly lists the nine services that are quoted at consultation
  under a "do not infer or estimate one" heading. That fence is the point of the
  file: an assistant with no number invents one. Never add a price here that is not
  on the page it links to.
- robots.txt names AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…)
  with Allow: / — several treat silence as refusal, which costs AI-answer visibility.
  Robots meta carries max-snippet:-1 + max-image-preview:large (feeds AI Overviews).
  /blog/feed.xml is RSS. IndexNow key file at the root — ping the API on changes
  (README has the curl); Bing/Yandex act in minutes, Google ignores it.
- Per page: WebSite + WebPage nodes graph-linked to the org @id; org carries
  knowsAbout, paymentAccepted, availableLanguage and an ImageObject logo.
- vercel.json 301-maps every old WordPress URL — keep ≥12 months post-launch. It is a
  standalone file (NOT generated by build.py) — edit directly.

### Share cards (og:image)
- Default card is `assets/media/og-team.jpg` — the care-team photo cropped to 1200×630
  from `assets/team/team-group.jpg`. Pages that pass their own `og_image=` keep theirs.
  Re-crop with Pillow from the team photo if the roster photo is replaced.
- `og:image:width/height` come from `img_dims()`, a stdlib JPEG/PNG header reader — they
  used to be hardcoded 1200×630 while service/condition pages shipped 1400×933 photos,
  which makes scrapers lay the card out wrong. Never hardcode them again.
- `SHARE_BASE` (top of build.py) is the host for og:image/twitter:image ONLY; canonicals,
  schema @ids and the sitemap stay on `BASE`. It points at the `*.vercel.app` deploy
  because regenorthopb.com does not resolve yet, and scrapers *fetch* that URL — when it
  404s, iMessage/Slack silently fall back to scraping some arbitrary image off the page
  (this is why shared links previewed with a single provider headshot).
  **At DNS flip: `SHARE_BASE = BASE`, rebuild.** The build prints a reminder until then.
- Scrapers cache aggressively per-URL. After changing a card, re-check with Facebook's
  Sharing Debugger / a fresh URL rather than assuming it did not work.

## Analytics
- Vercel Web Analytics (cookieless, no consent banner) is emitted by `footer()` on every
  page. `footer(analytics=False)` still exists and MUST be used on any future page that
  asks about health — see "No PHI on this site" below.
- The tag 404s harmlessly until Web Analytics is switched on in the Vercel dashboard
  (regenortho project → Analytics → Enable) — that toggle is the one manual step.
- Homepage LCP: `head(preload_hero=True)` (homepage only) preloads the hero poster with
  `fetchpriority=high`; the video itself stays `preload="none"` with JS-attached sources.

## No PHI on this site (do not regress)

The patient forms — `/forms/new-patient.html`, `/forms/peptide-glp-questionnaire.html`
and the `/forms/` hub — were REMOVED at the client's request. The site now collects a
name, phone, email and a reason for calling, and nothing else. That is the whole reason
the contact form and the assistant may keep using FormSubmit: they take contact details,
not clinical history.

If a form that asks about health, medication, symptoms or history is ever added back,
it changes the site's risk profile and the following all apply again:

- The destination must be HIPAA-eligible under a signed Business Associate Agreement.
  NOT FormSubmit, Formspree, Zapier, a Google Form, or a plain mailbox.
- No analytics, ad pixel or session-recording script on that page —
  `footer(analytics=False)`. A page view of a condition-specific URL tied to an IP
  address is the exact pattern regulators have pursued.
- `vercel.json` needs `Cache-Control: no-store` + `X-Robots-Tag: noarchive` for it.
- The privacy policy has to be rewritten in the same change.

The prior implementation kept PHI in the browser and transmitted nothing; if that
pattern is wanted again, recover `forms_content.py`, `assets/js/forms.js`,
`assets/css/forms.css` and `build_forms()` from git history rather than rewriting them.

## Facts discipline
All claims/credentials/prices/reviews are from the practice's own published content. Never
invent credentials, statistics, outcomes, or testimonials. Reviews stay verbatim.
