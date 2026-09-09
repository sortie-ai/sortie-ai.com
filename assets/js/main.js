(function () {
  "use strict";

  var hdr = document.getElementById("site-header");

  if (hdr) {
    var onScroll = function () {
      hdr.classList.toggle("stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* mobile menu. The nav list precedes the burger in DOM order, so without
     first.focus() on open, Tab walks past every revealed link. WCAG 2.4.3. */
  var burger = document.getElementById("burger");
  var navList = document.getElementById("primary-nav");

  if (hdr && burger && navList) {
    var setMenu = function (open, restoreFocus) {
      hdr.classList.toggle("mobile-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        var first = navList.querySelector("a");
        if (first) first.focus();
      } else if (restoreFocus) {
        burger.focus();
      }
    };

    burger.addEventListener("click", function () {
      setMenu(!hdr.classList.contains("mobile-open"), true);
    });

    hdr.addEventListener("click", function (e) {
      /* false: do not restore focus to the burger, the browser is navigating. */
      if (e.target.closest(".nav-links a")) setMenu(false, false);
    });

    hdr.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && hdr.classList.contains("mobile-open")) {
        e.preventDefault();
        setMenu(false, true);
      }
    });
  }

  /* Grouped per tablist. The page carries two install widgets, and a flat
     querySelectorAll would let a click in one hide the other's panel. */
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll(".tab"));

    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        /* Roving tabindex: exactly one tab is reachable with Tab. */
        t.setAttribute("tabindex", on ? "0" : "-1");
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        select(t);
      });
      t.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft")
          next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        select(next);
        next.focus();
      });
    });
  });

  var beacon = function (id) {
    try {
      if (id)
        fetch("/copied/" + id, {
          method: "POST",
          keepalive: true,
          credentials: "omit",
        }).catch(function () {});
    } catch (e) {}
  };

  var CHECK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  document.querySelectorAll(".copy").forEach(function (btn) {
    var originalMarkup = btn.innerHTML;
    /* Per button: a shared label makes every button claim to be the first. */
    var originalLabel = btn.getAttribute("aria-label");
    var timer = null;

    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");

      var done = function () {
        btn.innerHTML = CHECK;
        btn.dataset.done = "1";
        btn.setAttribute("aria-label", "Copied");
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.innerHTML = originalMarkup;
          delete btn.dataset.done;
          btn.setAttribute("aria-label", originalLabel);
        }, 1800);
        /* Last, and only on success: a failed copy is not an install intent. */
        beacon(btn.getAttribute("data-beacon"));
      };

      var fallback = function () {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          done();
        } catch (e) {}
        document.body.removeChild(ta);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }
    });
  });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll(".rv");

  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    targets.forEach(function (el) {
      io.observe(el);
    });
  }

  /* Geometry on demand, not a second IntersectionObserver: IO reports a box
     entering or leaving a band, which lags the top-edge crossing this needs by
     the heading box's own height, measured 55.59px at 1440. */
  var rail = document.querySelector(".prose-toc");
  var marks = [];

  if (rail) {
    rail.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var target = document.getElementById(a.getAttribute("href").slice(1));
      if (target) marks.push({ link: a, target: target });
    });
  }

  if (marks.length) {
    /* 1px below the line the root already scrolls anchors to
       (scroll-padding-top, main.css:127), so a heading reached from the rail
       marks its own entry rather than the one above it. */
    var LINE = 65;
    var currentLink = null;

    var pick = function () {
      /* The foot of the document wins outright. A final section shorter than
         a viewport never brings its own heading up to LINE, and the last
         entry would then be the one entry that can never mark. */
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2
      ) {
        return marks.length - 1;
      }
      /* 0 when no heading has reached the line: the reader is in the page
         head, and the rail is the only thing answering "where am I". Document
         order means the first heading below the line ends the search. */
      var found = 0;
      for (var i = 0; i < marks.length; i++) {
        if (marks[i].target.getBoundingClientRect().top > LINE) break;
        found = i;
      }
      return found;
    };

    var apply = function () {
      var next = marks[pick()].link;
      if (next === currentLink) return;
      if (currentLink) currentLink.removeAttribute("aria-current");
      next.setAttribute("aria-current", "location");
      currentLink = next;

      /* Only once the rail itself scrolls, under a ~536px viewport height.
         scrollIntoView is not usable here: it also scrolls the window, which
         would drag the page out from under the reader who caused this. */
      if (rail.scrollHeight > rail.clientHeight) {
        var r = next.getBoundingClientRect();
        var box = rail.getBoundingClientRect();
        if (r.top < box.top) rail.scrollTop += r.top - box.top;
        else if (r.bottom > box.bottom) rail.scrollTop += r.bottom - box.bottom;
      }
    };

    var queued = false;
    var onMove = function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        apply();
      });
    };

    apply();
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove, { passive: true });
  }
})();
