#!/usr/bin/env python3
"""Fail when a built page's heading ids or levels drift from the baseline.

Goldmark generates a policy page's heading ids from its heading text, so a
reworded heading silently renames an id and takes every inbound bookmark and
table-of-contents entry with it. The ids authored in the layouts are the same
contract by hand. Nothing else in the build compares them against anything.

Pages are discovered by walking a build directory, `public` unless one is
given, so the check can be pointed at a clean build when a dev server is
writing `public/`. The check never rewrites the baseline: regenerate it
deliberately, and only when the rename is intended.

    python3 scripts/check-heading-ids.py --check          # CI
    python3 scripts/check-heading-ids.py > scripts/heading-ids-baseline.txt
"""

import difflib
import os
import re
import sys

BASELINE = "scripts/heading-ids-baseline.txt"
HEADING = re.compile(r"<(h[1-6])\b[^>]*\bid=\"([^\"]+)\"", re.I)


def collect(root):
    pages = []
    for dirpath, _dirs, files in os.walk(root):
        pages += [os.path.join(dirpath, f) for f in files if f.endswith(".html")]

    rows = []
    for page in sorted(pages):
        with open(page, encoding="utf-8") as handle:
            # Recorded relative to the build root so the baseline compares
            # equal whichever directory the build landed in.
            name = os.path.relpath(page, root)
            for level, hid in HEADING.findall(handle.read()):
                rows.append("%s\t%s\t%s" % (name, level.lower(), hid))
    return rows


def main(argv):
    root = next((a for a in argv if not a.startswith("--")), "public")
    rows = collect(root)
    if not rows:
        print("::error::no headings with ids found under %s/ — "
              "the check cannot fail" % root.rstrip("/"))
        return 1

    if "--check" not in argv:
        print("\n".join(rows))
        return 0

    try:
        with open(BASELINE, encoding="utf-8") as handle:
            want = handle.read().splitlines()
    except OSError as exc:
        print("::error::cannot read %s: %s" % (BASELINE, exc))
        return 1

    if want == rows:
        print("ok: heading ids and levels unchanged (%d headings)" % len(rows))
        return 0

    print("::error::heading id or level set changed. If the rename is "
          "intended, regenerate: python3 %s > %s" % (sys.argv[0], BASELINE))
    for line in difflib.unified_diff(want, rows, BASELINE, root,
                                     lineterm="", n=1):
        print(line)
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
