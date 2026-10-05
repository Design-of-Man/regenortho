/* RegenOrtho Palm Beach — lead log.
   Writes each appointment request (contact form + concierge assistant) to the
   practice's Supabase table `intake_leads`, ALONGSIDE the FormSubmit email, so
   leads can be counted. The email is still the delivery path the front desk
   works from; this is the record.

   - Fire-and-forget: never blocks, delays or fails a submission. A failed
     write is swallowed — the email already carries the lead.
   - The key below is the PUBLIC publishable/anon key. RLS on intake_leads
     allows INSERT only, so it cannot read anything back. Never put the
     service_role / secret key here.
   - Loaded wherever assist.js is, which means NEVER on /forms/*: those pages
     collect PHI and must transmit nothing (CLAUDE.md, "Patient forms — HIPAA").
   - Empty SUPABASE_URL/KEY = logging off; everything else works as before. */
(function () {
  "use strict";

  var SUPABASE_URL = "";
  var SUPABASE_KEY = "";

  function clip(v, n) { return String(v == null ? "" : v).trim().slice(0, n); }

  window.RGLeadLog = function (source, f) {
    if (!SUPABASE_URL || !SUPABASE_KEY || !window.fetch) return;
    var row = {
      source: source,
      full_name: clip(f.name, 200),
      phone: clip(f.phone, 40),
      email: clip(f.email, 254) || null,
      service: clip(f.service, 200) || null,
      preferred_time: clip(f.preferred_time, 200) || null,
      message: clip(f.message, 4000) || null,
      page: clip(location.pathname, 500),
    };
    if (!row.full_name || !row.phone) return;
    var headers = {
      "apikey": SUPABASE_KEY,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    };
    // Legacy anon keys are JWTs and also need the bearer header; new
    // sb_publishable_ keys go in apikey alone.
    if (SUPABASE_KEY.indexOf("eyJ") === 0) headers.Authorization = "Bearer " + SUPABASE_KEY;
    try {
      fetch(SUPABASE_URL + "/rest/v1/intake_leads", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(row),
        keepalive: true,
      }).catch(function () {});
    } catch (e) { /* never let logging break a booking */ }
  };
})();
