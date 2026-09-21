/* RegenOrtho Palm Beach — contact page appointment form.
   Progressive enhancement: the form works as a plain POST to FormSubmit
   without this script (visitors land on FormSubmit's own "Thanks!" page).
   With JS, we intercept the submit and post to FormSubmit's AJAX endpoint
   instead, so the visitor never leaves the page and gets an immediate,
   personalized confirmation — no redirect, nothing that can 404. */
(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var success = document.getElementById("contact-success");
  var successName = document.getElementById("contact-success-name");
  var errorBox = document.getElementById("contact-error");
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

    /* Mark the submission as having come through this page.
       Every hidden field in the form -- _subject included -- arrives at
       FormSubmit identically whether a person filled the form in or
       something scraped the markup and replayed it, so the inbox cannot
       tell the two apart and neither can anything reading it afterwards.
       Only a value set HERE, by script, at submit time, can: anything
       posting straight to formsubmit.co never runs this line and keeps the
       bare subject built into the markup.
       The prefix is left alone so existing inbox filters on
       "[Contact Form]" keep matching; the suffix is additive.
       LABELLING, NOT BLOCKING. Nothing here rejects or drops a submission
       -- an unmarked one is still a lead, delivered identically, and may
       well be a real patient whose JavaScript simply did not run (this
       form posts natively without it, by design). The marker exists so the
       question "was this a person on the site?" is answerable at all. */
    payload._subject = (payload._subject || "") + " (from website)";
    payload.verified = "yes";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    }).then(function (data) {
      /* FormSubmit answers 200 with {"success":"false"} when the recipient
         address has never been activated: the submission is accepted and
         dropped. Reading only the status code would hide the form, show the
         thank-you panel and fire the form_submit conversion for a lead that
         never arrived. Believe the body instead. */
      if (!data || String(data.success).toLowerCase() !== "true") {
        throw new Error("not delivered");
      }
      var first = (payload.name || "").trim().split(" ")[0];
      if (successName) successName.textContent = first || "there";
      form.hidden = true;
      if (success) { success.hidden = false; success.focus(); }
      /* Completed submit — the end of the lead funnel main.js tracks. Routed
         through RGLead so the window.va / window.gtag guards live in one
         place. Deliberately NO field values in the payload: the visitor has
         just typed their name, phone and reason for calling, and none of that
         belongs in an analytics event. */
      if (window.RGLead) window.RGLead.track("form_submit", "form_submit", { form: "contact" });
    }).catch(function () {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitLabel; }
      if (errorBox) errorBox.hidden = false;
    });
  });
})();
