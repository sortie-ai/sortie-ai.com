# sortie-ai.com

A one-page marketing site. Nothing in the build inspects the words or the colours on that page, so the class of regression a test suite would catch elsewhere is caught here only by looking.

## Commands

Read `package.json` scripts before invoking Hugo directly; `.github/workflows/ci.yml` is the gate those scripts have to satisfy.

## Gotchas

- **Custom output formats resolve to `home.<format>.<ext>`.** Since Hugo 0.146 there is no `index` template for the home page, so `layouts/index.llmstxt.txt` produces a `WARN` and no file. The documentation site still uses the old spelling because it is pinned to an older Hugo.
- **Nothing checks for a raw colour literal.** Every shade is a token or a `color-mix` of one, and a literal that slips in will ship silently. The single exception is a mask stop, which reads alpha rather than hue.
- **Never link a pinned release tag; use `/releases/latest`.** `/releases/tag/1.19.0` is a hard 404 since tags gained a `v` prefix, and `/releases/tag/v1.18.0` returns HTTP 200 with no notes and no assets, so a status-code link checker cannot tell it from a real release.
- **`SITE_DISPATCH_TOKEN` must exist in three repositories** — this one, `sortie-ai/docs`, and `sortie-ai/sortie`, which sends the release dispatch. Missing from the sender, its `notify-sites` job warns and exits `0` under `continue-on-error`, so the release goes green having notified nobody.
- **Allowing AI crawlers in `layouts/robots.txt` is deliberate.** The goal is to be cited by answer engines. Each vendor's tokens are split by purpose, so training can be withheld without losing search visibility.
- **A comment marks code that is not obvious.** It answers "what breaks if I change this", never "what does this do", and three lines is the ceiling. `CORRECTION <sha>:` and `FORK <upstream-path>:` are the two labelled exemptions.
- **The documentation site's remote is `docs`, not `sortie-docs`,** even though it is usually cloned into a `sortie-docs` directory.

## Boundaries

### Always

- Run the CI gate locally before calling a change done. Nothing in it reads the page copy, so a reworded sentence ships unchallenged.

### Ask first

- Rewriting shipped copy. The words on the page are owner-directed; fixing a typo is not the same as improving a sentence.
- Adding a path to `static/_headers`, or changing the robots.txt crawler policy.

### Never

- Discard, revert, reset, stash, or reformat uncommitted changes outside your current task's file set - the working tree may hold the user's or a parallel agent's work (see the working-agreement rule).
- Write a raw colour literal in the stylesheet.

## Reference docs

- `README.md` - stack, prerequisites, commands, layout, brand assets, and the traps that are enforced elsewhere in the tree: `.tool-versions`, `safeJS`, the injected font URL, minify-before-fingerprint and `immutable` caching. Do not restate any of it here.
- [sortie-ai/sortie](https://github.com/sortie-ai/sortie) - the product. [sortie-ai/docs](https://github.com/sortie-ai/docs) - the documentation site. This repository is a sibling of both, not part of either.
