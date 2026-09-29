#!/usr/bin/env bash
# The scenarios of clearing the showcase build cache: what the cleaner removes and what it keeps.
#
# Covers SC-UKV-143 of the spec `docs/specs/ui-kit-v2/snapshots`.
#
# There is no showcase here on purpose: what is judged is which files the call removes over a
# substituted cache, and a real build would add minutes to every scenario.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "clearing the showcase build cache"

WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

mkdir -p "$WORK/tools"
cp "$TOOLS/showcase-cache-clean.mjs" "$WORK/tools/"

fill_cache() {
    rm -rf "$WORK/node_modules"
    mkdir -p "$WORK/node_modules/.cache/storybook/10.6.0/abc/public"
    cd "$WORK" || return 1
    : > node_modules/.cache/storybook/10.6.0/abc/public/runtime_main.1111.hot-update.json
    : > node_modules/.cache/storybook/10.6.0/abc/public/runtime~main.2222.hot-update.js
    : > node_modules/.cache/storybook/10.6.0/abc/public/runtime~main.2222.hot-update.js.map
    : > node_modules/.cache/storybook/10.6.0/abc/public/main.iframe.bundle.js
    : > node_modules/.cache/storybook/10.6.0/abc/public/vendors.iframe.bundle.js.map
}

left() {
    find "$WORK/node_modules" -type f | wc -l | tr -d ' '
}

fill_cache
OUT="$(cd "$WORK" && node tools/showcase-cache-clean.mjs 2>&1)"

report "the leftovers are removed and the bundles are kept" "$(left)" "2"
report "how many were removed is said aloud" "$(printf '%s' "$OUT" | grep -c 'removed 3')" "1"

# A tree where the showcase has never been raised has no such directory at all, and the cleaner
# is called before every raising: a refusal here would stop the showcase itself.
rm -rf "$WORK/node_modules"
if (cd "$WORK" && node tools/showcase-cache-clean.mjs >/dev/null 2>&1); then GOT="green"; else GOT="red"; fi
report "a cache that is not there is not a refusal" "$GOT" "green"

fill_cache
(cd "$WORK" && node tools/showcase-cache-clean.mjs >/dev/null 2>&1)
(cd "$WORK" && node tools/showcase-cache-clean.mjs >/dev/null 2>&1)
report "a second call over a cleared cache removes nothing more" "$(left)" "2"

suite_result "clearing the showcase build cache"
