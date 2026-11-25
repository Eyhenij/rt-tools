#!/usr/bin/env bash
# The scenarios of the kit weight check: what counts as a drift from the threshold in either
# direction, and what the check lets pass.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the weight of the kit parts on the consumer's start"

SET='["select","menu","input","icon","popover","dialog","bottom-sheet"]'
THRESHOLD="{\"set\":$SET,\"total\":1000,\"gzip\":400,\"parts\":{\"menu\":600,\"popover\":400},\"styles\":{\"tokens.css\":5000}}"
SAME='{"total":1000,"gzip":400,"parts":{"menu":600,"popover":400},"styles":{"tokens.css":5000}}'

# One call of the comparison: the measured result and the threshold go in as JSON, the failure lines
# come out one per line.
failures() {
    node --input-type=module -e "
        import { compare } from '$TOOLS/check-kit-weight.mjs';
        const lines = compare(JSON.parse(process.argv[1]), JSON.parse(process.argv[2]));
        console.log(lines.join('\n'));
    " "$1" "${2:-$THRESHOLD}"
}

count() { printf '%s\n' "$1" | grep -c -- "$2"; }

report "the same weight passes" "$(failures "$SAME")" ""

GREW="$(failures '{"total":1100,"gzip":400,"parts":{"menu":700,"popover":400},"styles":{"tokens.css":5000}}')"
report "growth of the set is named" "$(count "$GREW" 'набор вырос')" "1"
report "growth of a part is named" "$(count "$GREW" 'часть menu вырос')" "1"
report "a part that did not grow is not named" "$(count "$GREW" 'popover')" "0"

LOWER="$(failures '{"total":900,"gzip":400,"parts":{"menu":500,"popover":400},"styles":{"tokens.css":5000}}')"
report "a lighter set is red until the threshold is written" "$(count "$LOWER" 'снизился')" "2"
report "the lowering names the write command" "$(count "$LOWER" -- '--write')" "2"

GZIP="$(failures '{"total":1000,"gzip":500,"parts":{"menu":600,"popover":400},"styles":{"tokens.css":5000}}')"
report "growth of the gzip size alone is named" "$(count "$GZIP" 'gzip набора вырос')" "1"

NEW="$(failures '{"total":1000,"gzip":400,"parts":{"menu":600,"popover":400,"tooltip":10},"styles":{"tokens.css":5000}}')"
report "a part missing from the threshold is named" "$(count "$NEW" 'tooltip не записана')" "1"

GONE="$(failures '{"total":1000,"gzip":400,"parts":{"menu":600},"styles":{"tokens.css":5000}}')"
report "a part in the threshold but not measured is named" "$(count "$GONE" 'popover записана в пороге')" "1"

STYLE="$(failures '{"total":1000,"gzip":400,"parts":{"menu":600,"popover":400},"styles":{"tokens.css":5600}}')"
report "growth of a styles file is named" "$(count "$STYLE" 'файл стилей tokens.css вырос')" "1"

NOSTYLE="$(failures '{"total":1000,"gzip":400,"parts":{"menu":600,"popover":400},"styles":{}}')"
report "a styles file in the threshold but not built is named" "$(count "$NOSTYLE" 'tokens.css записан в пороге')" "1"

BARE="{\"set\":$SET,\"total\":1000,\"gzip\":400}"
report "a threshold without sections is named, not a crash" "$(count "$(failures "$SAME" "$BARE")" 'не записан')" "3"

GZIPNEAR="$(failures '{"total":1000,"gzip":401,"parts":{"menu":600,"popover":400},"styles":{"tokens.css":5000}}')"
report "a gzip drift inside the tolerance passes" "$GZIPNEAR" ""

OTHER_SET="{\"set\":[\"menu\"],\"total\":1000,\"gzip\":400,\"parts\":{\"menu\":600,\"popover\":400},\"styles\":{\"tokens.css\":5000}}"
report "a changed set is named" "$(count "$(failures "$SAME" "$OTHER_SET")" 'набор частей изменился')" "1"

suite_result "check-kit-weight"
