/* RegenOrtho Palm Beach — lead delivery.

   ONE queue, ONE endpoint, shared by the contact form (main.js) and the
   concierge assistant (assist.js). Both used to be able to drop a lead on the
   floor in different ways; this file is the single place that can no longer.

   Delivery is FormSubmit's AJAX endpoint. That address requires a one-time
   activation click on the first submission (see README) — until that happens
   every POST here fails, which is exactly why the queue below exists.

   Contact details only. NEVER route the patient intake forms through this:
   /forms/* collects PHI and FormSubmit is not a HIPAA-eligible destination
   under a BAA. See CLAUDE.md → "Patient forms — HIPAA".  */
(function () {
  "use strict";

  var EMAIL = "info@regenorthopalmbeach.com";
  var ENDPOINT = "https://formsubmit.co/ajax/" + EMAIL;
  var LS_QUEUE = "rga-queue-v1";

  // A queued lead is a person waiting for a callback, so the bounds are gentle:
  // hold plenty, but don't keep a lead so stale that calling back is worse than
  // not calling. MAX_TRIES stops one poisoned item blocking the ones behind it.
  var MAX_QUEUE = 25;
  var MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;   // 14 days
  var MAX_TRIES = 8;

  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(LS_QUEUE) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }

  function save(q) {
    try { localStorage.setItem(LS_QUEUE, JSON.stringify(q)); } catch (e) {}
  }

  function fresh(q) {
    var now = Date.now();
    return q.filter(function (it) {
      if (!it || typeof it !== "object") return false;
      if ((it._tries || 0) >= MAX_TRIES) return false;
      var born = it._queued_at || 0;
      return !born || (now - born) < MAX_AGE_MS;
    });
  }

  function post(body) {
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(body),
    }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r;
    });
  }

  // Strip our own bookkeeping so the practice's email doesn't carry _tries.
  function wire(item) {
    var out = {};
    for (var k in item) {
      if (Object.prototype.hasOwnProperty.call(item, k) && k !== "_tries" && k !== "_queued_at") {
        out[k] = item[k];
      }
    }
    if (item._queued_at) {
      // A delayed lead must say so, or the front desk calls a two-week-old
      // request thinking it came in this morning.
      out.queued_at = new Date(item._queued_at).toLocaleString();
      out.delayed_delivery = "This request failed to send when submitted and was retried later.";
    }
    return out;
  }

  function enqueue(payload) {
    var q = fresh(load());
    payload._queued_at = payload._queued_at || Date.now();
    payload._tries = payload._tries || 0;
    q.push(payload);
    if (q.length > MAX_QUEUE) q = q.slice(q.length - MAX_QUEUE);
    save(q);
  }

  // Walks the WHOLE queue rather than stopping at the first failure — a single
  // bad item used to stall every lead behind it forever.
  function drain() {
    var q = fresh(load());
    save(q);
    if (!q.length) return;

    var i = 0;
    (function step() {
      if (i >= q.length) return;
      var item = q[i];
      post(wire(item)).then(function () {
        q.splice(i, 1);
        save(q);
        step();
      }).catch(function () {
        item._tries = (item._tries || 0) + 1;
        i++;
        save(fresh(q));
        step();
      });
    })();
  }

  /* send(payload) -> Promise. Resolves on delivery; on failure the lead is
     queued for the next page load and the promise REJECTS so the caller can
     show its own "saved, we'll retry" message. */
  function send(payload) {
    return post(payload).catch(function (err) {
      enqueue(payload);
      throw err;
    });
  }

  window.RGLead = { send: send, enqueue: enqueue, drain: drain, endpoint: ENDPOINT };

  drain();
})();
