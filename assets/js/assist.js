/* RegenOrtho Palm Beach — concierge assistant.
   Set answers only (no AI, no external API): every reply below is served from
   the FAQ array. Keep answers factually accurate, give no medical advice, and
   route anything unknown to the front desk at 833-783-6561.
   Appointment requests are delivered via FormSubmit to the practice inbox;
   failures queue in localStorage and retry on the next page load. */
(function () {
  "use strict";

  var PHONE = "833-783-6561";
  var PHONE_TEL = "+18337836561";
  var EMAIL = "info@regenorthopalmbeach.com";
  var FORM_TARGET_EMAIL = "emily@regenorthopb.com";
  var ENDPOINT = "https://formsubmit.co/ajax/" + FORM_TARGET_EMAIL;
  var LS_DRAFT = "rga-draft-v1";
  var LS_QUEUE = "rga-queue-v1";

  var root = depthPrefix();
  function depthPrefix() {
    var path = location.pathname;
    var segs = path.split("/").filter(Boolean);
    if (path.endsWith("/")) return "";
    var depth = Math.max(segs.length - 1, 0);
    var out = "";
    for (var i = 0; i < depth; i++) out += "../";
    return out;
  }

  var FAQ = [
    { k: ["hour", "open", "close", "time", "when"],
      a: "We're open Monday through Friday, 8:00 AM to 5:00 PM.\nCall " + PHONE + " (833-STEM561) to schedule." },
    { k: ["where", "location", "address", "directions", "find you", "located"],
      a: "We're at 11380 Prosperity Farms Road, Suite 204–208, Palm Beach Gardens, FL 33410 — serving Jupiter, North Palm Beach, Juno Beach, Tequesta, and the greater Palm Beach area." },
    { k: ["phone", "call", "number", "contact"],
      a: "Call or text us at " + PHONE + " — that's 833-STEM561. You can also email " + EMAIL + "." },
    { k: ["insurance", "covered", "coverage", "medicare", "aetna", "cigna", "united", "blue cross"],
      a: "We work with most major insurance providers and will help verify your coverage before treatment. For uninsured services we offer flexible payment plans and transparent direct-pay packages. For your specific plan, call " + PHONE + " and our team will check for you." },
    { k: ["form", "forms", "paperwork", "intake", "questionnaire", "new patient", "fill out"],
      a: "You can fill out your paperwork at home before your visit — there's a new patient intake form and a peptide & GLP-1 questionnaire at regenorthopb.com/forms.\nBoth fill out right in your browser and nothing is sent over the internet: when you finish, the form builds a summary you print, save as a PDF, or bring in. Prefer to do it here? Arrive fifteen minutes early and our front desk will set you up on a tablet." },
    { k: ["referral", "refer"],
      a: "No referral is required — you can book directly with our specialists for a consultation." },
    { k: ["first visit", "first appointment", "expect", "new patient", "intake"],
      a: "Your first visit includes a thorough consultation, medical history review, and diagnostic evaluation if needed. Bring a list of your medications, wear comfortable clothing, and note any recent symptoms. From there we build your personalized treatment plan." },
    { k: ["prp", "platelet"],
      a: "PRP (platelet-rich plasma) uses concentrated platelets from your own blood, injected under image guidance to support healing in tendons, ligaments, and joints. It's part of our Regenerative Medicine & Orthobiologics service — a consultation determines whether you're a candidate." },
    { k: ["stem", "cellular", "exosome", "regenerative", "orthobiologic", "biologic", "muse", "wharton", "mesenchymal", "jelly"],
      a: "Our regenerative program includes PRP, Exosome Therapy, Mesenchymal Stem Cell Therapy, Wharton's Jelly Therapy, MUSE-Infused RPA™ Therapy, and Traditional MUSE® Cell Therapy — all physician-directed. Consultation and imaging review is $300 (credited toward treatment), with treatment starting from $2,500. These are self-pay services, not covered by insurance, and none are FDA-approved to treat, cure or prevent any disease. Whether one fits your condition depends on an in-person evaluation." },
    { k: ["shockwave", "epat", "laser"],
      a: "Yes — we offer EPAT shockwave therapy and cold laser as part of Advanced Non-Surgical Therapies. They're used for chronic tendon problems and stubborn soft-tissue injuries, usually as a short series of in-office sessions." },
    { k: ["iv", "drip", "infusion", "nad", "myers", "hydration", "hangover", "vitamin"],
      a: "Our IV Lounge menu runs from $189 (Hydration) to $499 (NAD⁺ 500 mg), including Myers' PLUS, Immune Boost, Athletic Recovery, and the All-Inclusive. Every drip is clinician-supervised with a quick pre-screen. See the full menu on the IV Therapy page or book a time by phone." },
    { k: ["price", "cost", "how much", "pricing", "fee"],
      a: "Pricing depends on the service: IV drips run $189–$499, medical weight loss plans start at $239/month, and concierge procedures use transparent bundled pricing. For an exact quote for your situation, call " + PHONE + " — the team will walk you through options and insurance." },
    { k: ["weight", "glp", "ozempic", "wegovy", "zepbound", "semaglutide"],
      a: "Our physician-supervised medical weight loss program includes personalized dosing and ongoing monitoring, with compounded therapies and FDA-approved GLP-1 medications (Ozempic®, Zepbound®, Wegovy®) when appropriate. Plans start at $239/month, beginning with a medical intake assessment." },
    { k: ["misha", "shock absorber", "implant knee", "mako", "robotic", "knee replacement", "joint replacement", "arthroscopy", "surgery"],
      a: "Surgical knee care — including Mako robotic-assisted replacement and the MISHA implantable shock absorber — is handled by Dr. Matarazzo at Elite Sports Medicine (elitesportsmed.org). Here at RegenOrtho we focus on the non-surgical side: regenerative injections and joint-preservation therapy that may delay or avoid surgery. Call " + PHONE + " and we'll point you to the right one." },
    { k: ["neuropathy", "burning", "tingling", "numbness", "nerve"],
      a: "The Neuropathy Restoration Program targets the root cause of nerve damage — combining IV therapy with B12, regenerative injections, cold laser, therapeutic ultrasound, and advanced diagnostics. Book a consultation to see whether the program fits your symptoms." },
    { k: ["vein", "varicose", "spider", "sclerotherapy", "ablation"],
      a: "Our vein program covers both medical and cosmetic care: duplex ultrasound mapping, endovenous laser & RF ablation, sclerotherapy, and in-office phlebectomy. Medical vein care is often insurance-covered; we verify benefits for you." },
    { k: ["orthotic", "insole", "heel", "plantar", "fasciitis", "foot", "ankle", "bunion", "hammertoe", "podiat", "toenail"],
      a: "Foot and ankle care — heel pain, bunions, hammertoes, custom orthotics, and foot & ankle surgery — is handled by Dr. Cedeno at Abacoa Podiatry & Leg Vein Center (jupiterlaser.com). Call " + PHONE + " and we'll get you to the right office." },
    { k: ["doctor", "surgeon", "matarazzo", "cedeno", "who", "team", "provider", "nurse", "emily", "bahnick"],
      a: "Our physicians: Dr. Marc Matarazzo, MD — board-certified sports medicine & orthopedic surgeon (23+ years) — and Dr. Orlando Cedeno, DPM — board-certified podiatric surgeon & vein specialist.\nEmily Bahnick, MSN, RN is our IV infusion nurse and care coordinator, with MSN & BSN degrees and 10+ years of nursing experience." },
    { k: ["ivig", "krystexxa", "ocrevus", "ultomiris", "specialty infusion"],
      a: "Our Specialty Infusion Center administers physician-prescribed IVIG, Krystexxa, Ocrevus, and Ultomiris in private, monitored suites with insurance coordination. Have your prescription or referral ready and call " + PHONE + " to get scheduled." },
    { k: ["concierge", "cash", "direct pay", "same day", "membership"],
      a: "Concierge & Direct-Pay Care offers one-on-one specialist access, same-day diagnostics and treatment planning, private suites, and transparent bundled pricing. It's ideal if you value speed and privacy." },
    { k: ["emergency", "urgent", "911"],
      a: "If this is a medical emergency, call 911 or go to the nearest emergency room — this assistant isn't monitored in real time. For urgent orthopedic injuries during office hours, call " + PHONE + " and we'll prioritize you, often same-day." },
    { k: ["surgery", "avoid surgery", "need surgery", "replacement", "operation"],
      a: "Not necessarily. Many conditions respond to advanced, non-surgical, or minimally invasive care — surgery is only recommended when it's genuinely the safest, most effective option. Dr. Matarazzo is both a surgeon and a regenerative specialist, so the same physician can tell you honestly which one you actually need." },
    { k: ["result", "results", "how long", "when will i", "improve", "recovery time"],
      a: "It depends on the treatment. Some patients notice change within weeks; regenerative therapies often develop fully over the following months as tissue heals. Your specialist will give you a realistic timeline for your specific plan at consultation." },
    { k: ["safe", "safety", "risk", "side effect"],
      a: "All our regenerative therapies are physician-directed, personalized, and backed by clinical research, with patient safety as the top priority. That said, none of our regenerative and cellular therapies are FDA-approved to treat, cure, or prevent any disease — your specialist will walk you through the specifics for your treatment." },
    { k: ["difference between prp", "prp vs", "cellular vs", "exosome vs", "which regenerative"],
      a: "PRP concentrates your own blood platelets to stimulate healing. Cellular and exosome therapies work at the cellular level using umbilical cord-derived material or cell-signaling vesicles. Wharton's Jelly, MUSE-Infused RPA, and Traditional MUSE Cell Therapy are further variations — your specialist matches the modality to your condition at consultation." },
    { k: ["reviews", "testimonials", "google reviews", "rating"],
      a: "We're rated 4.9 on Google from patients we've helped in the Palm Beach area. You can also see real patient stories and behind-the-scenes content on Instagram @regenortho_palmbeach." },
    { k: ["parking", "directions", "map", "get there"],
      a: "We're at 11380 Prosperity Farms Road, Suite 204–208, Palm Beach Gardens, FL 33410 — see regenorthopb.com/contact.html for a map and directions." },
    { k: ["book", "schedule", "appointment", "consult", "consultation"],
      a: "I can take your appointment request right now — tap \"Request an appointment\" below, or call " + PHONE + " if you'd rather book by phone." },
    { k: ["guide", "ebook", "e-book", "download", "free guide", "book by dr"],
      a: "Dr. Cedeno wrote a free 28-page patient guide on regenerative foot & ankle care — look for it on our Instagram @regenortho_palmbeach or ask our front desk at your visit." },
    { k: ["candidate", "am i a candidate", "qualify", "eligible"],
      a: "Candidacy for any of our therapies is determined after a consultation — reviewing your symptoms, medical history, and imaging where needed. There's no way to say for certain without that evaluation, but booking one is quick and there's no obligation." },
    { k: ["cancel", "reschedule", "change appointment", "running late"],
      a: "No problem — call " + PHONE + " and our front desk will get you rescheduled." },
  ];

  /* ------------------------------------------------------------------ UI */
  var launcher, panel, log, inputWrap, input, sendBtn;
  var mode = "menu"; // menu | ask | booking
  var bookStep = 0;
  var draft = load(LS_DRAFT) || {};

  function el(tag, cls, htmlStr) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (htmlStr != null) e.innerHTML = htmlStr;
    return e;
  }
  function load(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } }
  function save(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

  function build() {
    launcher = el("button", "rga-launch",
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 3C6.9 3 3 6.5 3 10.8c0 2.4 1.2 4.5 3.2 5.9L5.6 20c-.1.5.4.9.8.7l3.6-1.8c.6.1 1.3.2 2 .2 5.1 0 9-3.5 9-7.8S17.1 3 12 3z"/></svg>Questions? Ask us<span class="rga-dot" aria-hidden="true"></span>');
    launcher.setAttribute("aria-label", "Open the RegenOrtho assistant");
    document.body.appendChild(launcher);

    panel = el("div", "rga-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "RegenOrtho concierge assistant");
    panel.innerHTML =
      '<div class="rga-head">' +
      '<span class="rga-avatar" aria-hidden="true"><svg viewBox="0 0 64 64" width="26" height="26"><circle cx="32" cy="32" r="30" fill="#092D5C"/><path d="M32 18c-2 5-8 7-12 6 3 3 8 4 10 3-4 3-9 9-9 15 0 0 5-8 11-11-1 6 0 12 3 16 1-5 1-11 0-16 4 2 8 7 9 11 1-6-3-12-7-15 3 0 7-2 9-5-4 1-9 0-12-3 0 0-1-1-2-1z" fill="#FDC929"/></svg></span>' +
      '<div class="rga-head-info"><strong>RegenOrtho Concierge</strong><span>Instant answers · appointment requests 24/7</span></div>' +
      '<button class="rga-close" aria-label="Close assistant"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M4 4l12 12M16 4L4 16"/></svg></button>' +
      '</div>' +
      '<div class="rga-log" aria-live="polite"></div>' +
      '<div class="rga-input" hidden><input type="text" autocomplete="off" placeholder="Type here…" aria-label="Your message"><button class="rga-send" aria-label="Send"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M2 10 18 2l-4 8 4 8z"/></svg></button></div>' +
      '<p class="rga-fine">Not for emergencies — call 911. General info only, not medical advice.</p>';
    document.body.appendChild(panel);

    log = panel.querySelector(".rga-log");
    inputWrap = panel.querySelector(".rga-input");
    input = inputWrap.querySelector("input");
    sendBtn = inputWrap.querySelector(".rga-send");

    launcher.addEventListener("click", open);
    panel.querySelector(".rga-close").addEventListener("click", close);
    sendBtn.addEventListener("click", submitInput);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") submitInput(); });
    // keep the newest message and the input visible as the keyboard opens
    input.addEventListener("focus", function () {
      setTimeout(function () { fitViewport(); log.scrollTop = log.scrollHeight; }, 250);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) close();
    });
  }

  /* ---- iOS keyboard handling -------------------------------------------
     The only reliable source of "where is the visible area right now" is
     visualViewport. Without it the panel is anchored to the layout viewport,
     which iOS does not shrink for the keyboard, so the input ends up behind
     it. We size the sheet to the visual viewport and shift it by offsetTop. */
  var mobileMQ = window.matchMedia("(max-width: 600px)");
  var vv = window.visualViewport;
  var lockedY = 0;

  function fitViewport() {
    if (!vv || !mobileMQ.matches || !panel.classList.contains("is-open")) return;
    panel.style.setProperty("--rga-h", vv.height + "px");
    panel.style.setProperty("--rga-top", vv.offsetTop + "px");
  }
  function clearViewport() {
    panel.style.removeProperty("--rga-h");
    panel.style.removeProperty("--rga-top");
  }
  if (vv) {
    vv.addEventListener("resize", fitViewport);
    vv.addEventListener("scroll", fitViewport);
  }

  function lockScroll() {
    if (!mobileMQ.matches) return;
    lockedY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = -lockedY + "px";
    document.body.classList.add("rga-locked");
  }
  function unlockScroll() {
    if (!document.body.classList.contains("rga-locked")) return;
    // the site sets scroll-behavior:smooth, which turns the restore into an
    // animation and lands somewhere else entirely — force it instant
    var html = document.documentElement;
    var prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    document.body.classList.remove("rga-locked");
    document.body.style.top = "";
    window.scrollTo(0, lockedY);       // restore exactly where they were
    html.style.scrollBehavior = prev;
  }

  function open() {
    panel.classList.add("is-open");
    launcher.style.display = "none";
    if (!log.childElementCount) greet();
    lockScroll();
    fitViewport();
    // iOS only raises the keyboard for a focus inside a user gesture, and only
    // once the element is actually laid out — hence the next frame.
    requestAnimationFrame(function () { input.focus({ preventScroll: true }); });
  }
  function close() {
    panel.classList.remove("is-open");
    launcher.style.display = "";
    input.blur();
    unlockScroll();
    clearViewport();
  }

  mobileMQ.addEventListener("change", function () {
    if (!mobileMQ.matches) { unlockScroll(); clearViewport(); }
    else fitViewport();
  });

  function say(text, cls) {
    var m = el("div", "rga-msg " + (cls || "rga-msg-bot"), text);
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    return m;
  }
  function sayUser(text) { say(escapeHtml(text), "rga-msg-user"); }
  function typing(fn, delay) {
    var t = el("div", "rga-msg rga-msg-bot rga-typing", "<i></i><i></i><i></i>");
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
    setTimeout(function () { t.remove(); fn(); }, delay || 650);
  }
  function chips(list) {
    var wrap = el("div", "rga-chips");
    list.forEach(function (c) {
      var b = el("button", "rga-chip" + (c.gold ? " rga-chip-gold" : ""), c.label);
      b.addEventListener("click", function () { wrap.remove(); c.go(); });
      wrap.appendChild(b);
    });
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function menuChips() {
    chips([
      { label: "Request an appointment", gold: true, go: startBooking },
      { label: "Ask a question", go: startAsk },
      { label: "IV Lounge menu", go: function () { location.href = root + "iv-therapy.html"; } },
      { label: "Call " + PHONE, go: function () { location.href = "tel:" + PHONE_TEL; } },
    ]);
  }

  function greet() {
    typing(function () {
      say("Welcome to RegenOrtho Palm Beach 👋\nI can answer common questions instantly, or take your appointment request and send it straight to our front desk.");
      menuChips();
    }, 500);
  }

  /* ------------------------------------------------------------- ask */
  function startAsk() {
    mode = "ask";
    inputWrap.hidden = false;
    typing(function () {
      say("Ask me anything about our services, pricing, insurance, hours, or the doctors — I'll answer from our official info.\nType your question below 👇");
      input.focus({ preventScroll: true });
    });
  }

  function answer(q) {
    var ql = q.toLowerCase();
    var best = null, bestScore = 0;
    FAQ.forEach(function (f) {
      var score = 0;
      f.k.forEach(function (kw) { if (ql.indexOf(kw) !== -1) score += kw.length; });
      if (score > bestScore) { bestScore = score; best = f; }
    });
    if (best) {
      say(escapeHtml(best.a).replace(/\n/g, "<br>"));
    } else {
      say("Great question — I don't want to guess on that one. The front desk will have your exact answer:<br><a href=\"tel:" + PHONE_TEL + "\">" + PHONE + "</a> (Mon–Fri 8–5) or <a href=\"mailto:" + EMAIL + "\">" + EMAIL + "</a>.");
    }
    chips([
      { label: "Request an appointment", gold: true, go: startBooking },
      { label: "Back to menu", go: function () { mode = "menu"; inputWrap.hidden = true; menuChips(); } },
    ]);
  }

  /* --------------------------------------------------------- booking */
  var BOOK_STEPS = [
    { key: "name", q: "Perfect — let's get you on the schedule. What's your full name?",
      valid: function (v) { return v.trim().length >= 2; }, err: "Could you share your full name?" },
    { key: "phone", q: "Thanks, {name}! What's the best phone number to reach you?",
      valid: function (v) { return v.replace(/\D/g, "").length >= 10; }, err: "That number looks short — a 10-digit phone number works best." },
    { key: "email", q: "Got it. And your email address?",
      valid: function (v) { return /.+@.+\..+/.test(v.trim()); }, err: "Hmm, that doesn't look like an email — mind checking it?" },
    { key: "service", q: "Which service are you interested in? (Or 'not sure' — that's fine too.)", chips: [
        "Regenerative Medicine", "Advanced Non-Surgical Therapies", "Peptide Therapy",
        "IV Therapy", "Vein Care", "Neuropathy Program",
        "Weight Loss / GLP-1", "Concierge Care", "Not sure yet"] },
    { key: "timing", q: "When would you like to come in? (e.g. \"this week\", \"Tuesday morning\", \"ASAP\")" },
    { key: "message", q: "Anything else you'd like the front desk to know before your visit? This step is optional.\nJust a heads up: please don't include medical history or symptoms here — we'll take that securely at your visit.", chips: ["Skip this step"] },
  ];

  function startBooking() {
    mode = "booking";
    bookStep = 0;
    inputWrap.hidden = false;
    askStep();
  }

  function askStep() {
    var s = BOOK_STEPS[bookStep];
    var q = s.q.replace("{name}", (draft.name || "").split(" ")[0]);
    typing(function () {
      say(escapeHtml(q));
      if (s.chips) {
        chips(s.chips.map(function (label) {
          return { label: label, go: function () { sayUser(label); acceptStep(label); } };
        }));
      }
      input.focus({ preventScroll: true });
    });
  }

  function acceptStep(value) {
    var s = BOOK_STEPS[bookStep];
    var v = value.trim();
    if (s.key === "message" && v === "Skip this step") v = "";
    draft[s.key] = v;
    draft.updated = Date.now();
    save(LS_DRAFT, draft);
    bookStep++;
    if (bookStep < BOOK_STEPS.length) askStep();
    else finishBooking();
  }

  function finishBooking() {
    inputWrap.hidden = true;
    typing(function () {
      var msgLine = draft.message ? "<br>💬 " + escapeHtml(draft.message) : "";
      say("Here's what I'll send to the front desk:<br><strong>" + escapeHtml(draft.name) + "</strong><br>📞 " + escapeHtml(draft.phone) + "<br>✉️ " + escapeHtml(draft.email) + "<br>🏥 " + escapeHtml(draft.service) + "<br>🗓 " + escapeHtml(draft.timing) + msgLine);
      chips([
        { label: "Send it ✓", gold: true, go: deliver },
        { label: "Start over", go: startBooking },
      ]);
    });
  }

  function payload() {
    return {
      _subject: "New appointment request (site assistant) — " + draft.name,
      name: draft.name, phone: draft.phone, email: draft.email,
      service: draft.service, preferred_time: draft.timing, message: draft.message || "",
      source: "regenorthopb.com concierge assistant, " + location.pathname,
    };
  }

  function deliver() {
    typing(function () {
      var m = say("Sending…");
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload()),
      }).then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        m.remove();
        say("Sent! 🎉 Our team will reach out to confirm your appointment — usually within one business day.<br>Need us sooner? Call <a href=\"tel:" + PHONE_TEL + "\">" + PHONE + "</a>.");
        localStorage.removeItem(LS_DRAFT);
        draft = {};
        mode = "menu";
        menuChips();
      }).catch(function () {
        m.remove();
        var q = load(LS_QUEUE) || [];
        q.push(payload());
        save(LS_QUEUE, q);
        say("I couldn't reach our system just now, so I've saved your request on this device and will retry automatically. To lock in a time right away, call <a href=\"tel:" + PHONE_TEL + "\">" + PHONE + "</a>.");
        mode = "menu";
        menuChips();
      });
    });
  }

  function retryQueue() {
    var q = load(LS_QUEUE) || [];
    if (!q.length) return;
    var item = q[0];
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(item),
    }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      q.shift();
      save(LS_QUEUE, q);
      if (q.length) retryQueue();
    }).catch(function () {});
  }

  function submitInput() {
    var v = input.value.trim();
    if (!v) return;
    input.value = "";
    sayUser(v);
    if (mode === "booking") {
      var s = BOOK_STEPS[bookStep];
      if (s.valid && !s.valid(v)) {
        typing(function () { say(escapeHtml(s.err)); });
        return;
      }
      acceptStep(v);
    } else {
      typing(function () { answer(v); });
    }
  }

  build();
  retryQueue();
  window.RGAssist = { open: open, close: close };
})();
