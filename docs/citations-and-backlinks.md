# Citations & backlinks — RegenOrtho Palm Beach

Working document. Everything below was verified live on **2026-08-15**; re-check before
acting, since directories change without notice.

Two separate jobs are tracked here and they are not the same thing:

1. **Citation hygiene** — the same name, address, phone and hours everywhere. This is
   what Google uses to decide the practice is one real business. Inconsistency here
   suppresses map rankings, and several listings are currently wrong.
2. **Backlinks** — earned links from other domains. Every partnership in the pipeline
   is a link opportunity that is currently going unused.

---

## The master NAP record

Everything below must match this exactly. Where a listing disagrees, the listing is wrong.

| Field | Value |
| --- | --- |
| Name | RegenOrtho Palm Beach |
| Street | 11380 Prosperity Farms Road, Suite 204–208 |
| City | Palm Beach Gardens, FL 33410 |
| Phone | 833-783-6561 (vanity 833-STEM561) |
| Fax | 561-807-5161 |
| Hours | Monday–Friday, 8:00 AM – 5:00 PM |
| Website | https://www.regenorthopb.com |
| Email | info@regenorthopalmbeach.com |
| Former name | Motion Orthopaedic & Podiatry Institute — belongs ONLY in a "previously known as" field, never as the display name |

**Current roster** — Dr. Marc Matarazzo (MD, FAAOS), Dr. Orlando Cedeno (DPM, FACFAS),
Emily Bahnick (**MSN, RN** — not APRN, not FNP-C). Dr. Michael Carpino left the practice
in Aug 2026 and must be removed everywhere.

---

## Corrections needed now

### 1. Palm Beach North Chamber — WRONG on four fields
https://members.pbnchamber.com/list/member/regenortho-palm-beach-19742

| Field | Listing says | Should say |
| --- | --- | --- |
| Street | 11380 Prosperity **Road**, Suite 204 | 11380 Prosperity **Farms** Road, Suite 204–208 |
| Phone | (561) 624-4800 listed alongside the 833 number | 833-783-6561 as primary |
| Hours | Mon–Fri 8 am–**4 pm** | Mon–Fri 8 am–**5 pm** |
| Branding | Still carries `MOTION_LOGO`, describes "the Motion Orthopaedic and Podiatry Institute", and links to Motion Orthopedics social accounts | RegenOrtho Palm Beach throughout |

This is a paid membership listing, so it is fully editable — the practice controls it.
Highest priority of anything on this page: it is a strong local citation actively
publishing a competing phone number and a retired brand.

### 2. Jupiter Magazine doctors directory — misstates a clinician's credentials
https://www.jupitermag.com/doctors-directory/north-palm-beach-1/adolescent-medicine-pediatric/regenortho-palm-beach-orlando-credno-dpm-facfas-dr-michael-carpino-marc-f-matarazzo-md/

Address and phone are correct. The problems are the roster and the URL:

- **"Emily Bahnick APRN, FNP-C"** — she is **MSN, RN**. Publishing advanced-practice
  credentials she does not hold is the most serious item in this document. Fix first.
- **"Michael Carpino PhD, PA"** still listed — no longer with the practice.
- URL misspells Cedeno as **"credno"**, which splits his search entity across two
  spellings. Ask them to correct the slug and 301 the old one.
- URL is filed under **`adolescent-medicine-pediatric`** even though the displayed
  categories are correct. Ask for re-filing under orthopedics/podiatry.
- Practice name renders as "Regenerative Orthopedics and Performance Medicine" rather
  than RegenOrtho Palm Beach.

Worth fixing properly rather than removing — a local-publication directory link is a
genuinely useful citation once it is accurate.

### 3. Yelp — listed under the wrong city
https://m.yelp.com/biz/regenortho-palm-beach-riviera-beach

The URL slug resolves to **riviera-beach**. Claim the listing and correct the city to
Palm Beach Gardens. (Yelp blocks automated fetching, so this needs a human to open it.)

### 4. A4M profile for Dr. Cedeno — competing phone number
https://www.a4m.com/orlando-cedeno-regen-ortho-palm-beach-gardens-fl.html

Shows **(561) 624-4800**. Same conflicting number as the chamber listing, so that number
is propagating. Decide whether it is a real line for the practice; if not, purge it
everywhere.

### 5. motionorthopodiatry.com is still live
https://motionorthopodiatry.com/

The predecessor practice's site is still up at the same address, which gives Google two
businesses at one location. Ideally 301 the whole domain to regenorthopb.com. If the
domain is not controlled by the practice, at minimum ensure no current staff or the
current address appear on it.

### 6. Google Business Profile
Nick became a manager on 2026-08-13 and Rosie Cedeno is an owner. Verify against the
master NAP above: exact suite (204–208), primary category, hours, appointment URL
pointing at https://www.regenorthopb.com/contact.html, services list, and fresh photos.
Remove Dr. Carpino if he appears. **Do not create a second profile** for any unstaffed
location.

Also: owner responses on several surviving Google reviews still reference "Motion
Orthopedic & Podiatry Institute" — specifically those to Nikki M., Naomi G. and
Augusto C. Google allows owner responses to be edited at any time; updating them clears
the last of the old branding from the public profile.

---

## Backlink opportunities already in the pipeline

These are relationships the practice already has. None of them currently link back.

| Source | Status | The ask |
| --- | --- | --- |
| **Palm Beach North Wellness Collective** (kellyopr.com) | Founding/Community Benefit Partner; launch Aug 20, Dr. Matarazzo speaking | A partner listing on the Collective page linking to regenorthopb.com. Ask Kelly O'Shea while the passport is being assembled — partner pages are built once. |
| **Jupiter Magazine** | Directory listing live (see corrections above) | Fix the listing; ask whether the photo spread has an online article to link to as well. |
| **K2 Road Sports / Palm Beaches Race Series** | Sponsorship in discussion | Make a logo-with-link on the event sponsor page an explicit term of any sponsorship. Sponsor pages are high-quality local links and cost nothing extra to request. |
| **PGA National Resort** | IV wellness bar partnership in discussion | Same — a partner/vendor listing with a link. |
| **Palm Beach North Chamber** | Member | Once the listing is corrected it is already a live link. |
| **Elite Sports Medicine** (elitesportsmed.org) | Dr. Matarazzo is the owner | A reciprocal link between the two practices is entirely legitimate and easy. |
| **Abacoa Podiatry & Leg Vein Center** | Dr. Cedeno is the owner | Same. **Caution:** the two brands compete for overlapping foot, ankle and vein terms — link, but keep the content distinct so they don't cannibalise. |
| **Local venues** (Salute Market, Swampgrass Willys, Stage Kitchen & Bar, The Snuggery, Cool'A Fish Bar, Avocado Cantina) | Coaster/signage idea from Emily | Low SEO value individually, but any that maintain a "partners" page is a free local link. |

---

## Why `sameAs` in our schema is still just Instagram

The organization schema's `sameAs` tells search and AI engines "these profiles are the
same entity as us." It is deliberately **not** expanded yet:

- **Jupiter Magazine listing** — would work, but it currently names a departed provider
  and misstates Emily's credentials. Pointing our own schema at it would endorse both.
- **Chamber listing** — wrong street, wrong phone, wrong hours, Motion branding.
- **Yelp** — wrong city in the URL, and unverified.
- **Facebook** (facebook.com/61585123466121) — a page exists under this name but is
  login-walled, so it could not be confirmed as the practice's. **Ask Emily whether the
  practice runs it.** Note CLAUDE.md currently records Instagram as the only real social
  profile; if this Facebook page is theirs, that note needs updating.

**Correct the listings first, then add them to `sameAs`** — the org node is in
`org_schema()` in `build.py`. Adding a bad profile to `sameAs` propagates its errors
into Google's entity understanding rather than fixing them.
