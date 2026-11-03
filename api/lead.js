/**
 * Website lead endpoint: stores every form submission, then emails it.
 *
 * Replaces FormSubmit, which went down on 2026-10-28 (Cloudflare 521) and took
 * every form on this site with it. Same file in each Design of Man client site;
 * only SITE below differs.
 *
 * Order matters:
 *   1. Store the lead through the shared `contact-lead` Supabase Edge Function
 *      (the same capture jupiterlaser.com has used since 2026-08). It needs no
 *      secret here, so a lead is kept even before email is configured.
 *   2. Email the office through Resend (LEAD_TO, cc LEAD_CC, from LEAD_FROM).
 *   3. If CONFIRM_FROM is set, send the patient a short confirmation. It never
 *      repeats what they typed beyond their first name: no reason, no message.
 *
 * Success means stored OR emailed. Only when both fail does the visitor get the
 * error (and the phone number). JSON callers get {"success":"true"|"false"},
 * the shape FormSubmit used, so the browser code did not change its check.
 * A plain HTML form post is redirected to its `_next` (same site only).
 *
 * Zero dependencies, CommonJS: these sites deploy with no install step.
 *
 * Environment:
 *   RESEND_API_KEY  enables email. Without it leads are stored only.
 *   LEAD_TO         comma-separated office recipients
 *   LEAD_CC         comma-separated copies (hello@designofman.com)
 *   LEAD_FROM       verified Resend sender, "Name <addr@domain>"
 *   CONFIRM_FROM    optional sender for the patient confirmation
 *   TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY  Cloudflare bot check, off until
 *                   BOTH are set (shared block below)
 *   TURNSTILE_UNVERIFIED_TO  optional inbox for unverified leads (else LEAD_CC)
 *
 * GET answers {"siteKey": "..."} (empty while Turnstile is off) so the browser
 * can find the key; it is cached for five minutes.
 */

"use strict";

const { officeEmail, confirmEmail } = require("./_email.js");

const SITE = "regenorthopb.com";
const PHONE = "833-783-6561";
const PRACTICE = "RegenOrtho Palm Beach";
const BRAND = { name: PRACTICE, color: "#092D5C", accent: "#FDC929", accentInk: "#092D5C", kicker: "#FDC929" };

const TIMEOUT_MS = 8000;
const FN_URL = "https://iiabylugbnmcdzqjenus.supabase.co/functions/v1/contact-lead";
// Publishable key: public by design. The leads table has RLS with no policies;
// every write goes through the Edge Function, which holds the real key.
const ANON_KEY = "sb_publishable_i5weJFCr68SAOsBaErXaFw_A3HrshPP";

const OK = { success: "true" };
const NOT_OK = { success: "false" };

function clean(v, max) {
  if (typeof v === "number") v = String(v);
  return typeof v === "string" ? v.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "";
}
function list(v) {
  return String(v || "").split(",").map((a) => a.trim()).filter(Boolean);
}
function emailOk(e) {
  return /^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(e);
}

function finish(req, res, body, ok) {
  const wantsJson = /json/i.test(String(req.headers["content-type"] || "")) ||
    /json/i.test(String(req.headers.accept || ""));
  if (!wantsJson) {
    let next = "/";
    try {
      const u = new URL(String(body._next || "/"), "https://" + SITE);
      if (u.hostname.replace(/^www\./, "") === SITE) next = u.pathname + u.search;
    } catch (e) { /* keep "/" */ }
    if (ok) {
      res.statusCode = 303;
      res.setHeader("Location", next);
      return res.end();
    }
    res.statusCode = 502;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Please call us</title><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:3rem auto;padding:0 1rem;line-height:1.5"><h1>We could not send your request</h1><p>Please call <a href="tel:${PHONE.replace(/\D/g, "")}">${PHONE}</a> and we will book you directly.</p><p><a href="javascript:history.back()">Go back</a></p></body>`);
  }
  res.statusCode = ok ? 200 : 502;
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(ok ? OK : NOT_OK));
}

// Cloudflare Turnstile, shared by every Design of Man client site (keep this
// block identical across abacoapodiatry, elite, regenortho, firstrehabnpb and
// legacymed; adapt only the require/export style to the file it lives in).
//
// ON only when BOTH TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY are set, so a
// half-configured environment can never mark every real lead unverified.
// The browser sends the token as `_turnstile` (leading underscore: a control
// field, never printed in an email).
//
// Verification outcome is three-way:
//   "off"        keys unset: behave exactly as before Turnstile existed
//   "verified"   Cloudflare said success, OR Cloudflare could not be reached
//                (fail open: their outage must not demote real patients)
//   "unverified" token missing or rejected. The lead is still KEPT wherever this
//                site stores leads, and still emailed, but only to the
//                monitoring inbox (TURNSTILE_UNVERIFIED_TO, else LEAD_CC), with
//                "[Unverified] " on the subject, and the visitor gets NO
//                confirmation email. That confirmation to scraped addresses is
//                what drew spam complaints on the shared Resend account.
//                If neither monitoring variable is set, it goes to the normal
//                recipients with the prefix: a lead is never silently lost.

const TURNSTILE_VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function turnstileOn() {
  return Boolean(process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);
}

// What GET on the lead endpoint returns, so the browser can find the site key.
function turnstileConfig() {
  return { siteKey: turnstileOn() ? process.env.TURNSTILE_SITE_KEY : "" };
}

async function turnstileCheck(req, body) {
  if (!turnstileOn()) return "off";
  const token = body && typeof body._turnstile === "string" ? body._turnstile.trim() : "";
  if (!token || token.length > 2048) return "unverified";
  const params = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: token });
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  if (ip) params.set("remoteip", ip);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const r = await fetch(TURNSTILE_VERIFY, { method: "POST", body: params, signal: ctrl.signal });
    const j = await r.json();
    if (j && j.success === true) return "verified";
    console.warn("turnstile: rejected", (j && j["error-codes"] || []).join(","));
    return "unverified";
  } catch (e) {
    console.warn("turnstile: siteverify unreachable, failing open:", e.message);
    return "verified";
  } finally {
    clearTimeout(timer);
  }
}

// Recipients for an unverified lead: the monitoring inbox, or null meaning
// "use the normal recipients" (subject still gets the prefix).
function unverifiedRecipients() {
  const raw = process.env.TURNSTILE_UNVERIFIED_TO || process.env.LEAD_CC || "";
  const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return list.length ? list : null;
}

async function resend(payload) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!r.ok) throw new Error(`resend ${r.status} ${await r.text()}`);
}

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=300");
    return res.end(JSON.stringify(turnstileConfig()));
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    res.statusCode = 405;
    return res.end();
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};

  // Honeypot: a bot gets a cheerful success and nothing is kept.
  if (clean(body._honey, 100)) return finish(req, res, body, true);

  const name = clean(body.name, 200) ||
    [clean(body.first_name, 100), clean(body.last_name, 100)].filter(Boolean).join(" ");
  const phone = clean(body.phone, 50);
  const email = clean(body.email, 200);
  const source = clean(body.source, 60) || "website";

  // The form bot that hit firstrehabnpb.com and jupiterlaser.com (see looksRandom
  // below). Same cheerful success as the honeypot: nothing kept, nothing emailed,
  // and no confirmation sent to the scraped address it typed in.
  if (/^["']/.test(String(req.headers["user-agent"] || "")) ||
      (looksRandom(name) && looksRandom(body.message))) {
    console.warn("lead: dropped bot submission");
    return finish(req, res, body, true);
  }

  // Turnstile, after the filters above. "unverified" is still stored and still
  // emailed, but only to the monitoring inbox, flagged, with no confirmation.
  const unverified = (await turnstileCheck(req, body)) === "unverified";
  if (unverified) console.warn("lead: unverified turnstile");

  if (!name || (!phone && !emailOk(email))) return finish(req, res, body, false);

  // Every visible field goes in the email, in the order it arrived. Fields
  // starting with "_" are FormSubmit-style controls, not patient answers.
  const fields = [];
  for (const [k, v] of Object.entries(body)) {
    if (k.startsWith("_") || ["source"].includes(k)) continue;
    const val = clean(Array.isArray(v) ? v.join(", ") : v, 4000);
    if (val) fields.push([k.replace(/_/g, " "), val]);
  }
  const reason = clean(body.reason || body.location || body.office || body.service, 120);
  const message = fields.map(([k, v]) => `${k}: ${v}`).join("\n").slice(0, 4000);

  const fwd = req.headers["x-forwarded-for"];
  let stored = false;
  try {
    const r = await fetch(FN_URL, {
      method: "POST",
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name, phone: phone || "(none given)", email: email || null, reason: reason || null,
        message, site: SITE, source,
        user_agent: clean(req.headers["user-agent"], 500) || null,
        ip: (typeof fwd === "string" ? fwd.split(",")[0].trim() : "") || null,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    stored = r.ok && await r.json().then((d) => String(d && d.success) === "true").catch(() => false);
    if (!stored) console.error("lead: store failed", r.status);
  } catch (err) {
    console.error("lead: store threw", err && err.message);
  }

  let emailed = false;
  const to = list(process.env.LEAD_TO);
  const monitor = unverified ? unverifiedRecipients() : null;
  const officeTo = monitor || to;
  if (process.env.RESEND_API_KEY && officeTo.length && process.env.LEAD_FROM) {
    const subject = (unverified ? "[Unverified] " : "") +
      (clean(body._subject, 150) || `New website request (${SITE})`) +
      (subjectHasName(body._subject, name) ? "" : ` — ${name}`);
    const payload = {
      from: process.env.LEAD_FROM,
      to: officeTo,
      subject,
      html: officeEmail({
        brand: BRAND,
        title: titleFor(body, source),
        fields: Object.entries(body).filter(([k]) => !k.startsWith("_")),
        meta: { site: SITE, source: source.replace(/-/g, " "), flags: clean(body.flags, 200) },
      }),
      text: fields.map(([k, v]) => `${k}: ${v}`).join("\n") +
        `\n\n-- Sent from ${SITE} (${source}). Saved: ${stored ? "yes" : "NO, keep this email"}.`,
    };
    const cc = monitor ? [] : list(process.env.LEAD_CC);
    if (cc.length) payload.cc = cc;
    if (emailOk(email)) payload.reply_to = email;
    try {
      await resend(payload);
      emailed = true;
    } catch (err) {
      console.error("lead: email failed", err && err.message);
    }
  } else {
    console.warn("lead: stored only, email not configured (RESEND_API_KEY / LEAD_TO / LEAD_FROM)");
  }

  if (!unverified && (stored || emailed) && process.env.RESEND_API_KEY && process.env.CONFIRM_FROM && emailOk(email)) {
    const first = /https?:|www\.|[<>]/i.test(name) ? "there" : name.split(/\s+/)[0];
    try {
      await resend({
        from: process.env.CONFIRM_FROM,
        to: [email],
        reply_to: to[0],
        subject: `We received your request: ${PRACTICE}`,
        html: confirmEmail({
          brand: BRAND, first, phone: PHONE, site: SITE,
          ref: /^[A-Z]{2}-[A-Z0-9]{5}$/.test(String(body.ref || "")) ? String(body.ref) : "",
          promise: "Your request came through and our team will contact you within one business day.",
        }),
        text: [
          `Hi ${first},`,
          "",
          `Thank you for reaching out to ${PRACTICE}. Your request came through and our team will contact you within one business day.`,
          "",
          `If it's urgent, call us at ${PHONE}.`,
          "",
          PRACTICE,
          `https://${SITE}`,
        ].join("\n"),
      });
    } catch (err) {
      console.error("lead: confirmation failed", err && err.message);
    }
  }

  return finish(req, res, body, stored || emailed);
};

// One letters-only word of 10+ letters with two or more capitals after the
// first: "ApMfNhuUrKlnrLqvUNPD". "Christopher" and "McDonald" pass. A submission
// is dropped only when BOTH the name and the message look like this. Same rule
// as firstrehabnpb's api/lead.js and abacoapodiatry's api/contact.js.
function looksRandom(s) {
  s = String(s || "").trim();
  if (!/^[A-Za-z]{10,}$/.test(s)) return false;
  return (s.slice(1).match(/[A-Z]/g) || []).length >= 2;
}

function subjectHasName(subject, name) {
  return typeof subject === "string" && name && subject.includes(name);
}

// The heading on the office's email: what kind of request this is.
function titleFor(body, source) {
  if (String(body.intent || "") === "question") return "New website question";
  if (source === "rsvp") return "New RSVP";
  return "New appointment request";
}
