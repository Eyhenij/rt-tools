#!/usr/bin/env bash
# Сценарии стража списка и переключения браузеров.
#
# Профиль дерева закреплён, и выбирать не из чего: перечень отдаёт родовые неустойчивые имена, а
# выбор из них попадает в профиль, где никто не входил. Поэтому страж отбивает и перечень, и
# переключение, а признак закреплённого устройства называет в самом отказе — отказ без действия
# обходят, а не выполняют.
#
# Обратная сторона проверяется тем же набором: дерево, не назвавшее профиля ни переменной, ни
# файлом, получает пропуск. Предложить взамен нечего, и слепой отказ увёл бы работу в тупик.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "страж списка браузеров"

tree="$(mktemp -d)"
cleanup() { rm -rf "$tree"; }
trap cleanup EXIT

mkdir -p "$tree/.claude/hooks" "$tree/.claude/rt-kit"
cp "$HOOKS/browser-device-id.sh" "$tree/.claude/hooks/browser-device-id.sh"
export CLAUDE_PROJECT_DIR="$tree"

# Вход PreToolUse вызова расширения: страж содержимое не разбирает — он судит само событие.
call() {
    jq -n --arg t "$1" '{session_id:"tests",tool_name:$t,tool_input:{}}'
}

say() {
    local label="$1" want="$2" tool="$3" got
    if call "$tool" | "$HOOKS/browser-guard-no-listing.sh" >/dev/null 2>&1; then got="PASS"; else got="DENY"; fi
    report "$label" "$got" "$want"
}

# --- SC-AK-1047. Перечень и переключение отбиты, отказ называет признак -------------------

RT_BROWSER_DEVICE_ID=профиль-дерева \
    say "SC-AK-1047 — перечень браузеров отбит" DENY mcp__claude-in-chrome__list_connected_browsers
RT_BROWSER_DEVICE_ID=профиль-дерева \
    say "SC-AK-1047 — переключение браузера отбито" DENY mcp__claude-in-chrome__switch_browser

reason="$(call mcp__claude-in-chrome__list_connected_browsers \
    | RT_BROWSER_DEVICE_ID=профиль-дерева "$HOOKS/browser-guard-no-listing.sh" 2>&1 >/dev/null)"
if printf '%s' "$reason" | grep -q 'профиль-дерева'; then got="есть"; else got="нет"; fi
report "SC-AK-1047 — отказ называет закреплённый признак" "$got" "есть"

# Признак берётся и из файла дерева, не только из переменной: страж зовёт того же помощника,
# каким пользуются остальные браузерные стражи.
printf 'профиль-из-файла\n' > "$tree/.claude/rt-kit/browser-device-id"
reason="$(call mcp__claude-in-chrome__switch_browser \
    | "$HOOKS/browser-guard-no-listing.sh" 2>&1 >/dev/null)"
if printf '%s' "$reason" | grep -q 'профиль-из-файла'; then got="есть"; else got="нет"; fi
report "SC-AK-1047 — признак берётся из файла дерева" "$got" "есть"

# --- SC-AK-1048. Без закреплённого профиля страж молчит -----------------------------------

rm -f "$tree/.claude/rt-kit/browser-device-id"
say "SC-AK-1048 — профиль не закреплён: перечень проходит" PASS mcp__claude-in-chrome__list_connected_browsers
say "SC-AK-1048 — профиль не закреплён: переключение проходит" PASS mcp__claude-in-chrome__switch_browser

suite_result "страж списка браузеров"
