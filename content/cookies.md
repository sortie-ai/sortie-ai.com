---
title: "Cookies"
eyebrow: "Legal"
lede: "Every cookie and every piece of device storage on both Sortie websites, what each one is for, and how to change your mind. This site sets none at all."
description: "The complete cookie and device-storage inventory for sortie-ai.com and docs.sortie-ai.com, including what Google Analytics receives even when you decline."
effective: "2026-08-11"
toc: true
---

## What this page covers

Sortie runs two websites, and **one choice covers both**:

- **sortie-ai.com** — this site.
- **docs.sortie-ai.com** — the documentation.

They are one site as far as your cookie choice is concerned. The analytics
cookies are written for `sortie-ai.com` and everything underneath it, so the
answer you give on the documentation site applies here too. We are spelling
that out because a consent choice you make in one place should not quietly
govern somewhere you did not know about.

The banner appears only on the documentation site, because that is the only one
of the two that asks for anything.

This page is about cookies and other storage on your device. The wider question
of what we do with data is on the [privacy page](/privacy/).

## sortie-ai.com sets no cookies

This site stores nothing on your device. No cookies, no local storage, no
session storage, no fingerprinting, no third-party scripts, no external fonts.
Everything the page needs comes from this domain.

**The copy counter is not a cookie.** When you click a copy button next to an
install command, your browser sends one request back to this site whose address
names the command you copied — `/copied/brew`, `/copied/sh`, `/copied/ps` or
`/copied/go`. Nothing is written to your device and nothing is read from it. The
request deliberately carries no cookies at all, so it cannot be tied to you or
to any other visit. It tells us that a copy happened and which command it was.

## docs.sortie-ai.com

### Strictly necessary

These are set because the site cannot do what you asked without them. They do
not need consent, and you cannot turn them off separately from the site itself.

| Name | Set by | Purpose | Expires |
|---|---|---|---|
| `cc_cookie` | Sortie | Remembers your cookie choice, so you are not asked on every page | 6 months |
| `sortie_version_seen` | Sortie | Remembers which release announcement you have already seen, so the same banner is not shown twice | 1 year |

### Preferences stored on your device

| Name | Kind | Purpose | Expires |
|---|---|---|---|
| `color-theme` | Local storage | Remembers whether you chose the light or dark theme | Until you clear it |

This is not a cookie, but it is still something kept on your device, so it
belongs on this page. It records a preference you set yourself and is never
sent to us.

### Analytics — only if you accept

These are written **only** after you accept analytics, and removed when you
withdraw. If you decline or ignore the banner, they are never created.

| Name | Set by | Purpose | Domain | Expires |
|---|---|---|---|---|
| `_ga` | Google Analytics | Distinguishes one browser from another | `.sortie-ai.com` | 6 months |
| `_ga_58VR448EJK` | Google Analytics | Keeps track of the current visit | `.sortie-ai.com` | 6 months |

Note the domain. These are written for `sortie-ai.com` and everything below it,
which is why one answer covers both sites. Six months is a deliberate choice —
Google's default is two years.

### Set by our network provider

Cloudflare serves both sites. It may set a cookie called `__cf_bm` to tell
automated traffic from human traffic. We measured both sites while writing this
page and no such cookie was set, but it can appear if we turn bot protection on,
so we would rather list it than surprise you.

Cloudflare also collects **network error reports**: if a request from your
browser fails, your browser may send a short report about the failure to
Cloudflare. Successful requests are not reported. This is a browser feature
enabled across our whole domain, and it stores nothing on your device.

## What Google receives even if you say no

This is the paragraph most cookie notices leave out, and it is the one worth
reading.

Declining analytics stops the **cookie**. It does not stop your browser
**contacting Google**. The analytics tag loads from Google's servers on page
load, before you have answered, so Google receives your IP address and browser
user-agent either way. What your answer controls is whether a cookie is stored,
whether your visits can be linked together, and whether any of it is recorded as
analytics.

We have set every advertising-related permission to denied permanently, not
merely off by default, so nothing here feeds advertising or personalisation.

Google describes what it does with data from sites that use its services on its
own page: [How Google uses information from sites or apps that use our
services](https://www.google.com/policies/privacy/partners/).

## What we measure when analytics is on

Six things, and nothing else:

| Event | What it records |
|---|---|
| Page view | Which page, referrer, approximate location from IP, device and browser |
| Outbound click | The address of the external link you followed |
| Code copy | Which page you copied a code sample from |
| Scroll depth | Whether you reached 25%, 50%, 75% or 90% of a page |
| Page not found | The address that produced a 404, and where you came from |
| Page feedback | The page, and whether you pressed "helpful" or "not helpful" |
| **Search** | **The words you typed into the documentation search box** |

**Search deserves the emphasis.** It is free text, so it records whatever
someone types, and it is sent to Google. We use it to find out what the
documentation fails to explain — the searches that return nothing are the
useful ones. It is only sent once you stop typing, and only for queries of
three characters or more. If you would rather not contribute it, decline
analytics; the search itself runs in your browser and works exactly the same
either way.

<!-- ────────────────────────────────────────────────────────────────────────
     DELETE-IN-ONE-PLACE BLOCK — the browser-side GitHub star count.

     Twin of the block in content/privacy.md. Delete BOTH, together, once the
     documentation site stops fetching the star count in the browser.

     Status at the time of writing: fixed in the sortie-docs working tree
     (build-time value from data/github.yaml) but NOT deployed — the live site
     still ships the browser-side fetch. Verified by fetching
     https://docs.sortie-ai.com/ and finding api.github.com in the HTML.
     ──────────────────────────────────────────────────────────────────────── -->
## The GitHub star count

Separately from analytics, the documentation pages currently ask GitHub for the
project's star count when the page loads, and they do it whatever you answered
on the banner. It stores nothing on your device, which is why it is not gated
behind consent — but GitHub does see your IP address and user-agent. We are
moving this to build time, at which point the request stops happening at all and
this section will be removed.

## Changing your mind

Your choice is stored for six months, after which you will be asked again.

To change it before then, use the **Manage cookies** link at the foot of any page
on [docs.sortie-ai.com](https://docs.sortie-ai.com/) — that is where the banner
lives, and the answer you give there covers this site too. It reopens the same
dialog you saw the first time, with your current answer already showing, and a
new one takes effect straight away.

Every browser can also block or delete cookies for a site outright, and doing so
for `sortie-ai.com` will stop all of the above regardless of what you told us.

Withdrawing consent does not undo measurements already taken, but it stops any
further ones and removes the cookies from your device.

## Questions

Write to **privacy@sortie-ai.com**. There is more detail about legal bases,
recipients, retention and your rights on the [privacy page](/privacy/).
