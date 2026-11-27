#!/usr/bin/env bash
# Дерево сценария для наборов записанных ходов: `turn-replay.test.sh` и `owner-waits-replay.test.sh`.
#
# Файл подключается набором после `lib.sh`; набор задаёт ROOT и WORK. Здесь — двойник хостинга, разбор,
# план, ход работы, одобрение плана с местом ответа и `build_tree`, который строит дерево задачи эпика в
# названном состоянии сценария.
#
# RT_REPLAY_LAID=1 гоняет ходы на разложенных хуках дерева и разложенном движке.
# RT_REPLAY_EDITION=<папка пакета> гоняет их на хуках и движке другого издания: хуки берутся из
# `<папка>/assets/hooks` и находят движок рядом, в `../checks`, как в исходниках пакета. Хук, которого в
# издании нет, набор не зовёт и печатает строку «нет в издании: <хук>».

LAID="${RT_REPLAY_LAID:-}"
[ -n "$LAID" ] && HOOKS="$ROOT/.claude/hooks"
EDITION=""
if [ -n "${RT_REPLAY_EDITION:-}" ]; then
    EDITION="$(cd "$RT_REPLAY_EDITION" && pwd)"
    HOOKS="$EDITION/assets/hooks"
    ASSETS="$EDITION/assets"
fi

# Хук издания: путь, или пусто, когда его там нет.
edition_hook() { [ -f "$HOOKS/$1" ] && printf '%s' "$HOOKS/$1"; }

EPIC=RT-100-replay-epic
TASK=RT-101-replay-task

g() { git -C "$1" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false "${@:2}"; }

put() {
    mkdir -p "$1/$(dirname "$2")"
    printf '%s\n' "$3" > "$1/$2"
}

commit() { g "$1" add -A docs >/dev/null 2>&1; g "$1" commit -q -m "$2" >/dev/null 2>&1; }

# Двойник хостинга: модуль доски, который источник `source.host` берёт из `tools/` корня дерева.
board_double() {
    mkdir -p "$1/tools"
    if [ -n "$LAID" ]; then
        cp "$ROOT"/tools/*.mjs "$1/tools/" 2>/dev/null
        cp -R "$ROOT/tools/task-flow" "$1/tools/" 2>/dev/null
        rm -f "$1/tools/tree-assignment.mjs"
    fi
    cat > "$1/tools/board.mjs" <<'JS'
import { readFileSync } from 'node:fs';
const data = () => JSON.parse(readFileSync(new URL('./board-double.json', import.meta.url), 'utf8'));
export const STATUS_OPTIONS = {};
export function taskState(number) {
    const card = data().issues[String(number)];
    return card ? { exists: true, ...card } : { exists: false };
}
export function ghJson(args) {
    const at = args.indexOf('--head');
    if (at >= 0) return data().pulls[args[at + 1]] ?? [];
    return args.includes('merged') ? (data().merged ?? []) : [];
}
JS
    printf '%s\n' "$2" > "$1/tools/board-double.json"
}

# Карточки эпика 100 и задачи 101 с колонкой задачи и PR по веткам.
cards() {
    local pulls="${2:-}"
    [ -n "$pulls" ] || pulls='{}'
    printf '{"issues":{"100":{"open":true,"status":"in-progress","epic":null},"101":{"open":true,"status":"%s","epic":100}},"pulls":%s,"merged":[]}' "$1" "$pulls"
}

# PR ветки в ответе хостинга: ветка, номер, состояние, база, вершина, ревьюер — requested, reviewed
# или none.
pull() {
    jq -n -c --arg head "$1" --argjson n "$2" --arg state "$3" --arg base "$4" --arg sha "$5" --arg who "$6" \
        '{($head): [{number: $n, state: $state, baseRefName: $base, headRefOid: $sha,
            reviewRequests: (if $who == "requested" then [{login: "reviewer"}] else [] end),
            latestReviews: (if $who == "reviewed" then [{author: {login: "reviewer"}}] else [] end)}]}'
}

GRILL='# Разбор

## Просьба владельца

> переписать проверку хода

## Вопросы и ответы

- Что меняем? — проверку хода.

**Behaviour:** unchanged — правка правил хода'

PLAN='# План

**Behaviour:** unchanged — правка правил хода

## Этапы

### 1. Проверка

- **Шаги:**
    1. Написать проверку
       Проверка: `true` → exit 0
    2. Запустить набор
       Проверка: `echo ok` → `ok`'

progress() { printf '# Ход работы\n\n## Шаги\n\n- [%s] 1.1 Написать проверку\n- [%s] 1.2 Запустить набор\n' "$1" "$2"; }

mark() { put "$1" ".git/rt-kit/$2" "$3"; }
# Одобрение плана с местом ответа: запись в каталоге записей копии и uuid её записи.
export RT_FLOW_RECORDS_HOME="$WORK/records"
approve_plan() {
    local dir="$1" rec sha
    rec="$RT_FLOW_RECORDS_HOME/$(cd "$dir" && pwd -P | sed 's#[/.]#-#g')/session.jsonl"
    mkdir -p "$(dirname "$rec")"
    printf '%s\n' '{"type":"user","uuid":"a1","toolUseResult":{"answers":{"Одобряешь?":"Одобряю план RT-101"}}}' > "$rec"
    sha="$(g "$dir" log --diff-filter=A --format=%H -- "docs/tasks/$TASK/plan.md" | tail -1)"
    mark "$dir" "approval/$TASK.json" "{\"answer\":\"Одобряю план RT-101\",\"plan\":\"$sha\",\"place\":{\"record\":\"$rec\",\"uuid\":\"a1\"}}"
}

# Дерево задачи эпика в названном состоянии сценария. Печатает путь.
#   request   ветка без разбора — состояние 1
#   taken     разбор, договорённость, задача — состояние 5 «задача-взята»
#   stage     план одобрен, шаг 1.2 идёт — состояние 7 «этап-идёт»
#   archived  шаги сделаны, папка разобрана, ветка не отправлена — состояние 10 «папка-разобрана»
#   handed    ветка на сервере, PR с ревьюером — состояние 11 «работа-отдана»
#   epicEnd   обе задачи эпика лежат в ветке эпика, PR эпика открыт — конец сценария
#   outside   ветка без номера задачи, эпика копии нет — вне сценария
build_tree() {
    local dir="$WORK/$1" origin="$WORK/$1.origin" sha pulls
    mkdir -p "$dir"
    git init -q --bare "$origin"
    git -C "$dir" init -q
    git -C "$dir" checkout -q -b main
    put "$dir" package.json '{"name":"probe"}'
    put "$dir" docs/plans/replay-epic.md "# Эпик

**Эпик:** RT-100
**Ветка эпика:** \`$EPIC\`

| # | Задача | Состояние |
| - | ------ | --------- |
| 1 | RT-101 — первая задача | в работе |
| 2 | RT-102 — вторая задача | ждёт |"
    g "$dir" add -A >/dev/null 2>&1
    g "$dir" commit -q -m 'основание' >/dev/null 2>&1
    g "$dir" remote add origin "$origin"
    g "$dir" push -q origin main >/dev/null 2>&1
    g "$dir" branch "$EPIC"
    g "$dir" push -q origin "$EPIC" >/dev/null 2>&1
    board_double "$dir" "$(cards in-progress)"
    if [ "$1" = outside ]; then
        g "$dir" checkout -q -b scratch-notes
        printf '%s' "$dir"
        return
    fi
    g "$dir" checkout -q -b "$TASK"
    [ "$1" = request ] && { printf '%s' "$dir"; return; }

    put "$dir" "docs/tasks/$TASK/grill.md" "$GRILL"
    commit "$dir" 'docs: разбор'
    [ "$1" = taken ] && { printf '%s' "$dir"; return; }

    put "$dir" "docs/tasks/$TASK/plan.md" "$PLAN"
    put "$dir" "docs/tasks/$TASK/progress.md" "$(progress x '>')"
    commit "$dir" 'docs: план'
    approve_plan "$dir"
    [ "$1" = stage ] && { printf '%s' "$dir"; return; }

    put "$dir" "docs/tasks/$TASK/progress.md" "$(progress x x)"
    commit "$dir" 'docs: шаги сделаны'
    mark "$dir" "steps/$TASK/1.1.json" '{"matched":true}'
    mark "$dir" "steps/$TASK/1.2.json" '{"matched":true}'
    g "$dir" rm -r -q "docs/tasks/$TASK" >/dev/null 2>&1
    put "$dir" docs/archive/RT-101.md '# RT-101 — проверка хода'
    commit "$dir" 'docs: папка задачи разобрана'
    [ "$1" = archived ] && { printf '%s' "$dir"; return; }

    g "$dir" push -q origin "$TASK" >/dev/null 2>&1
    sha="$(g "$dir" rev-parse HEAD)"
    if [ "$1" = handed ]; then
        pulls="$(pull "$TASK" 11 OPEN "$EPIC" "$sha" requested)"
        board_double "$dir" "$(cards review "$pulls")"
        printf '%s' "$dir"
        return
    fi

    # Конец эпика: вторая задача тоже влита в ветку эпика, PR эпика в главную ветку открыт.
    g "$dir" checkout -q -b RT-102-second-task "$EPIC"
    put "$dir" docs/archive/RT-102.md '# RT-102 — вторая задача'
    commit "$dir" 'docs: вторая задача'
    g "$dir" push -q origin RT-102-second-task >/dev/null 2>&1
    g "$dir" checkout -q "$EPIC"
    g "$dir" merge -q --no-edit "$TASK" RT-102-second-task >/dev/null 2>&1
    g "$dir" push -q origin "$EPIC" >/dev/null 2>&1
    g "$dir" checkout -q "$TASK"
    pulls="$(jq -n --argjson a "$(pull "$TASK" 11 MERGED "$EPIC" "$sha" reviewed)" \
        --argjson b "$(pull "$EPIC" 20 OPEN main "$sha" none)" '$a + $b')"
    board_double "$dir" "$(cards done "$pulls")"
    printf '%s' "$dir"
}
