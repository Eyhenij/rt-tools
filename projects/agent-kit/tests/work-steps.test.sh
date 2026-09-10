#!/usr/bin/env bash
# Сценарии сверки шагов: что проверка говорит о ходе работы, который сошёлся с замыслом, и о
# трёх видах расхождения.
#
# Набор судит механику, а не дерево, в котором запущен: папки задач задаются фикстурой. Иначе
# проба краснела бы от любой правки настоящих задач.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: шаги замысла и отметки хода работы"

WS_TREE="$(mktemp -d)"
mkdir -p "$WS_TREE/tools" "$WS_TREE/.claude/rt-kit"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-work-steps.mjs" "$WS_TREE/tools/"
printf '{\n    "tasksDir": "docs/tasks"\n}\n' > "$WS_TREE/.claude/rt-kit/checks.json"

# Замысел фикстуры: два этапа, три шага. Он один на все пробы — расходится с ним ход работы.
ws_plan() {
    mkdir -p "$WS_TREE/docs/tasks/$1"
    cat > "$WS_TREE/docs/tasks/$1/plan.md" <<'PLAN'
# Plan

## Stages

### 1. Первый

- **Steps:**
    1. поставить ярус
    2. завести пробы
- **Readiness sign:** ярус стоит
- **Verified by:** `bash tests/one.sh`

### 2. Второй

- **Steps:**
    1. записать статью
- **Readiness sign:** статья записана
- **Verified by:** `npm run check:specs`

## What this work does not do

- ничего
PLAN
}

# Ход работы фикстуры: раздел шагов подаётся строками.
ws_progress() {
    local folder="$1"
    shift
    mkdir -p "$WS_TREE/docs/tasks/$folder"
    {
        printf '# Progress\n\n## Where we stand\n\n- **State:** `этап-идёт`\n\n## Steps\n\n'
        for line in "$@"; do
            printf '%s\n' "$line"
        done
        printf '\n## Sessions\n\n### 2026-09-10\n\n- ничего\n'
    } > "$WS_TREE/docs/tasks/$folder/progress.md"
}

ws_says() {
    (cd "$WS_TREE" && node tools/check-work-steps.mjs 2>&1)
}

ws_code() {
    (cd "$WS_TREE" && node tools/check-work-steps.mjs >/dev/null 2>&1)
    printf '%s' $?
}

ws_reset() {
    rm -rf "$WS_TREE/docs/tasks"
    mkdir -p "$WS_TREE/docs/tasks"
}

# --- SC-AK-1008 — сошедшийся перечень принимается -------------------------------------------
ws_reset
ws_plan RT-1-one
ws_progress RT-1-one '- [x] 1.1 поставить ярус' '- [>] 1.2 завести пробы' '- [ ] 2.1 записать статью'
report "SC-AK-1008 — сошедшийся перечень принят" "$(ws_code)" 0
report "SC-AK-1008 — назван счёт папок" "$(ws_says | grep -c 'task folders 1')" 1

# --- SC-AK-1009 — расхождение числом отбито --------------------------------------------------
ws_reset
ws_plan RT-2-two
ws_progress RT-2-two '- [>] 1.1 поставить ярус' '- [ ] 1.2 завести пробы'
report "SC-AK-1009 — расхождение числом отбито" "$(ws_code)" 1
report "SC-AK-1009 — названы оба числа" "$(ws_says | grep -c 'names 3 steps, the progress 2')" 1

# --- SC-AK-1010 — расхождение названием отбито -----------------------------------------------
ws_reset
ws_plan RT-3-three
ws_progress RT-3-three '- [>] 1.1 поставить ярус' '- [ ] 1.2 написать пробы' '- [ ] 2.1 записать статью'
report "SC-AK-1010 — расхождение названием отбито" "$(ws_code)" 1
report "SC-AK-1010 — назван номер шага" "$(ws_says | grep -c 'step 1.2')" 1

# --- SC-AK-1011 — текущий шаг ровно один -----------------------------------------------------
ws_reset
ws_plan RT-4-four
ws_progress RT-4-four '- [>] 1.1 поставить ярус' '- [>] 1.2 завести пробы' '- [ ] 2.1 записать статью'
report "SC-AK-1011 — двух текущих не бывает" "$(ws_code)" 1
report "SC-AK-1011 — назван счёт текущих" "$(ws_says | grep -c '2 steps are marked as going on')" 1

ws_reset
ws_plan RT-5-five
ws_progress RT-5-five '- [x] 1.1 поставить ярус' '- [ ] 1.2 завести пробы' '- [ ] 2.1 записать статью'
report "SC-AK-1011 — без текущего отбито" "$(ws_code)" 1
report "SC-AK-1011 — назван остаток" "$(ws_says | grep -c '2 steps are not done')" 1

ws_reset
ws_plan RT-6-six
ws_progress RT-6-six '- [x] 1.1 поставить ярус' '- [x] 1.2 завести пробы' '- [x] 2.1 записать статью'
report "SC-AK-1011 — все шаги сделаны, текущего нет" "$(ws_code)" 0

# --- SC-AK-1008 — папка без шагов не судится -------------------------------------------------
ws_reset
mkdir -p "$WS_TREE/docs/tasks/RT-7-seven"
printf '# Plan\n\n## Stages\n\n### 1. Первый\n\n- **Verified by:** `bash tests/one.sh`\n' > "$WS_TREE/docs/tasks/RT-7-seven/plan.md"
printf '# Progress\n\n## Where we stand\n\n- **State:** `этап-идёт`\n' > "$WS_TREE/docs/tasks/RT-7-seven/progress.md"
report "SC-AK-1008 — замысел без шагов не судится" "$(ws_code)" 0

# Ход работы объявил шаги там, где замысел их не назвал.
ws_progress RT-7-seven '- [>] 1.1 поставить ярус'
report "SC-AK-1008 — перечень из головы отбит" "$(ws_code)" 1
report "SC-AK-1008 — сказано, откуда перечень" "$(ws_says | grep -c 'written from the head')" 1

# --- SC-AK-1008 — образец папки задачи не судится ---------------------------------------------
ws_reset
mkdir -p "$WS_TREE/docs/tasks/_template"
cat > "$WS_TREE/docs/tasks/_template/plan.md" <<'PLAN'
# Plan

## Stages

### 1. <name>

- **Steps:**
    1. <what is done first>
    2. <what is done after it>
- **Verified by:** `<command>`
PLAN
ws_progress _template '- [x] 1.1 <name of the first step>' '- [>] 1.2 <name of the second step>'
report "SC-AK-1008 — образец не судится" "$(ws_code)" 0

rm -rf "$WS_TREE"
suite_result "проверки: шаги замысла и отметки хода работы"
