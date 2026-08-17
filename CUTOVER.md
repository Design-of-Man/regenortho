# DNS cutover — regenorthopb.com from Wix to Vercel

Runbook for pointing the live domain at this site. The domain is currently on Wix: Wix is
both the registrar and the DNS host, and the old Wix site is what `regenorthopb.com` serves
today.

**Approach: DNS-only.** Registration and DNS hosting stay at Wix. We change two records —
the apex `A` and `www`. We do *not* transfer the registrar and we do *not* move nameservers
to Vercel, because either would force every MX, SPF, DKIM, DMARC and verification record
below to be re-created by hand, and one typo silently kills the practice's Google Workspace
mail and their Search Console property. Two record edits carry none of that risk and roll
back in ten minutes.

## Current DNS (verified 2026-08-17)

| Record | Value | Fate |
| --- | --- | --- |
| NS | `ns14.wixdns.net`, `ns15.wixdns.net` | unchanged — DNS stays at Wix |
| A `@` | `160.153.0.70` (Wix, behind Cloudflare) | **changes** → Vercel |
| `www` | points at apex; 301s `www` → apex | **changes** → `cname.vercel-dns.com` |
| MX | Google Workspace (`aspmx.l.google.com` + 4 alts) | untouched |
| TXT `@` | `v=spf1 include:_spf.google.com ~all` | untouched |
| TXT `@` | `brevo-code:b916aeb2…` | untouched |
| TXT `@` | `google-site-verification=bBl2jPhveJQ…` | untouched |
| TXT `_dmarc` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` | untouched |
| CNAME `brevo1._domainkey`, `brevo2._domainkey` | Brevo DKIM | untouched |

Note the direction flip. Wix redirects `www` → apex today. This site canonicalises to
**`www`** — `BASE = "https://www.regenorthopb.com"` in `build.py`, and every canonical,
schema `@id` and sitemap URL is generated from it. So after cutover `www` is production and
the apex redirects to it, the opposite of today. Don't "fix" that by switching the site to
the apex; it would mean regenerating all 56 pages and the whole schema graph.

## Pre-flight (day before)

1. Confirm you're in the Wix account that **owns the domain**, not just one with editor
   access to the site. Wix → Domains.
2. Lower the TTL on the apex `A` and on `www` to the minimum Wix offers, and let the old
   TTL expire. This is what makes both the cutover and the rollback fast.
3. **Disconnect the domain from the Wix site.** Wix locks the apex `A` record while a site
   is connected to it — the DNS panel shows it greyed out or "managed by Wix". Domains →
   `regenorthopb.com` → site connection → disconnect/unassign. The Wix site stays published
   on its `*.wixsite.com` URL, which is the fallback. Only after this are `A` and `www`
   editable under Advanced → DNS records. (If step 2 was blocked, do this first.)
4. **Screenshot the entire Wix DNS records panel.** That screenshot is the rollback artifact.
5. Sanity-check the Vercel deployment: `regenortho-mu.vercel.app` loads, hero video plays,
   `/forms/new-patient.html` renders, `/sitemap.xml` and `/robots.txt` return 200.

## Cutover

### 1. Vercel — claim both hostnames

Project `regenortho` → Settings → Domains.

- Add `www.regenorthopb.com`, set it as the **production** domain.
- Add `regenorthopb.com` and configure it to **redirect to `www.regenorthopb.com`**.
- Use the record values **Vercel prints on that screen**, not the ones in `README.md` —
  Vercel has rotated its apex anycast IP (older projects get `76.76.21.21`, newer ones
  `216.150.1.1`) and the README predates that.

Both domains show "Invalid Configuration" until DNS propagates. Expected.

### 2. Wix — change two records

Domains → `regenorthopb.com` → Advanced → DNS records.

- **A `@`**: `160.153.0.70` → the IP Vercel printed.
- **`www`**: → CNAME `cname.vercel-dns.com`. If Wix stores `www` as an A record or as a
  URL-forwarding rule, delete it and create the CNAME. Any leftover Wix forwarding rule on
  `www` will keep bouncing traffic to the apex ahead of the CNAME.

**Touch nothing else.** Every MX, TXT and `_domainkey` record in the table above stays
exactly as it is.

### 3. Repo — flip `SHARE_BASE` and rebuild

Once the domain resolves to Vercel, in `build.py` set `SHARE_BASE = BASE` and drop the
"AT DNS FLIP" comment block, then run `python3 build.py` from the repo root.

`SHARE_BASE` points at `regenortho-mu.vercel.app` only because the real domain didn't
resolve: link-preview scrapers *fetch* the `og:image` URL, and when it 404s iMessage/Slack
fall back to scraping an arbitrary image off the page. The build prints a reminder on every
run until this is done — that reminder disappearing is the confirmation.

The diff should be confined to `og:image` / `twitter:image` URLs across all 56 pages (plus
any `<lastmod>` churn from `page_lastmod()`). Commit `build.py` and the regenerated HTML
together. Do this right after step 2 so the new cards go live with the domain — not before,
or share previews break for as long as DNS is still pointing at Wix.

## Post-cutover

1. **Vercel → Analytics → Enable.** The tag is already emitted by `footer()` on every page
   except `/forms/*` (HIPAA) and 404s silently until this toggle is flipped. It is the one
   step the code can't do for you.
2. **Search Console.** The `google-site-verification` TXT is untouched, so the property
   survives. Submit `https://www.regenorthopb.com/sitemap.xml`. If the existing property is
   a URL-prefix property on the apex, add a `https://www.` one too — canonicals now resolve
   to `www`.
3. **IndexNow ping** (Bing and Yandex act in minutes; Google ignores it):
   ```
   curl -s "https://api.indexnow.org/indexnow?url=https://www.regenorthopb.com/&key=a7f3c1e94b2d48f6ae05d7c318b6f240"
   ```
4. **Google Business Profile** — update the website link to `https://www.regenorthopb.com/`.
5. **Instagram bio** (@regenortho_palmbeach) — same.
6. **Re-scrape share cards** with Facebook's Sharing Debugger, then post a link in
   iMessage/Slack. Scrapers cache hard per-URL; a stale preview doesn't mean step 3 failed.
7. **FormSubmit activation** — the first lead triggers a confirmation email that has to be
   clicked. Read "Known issue" below first.
8. **Raise TTLs** back to an hour or more, ~48h after cutover.
9. **Wix** — leave the site published-but-unconnected for a couple of weeks as the rollback
   path, then cancel Wix Premium. Do **not** delete the Wix account: it is still the
   registrar, and the domain renews there.

## Verification

```bash
# resolution — apex on Vercel's IP, www a CNAME to cname.vercel-dns.com
curl -s -H 'accept: application/dns-json' \
  "https://cloudflare-dns.com/dns-query?name=regenorthopb.com&type=A"
curl -s -H 'accept: application/dns-json' \
  "https://cloudflare-dns.com/dns-query?name=www.regenorthopb.com&type=CNAME"

# apex must redirect to www; www must be 200 and served by Vercel
curl -sSI https://regenorthopb.com/     | head -5
curl -sSI https://www.regenorthopb.com/ | head -12   # expect  server: Vercel

# mail records must be byte-identical to the table above
for t in MX TXT; do curl -s -H 'accept: application/dns-json' \
  "https://cloudflare-dns.com/dns-query?name=regenorthopb.com&type=$t"; done
curl -s -H 'accept: application/dns-json' \
  "https://cloudflare-dns.com/dns-query?name=_dmarc.regenorthopb.com&type=TXT"
```

Then on the live domain:

- **Send a test email to and from a `@regenorthopb.com` Workspace mailbox.** This is the
  one check that must not be skipped.
- Hit a legacy WordPress URL — `/about-us` → `/about.html`, `/our-services` →
  `/services/index.html`. A 404 means `vercel.json` isn't being read (it must be at the
  repo root).
- `/forms/new-patient.html` returns `cache-control: no-store` and `x-robots-tag: noarchive`.
- View source on the homepage: `og:image` reads
  `https://www.regenorthopb.com/assets/media/og-team.jpg?v=…`, not the `vercel.app` host.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/pricing.md` (as `text/plain`),
  `/blog/feed.xml` and the IndexNow key file at the root all return 200.
- On a real phone: hero video plays, Call Now pill bottom-left, assistant launcher
  bottom-right.

## Rollback

Restore the apex `A` to `160.153.0.70` and `www` to its screenshotted value, then reconnect
the domain to the Wix site. With TTLs at five minutes that's roughly a ten-minute recovery.
Nothing in the mail path was altered, so mail is never part of a rollback.

## Known issue (not part of this cutover)

`info@regenorthopalmbeach.com` — the FormSubmit destination in `assets/js/assist.js`, the
contact form in `build.py`, and the address printed across the site — sits on a domain that
**is not registered** (NXDOMAIN at the `.com` TLD, checked 2026-08-17). Mail to it cannot
be delivered. The domain with working Google Workspace MX is `regenorthopb.com`. Confirm
the correct mailbox with the practice and fix it as separate work; it doesn't block DNS.
