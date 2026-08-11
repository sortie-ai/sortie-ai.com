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
   * CORRECTION to 22f087e, which shipped this using navigator.sendBeacon.
   * That commit message and this comment both claimed "no cookie, no
   * identifier, no localStorage, no third party". The first two were FALSE,
   * for every visitor who had ever accepted analytics consent on the
   * documentation site.
   *
   * GA4 on docs.sortie-ai.com writes _ga and _ga_<stream> with
   * Domain=sortie-ai.com — the REGISTRABLE domain, not the docs host, because
   * that is how a GA4 property spans subdomains. RFC 6265 §5.1.3
   * domain-matching then sends those cookies to every host beneath it, the
   * apex included. sendBeacon is specified with credentials mode "include"
   * and gives no way to turn it off. So the beacon carried the visitor's GA
   * client ID — a stable identifier, set by a third party, read off their
   * device — to this origin, on every copy. Measured on the live zone:
   *
   *   POST https://sortie-ai.com/copied/sh
   *   Cookie: _ga=GA1.1.1417657273.1786473211; _ga_58VR448EJK=GS2.1.s17864...
   *
   * The measurement that missed it is the lesson, so it is recorded here
   * rather than deleted. It said "this origin sets none, the cookie jar is
   * empty" — both true, and both beside the point. The question is never
   * "does this origin SET a cookie" but "will a cookie be SENT", and the two
   * answers diverge in exactly one case: a sibling subdomain scoping one to
   * the registrable domain. The browser used had never visited docs, so it
   * had nothing to send, and the test confirmed a property of that profile
   * instead of a property of the code.
   *
   * Two tooling traps let a retest fail the same way. Playwright's
   * request.headers() omits the Cookie header while request.allHeaders()
   * includes it, so an assertion on the former passes while the cookie is
   * going out; and the docs consent banner is suppressed under automation by
   * hideFromBots, so an unmasked run never gets a _ga written at all. Any
   * retest must mask navigator.webdriver, assert the mask in-page, take
   * consent on docs first, and read allHeaders().
   *
   * Hence fetch with credentials: "omit". The credentials mode is the entire
   * point of the switch — the same run with credentials: "include" still
   * carried the cookie, so the API was never the cause. Verified against the
   * live edge in a browser holding a real _ga: no Cookie header, and
   * otherwise identical — still POST, still 405 with an empty body, still
   * uncacheable.
   *
   * What is true now, stated narrowly because the last version of this
   * paragraph overreached: this code stores nothing on the visitor's device,
   * reads nothing from it, and transmits no identifier — no cookie, no query
   * string, no body, no localStorage. That is what ePrivacy Article 5(3)
   * turns on. It says nothing about the rest of the page, and it is a claim
   * about the request this line makes, not about the origin as a whole:
   * if a cookie is ever set on sortie-ai.com or on any sibling under it, every
   * stylesheet, font and page request will still carry it. This beacon will
   * not.
   *
   * Measured against the live zone, in a real browser, not with curl (the
   * edge answers a curl-shaped request differently):
   *
   *   - Workers static assets answer POST with 405 and an EMPTY body — for
   *     existing files too, so this is about the method, not the path.
   *     not_found_handling = "404-page" is GET-only, so the beacon never
   *     drags down the 7.7 KB 404 page. A GET beacon does.
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
   * keepalive is what buys back sendBeacon's one real advantage: the request
   * survives the document being destroyed. Confirmed with the negative
   * control that makes the claim falsifiable — a POST stalled server-side and
   * then redirected, so the final hop could only be dispatched after the tab
   * was gone. keepalive:true delivered it; the same request WITHOUT keepalive
   * was dropped. (Arrival at a loopback server proves nothing on its own: the
   * bytes leave before unload even begins, and the control "passes" too.)
   *
   * Both guards below are load-bearing, not decoration. done() runs inside
   * writeText().then(done), so anything thrown in here rejects that promise
   * and hands control to .catch(fallback) — the visitor would silently get a
   * second, textarea-based copy. try/catch covers a synchronous throw (fetch
   * missing, or refused outright); .catch() covers the rejected promise a
   * blocked or failed request produces, which try/catch cannot see and which
   * would otherwise surface as an unhandled rejection. Telemetry must never
   * cost the visitor the command.
   */
  var beacon = function (id) {
    try {
      if (id)
        fetch("/copied/" + id, {
          method: "POST",
          keepalive: true,
          credentials: "omit",
        }).catch(function () {
          /* Blocked, offline, or refused. The copy already happened. */
        });
    } catch (e) {
      /* Unsupported or refused synchronously. The copy already happened. */
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
