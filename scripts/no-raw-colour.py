#!/usr/bin/env python3
"""Fail when a hex colour appears anywhere but a `--token: #hex;` declaration.

Nothing else in the build inspects colour, so this is the only guard
against a literal that slips in and ships silently. Stylesheets arrive
as arguments, not hardcoded, so a glob covers a new one the day it lands.

Point it at assets/css sources, never public/: a local `hugo --gc --minify`
can serve a stale stylesheet out of resources/_gen/, so built CSS is not
evidence about a source edit.

    python3 scripts/no-raw-colour.py assets/css/*.css
"""

import re
import sys

# Blanked rather than stripped so reported line numbers still match the file,
# and so a hex quoted in prose is not read as a literal.
COMMENT = re.compile(r"/\*.*?\*/", re.S)
DECL = re.compile(r"^\s*--[a-z0-9-]+:\s*#[0-9a-fA-F]{3,8}\s*;\s*$")
HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")


def blank(match):
    return re.sub(r"[^\n]", " ", match.group(0))


def main(paths):
    if not paths:
        print("::error::no stylesheet given — the check cannot fail")
        return 1

    tokens = 0
    offenders = []
    for path in paths:
        try:
            with open(path, encoding="utf-8") as handle:
                src = COMMENT.sub(blank, handle.read())
        except OSError as exc:
            print("::error::cannot read %s: %s" % (path, exc))
            return 1
        for number, line in enumerate(src.splitlines(), 1):
            if DECL.match(line):
                tokens += 1
            elif HEX.search(line):
                offenders.append((path, number, line.strip()))

    for path, number, line in offenders:
        print("::error file=%s,line=%d::raw colour literal: %s" % (path, number, line))
    if offenders:
        return 1

    # Zero token declarations across every argument means the paths point
    # somewhere without colours, and a check that sees no hex cannot fail.
    if not tokens:
        print("::error::no `--token: #hex;` declaration in %s — wrong paths?"
              % ", ".join(paths))
        return 1

    print("ok: %d stylesheet(s), %d token declarations, no raw literal"
          % (len(paths), tokens))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
