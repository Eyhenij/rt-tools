#!/usr/bin/env bash
# The scenarios of the package release check: which commit headers of a publication workflow the
# commit check refuses, and which faults the wiring of a package shows. The trees are one-off ones
# in a temporary directory; neither git nor a build is asked.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the package release check"

CHECK="$TOOLS/check-package-release.mjs"
RULES="{ 'type-enum': [2, 'always', ['fix', 'chore']], 'scope-enum': [2, 'always', ['rt:utils', 'rt:ai-chat-protocol']] }"

run() {
    node --input-type=module -e "
import * as m from '$CHECK';
$1" 2>&1
}

# A one-off tree of one package: the wiring is whole until the script of the test breaks a part of it.
tree() {
    run "
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const dir = mkdtempSync(join(tmpdir(), 'rt-release-'));
mkdirSync(join(dir, 'projects/pkg'), { recursive: true });
mkdirSync(join(dir, '.github/workflows'), { recursive: true });
const verify = $1 ? { verify: { options: { command: 'node tools/verify-package.cjs pkg' } } } : {};
writeFileSync(join(dir, 'projects/pkg/project.json'), JSON.stringify({ targets: { 'build:esm': {}, 'build:cjs': {}, ...verify } }));
writeFileSync(join(dir, 'projects/pkg/package.json'), JSON.stringify({ name: '@x/pkg' }));
writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts: { 'build:pkg': $2 } }));
writeFileSync(join(dir, 'commitlint.config.cjs'), 'module.exports = ' + JSON.stringify({ rules: $RULES }) + ';');
writeFileSync(join(dir, '.github/workflows/publish-pkg.yml'), $3);
console.log(dir);"
}

report "a header of a listed type, area and Russian subject passes" \
    "$(run "console.log(m.workflowHeaderFaults('chore(rt:utils): версия поднята до 1.0.0', $RULES).length)")" 0
report "an area off the list is refused" \
    "$(run "console.log(m.workflowHeaderFaults('chore(rt:other): версия поднята', $RULES).length)")" 1
report "an English subject is refused" \
    "$(run "console.log(m.workflowHeaderFaults('chore(rt:utils): bump the version', $RULES).length)")" 1
report "a type off the list is refused" \
    "$(run "console.log(m.workflowHeaderFaults('feat(rt:utils): версия поднята', $RULES).length)")" 1
report "a workflow expression stands for a version" \
    "$(run "console.log(m.workflowHeaders(\"          message: 'chore(rt:utils): версия \${{ inputs.version }}'\").join('|'))")" "chore(rt:utils): версия 0.0.0"

WHOLE="'name: x\n          message: \"chore(rt:utils): версия поднята\"\n          run: pnpm run build:pkg'"
DIR="$(tree true "'nx build @x/pkg && nx verify @x/pkg'" "$WHOLE")"
report "a whole wiring has no faults" \
    "$(run "console.log(m.packageFaults('pkg', '$DIR').length)")" 0

DIR="$(tree false "'nx build @x/pkg && nx verify @x/pkg'" "$WHOLE")"
report "a package without the verify target is refused" \
    "$(run "console.log(m.packageFaults('pkg', '$DIR').length)")" 1

DIR="$(tree true "'nx build @x/pkg'" "$WHOLE")"
report "a root build that never runs verify is refused" \
    "$(run "console.log(m.packageFaults('pkg', '$DIR').length)")" 1

DIR="$(tree true "'nx build @x/pkg && nx verify @x/pkg'" "'name: x\n          run: pnpm exec nx build @x/pkg'")"
report "a workflow that builds past the root command is refused" \
    "$(run "console.log(m.packageFaults('pkg', '$DIR').length)")" 1

suite_result
