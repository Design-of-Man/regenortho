/* RegenOrtho Palm Beach — patient forms
   =====================================================================
   HIPAA: this script NEVER transmits anything. There is no fetch(), no
   XHR, no beacon, no image ping, no third-party SDK. Answers live in the
   form elements; on finish they are rendered into a summary the patient
   prints or downloads locally. Persistence to localStorage is off unless
   the patient explicitly opts in, and one button clears it.

   If the practice later wants submissions delivered electronically, that
   requires a HIPAA-eligible destination under a signed Business
   Associate Agreement. Read the HIPAA NOTES section of README.md first —
   do NOT point this at FormSubmit, a plain mailbox, or any analytics or
   automation tool.
   ===================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("patient-form");
  if (!form) return;

  var root = form.closest(".form-main");
  var steps = Array.prototype.slice.call(form.querySelectorAll("[data-step]"));
  var railBtns = Array.prototype.slice.call(document.querySelectorAll(".f-step"));
  var errBox = form.querySelector(".f-errors");
  var btnPrev = form.querySelector("[data-prev]");
  var btnNext = form.querySelector("[data-next]");
  var btnFinish = form.querySelector("[data-finish]");
  var curOut = form.querySelector("[data-cur]");
  var done = root.querySelector(".f-done");
  var summary = document.getElementById("form-summary");
  var saveToggle = document.getElementById("save-local");
  var KEY = "rgp-form-" + form.getAttribute("data-form");
  var i = 0;

  /* ------------------------------------------------------------ steps */

  function show(n, focus) {
    i = Math.max(0, Math.min(n, steps.length - 1));
    steps.forEach(function (s, k) { s.hidden = k !== i; });
    railBtns.forEach(function (b, k) {
      b.classList.toggle("is-current", k === i);
      b.classList.toggle("is-done", k < i);
      if (k === i) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });
    btnPrev.hidden = i === 0;
    btnNext.hidden = i === steps.length - 1;
    btnFinish.hidden = i !== steps.length - 1;
    if (curOut) curOut.textContent = String(i + 1);
    if (focus !== false) {
      var h = steps[i].querySelector("h2");
      if (h) h.focus();
    }
  }

  btnNext.addEventListener("click", function () { show(i + 1); });
  btnPrev.addEventListener("click", function () { show(i - 1); });
  railBtns.forEach(function (b, k) {
    b.addEventListener("click", function () { show(k); });
  });

  /* --------------------------------------------- conditional follow-ups */
  /* A follow-up is hidden AND disabled when the answer isn't Yes, so it
     stays out of the tab order and out of the summary. */

  function syncFollow(name) {
    var wrap = form.querySelector('[data-follow-of="' + name + '"]');
    if (!wrap) return;
    var yes = form.querySelector('input[name="' + name + '"][value="Yes"]');
    var on = !!(yes && yes.checked);
    wrap.hidden = !on;
    wrap.querySelectorAll("input, textarea").forEach(function (el) { el.disabled = !on; });
  }

  form.querySelectorAll(".f-follow").forEach(function (w) { syncFollow(w.getAttribute("data-follow-of")); });
  form.addEventListener("change", function (e) {
    if (e.target.type === "radio") syncFollow(e.target.name);
    persist();
  });
  form.addEventListener("input", persist);

  /* -------------------------------------------------------- validation */

  function labelFor(el) {
    /* Radios are the group, so they take the legend. Everything else takes its
       own label — otherwise a conditional follow-up inside a yes/no fieldset
       would be titled with the parent question instead of "If yes, …". */
    if (el.type !== "radio") {
      var l = form.querySelector('label[for="' + el.id + '"]');
      if (l) return l.textContent.replace("*", "").trim();
    }
    var fs = el.closest("fieldset");
    var lg = fs && fs.querySelector("legend");
    return lg ? lg.textContent.replace("*", "").trim() : el.name;
  }

  function requiredFields() {
    var seen = {};
    return Array.prototype.slice.call(form.querySelectorAll("[required]")).filter(function (el) {
      if (el.disabled) return false;
      if (el.type === "radio") {
        if (seen[el.name]) return false;
        seen[el.name] = 1;
      }
      return true;
    });
  }

  function isFilled(el) {
    if (el.type === "radio") return !!form.querySelector('input[name="' + el.name + '"]:checked');
    if (el.type === "checkbox") return el.checked;
    return el.value.trim() !== "";
  }

  function validate() {
    var bad = [];
    requiredFields().forEach(function (el) {
      var ok = isFilled(el);
      var target = el.type === "radio" ? el.closest("fieldset") : el;
      if (target) target.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok) bad.push(el);
    });

    if (!bad.length) { errBox.hidden = true; errBox.innerHTML = ""; return true; }

    errBox.innerHTML = "<strong>Please complete " + bad.length +
      (bad.length === 1 ? " field" : " fields") + " before finishing:</strong><ul>" +
      bad.map(function (el) {
        return '<li><a href="#' + el.id + '" data-jump="' + el.id + '">' + labelFor(el) + "</a></li>";
      }).join("") + "</ul>";
    errBox.hidden = false;
    errBox.scrollIntoView({ block: "nearest" });
    return false;
  }

  errBox.addEventListener("click", function (e) {
    var a = e.target.closest("[data-jump]");
    if (!a) return;
    e.preventDefault();
    var el = document.getElementById(a.getAttribute("data-jump"));
    if (!el) return;
    var step = el.closest("[data-step]");
    show(steps.indexOf(step), false);
    el.focus();
  });

  /* ---------------------------------------------------- optional saving */
  /* Off by default: a shared or clinic device must not retain PHI. */

  function persist() {
    if (!saveToggle || !saveToggle.checked) return;
    try { localStorage.setItem(KEY, JSON.stringify(collect(true))); } catch (err) { /* quota / private mode */ }
  }

  function erase() {
    try { localStorage.removeItem(KEY); } catch (err) { /* nothing to do */ }
  }

  if (saveToggle) {
    saveToggle.addEventListener("change", function () {
      if (saveToggle.checked) persist();
      else erase();
    });
    try {
      var saved = localStorage.getItem(KEY);
      if (saved) {
        saveToggle.checked = true;
        restore(JSON.parse(saved));
      }
    } catch (err) { /* corrupt or unavailable — start clean */ }
  }

  function restore(data) {
    Object.keys(data).forEach(function (name) {
      var v = data[name];
      var els = form.querySelectorAll('[name="' + CSS.escape(name) + '"]');
      if (!els.length) return;
      if (els[0].type === "radio" || els[0].type === "checkbox") {
        var list = [].concat(v);
        els.forEach(function (el) { el.checked = list.indexOf(el.value) !== -1; });
        if (els[0].type === "radio") syncFollow(name);
      } else {
        els[0].value = v;
      }
    });
  }

  /* --------------------------------------------------------- collecting */

  function collect(raw) {
    var out = raw ? {} : [];
    var secs = steps;
    secs.forEach(function (sec) {
      var rows = [];
      sec.querySelectorAll("[name]").forEach(function (el) {
        if (el.disabled) return;
        var name = el.name;
        if (el.type === "checkbox") {
          if (!el.checked) return;
          var hit = rows.filter(function (r) { return r.name === name; })[0];
          if (hit) { hit.value += ", " + el.value; return; }
          if (raw) { out[name] = (out[name] || []).concat(el.value); return; }
          rows.push({ name: name, q: legendOf(el), value: el.value });
          return;
        }
        if (el.type === "radio") {
          if (!el.checked) return;
          if (raw) { out[name] = el.value; return; }
          rows.push({ name: name, q: legendOf(el), value: el.value });
          return;
        }
        if (!el.value.trim()) return;
        if (raw) { out[name] = el.value; return; }
        rows.push({ name: name, q: labelFor(el), value: pretty(el) });
      });
      if (!raw && rows.length) {
        var h = sec.querySelector("h2");
        out.push({ title: h ? h.textContent : "", rows: rows });
      }
    });
    return out;
  }

  function pretty(el) {
    var v = el.value.trim();
    var m = el.type === "date" && /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    return m ? m[2] + "/" + m[3] + "/" + m[1] : v;
  }

  function legendOf(el) {
    if (el.type === "checkbox" && el.id === "acknowledgment") return "Acknowledgment";
    var fs = el.closest("fieldset");
    var lg = fs && fs.querySelector("legend");
    return lg ? lg.textContent.replace("*", "").trim() : el.name;
  }

  /* ------------------------------------------------------------ summary */

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function render() {
    var data = collect(false);
    var name = (form.querySelector("#full-name") || {}).value || "";
    var html = data.map(function (sec) {
      return "<h3>" + esc(sec.title) + "</h3><dl>" + sec.rows.map(function (r) {
        return "<dt>" + esc(r.q) + "</dt><dd>" + esc(r.value) + "</dd>";
      }).join("") + "</dl>";
    }).join("");
    html += '<p class="f-summary-meta">' + esc(document.title.split("|")[0].trim()) +
            (name ? " — " + esc(name) : "") + " · completed " + new Date().toLocaleDateString("en-US") +
            "</p>";
    summary.innerHTML = html;
    return data;
  }

  function asText(data) {
    var lines = [document.title.split("|")[0].trim(), "RegenOrtho Palm Beach",
                 "Completed " + new Date().toLocaleDateString("en-US"), ""];
    data.forEach(function (sec) {
      lines.push(sec.title.toUpperCase());
      lines.push("-".repeat(sec.title.length));
      sec.rows.forEach(function (r) { lines.push(r.q + ": " + r.value); });
      lines.push("");
    });
    return lines.join("\n");
  }

  /* -------------------------------------------------------------- finish */

  form.addEventListener("submit", function (e) {
    e.preventDefault();              // there is nowhere to submit to, by design
    if (!validate()) return;
    var data = render();
    form.hidden = true;
    done.hidden = false;
    document.querySelector(".f-privacy").hidden = true;
    var h = done.querySelector("h2");
    if (h) h.focus();
    done.scrollIntoView({ block: "start" });
    done.__data = data;
  });

  root.querySelector("[data-print]").addEventListener("click", function () { window.print(); });

  root.querySelector("[data-edit]").addEventListener("click", function () {
    done.hidden = true;
    form.hidden = false;
    document.querySelector(".f-privacy").hidden = false;
    show(i, true);
  });

  function downloadFile() {
    var blob = new Blob([asText(done.__data || collect(false))], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = form.getAttribute("data-form") + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  root.querySelector("[data-download]").addEventListener("click", downloadFile);

  /* ---------------------------------------------------- email a copy */
  /* Still HIPAA-safe: no server involved. mailto: can't attach a file (no
     browser supports that), and its body has a hard length cap most mail
     clients silently truncate around ~1800-2000 chars — a full intake form
     summary blows past that. So this downloads the file (same as above)
     and opens a short, PHI-free mailto: draft asking the patient to attach
     the file they just downloaded before sending it. The "to" field
     defaults to the patient's own address from the form, never the
     practice's — it's the patient's mail client, the patient's choice
     where it goes from there. */
  var emailBtn = root.querySelector("[data-email]");
  if (emailBtn) {
    emailBtn.addEventListener("click", function () {
      downloadFile();
      var emailEl = form.querySelector("#email");
      var to = emailEl ? emailEl.value.trim() : "";
      var formName = document.title.split("|")[0].trim();
      var subject = formName + " — RegenOrtho Palm Beach";
      var body = "Your completed " + formName + " just downloaded to this device " +
        "(check Downloads) as a text file.\n\n" +
        "To send it, attach that file to this email before you hit send — " +
        "then forward it to our front desk or bring it to your appointment.\n\n" +
        "RegenOrtho Palm Beach · 833-783-6561";
      var href = "mailto:" + encodeURIComponent(to) +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      setTimeout(function () { location.href = href; }, 300);
    });
  }

  root.querySelector("[data-erase]").addEventListener("click", function () {
    if (!window.confirm("Erase your answers from this device? This cannot be undone.")) return;
    erase();
    form.reset();
    form.querySelectorAll(".f-follow").forEach(function (w) { syncFollow(w.getAttribute("data-follow-of")); });
    if (saveToggle) saveToggle.checked = false;
    summary.innerHTML = "";
    done.hidden = true;
    form.hidden = false;
    document.querySelector(".f-privacy").hidden = false;
    show(0);
  });

  show(0, false);
})();
