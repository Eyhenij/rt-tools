#!/usr/bin/env bash
# The scenarios of the split delivery of the kit tokens: what the base and the local pieces of the
# theme hold, in which order they are connected, and when the cut refuses.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the split delivery of the kit tokens"

STYLES="$TOOLS/../dist/ui-kit-v2/styles"
SPLIT="$TOOLS/build-tokens-split.mjs"
FULL_BYTES=619948

if [ ! -f "$STYLES/tokens.css" ]; then
    echo "  build the tokens first: pnpm run build:tokens-v2"
    exit 1
fi

OUT="$(mktemp -d)"
cp "$STYLES/tokens.css" "$OUT/tokens.css"
LINE="$(RT_TOKENS_OUT="$OUT" node "$SPLIT")"

size() { wc -c < "$1" | tr -d ' '; }
count() { grep -c -- "$2" "$1" || true; }
# The custom properties a file declares, one per line.
props() { grep -o -- '--[a-zA-Z0-9-]*:' "$1" | sort -u; }

report "the cut prints the three sizes" "$(printf '%s' "$LINE" | grep -cE '^build-tokens-split: base [0-9]+, scope [0-9]+, full [0-9]+ bytes$')" "1"
report "the full file is the one the package 0.52.0 held" "$(size "$OUT/tokens.css")" "$FULL_BYTES"
report "the full file is not rewritten by the cut" "$(cmp -s "$OUT/tokens.css" "$STYLES/tokens.css" && echo same)" "same"

# The base and the scope together give the full file plus the density repeated at the end of the scope.
DENSITY_REPEAT=$(( $(size "$OUT/tokens.base.css") + $(size "$OUT/tokens.scope.css") - FULL_BYTES ))
report "the density is repeated once, nothing else" "$([ "$DENSITY_REPEAT" -gt 0 ] && [ "$DENSITY_REPEAT" -lt 8000 ] && echo yes)" "yes"

# The base holds no local piece of the theme: the island rules are in the scope only.
report "the base has no island of the theme" "$(count "$OUT/tokens.base.css" 'data-theme=dark\]\[data-preset=material\]')" "0"
report "the scope holds the page root with the set and the dark theme" "$(count "$OUT/tokens.scope.css" ':root\[data-theme=dark\]\[data-preset=material\]')" "1"
report "the base keeps the set Material" "$([ "$(count "$OUT/tokens.base.css" 'data-preset=material')" -gt 0 ] && echo yes)" "yes"

# The order of connection is the base, then the scope: the scope declares no layer, so it wins by place.
report "the scope opens no cascade layer" "$(count "$OUT/tokens.scope.css" '@layer')" "0"

# The properties both files declare are the density's alone: the tail of the base shares nothing else
# with the local pieces, so repeating the density at the end of the scope keeps the order of the full file.
# The tail is what the base holds after the head the base and the full file open with.
node -e "
    const fs = require('fs');
    const base = fs.readFileSync(process.argv[1], 'utf8');
    const full = fs.readFileSync(process.argv[2], 'utf8');
    let i = 0;
    while (base[i] === full[i]) i++;
    fs.writeFileSync(process.argv[3], base.slice(i));
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
