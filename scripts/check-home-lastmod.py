#!/usr/bin/env python3
"""Fail when the home page's text changed but its sitemap lastmod did not advance.

lastmod is hand-maintained in content/_index.md front matter, because the
page's copy lives in layouts/home.html and `:git` never reads that file.

    python3 scripts/check-home-lastmod.py --no-future
    python3 scripts/check-home-lastmod.py <base-sha> [head-build-dir]
"""

import os
import re
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from html.parser import HTMLParser
from urllib.parse import urlparse

HOME = "content/_index.md"
LASTMOD_KEY = re.compile(r"^lastmod:\s*[\"']?([^\"'\s#]+)[\"']?\s*$", re.M)
SITEMAP_NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
SKIP = {"script", "style", "template"}


class MainText(HTMLParser):
    """Collects the <main> text so a CSS-only or class-rename change, which
    alters no indexable text, can't force a lastmod bump."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.skip = 0
        self.words = []

    def handle_starttag(self, tag, attrs):
        if tag == "main":
            self.depth += 1
        elif tag in SKIP:
            self.skip += 1

    def handle_endtag(self, tag):
        if tag == "main" and self.depth:
            self.depth -= 1
        elif tag in SKIP and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if self.depth and not self.skip:
            self.words += data.split()


def main_text(path):
    parser = MainText()
    with open(path, encoding="utf-8") as handle:
        parser.feed(handle.read())
    if not parser.words:
        sys.exit("::error::no <main> text in %s — the check cannot fail" % path)
    return " ".join(parser.words)


def home_lastmod(path):
    """Resolved <lastmod> for the site root, as an aware datetime — the
    value crawlers see, and the only one that still exists when the
    front-matter key is absent and `:git` fills it in."""
    for url in ET.parse(path).getroot().iter(SITEMAP_NS + "url"):
        loc = url.findtext(SITEMAP_NS + "loc") or ""
        if urlparse(loc).path in ("", "/"):
            raw = url.findtext(SITEMAP_NS + "lastmod")
            if not raw:
                sys.exit("::error::no <lastmod> for / in %s — enableGitInfo?" % path)
            try:
                return datetime.fromisoformat(raw), raw
            except ValueError:
                sys.exit("::error::unparsable <lastmod> %r in %s" % (raw, path))
    sys.exit("::error::no <loc> for / in %s — the check cannot fail" % path)


def not_in_the_future():
    """Reject a future lastmod key before it can drop the page from the build."""
    with open(HOME, encoding="utf-8") as handle:
        found = LASTMOD_KEY.search(handle.read())
    if not found:
        print("ok: no explicit lastmod key in %s, so `:git` supplies it" % HOME)
        return 0
    raw = found.group(1)
    try:
        when = datetime.fromisoformat(raw)
    except ValueError:
        print("::error file=%s::unparsable lastmod %r" % (HOME, raw))
        return 1
    if when.tzinfo is None:
        when = when.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    if when > now:
        print("::error file=%s::lastmod %s is a future date. Hugo resolves "
              ".Date from it too, so the home page would leave the build and "
              "the sitemap entirely, with no WARN. Use today or earlier."
              % (HOME, raw))
        return 1
    print("ok: lastmod %s is not in the future (now %s)"
          % (raw, now.isoformat(timespec="seconds")))
    return 0


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, text=True, capture_output=True, **kw)


def base_build(base):
    """Build the base ref in a throwaway worktree; return its text and lastmod."""
    work = tempfile.mkdtemp(prefix="lastmod-base-")
    tree, out = os.path.join(work, "tree"), os.path.join(work, "out")
    try:
        run(["git", "worktree", "add", "--detach", "--quiet", tree, base])
        # .tool-versions is gitignored, so a fresh worktree resolves no Hugo
        # under asdf and the base build dies. CI has Hugo on PATH regardless.
        if os.path.exists(".tool-versions"):
            shutil.copy(".tool-versions", tree)
        run(["hugo", "--gc", "--minify", "--logLevel", "error", "-d", out],
            cwd=tree)
        return (main_text(os.path.join(out, "index.html")),
                home_lastmod(os.path.join(out, "sitemap.xml")))
    finally:
        subprocess.run(["git", "worktree", "remove", "--force", tree],
                       capture_output=True)
        shutil.rmtree(work, ignore_errors=True)


def main(argv):
    if "--no-future" in argv:
        return not_in_the_future()

    if not argv or not argv[0]:
        print("::error::no base ref given — the check cannot fail")
        return 1
    base = argv[0]
    head_dir = argv[1] if len(argv) > 1 else "public"

    # Runs here too so a standalone local invocation is complete; CI asserts it
    # before Build, where the message beats "missing public/index.html".
    if not_in_the_future():
        return 1

    if subprocess.run(["git", "cat-file", "-e", base + "^{commit}"],
                      capture_output=True).returncode:
        print("::error::base ref %s is not in this clone — fetch-depth: 0?" % base)
        return 1

    head_text = main_text(os.path.join(head_dir, "index.html"))
    head_date, head_raw = home_lastmod(os.path.join(head_dir, "sitemap.xml"))
    try:
        base_text, (base_date, base_raw) = base_build(base)
    except subprocess.CalledProcessError as exc:
        print("::error::could not build base ref %s: %s"
              % (base, (exc.stderr or "").strip()[:400]))
        return 1

    words = "%d -> %d words" % (len(base_text.split()), len(head_text.split()))
    if head_text == base_text:
        # A lastmod moved backwards with no text change is out of scope here.
        print("ok: home-page text unchanged since %s (%d words), lastmod=%s"
              % (base[:12], len(head_text.split()), head_raw))
        return 0

    if head_date > base_date:
        print("ok: home-page text changed (%s) and sitemap lastmod advanced "
              "%s -> %s" % (words, base_raw, head_raw))
        return 0

    moved = "went backwards" if head_date < base_date else "did not move"
    print("::error file=content/_index.md::the home page's indexable text "
          "changed (%s) but the sitemap lastmod for / %s: %s -> %s. Crawlers "
          "read this as unchanged — bump lastmod in content/_index.md."
          % (words, moved, base_raw, head_raw))
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
