#!/usr/bin/env bash
# rt-kit v0.19.0 · hooks/browser-guard-no-listing.sh · 282a7fc5c94a · правится надстройкой, не здесь
# rt-hook: PreToolUse mcp__claude-in-chrome__(list_connected_browsers|switch_browser)
# Требует: hooks/deny-tail.sh
# Гард перечисления и переключения браузеров. PreToolUse.
#
# Сессии проекта живут в одном закреплённом профиле. Перечисление и переключение отдают общие
# неустойчивые имена, которые не опознают ничего, а выбор из них приводит в профиль без входа —
# поэтому единственный поддержанный путь — выбор по закреплённому идентификатору.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: помощник не назвал профиль — пропуск. Гард, который не может назвать
# нужный профиль, ничего не предлагает взамен, и слепой отказ только заводил бы работу в тупик.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

cat >/dev/null 2>&1

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

# Общий хвост отказа: два законных хода и законная форма обхода, если она у отказа есть. Файл
# может быть не разложен — тогда хвоста нет, а причина отказа остаётся прежней.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

echo "Не перечисляй и не переключай браузеры. Вызови выбор браузера с профилем ${device_id} — единственным, где сделан вход. $(rt_deny_tail)" >&2
exit 2
