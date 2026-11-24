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

# Every one-off tree lies in one directory of the run, removed at its end: left in the shared
# temporary directory, a thousand of them slowed down the scenarios of the guards.
# The path reaches the code through the environment, not the code text: a quote in it would break it.
RELEASE_TMP="$(mktemp -d "${TMPDIR:-/tmp}/rt-release-XXXXXX")"
export RELEASE_TMP
trap 'rm -rf "$RELEASE_TMP"' EXIT

# A one-off tree of one package: the wiring is whole until the script of the test breaks a part of it.
tree() {
    run "
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const dir = mkdtempSync(join(process.env.RELEASE_TMP, 'tree-'));
mkdirSync(join(dir, 'projects/pkg'), { recursive: true });
mkdirSync(join(dir, '.github/workflows'), { recursive: true });
const verify = $1 ? { verify: { dependsOn: ['build'], options: { command: 'node tools/verify-package.cjs pkg' } } } : {};
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

WHOLE="'name: x\n          uses: EndBug/add-and-commit@v11\n          message: \"chore(rt:utils): версия поднята\"\n          run: pnpm run build:pkg'"
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

DIR="$(tree true "'nx build @x/pkg && nx verify @x/pkg-server'" "$WHOLE")"
report "verify of a neighbour package does not stand for this one" \
    "$(run "console.log(m.packageFaults('pkg', '$DIR').length)")" 1

DIR="$(tree true "'nx verify @x/pkg && nx build @x/pkg'" "$WHOLE")"
report "verify before the build is refused" \
    "$(run "console.log(m.packageFaults('pkg', '$DIR').length)")" 1

DIR="$(tree true "'nx build @x/pkg && nx verify @x/pkg'" "'name: x\n          uses: EndBug/add-and-commit@v11\n          run: pnpm run build:pkg'")"
report "a workflow that commits and names no header is refused" \
    "$(run "console.log(m.packageFaults('pkg', '$DIR').length)")" 1

DIR="$(tree true "'nx build @x/pkg || nx verify @x/pkg'" "$WHOLE")"
report "verify behind an or-chain is refused" \
    "$(run "console.log(m.packageFaults('pkg', '$DIR').length)")" 1

DIR="$(tree true "'nx build @x/pkg-server && nx verify @x/pkg'" "$WHOLE")"
report "a build of a neighbour with the same prefix does not stand for this one" \
    "$(run "console.log(m.packageFaults('pkg', '$DIR').length)")" 1

DIR="$(tree true "'nx build @x/pkg --verbose && nx verify @x/pkg --output-style=static'" "$WHOLE")"
report "flags after the steps are accepted" \
    "$(run "console.log(m.packageFaults('pkg', '$DIR').length)")" 0

DIR="$(tree true "'nx build @x/pkg && nx verify @x/pkg'" "'name: Update version\n          uses: EndBug/add-and-commit@v11\n          message: \"chore(rt:utils): версия\"\n          run: pnpm run build:pkg'")"
report "a build after the step that moves the version is refused" \
    "$(run "console.log(m.packageFaults('pkg', '$DIR').length)")" 1

DIR="$(tree true "'nx build @x/pkg && nx verify @x/pkg'" "'run: pnpm run build:pkg\n          name: Update version\n          uses: EndBug/add-and-commit@v11\n          message: \"chore(rt:utils): версия\"'")"
report "a build before the step that moves the version passes" \
    "$(run "console.log(m.packageFaults('pkg', '$DIR').length)")" 0

report "a package with a framework is passed when named leniently" \
    "$(cd "$TOOLS/.." && node tools/check-package-release.mjs --package core --lenient >/dev/null 2>&1; echo $?)" 0

report "a package named by hand that is not judged is refused" \
    "$(cd "$TOOLS/.." && node tools/check-package-release.mjs --package no-such-package >/dev/null 2>&1; echo $?)" 1

GUARD="$TOOLS/../.claude/hooks/package-release-guard.sh"
guard() {
    printf '{"tool_name":"Bash","tool_input":{"command":"%s"},"cwd":"%s"}' "$1" "$TOOLS/.." | CLAUDE_PROJECT_DIR="$TOOLS/.." bash "$GUARD" | wc -c | tr -d ' '
}

report "the guard lets through a start of a whole package and of a package with a framework" \
    "$(guard 'gh workflow run publish-ai-chat-protocol.yml && gh workflow run publish-core.yml')" 0
report "the guard is silent on a command that starts nothing" \
    "$(guard 'git status')" 0

run "import { rmSync } from 'node:fs'; const dir = process.env.RELEASE_TMP; rmSync(dir, { recursive: true, force: true });"

suite_result
