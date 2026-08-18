<div align="center">

# sortie-ai.com

**Source for [sortie-ai.com](https://sortie-ai.com)**

[Documentation](https://docs.sortie-ai.com) · [Report an Issue](https://github.com/sortie-ai/sortie-ai.com/issues/new) · [Main repository](https://github.com/sortie-ai/sortie)

</div>

---

## About Sortie

Sortie is an autonomous coding agent orchestrator. Engineers manage work at the ticket level - Sortie handles the rest: isolated workspaces, retry logic, state reconciliation, tracker integration, and cost tracking. Single binary, zero dependencies, SQLite persistence.

For a full overview, see the [product documentation](https://docs.sortie-ai.com).

## Tech Stack

| Component | Details |
|---|---|
| **Static site generator** | [Hugo](https://gohugo.io/) ≥ 0.164.0 (extended) |
| **Styling** | Hand-written CSS on design tokens, cascade layers, no framework |
| **Typography** | Inter Variable, self-hosted, latin subset, weight axis only |
| **JavaScript** | ~150 lines, no dependencies, bundled by Hugo's `js.Build` |
| **Deployment** | [Cloudflare Workers](https://developers.cloudflare.com/workers/) (static assets via Wrangler) |

Every shipped asset is fingerprinted and carries a Subresource Integrity digest.
There is no Node dependency in the build itself; npm is only used for Wrangler.

## Prerequisites

- [Hugo](https://gohugo.io/installation/) ≥ 0.164.0 **extended** version
- [Go](https://go.dev/dl/) ≥ 1.20 - required by Hugo Modules (theme dependency management)
- [Git](https://git-scm.com/) - required for `enableGitInfo` (last-modified dates)
- [Node.js](https://nodejs.org/) - required for Wrangler deployment

## Local development

Clone the repository and start the dev server. Hugo automatically downloads the Hextra theme on first run:

```bash
git clone https://github.com/sortie-ai/sortie-ai.com.git
cd sortie-ai.com

hugo server \
  --environment development \
  --logLevel info \
  --buildDrafts \
  --buildFuture \
  --ignoreCache \
  --disableFastRender

# Or use the npm script
npm run server
```

Open `http://localhost:1313` in your browser. Hugo watches for file changes and reloads automatically.

### Build for Production

```bash
hugo \
  --environment production \
  --gc \
  --logLevel info \
  --minify \
  --cleanDestinationDir \
  --printPathWarnings \
  --printMemoryUsage

# Or use the npm script
npm run build
```

The generated static site in `public/` is deployed to Cloudflare Workers via Wrangler:

```bash
npx wrangler deploy
```

## Contributing

We welcome contributions from the community - whether it's fixing a typo, improving a guide, or adding new content.

### Quick Edits

For small fixes (typos, broken links, wording improvements), edit the file directly on GitHub and open a Pull Request.

## Related

| Link | Description |
|---|---|
| [sortie-ai/sortie](https://github.com/sortie-ai/sortie) | Main project - the Sortie orchestrator binary |
| [sortie-ai/docs](https://github.com/sortie-ai/docs) | Sortie Documentation |
| [sortie-ai/homebrew-tap](https://github.com/sortie-ai/homebrew-tap) | Homebrew Tap for Sortie |

## License

Documentation text is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Code examples and configuration samples are licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).

See [LICENSE](LICENSE) for full details.
