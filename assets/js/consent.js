/* Consent-gated Google Analytics 4 (added 2026-10-26).
   head() in build.py emits this file with data-ga="<measurement id>" on every page
   except /forms/* (analytics=False there, per the HIPAA rule). Nothing loads from
   Google until the visitor clicks Allow; "No thanks" is remembered and nothing
   loads, ever. The contact form and the assistant (on every page) take names,
   phone numbers and a reason for calling, so GA must not start on its own.
   window.gtag is defined here, before any choice, so RGLead's gtag('event', ...)
   calls in main.js only queue into dataLayer and send nothing unless gtag.js is
   later loaded. Same pattern as firstrehabnpb.com and legacymedicalpalmbeach.com.
   Vercel Web Analytics is cookieless and is not gated. */
(function () {
  "use strict";
  var me = document.currentScript;
  var id = me && me.dataset.ga;
  if (!id) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  // Consent Mode v2: everything denied until the visitor accepts.
  window.gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });
  window.gtag("set", "ads_data_redaction", true);
  window.gtag("set", "url_passthrough", false);

  var KEY = "rg-consent";
  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (_) {}

  function inject() {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
  }
  function grant() {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("js", new Date());
    // No Google Signals, no ad personalization, and the page path only (no query strings).
    window.gtag("config", id, { allow_google_signals: false, allow_ad_personalization_signals: false, page_location: location.origin + location.pathname });
  }

  if (choice === "granted") {
    grant();
    // gtag.js is 176KB and ~390ms of main-thread time on a mid-range phone, so a
    // returning visitor who already said yes still gets it after onload, at idle,
    // as before; the queue above replays when it arrives.
    var idle = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 1); })(inject, { timeout: 2500 }); };
    if (document.readyState === "complete") idle(); else window.addEventListener("load", idle);
    return;
  }
  if (choice === "denied") return;

  var bar = document.createElement("div");
  bar.className = "consent-bar";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Cookie choice");
  bar.innerHTML = "<p>May we count visits with Google Analytics? It helps us see which pages help people. Nothing you type into a form or the assistant is shared.</p>" +
    '<div class="consent-actions"><button type="button" class="btn btn-gold btn-sm" data-c="granted">Allow</button>' +
    '<button type="button" class="btn btn-ghost-light btn-sm" data-c="denied">No thanks</button></div>';
  bar.addEventListener("click", function (e) {
    var b = e.target.closest("[data-c]");
    if (!b) return;
    try { localStorage.setItem(KEY, b.dataset.c); } catch (_) {}
    if (b.dataset.c === "granted") { grant(); inject(); }
    bar.remove();
  });
  function show() { document.body.appendChild(bar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", show, { once: true });
  else show();
})();
