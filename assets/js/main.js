/**
 * Sortie — sortie-ai.com
 *
 * Ported from the inline script in src/index.html with three defects fixed.
 * Behaviour is otherwise identical, including the clipboard fallback and the
 * reduced-motion and missing-IntersectionObserver bypasses.
 *
 * Fixed here:
 *   D1  every copy button used to be relabelled "Copy install command" after
 *       its first use, so four of the five lost their specific accessible name
 *       for the rest of the session. Each button now restores its own label.
 *   D2  the burger's aria-controls named the <header> that contains it. It now
 *       names the navigation list whose visibility it actually toggles.
 *   D3  the tablist kept every tab in the tab order. Roving tabindex is now
 *       managed per the WAI-ARIA tabs pattern, and Home/End are handled.
 */
(function () {
  "use strict";

  var hdr = document.getElementById("site-header");

  /* sticky header border */
  if (hdr) {
    var onScroll = function () {
      hdr.classList.toggle("stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* mobile menu
   *
   * Focus has to be moved on open. The nav list precedes the burger in DOM
   * order, so pressing Tab after opening the menu walks *past* every revealed
   * link into the install tabs — the links are only reachable backwards with
   * Shift+Tab, which fails WCAG 2.4.3. Moving focus into the menu on open and
   * back to the button on close is the disclosure pattern's answer. */
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
      /* Following a link closes the menu, but must not steal focus back to the
         burger — the browser is already navigating. */
      if (e.target.closest(".nav-links a")) setMenu(false, false);
    });

    hdr.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && hdr.classList.contains("mobile-open")) {
        e.preventDefault();
        setMenu(false, true);
      }
    });
  }

  /* install tabs */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));

  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      /* Roving tabindex: exactly one tab is reachable with Tab, and the
         arrow keys move between them. */
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

  /* copy beacon
   *
   * Copying the install command is the strongest intent signal this page can
   * produce, and it makes no network request, so nothing server-side can see
   * it. This sends one same-origin request whose PATH names the method copied
   * — /copied/sh, /copied/brew, /copied/ps, /copied/go. The zone's existing
   * Cloudflare collector already groups by clientRequestPath, so it is counted
   * with no new integration and no new service.
   *
   * No cookie, no identifier, no localStorage, no third party. Nothing is
   * stored on the visitor's device and nothing is read from it, which is what
   * ePrivacy Article 5(3) actually turns on — and the whole reason this exists
   * instead of GA4 or a tag manager.
   *
   * One caveat worth keeping. sendBeacon is specified with credentials mode
   * "include", so it would carry a same-origin cookie if one existed. Measured
   * in a real browser on 2026-08-11: this origin sets none, the cookie jar is
   * empty, and the request went out with no Cookie header, no Content-Type and
   * Content-Length: 0. If a cookie is ever introduced here — enabling Bot
   * Fight Mode sets __cf_bm, for instance — the beacon starts sending it, as
   * would every stylesheet and font request. If that must not happen, the
   * replacement is fetch(url, {method:"POST", keepalive:true,
   * credentials:"omit"}), which measured identically at the edge.
   *
   * Measured against the live zone on 2026-08-11, in headless Chromium, not
   * with curl (the edge answers a curl-shaped request differently):
   *
   *   - sendBeacon POSTs, and Workers static assets answer POST with 405 and
   *     an EMPTY body — for existing files too, so this is about the method,
   *     not the path. not_found_handling = "404-page" is GET-only, so the
   *     beacon never drags down the 7.7 KB 404 page. A GET beacon does.
   *   - POST is uncacheable. The same path fetched with GET came back
   *     cf-cache-status: HIT, so a GET beacon would be served from the browser
   *     cache on the second click of a session and undercount.
   *   - the rows arrive: `POST /copied/sh -> 405 ct=[empty]` was read back out
   *     of httpRequestsAdaptiveGroups with the path intact. Because the
   *     report keeps only status < 400 and content-type html, 405s with no
   *     body cannot contaminate the page-view numbers.
   *   - every non-2xx logs one "Failed to load resource" line in the console —
   *     for sendBeacon, fetch(keepalive) and Image alike. It comes from the
   *     network stack and .catch() does not suppress it. Returning 204 instead
   *     would mean adding a Worker script to a site that has none. DevTools
   *     only; no page error, no unhandled rejection, nothing user-visible.
   *
   * The try/catch is load-bearing, not decoration. done() runs inside
   * writeText().then(done), so anything thrown in here rejects that promise
   * and hands control to .catch(fallback) — the visitor would silently get a
   * second, textarea-based copy. Telemetry must never cost them the command.
   */
  var beacon = function (id) {
    try {
      if (id) navigator.sendBeacon("/copied/" + id);
    } catch (e) {
      /* Blocked, unsupported, or queue full. The copy already happened. */
    }
  };

  /* copy buttons */
  var CHECK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  document.querySelectorAll(".copy").forEach(function (btn) {
    var originalMarkup = btn.innerHTML;
    /* Captured per button, so a Homebrew button never claims to be the
       install-script one after being used. */
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
        /* Last, so the visible result of the copy is already committed. Only
           on success: a failed copy is not an install intent. */
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
        } catch (e) {
          /* Nothing useful to do: the command stays selectable on screen. */
        }
        document.body.removeChild(ta);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }
    });
  });

  /* scroll reveal */
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
})();
