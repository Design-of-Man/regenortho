/* RegenOrtho Palm Beach — appointment form submit handler.
   Progressive enhancement: every form works as a plain POST to FormSubmit
   without this script (visitors land on FormSubmit's own "Thanks!" page).
   With JS, we intercept the submit and post to FormSubmit's AJAX endpoint
   instead, so the visitor never leaves the page and gets an immediate,
   personalized confirmation — no redirect, nothing that can 404.

   Binds by [data-appt-form], not by id: the contact page has one form, but a
   service page carries the short appt_form in its CTA band and could carry
   more. Each form's success/error elements are scoped to its OWN wrapper so
   two forms on one page can never reach across and confirm each other. */
(function () {
  "use strict";

  document.querySelectorAll("form[data-appt-form]").forEach(function (form) {
    // Scope to this form's own wrapper first; fall back to the contact page's
    // original ids, which predate the wrapper.
    var wrap = form.closest(".appt-form-wrap");
    var scope = wrap || document;
    var success = scope.querySelector(".contact-success") ||
                  document.getElementById("contact-success");
    var successName = (success && success.querySelector(".appt-success-name")) ||
                      document.getElementById("contact-success-name");
    var errorBox = (wrap && wrap.querySelector(".form-error")) ||
                   form.querySelector(".form-error") ||
                   document.getElementById("contact-error");
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.textContent : "";

    // The form's action already points at formsubmit.co/{email} for the
    // no-JS fallback — insert "ajax/" to get the JSON endpoint rather than
    // duplicating the destination address here.
    var endpoint = form.action.replace("formsubmit.co/", "formsubmit.co/ajax/");

    form.addEventListener("submit", function (e) {
      if (!form.reportValidity()) return;
      e.preventDefault();
      if (errorBox) errorBox.hidden = true;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

      var data = new FormData(form);
      var payload = {};
      data.forEach(function (value, key) { payload[key] = value; });

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
      }).then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        var first = (payload.name || "").trim().split(" ")[0];
        if (successName) successName.textContent = first || "there";
        form.hidden = true;
        if (success) { success.hidden = false; success.focus(); }
        // GA4 key event. The `source` value is the same string that lands in
        // Emily's subject line, so the GA4 report and the inbox reconcile
        // against each other. Guarded on window.gtag, which is deliberately
        // absent on /forms/* (HIPAA) — fire-and-forget, never throws.
        try {
          if (window.gtag) {
            window.gtag("event", "generate_lead", {
              source: payload.source || "unknown",
              service: payload.service || "",
              path: window.location.pathname
            });
          }
        } catch (err) {}
      }).catch(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitLabel; }
        if (errorBox) errorBox.hidden = false;
      });
    });
  });
})();
