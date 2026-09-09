# Licenses for the adapter brand icons

Eleven SVG files serve the twelve chips in section `02 YOUR STACK`. GitHub, GitLab
and Gitea each appear twice, once under `TRACKERS` and once under
`PULL REQUESTS AND CI`, and reuse the same file.

## simple-icons, CC0 1.0 Universal

Ten of the eleven glyphs come from [simple-icons](https://github.com/simple-icons/simple-icons)
version 16.30.0, whose `package.json` declares `"license": "CC0-1.0"` and which
ships the full CC0 1.0 Universal text as `LICENSE.md`.

| File | Slug | Upstream URL |
| --- | --- | --- |
| `jira.svg` | `jira` | https://cdn.jsdelivr.net/npm/simple-icons@16.30.0/icons/jira.svg |
| `github.svg` | `github` | https://cdn.jsdelivr.net/npm/simple-icons@16.30.0/icons/github.svg |
| `gitlab.svg` | `gitlab` | https://cdn.jsdelivr.net/npm/simple-icons@16.30.0/icons/gitlab.svg |
| `linear.svg` | `linear` | https://cdn.jsdelivr.net/npm/simple-icons@16.30.0/icons/linear.svg |
| `gitea.svg` | `gitea` | https://cdn.jsdelivr.net/npm/simple-icons@16.30.0/icons/gitea.svg |
| `claude-code.svg` | `claude` | https://cdn.jsdelivr.net/npm/simple-icons@16.30.0/icons/claude.svg |
| `copilot-cli.svg` | `githubcopilot` | https://cdn.jsdelivr.net/npm/simple-icons@16.30.0/icons/githubcopilot.svg |
| `opencode.svg` | `opencode` | https://cdn.jsdelivr.net/npm/simple-icons@16.30.0/icons/opencode.svg |
| `gemini.svg` | `googlegemini` | https://cdn.jsdelivr.net/npm/simple-icons@16.30.0/icons/googlegemini.svg |

CC0 is a waiver of copyright, so these files may be copied, modified and
redistributed without attribution or conditions.

The upstream files were verified against the npm tarball
`simple-icons-16.30.0.tgz` rather than the CDN alone, because jsDelivr's
version-pinned path and its `@latest` alias disagree about which icons exist.
The tarball is authoritative.

## LobeHub icons, MIT

`kiro.svg` comes from [`@lobehub/icons-static-svg`](https://github.com/lobehub/lobe-icons)
version 1.95.0, licensed MIT (Copyright (c) 2023 LobeHub).

| File | Slug | Upstream URL |
| --- | --- | --- |
| `kiro.svg` | `kiro` | https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@1.95.0/icons/kiro.svg |

MIT permits use and redistribution provided the copyright notice and permission
notice travel with the software. This file records that notice; if the icon set
grows to include more MIT-licensed marks, keep the notice here rather than
inside each SVG, since the deliverable forbids comments in the files.

simple-icons 16.30.0 does not carry Kiro under any slug, and Kiro's own
repository ships no vector and declares no license, so LobeHub is the only
source found that offers the mark under permissive terms.

## Authored here, no third-party artwork

`codex.svg` is a typographic `CX` monogram, not a brand mark. The Figma file
draws that chip as a text node reading `CX`, so there is no third-party artwork
to license. Written for this repository and covered by whatever license the
repository carries.

## Trademarks

The CC0 waiver and the MIT grant cover the SVG files, not the marks they depict.
Every glyph here is a trademark of its owner: Atlassian, GitHub, GitLab, Linear,
the Gitea project, Anthropic, Amazon, Google, and the OpenCode project. Nothing
in either license grants any trademark right.

Using these marks to name the third-party products an integration grid connects
to is nominative use and is the ordinary practice for such a grid. It carries
two conditions worth keeping: each mark identifies only the product it names,
and the grid must not suggest that any of these vendors endorses or sponsors
this project.

Kiro is a trademark of Amazon. Its mark is the one to watch, because Amazon
publishes no brand kit for Kiro and the permissive license here comes from a
third-party icon set rather than from Amazon. That is the same posture as every
other row in this file, but it is worth stating explicitly since the owner may
prefer to swap in a typographic chip. The alternative, if that call is made, is
the treatment the designer already used for Codex.
