#!/usr/bin/env bash
#
# Rewrite params.version in hugo.toml with the latest published sortie release.
#
# Runs during the Cloudflare build, not in CI: nothing commits the result. The
# value in git is the fallback the build falls back to when this fetch fails,
# so it is usually one release behind and that is expected.

set -euo pipefail

REPO="${SORTIE_REPO:-sortie-ai/sortie}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG="${SORTIE_HUGO_CONFIG:-$ROOT/hugo.toml}"

die() { printf '\033[31merror:\033[0m %s\n' "$*" >&2; exit 1; }
log() { printf '\033[2m%s\033[0m %s\n' "$(date -u +%H:%M:%S)" "$*" >&2; }

command -v curl    >/dev/null 2>&1 || die "required command not found: curl"
command -v python3 >/dev/null 2>&1 || die "required command not found: python3"

# python3 rather than jq: the Cloudflare Workers Builds image ships curl, git
# and wget but no jq. Reads one top-level key of a JSON object from stdin. A
# missing key, a null, or anything that is not a JSON object all print nothing,
# so a failed parse reaches the caller as an empty string rather than as a
# plausible-looking value.
json_get() {
    python3 -c '
import json, sys
try:
    doc = json.load(sys.stdin)
    value = doc.get(sys.argv[1]) if isinstance(doc, dict) else None
except Exception:
    value = None
print("" if value is None else value)
' "$1"
}

# The releases endpoint is public, so an anonymous request works. Anonymous
# requests are limited to 60 per hour keyed on the *client IP*, and build
# runners share their egress addresses with every other job on the same host.
# Set GH_TOKEN as a build secret if that limit is ever reached.
auth=()
if [ -n "${GH_TOKEN:-}" ]; then
    auth=(-H "Authorization: Bearer $GH_TOKEN")
    log "authenticating with GH_TOKEN"
else
    log "no GH_TOKEN set - requesting anonymously (60/hour, keyed on this IP)"
fi

hdr=$(mktemp)
trap 'rm -f "$hdr"' EXIT

# /releases/latest, not /tags: it skips drafts and pre-releases, so a tag pushed
# mid-release cannot put an unannounced version on the site. --fail-with-body
# makes curl exit non-zero on 4xx and 5xx while still printing the body, so the
# message below can say what GitHub actually objected to.
body=$(curl -sS --fail-with-body -D "$hdr" \
            "${auth[@]}" \
            -H 'Accept: application/vnd.github+json' \
            -H 'X-GitHub-Api-Version: 2022-11-28' \
            "https://api.github.com/repos/$REPO/releases/latest") || {
    status=$(awk 'toupper($1) ~ /^HTTP/ { s = $2 } END { print s }' "$hdr")
    message=$(json_get message <<<"$body" 2>/dev/null)
    case "$status" in
        404) die "GET /repos/$REPO/releases/latest returned 404. Either the repository was renamed, or it has no published non-draft release yet." ;;
        403|429) die "GET /repos/$REPO/releases/latest returned $status (rate limited or forbidden): ${message:-no message}" ;;
        *) die "GET /repos/$REPO/releases/latest returned HTTP ${status:-?}: ${message:-no message}" ;;
    esac
}

tag=$(json_get tag_name <<<"$body")
[ -n "$tag" ] || die "the response carried no tag_name. It was probably an error object, not a release."

# Tags are v-prefixed from 1.19.0 on while the version number stays bare. Strip
# here and nowhere else: a `v` reaching params.version corrupts softwareVersion,
# the nav chip and llms.txt, and schema.org types softwareVersion as free-form
# Text, so no validator would flag it.
version="${tag#v}"
[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] \
    || die "release tag '${tag}' does not normalise to a bare X.Y.Z version"

[ -f "$CONFIG" ] || die "no such file: $CONFIG"

# Assert the key is unique before editing, so a future restructuring of
# hugo.toml fails here instead of rewriting the wrong line.
count=$(grep -c '^version = "' "$CONFIG" || true)
[ "$count" = "1" ] \
    || die "expected exactly one '^version = \"' line in ${CONFIG#"$ROOT"/}, found ${count}"

current=$(sed -n 's/^version = "\(.*\)"$/\1/p' "$CONFIG")
if [ "$current" = "$version" ]; then
    log "${CONFIG#"$ROOT"/} already reads ${version} - nothing to do"
    exit 0
fi

sed -i "s/^version = \".*\"$/version = \"${version}\"/" "$CONFIG"
grep -qx "version = \"${version}\"" "$CONFIG" || die "the rewrite did not take"

log "params.version ${current} -> ${version} in ${CONFIG#"$ROOT"/}"
