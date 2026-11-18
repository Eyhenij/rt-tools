#!/usr/bin/env bash
# The scenarios of the kit approval check: which kit files need approvals, how the record is read,
# what the window of the owner shows. Neither git nor the real sessions are asked: the check reads
# no record of a conversation, and the guard asks the owner by a window instead.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the kit approval check"

CHECK="$TOOLS/check-kit-approval.mjs"
GUARD="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/.claude/hooks/kit-approval-guard.sh"

run() {
    node --input-type=module -e "
import * as m from '$CHECK';
$1" 2>&1
}

report "a component template needs approvals" \
    "$(run "console.log(m.isVisibleKitFile('projects/ui-kit-v2/src/lib/components/x/x.component.html'))")" true
report "a kit style needs approvals" \
    "$(run "console.log(m.isVisibleKitFile('projects/ui-kit-v2/src/lib/components/x/x.scss'))")" true
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
report "the key registry goes without them" \
    "$(run "console.log(m.isVisibleKitFile('projects/ui-kit-v2/src/lib/platform/storage-keys.enum.ts'))")" false
report "a storage service goes without them" \
    "$(run "console.log(m.isVisibleKitFile('projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.ts'))")" false
report "a service outside the storage list still needs them" \
    "$(run "console.log(m.isVisibleKitFile('projects/ui-kit-v2/src/lib/platform/theme.service.ts'))")" true
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

report "a record with both quotes passes the check" \
    "$(run "console.log(m.faultsOf('b', { path: 'r', text: \`$RECORD\` }).length)")" 0
report "the check reads no record of a conversation" \
    "$(run "console.log(typeof m.ownerSaid)")" undefined
WINDOW_JS='console.log(m.quotesLine({ path: "r", text: process.env.RECORD }))'
export RECORD
report "the window line carries both quotes and the link" \
    "$(run "$WINDOW_JS")" \
    'Макет: «Да, макет одобряю» — https://www.figma.com/design/abc/Kit?node-id=1-2 · Витрина: «витрину одобряю» (r)'
report "a mockup line without a Figma link is refused" \
    "$(run "console.log(m.faultsOf('b', { path: 'r', text: '- **Макет:** «да»\n- **Совпадение:** 3 из 3 чисел\n- **Витрина:** «да»' }).length)")" 1
report "a match below 100% is refused" \
    "$(run "console.log(m.faultsOf('b', { path: 'r', text: \`$RECORD\`.replace('12 из 12', '11 из 12') }).length)")" 1
report "a record without the match line is refused" \
    "$(run "console.log(m.faultsOf('b', { path: 'r', text: \`$RECORD\`.replace(/^- \*\*Совпадение.*$/m, '') }).length)")" 1

# The guard on `gh pr create`: a check that passes with quotes opens the window, a check that passes
# with nothing to confirm lets the call through, a failing check refuses. The check is a double that
# answers by the variables of the case.
GUARD_TREE="$(mktemp -d)"
mkdir -p "$GUARD_TREE/tools"
cat >"$GUARD_TREE/tools/check-kit-approval.mjs" <<'STUB'
if (process.argv.includes('--quotes')) {
    if (process.env.STUB_QUOTES) console.log(process.env.STUB_QUOTES);
    process.exit(0);
}
if (process.env.STUB_FAIL) {
    console.error('no approval record');
    process.exit(1);
}
process.exit(0);
STUB
guard_decision() {
    local out
    out="$(printf '{"tool_name":"Bash","tool_input":{"command":"gh pr create --title x"}}' \
        | CLAUDE_PROJECT_DIR="$GUARD_TREE" bash "$GUARD" 2>/dev/null)"
    if [ -z "$out" ]; then echo PASS; else printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision'; fi
}
report "a record in place opens the owner's window" "$(STUB_QUOTES='Макет: «да» · Витрина: «да»' guard_decision)" ask
report "no visible kit edit lets the PR through" "$(guard_decision)" PASS
report "a missing record is refused" "$(STUB_FAIL=1 guard_decision)" deny
rm -rf "$GUARD_TREE"

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

# A branch without its own record — an epic branch: a merged task answers for its files, main
# brought in answers for nothing, a commit made in the branch itself still needs the branch record.
KIT='projects/ui-kit-v2/src/lib/components/x/x.component.html'
OTHER='projects/ui-kit-v2/src/lib/components/y/y.component.html'
report "an epic branch whose kit edit came by a task merge is judged by that task" \
    "$(run "const r = m.answerersOf([
  { sha: 'a', subject: \"Merge remote-tracking branch 'origin/main' into RT-1-epic\", merge: true, files: ['$OTHER'] },
  { sha: 'b', subject: '[RT-2] Блоки ответа (#9)', merge: true, files: ['$KIT'] },
], ['$KIT']); console.log(r.own.length + '|' + r.tasks.map((t) => t.task).join(','))")" '0|RT-2'
report "a kit edit made in the epic branch itself is left to the branch" \
    "$(run "const r = m.answerersOf([
  { sha: 'c', subject: 'fix: правка прямо в эпике', merge: false, files: ['$KIT'] },
  { sha: 'b', subject: '[RT-2] Блоки ответа (#9)', merge: true, files: ['$KIT'] },
], ['$KIT']); console.log(r.own.join(',') + '|' + r.tasks.length)")" "$KIT|0"
report "main brought into the branch answers for nothing" \
    "$(run "const r = m.answerersOf([
  { sha: 'a', subject: \"Merge remote-tracking branch 'origin/main' into RT-1-epic\", merge: true, files: ['$KIT'] },
], ['$KIT']); console.log(r.own.length + '|' + r.tasks.length)")" '0|0'
report "a merge that names no task leaves its files to the branch" \
    "$(run "const r = m.answerersOf([
  { sha: 'd', subject: \"Merge branch 'RT-2-blocks' into RT-1-epic\", merge: true, files: ['$KIT'] },
], ['$KIT']); console.log(r.own.join(',') + '|' + r.tasks.length)")" "$KIT|0"

suite_result
