#!/usr/bin/env bash
# Сценарии движка task flow после того, как база со старой копией папки задачи пришла в ветку:
# слияние, перемотка на базу и удаление старой копии в самой базе. Репозитории настоящие: двойник
# истории не держит слияний. Подключается из `task-flow-script.test.sh`; отдельно — с `TF_ALONE=1`.
if [ -z "${TESTS:-}" ]; then
    . "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
    TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    TF_DIR="$(mktemp -d)"
    TF_ALONE=1
fi

TM_G=(git -c user.name=t -c user.email=t@example.test -c commit.gpgsign=false)
TM_B=RT-12-flow
TM_E=RT-10-epic
TM_F="docs/tasks/$TM_B"

# Ветка задачи от ветки эпика: разбор, план, два шага, разбор папки. Ветка эпика берёт старую копию
# папки слиянием коммита плана. $2: merge — ветка задачи вливает эпик; ff — эпик вливает задачу, и
# задача перематывается на эпик; removed — эпик убирает старую копию позже задачи, задача вливает его.
tm_repo() {
    local dir="$TF_DIR/$1"
    (
        n=0
        c() { local d; n=$((n + 1)); d="2026-01-01T00:$(printf %02d "$n"):00Z"; GIT_AUTHOR_DATE="$d" GIT_COMMITTER_DATE="$d" "${TM_G[@]}" "$@"; }
        git -c init.defaultBranch=main init -q "$dir" && cd "$dir" || exit 1
        printf 'tracked\n' > tracked.txt
        git add tracked.txt && c commit -q -m start
        git update-ref refs/remotes/origin/main HEAD
        git checkout -q -b "$TM_E" && git checkout -q -b "$TM_B"
        mkdir -p "$TM_F" docs/rules docs/archive
        printf '# Разбор\n\n## Просьба владельца\n\n> сделай\n\n## Вопросы и ответы\n\n**Как?**\nТак.\n' > "$TM_F/grill.md"
        git add -A && c commit -q -m grill
        cat > "$TM_F/plan.md" <<PLAN
# План

**Task:** RT-12 · **Branch:** $TM_B
**Behaviour:** unchanged — правка правил

## След задачи

| Что | Где |
| --- | --- |
| Rules (правится) | \`docs/rules/a.md\` |

## Этапы

### 1. Первый

- **Шаги:**
    1. Сделать раз
       Проверка: \`true\` → exit 0
    2. Увидеть свою меру
       Проверка: \`grep -c 'мера: своя' $TM_F/progress.md\` → = 1
PLAN
        printf '# Ход работы\n\n## Шаги\n\n- [>] 1.1 Сделать раз\n- [ ] 1.2 Увидеть свою меру\n' > "$TM_F/progress.md"
        git add -A && c commit -q -m plan
        plan="$(git rev-parse HEAD)"
        printf 'правка\n' > docs/rules/a.md
        printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Сделать раз\n- [>] 1.2 Увидеть свою меру\n\nмера: своя\n' > "$TM_F/progress.md"
        git add -A && c commit -q -m one
        printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Сделать раз\n- [x] 1.2 Увидеть свою меру\n\nмера: своя\n' > "$TM_F/progress.md"
        git add -A && c commit -q -m two
        git rm -q -r "$TM_F" && printf 'запись\n' > docs/archive/rt-12.md && git add -A && c commit -q -m "folder taken apart"
        git checkout -q "$TM_E" && c merge -q --no-ff -m "old copy" "$plan"
        case "$2" in
            merge) git checkout -q "$TM_B" && c merge -q --no-ff -m "base in" "$TM_E" ;;
            ff) c merge -q --no-ff -m "task in" "$TM_B" && git checkout -q "$TM_B" && git merge -q --ff-only "$TM_E" ;;
            removed) git rm -q -r "$TM_F" && c commit -q -m "old copy gone" && git checkout -q "$TM_B" && c merge -q --no-ff -m "base in" "$TM_E" ;;
        esac
    ) >/dev/null 2>&1
    printf '%s' "$dir"
}

TM_MERGE="$(tm_repo merge-in merge)"
TM_FF="$(tm_repo merge-ff ff)"
TM_GONE="$(tm_repo merge-gone removed)"
for tm in "$TM_MERGE" "$TM_FF" "$TM_GONE"; do
    mkdir -p "$tm/.git/rt-kit/steps/$TM_B"
    printf '{"matched":true}\n' > "$tm/.git/rt-kit/steps/$TM_B/1.1.json"
    printf '{"matched":true}\n' > "$tm/.git/rt-kit/steps/$TM_B/1.2.json"
done

# Последняя версия хода работы и состояние на настоящей истории; метки и одобрение — двойники.
tm_measure() { # $1 — каталог, $2 — метка случая
    (cd "$TESTS" && TM_REPO="$1" TM_LABEL="$2" node --input-type=module 2>&1) <<'JS'
import { treeDouble, hostDouble, ownerDouble, marksDouble, recordsDouble, placed } from './flow-doubles.mjs';
import { buildModel } from '../assets/checks/flow-model.mjs';
import { measureStates, openReaders } from '../assets/checks/task-flow-script.mjs';
import { open as openSteps } from '../assets/task-flow/source/steps.mjs';
import { open as openGit } from '../assets/task-flow/source/git.mjs';
import { dirname } from 'node:path';

const path = new URL('../assets/task-flow/flow.js', import.meta.url).pathname;
const model = buildModel(path);
process.chdir(process.env.TM_REPO);
const B = 'RT-12-flow';
const F = `docs/tasks/${B}`;
const git = openGit();
const label = process.env.TM_LABEL;
const last = git.lastVersion(`${F}/progress.md`) ?? '';
console.log(`${label} — ход работы ветки, не старая копия|${/\[x\] 1\.2/.test(last) && last.includes('мера: своя')}|true`);
const sha = git.addedBy(`${F}/plan.md`);
const given = {
    git,
    tree: treeDouble({ 'docs/plans/epic.md': `# Эпик\n\n**Эпик:** RT-10 · **Ветка эпика:** \`RT-10-epic\`\n\n| # | Задача | Состояние |\n| --- | --- | --- |\n| 1 | RT-12 — задача | идёт |\n` }),
    host: hostDouble({ issues: { 10: { open: true, status: 'in-progress', epic: null }, 12: { open: true, status: 'in-review', epic: '10' } }, remote: [{ name: 'RT-10-epic', sha: 'e1' }] }),
    owner: ownerDouble([]),
    steps: openSteps(),
    marks: marksDouble({ branch: B, approval: placed('Одобряю план RT-12', sha), steps: { '1.1': { matched: true }, '1.2': { matched: true } } }),
    records: recordsDouble({}, placed('Одобряю план RT-12', sha)),
};
const measured = measureStates(model, await openReaders(model, dirname(path), given));
console.log(`${label} — состояние не ниже «папка-разобрана»|${measured.index >= 10}|true`);
const exits = Object.entries(measured.exits).slice(0, 9).filter(([, v]) => v !== true).map(([k]) => k).join(',');
console.log(`${label} — выходы разбора, соглашения, плана, следа и папки выполнены|${exits}|`);
JS
}
tm_report() {
    local label got want
    while IFS='|' read -r label got want; do
        [ -n "$label" ] || continue
        report "$label" "$got" "$want"
    done <<< "$1"
}

# --- SC-AK-1827, SC-AK-1828 — влитая база, перемотка и удаление в базе -----------------------------
for tm in "merge-in|$TM_MERGE|слияние базы" "merge-ff|$TM_FF|перемотка на базу" "merge-gone|$TM_GONE|удаление копии в базе"; do
    IFS='|' read -r _ dir name <<< "$tm"
    out="$(tm_measure "$dir" "merge: SC-AK-1827 — $name")"
    tm_report "$(printf '%s\n' "$out" | grep 'ход работы ветки')"
    tm_report "$(printf '%s\n' "$out" | grep -v 'ход работы ветки' | sed 's/SC-AK-1827/SC-AK-1828/')"
done
report "merge: SC-AK-1827 — файл, которого нет в истории ветки, читается отсутствующим" \
    "$(cd "$TM_MERGE" && node --input-type=module -e "
import { open } from '$TESTS/../assets/task-flow/source/git.mjs';
console.log(String(open().lastVersion('docs/tasks/RT-99-none/progress.md')));
" 2>&1)" 'null'

# --- SC-AK-1829 — команда шага после влитой базы меряет шаг по своему ходу работы -------------------
tm_step() { (cd "$1" && rm -f ".git/rt-kit/steps/$TM_B/$2.json" && RT_FLOW_STEP_LIMIT_MS=5000 node "$TESTS/../assets/checks/task-flow-script.mjs" step "$2" 2>&1); }
got="$(tm_step "$TM_MERGE" 1.2)"
report "merge: SC-AK-1829 — после влитой базы шаг совпал на своём ходе работы" \
    "$(printf '%s' "$got" | grep -c '· совпало$')|$(test -e "$TM_MERGE/.git/rt-kit/steps/$TM_B/1.2.json" && echo есть)" '1|есть'
got="$(tm_step "$TM_GONE" 1.2)"
report "merge: SC-AK-1829 — после удаления копии в базе шаг совпал на своём ходе работы" \
    "$(printf '%s' "$got" | grep -c '· совпало$')|$(test -d "$TM_GONE/$TM_F" && echo есть || echo нет)" '1|нет'

if [ -n "${TF_ALONE:-}" ]; then
    rm -rf "$TF_DIR"
    suite_result "сценарий task flow: база со старой папкой"
fi
