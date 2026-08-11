# Mandatory Protocol for AI Agents

## Protocol

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- If you write 200 lines and it could be 50, rewrite it.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

- Don't "improve" adjacent code, comments, or formatting.
- Match existing style, even if you'd do it differently.
- Every changed line should trace directly to the request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

For this repository the success criterion is almost always the same: build the
site and diff the rendered output against the etalon. See below.

## Project Facts

This repository is the source of [sortie-ai.com](https://sortie-ai.com), the
Sortie landing page. It is a sibling of, not part of, the documentation site.

| Component | Value |
|---|---|
| Static site generator | Hugo `extended_0.164.0`, pinned in `.tool-versions` |
| Toolchain manager | **asdf**. Run `asdf install`; do not use system binaries |
| Styling | Hand-written CSS on design tokens. **No Tailwind, no framework** |
| Build output | `public/` |
| Hosting | **Cloudflare Workers static assets** — not Cloudflare Pages |
| Deploy | `npx wrangler deploy`, or `npm run deploy` |

Related repositories: [sortie-ai/sortie](https://github.com/sortie-ai/sortie)
(the product) and [sortie-ai/docs](https://github.com/sortie-ai/docs) (the
documentation site — note the remote is `docs`, not `sortie-docs`, even though
the working copy is usually cloned into a `sortie-docs` directory).

### `src/index.html` is read-only and is the source of truth

The site was rebuilt from a hand-written single-file page, kept at
`src/index.html` with mode `555`. **Never edit it, and never regenerate it.**
It is the reference for every word of copy and every design decision.

Before claiming any change is done, verify the visible text still matches:

```bash
hugo --gc --minify
# extract the visible text of public/index.html and of src/index.html and diff
```

The only intended differences are two factual corrections about
`merge_completion` being opt-in. Everything else must match word for word.
`.research/etalon-inventory.md` records the full inventory, the six defects
found in the etalon, and the markup-semantics changes made.

### The palette is brand cyan, not the etalon's orange

The etalon was drawn in a placeholder orange (`#FF7A29`). The real Sortie brand
is cyan `#00BDFF` on navy `#00112B`, which is what the logo, the favicons and
the social card use. The BRAND token block in `assets/css/main.css` carries the
real palette. Do not reintroduce orange.

Every colour in the stylesheet derives from a token. Where the etalon wrote
`rgba(255,122,41,.35)` the rebuild writes
`color-mix(in srgb, var(--accent) 35%, transparent)`, which is exactly
equivalent and actually follows the token. **Never write a raw colour literal**
— if a new shade is needed, add a token.

### Brand assets come from one vector

`assets/img/icon.svg` is the single source for every icon; `assets/img/logomark.svg`
is the same mark without the navy plate, inlined into the header and footer.
Both carry geometry lifted from the brand master `Sortie AI Logo_E.svg`.

Do **not** hand-edit anything in `static/*.png`, `static/favicon.ico` or
`static/favicon.svg` — run `node scripts/generate-icons.mjs` instead. Do not
put the "Sortie" wordmark into the SVG: it is HTML text beside the mark.

The etalon's logo was a placeholder — a rounded square with a triangle. It is
not the Sortie mark. If you see it reappear, something was reverted too far.

### Traps that have already caught someone

**JSON-LD needs `safeJS`.** Go's `html/template` escapes anything inside a
`<script>` as JavaScript, turning a `jsonify` result into a quoted string. The
block then parses as a JSON string, not an object, and validators reject it
without any build error. See `layouts/_partials/schema.html`.

**Custom output formats resolve to `home.<format>.<ext>`.** Since Hugo 0.146
there is no `index` template for the home page. `layouts/index.llmstxt.txt`
produces a `WARN` and no file. The documentation site still uses the old
spelling because it is pinned to an older Hugo.

**Minify, then fingerprint.** Reversing the order hashes the unminified bytes
and the filename stops matching what ships.

**The font URL is injected.** `assets/css/main.css` is run through
`resources.ExecuteAsTemplate` so `@font-face` gets the fingerprinted font URL.
A literal relative path resolves against the stylesheet's directory and 404s.

**`immutable` caching implies fingerprinting.** `static/_headers` marks
`/css/*`, `/js/*` and `/fonts/*` immutable for a year. Only add a path there if
Hugo fingerprints it. `/img/*` is deliberately excluded: the social card's URL
must stay stable for scrapers.

**Deprecations log at INFO.** Build with `--logLevel info` when auditing, or the
default level hides them until they have already escalated to errors. CI fails
on any deprecation notice.

### The release number lives in exactly one place, and stays bare

`params.version` in `hugo.toml`. It feeds the nav chip, the footer text and the
JSON-LD `softwareVersion`, and it is quoted in `llms.txt`. The etalon hardcoded
it three times.

**Never put a `v` in it.** Releases from 1.19.0 on carry `v`-prefixed git tags
(sortie-ai/sortie#792), but the version *number* stays bare everywhere — the
release is named `sortie 1.19.0` and the binary prints `sortie 1.19.0`. A `v`
in `params.version` would quietly corrupt four things:

- `softwareVersion` would become `"v1.19.0"`. schema.org types it as free-form
  `Text`, so **no validator will ever flag it**, and it is invisible on the
  page. This is the worst of the four precisely because nothing complains.
- The nav chip, the footer text and the `llms.txt` prose would all read
  `v1.19.0`, which is the wrong register — and `llms.txt` is consumed by
  machines that will propagate the malformed string.

The footer therefore links to `/releases/latest`, not to a pinned tag. A pinned
link has to know which tag convention produced the release it names, and both
failure modes are nasty: `/releases/tag/1.19.0` is a hard 404 after the switch,
while `/releases/tag/v1.18.0` returns **HTTP 200 with no release notes and no
assets** — it is a release-less tag page, because the backfill added `v` tags
for every past release without moving the Release objects. A status-code link
checker cannot tell it from the real thing. Verified: the Releases API returns
404 for `v1.18.0` and 200 with 13 assets for `1.18.0`.
