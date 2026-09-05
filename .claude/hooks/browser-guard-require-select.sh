#!/usr/bin/env bash
# rt-kit v0.24.0 · hooks/browser-guard-require-select.sh · c7fbbe5bdbd3 · правится надстройкой, не здесь
# rt-hook: PreToolUse mcp__claude-in-chrome__.*
# Требует: hooks/deny-tail.sh
# Гард свежести выбора браузера. PreToolUse на всех остальных вызовах расширения.
#
# ЗАЧЕМ ОН ЕСТЬ — отказ, из которого он вырос: расширение действует на тот браузер, который
# считает активным сейчас, и этот выбор ПЛЫВЁТ. Выбор, сделанный в начале сессии, не держится:
# после долгого перерыва на работу без браузера следующий же вызов открыл вкладку в другом
# профиле — молча. Гард на самом выборе такого не ловит: в этот момент выбор никто не вызывает,
# а тот, что был сделан раньше, был верным.
#
# Поэтому гард про СВЕЖЕСТЬ, а не про «выбирали ли вообще»:
#   - гард выбора ставит метку на каждом принятом выборе;
#   - каждый прошедший здесь вызов метку обновляет, поэтому непрерывная работа идёт свободно;
#   - как только метка старше окна, следующий вызов отбивается и требует выбрать заново.
#     Перерыв — это ровно то, когда выбор уплывает, поэтому перерыв гард и взводит.
#
# Выбор — один дешёвый повторяемый вызов, и повторить его стоит несравнимо меньше, чем попасть
# не в тот браузер.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: помощник не назвал профиль — пропуск.

# Своё имя в наблюдениях: отбой пишет общий хвост отказа, а не сам гард.
RT_GUARD_NAME=browser-guard-require-select

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

tool="$(rt_hook_tool)"
# У перечисления, переключения и самого выбора свои гарды.
case "$tool" in
    *list_connected_browsers|*switch_browser|*select_browser) exit 0 ;;
esac

ttl=300

sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
marker="${TMPDIR:-/tmp}/claude-browser-guard/${sid}"

# Общий хвост отказа: два законных хода и законная форма обхода, если она у отказа есть. Файл
# может быть не разложен — тогда хвоста нет, а причина отказа остаётся прежней.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

# Причина отказа идёт полем ответа, а не в поток ошибок.
#
# Сказанного в поток ошибок исполнитель не видит: до него доходит «No stderr output» без единого слова
# о том, что случилось, и подряд падающие вызовы браузера читаются как поломка расширения. Получаса на
# поиск того, что гард уже знает и говорит, — цена одного выбранного канала.
deny() {
    reason="$1 $(rt_deny_tail)"
    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$1"
    exit 0
}

if [ ! -f "$marker" ]; then
    deny "В этой сессии браузер не выбран. Вызови выбор браузера с профилем ${device_id} до любого другого вызова."
fi

now="$(date +%s)"
stamped="$(stat -f %m "$marker" 2>/dev/null || stat -c %Y "$marker" 2>/dev/null || echo 0)"
age=$(( now - stamped ))

if [ "$age" -gt "$ttl" ]; then
    rm -f "$marker" 2>/dev/null
    deny "Последний выбор браузера был ${age} с назад (предел ${ttl} с) — на таких перерывах активный браузер расширения уплывает, и это может быть уже не закреплённый профиль. Вызови выбор с профилем ${device_id} заново и повтори."
fi

: >"$marker" 2>/dev/null
exit 0
