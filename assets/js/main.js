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
