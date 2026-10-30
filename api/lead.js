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
 */

"use strict";

const SITE = "regenorthopb.com";
const PHONE = "833-783-6561";
const PRACTICE = "RegenOrtho Palm Beach";

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
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
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
  if (process.env.RESEND_API_KEY && to.length && process.env.LEAD_FROM) {
    const subject = (clean(body._subject, 150) || `New website request (${SITE})`) +
      (subjectHasName(body._subject, name) ? "" : ` — ${name}`);
    const payload = {
      from: process.env.LEAD_FROM,
      to,
      subject,
      text: fields.map(([k, v]) => `${k}: ${v}`).join("\n") +
        `\n\n-- Sent from ${SITE} (${source}). Saved: ${stored ? "yes" : "NO, keep this email"}.`,
    };
    const cc = list(process.env.LEAD_CC);
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

  if ((stored || emailed) && process.env.RESEND_API_KEY && process.env.CONFIRM_FROM && emailOk(email)) {
    const first = /https?:|www\.|[<>]/i.test(name) ? "there" : name.split(/\s+/)[0];
    try {
      await resend({
        from: process.env.CONFIRM_FROM,
        to: [email],
        reply_to: to[0],
        subject: `We received your request: ${PRACTICE}`,
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

function subjectHasName(subject, name) {
  return typeof subject === "string" && name && subject.includes(name);
}
