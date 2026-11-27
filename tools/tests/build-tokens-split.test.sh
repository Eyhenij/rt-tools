#!/usr/bin/env bash
# The scenarios of the split delivery of the kit tokens: what the base and the local pieces of the
# theme hold, in which order they are connected, and when the cut refuses.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "SC-UKV-1780 — the split delivery of the kit tokens"

STYLES="$TOOLS/../dist/ui-kit-v2/styles"
SPLIT="$TOOLS/build-tokens-split.mjs"

if [ ! -f "$STYLES/tokens.css" ]; then
    echo "  the tokens are not built (pnpm run build:tokens-v2)"
    # In the pipeline and in the push set a missing build is a refusal, not a skip.
    if [ -n "$CI" ] || [ -n "$RT_PUSH" ]; then
        exit 1
    fi
    suite_result "build-tokens-split"
    exit $?
fi

OUT="$(mktemp -d)"
cp "$STYLES/tokens.css" "$OUT/tokens.css"
LINE="$(RT_TOKENS_OUT="$OUT" node "$SPLIT")"

size() { wc -c < "$1" | tr -d ' '; }
count() { grep -c -- "$2" "$1" || true; }
# The custom properties a file declares, one per line.
props() { grep -oE -- '(--[a-zA-Z0-9-]+|color-scheme):' "$1" | sort -u; }

report "the cut prints the three sizes" "$(printf '%s' "$LINE" | grep -cE '^build-tokens-split: base [0-9]+, scope [0-9]+, full [0-9]+ bytes$')" "1"
report "the full file is not rewritten by the cut" "$(cmp -s "$OUT/tokens.css" "$STYLES/tokens.css" && echo same)" "same"

# The base and the scope together give the full file plus what is repeated: the density rules at the end
# of the scope and the root rule of the set Material under the dark theme at the end of the base.
REPEAT=$(( $(size "$OUT/tokens.base.css") + $(size "$OUT/tokens.scope.css") - $(size "$OUT/tokens.css") ))
report "only the density and the root rule are repeated" "$([ "$REPEAT" -gt 0 ] && [ "$REPEAT" -lt 10000 ] && echo yes)" "yes"

# The base holds no island of the theme, but it holds the page root with the set Material and the dark
# theme: that rule wins by weight, so the base works for such a page without the scope.
report "the base has no island of the set under a page theme" "$(count "$OUT/tokens.base.css" '^\[data-theme=dark\] \[data-preset=material\]')" "0"
report "the base has no island of a light or dark node" "$(grep -cE '^(\[data-theme=(light|dark)\]:not\(:root\)|\.rt-preset-material:not\(:root\)|html\.rt-theme-dark \[data-preset)' "$OUT/tokens.base.css" || true)" "0"
report "the base holds the page root with the set and the dark theme" "$(count "$OUT/tokens.base.css" '^:root\[data-theme=dark\]\[data-preset=material\]')" "1"
report "the scope holds the same root rule as the full file" "$(count "$OUT/tokens.scope.css" '^:root\[data-theme=dark\]\[data-preset=material\]')" "1"
report "the scope holds the islands of the set" "$([ "$(count "$OUT/tokens.scope.css" '^\[data-theme=dark\] \[data-preset=material\]')" -gt 0 ] && echo yes)" "yes"
report "the base keeps the set Material" "$([ "$(count "$OUT/tokens.base.css" 'data-preset=material')" -gt 0 ] && echo yes)" "yes"

# A set of values is long, and every copy of it lies in the styles of an application: the pieces that
# share a set share one rule. The count of the long bodies guards the comparison against an empty list.
SETS="$(node -e "
    const css = require('fs').readFileSync(process.argv[1], 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const bodies = [...css.matchAll(/\{([^{}]*)\}/g)].map((found) => found[1].replace(/\s+/g, ' ')).filter((body) => body.length > 1500);
    console.log(bodies.length - new Set(bodies).size, bodies.length >= 4 ? 'compared' : 'nothing to compare');
" "$OUT/tokens.scope.css")"
report "the scope writes every set of values once" "$SETS" "0 compared"

# The two shared rules of the set: each holds all its selectors, and the light one stands above the dark
# one. Under `[data-theme=dark]` a node carrying the set is told apart from the light rule by that order.
SHARED_RULES="$(node -e "
    const css = require('fs').readFileSync(process.argv[1], 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
        .map((found) => ({ selectors: found[1].trim().split(/\s*,\s*/), size: found[2].length }))
        .filter((rule) => rule.size > 1500);
    const light = [
        '.rt-preset-material:not(:root)',
        '.rt-preset-material [data-theme=light]:not(:root)',
        '.rt-preset-material[data-theme=light]:not(:root)',
        '[data-preset=material]:not(:root)',
        '[data-preset=material] [data-theme=light]:not(:root)',
        '[data-preset=material][data-theme=light]:not(:root)',
        '[data-theme=dark] [data-theme=light] .rt-preset-material',
        '[data-theme=dark] [data-theme=light] [data-preset=material]',
        'html.rt-theme-dark [data-theme=light] .rt-preset-material',
        'html.rt-theme-dark [data-theme=light] [data-preset=material]',
    ];
    const dark = [
        '.rt-preset-material [data-theme=dark]:not(:root)',
        '.rt-preset-material[data-theme=dark]:not(:root)',
        '[data-preset=material] [data-theme=dark]:not(:root)',
        '[data-preset=material][data-theme=dark]:not(:root)',
        '[data-theme=dark] .rt-preset-material',
        '[data-theme=dark] [data-preset=material]',
        'html.rt-theme-dark .rt-preset-material',
        'html.rt-theme-dark [data-preset=material]',
    ];
    const at = (wanted) => rules.findIndex((rule) => [...rule.selectors].sort().join('|') === [...wanted].sort().join('|'));
    const [lightAt, darkAt] = [at(light), at(dark)];
    console.log(rules.length, lightAt < 0 ? 'no light' : 'light', darkAt < 0 ? 'no dark' : 'dark', lightAt < darkAt ? 'light above' : 'light below');
" "$OUT/tokens.scope.css")"
report "the shared rules of the set keep their selectors and their order" "$SHARED_RULES" "5 light dark light above"

# The same two rules by their values: the light one answers with every name of the set Material and sets
# no colour scheme, the dark one sets the dark scheme and answers with every name of the dark set. The
# expected values are read from the source of the set, and the last declaration of a rule wins.
SHARED_VALUES="$(node -e "
    const fs = require('fs');
    const clean = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '');
    const declarations = (body) => new Map([...body.matchAll(/(--[a-zA-Z0-9-]+|color-scheme):([^;]*);/g)]
        .map((found) => [found[1], found[2].replace(/\s+/g, '')]));
    const css = clean(fs.readFileSync(process.argv[1], 'utf8'));
    const source = clean(fs.readFileSync(process.argv[2], 'utf8'));
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
    const rule = (selector) => declarations(rules.find((found) => found[2].length > 1500
        && found[1].trim().split(/\s*,\s*/).includes(selector))?.[2] ?? '');
    const mixin = (name) => declarations(source.split('@mixin ' + name + ' {')[1].split('\n}')[0]);
    const answer = (found, wanted) => wanted.size < 10 ? 'nothing to compare'
        : [...wanted].filter(([name, value]) => found.get(name) !== value).length;
    const light = rule('[data-preset=material]:not(:root)');
    const dark = rule('[data-theme=dark] [data-preset=material]');
    console.log(answer(light, mixin('rt-preset-material-tokens')), light.get('color-scheme') ?? 'no scheme',
        answer(dark, mixin('rt-preset-material-dark-tokens')), dark.get('color-scheme') ?? 'no scheme');
" "$OUT/tokens.scope.css" "$TOOLS/../projects/ui-kit-v2/src/styles/_preset-material.scss")"
report "the shared rules of the set hold their values" "$SHARED_VALUES" "0 no scheme 0 dark"

# The order of connection is the base, then the scope: the scope declares no layer, so it wins by place.
report "the scope opens no cascade layer" "$(count "$OUT/tokens.scope.css" '@layer')" "0"

# The properties both files declare are the density's alone: the tail of the base shares nothing else
# with the local pieces, so repeating the density at the end of the scope keeps the order of the full file.
# The tail is what the base holds after the head the base and the full file open with, up to the copy
# of the root rule that the cut appends.
node -e "
    const fs = require('fs');
    const base = fs.readFileSync(process.argv[1], 'utf8');
    const full = fs.readFileSync(process.argv[2], 'utf8');
    let i = 0;
    while (base[i] === full[i]) i++;
    const marker = base.indexOf('/* The set and a dark theme both on the page root.');
    fs.writeFileSync(process.argv[3], base.slice(i, marker < 0 ? base.length : marker));
" "$OUT/tokens.base.css" "$OUT/tokens.css" "$OUT/tail.css"
SHARED="$(comm -12 <(props "$OUT/tail.css") <(props "$OUT/tokens.scope.css") | tr '\n' ' ')"
report "the tail of the base shares only the density properties with the scope" "$SHARED" "--rt-input-density: --rt-input-height-md: --rt-input-height: "

# The density rules end the scope, as they end the full file.
LAST_RULE="$(tail -c 3000 "$OUT/tokens.scope.css" | grep -c 'data-rt-density')"
report "the scope ends with the density rules" "$([ "$LAST_RULE" -gt 0 ] && echo yes)" "yes"

# The cut refuses a full file that does not fold from the head, the middle and the tail.
BAD="$(mktemp -d)"
{ printf '/* stray */\n'; cat "$STYLES/tokens.css"; } > "$BAD/tokens.css"
RT_TOKENS_OUT="$BAD" node "$SPLIT" >/dev/null 2>"$BAD/err"
report "a full file with a stray head is refused" "$?" "1"
report "the refusal names the head" "$(grep -q 'head of the tokens' "$BAD/err" && echo named)" "named"

BAD2="$(mktemp -d)"
{ cat "$STYLES/tokens.css"; printf '\n/* stray */\n'; } > "$BAD2/tokens.css"
RT_TOKENS_OUT="$BAD2" node "$SPLIT" >/dev/null 2>"$BAD2/err"
report "a full file with a stray tail is refused" "$?" "1"
report "the refusal names the tail" "$(grep -q 'tail of the tokens' "$BAD2/err" && echo named)" "named"

rm -rf "$OUT" "$BAD" "$BAD2"
suite_result "build-tokens-split"
