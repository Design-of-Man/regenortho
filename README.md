# RegenOrtho Palm Beach — Website

Static site for **regenorthopb.com**. 56 pages, fully generated — a complete redesign of the
practice's WordPress site, built to be handed over and self-managed.

**The Regeneration of Orthopedics** · 11380 Prosperity Farms Road, Suite 204–208, Palm Beach
Gardens, FL 33410 · 833-STEM561 (833-783-6561) · info@regenorthopalmbeach.com

## How it works

- **`build.py` is the single source of truth.** All page content — services, team bios,
  conditions, locations, IV menu + pricing, FAQs, testimonials — lives in this one file.
  Edit it, then run `python3 build.py` from this directory to regenerate every page in place.
  It is **stdlib-only by design** — no `pip install`, no virtualenv. A clean checkout must be
  able to build, so never import a third-party package (Pillow included) at build time; read
  image headers with `img_dims()` instead.
- **`blog_content.py`** holds the 10 blog post bodies (ported verbatim from the old site).
  To add a post, add a dict at the TOP of `BLOG_POSTS` and rebuild.
- `assets/css/styles.css` — the whole design system (navy `#092D5C` + gold `#FDC929` from the
  brand mark, porcelain background, Fraunces + Manrope self-hosted fonts).
- `assets/js/main.js` — nav, scroll reveals, counters, marquees, testimonial rotator, and the
  homepage's interactive anatomy section (draws in on scroll; nodes link to condition pages).
- **Hero video drop-in**: the homepage hero background is a CSS-animated coastline. To swap in
  real footage, add `assets/video/hero-beach.mp4` + `assets/video/hero-poster.jpg` and
  uncomment the `<video>` snippet in `build_home()` in `build.py`, then rebuild.
- `assets/js/assist.js` + `assets/css/assist.css` — the concierge assistant (chat popup on
  every page). "Ask a question" serves **set answers** from the FAQ array in `assist.js` —
  no AI, no external API. Keep those answers factually accurate: no medical advice, route
  unknowns to 833-783-6561. Appointment requests are emailed via FormSubmit (below).

## Editing cheat-sheet

| Change | Where |
| --- | --- |
| Phone, address, hours | Constants at the top of `build.py` |
| Add/edit a service page | `SERVICES` list in `build.py` |
| Add/edit a condition page | `CONDITIONS` list |
| Add/edit a location page | `LOCATIONS` list |
| IV menu & pricing | `IV_MENU` list |
| Team bios & credentials | `TEAM`, `MATARAZZO_BIO`, `CEDENO_BIO` |
| FAQs (site-wide page + schema) | `GENERAL_FAQS`, `INSURANCE_FAQS`, `IV_FAQS` + per-service `faqs` |
| Testimonials | `TESTIMONIALS` (keep quotes verbatim — never invent reviews) |
| Blog posts | `blog_content.py` |
| Assistant answers | `FAQ` array in `assets/js/assist.js` |

After ANY edit: `python3 build.py`, then commit. Preview locally with
`python3 -m http.server 8000` → http://localhost:8000.

## Leads (appointment requests)

Both the contact form and the assistant deliver to **formsubmit.co → info@regenorthopalmbeach.com**.
⚠️ FormSubmit requires one-time activation: the first submission triggers a confirmation
email to that inbox — click it (check spam) or leads will not arrive. If delivery fails,
the assistant queues the lead in the visitor's browser and retries automatically.

## No PHI on this site

The patient forms (`/forms/new-patient.html`, `/forms/peptide-glp-questionnaire.html`
and the `/forms/` hub) were removed at the client's request — every path now leads to
**Request an Appointment** on `/contact.html#book`. Their old URLs 301 there.

What the site collects is a name, phone, email and a reason for calling. That is why the
contact form and the concierge assistant may use FormSubmit: contact details, not
clinical history.

**If you add a form that asks about health, medication, symptoms or history**, it becomes
a HIPAA question again, and none of it is a config tweak:

1. The destination must be **HIPAA-eligible under a signed Business Associate Agreement**.
   Not FormSubmit, Formspree, Zapier, a Google Form, or a plain mailbox.
2. **No analytics on that page** — pass `footer(analytics=False)`. A page view of a
   condition-specific URL tied to an IP address is exactly the pattern regulators have
   gone after.
3. Add `Cache-Control: no-store` and `X-Robots-Tag: noarchive` for it in `vercel.json`.
4. You also need encryption in transit and at rest, access controls, audit logging, a
   retention/disposal schedule, and the form added to the practice's risk analysis.
5. Rewrite the privacy policy in the same change.

The removed forms kept everything in the browser and transmitted nothing. If that pattern
is wanted again, recover `forms_content.py`, `assets/js/forms.js`, `assets/css/forms.css`
and `build_forms()` from git history instead of rewriting them.

This is engineering guidance, not legal advice. Have the practice's HIPAA compliance
contact or counsel sign off before collecting health information on the site.

## Deploying

This repository IS the site — `index.html` and `vercel.json` sit at the root. That matters:
Vercel only reads the `vercel.json` at a repository's root, so serving this from a
subdirectory of another repo silently disables every redirect and header in it.

To deploy:

1. Import this repo into Vercel. No build step and no framework — it's static output that
   is committed, and `vercel.json` is already configured.
2. Set the production domain to `www.regenorthopb.com`.
3. Point DNS: `A @ → 76.76.21.21`, `CNAME www → cname.vercel-dns.com`.
4. **Set `SHARE_BASE = BASE` in `build.py` and rebuild.** Until the domain resolves,
   `og:image` has to point at the live `*.vercel.app` host, because link-preview
   scrapers actually fetch that URL and fall back to a random page image if it 404s.
   `build.py` prints a reminder on every build while the two differ.
5. Enable Web Analytics on the Vercel project (Project → Analytics → Enable). The tag is
   already on every page; it 404s silently until the toggle is flipped.
6. Submit `sitemap.xml` in Google Search Console and update the Google Business Profile
   website link.
7. Click the FormSubmit activation email on the first lead.

To hand the whole thing to the practice, transfer this repo to their GitHub account and
re-import it under their own Vercel account — nothing in the code needs to change.

## Hero video

The homepage hero plays a drone shot of the Juno Beach Pier (source: Juno.MP4 in
the practice's Dropbox, 2688×1512 native — not true 4K, so nothing is upscaled).
Web renditions live in `assets/video/` and were encoded from the master on a CI
runner. To re-encode, see the ladder documented in CLAUDE.md and keep: single
generation from the master, bt709 tags, faststart, no audio, and the JS one-pair
selection in `main.js` (phones must never download the desktop files).

## Search, AI answers & Bing

Beyond the usual on-page SEO, the build emits three things that are easy to lose
in a refactor:

- **`robots.txt` names AI crawlers explicitly** (GPTBot, ClaudeBot, PerplexityBot,
  Google-Extended, OAI-SearchBot, Applebot-Extended, CCBot and others) with
  `Allow: /`. Several of these treat silence as "no permission", so an unlisted
  site quietly disappears from AI answers — increasingly where "find me an
  orthopedist in Palm Beach Gardens" actually gets asked.
- **`max-snippet:-1, max-image-preview:large`** in the robots meta. Without it
  Google caps snippet length, and the snippet is what feeds AI Overviews.
- **`/blog/feed.xml`** (RSS) — how aggregators and several AI crawlers find new posts.

### IndexNow (Bing + Yandex instant indexing)

The key file `a7f3c1e94b2d48f6ae05d7c318b6f240.txt` at the site root proves domain
ownership. It does nothing on its own — you have to ping when content changes:

```
curl -s "https://api.indexnow.org/indexnow?url=https://www.regenorthopb.com/&key=a7f3c1e94b2d48f6ae05d7c318b6f240"
```

Swap `url=` for whichever page changed. Google ignores IndexNow; Bing, Yandex and
several AI crawlers act on it within minutes instead of waiting for a crawl.

## SEO — do not regress

- Every page emits a unique title/description, canonical, Open Graph/Twitter tags, and
  JSON-LD (MedicalClinic org node `#organization`, Physician, MedicalTherapy,
  MedicalCondition, FAQPage, Service-per-city, BlogPosting, BreadcrumbList).
- `sitemap.xml`, `robots.txt`, `llms.txt`, and `site.webmanifest` are regenerated by the build.
- **`vercel.json` carries 301s for every old WordPress URL** (services, IV drip pages,
  blog posts, intake forms). These preserve existing Google rankings — keep them for at
  least 12 months after launch. Deliberate: no aggregateRating markup (self-serving review
  schema violates Google's guidelines — the Google Business Profile carries review signal).
- New page checklist: unique `title`/`desc`/`canonical` via `head()`, add the path to the
  `pages` list in `build_meta()`, one `<h1>` per page, descriptive `alt` text.

## Facts discipline

Every clinical claim, credential, statistic, review, and price on this site came from the
practice's own published content. Do not invent credentials, outcomes, statistics, or
testimonials. When in doubt, ask the practice and leave it out.
