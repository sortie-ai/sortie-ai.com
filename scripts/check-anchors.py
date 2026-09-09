#!/usr/bin/env python3
"""Fail when a fragment link resolves to no id on the page it lands on.

A renamed section id leaves a link that still returns 200 and scrolls nowhere.
No status-code checker, --printPathWarnings or html-validate rule sees it, and
scroll-padding-top makes it look like it worked.

Pages are discovered by walking the build, so a page added later is covered
the day it exists rather than the day someone remembers to list it.

    python3 scripts/check-anchors.py public
"""

import os
import re
import sys

HREF = re.compile(r'\bhref="([^"]+)"')
ID = re.compile(r'\bid="([^"]+)"')


def find_pages(root):
    found = []
    for dirpath, _dirs, files in os.walk(root):
        found += [os.path.join(dirpath, f) for f in files if f.endswith(".html")]
    return sorted(found)


def main(argv):
    root = argv[0] if argv else "public"
    pages = find_pages(root)
    if not pages:
        print("::error::no built HTML under %s — the check cannot fail" % root)
        return 1

    home = os.path.join(root, "index.html")
    if home not in pages:
        print("::error::%s missing — cross-page /# links cannot be resolved" % home)
        return 1

    html = {p: open(p, encoding="utf-8").read() for p in pages}
    ids = {p: set(ID.findall(html[p])) for p in pages}

    checked = 0
    failed = False
    for page in pages:
        hrefs = HREF.findall(html[page])
        same = {h[1:] for h in hrefs if h.startswith("#")}
        cross = {h[2:] for h in hrefs if h.startswith("/#")}
        # On any page but the home page "/#how" is a cross-page link to the
        # home page, so it resolves against the home page's ids and must never
        # be reported against this page's.
        if page == home:
            same, cross = same | cross, set()

        same = {a for a in same if a}
        cross = {a for a in cross if a}
        checked += len(same) + len(cross)

        dead = sorted(a for a in same if a not in ids[page])
        dead += sorted("/#" + a for a in cross if a not in ids[home])
        if dead:
            print("::error file=%s::fragment with no matching id: %s"
                  % (page, ", ".join(dead)))
            failed = True
        else:
            print("ok: %s, %d same-page + %d cross-page over %d ids"
                  % (page, len(same), len(cross), len(ids[page])))

    if failed:
        return 1
    if not checked:
        print("::error::no fragment links found — the check cannot fail")
        return 1

    print("anchors OK: %d pages, %d fragment links" % (len(pages), checked))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
