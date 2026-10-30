/**
 * HTML for the website's lead emails: the office notification and the
 * patient's confirmation. Same file in every Design of Man client site; only
 * the BRAND passed in by the caller differs.
 *
 * Email clients are not browsers: tables for layout, inline styles only, no
 * web fonts, no images, nothing that needs CSS support Outlook lacks. Every
 * value is escaped. The leading underscore keeps Vercel from serving this file
 * as a function.
 */

"use strict";

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Labels for the fields our forms and chats send. Anything else is title-cased.
const LABELS = {
  name: "Name", full_name: "Name", phone: "Phone", email: "Email",
  topic: "Reason", reason: "Reason", service: "Service", location: "Office",
  office: "Office", doctor: "Preferred doctor", provider: "Preferred provider",
  preferred_time: "Best time to call", best_time: "Best time to call",
  contact_pref: "Prefers", insurance: "Insurance", ref: "Reference",
  intent: "Request type", seats: "Seats", src: "Heard via", position: "Position",
  resume_url: "Resume", message: "Message", care: "Care needed", type: "Request type",
};
// Shown elsewhere in the email (header, buttons, footer) or not useful to staff.
const HIDDEN = new Set(["name", "full_name", "first_name", "last_name", "phone", "email",
  "message", "details", "ref", "reference", "page", "source", "verified", "flags",
  "contact_consent", "intent", "type",
  "no_medical", "elapsed", "company_website"]);

function label(key) {
  const k = String(key).toLowerCase().replace(/\s+/g, "_");
  return LABELS[k] || k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function telHref(phone) {
  const d = String(phone || "").replace(/\D/g, "");
  if (d.length === 10) return "tel:+1" + d;
  if (d.length === 11 && d[0] === "1") return "tel:+" + d;
  return d ? "tel:" + d : "";
}

function prettyPhone(phone) {
  const d = String(phone || "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : String(phone || "");
}

function easternNow() {
  try {
    return new Date().toLocaleString("en-US", {
      timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    }) + " ET";
  } catch (e) { return new Date().toISOString(); }
}

function button(href, text, bg, fg) {
  return `<a href="${esc(href)}" style="display:inline-block;background:${bg};color:${fg};text-decoration:none;font-weight:bold;font-size:15px;padding:12px 20px;border-radius:8px;margin:0 8px 8px 0">${esc(text)}</a>`;
}

function shell(brand, inner, footer) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>
<body style="margin:0;padding:0;background:#f3f2ef;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#1d1d1f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f2ef"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e4e2dd">
${inner}
</table>
<div style="max-width:600px;font-size:12px;line-height:1.5;color:#8a877f;margin-top:14px;text-align:center">${footer}</div>
</td></tr></table></body></html>`;
}

/**
 * The office's copy of a website request.
 *   brand:   { name, color, accent, ink? }  colour = header, accent = buttons/rule
 *   title:   "New appointment request" etc.
 *   fields:  object or [[key, value]] as the form sent them
 *   meta:    { site, source, flags }
 */
function officeEmail({ brand, title, fields, meta }) {
  const f = Array.isArray(fields) ? fields : Object.entries(fields || {});
  const norm = (key) => String(key).toLowerCase().replace(/\s+/g, "_");
  const get = (...keys) => {
    for (const k of keys) {
      const hit = f.find(([key]) => norm(key) === k);
      const v = hit ? String(hit[1] || "").trim() : "";
      if (v && !/^[-–—]+$/.test(v)) return v;
    }
    return "";
  };
  const name = get("name", "full_name") ||
    [get("first_name"), get("last_name")].filter(Boolean).join(" ") || "Website visitor";
  const phone = get("phone");
  const email = get("email");
  const ref = get("ref", "reference");
  const message = get("message", "details");
  const accentInk = brand.accentInk || "#ffffff";

  const rows = f
    .filter(([k, v]) => !HIDDEN.has(norm(k)) && String(v || "").trim() && !/^[-–—]+$/.test(String(v).trim()))
    .map(([k, v]) => `<tr><td style="padding:10px 0;border-top:1px solid #efede8;width:38%;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#7a776f;vertical-align:top">${esc(label(k))}</td><td style="padding:10px 0;border-top:1px solid #efede8;font-size:15px;font-weight:600;color:#1d1d1f;vertical-align:top">${esc(v)}</td></tr>`)
    .join("");

  const contactRows = [
    phone ? `<tr><td style="padding:10px 0;width:38%;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#7a776f">Phone</td><td style="padding:10px 0;font-size:15px;font-weight:600"><a href="${esc(telHref(phone))}" style="color:#1d1d1f;text-decoration:none">${esc(prettyPhone(phone))}</a></td></tr>` : "",
    email ? `<tr><td style="padding:10px 0;border-top:1px solid #efede8;width:38%;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#7a776f">Email</td><td style="padding:10px 0;border-top:1px solid #efede8;font-size:15px;font-weight:600"><a href="mailto:${esc(email)}" style="color:#1d1d1f">${esc(email)}</a></td></tr>` : "",
  ].join("");

  const buttons = [
    phone ? button(telHref(phone), "Call " + prettyPhone(phone), brand.accent, accentInk) : "",
    email ? button("mailto:" + email, "Reply by email", "#ffffff;border:1px solid #d6d3cc", "#1d1d1f") : "",
  ].join("");

  const flags = meta && meta.flags && meta.flags !== "none"
    ? `<tr><td style="padding:0 28px 18px"><div style="background:#fff4e5;border:1px solid #f3d19c;color:#7a4b00;border-radius:8px;padding:10px 12px;font-size:13px">Spam check: ${esc(meta.flags)}</div></td></tr>` : "";

  const inner = `
<tr><td style="background:${brand.color};padding:22px 28px">
  <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${brand.kicker || "rgba(255,255,255,.75)"};font-weight:bold">${esc(brand.name)}</div>
  <div style="font-size:24px;line-height:1.25;color:#ffffff;font-weight:bold;margin-top:6px">${esc(title)}</div>
  ${ref ? `<div style="display:inline-block;margin-top:10px;background:rgba(255,255,255,.14);color:#ffffff;border-radius:999px;padding:4px 12px;font-size:13px;font-weight:bold;letter-spacing:.04em">Ref ${esc(ref)}</div>` : ""}
</td></tr>
<tr><td style="padding:24px 28px 6px">
  <div style="font-size:22px;font-weight:bold;color:#1d1d1f">${esc(name)}</div>
  <div style="margin-top:14px">${buttons}</div>
</td></tr>
${flags}
<tr><td style="padding:4px 28px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${contactRows}${rows}</table></td></tr>
${message ? `<tr><td style="padding:12px 28px 4px"><div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#7a776f;margin-bottom:6px">In their words</div><div style="background:#f7f6f3;border-left:4px solid ${brand.accent};border-radius:6px;padding:14px 16px;font-size:15px;line-height:1.55;white-space:pre-wrap">${esc(message)}</div></td></tr>` : ""}
<tr><td style="padding:18px 28px 24px;font-size:13px;color:#7a776f;line-height:1.5">${email ? "Hit reply to answer the patient directly." : "No email given: please call."}</td></tr>`;

  const footer = `Sent from ${esc(meta && meta.site || "")}${meta && meta.source ? " &middot; " + esc(meta.source) : ""} &middot; ${esc(easternNow())}`;
  return shell(brand, inner, footer);
}

/**
 * The patient's "we got it" email. Fixed copy plus first name and reference:
 * nothing else they typed is repeated.
 */
function confirmEmail({ brand, first, ref, phone, site, promise }) {
  const inner = `
<tr><td style="background:${brand.color};padding:26px 28px">
  <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${brand.kicker || "rgba(255,255,255,.75)"};font-weight:bold">${esc(brand.name)}</div>
  <div style="font-size:26px;line-height:1.2;color:#ffffff;font-weight:bold;margin-top:8px">We received your request</div>
</td></tr>
<tr><td style="padding:26px 28px 8px;font-size:16px;line-height:1.6;color:#1d1d1f">
  <p style="margin:0 0 14px">Hi ${esc(first)},</p>
  <p style="margin:0 0 14px">Thank you for reaching out to ${esc(brand.name)}. ${esc(promise)}</p>
  ${ref ? `<div style="margin:18px 0;padding:14px 16px;background:#f7f6f3;border-radius:8px;border-left:4px solid ${brand.accent}"><div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#7a776f">Your reference number</div><div style="font-size:22px;font-weight:bold;letter-spacing:.06em;margin-top:4px">${esc(ref)}</div></div>` : ""}
  <p style="margin:0 0 18px">If it's urgent, give us a call.</p>
  ${button(telHref(phone), "Call " + prettyPhone(phone), brand.accent, brand.accentInk || "#ffffff")}
</td></tr>
<tr><td style="padding:10px 28px 26px;font-size:14px;color:#7a776f">${esc(brand.name)}<br><a href="https://${esc(site)}" style="color:#7a776f">${esc(site)}</a></td></tr>`;
  return shell(brand, inner, "You're receiving this because you sent a request through our website.");
}

module.exports = { officeEmail, confirmEmail, prettyPhone, esc };
