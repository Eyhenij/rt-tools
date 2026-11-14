#!/usr/bin/env bash
# The pure part of the showcase gate `tools/visual-gate.mjs`: the command a re-take is launched with
# and the references no opened story named.
#
# No showcase and no browser here: the gate's decisions are functions of their inputs, and the script
# runs nothing when it is imported rather than called.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the showcase gate: the re-take command and the orphaned references"

WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

cat > "$WORK/drive.mjs" <<JS
import { findOrphans, KITS as kits, shellQuote, snapshotCommand } from '$TOOLS/visual-gate.mjs';

const [what, ...args] = process.argv.slice(2);

// A kit without a wrapper of its own: the gate quotes its sample and matches its references.
kits.bare = { ...kits['ui-kit-v2'], quotesSample: true, references: 'kit/.storybook/__snapshots__' };

if (what === 'quote') {
    console.log(shellQuote(args[0]));
} else if (what === 'command') {
    const [kit, retakes, sample] = args;
    console.log(JSON.stringify(snapshotCommand(kits[kit], retakes === 'yes', sample)));
} else if (what === 'references') {
    console.log(kits[args[0]].references ?? 'none');
} else if (what === 'orphans') {
    console.log(JSON.stringify(findOrphans(JSON.parse(args[0]), JSON.parse(args[1]))));
}
JS

drive() {
    node "$WORK/drive.mjs" "$@" 2>&1
}

# The quoted sample has to come back whole through the very shell `test-storybook` hands it to.
through_shell() {
    sh -c "printf '%s' $(drive quote "$1")"
}

report "a regex sample survives the shell whole" "$(through_shell 'button|toggle(s)?')" 'button|toggle(s)?'
report "a quote inside the sample survives the shell whole" "$(through_shell "it's [a-z]*")" "it's [a-z]*"
report "a bare sample is quoted in single quotes" "$(drive quote 'button')" "'button'"

report "a kit without a wrapper gets its pointed re-take sample quoted" \
    "$(drive command bare yes 'button|toggle')" '["pnpm","run","test:visual:v2:update","'"'"'button|toggle'"'"'"]'
report "the kit's pointed re-take leaves the sample to its wrapper" \
    "$(drive command ui-kit-v2 yes 'button|toggle')" '["pnpm","run","test:visual:v2:update","button|toggle"]'
report "a full re-take carries no sample" \
    "$(drive command ui-kit-v2 yes)" '["pnpm","run","test:visual:v2:update-all"]'
report "a flag after --update is not taken for a sample" \
    "$(drive command ui-kit-v2 yes --verbose)" '["pnpm","run","test:visual:v2:update-all"]'
report "a matching run takes the matching script" \
    "$(drive command ui-kit-v2 no)" '["pnpm","run","test:visual:v2"]'

report "a reference no opened story named is an orphan" \
    "$(drive orphans '["a--one.png","b--two.png"]' '["a--one",""]')" '["b--two.png"]'
report "every reference named by an opened story is no orphan" \
    "$(drive orphans '["a--one.png","b--two.png"]' '["b--two","a--one "]')" '[]'
report "what is not a reference is not judged" \
    "$(drive orphans '["__diff_output__","a--one.png"]' '["a--one"]')" '[]'

report "the gate matches the references directory of a kit without a wrapper itself" \
    "$(drive references bare)" 'kit/.storybook/__snapshots__'
report "the kit's orphans are left to its own wrapper" "$(drive references ui-kit-v2)" 'none'

# Importing the gate must launch nothing: otherwise the scenarios above would raise a showcase.
report "importing the gate raises no showcase" \
    "$(node -e "import('$TOOLS/visual-gate.mjs').then(() => console.log('imported'))" 2>&1)" 'imported'

suite_result "visual-gate"
