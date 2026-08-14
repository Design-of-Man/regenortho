/* Cash-pay offer modal — 25% off first service.
 *
 * Fires when a visitor acts on a cash-pay booking link (the IV Lounge menu, the
 * IV Lounge CTAs, peptide therapy, medical weight loss). The click is
 * intercepted, not cancelled: dismissing or submitting both continue to the
 * destination the visitor asked for, because the offer must never sit between
 * someone and the appointment request.
 *
 * Deliberately NOT on the specialty infusion pages. IVIG, Krystexxa, Ocrevus
 * and Ultomiris are prescription therapies billed through insurance — a
 * discount banner does not belong on them.
 *
 * Collects an email address only. That is contact information, not health
 * information, which is why FormSubmit is an acceptable destination here (see
 * "No PHI on this site" in README.md). Never add a symptom, condition or
 * medication field to this form.
 */
(function () {
  "use strict";

  var modal = document.querySelector("[data-offer]");
  if (!modal) return;

  var EMAIL = modal.getAttribute("data-offer-email");
  var ENDPOINT = "https://formsubmit.co/ajax/" + EMAIL;
  var LS_SEEN = "rgo-offer-v1";
  var DAYS = 30;

  var form = modal.querySelector("[data-offer-form]");
  var input = modal.querySelector("[data-offer-input]");
  var status = modal.querySelector("[data-offer-status]");
  var panel = modal.querySelector(".offer-panel");
  var pending = null;      // the href we interrupted, resumed on close
  var lastFocus = null;

  function seen() {
    try {
      var t = parseInt(localStorage.getItem(LS_SEEN), 10);
      return t && (Date.now() - t) < DAYS * 864e5;
    } catch (e) { return false; }
  }
  function markSeen() {
    try { localStorage.setItem(LS_SEEN, String(Date.now())); } catch (e) {}
  }

  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';

  function open() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("offer-open");
    // Focus the field, not the dialog, so a keyboard visitor can type at once.
    (input || panel).focus();
    document.addEventListener("keydown", onKey, true);
  }

  function close(go) {
    modal.hidden = true;
    document.body.classList.remove("offer-open");
    document.removeEventListener("keydown", onKey, true);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    var href = pending; pending = null;
    // Resume the interrupted navigation. `go` is false only when the visitor
    // dismissed a modal that no click triggered.
    if (go !== false && href) window.location.href = href;
  }

  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    var f = panel.querySelectorAll(FOCUSABLE);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ------------------------------------------------------------- triggers */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="contact.html#book"]');
    if (!a || seen()) return;
    // Let modified clicks (new tab, download) behave normally.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    pending = a.href;
    markSeen();
    open();
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal || e.target.closest("[data-offer-close]")) close();
  });

  /* --------------------------------------------------------------- submit */
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = (input.value || "").trim();
      if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(value)) {
        status.textContent = "Please enter a valid email address.";
        input.focus();
        return;
      }
      status.textContent = "Sending…";
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: "25% off first service — offer signup",
          email: value,
          offer: "25% off first service",
          source: "regenorthopb.com " + location.pathname,
        }),
      }).then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        status.textContent = "You're in — we'll email your code. Taking you to booking…";
        setTimeout(close, 1200);
      }).catch(function () {
        // Never strand the visitor on a failed send: the booking path still works.
        status.textContent = "We couldn't reach our system just now. Continuing to booking — mention this offer when you call.";
        setTimeout(close, 2200);
      });
    });
  }
})();
