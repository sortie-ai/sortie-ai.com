#!/usr/bin/env python3
"""Diff the visible text of public/index.html against the read-only etalon.

Makes copy drift loud: it is easy to "improve" a sentence while editing a
template and never notice. Anything not in ALLOWED fails.

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
# Each entry needs a reason; unexplained entries are indistinguishable from the
# drift this script exists to catch.
#
# Factual correction: the etalon claimed Sortie "closes" the issue on merge.
# `merge_completion` is opt-in and moves the issue to a configured terminal
# state instead.
ALLOWED: list[tuple[str, str]] = [
    ("closes", "can move"),
    ("", "to a terminal state"),
    (
        "completion and closed",
        "completion, and can be moved to a terminal state",
    ),
    # Owner-directed rewording, not a correction: the sample WORKFLOW.md prompt
    # was matched to the documentation site's. Two pairs for one edit — the
    # differ anchors on the surviving `{{ .issue.identifier }}` run.
    ("##", "Your task: {{ .issue.title }} ("),
    (": {{ .issue.title }}", ") ## Context"),
    # An addition: the etalon had no second page to link to. Appended, not
    # interleaved, which is what keeps it to one opcode. The interpuncts count
    # as words here — aria-hidden means nothing to a parser.
    ("", "· Privacy · Cookies"),
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
