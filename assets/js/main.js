/* RegenOrtho Palm Beach — interactions
   Nav, scroll reveals, counters, marquees, testimonial rotator,
   hero figure attract cycle, FAQ filter/search. No dependencies. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- nav */
  var toggle = document.querySelector(".nav-toggle");
  var body = document.body;
  var mobileMQ = window.matchMedia("(max-width: 1160px)"); // keep in sync with CSS

  function closeMenu() {
    body.classList.remove("nav-locked");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.querySelectorAll(".has-drop.is-open").forEach(function (li) {
      li.classList.remove("is-open");
      var b = li.querySelector(".drop-btn");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-locked");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll(".drop-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var li = btn.closest(".has-drop");
      var wasOpen = li.classList.contains("is-open");
      document.querySelectorAll(".has-drop.is-open").forEach(function (o) {
        if (o !== li) {
          o.classList.remove("is-open");
          var ob = o.querySelector(".drop-btn");
          if (ob) ob.setAttribute("aria-expanded", "false");
        }
      });
      li.classList.toggle("is-open", !wasOpen);
      btn.setAttribute("aria-expanded", String(!wasOpen));
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-drop")) {
      document.querySelectorAll(".has-drop.is-open").forEach(function (li) {
        li.classList.remove("is-open");
        var b = li.querySelector(".drop-btn");
        if (b) b.setAttribute("aria-expanded", "false");
      });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  mobileMQ.addEventListener("change", closeMenu);

  /* ---------------------------------------------------- hero video pick */
  /* The <video> ships with NO <source> children. Exactly one rendition pair is
     attached here, so phones never fetch the 4K/HD URLs, and nothing downloads
     at all under reduced-motion or Save-Data. 4K only goes to screens that can
     actually resolve it AND aren't on a metered connection. */
  var heroVid = document.querySelector("[data-hero-video]");
  if (heroVid) {
    var conn = navigator.connection || {};
    var saveData = !!conn.saveData || /(^|\b)2g/.test(conn.effectiveType || "");
    if (reduceMotion || saveData) {
      heroVid.removeAttribute("autoplay");   // poster only
    } else {
      var isMobile = window.matchMedia("(max-width: 767px)").matches;
      // A landscape file cover-fitted into a tall portrait hero is scaled ~2.9x
      // and loses most of the frame. Portrait phones get a 9:16 crop instead.
      var isPortrait = isMobile && window.matchMedia("(orientation: portrait)").matches
                       && !!heroVid.getAttribute("data-mp4-portrait");
      var wantMax = !isMobile && window.innerWidth >= 1200 &&
                    (window.devicePixelRatio || 1) * window.innerWidth >= 2200;
      var mp4 = isPortrait ? heroVid.getAttribute("data-mp4-portrait")
              : isMobile ? heroVid.getAttribute("data-mp4-mobile")
              : wantMax ? heroVid.getAttribute("data-mp4-max")
              : heroVid.getAttribute("data-mp4-hd");
      var webm = isPortrait ? heroVid.getAttribute("data-webm-portrait")
               : isMobile ? heroVid.getAttribute("data-webm-mobile")
               : wantMax ? heroVid.getAttribute("data-webm-hd")   // VP9 fallback for max tier too
               : heroVid.getAttribute("data-webm-hd");
      var s1 = document.createElement("source");
      s1.src = mp4; s1.type = "video/mp4";
      heroVid.appendChild(s1);
      if (webm) {
        var s2 = document.createElement("source");
        s2.src = webm; s2.type = "video/webm";
        heroVid.appendChild(s2);
      }
      heroVid.load();
      // The CSS coastline scene sits underneath as the fallback, but once the
      // video is actually painting it's fully covered — yet its dozens of
      // blurred, continuously-animating layers (waves, clouds, birds, sparkles)
      // keep compositing every frame for nothing. Hiding it once playback
      // starts removes that wasted work without touching the fallback path.
      var heroEl = heroVid.closest(".hero");
      heroVid.addEventListener("playing", function () {
        if (heroEl) heroEl.classList.add("video-live");
      }, { once: true });
      var tryPlay = function () {
        var pr = heroVid.play();
        if (pr && pr.catch) pr.catch(function () { /* autoplay veto → poster stays */ });
      };
      if (heroVid.readyState >= 2) tryPlay();
      else heroVid.addEventListener("canplay", tryPlay, { once: true });
    }
  }

  /* -------------------------------------------- header on scroll only */
  var header = document.querySelector(".site-header");
  if (header) {
    var stuck = false;
    var applyStuck = function () {
      var should = window.scrollY > 24;
      if (should !== stuck) { stuck = should; header.classList.toggle("is-stuck", should); }
    };
    window.addEventListener("scroll", applyStuck, { passive: true });
    applyStuck();
  }

  /* ------------------------------------------------------------ reveals */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------- counters */
  var counters = document.querySelectorAll(".stat-num");
  if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target;
        var target = parseInt(el.getAttribute("data-count"), 10) || 0;
        var t0 = null;
        var dur = 1600;
        function tick(t) {
          if (!t0) t0 = t;
          var k = Math.min((t - t0) / dur, 1);
          k = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(target * k).toLocaleString("en-US");
          if (k < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ----------------------------------------------------------- marquees */
  /* Track content is cloned once so the -50% keyframe loops seamlessly.
     Spacing lives on per-item margins (not flex gap) to keep the joint clean. */
  document.querySelectorAll("[data-marquee]").forEach(function (track) {
    if (reduceMotion) return;
    var children = Array.prototype.slice.call(track.children);
    children.forEach(function (c) {
      var clone = c.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      if (clone.tagName === "A") clone.setAttribute("tabindex", "-1");
      track.appendChild(clone);
    });
  });

  /* --------------------------------------------------- testimonial deck */
  var stage = document.querySelector("[data-quotes]");
  if (stage) {
    var slides = stage.querySelectorAll(".quote-slide");
    var dotsWrap = stage.querySelector(".quote-dots");
    var idx = 0, timer = null;

    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === idx); });
      if (dotsWrap) {
        dotsWrap.querySelectorAll("button").forEach(function (d, k) {
          d.setAttribute("aria-selected", k === idx ? "true" : "false");
        });
      }
    }
    function play() {
      if (reduceMotion) return;
      stop();
      timer = setInterval(function () { show(idx + 1); }, 6000);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    if (dotsWrap) {
      slides.forEach(function (_, k) {
        var b = document.createElement("button");
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", k === 0 ? "true" : "false");
        b.setAttribute("aria-label", "Testimonial " + (k + 1));
        b.addEventListener("click", function () { show(k); play(); });
        dotsWrap.appendChild(b);
      });
    }
    stage.addEventListener("mouseenter", stop);
    stage.addEventListener("mouseleave", play);
    stage.addEventListener("focusin", stop);
    stage.addEventListener("focusout", play);
    play();
  }

  /* ------------------------------------------------------- FAQ filters */
  var faqWrap = document.querySelector("[data-faq]");
  if (faqWrap) {
    var chips = Array.prototype.slice.call(document.querySelectorAll(".faq-chip"));
    var panels = Array.prototype.slice.call(faqWrap.querySelectorAll(".faq-panel"));
    var search = document.getElementById("faq-search");
    var empty = document.querySelector(".faq-empty");

    function pick(cat) {
      chips.forEach(function (c) {
        var on = c.getAttribute("data-cat") === cat;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-cat") === cat);
      });
    }

    chips.forEach(function (chip, i) {
      chip.addEventListener("click", function () {
        if (search) { search.value = ""; runSearch(""); }
        pick(chip.getAttribute("data-cat"));
      });
      chip.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = chips[(i + 1) % chips.length];
        if (e.key === "ArrowLeft") next = chips[(i - 1 + chips.length) % chips.length];
        if (next) { e.preventDefault(); next.focus(); next.click(); }
      });
    });

    function runSearch(q) {
      q = q.trim().toLowerCase();
      body.classList.toggle("faq-searching", q.length > 0);
      if (!q) {
        panels.forEach(function (p) { p.classList.remove("faq-cat-empty"); });
        faqWrap.querySelectorAll(".faq-item").forEach(function (item) {
          item.classList.remove("faq-hide");
          item.open = false;
        });
        if (empty) empty.hidden = true;
        return;
      }
      var any = false;
      panels.forEach(function (p) {
        var hit = false;
        p.querySelectorAll(".faq-item").forEach(function (item) {
          var match = item.textContent.toLowerCase().indexOf(q) !== -1;
          item.classList.toggle("faq-hide", !match);
          if (match) { hit = true; item.open = true; }
        });
        p.classList.toggle("faq-cat-empty", !hit);
        if (hit) any = true;
      });
      if (empty) empty.hidden = any;
    }

    if (search) {
      search.addEventListener("input", function () { runSearch(search.value); });
    }
  }

  /* ------------------------------------------------------- drip filter */
  var dripShelf = document.querySelector("[data-drips]");
  if (dripShelf) {
    var dripChips = Array.prototype.slice.call(document.querySelectorAll(".drip-chip"));
    var dripCards = Array.prototype.slice.call(dripShelf.querySelectorAll(".drip-card"));
    dripChips.forEach(function (chip, i) {
      chip.addEventListener("click", function () {
        var cat = chip.getAttribute("data-cat");
        dripChips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-selected", on ? "true" : "false");
        });
        dripCards.forEach(function (card) {
          card.classList.toggle("is-out", cat !== "all" && card.getAttribute("data-cat") !== cat);
        });
      });
      chip.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = dripChips[(i + 1) % dripChips.length];
        if (e.key === "ArrowLeft") next = dripChips[(i - 1 + dripChips.length) % dripChips.length];
        if (next) { e.preventDefault(); next.focus(); next.click(); }
      });
    });
  }

  /* --------------------------------------------------------- word cycle */
  var wordStage = document.querySelector("[data-word]");
  if (wordStage) {
    var words = Array.prototype.slice.call(wordStage.querySelectorAll(".word"));
    var wIdx = 0, wTimer = null;

    function showWord(n) {
      var prev = words[wIdx];
      wIdx = (n + words.length) % words.length;
      prev.classList.remove("is-on");
      prev.classList.add("is-off");
      // let the outgoing word clear before the next one lands
      setTimeout(function () { prev.classList.remove("is-off"); }, 900);
      words[wIdx].classList.add("is-on");
    }
    function playWords() {
      if (reduceMotion) return;
      stopWords();
      wTimer = setInterval(function () { showWord(wIdx + 1); }, 3400);
    }
    function stopWords() { if (wTimer) { clearInterval(wTimer); wTimer = null; } }

    wordStage.addEventListener("click", function () { showWord(wIdx + 1); playWords(); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopWords(); else playWords();
    });
    playWords();
  }

  /* ------------------------------------------- assistant deep-link hook */
  document.querySelectorAll("[data-open-assist]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (window.RGAssist && window.RGAssist.open) window.RGAssist.open();
    });
  });
})();
