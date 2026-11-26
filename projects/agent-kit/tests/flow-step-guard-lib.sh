#!/usr/bin/env bash
# Обвязка сценариев стража хода работы: дерево задачи, тексты плана и хода работы, вход правки и
# команды, запись разговора, метка одобрения. Файл не набор: бегун берёт только `*.test.sh`, а этот
# подключается набором после `lib.sh`, `GUARD` и `TMPS`.

# Дерево задачи на ветке: план с проверками, ход работы, коммит плана. Довод — имя ветки.
task_repo() {
    local repo="$(fixture_repo_branched main "$1")" folder="docs/tasks/$1"
    TMPS+=("$repo")
    fixture_commit "$repo" "$folder/plan.md" "$(plan_text "${2:-checks}")" "docs: план"
    mkdir -p "$repo/docs/plans"
    printf '%s' "$repo"
}

# План с двумя шагами одного этапа; `bare` — без строк проверки, `edits <путь>` — со строкой следа.
plan_text() {
    printf '# План\n\n## Task footprint\n\n| Layer | What |\n| --- | --- |\n'
    [ "$1" = edits ] && printf '| Code (правится) | `%s` |\n' "$2"
    printf '\n## Stages\n\n### 1. Этап\n\n- **Шаги:**\n    1. Первый шаг\n'
    [ "$1" = bare ] || printf '       Проверка: `true` → exit 0\n'
    printf '    2. Второй шаг\n'
    [ "$1" = bare ] || printf '       Проверка: `true` → exit 0\n'
}

progress_text() {
    printf '# Ход работы\n\n## Где мы\n\n- **State:** `%s`\n\n## Шаги\n\n- [%s] 1.1 Первый шаг\n- [%s] 1.2 Второй шаг\n' "$1" "$2" "$3"
}

# Вход правки: инструмент, путь, старая и новая строка (для Write — содержимое), каталог, запись.
edit_input() {
    jq -n --arg t "$1" --arg f "$2" --arg o "$3" --arg n "$4" --arg d "$5" --arg r "${6:-}" '
        {session_id:"tests",tool_name:$t,cwd:$d,transcript_path:$r,
         tool_input:(if $t == "Write" then {file_path:$f,content:$n} else {file_path:$f,old_string:$o,new_string:$n} end)}'
}
shell_input() {
    jq -n --arg c "$1" --arg d "$2" --arg r "${3:-}" '{session_id:"tests",tool_name:"Bash",cwd:$d,transcript_path:$r,tool_input:{command:$c}}'
}

# Запись разговора с последним словом владельца: набранное сообщение или выбранный вариант меню.
said() {
    local file="$(mktemp)"
    TMPS+=("$file")
    jq -cn --arg t "$1" '{type:"user",message:{role:"user",content:$t}}' > "$file"
    printf '%s' "$file"
}
chose() {
    local file="$(mktemp)"
    TMPS+=("$file")
    jq -cn --arg t "$1" '{type:"user",message:{role:"user",content:[{type:"tool_result",tool_use_id:"x",content:"answered"}]},toolUseResult:{answers:{"Что делаем?":$t}}}' > "$file"
    printf '%s' "$file"
}

# Зелёная метка шага: её пишет только движок, набор кладёт её как готовую.
green_mark() { mkdir -p "$1/.git/rt-kit/steps/$2" && printf '{"matched":true}\n' > "$1/.git/rt-kit/steps/$2/$3.json"; }
# Каталоги записей разговоров лежат в своём доме: движок ищет одобрение только в них.
export RT_FLOW_RECORDS_HOME="$(mktemp -d)/.claude/projects"
mkdir -p "$RT_FLOW_RECORDS_HOME"
TMPS+=("${RT_FLOW_RECORDS_HOME%/.claude/projects}")
records_dir() { printf '%s/%s' "$RT_FLOW_RECORDS_HOME" "$(cd "$1" && pwd -P | sed 's#[/.]#-#g')"; }
# Метка одобрения с местом ответа: запись в каталоге записей копии и uuid её записи. Доводы: дерево,
# ветка, ответ на месте (по умолчанию — одобряющий), uuid в метке, путь записи.
approve() {
    local repo="$1" branch="$2" task="${2%%-[a-z]*}" dir rec sha
    local said="${3:-Одобряю план $task}"
    dir="$(records_dir "$repo")"
    mkdir -p "$dir"
    rec="${5:-$dir/session.jsonl}"
    jq -cn --arg t "$said" '{type:"user",uuid:"a1",toolUseResult:{answers:{"Одобряешь?":$t}}}' > "$rec"
    sha="$(git -C "$repo" log --diff-filter=A --format=%H -- "docs/tasks/$branch/plan.md" | tail -1)"
    mkdir -p "$repo/.git/rt-kit/approval"
    jq -cn --arg a "Одобряю план $task" --arg p "$sha" --arg r "$rec" --arg u "${4:-a1}" \
        '{answer:$a,plan:$p,place:{record:$r,uuid:$u}}' > "$repo/.git/rt-kit/approval/$branch.json"
}

d() { expect_decision "$1" "$GUARD" "$2" "$3"; }
