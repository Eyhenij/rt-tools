#!/usr/bin/env bash
# The scenarios of the kit approval check: which kit files need approvals, how the record is read
# and that a quote the owner never wrote is refused. Transcripts are fixtures in a temporary
# directory; neither git nor the real sessions are asked.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the kit approval check"

CHECK="$TOOLS/check-kit-approval.mjs"
SESSIONS="$(mktemp -d)"
trap 'rm -rf "$SESSIONS"' EXIT

# One owner message, one assistant message quoting the same words, one tool result with them and
# one answer from the question window.
cat >"$SESSIONS/a.jsonl" <<'EOF'
{"type":"user","message":{"role":"user","content":"Да, макет  одобряю"}}
{"type":"assistant","message":{"role":"assistant","content":[{"type":"text","text":"витрину одобряю"}]}}
{"type":"user","message":{"role":"user","content":[{"type":"tool_result","content":"витрину одобряю"}]}}
{"type":"user","message":{"role":"user","content":[{"type":"tool_result","content":"answered"}]},"toolUseResult":{"questions":[],"answers":{"Витрина годится?":"Да, одобряю витрину (Рекомендую)"}}}
EOF

run() {
    node --input-type=module -e "
import * as m from '$CHECK';
$1" 2>&1
}

report "a component template needs approvals" \
    "$(run "console.log(m.isVisibleKitFile('projects/ui-kit-v2/src/lib/components/x/x.component.html'))")" true
report "a style of the first kit needs approvals" \
    "$(run "console.log(m.isVisibleKitFile('projects/ui-kit/src/lib/ui-kit/x/x.scss'))")" true
report "a spec goes without them" \
    "$(run "console.log(m.isVisibleKitFile('projects/ui-kit-v2/src/lib/components/x/x.spec.ts'))")" false
report "a snapshot reference goes without them" \
    "$(run "console.log(m.isVisibleKitFile('projects/ui-kit-v2/src/__snapshots__/a.png'))")" false
report "a showcase page goes without them" \
    "$(run "console.log(m.isVisibleKitFile('projects/ui-kit-v2/src/lib/components/x/Overview.mdx'))")" false
report "pure logic goes without them" \
    "$(run "console.log(m.isVisibleKitFile('projects/ui-kit-v2/src/lib/components/x/x.logic.ts'))")" false
report "the core of the tables goes without them" \
    "$(run "console.log(m.isVisibleKitFile('projects/ui-kit-v2/src/lib/components/table-core/rt-table-sort.core.ts'))")" false
report "a barrel goes without them" \
    "$(run "console.log(m.isVisibleKitFile('projects/ui-kit-v2/src/lib/components/table-core/index.ts'))")" false
report "a component class still needs them" \
    "$(run "console.log(m.isVisibleKitFile('projects/ui-kit-v2/src/lib/components/x/x.component.ts'))")" true
report "a file outside the kits goes without them" \
    "$(run "console.log(m.isVisibleKitFile('apps/message-bus-admin/src/app/a.html'))")" false

RECORD='- **Макет:** «Да, макет одобряю» — https://www.figma.com/design/abc/Kit?node-id=1-2
- **Совпадение:** 12 из 12 чисел
- **Витрина:** «витрину одобряю»'

report "the record gives both quotes and the link" \
    "$(run "const r = m.parseApprovals(\`$RECORD\`); console.log([r.mockup, r.figma, r.showcase].join('|'))")" \
    'Да, макет одобряю|https://www.figma.com/design/abc/Kit?node-id=1-2|витрину одобряю'

# The owner's words are found with their spacing squashed; the same words said by the executor or
# carried by a tool result are not the owner's.
report "the owner's quote is found" \
    "$(run "console.log(m.ownerSaid('Да, макет одобряю', '$SESSIONS'))")" true
report "an answer chosen in the question window is the owner's" \
    "$(run "console.log(m.ownerSaid('Да, одобряю витрину', '$SESSIONS'))")" true
report "the executor's own words are not the owner's" \
    "$(run "console.log(m.ownerSaid('витрину одобряю', '$SESSIONS'))")" false

report "a record with both quotes said by the owner passes" \
    "$(run "console.log(m.faultsOf('b', { path: 'r', text: \`$RECORD\` }, (q) => q !== '').length)")" 0
report "a showcase quote the owner never wrote is refused" \
    "$(run "console.log(m.faultsOf('b', { path: 'r', text: \`$RECORD\` }, (q) => q.startsWith('Да')).length)")" 1
report "a mockup line without a Figma link is refused" \
    "$(run "console.log(m.faultsOf('b', { path: 'r', text: '- **Макет:** «да»\n- **Совпадение:** 3 из 3 чисел\n- **Витрина:** «да»' }, () => true).length)")" 1
report "a match below 100% is refused" \
    "$(run "console.log(m.faultsOf('b', { path: 'r', text: \`$RECORD\`.replace('12 из 12', '11 из 12') }, () => true).length)")" 1
report "a record without the match line is refused" \
    "$(run "console.log(m.faultsOf('b', { path: 'r', text: \`$RECORD\`.replace(/^- \*\*Совпадение.*$/m, '') }, () => true).length)")" 1

MATCH="$TOOLS/kit-match.mjs"
match() {
    local body="$1"
    shift
    node --input-type=module -e "
import * as k from '$MATCH';
$body" "$@" 2>&1
}

report "a hex colour and its rgb spelling are one value" \
    "$(match "console.log(k.normalize('#1A73E8') === k.normalize('rgb(26, 115, 232)'))")" true
report "a length with and without px is one value" \
    "$(match "console.log(k.normalize('16px') === k.normalize(16))")" true
report "every key of the mockup equal — 100%" \
    "$(match "const r = k.compareNumbers(JSON.parse(process.argv[1]), JSON.parse(process.argv[2])); console.log(r.matched + '/' + r.total)" \
        '{"a.gap":"8px","a.color":"#000000"}' '{"a.gap":"8px","a.color":"rgb(0, 0, 0)"}')" 2/2
report "a key the showcase did not measure is a miss" \
    "$(match "const r = k.compareNumbers(JSON.parse(process.argv[1]), JSON.parse(process.argv[2])); console.log(r.matched + '/' + r.total)" \
        '{"a.gap":"8px","b.gap":"4px"}' '{"a.gap":"8px"}')" 1/2
report "a frame laid over itself diverges by nothing" \
    "$(match "const p = new k.PNG(JSON.parse(process.argv[1])); p.data.fill(200); const f = k.PNG.sync.write(p); console.log(k.overlay(f, f).diverged)" \
        '{"width":4,"height":4}')" 0
report "frames of different sizes are refused" \
    "$(match "const a = k.PNG.sync.write(new k.PNG(JSON.parse(process.argv[1]))); const b = k.PNG.sync.write(new k.PNG(JSON.parse(process.argv[2]))); console.log(Boolean(k.overlay(a, b).error))" \
        '{"width":4,"height":4}' '{"width":5,"height":4}')" true
report "no record at all is refused" \
    "$(run "console.log(m.faultsOf('b', null).length)")" 1

suite_result
