# RegenOrtho Palm Beach — Website (regenorthopb.com)

Static site, 56 pages, generated — do not edit HTML files directly.

## Architecture
- **`build.py`** is the single source of truth: all page content, services, team, conditions,
  locations, IV menu/pricing, FAQs, testimonials. Edit it, run `python3 build.py` (from this
  directory) to regenerate every page in place. `blog_content.py` holds blog post bodies.
- Fonts are SELF-HOSTED in assets/fonts/ (Newsreader + Manrope variable woff2, @font-face at
  the top of styles.css, preloads in head()) — do not add Google Fonts links.
  Newsreader replaced Fraunces because Fraunces' J/j carry a hooked ball terminal that
  reads as eccentric on a clinical site (its own design at every axis value, NOT the WONK
  axis). The Newsreader files are instanced to wght 400–700 with opsz PINNED at 20, which
  is why there is no `font-variation-settings` on body — pinning the axis out of the file
  instead of overriding it in CSS is what keeps the pair at 98KB instead of ~250KB.
  Font files carry a version suffix (`-v1`) because /assets/* is served immutable for a
  year: changing a font's bytes REQUIRES a new filename, not just a rebuild.
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
  FormSubmit (formsubmit.co/ajax/emily@regenorthopb.com) with a localStorage retry queue.
  Never put secret keys in it.
- BLOG (redesigned 2026-10): `build_blog()` renders a magazine index (feature + topic chips
  + a grid whose `.bl-wide` cards are chosen so rows fill) and image-led posts (split
  header, sticky "On this page" + related-care aside, reading progress, pull quote).
  `BLOG_EXTRAS` holds per-post pull quote / related care / photo alt; the build ASSERTS a
  pull quote appears verbatim in the post body, so it can never become new copy. A post
  without an entry (e.g. added by the content portal) still renders. Blog photos are
  generated illustrations — see tools/PROVENANCE.md before reusing them anywhere.
- SPLIT HEADERS: service, condition and location pages open on `.bl-hero.split-hero` (copy
  left, page photo bleeding right), not `page_hero()`. SpeakableSpecification lists both
  `.page-hero` and `.split-hero` selectors — rename either class and update it. Every
  service has its OWN photo now (svc-*.jpg, generated — tools/PROVENANCE.md); 14 of 19
  used to share three pictures. Do not point a new service at an existing photo.
- Condition pages show photo cards for their services plus a second row: the five
  regenerative therapies where `CONDITION_REGEN_MATCH` maps the condition to a
  REGEN_TREATS phrase (published), or vein care's three procedures. Small cards carry no
  photo on purpose. Further reading comes from `CONDITION_READING`.
- FLORIDA STEM-CELL NOTICE: `FL_STEM_CELL_NOTICE` (statute text, verbatim — §458.3245(5))
  renders under the header on the six `FL_NOTICE_PAGES`. Its size is the single CSS token
  `--fl-notice-size`; the statute says "no smaller than the largest type size used in
  the advertisement", and whether that means the H1 is the practice's attorney's call.
- /glossary (`build_glossary()`, `GLOSSARY` in build.py): one list renders the visible <dl> and the
  DefinedTermSet JSON-LD. Definitions restate the site's own copy only; it carries the Florida
  notice and REGEN_DISCLAIMER verbatim. /iv-therapy's "which drip for which goal" table is
  `IV_GOALS`, a re-sort of `IV_MENU` (the build asserts every named drip exists).
- /pricing (`build_pricing()`, served via vercel.json rewrite) is the human twin of
  /pricing.md: same constants, so they cannot disagree. Its FAQs (`pricing_faqs()`)
  restate only published figures; the visible list and FAQPage schema are one list.
- Physician nodes are `["Physician","Person"]` with `@id` `{url}#physician`, `givenName`/
  `familyName`/`honorificSuffix`, `alternateName` (legal name forms from NPPES; never "Mark", which
  other people share), `worksFor` = this org plus the doctor's sister-practice org node, and the NPI
  (and, for Dr. Matarazzo, Florida license ME85839) both in `identifier` and printed on the page's
  credentials card. Identities are split on purpose: elitesportsmed.org owns Dr. Matarazzo's
  surgical identity and Abacoa (jupiterlaser.com) owns podiatry; the profile titles here lead with
  regenerative care and vein care. Do not retitle them back to "Orthopedic Surgeon"/"Podiatrist".
- Physician schema carries `sameAs` + NPI `identifier` from `_PROVIDER_PROFILES`. Every
  URL there was fetched and verified as the right person; there are several Mark
  Matarazzos online, so never add one from a search result unchecked.
- `assets/js/forms.js` + `assets/css/forms.css` + `forms_content.py` — the two patient
  forms (`/forms/new-patient.html`, `/forms/peptide-glp-questionnaire.html`). Questions are
  declarative in `forms_content.py`; the renderer (`_field`/`_section`/`build_forms` in
  build.py) generates markup, validation, the step rail, the summary and the print sheet.

## Business facts (canonical)
- RegenOrtho Palm Beach · "The Regeneration of Orthopedics"
- 11380 Prosperity Farms Road, Suite 204–208, Palm Beach Gardens, FL 33410
- 833-STEM561 = 833-783-6561 · emily@regenorthopb.com · Mon–Fri 8 AM–5 PM
- Instagram: @regenortho_palmbeach (the only profile linked on the page). LinkedIn company page
  linkedin.com/company/regenorthopb is in the org schema sameAs. A 1-subscriber YouTube channel
  "Regen Ortho Palm Beach" exists (found 2026-10) but is NOT linked until the practice confirms it.
- Dr. Marc Matarazzo, MD (ortho/sports medicine, MAKO-certified) · Dr. Orlando Cedeno, DPM
  (podiatric surgery + vein). Those two are the whole named roster.
- Emily Bahnick, MSN, RN (IV nurse) LEFT the practice in October 2026 and was removed from
  every page, the schema, llms.txt, the assistant and the share card (the old team-group
  photo had her in it, so og-team.jpg was replaced by og-physicians-v1.jpg, composed from
  the two portraits). /providers/emily-bahnick 301s to /about. Do not re-add her.
  The address emily@regenorthopb.com is DELIBERATELY still the public email and the
  FormSubmit lead inbox — the owner said keep it for now. Changing it is a two-file change
  (build.py EMAIL/FORM_TARGET_EMAIL + assets/js/assist.js) and needs FormSubmit's one-time
  activation click from the new inbox, or leads hold undelivered.
- Elite Sports Medicine (elitesportsmed.org, 561-202-8886, Dr. Matarazzo's own orthopedic
  practice) operates INSIDE RegenOrtho's suite at 11380 Prosperity Farms Rd, and has its own
  Google Business Profile at that address. That is legitimate co-location (Google allows a
  separate profile per brand at one address), not a duplicate — never recommend removing or
  merging it, and expect his directory profiles (Healthgrades etc.) to carry Elite's phone.
  The two profiles compete in Maps when their categories overlap, so keep them distinct:
  Elite owns "Orthopedic surgeon"; RegenOrtho should lead on what Elite does not offer.
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
from the text shadow — but on phones (<=767px) that shadow MUST stay tight
(2px/12px, lede 2/6/16px): the desktop 26px/50px halos on centred copy filling
~75% of the hero merged into a dark smear that read as a "blurry" video, and the
.hero-stats backdrop blur smeared a quarter of the frame (removed on phones).
The mobile overrides need `.hero .hero-copy` / `.hero .hero-stats` specificity —
the base rules come later in the file and silently won with bare selectors.
DARK TINT TRAP: the `.video-live` rule that parks the CSS scene's animations
must NOT match .hero-scene itself or .hero-video-slot. .hero-scene runs the 1.8s
sceneIn opacity fade and CONTAINS the video; pausing it froze the hero at
whatever opacity the fade had reached when playback began (0.08 measured), so
the navy background showed through as a dark tint whenever the video played and
vanished whenever it paused. If the hero ever looks dark only while playing,
check `getComputedStyle(.hero-scene).opacity` first. The marquee under the hero keeps its flat rgba(4,16,31,.72)
band (flat fill, NOT backdrop-filter — compositing cost over playing video). The
CSS coastline scene stays underneath as the no-video fallback. asset_v() returns
"pending" for missing files so builds work before renditions land.

## SEO — keep maximized
- **START HERE for SEO and growth work: `docs/seo-kit/README.md`** indexes the October 2026
  takeover audits (growth plan, Search Console deep dive, local authority audit, Cowork prompt,
  competitor teardown) with the status of each. Re-read dates are in the deep dive.
- Search Console brand regex: `matarazzo|cedeno|cedano|cedeño|regen ?ortho|bahnick|prosperity farms`.
  "palmbeachregen" is NOT our brand: it is an unrelated West Palm Beach practice with a similar
  name. Never name, contact or report it; never use "Palm Beach Regen" for this practice.
- `BASE` (top of build.py) is `https://regenorthopb.com` — non-www, no trailing .html. This is
  the ONE canonical host+style for the whole site: rel=canonical, og:url, every schema @id/url,
  and the sitemap all derive from it. Non-www because the best-ranking pages (the two doctor
  profiles) already lived there when this was fixed — see the canonical-fix PR. Never point BASE
  at www; a domain-level `www -> non-www` 301 lives in vercel.json's redirects (host-matched via
  `has`), so www still resolves, it just isn't canonical. It is TWO rules, and they are the first
  two entries in `redirects` and must stay first — Vercel evaluates in order, so normalising the
  host before the path rules keeps `www/x.html` to a two-hop chain instead of serving a live
  duplicate. `source: "/:path*"` does NOT match the bare root on Vercel: with only that rule,
  `www.regenorthopb.com/about` 308s correctly while `www.regenorthopb.com/` still served a 200
  (verified on production 2026-09-17 — a cache-buster and a no-cache header both reproduced it, and
  `/index.html` redirected fine, so it is rule matching and not the edge cache). The homepage is
  the most valuable URL on the site, so an explicit `source: "/"` rule sits ahead of the wildcard.
  Both are the only `has`-based rules in the file; they match `www.regenorthopb.com` exactly, so
  preview deploys on `*.vercel.app` are unaffected, which also means NEITHER can be tested on a
  preview URL — verify on production after merge.
  This rule went MISSING at some point and the doc above described a redirect that did not exist.
  The cost, measured 2026-08-18 to 09-14: www served the whole site as a live 200 duplicate and
  absorbed 5,185 impressions (45% of all) at avg position 38.8 and a 0.06% CTR, against non-www's
  6,372 impressions at position 11.8 and 0.67%. If www ever returns 200 again, this is why.
  Check with `curl -s -o /dev/null -w '%{http_code}' https://www.regenorthopb.com/` — expect 308.
- Org node: MedicalClinic+MedicalBusiness @id {BASE}/#organization.
  Per page: Physician (providers), MedicalTherapy (services), MedicalCondition (conditions),
  FAQPage (faq + service/condition pages), Service-per-city (locations), BlogPosting (posts),
  BreadcrumbList (interior). sitemap.xml/robots.txt/llms.txt regenerate on build.
- The homepage canonical is the ROOT (`canonical=""` -> {BASE}/), not /index.html, and the
  sitemap emits the root to match. Inbound links, GBP and the social profiles all point at the
  root — canonicalising to /index.html consolidates the wrong way. If you ever change one of the
  two, change both or they contradict each other.
- Most pages have a clean, extensionless canonical URL that differs from their on-disk .html
  path (e.g. `services/vein-care.html` is served, and canonicalizes, at
  `/our-services/vein-care-medical-cosmetic`; most other services just drop the extension, e.g.
  `/services/exosome-therapy`; the two doctors are `/dr-marc-matarazzo-md` and
  `/dr-orlando-cedeno-dpm`). Never hand-edit a `canonical=` argument to a `head()` call to
  "clean it up" — that argument is also the git-lookup key `page_lastmod()` uses, and must stay
  the real on-disk path. Instead every internal href AND every canonical/og:url/schema URL is
  rewritten to its clean form by `rewrite_links()` in `write()` — one substitution table
  (`clean_url_map()`), driven off SERVICES/BLOG_POSTS/FORMS, applied uniformly to every generated
  file (pages, sitemap, feed, robots.txt, pricing.md, llms.txt) on its way to disk. Add a new
  service/blog post/form and it picks up a clean URL automatically; a genuinely new vanity slug
  (another vein-care- or doctor-style rename) needs an explicit entry in that same map, PLUS a
  matching rewrite+redirect pair in vercel.json (`fix_vercel.py`-style: rewrite the clean path to
  the real file, redirect the old .html path to the clean one — never the other way, or you get
  a redirect loop).
  Conditions and locations pages are the deliberate exception: they keep their plain .html
  address (self-canonical, non-www) because they've never had a second URL that was actually
  earning clicks — don't add them to the clean-URL map without checking Search Console first.
  A page whose own file is one directory deep but whose clean canonical is a single bare segment
  (our-services, blog, forms) resolves relative links against the SITE ROOT, not its own
  directory — any same-directory "sibling" link on that specific page (the tile/card grids on
  services/index.html, blog/index.html, forms/index.html) must spell out the directory prefix
  (`services/{slug}.html`, not bare `{slug}.html`) so `rewrite_links()` has a full path to match.
- `page_lastmod()` derives per-page dates from the last commit that touched the file (one
  `git log` walk, cached). It feeds sitemap <lastmod>, WebPage.dateModified and
  BlogPosting.dateModified. Do NOT put SITE_UPDATED back in those three places — a sitewide
  frozen constant is noise Google learns to discount. It falls back to SITE_UPDATED outside
  a git checkout, so the build still works from a tarball. Known and harmless: a page's date
  comes from its LAST commit, so the build that introduces a change still emits the previous
  date; the next build after committing picks up the new one. Don't "fix" this by stamping
  today's date at build time — that makes every page look changed on every build.
- H1 LEADS: service, condition, location, IV, services-hub and homepage H1s open with a
  plain "<treatment> in Palm Beach Gardens" span (`page_hero(h1_lead=...)`, tables
  `SERVICE_H1_LEAD` / `CONDITION_H1_LEAD`), rendered in the eyebrow's place. The brand-voice
  line follows it inside the same <h1>. Added 2026-10 because the stem cell, exosome, Wharton's
  jelly and MUSE pages never named the treatment in their H1. Keep the lead when editing a
  title; a new service needs an entry in SERVICE_H1_LEAD.
- /conditions and /locations are hub pages (`build_hubs()`), served at bare segments via
  vercel.json rewrites. Every condition and location breadcrumb linked to them for months while
  they did not exist (404 on 16 pages). Hub child links spell out their directory.
- Location pages lead with a per-city service list (`LOCATION_SERVICES`) ordered by that city's
  Search Console demand. They are not SERVICES[:6] on every page any more, which made the eight
  pages near-duplicates.
- Sub-service cards on a parent service page link `../services/<slug>.html`. A bare slug 404'd
  on the vein page (served at /our-services/...) until 2026-10.
- /ivig-intravenous-immunoglobulin 301s to /iv-therapy (was /contact). IVIG is NOT on the
  current menu; do not write an IVIG page unless the practice confirms it offers it.
- GA4: the gtag.js library loads after onload/idle (`GA_TAG`); the dataLayer stub stays inline
  so no event is lost. The hero poster is chosen by an inline script after the <video> (no
  poster="" in markup), matching main.js's isPortrait and the two media-split preloads. Change
  all three together.
- Clinical pages (services, conditions, infusions, IV) pass `webpage_type="MedicalWebPage"`;
  pages built on `page_hero()` pass `speakable=True` (selectors `.page-hero h1` /
  `.page-hero .lede` — if you rename either class, update the SpeakableSpecification).
- DELIBERATE: no aggregateRating in our own schema (Google guideline). Do not add.
- DELIBERATE: no `reviewedBy` / `lastReviewed` on MedicalWebPage. Both assert that a named
  clinician vetted the page for accuracy; that sign-off does not exist on record. Add them
  only when the practice names a reviewer and a real review date — not from a build script.
- Prices in schema come from `SERVICE_FROM_PRICE` (the services that publish a "from"
  price — medical weight loss, peptide therapy, and the four per-compound peptide protocol
  pages, which are the same $249/month programme and publish that figure in their own FAQ) and `IV_MENU` (the 12-item OfferCatalog). Never add an offer for a service that
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
  **Vercel matches a percent-encoded `source` CASE-SENSITIVELY.** `/nad%E2%81%BA-500-mg`
  and `/nad%e2%81%ba-500-mg` are the same URL per RFC 3986, but only the spelling in the
  file matches; the other 404s. The uppercase rule was there and the lowercase form — which
  is what WordPress emitted and what ivclinicpalmbeach.com still links to — died on a 404,
  found 2026-09-18 by following the inbound links from the doorway domains. Both spellings
  are in the file now. Any new rule with a `%XX` in it needs both.

### Share cards (og:image)
- Default card is `assets/media/og-physicians-v1.jpg` — the two physician portraits side by
  side over a navy band with the logo, composed with Pillow from `assets/team/`. Pages that
  pass their own `og_image=` keep theirs. If the roster changes, compose a NEW filename
  (assets are immutable-cached) rather than overwriting it.
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
- Confirmed leads fire `form_submit` to Vercel and BOTH `form_submit` and `generate_lead` to GA4
  (main.js `leadEvent`). GA4's enhanced measurement emits its own automatic `form_submit` on every
  submit attempt, so in GA4 only `generate_lead` means "delivered". Mark `generate_lead`,
  `call_click` and `appointment_cta` as key events in GA4.
- `contact#book` targets the form's own heading (`<h2 id="book">`), not the section: on phones the
  contact details stack above the form. The mobile Call pill and the assistant launcher fade out
  (`body.cta-yield`, main.js) while any `main form [type=submit]` is on screen; neither moves.
- Vercel Web Analytics (cookieless, no consent banner) is emitted by `footer()` on every
  page EXCEPT `/forms/*` — those three pages pass `analytics=False` per the HIPAA rule
  below. Never widen the exclusion away or add any other tracker to form pages.
- The tag 404s harmlessly until Web Analytics is switched on in the Vercel dashboard
  (regenortho project → Analytics → Enable) — that toggle is the one manual step.
- Homepage LCP: `head(preload_hero=True)` (homepage only) preloads the hero poster with
  `fetchpriority=high`; the video itself stays `preload="none"` with JS-attached sources.

## Patient forms — HIPAA (do not regress)
These two pages collect PHI, so they are built to keep it in the browser. `forms.js` has
NO fetch/XHR/beacon/third-party SDK — Finish renders an on-page summary the patient prints,
saves as PDF, or downloads. No analytics or tracking script may be added to `/forms/*`.
localStorage persistence is opt-in (unchecked by default) with an Erase button — never
flip that default; these are often shared devices. `vercel.json` sets `no-store` +
`noarchive` for `/forms/*`. Do NOT point these at FormSubmit, Formspree, Zapier, a Google
Form, or a plain mailbox: electronic delivery needs a HIPAA-eligible destination under a
signed BAA plus encryption, access controls, audit logging and a retention schedule — and
the on-page notice and privacy policy both promise nothing is transmitted, so they must be
rewritten in the same change. Full checklist in README.md → "Patient forms & HIPAA".
The site's other forms (contact, assistant) may keep using FormSubmit — they collect
contact details and a reason for calling, not clinical history.

## Facts discipline
All claims/credentials/prices/reviews are from the practice's own published content. Never
invent credentials, statistics, outcomes, or testimonials. Reviews stay verbatim.
