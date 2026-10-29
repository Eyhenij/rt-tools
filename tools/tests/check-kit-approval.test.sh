#!/usr/bin/env bash
# The scenarios of the kit approval check: which kit files need approvals, how the record is read
# and that a quote the owner never wrote is refused. Transcripts are fixtures in a temporary
# directory; neither git nor the real sessions are asked.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the kit approval check"

CHECK="$TOOLS/check-kit-approval.mjs"
SESSIONS="$(mktemp -d)"
trap 'rm -rf "$SESSIONS"' EXIT

# One owner message, one assistant message quoting the same words, one tool result with them.
cat >"$SESSIONS/a.jsonl" <<'EOF'
{"type":"user","message":{"role":"user","content":"Да, макет  одобряю"}}
{"type":"assistant","message":{"role":"assistant","content":[{"type":"text","text":"витрину одобряю"}]}}
{"type":"user","message":{"role":"user","content":[{"type":"tool_result","content":"витрину одобряю"}]}}
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
report "a file outside the kits goes without them" \
    "$(run "console.log(m.isVisibleKitFile('apps/message-bus-admin/src/app/a.html'))")" false

RECORD='- **Макет:** «Да, макет одобряю» — https://www.figma.com/design/abc/Kit?node-id=1-2
- **Витрина:** «витрину одобряю»'

report "the record gives both quotes and the link" \
    "$(run "const r = m.parseApprovals(\`$RECORD\`); console.log([r.mockup, r.figma, r.showcase].join('|'))")" \
    'Да, макет одобряю|https://www.figma.com/design/abc/Kit?node-id=1-2|витрину одобряю'

# The owner's words are found with their spacing squashed; the same words said by the executor or
# carried by a tool result are not the owner's.
report "the owner's quote is found" \
    "$(run "console.log(m.ownerSaid('Да, макет одобряю', '$SESSIONS'))")" true
report "the executor's own words are not the owner's" \
    "$(run "console.log(m.ownerSaid('витрину одобряю', '$SESSIONS'))")" false

report "a record with both quotes said by the owner passes" \
    "$(run "console.log(m.faultsOf('b', { path: 'r', text: \`$RECORD\` }, (q) => q !== '').length)")" 0
report "a showcase quote the owner never wrote is refused" \
    "$(run "console.log(m.faultsOf('b', { path: 'r', text: \`$RECORD\` }, (q) => q.startsWith('Да')).length)")" 1
report "a mockup line without a Figma link is refused" \
    "$(run "console.log(m.faultsOf('b', { path: 'r', text: '- **Макет:** «да»\n- **Витрина:** «да»' }, () => true).length)")" 1
report "no record at all is refused" \
    "$(run "console.log(m.faultsOf('b', null).length)")" 1

suite_result
