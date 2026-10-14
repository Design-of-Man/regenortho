# Local authority audit: why RegenOrtho barely shows for non-brand searches, and what to do (2026-10-14)

Evidence pulled 2026-10-14: NPPES API (both physicians, every organization NPI at 11380 Prosperity
Farms Rd), the Google Business Profile through Windsor.ai (`locations/10759729345634424165`, place
ID `ChIJ48L6Yg8r34gR3UxzOZ36YFU`), the co-located Elite and Abacoa profiles, Healthgrades,
Doximity, Stryker and Jupiter Medical Center profiles, and Search Console. Nothing in this document
was changed by us on any third-party site: every fix below is an owner action or a task in
`docs/COWORK-LOCAL-FIXES.md`.

## 1. The short answer: it is not the schema

The site already carries more structured data than any nearby practice we checked
(`docs/seo-kit/competitor-teardown-2026-10.md`). Non-brand search earns about one click a week
because:

1. **The map pack answers local intent, and the Google Business Profile is small.** 273 profile
   impressions in September 2026 (Maps plus Search), 7 calls, 25 website clicks, 49 direction
   requests. 38 reviews in total (4.9), but only **8 in the last 12 months**; the newest is
   2026-09-08.
2. **Three brands share one suite and two of them compete in the same categories** (section 4).
3. **The physicians' directory records contradict each other** (section 3), so Google and the AI
   assistants see two doctors with several addresses and phones each.
4. **Most service pages were rebuilt two days ago** (PRs #49, #50); they have not been recrawled
   and measured yet.

## 2. Name collision and listing history

- **A similarly named regenerative practice operates in West Palm Beach.** It is unrelated (other
  physician, other address, other phone). Its domain name had been included in this project's brand
  regex for Search Console; it is not our brand and is now excluded from both brand and non-brand
  counts. Plan: use the full name "RegenOrtho Palm Beach" everywhere, never "Palm Beach Regen" or
  similar, and out-review rather than out-argue. We never name, contact, report or bid on them.
  A one-line disambiguation ("one office, in Palm Beach Gardens") is ready to add if Nick wants it;
  see the questions list.
- **The Google profile was inherited from an earlier practice identity.** 26 of its 38 reviews
  predate June 2025; they and their replies use the listing's previous name and thank clinicians
  who are not on the current roster. Nothing can or should be done to those reviews. The fix is review
  velocity under the current name (section 6).

## 3. Wrong records that feed Google, insurers and AI answers

NPPES feeds Healthgrades, WebMD, Doximity, insurer directories and AI answers, so it goes first.

| # | Where | What is wrong | Fix | Who |
|---|---|---|---|---|
| 1 | NPPES, Dr. Marc Matarazzo, NPI 1083678452 (updated 2025-05-14) | Primary practice location is the **closed** Jupiter office, 108 Intracoastal Pointe Dr Ste 200. Palm Beach Gardens is not listed at all. Fax equals phone (561-202-8886). Mailing address is a Stuart home address. | Replace the primary practice location with a current ELITE office; add the other ELITE office; remove the Jupiter address; correct the fax. Which offices and phone go on his record is ELITE's decision (ELITE's repo: his directory profiles show ELITE only). | Dr. Matarazzo signs in to NPPES himself (individual NPI). We cannot. |
| 2 | NPPES, Dr. Orlando Cedeno, NPI 1700076437 (updated 2021-10-19) | Phone 561-624-4800 and fax 561-624-5206 are the old, dead Abacoa numbers. Jupiter address only; Palm Beach Gardens missing. | Phone to the current Abacoa number, add the Palm Beach Gardens office, confirm the fax. | Dr. Cedeno in NPPES. |
| 3 | Healthgrades, Dr. Matarazzo | Headline says "Orthopedic Surgeon in Jupiter, FL". First practice listed is a former group's Jupiter office with that group's phone (561-798-6600), plus two more former offices (Port St. Lucie, Lake Worth). The Palm Beach Gardens suite shows 561-202-8886 as both phone and fax. | Claim the free provider profile; leave only current ELITE offices and phone. | Dr. Matarazzo / ELITE (Cowork task, with his login). |
| 4 | Healthgrades, Dr. Cedeno | Name shown as "Orlando Cedeno Jr"; practice "Podiatry Associates of Palm Beach Gardens Inc"; both offices show the dead 561-624-4800. | Claim; correct practice name and phone. Which brand his profile shows is a decision for Nick (question 3). | Dr. Cedeno / Abacoa. |
| 5 | Doximity, Dr. Matarazzo | Says he has been employed by a former group "since 2022". Fax equals phone. | He claims the profile (Doximity requires the physician's own login) and updates employer and fax. | Dr. Matarazzo. |
| 6 | Jupiter Medical Center physician directory | Lists the closed Jupiter office. | Email the JMC medical staff office with the current ELITE office. | ELITE / Dr. Matarazzo. |
| 7 | NPPES, an orthopedic surgeon not on the current roster | His individual NPI lists 11380 Prosperity Farms Rd **Ste 204** with a mistyped phone (351-624-4800). It attaches a non-roster doctor to the RegenOrtho/ELITE suite in every NPPES-fed directory. | Only that physician can change it. Mention it to the practice; do nothing ourselves. | That physician. |
| 8 | Google Business Profile, RegenOrtho | Friday hours are 8 AM to **2 PM**; the site says Mon to Fri 8 AM to 5 PM. | Confirm the real Friday hours, then make the site (`HOURS` in build.py, plus the org schema) and the profile agree. Not changed in this PR because we do not know which is right. | Practice confirms; Cowork edits. |
| 9 | Google Business Profile, RegenOrtho | Service list still includes **"IVIG (Intravenous Immunoglobulin)"**, which is not on the current menu (CLAUDE.md). | Remove the service item, unless the practice confirms it offers IVIG. | Cowork, after Nick confirms. |
| 10 | Google Business Profile, RegenOrtho | Attributes "Black-owned" and "Veteran-owned" are set. | Confirm with the owners; remove if not true. Identity attributes must be accurate. | Nick asks; Cowork edits. |
| 11 | Google Business Profile, RegenOrtho | Address line is "Suite 204"; the site says "Suite 204–208". | Pick one form and use it on both. | Nick decides. |
| 12 | Google Business Profile, RegenOrtho | Description calls the practice "a leading medical clinic" and leads with surgeons. | Replace with the draft in `docs/COWORK-LOCAL-FIXES.md` (regenerative, IV, peptides, weight loss and vein care; no superlatives). | Cowork, after approval. |
| 13 | ivclinicpalmbeach.com (old doorway site, still live) | Publishes `info@regenorthopb.com`. The public and lead address is `emily@regenorthopb.com`. | Confirm whether `info@` exists and is read; if not, change or remove it on that site. Its 14 links into this site all resolve (checked 2026-10-14). | Nick. |

**No organization NPI exists for RegenOrtho.** NPPES has no NPI-2 under "REGEN*" in Florida and no
organization at Suite 204 to 208. If the practice bills insurance for any service (the site says it
works with most major insurers), the claims go out under some entity's NPI. Which one is a question
for Nick; we did not guess.

## 4. The suite: three brands, one address, separate profiles

Google allows a separate profile per brand at one address. It does not want them competing for the
same category. Today they do:

| Profile | Primary category | Additional categories |
|---|---|---|
| RegenOrtho Palm Beach (Suite 204) | Medical clinic | Podiatrist, Medical spa, Esthetics service, IV therapy service, **Orthopedic surgeon**, **Sports medicine clinic** |
| ELITE Sports Medicine, Palm Beach Gardens (Ste 204) | **Orthopedic surgeon** | Orthopedic clinic, **Sports medicine clinic**, Sports medicine physician |
| Abacoa Podiatry & Leg Vein Center, Palm Beach Gardens (suite 204) | **Podiatrist** | none |

RegenOrtho should lead on what ELITE and Abacoa do not offer: regenerative (cellular, exosome,
PRP) care, IV therapy, peptides and medical weight loss.

Recommended (owner approval needed; Cowork makes the change):
- **Remove** Orthopedic surgeon and Sports medicine clinic (ELITE's) and Podiatrist (Abacoa's).
- **Primary category:** search the GBP category picker for "regenerative", "stem cell" and "pain".
  If a regenerative or stem cell category exists, make it primary; otherwise keep Medical clinic.
- **Keep** IV therapy service. **Add** Weight loss service if it exists in the picker.
- **Medical spa and Esthetics service:** they pull the profile toward Botox and facials, which the
  site does not offer. Remove unless the practice offers aesthetic services.
- **Vein care:** Abacoa's own name is "Leg Vein Center" and RegenOrtho also sells vein care. Decide
  which brand owns vein searches in Maps before adding any vein category to either (question 4).

## 5. Directories and links worth earning (no schemes)

- **Specialty directories that list physicians by credential**: AAOS Find an Orthopaedist (he is a
  Fellow of the AAOS, as his profile states), AOSSM, ACFAS Find a Foot and Ankle Surgeon (Dr.
  Cedeno is FACFAS), APMA Find a Podiatrist. Each lets the doctor choose the practice and website
  shown; under the ELITE decision, Dr. Matarazzo's surgical listings point to ELITE. Dr. Cedeno's
  are Nick's call.
- **Contextual links that already exist and should stay:** the two sister practices link here and
  this site links back (`SISTER_PRACTICES` in build.py). That is a legitimate relationship, not a
  scheme; do not add footer links on unrelated sites.
- **Worth asking about:** the research affiliation on Dr. Matarazzo's profile ("Pharmakon-affiliated"),
  his former team-physician roles, and any talk, podcast or press piece about regenerative care. A
  link from any of those to the relevant page here is worth more than a directory.

## 6. Google Business Profile: velocity and content

- **Reviews:** 8 in the last 12 months is the weakest number in this audit. Ask every satisfied
  patient, in person and in the follow-up message, with the profile's review link
  (`maps.google.com/maps?cid=6152192644168764637`). No incentives, no gating, no scripted text.
- **Photos:** new photos of the lounge, the treatment rooms and the doctors at least monthly.
- **Posts:** one post a month on a service the site publishes a price for (IV menu, peptide and GLP-1
  programs), linking to that page.
- **Service list:** mirror the site's services and prices exactly (IV menu items, peptide program
  from $249/month, weight loss from $239/month). Never add a price the site does not publish.

## 7. Shipped in this PR from this audit

- Physician schema for both doctors: Person type added, legal name as `alternateName`, NPI plus (for
  Dr. Matarazzo) Florida license ME85839 shown on the page and in `identifier`, `worksFor` linking
  each doctor's node to his sister practice, and `sameAs` to the sister-site physician pages,
  Stryker and Jupiter Medical Center (each fetched and checked on 2026-10-14).
- Retitled both doctor profiles so they stop competing with ELITE (surgery) and Abacoa (podiatry).
- `vercel.json`: the three redirects that point at jupiterlaser.com now name the final URL, cutting
  a hop.

## 8. Cowork runbook

`docs/COWORK-LOCAL-FIXES.md` holds the paste-ready prompt for every fix above that happens on a
third-party site.
