---
title: "Privacy"
eyebrow: "Legal"
lede: "What Sortie collects, what the websites collect, and what you can do about it. The short version: the software collects nothing, this site sets no cookies, and the documentation site runs analytics only if you say yes."
description: "How Sortie handles personal data. The Sortie software sends no telemetry. sortie-ai.com sets no cookies and contacts no third parties. docs.sortie-ai.com uses Google Analytics only with consent."
effective: "2026-08-11"
toc: true
---

## Who this applies to

Sortie is two different things at once, and privacy law treats them very
differently. This page is split accordingly, and the first section is the one
that matters most.

**If you run the Sortie software**, this policy does not describe your data,
because we never receive it. Sortie runs entirely on your own machine or
server. It sends us nothing — no usage statistics, no error reports, not even
a version check. When Sortie talks to Jira, GitHub or a coding agent, it is
your installation talking to services you configured, under your own accounts.
For that processing we are neither the controller nor the processor. You are.

**If you visit these websites**, this policy applies in full. There are two:

- **sortie-ai.com**, this site. It sets no cookies and loads nothing from
  anyone else.
- **docs.sortie-ai.com**, the documentation. It uses Google Analytics, but only
  after you agree.

**If you are an end user of something built with Sortie** — for example, you
filed a ticket that someone's Sortie installation picked up — we have no
relationship with your data at all. Ask the organisation running that
installation.

## Who we are

The controller for the processing described below is:

**Sortie AI, LLC**, a limited liability company formed in the State of
Delaware, United States (file number 10582446), operating from Poland.

The way to reach us about anything on this page, including any request to
exercise the rights described further down, is:

**privacy@sortie-ai.com**

We publish no postal address. The company's Delaware registered office is its
registered agent's office, not a place of business, and that agent undertakes to
accept service of process — not to forward a data-protection request to us
within a month. Publishing it would advertise a channel we do not operate. The
mailbox above is monitored and is the faster route to a person.

We have not appointed a data protection officer. We are not required to, and
we would rather tell you that than imply a role nobody holds.

## The Sortie software collects nothing

This is worth stating precisely, because "no telemetry" is a claim that is easy
to make and easy to get wrong.

Sortie contains no telemetry client, no analytics client, no crash reporter and
no update check. The only network destinations it reaches are the ones your own
configuration names. There is no Sortie-operated endpoint of any kind compiled
into the binary — there is nowhere for it to phone home to.

Everything Sortie records stays on your machine: a local SQLite database, and a
state directory inside each workspace. It holds ticket identifiers, attempt
counts, timestamps, token counts and workspace paths. Ticket titles and
descriptions are not stored; they pass into the prompt at run time and are gone.
Credentials are read from environment variables, sent only in an `Authorization`
header, and never written to logs.

Two boundaries we would rather name than gloss over:

- **The coding agent is a separate program.** Sortie launches Claude Code,
  Codex, Copilot, Kiro or OpenCode as a subprocess. Those tools talk to their
  own vendors under your own agreement with them. Sortie sets no variable that
  turns that on and none that turns it off. What we say here is about Sortie,
  and it does not extend to the programs Sortie runs.
- **`sortie stats` exports local paths.** If you export your own statistics and
  send the file somewhere, it contains workspace and database paths from your
  machine. Nothing sends it anywhere on its own — but it is your export, so it
  is worth knowing what is in it.

The reasoning behind all of this is written up as an architecture decision
record, [ADR-0019](https://github.com/sortie-ai/sortie/blob/main/docs/decisions/0019-keep-usage-data-on-the-host.md),
which sets out how the claim can be falsified rather than merely asserting it.

## This site, sortie-ai.com

This site sets no cookies, stores nothing on your device, and loads no fonts,
scripts, or images from anyone else. Everything comes from this domain.

Two things do happen:

**Server logs.** Like every website, this one is served by a network that
records requests: your IP address, the page requested, the time, your browser's
user-agent string and the country the request came from. Cloudflare provides
this service to us and processes that data on our instructions. We use it to
keep the site up, to see roughly how many people visit, and to deal with abuse.
These detailed records are held for a short window — on the order of a week —
and then deleted. The exact period is set by Cloudflare's platform rather than
by us, and we cannot extend it.

**A copy counter.** When you click the copy button next to an install command,
your browser sends one request back to this site whose address names the
command you copied — `/copied/brew`, for example. That is the whole message. It
carries no cookie, no identifier and nothing about you; we set it up
specifically so that it cannot. It tells us that somebody copied the Homebrew
command, not who.

We rely on our legitimate interest in running and improving the site for both.
Neither involves storing anything on your device, so neither asks for consent.

## The documentation site, docs.sortie-ai.com

The documentation site is where the actual choice lives.

**Google Analytics runs there, and only if you accept it.** Analytics cookies
are switched off until you say yes. If you say no, or ignore the banner, no
analytics cookie is ever written and no analytics profile is built. You can
change your mind at any time, and the [cookie page](/cookies/) explains exactly
how.

When analytics is on, we see which pages are read, which links are followed,
which code samples are copied, how far down the page people get, which pages
are rated helpful, and **what people type into the documentation search box**.
That last one is deliberately called out: it is free text, it goes to Google,
and it could contain whatever someone typed. We use it to find gaps in the
documentation. If you would rather it did not, decline analytics.

Google acts as our processor for this. It is not permitted to use the data for
its own purposes, and every advertising-related setting is switched off
permanently rather than merely defaulted off.

**One thing most cookie banners never admit:** declining analytics stops the
cookie, but your browser still contacts Google to load the analytics script, so
Google still sees your IP address and user-agent. That is a property of how the
tag works, not a loophole we chose. The [cookie page](/cookies/) says more.

<!-- ────────────────────────────────────────────────────────────────────────
     DELETE-IN-ONE-PLACE BLOCK — the browser-side GitHub star count.

     Delete this entire paragraph, and its twin in content/cookies.md, once
     the documentation site stops fetching the star count in the browser.

     Status at the time of writing: the fix exists in the sortie-docs working
     tree (the count is read at build time from data/github.yaml) but is NOT
     yet deployed — the live site still runs the browser-side fetch. Verified
     by fetching https://docs.sortie-ai.com/ and finding api.github.com in the
     shipped HTML. Do not delete this paragraph until that is no longer true.
     ──────────────────────────────────────────────────────────────────────── -->
**A star count from GitHub.** The documentation pages show how many stars the
project has on GitHub, and at present your browser fetches that number from
GitHub directly when the page loads. That request happens before the cookie
banner asks you anything, because it stores nothing on your device and is not a
cookie — but it does mean GitHub sees your IP address and user-agent. We are in
the process of moving this to build time so the request disappears.

## Who receives data

Three companies, and it depends which site you are on.

**Visitors to sortie-ai.com** — Cloudflare only, as our processor, for serving
and protecting the site.

**Visitors to docs.sortie-ai.com** — Cloudflare on the same basis; Google, as
our processor, if and only if you accepted analytics; and GitHub, which
receives your IP address when your browser fetches the star count described
above.

That is the complete list. We do not sell data, we do not share it with
advertisers, and there is no advertising on either site.

## Sending data outside Europe

If you accept analytics, data goes to Google LLC in the United States.

We rely on the mechanism Google offers for these transfers under European data
protection law, which at present is the EU–US Data Privacy Framework together
with the standard contractual clauses in Google's terms. That legal landscape
has changed before and may change again; if the mechanism we rely on changes,
we will update this page rather than leave a stale sentence here.

Cloudflare serves both sites from a global network, so a request may be handled
outside the EU. GitHub is a US company.

## How long we keep things

| What | How long |
|---|---|
| Cloudflare request logs | About a week, set by Cloudflare |
| Google Analytics data | 14 months |
| Analytics cookies on your device | 6 months |
| Your consent choice | 6 months, then you are asked again |
| Aggregate statistics | Indefinitely — see below |

The last row is the honest one. We keep daily totals — how many requests a page
got, which countries they came from, how many people copied an install command.
Those summaries contain **no IP addresses and no per-visitor records**; they
cannot be traced back to a person, and they are never joined back into
individual rows. We keep them because we want to see how the project grows over
years, and the services above delete their own history long before that.

## Your rights

Under European data protection law you can ask us to give you a copy of your
data, correct it, delete it, restrict what we do with it, object to processing
we base on legitimate interests, or receive it in a portable form. Where we rely
on your consent, you can **withdraw it at any time**, and doing so does not make
anything we did beforehand unlawful.

Write to **privacy@sortie-ai.com**. We will reply within one month.

Be aware of one practical limit: analytics data is not linked to your name or
your email address, so for most requests we genuinely cannot tell which records
are yours. If you want analytics about you gone, the reliable route is to
withdraw consent and clear the cookies — the [cookie page](/cookies/) shows
how — rather than to write to us.

If you think we have got something wrong, you can complain to a data protection
authority — normally the one where you live or work. The authority for the
country we operate from is Poland's **Urząd Ochrony Danych Osobowych**
(Personal Data Protection Office), ul. Stanisława Moniuszki 1A, 00-014 Warsaw,
[uodo.gov.pl](https://uodo.gov.pl/).

## No automated decisions

We do not make automated decisions about you, and we do not profile you. There
is nothing here that decides anything about a person. We are stating it
explicitly because the law asks us to say so either way.

## Changes to this page

If we change what we collect, we will change this page and move the date at the
top. Material changes to anything you consented to will be put back in front of
you rather than quietly edited in.
