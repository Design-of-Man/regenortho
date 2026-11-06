/* Google Analytics 4 loader (privacy-restricted, no consent bar since 2026-11-06).
   head() in build.py emits this file with data-ga="<measurement id>" on every page
   except /forms/* (analytics=False there, per the HIPAA rule: nothing loads on the
   pages that collect PHI).
   History: from 2026-10-26 to 2026-11-06 GA waited behind an Allow / No thanks bar.
   No Florida or federal law requires a cookie banner for this site, and the bar
   collapsed GA to the few visitors who clicked Allow, so Nick removed it. What
   actually keeps patient data out of Google stays in place:
   - no Google Signals, no ad personalization, ad storage denied (no Ads account);
   - page_location is origin + path plus gclid/gbraid/wbraid/utm_* only, so no other
     query string reaches Google;
   - RGLead events carry path + placement only (never a name, phone or reason);
   - nothing loads on /forms/*.
   A visitor who clicked "No thanks" before 2026-11-06 is still respected
   (localStorage rg-consent = "denied" means GA never loads for them).
   gtag.js is 176KB and ~390ms of main-thread time on a mid-range phone, so it is
   injected after onload, at idle; the dataLayer queue replays when it arrives.
   Vercel Web Analytics is cookieless and loads separately. */
(function () {
  "use strict";
  var me = document.currentScript;
  var id = me && me.dataset.ga;
  if (!id) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  var choice = null;
  try { choice = localStorage.getItem("rg-consent"); } catch (_) {}
  if (choice === "denied") {
    window.gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });
    return;
  }

  window.gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" });
  window.gtag("set", "ads_data_redaction", true);
  window.gtag("set", "url_passthrough", false);
  // Path plus ad-click / campaign tags only (gclid, gbraid, wbraid, utm_*), so Google
  // Ads and UTM attribution work while any other query string never reaches Google.
  var keep = /^(gclid|gbraid|wbraid|utm_[a-z_]+)$/;
  var q = new URLSearchParams(location.search);
  var kept = new URLSearchParams();
  q.forEach(function (v, k) { if (keep.test(k)) kept.append(k, v); });
  var pageLoc = location.origin + location.pathname + (kept.toString() ? "?" + kept.toString() : "");
  window.gtag("js", new Date());
  window.gtag("config", id, { allow_google_signals: false, allow_ad_personalization_signals: false, page_location: pageLoc });

  function inject() {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
  }
  var idle = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 1); })(inject, { timeout: 2500 }); };
  if (document.readyState === "complete") idle(); else window.addEventListener("load", idle);
})();
