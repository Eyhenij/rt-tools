#!/usr/bin/env bash
# Which review path a change takes: one-off repositories are made here, a change is laid over a base,
# and the answer of the command is compared. The signs themselves are read by `review-path-signs.mjs`.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the review path of a change"

# A base name or a date of the machine must not leak in, and neither must its git settings.
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null LC_ALL="${LC_ALL:-C.UTF-8}"
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

g() { git -C "$REPO" -c user.name=t -c user.email=t@t -c commit.gpgsign=false "$@" >/dev/null 2>&1; }

# put <path> <text>: a file of the repository; `\n` in the text is a newline.
put() {
    mkdir -p "$REPO/$(dirname "$1")"
    printf '%b\n' "$2" > "$REPO/$1"
}

# lines <count>: that many lines of code.
lines() { seq -f 'const n%g = 1;' 1 "$1"; }

commit() {
    g add -A
    g commit -m "$1"
}

# repo <name>: a repository with a base commit on `base` and the branch RT-7-work checked out from it.
repo() {
    REPO="$WORK/$1"
    mkdir -p "$REPO"
    git init -q -b base "$REPO"
    put tools/own.mjs 'const a = 1;'
    put projects/utils/package.json '{ "name": "u", "version": "1.0.0", "exports": { ".": "./i.js" }, "dependencies": {} }'
    put projects/utils/src/lib/one.ts 'export interface One {\n    a: string;\n    b: string;\n}\nexport function sum(\n    a: number,\n    b: number\n): number {\n    return a + b;\n}\nexport const twice = (n: number): number => n * 2;\nfunction inner(): number {\n    return 1;\n}'
    put projects/utils/src/lib/store.ts 'export class Store {\n    private hidden: number = 1;\n    public count: number = 0;\n    public read(): number {\n        return this.hidden;\n    }\n}'
    put projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.ts "import { Component, input } from '@angular/core';\n@Component({ selector: 'rt-tag', template: '<b></b>' })\nexport class RtTagComponent {\n    public readonly size = input<string>('m');\n    protected grow(): number {\n        return 1;\n    }\n}"
    put libs/message-bus-admin/list/ui/src/lib/list.component.ts "import { Component } from '@angular/core';\n@Component({ selector: 'app-list', template: '<i></i>' })\nexport class ListComponent {\n    protected read(): number {\n        return 1;\n    }\n}"
    commit base
    g checkout -b RT-7-work
}

run() { (cd "$REPO" && node "$TOOLS/review-path.mjs" "$@" 2>&1); }
path_of() { run --base base | head -1 | cut -d' ' -f2; }
reason_of() { run --base base | sed -n 2p | sed 's/^ *//; s/:.*//'; }

# change <name> <path> <text>: the answer for one changed file; `changed` adds the sign it names.
change() {
    repo "$1"
    put "$2" "$3"
    commit work
    path_of
}
changed() {
    change "$@"
    reason_of
}

# --- the size ------------------------------------------------------------------------------------------
report "150 lines of code are light" "$(change l150 tools/new.mjs "$(lines 150)")" лёгкий
report "151 lines of code are full" "$(change l151 tools/new.mjs "$(lines 151)")" полный
report "the reason names the count and the limit" "$(REPO="$WORK/l151"; run --base base | sed -n 2p | sed 's/^ *//')" 'строк кода 151, предел 150'
report "removed lines are counted too" "$(
    repo removed
    put tools/big.mjs "$(lines 151)"
    commit big
    g branch -f base HEAD
    g checkout -b RT-7-next
    rm "$REPO/tools/big.mjs"
    commit work
    path_of
)" полный
for at in tools/tests/a.test.sh docs/a.md libs/x/src/a.spec.ts projects/utils/src/lib/a.stories.ts apps/x-e2e/src/a.ts tools/graphify-out/graph.json pnpm-lock.yaml; do
    report "lines of $at are not counted" "$(change "n$(printf '%s' "$at" | tr -c 'a-z0-9' _)" "$at" "$(lines 200)")" лёгкий
done

# --- the signs -----------------------------------------------------------------------------------------
report "a laid-out file is a guard of the rules" "$(change laid tools/own.mjs '// rt-kit v0.39.1 · checks/own.mjs\nconst a = 2;')" полный
report "its reason names the guards" "$(REPO="$WORK/laid"; reason_of)" 'защиты правил'
for at in .claude/hooks/x.sh .claude/skills/r/SKILL.md .claude/rt-kit/checks.json docs/constitution/x.md projects/agent-kit/assets/rules/x.md tools/flow-x.mjs tools/review-path.mjs tools/check-kit-approval.mjs tools/some-allowlist.json .husky/pre-push; do
    report "$at is a guard of the rules" "$(changed "g$(printf '%s' "$at" | tr -c 'a-z0-9' _)" "$at" 'x' | paste -sd- -)" 'полный-защиты правил'
done
for at in .claude/rt-kit/assignments.md .claude/rt-kit/postmortems/a.md tools/check-ngdoctor.mjs; do
    report "$at is no guard of the rules" "$(change "f$(printf '%s' "$at" | tr -c 'a-z0-9' _)" "$at" 'x')" лёгкий
done
report "a migration is full" "$(changed migration prisma/migrations/1/migration.sql 'x' | paste -sd- -)" 'полный-миграции'
for at in projects/auth-server/src/lib/a.ts deploy/a.yml .github/workflows/ci.yml libs/message-bus-api/access/data-access/src/lib/a.ts apps/message-bus/src/app/a.guard.ts; do
    report "$at is security" "$(change "s$(printf '%s' "$at" | tr -c 'a-z0-9' _)" "$at" 'const a = 1;' >/dev/null; run --base base | grep -c 'безопасность')" 1
done
report "a line with innerHTML is security" "$(changed html libs/x/src/a.ts 'el.innerHTML = v;' | paste -sd- -)" 'полный-безопасность'
report "a test with innerHTML is not" "$(change htmlt libs/x/src/a.spec.ts 'el.innerHTML = v;')" лёгкий
for at in libs/message-bus-admin/list/ui/src/lib/list.scss apps/message-bus-admin/src/index.html projects/ui-kit-v2/src/assets/icons/a.svg; do
    report "$at is a change of look" "$(change "v$(printf '%s' "$at" | tr -c 'a-z0-9' _)" "$at" 'x' >/dev/null; run --base base | grep -c 'смена вида')" 1
done
LIST=libs/message-bus-admin/list/ui/src/lib/list.component.ts
report "an inline template of the admin is a change of look" "$(repo inl; sed -i.bak 's/<i>/<u>/' "$REPO/$LIST"; rm "$REPO/$LIST.bak"; commit work; path_of; reason_of)" $'полный\nсмена вида'
report "code of the admin beside its template is light" "$(repo inl2; sed -i.bak 's/return 1/return 2/' "$REPO/$LIST"; rm "$REPO/$LIST.bak"; commit work; path_of)" лёгкий

# --- the kit -------------------------------------------------------------------------------------------
TAG=projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.ts
kit() {
    repo "$1"
    sed -i.bak "$2" "$REPO/$TAG"
    rm "$REPO/$TAG.bak"
    [ -n "$3" ] && put docs/archive/RT-7-work.md "$3"
    commit work
}
kit k1 's/return 1/return 2/' ''
report "a visible kit file without its record is a change of look" "$(path_of)-$(reason_of)" 'полный-смена вида'
kit k2 's/return 1/return 2/' '- **Без вида:** «одобряю»'
report "with the record «Без вида» it is light" "$(path_of)" лёгкий
kit k3 "s/'m'/'l'/" '- **Без вида:** «одобряю»'
report "a changed input is the public API, record or not" "$(path_of)-$(reason_of)" 'полный-публичный API'
kit k4 "s/rt-tag'/rt-tags'/" '- **Без вида:** «одобряю»'
report "a changed selector is the public API" "$(path_of)-$(reason_of)" 'полный-публичный API'

# --- the public API ------------------------------------------------------------------------------------
api() {
    repo "$1"
    sed -i.bak "$3" "$REPO/$2"
    rm "$REPO/$2.bak"
    commit work
    path_of
}
ONE=projects/utils/src/lib/one.ts
STORE=projects/utils/src/lib/store.ts
report "a removed field of an exported interface is full" "$(api a1 "$ONE" '/b: string/d')" полный
report "a parameter on its own line is full" "$(api a2 "$ONE" 's/b: number/b: string/')" полный
report "a body of an exported function is light" "$(api a3 "$ONE" 's/a + b/b + a/')" лёгкий
report "a body of an exported arrow is light" "$(api a4 "$ONE" 's/n \* 2/n + n/')" лёгкий
report "a function the file keeps is light" "$(api a5 "$ONE" 's/inner()/within()/')" лёгкий
report "a comment is light" "$(api a6 "$ONE" 's/^export interface/\/\/ said\nexport interface/; s/^/ /')" лёгкий
report "a private member is light" "$(api a7 "$STORE" 's/hidden: number = 1/hidden: number = 2/')" лёгкий
report "a public member is full" "$(api a8 "$STORE" 's/count: number/count: string/')" полный
report "a version of a package is light" "$(api a9 projects/utils/package.json 's/1.0.0/1.0.1/')" лёгкий
report "the exports of a package are full" "$(api a10 projects/utils/package.json 's/i.js/j.js/')" полный
report "an entry of a package is full" "$(change a11 projects/utils/src/index.ts 'const a = 1;')" полный
report "a controller of the receiver is full" "$(change a12 libs/message-bus-api/trees/feature/src/lib/a.controller.ts 'const a = 1;')" полный

# --- what cannot be read, and a chain ------------------------------------------------------------------
repo unread
commit work
report "an unknown base is the full path" "$(run --base nowhere | head -1)" 'путь: полный'
report "an unknown argument ends with code 2" "$(run --bese base >/dev/null; echo $?)" 2
repo chain
put tools/first.mjs "$(lines 140)"
commit first
g checkout -b RT-8-next
put tools/second.mjs "$(lines 20)"
commit second
report "a branch of a chain is judged from the previous one" "$(run --base RT-7-work | head -1)-$(run --base base | head -1)" 'путь: лёгкий-путь: полный'

# --- the plan ------------------------------------------------------------------------------------------
plan() { printf '%b\n' "$1" > "$WORK/plan.md"; run --roles "$WORK/plan.md"; }
ROW='| Code (правится) | `tools/own.mjs` |'
repo plans
report "a plan without the header needs both roles" "$(plan "$ROW")" 'product-strategist goal-critic'
report "a light header needs none" "$(plan "**Путь:** лёгкий · 90 строк\n$ROW")" none
report "a light header over the limit needs both" "$(plan "**Путь:** лёгкий · 151 строк\n$ROW")" 'product-strategist goal-critic'
report "a plan with no edited row needs both" "$(plan '**Путь:** лёгкий · 90 строк\n| Code | `tools/own.mjs` |')" 'product-strategist goal-critic'
report "an edited guard needs both" "$(plan '**Путь:** лёгкий · 90 строк\n| Rules (правится) | `.claude/skills/x/` |')" 'product-strategist goal-critic'
report "a row of a whole folder needs both" "$(plan '**Путь:** лёгкий · 90 строк\n| Code (правится) | `tools/` |')" 'product-strategist goal-critic'
KITROW='| Code (правится) | `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.ts` |'
report "a kit file without the statement needs both" "$(plan "**Путь:** лёгкий · 9 строк\n$KITROW")" 'product-strategist goal-critic'
report "a kit file with the statement needs none" "$(plan "**Путь:** лёгкий · 9 строк · API и вид не меняются\n$KITROW")" none
report "a style file needs both, statement or not" "$(plan '**Путь:** лёгкий · 9 строк · API и вид не меняются\n| Code (правится) | `projects/ui-kit-v2/src/a.scss` |')" 'product-strategist goal-critic'
report "a missing plan needs both" "$(run --roles "$WORK/none.md")" 'product-strategist goal-critic'
plan "**Путь:** лёгкий · 90 строк\n$ROW" >/dev/null
report "the light plan prints its path" "$(run --plan "$WORK/plan.md" | head -1)" 'путь: лёгкий'

# --- the check before a push ---------------------------------------------------------------------------
light() {
    repo "$1"
    put docs/tasks/RT-7-work/plan.md "${3:-**Путь:** лёгкий · 90 строк}"
    commit plan
    put tools/new.mjs "$(lines "$2")"
    commit work
}
code_of() { run --check --base base >/dev/null; echo $?; }
light c1 100
report "a light plan with a light diff passes" "$(code_of)" 0
light c2 200
report "a light plan with a full diff is refused" "$(code_of)" 1
report "the refusal names the move" "$(run --check --base base | grep -c 'после второго круга ревью (RT-7)')" 1
rm -r "$REPO/docs/tasks"
commit archive
report "a folder taken apart does not hide the plan" "$(code_of)" 1
put tools/new.mjs "$(lines 199)"
commit 'fix: имя после второго круга ревью (RT-8)'
report "the round of another task lifts nothing" "$(code_of)" 1
put tools/new.mjs "$(lines 198)"
commit 'fix: имя после второго круга ревью (RT-7)'
report "the second round lifts the refusal" "$(code_of)" 0
light c3 200 '**Task:** RT-7'
report "a plan of the full path is not judged" "$(code_of)" 0
repo c4
report "a branch without a plan is not judged" "$(code_of)" 0

# --- the second round ----------------------------------------------------------------------------------
two() { run --round-two --base base "$@" | sed 's/второй круг: //; s/ — .*//; s/ (.*//'; }
light t1 100
report "the light path needs no second round" "$(two)" 'не нужен'
light t2 200
report "a light plan with a full diff needs it at any number" "$(two --serious 0)" 'нужен'
light t3 200 '**Task:** RT-7'
report "without the number it is needed" "$(two)" 'нужен'
report "a word in place of the number is no number" "$(two --serious none)" 'нужен'
report "a serious finding needs it" "$(two --serious 1)" 'нужен'
report "without findings and risk it is not needed" "$(two --serious 0)" 'не нужен'
for at in tools/check-x.mjs .claude/hooks/x.sh projects/utils/src/lib/one.ts projects/ui-kit-v2/src/lib/a.logic.ts deploy/a.yml eslint/x.mjs .husky/x; do
    light "r$(printf '%s' "$at" | tr -c 'a-z0-9' _)" 5 '**Task:** RT-7'
    put "$at" 'const z = 1;'
    commit risk
    report "$at needs the second round" "$(two --serious 0)" 'нужен'
done
report "with no fixes since the first round there is nothing to read" "$(two --serious 0 --since HEAD)" 'не нужен'
report "a serious finding is read even without fixes" "$(two --serious 2 --since HEAD)" 'нужен'
put tools/fix.mjs 'const f = 1;'
commit fix
report "fixes since the first round are read" "$(two --serious 0 --since HEAD~1)" 'нужен'
report "a test of the kit needs none" "$(light tt 5 '**Task:** RT-7'; put projects/ui-kit-v2/src/lib/a.spec.ts 'x'; commit t; two --serious 0)" 'не нужен'

suite_result review-path
