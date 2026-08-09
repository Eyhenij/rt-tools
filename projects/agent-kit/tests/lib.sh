#!/usr/bin/env bash
# Общая обвязка наборов по исполняемым ресурсам пакета. Подключается через
# `. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"`.
#
# Зачем наборы существуют: механизм раскладки покрыт спеками на TypeScript, а гарды, проверки и
# умолчания — исполняемые файлы, которые пакет только перекладывает. Сломанная строка в любом из
# них уезжала в чужое дерево зелёным прогоном: линтер их не читает, спеки не исполняют, а
# потребитель узнаёт о поломке, когда что-нибудь проходит мимо гарда.
#
# Сценарии проверяют МЕХАНИКУ ресурса, а не карту конкретного дерева: разбор командной строки,
# вложенные вызовы, границы команд, отказ в пользу работы. Всё, что зависит от имён и путей
# дерева-потребителя, задаётся фикстурой здесь же — иначе набор проверял бы дерево, в котором
# его запустили.

ASSETS="$(cd "$(dirname "${BASH_SOURCE[0]}")/../assets" && pwd)"
# HOOKS_OVERRIDE — для проверки самого набора: гарды копируются, в копии ломается одна строка,
# и набор обязан покраснеть. Набор, который не краснеет на сломанном гарде, проверяет
# собственное послушание, а не гарды.
HOOKS="${HOOKS_OVERRIDE:-$ASSETS/hooks}"
CHECKS="$ASSETS/checks"
DEFAULTS="$ASSETS/defaults"

PASSED=0
FAILED=0

# --- фикстура дерева ------------------------------------------------------------------
#
# Гарды ищут карту, законы и правила от корня дерева. Своего дерева у пакета нет, поэтому
# каждый набор поднимает одноразовое: пакет кладёт в него ровно то, что кладёт `sync`, а
# сценарии — только то, что сами же и проверяют.

# Дерево с умолчанием карты гейта и пустой конституцией. Печатает путь.
fixture_tree() {
    local dir
    dir="$(mktemp -d)"
    mkdir -p "$dir/.claude/rt-kit/defaults" "$dir/docs/constitution" "$dir/.claude/skills"
    cp "$DEFAULTS/gate-map.sh" "$dir/.claude/rt-kit/defaults/gate-map.sh"
    printf '%s' "$dir"
}

# Одноразовый репозиторий на названной ветке: гарды поставки смотрят ветку в каталоге, откуда
# пойдёт команда, и без своего репозитория ожидания зависели бы от ветки рабочего дерева.
fixture_repo() {
    local dir
    dir="$(mktemp -d)"
    git -C "$dir" init -q 2>/dev/null
    git -C "$dir" config commit.gpgsign false 2>/dev/null
    git -C "$dir" checkout -q -b "$1" 2>/dev/null
    printf '{"name":"probe"}\n' > "$dir/package.json"
    printf '%s' "$dir"
}

# --- сборка входов --------------------------------------------------------------------

# Вход PreToolUse для команды. Второй довод — имя инструмента, третий — рабочий каталог.
input_cmd() {
    jq -n --arg c "$1" --arg t "${2:-Bash}" --arg d "${3:-$PWD}" \
        '{session_id:"tests",tool_name:$t,tool_input:{command:$c},cwd:$d}'
}

# Вход правки файла: путь и текст, который в него пишут.
input_edit() {
    jq -n --arg f "$1" --arg b "${2:-}" \
        '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:$f,new_string:$b}}'
}

# --- проверки -------------------------------------------------------------------------

report() {
    if [ "$2" = "$3" ]; then
        PASSED=$((PASSED + 1))
        [ -n "$VERBOSE" ] && printf '  ok   %-58s %s\n' "$1" "$2"
    else
        FAILED=$((FAILED + 1))
        printf '  FAIL %-58s получили %s, ждали %s\n' "$1" "$2" "$3"
    fi
    return 0
}

# Гард с решением в JSON: PASS | ask | deny.
expect_decision() {
    local label="$1" hook="$2" json="$3" want="$4" out got
    out="$(printf '%s' "$json" | "$HOOKS/$hook" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // "deny"' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

# Чем именно гард отбил: в тексте отказа ищется образец. Два отказа подряд бывают на одну
# правку по разным причинам, и «отбито» о них не различает — набор, сверяющий только решение,
# зеленеет, когда причина подменилась соседней.
expect_reason() {
    local label="$1" hook="$2" json="$3" pattern="$4" got
    if printf '%s' "$json" | "$HOOKS/$hook" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null \
        | grep -qE "$pattern"; then got="есть"; else got="нет"; fi
    report "$label" "$got" "есть"
}

# Гард, отвечающий кодом возврата: PASS | DENY.
expect_exit() {
    local label="$1" hook="$2" json="$3" want="$4" got
    if printf '%s' "$json" | "$HOOKS/$hook" >/dev/null 2>&1; then got="PASS"; else got="DENY"; fi
    report "$label" "$got" "$want"
}

# Какое правило гейт требует для цели. Ожидание — имя правила или PASS.
expect_skill() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/skill-gate.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecisionReason' 2>/dev/null \
            | grep -oE '«[a-z-]+»' | head -1 | tr -d '«»')"
    fi
    report "$label" "$got" "$want"
}

# --- память сессии гейта --------------------------------------------------------------
#
# Гейт помнит загруженные правила в файле сессии. Наборам нужна то чистая, то заряженная
# сессия, поэтому свой временный корень заводится явно.

gate_session_reset() {
    export TMPDIR="${TMPDIR_BASE:-/tmp}/rt-kit-asset-tests-$$/"
    mkdir -p "${TMPDIR}claude-skill-gate"
    : > "${TMPDIR}claude-skill-gate/tests.loaded"
}

gate_session_load() {
    printf '%s\n' "$@" >> "${TMPDIR}claude-skill-gate/tests.loaded"
}

gate_session_cleanup() {
    [ -n "$TMPDIR" ] && rm -rf "$TMPDIR"
}

suite_result() {
    printf '%s: %d ok, %d провалов\n' "$1" "$PASSED" "$FAILED"
    [ "$FAILED" -eq 0 ]
}
