#!/usr/bin/env python3
"""Verify the built page still says exactly what the etalon says.

`src/index.html` is the read-only source of truth for every word of copy on the
site. This script extracts the visible text from it and from `public/index.html`
and diffs them word by word. Any difference that is not in ALLOWED below fails
the check.

The point is to make copy drift loud. It is very easy to "improve" a sentence
while editing a template and never notice; this catches that on the next build.

Run:  python3 scripts/verify-etalon.py
Exit: 0 if the only differences are the sanctioned ones, 1 otherwise.
"""

from __future__ import annotations

import difflib
import sys
from html.parser import HTMLParser
from pathlib import Path

ETALON = Path("src/index.html")
BUILT = Path("public/index.html")

# Sanctioned copy changes, as (etalon text, built text) word-sequence pairs.
#
# Both correct the same factual error: the etalon claimed Sortie "closes" the
# issue when the pull request merges. In the source, `merge_completion` is
# opt-in and default-off, and it transitions the issue to a configured terminal
# state rather than closing it.
ALLOWED: list[tuple[str, str]] = [
    ("closes", "can move"),
    ("", "to a terminal state"),
    (
        "completion and closed",
        "completion, and can be moved to a terminal state",
    ),
]

SKIP_TAGS = {"script", "style", "head", "noscript"}


class VisibleText(HTMLParser):
    """Collects text a reader would actually see."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.chunks: list[str] = []
        self._depth = 0

    def handle_starttag(self, tag: str, attrs: object) -> None:
        if tag in SKIP_TAGS:
            self._depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag in SKIP_TAGS and self._depth:
            self._depth -= 1

    def handle_data(self, data: str) -> None:
        if self._depth:
            return
        text = " ".join(data.split())
        if text:
            self.chunks.append(text)


def words(path: Path) -> list[str]:
    parser = VisibleText()
    parser.feed(path.read_text(encoding="utf-8"))
    return " ".join(parser.chunks).split()


def main() -> int:
    for path in (ETALON, BUILT):
        if not path.is_file():
            print(f"error: {path} not found (run `hugo --gc --minify` first)")
            return 1

    etalon, built = words(ETALON), words(BUILT)
    matcher = difflib.SequenceMatcher(None, etalon, built)
    ratio = matcher.ratio() * 100

    unexpected = []
    sanctioned = 0
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            continue
        pair = (" ".join(etalon[i1:i2]), " ".join(built[j1:j2]))
        if pair in ALLOWED:
            sanctioned += 1
        else:
            unexpected.append(pair)

    print(f"etalon {len(etalon)} words, built {len(built)} words")
    print(f"similarity {ratio:.2f}%")
    print(f"sanctioned differences: {sanctioned} of {len(ALLOWED)}")

    if unexpected:
        print(f"\nUNSANCTIONED COPY DRIFT — {len(unexpected)} difference(s):")
        for before, after in unexpected:
            print(f"  etalon: {before!r}")
            print(f"  built : {after!r}")
        print(
            "\nEither revert the wording, or add the pair to ALLOWED in this "
            "script with a comment explaining why the etalon is wrong."
        )
        return 1

    if sanctioned != len(ALLOWED):
        print(
            f"\nexpected {len(ALLOWED)} sanctioned differences but found "
            f"{sanctioned} — a correction may have been reverted."
        )
        return 1

    print("\nOK: the only differences are the sanctioned corrections.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
