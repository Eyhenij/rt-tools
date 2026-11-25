#!/usr/bin/env bash
# The showcase gate `tools/visual-gate.mjs`: the command a re-take is launched with, the references no
# opened story named, and the run of the stories a branch touched.
#
# No showcase and no browser here. The decisions are functions of their inputs, and the script runs
# nothing when it is imported rather than called; the run of the touched stories is called whole in a
# one-off kit, with a build and a shooting that only write down that they were called.
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

# A sample without a re-take: the match of the named files, by the same road as the whole match.
sample() { node -e "import('$TOOLS/visual-gate.mjs').then((gate) => console.log(gate.sampleOf(JSON.parse(process.argv[1]))))" "$1"; }
report "a pointed match takes the matching script with the sample" \
    "$(drive command ui-kit-v2 no 'button|toggle')" '["pnpm","run","test:visual:v2","button|toggle"]'
report "a pointed match of a kit without a wrapper gets its sample quoted" \
    "$(drive command bare no 'button')" '["pnpm","run","test:visual:v2","'"'"'button'"'"'"]'
report "the sample of a pointed match stands after the kit" "$(sample '["ui-kit-v2","button"]')" "button"
report "the sample of a re-take stands after --update" "$(sample '["ui-kit-v2","--update","button"]')" "button"
report "a sample before --update is not dropped" "$(sample '["ui-kit-v2","badge","--update"]')" "badge"
report "a whole match has no sample" "$(sample '["ui-kit-v2"]')" "undefined"
report "a whole re-take has no sample" "$(sample '["ui-kit-v2","--update"]')" "undefined"
report "a flag is no sample of a match" "$(sample '["ui-kit-v2","--verbose"]')" "undefined"

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

# Covers SC-UKV-1802, SC-UKV-1803 and SC-UKV-1804 of the spec `docs/specs/ui-kit-v2/snapshots`.
# The run of the touched stories, called whole with the script of the kit's run inside: the build, the
# browser of the image, the story runner and the probes are stand-ins.
RUN="$WORK/kit"
KIT=projects/ui-kit-v2
SHOTS=$KIT/.storybook/__snapshots__
REAL_NODE="$(command -v node)"
mkdir -p "$WORK/bin" "$RUN/$KIT/src" "$RUN/$SHOTS" "$RUN/dist/storybook/@rt-tools/ui-kit-v2"

cat > "$WORK/bin/pnpm" <<SH
#!/bin/sh
echo "pnpm \$*" >> "$WORK/calls"
case "\$1 \$2" in
    "run test:visual:v2") shift 2; exec "$REAL_NODE" "$TOOLS/visual-snapshots-v2.mjs" "\$@" ;;
    "exec test-storybook")
        for last; do :; done
        printf '%s' "\$last" > "$WORK/sample"
        cat "$WORK/taken" >> "\$RT_SNAPSHOT_REGISTRY"
        exit "\$(cat "$WORK/shot-code")" ;;
esac
SH
cat > "$WORK/bin/node" <<SH
#!/bin/sh
case "\$1" in
    tools/serve-static.mjs) shift; exec "$REAL_NODE" "$TOOLS/serve-static.mjs" "\$@" ;;
    tools/shot-browser.mjs)
        echo "shot \$*" >> "$WORK/calls"
        shift; exec "\$@" ;;
    *) exec "$REAL_NODE" "\$@" ;;
esac
SH
chmod +x "$WORK/bin/pnpm" "$WORK/bin/node"

for name in one two; do
    printf "import './%s.scss';\nexport default { title: 'Atoms/%s' };\n" "$name" "$name" > "$RUN/$KIT/src/$name.stories.ts"
    printf '.x { color: red; }\n' > "$RUN/$KIT/src/$name.scss"
done
printf 'export default {};\n' > "$RUN/$KIT/.storybook/preview.ts"
touch "$RUN/$SHOTS/atoms-one--base.png" "$RUN/$SHOTS/atoms-one--base--w480.png" "$RUN/$SHOTS/atoms-two--base.png"
cat > "$RUN/dist/storybook/@rt-tools/ui-kit-v2/index.json" <<JSON
{ "entries": {
  "atoms-one--base": { "id": "atoms-one--base", "type": "story", "importPath": "./$KIT/src/one.stories.ts" },
  "atoms-one--docs": { "id": "atoms-one--docs", "type": "docs", "importPath": "./$KIT/src/one.stories.ts" },
  "atoms-two--base": { "id": "atoms-two--base", "type": "story", "importPath": "./$KIT/src/two.stories.ts" },
  "atoms-two--plain": { "id": "atoms-two--plain", "type": "story", "importPath": "./$KIT/src/two.stories.ts" }
} }
JSON
printf 'dist\n' > "$RUN/.gitignore"
(cd "$RUN" && git init -q -b main . && git add -A && git -c user.name=t -c user.email=t@t -c commit.gpgsign=false commit -q -m base)

# `gate <edited file or -> <what the shooting wrote down> <its code> <arguments>`: the output lies in
# `$WORK/out`, the exit code in CODE, the calls of the stand-ins in `$WORK/calls`.
gate() {
    local edited="$1"
    printf '%b' "$2" > "$WORK/taken"
    printf '%s' "$3" > "$WORK/shot-code"
    shift 3
    : > "$WORK/calls"
    : > "$WORK/sample"
    [ "$edited" = - ] || printf '/* edit */\n' >> "$RUN/$edited"
    (cd "$RUN" && PATH="$WORK/bin:$PATH" RT_INDEX_REREAD_MS=1 "$REAL_NODE" "$TOOLS/visual-gate.mjs" "$@" > "$WORK/out" 2>&1)
    CODE=$?
    (cd "$RUN" && git reset -q --hard && git clean -qfd)
}

calls() { grep -c "$1" "$WORK/calls"; }
said() { if grep -qF "$1" "$WORK/out"; then printf 'yes'; else printf 'no'; fi; }

gate - '' 0 ui-kit-v2 --affected main
report "the affected run that touched nothing builds no showcase" "$CODE:$(calls .):$(said 'снять: нечего')" '0:0:yes'
gate $KIT/src/one.scss 'atoms-one--base\natoms-one--base--w480\n' 0 ui-kit-v2 --affected main
report "the affected run opens the named files alone" "$CODE:$(cat "$WORK/sample")" "0:'/$KIT/src/one\\.stories\\.ts\$'"
report "the affected run ends with what it shot" "$(tail -1 "$WORK/out")" 'снято 1 файлов историй из 2, кадров 2'
report "the affected run builds the showcase and calls the probes" "$(calls 'nx run'):$(calls 'check:icons'):$(calls 'check:window')" '1:1:1'
gate $KIT/src/one.scss 'atoms-one--base\n' 0 ui-kit-v2 --affected main
report "the affected run refuses a reference of a width nobody took" "$CODE:$(said 'atoms-one--base--w480.png — no story takes')" '1:yes'
gate $KIT/src/one.scss 'atoms-one--base\n' 1 ui-kit-v2 --affected main
report "the affected run that fell does not call a lost frame an orphan" "$CODE:$(said 'w480.png — the frame was not taken'):$(said 'no story takes')" '1:yes:no'
gate $KIT/src/two.scss 'atoms-two--base\nskip atoms-two--plain\n' 0 ui-kit-v2 --affected main
report "the affected run takes an exception for a reached story" "$CODE:$(tail -1 "$WORK/out")" '0:снято 1 файлов историй из 2, кадров 1'
gate $KIT/src/two.scss 'atoms-two--base\n' 0 ui-kit-v2 --affected main
report "the affected run refuses a story without a reference the runner lost" "$CODE:$(said 'atoms-two--plain — the story was not reached')" '1:yes'
gate $KIT/src/one.scss '' 0 ui-kit-v2 --affected main
report "the affected run refuses a file that fell out, at a green shooting" \
    "$CODE:$(said 'one.stories.ts — not one story'):$(tail -1 "$WORK/out")" '1:yes:снято 0 файлов историй из 2, кадров 0'
gate $KIT/src/one.scss 'atoms-one--base\natoms-one--base--w480\n' 1 ui-kit-v2 --affected main
report "the affected run is red with the shooting" "$CODE" '1'
printf "export default { title: 'Atoms/New' };\n" > "$RUN/$KIT/src/new.stories.ts"
gate - '' 0 ui-kit-v2 --affected main
report "the affected run refuses a file the showcase does not hold" "$CODE:$(said 'new.stories.ts — the showcase holds no story')" '1:yes'
touch "$RUN/$SHOTS/atoms-two--gone.png"
gate - 'atoms-two--base\nskip atoms-two--plain\n' 0 ui-kit-v2 --affected main
report "the affected run refuses a reference without a story" \
    "$CODE:$(said 'atoms-two--gone — the reference'):$(said 'lacks 1 stories'):$(cat "$WORK/sample")" '1:yes:yes:'
WHOLE='atoms-one--base\natoms-one--base--w480\natoms-two--base\nskip atoms-two--plain\n'
gate $KIT/.storybook/preview.ts "$WHOLE" 0 ui-kit-v2 --affected main
report "the affected run of a shared edit is the whole set" "$CODE:$(said 'снять: всё'):$(calls 'shot .*pnpm run test:visual:v2$')" '0:yes:1'
gate $KIT/.storybook/preview.ts 'atoms-one--base\natoms-one--base--w480\nskip atoms-two--base\n' 0 ui-kit-v2 --affected main
report "the whole set takes no exception for a frame" "$CODE:$(said 'atoms-two--base.png')" '1:yes'
gate $KIT/src/one.scss "$WHOLE" 0 ui-kit-v2 --affected
report "the affected run without a base is the whole set" "$CODE:$(calls 'shot .*pnpm run test:visual:v2$')" '0:1'
gate - "$WHOLE" 0 ui-kit-v2 --affected no-such-ref
report "the affected run of a base that does not read is the whole set" "$CODE:$(calls 'shot .*pnpm run test:visual:v2$')" '0:1'
gate - '' 0 ui-kit-v2 --afected main
report "the affected run misspelled is refused before the build" "$CODE:$(calls .)" '1:0'
gate - '' 0 ui-kit-v2 --affected main --update
report "the affected run takes no re-take" "$CODE:$(calls .)" '1:0'
gate - '' 0 ui-kit-v2 badge --affected main
report "the affected run takes no sample" "$CODE:$(calls .)" '1:0'
gate - '' 0 ui-kit-v2 --affected main badge
report "the affected run takes no sample after the base" "$CODE:$(calls .)" '1:0'

# The list of the run of the kit, refused before the showcase is asked.
snapshots() { (cd "$RUN" && PATH="$WORK/bin:$PATH" STORYBOOK_URL=http://127.0.0.1:1 "$REAL_NODE" "$TOOLS/visual-snapshots-v2.mjs" "$@" 2>&1 | tr -d '\n'); }
printf 'one\n' > "$WORK/one.txt"
: > "$WORK/none.txt"
refused() { case "$(snapshots "$@")" in *"$WANT"*) printf 'yes' ;; *) printf 'no' ;; esac; }
WANT='A list is matched alone'
report "an empty list is refused: its sample would open every file" "$(refused --files "$WORK/none.txt")" 'yes'
report "a list with a whole re-take is refused" "$(refused --update-all --files "$WORK/one.txt")" 'yes'
report "a list with a pointed re-take is refused" "$(refused --update one --files "$WORK/one.txt")" 'yes'
WANT='The list of story files is not named'
report "a list that does not lie there is refused" "$(refused --files "$WORK/absent.txt")" 'yes'

suite_result "visual-gate"
