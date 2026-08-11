<div align="center">

# sortie-ai.com

**Source for [sortie-ai.com](https://sortie-ai.com) — the Sortie landing page**

[Documentation](https://docs.sortie-ai.com) · [Main repository](https://github.com/sortie-ai/sortie)

</div>

---

## Tech stack

| Component | Details |
|---|---|
| **Static site generator** | [Hugo](https://gohugo.io/) `extended_0.164.0` |
| **Styling** | Hand-written CSS on design tokens, cascade layers, no framework |
| **Typography** | Inter Variable, self-hosted, latin subset, weight axis only |
| **JavaScript** | ~150 lines, no dependencies, bundled by `js.Build`, `defer`red |
| **Hosting** | [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) static assets |
| **Deploy** | `npx wrangler deploy` — **not** `wrangler pages deploy` |

Every shipped asset is fingerprinted and carries a Subresource Integrity digest.
There is no Node dependency in the build itself; npm is only used for Wrangler.

## Prerequisites

```bash
asdf plugin add gohugo && asdf install gohugo extended_0.164.0
asdf plugin add nodejs && asdf install nodejs 24.19.0
hugo version   # must print +extended
```

Create a local `.tool-versions` if you use asdf:

```
gohugo extended_0.164.0
nodejs 24.19.0
```

**Do not commit it.** Cloudflare Workers Builds parses any `.tool-versions` in
the repository root and tries to install every tool named in it; the asdf
plugin names are not the ones its build image knows, and the build fails at the
*Installing* stage before it ever reaches Hugo. The file is in `.gitignore` for
that reason. Hugo's version on Cloudflare comes from the `HUGO_VERSION` build
variable; CI pins its own copies in `.github/workflows/ci.yml`.

Hugo's **extended** edition is pinned because it carries the LibSass transpiler.
The site does not currently use Sass, so a plain build would also work today —
the pin exists so that adding a `.scss` file later does not silently fail.

Full git history is required: `enableGitInfo` reads the git author date to
populate `.Lastmod` for `sitemap.xml`, and a shallow clone yields no dates
without erroring. The `prebuild` npm script unshallows for exactly this reason.

## Local development

```bash
npm run server      # http://localhost:1313, live reload
npm run build       # production build into public/
npm run deploy      # build, then wrangler deploy
```

## Layout

```
hugo.toml               Config. The release number lives here and nowhere else.
content/_index.md       Front matter for the home page.
data/install.yaml       Install commands, one definition per method.
data/adapters.yaml      The integrations grid.
layouts/
  baseof.html           Document shell.
  home.html             The landing page itself.
  404.html
  robots.txt            Generated, so the sitemap URL follows baseURL.
  _partials/            head, meta, schema, header, footer, install-tabs, ...
assets/
  css/main.css          One stylesheet, layered, token-driven.
  js/main.js            One script.
  fonts/                Inter Variable, woff2.
  img/logomark.svg      The chevron mark. Inlined into the page.
  img/icon.svg          Mark on a navy rounded square. Source for every icon.
  img/og-image.jpg      Social card, 1200x630.
scripts/
  generate-icons.mjs    Regenerates static/ icons from assets/img/icon.svg.
static/                 Generated icons, manifest, _headers. Copied verbatim.
```

### Brand assets

Everything derives from one vector. `assets/img/icon.svg` carries geometry
extracted from the brand master (`Sortie AI Logo_E.svg`, Illustrator, viewBox
`0 0 2000 2000`): the four cyan polygons that form the chevron S. The wordmark
is deliberately **not** in the SVG — "Sortie" is set as HTML text beside the
mark, so baking it in would duplicate it and make it unselectable.

Placement was measured from the brand's own 256px favicon export rather than
guessed: corner radius `38/256`, mark 192px wide, centred at `(128, 126.5)`.
Rendering `icon.svg` at 256px and comparing against that master gives RMSE
0.04, all of it edge antialiasing.

To regenerate every icon after a brand change:

```bash
node scripts/generate-icons.mjs   # needs ImageMagick for the .ico
```

The mark inherits `currentColor`, so the BRAND token swap recolours it along
with the rest of the page. `favicon.svg` is real geometry, not a bitmap in an
SVG wrapper.

## Things that will bite you

**The release number.** `params.version` in `hugo.toml` is the single place it
lives. It feeds the nav chip, the JSON-LD `softwareVersion` and `llms.txt`, and
it stays bare — never a leading `v`.

**Immutable caching.** `static/_headers` marks `/css/*`, `/js/*` and `/fonts/*`
as `immutable` for a year. That is safe only because Hugo fingerprints those
filenames. Never add a path served from `static/` to those rules — filenames
there are stable, and a year-long cache would strand the edit. `/img/*` is
deliberately *not* immutable, because the social card's URL must stay constant.

**JSON-LD needs `safeJS`.** Go's `html/template` treats anything inside a
`<script>` as JavaScript and will escape a `jsonify` result into a quoted
string. The block then parses as a JSON string, not an object, and every
validator rejects it silently. See the comment in `layouts/_partials/schema.html`.

**The font URL is injected.** `assets/css/main.css` is run through
`resources.ExecuteAsTemplate` so the `@font-face` `src` carries the font's own
fingerprint. A literal relative path would resolve against the fingerprinted
stylesheet's directory and 404.

**Order of operations in the pipeline.** Minify, then fingerprint. Reversing
them hashes the unminified bytes, so the filename does not match what ships.

## Hosting

Cloudflare **Workers**, not Pages. Cloudflare's guidance since April 2025 is to
start new projects on Workers; Pages remains supported but receives no new
feature investment. `wrangler.toml` uses `[assets] directory`, which is the
Workers form — a Pages project would carry `pages_build_output_dir` instead.

The documentation site at `docs.sortie-ai.com` runs the same way, from
[sortie-ai/docs](https://github.com/sortie-ai/docs).

## Licence

The Sortie product is [Apache-2.0](https://github.com/sortie-ai/sortie/blob/main/LICENSE).
