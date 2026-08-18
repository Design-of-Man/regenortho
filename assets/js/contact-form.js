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
    }).catch(function () {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitLabel; }
      if (errorBox) errorBox.hidden = false;
    });
  });
})();
