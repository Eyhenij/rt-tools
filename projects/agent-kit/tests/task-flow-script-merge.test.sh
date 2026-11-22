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
# задача перематывается на эпик; removed — эпик убирает старую копию позже задачи, задача вливает его;
# removed-ff — то и другое подряд; in-merge — папка разобрана в коммите слияния базы; onlyff — у эпика
# нет копии; base-grill и base-prog — эпик правит свою копию, конфликт решён удалением; amended — эпик
# взял копию у последнего коммита ветки, ветка переписала этот коммит; epic-removal — эпик разобрал
# папку в своём слиянии задачи, задача перемотана. Ход работы между отметками держит строку «шаг: идёт».
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
       Проверка: \`grep -c 'шаг: идёт' $TM_F/progress.md\` → = 1
PLAN
        printf '# Ход работы\n\n## Шаги\n\n- [>] 1.1 Сделать раз\n- [ ] 1.2 Увидеть свою меру\n' > "$TM_F/progress.md"
        git add -A && c commit -q -m plan
        plan="$(git rev-parse HEAD)"
        printf 'правка\n' > docs/rules/a.md
        printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Сделать раз\n- [>] 1.2 Увидеть свою меру\n\nмера: своя\nшаг: идёт\n' > "$TM_F/progress.md"
        git add -A && c commit -q -m one
        printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Сделать раз\n- [x] 1.2 Увидеть свою меру\n\nмера: своя\n' > "$TM_F/progress.md"
        git add -A && c commit -q -m two
        if [ "$2" = amended ]; then
            git checkout -q "$TM_E" && c merge -q --no-ff -m "old copy at two" "$TM_B" && git checkout -q "$TM_B"
            printf 'уточнено\n' >> "$TM_F/progress.md" && git add -A && c commit -q --amend --no-edit
        fi
        case "$2" in in-merge | epic-removal) ;; *) git rm -q -r "$TM_F" && printf 'запись\n' > docs/archive/rt-12.md && git add -A && c commit -q -m "folder taken apart" ;; esac
        git checkout -q "$TM_E"
        case "$2" in onlyff | amended | epic-removal) ;; *) c merge -q --no-ff -m "old copy" "$plan" ;; esac
        case "$2" in
            onlyff) c merge -q --no-ff -m "task in" "$TM_B" && git checkout -q "$TM_B" && git merge -q --ff-only "$TM_E" ;;
            amended) git checkout -q "$TM_B" && { c merge -q --no-ff -m "base in" "$TM_E" || { git rm -q -r "$TM_F" && c commit -q -m "base in"; }; } ;;
            base-grill | base-prog)
                [ "$2" = base-grill ] && f=grill.md || f=progress.md
                printf 'правка эпика\n' >> "$TM_F/$f" && git add -A && c commit -q -m "epic edits its copy"
                git checkout -q "$TM_B" && { c merge -q --no-ff -m "base in" "$TM_E" || { git rm -q -r "$TM_F" && c commit -q -m "base in"; }; }
                ;;
            epic-removal)
                c merge -q --no-ff --no-commit "$TM_B"
                git rm -q -r -f "$TM_F" && printf 'запись\n' > docs/archive/rt-12.md && git add -A && c commit -q -m "task in, folder taken apart"
                git checkout -q "$TM_B" && git merge -q --ff-only "$TM_E"
                ;;
            merge) git checkout -q "$TM_B" && c merge -q --no-ff -m "base in" "$TM_E" ;;
            ff) c merge -q --no-ff -m "task in" "$TM_B" && git checkout -q "$TM_B" && git merge -q --ff-only "$TM_E" ;;
            removed) git rm -q -r "$TM_F" && c commit -q -m "old copy gone" && git checkout -q "$TM_B" && c merge -q --no-ff -m "base in" "$TM_E" ;;
            removed-ff)
                git rm -q -r "$TM_F" && c commit -q -m "old copy gone" && git checkout -q "$TM_B" && c merge -q --no-ff -m "base in" "$TM_E"
                git checkout -q "$TM_E" && c merge -q --no-ff -m "task in" "$TM_B" && git checkout -q "$TM_B" && git merge -q --ff-only "$TM_E"
                ;;
            in-merge)
                git checkout -q "$TM_B" && git merge -q --no-ff --no-commit "$TM_E"
                git rm -q -r "$TM_F" && printf 'запись\n' > docs/archive/rt-12.md && git add -A && c commit -q -m "base in, folder taken apart"
                ;;
        esac
    ) >/dev/null 2>&1
    printf '%s' "$dir"
}

TM_MERGE="$(tm_repo merge-in merge)"
TM_FF="$(tm_repo merge-ff ff)"
TM_GONE="$(tm_repo merge-gone removed)"
TM_GONE_FF="$(tm_repo merge-gone-ff removed-ff)"
TM_IN="$(tm_repo merge-in-merge in-merge)"
TM_ONLY="$(tm_repo merge-only-ff onlyff)"
TM_GRILL="$(tm_repo merge-base-grill base-grill)"
TM_PROG="$(tm_repo merge-base-prog base-prog)"
TM_AMEND="$(tm_repo merge-amended amended)"
TM_EPIC="$(tm_repo merge-epic-removal epic-removal)"
for tm in "$TM_MERGE" "$TM_FF" "$TM_GONE" "$TM_GONE_FF" "$TM_IN" "$TM_ONLY" "$TM_GRILL" "$TM_PROG" "$TM_AMEND" "$TM_EPIC"; do
    report "merge: история ${tm##*/} собрана — запись архива есть, папки у вершины нет, дерево чисто" \
        "$(test -e "$tm/docs/archive/rt-12.md" && echo есть)|$(test -d "$tm/$TM_F" && echo есть || echo нет)|$(git -C "$tm" status --porcelain | grep -vc '^??')" 'есть|нет|0'
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
for tm in "merge-in|$TM_MERGE|слияние базы" "merge-ff|$TM_FF|перемотка на базу" "merge-gone|$TM_GONE|удаление копии в базе" \
    "merge-gone-ff|$TM_GONE_FF|удаление копии в базе, затем перемотка" "merge-in-merge|$TM_IN|разбор папки в коммите слияния" \
    "merge-only-ff|$TM_ONLY|перемотка на базу без старой копии" "merge-base-grill|$TM_GRILL|эпик правил разбор своей копии" \
    "merge-base-prog|$TM_PROG|эпик правил ход работы своей копии" "merge-amended|$TM_AMEND|ветка переписала коммит копии" \
    "merge-epic-removal|$TM_EPIC|эпик разобрал папку в своём слиянии"; do
    IFS='|' read -r _ dir name <<< "$tm"
    out="$(tm_measure "$dir" "merge: SC-AK-1827 — $name")"
    tm_report "$(printf '%s\n' "$out" | grep 'ход работы ветки')"
    # Разбор в слиянии эпика выход 9 не видит: он читает общий diff слияния. Это находка эпика.
    [ "$dir" = "$TM_EPIC" ] && continue
    tm_report "$(printf '%s\n' "$out" | grep -v 'ход работы ветки' | sed 's/SC-AK-1827/SC-AK-1828/')"
done
report "merge: SC-AK-1827 — файл, которого нет в истории ветки, читается отсутствующим" \
    "$(cd "$TM_MERGE" && node --input-type=module -e "
import { open } from '$TESTS/../assets/task-flow/source/git.mjs';
console.log(String(open().lastVersion('docs/tasks/RT-99-none/progress.md')));
" 2>&1)" 'null'

# --- SC-AK-1829 — команда шага после влитой базы меряет шаг по своему ходу работы -------------------
tm_step() { (cd "$1" && rm -f ".git/rt-kit/steps/$TM_B/$2.json" && RT_FLOW_STEP_LIMIT_MS=5000 node "$TESTS/../assets/checks/task-flow-script.mjs" step "$2" 2>&1); }
report "merge: SC-AK-1827 — ветка переписала коммит копии — читается переписанный ход работы" \
    "$(cd "$TM_AMEND" && node --input-type=module -e "
import { open } from '$TESTS/../assets/task-flow/source/git.mjs';
console.log(String(/уточнено/.test(open().lastVersion('$TM_F/progress.md') ?? '')));
" 2>&1)" 'true'
for tm in "$TM_MERGE|влитой базы" "$TM_GONE|удаления копии в базе" "$TM_FF|перемотки" "$TM_GONE_FF|удаления копии в базе и перемотки" \
    "$TM_IN|разбора папки в коммите слияния" "$TM_ONLY|перемотки без старой копии" "$TM_GRILL|правки разбора в копии эпика" \
    "$TM_PROG|правки хода работы в копии эпика" "$TM_AMEND|переписанного коммита" "$TM_EPIC|разбора папки в слиянии эпика"; do
    dir="${tm%%|*}"
    got="$(tm_step "$dir" 1.2)"
    report "merge: SC-AK-1829 — после ${tm#*|} шаг совпал на своём ходе работы, метка есть, папки нет" \
        "$(printf '%s' "$got" | grep -c '· совпало$')|$(test -e "$dir/.git/rt-kit/steps/$TM_B/1.2.json" && echo есть)|$(test -d "$dir/$TM_F" && echo есть || echo нет)" '1|есть|нет'
    got="$(cd "$dir" && RT_FLOW_STEP_LIMIT_MS=5000 node "$TESTS/../assets/checks/task-flow-script.mjs" step --done --pr 2>&1; printf ' code=%s' "$?")"
    report "merge: SC-AK-1829 — после ${tm#*|} перемер перед PR совпал по обоим шагам" \
        "$(printf '%s' "$got" | grep -c '· совпало$')|$(printf '%s' "$got" | grep -o 'code=[0-9]*')" '2|code=0'
done

# Каталог, живший только в ветке, найден и после перемотки; файл у вершины читается у вершины.
report "merge: SC-AK-1827 — папка, жившая только в ветке, найдена после перемотки; файл у вершины — у вершины" \
    "$(cd "$TM_ONLY" && node --input-type=module -e "
import { open } from '$TESTS/../assets/task-flow/source/git.mjs';
const git = open();
console.log(String(git.everExisted('$TM_F/')) + ' ' + git.lastVersion('docs/rules/a.md').trim());
" 2>&1)" 'true правка'

# Удаление, которое уже лежит в main, файла не даёт; без ссылки на main удаление ветки находится.
git -C "$TM_ONLY" update-ref refs/remotes/origin/main HEAD
report "merge: SC-AK-1827 — удаление, которое уже лежит в main, файла не даёт" \
    "$(cd "$TM_ONLY" && node --input-type=module -e "
import { open } from '$TESTS/../assets/task-flow/source/git.mjs';
console.log(String(open().lastVersion('$TM_F/progress.md')));
" 2>&1)" 'null'
git -C "$TM_MERGE" update-ref -d refs/remotes/origin/main
report "merge: SC-AK-1827 — без ссылки на main ход работы читается у родителя разбора ветки" \
    "$(cd "$TM_MERGE" && node --input-type=module -e "
import { open } from '$TESTS/../assets/task-flow/source/git.mjs';
console.log(String(/мера: своя/.test(open().lastVersion('$TM_F/progress.md') ?? '')));
" 2>&1)" 'true'

if [ -n "${TF_ALONE:-}" ]; then
    rm -rf "$TF_DIR"
    suite_result "сценарий task flow: база со старой папкой"
fi
