#!/usr/bin/env bash
# Сценарии выбора плана эпика: план живого эпика лежит в его ветке, а не на диске.
#
# Стенд свой, с настоящим репозиторием: чтение идёт из веток, а у общего стенда репозитория нет.
# Хостинг не спрашивается вовсе — сюда приходит тело карточки, а не её адрес.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: план эпика читается из его ветки"

EP_TREE="$(mktemp -d)"
mkdir -p "$EP_TREE/tools" "$EP_TREE/.claude/rt-kit" "$EP_TREE/docs/plans"
cp "$CHECKS/rt-kit-checks.config.mjs" "$EP_TREE/tools/"
cp "$CHECKS/board.github.mjs" "$EP_TREE/tools/board.mjs"
cp "$CHECKS/board-epic-link.github.mjs" "$EP_TREE/tools/board-epic-link.mjs"
cp "$CHECKS/board-gh.github.mjs" "$EP_TREE/tools/board-gh.mjs"
cp "$CHECKS/board-task-dirs.github.mjs" "$EP_TREE/tools/board-task-dirs.mjs"
cp "$CHECKS/board-paths.github.mjs" "$EP_TREE/tools/board-paths.mjs"
cp "$CHECKS/board-epic-plan.github.mjs" "$EP_TREE/tools/board-epic-plan.mjs"

printf '{"plansDir":"docs/plans","board":{"owner":"probe","repo":"tree","taskKey":"RT"}}\n' \
    > "$EP_TREE/.claude/rt-kit/checks.json"

ep_git() { (cd "$EP_TREE" && git -c user.name=probe -c user.email=probe@probe "$@" >/dev/null 2>&1); }

# Ответ выбора плана по телу карточки: путь и первая строка текста, либо причина отказа.
ep_says() {
    (cd "$EP_TREE" && node --input-type=module -e "
        const { planPathOf } = await import('./tools/board-epic-plan.mjs');
        const found = planPathOf(process.argv[1], { epicNumber: Number(process.argv[2]) });
        process.stdout.write(found.path === null ? 'нет: ' + found.why : found.path + ' | ' + String(found.text).split('\n')[0]);
    " "$1" "$2")
}

# Дерево-фикстура: главная ветка без планов, ветка эпика с планом и составом.
ep_git init -b main
printf 'дерево\n' > "$EP_TREE/README.md"
ep_git add -A
ep_git commit -m 'первый коммит'

ep_git checkout -b RT-800-epic
{
    printf '# План живого эпика\n\n'
    printf '**Эпик:** RT-800 · **Ветка эпика:** `RT-800-epic`\n\n'
    printf '| #   | Задача                  | Состояние |\n'
    printf '| --- | ----------------------- | --------- |\n'
    printf '| 1   | RT-801 — первая работа  | в работе  |\n'
} > "$EP_TREE/docs/plans/live-epic.md"
ep_git add -A
ep_git commit -m 'план эпика'
ep_git checkout main

BODY_LIVE='План эпика — docs/plans/live-epic.md'
BODY_NOWHERE='План эпика — docs/plans/no-such.md'

# --- SC-AK-1155 — план живого эпика читается из ветки эпика --------------------------------
# На диске главной ветки его нет и не будет до слияния эпика: иначе каждый живой эпик приходит
# строкой «карточка указывает в пустоту», и настоящие расхождения тонут среди них.
report "SC-AK-1155 — план найден в ветке эпика" \
    "$(ep_says "$BODY_LIVE" 800 | grep -c 'docs/plans/live-epic.md | # План живого эпика')" 1

# Обратная сторона того же: без номера эпика искать негде, и ответ прежний — пустота.
report "SC-AK-1155 — без номера эпика ветка не ищется" \
    "$(ep_says "$BODY_LIVE" '' | grep -c 'нет: ')" 1

# --- SC-AK-1156 — плана нет ни на диске, ни в ветке ----------------------------------------
report "SC-AK-1156 — ненайденный план остаётся расхождением" \
    "$(ep_says "$BODY_NOWHERE" 800 | grep -c 'указывает в пустоту\|points into emptiness')" 1

# Тот же путь, положенный на диск, читается и без всякой ветки. Каталог планов на главной ветке
# заводится заново: он приехал вместе с веткой эпика и с уходом с неё пропал.
mkdir -p "$EP_TREE/docs/plans"
printf '# План на диске\n\n| #   | Задача | Состояние |\n| --- | ------ | --------- |\n| 1   | RT-802 | в работе |\n' \
    > "$EP_TREE/docs/plans/no-such.md"
report "SC-AK-1155 — план с диска читается по-прежнему" \
    "$(ep_says "$BODY_NOWHERE" 800 | grep -c 'docs/plans/no-such.md | # План на диске')" 1

# --- SC-AK-1157 — номер задачи берётся из столбца задачи -----------------------------------
# Столбец состояния несёт номер PR, которым задачу влили. Прочитанный из всей строки, он делает
# из PR задачу эпика: аудит тогда говорит «план называет задачи, которых нет среди подзадач».
ep_cells() {
    (cd "$EP_TREE" && node --input-type=module -e "
        const { planTaskCells } = await import('./tools/board-epic-plan.mjs');
        const plan = [
            '| #   | Задача                | Состояние        |',
            '| --- | --------------------- | ---------------- |',
            '| 1   | RT-801 — первая       | влито, PR #2198  |',
            '| 2   | RT-802 — вторая       | отдана, PR #2273 |',
        ].join('\\n');
        process.stdout.write(planTaskCells(plan).join(' ').replace(/\\s+/g, ' '));
    ")
}

report "SC-AK-1157 — номер задачи читается" "$(ep_cells | grep -c 'RT-801')" 1
report "SC-AK-1157 — номер PR не читается" "$(ep_cells | grep -c '2198')" 0

# --- SC-AK-1159 — при отставшей текущей ветке план берётся из ветки эпика ------------------
# На диске лежит копия из главной ветки, и она старее: план эпика дополняется по ходу его работ и
# уезжает в главную в самом конце. Прочитанный с диска, он не несёт задач, которые в нём стоят.
mkdir -p "$EP_TREE/docs/plans"
{
    printf '# План с диска, старый\n\n'
    printf '| #   | Задача                  | Состояние |\n'
    printf '| --- | ----------------------- | --------- |\n'
    printf '| 1   | RT-801 — первая работа  | влито     |\n'
} > "$EP_TREE/docs/plans/live-epic.md"

report "SC-AK-1159 — берётся текст ветки эпика" \
    "$(ep_says "$BODY_LIVE" 800 | grep -c '# План живого эпика')" 1
report "SC-AK-1159 — старая копия с диска не берётся" \
    "$(ep_says "$BODY_LIVE" 800 | grep -c 'План с диска')" 0

# Обратная сторона: текущая ветка вобрала вершину ветки эпика — диск не старее, читается он.
ep_git checkout RT-800-epic
report "SC-AK-1159 — вобравшая ветка читает диск" \
    "$(ep_says "$BODY_LIVE" 800 | grep -c '# План живого эпика')" 1
ep_git checkout main

rm -rf "$EP_TREE"

suite_result "план эпика читается из его ветки"
