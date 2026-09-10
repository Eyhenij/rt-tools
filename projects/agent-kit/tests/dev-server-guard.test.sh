#!/usr/bin/env bash
# Сценарии стража второго сервера разработки.
#
# Приложения дерева уже подняты владельцем, и всякий взгляд через браузер идёт туда. Второй
# экземпляр занимает другой порт, отдаёт другую сборку и уводит разбор в сторону: разница между
# двумя серверами читается как дефект правки.
#
# Набор судит границу с обеих сторон. Подъём сервера отбивается, чем бы его ни поднимали; сборка,
# набор проб, запрос к поднятому порту и взгляд на слушателей проходят — иначе за отказ платили бы
# каждым ходом.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "страж второго сервера разработки"

tree="$(mktemp -d)"
cleanup() { rm -rf "$tree"; }
trap cleanup EXIT
export CLAUDE_PROJECT_DIR="$tree"

say() {
    local label="$1" want="$2" cmd="$3" tool="${4:-Bash}" got
    if input_cmd "$cmd" "$tool" "$tree" | "$HOOKS/dev-server-guard.sh" >/dev/null 2>&1; then
        got="PASS"
    else
        got="DENY"
    fi
    report "$label" "$got" "$want"
}

# --- SC-AK-1051. Подъём сервера отбивается ------------------------------------------------

say "SC-AK-1051 — подъём через каркас отбит" DENY 'nx serve admin'
say "SC-AK-1051 — подъём названной целью каркаса отбит" DENY 'pnpm exec nx run admin:serve'
say "SC-AK-1051 — сценарий запуска у бегунка отбит" DENY 'npm run start'
say "SC-AK-1051 — сценарий с двоеточием отбит" DENY 'pnpm run serve:admin'
say "SC-AK-1051 — сборщик без подкоманды отбит" DENY 'npx vite'
say "SC-AK-1051 — статический сервер поверх сборки отбит" DENY 'python3 -m http.server 8080'

# --- SC-AK-1052. Работа проходит ----------------------------------------------------------

say "SC-AK-1052 — сборка проходит" PASS 'pnpm exec nx build @rt-tools/ui-kit'
say "SC-AK-1052 — набор проб проходит" PASS 'pnpm test'
say "SC-AK-1052 — запрос к поднятому порту проходит" PASS 'curl -s http://localhost:6006/'
say "SC-AK-1052 — взгляд на слушателей проходит" PASS 'lsof -i :6006'
say "SC-AK-1052 — коммит со словом о сервере проходит" PASS 'git commit -m "чинит подъём serve"'
say "SC-AK-1052 — заметка о поднятом проходит" PASS 'echo "npm run dev поднимает владелец"'
say "SC-AK-1052 — снятие процесса по образцу проходит" PASS 'pkill -f "nx serve admin"'

# --- SC-AK-1053. Отказ называет адреса поднятых -------------------------------------------

reason="$(input_cmd 'nx serve admin' Bash "$tree" \
    | RT_STANDS='витрина http://localhost:6006' "$HOOKS/dev-server-guard.sh" 2>&1 >/dev/null)"
if printf '%s' "$reason" | grep -q 'localhost:6006'; then got="есть"; else got="нет"; fi
report "SC-AK-1053 — отказ называет адрес поднятого" "$got" "есть"

reason="$(input_cmd 'nx serve admin' Bash "$tree" | "$HOOKS/dev-server-guard.sh" 2>&1 >/dev/null)"
if [ -n "$reason" ]; then got="есть"; else got="нет"; fi
report "SC-AK-1053 — без названных адресов отказ остаётся" "$got" "есть"

# --- SC-AK-1054. Готовая настройка запуска ------------------------------------------------

named() {
    jq -n --arg n "$1" '{session_id:"tests",tool_name:"mcp__webstorm__execute_run_configuration",
        tool_input:{configurationName:$n}}'
}

conf() {
    local label="$1" want="$2" got
    if named "$3" | "$HOOKS/dev-server-guard.sh" >/dev/null 2>&1; then got="PASS"; else got="DENY"; fi
    report "$label" "$got" "$want"
}

conf "SC-AK-1054 — настройка с именем подъёма отбита" DENY 'serve admin'
conf "SC-AK-1054 — настройка «start» отбита" DENY 'start'
conf "SC-AK-1054 — перезапуск не считается подъёмом" PASS 'restart runner'
conf "SC-AK-1054 — настройка сборки проходит" PASS 'build ui-kit'

from_file() {
    jq -n --arg f "$1" '{session_id:"tests",tool_name:"mcp__webstorm__execute_run_configuration",
        tool_input:{filePath:$f}}'
}
if from_file 'package.json' | "$HOOKS/dev-server-guard.sh" >/dev/null 2>&1; then got="PASS"; else got="DENY"; fi
report "SC-AK-1054 — безымянный запуск из описи отбит" "$got" "DENY"
if from_file 'tools/probe.mjs' | "$HOOKS/dev-server-guard.sh" >/dev/null 2>&1; then got="PASS"; else got="DENY"; fi
report "SC-AK-1054 — безымянный запуск чужого файла проходит" "$got" "PASS"

# --- SC-AK-1055. Вложенная команда разбирается --------------------------------------------

nested() {
    jq -n --arg c "$1" '{session_id:"tests",tool_name:"mcp__webstorm__execute_tool",
        tool_input:{command:$c}}'
}
if nested 'runTerminalCommand --command "nx serve admin"' | "$HOOKS/dev-server-guard.sh" >/dev/null 2>&1; then
    got="PASS"
else
    got="DENY"
fi
report "SC-AK-1055 — подъём внутри обёртки отбит" "$got" "DENY"
if nested 'runTerminalCommand --command "nx build ui-kit"' | "$HOOKS/dev-server-guard.sh" >/dev/null 2>&1; then
    got="PASS"
else
    got="DENY"
fi
report "SC-AK-1055 — сборка внутри обёртки проходит" "$got" "PASS"

suite_result "страж второго сервера разработки"
