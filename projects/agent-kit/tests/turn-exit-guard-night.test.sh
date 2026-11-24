#!/usr/bin/env bash
# Сценарии автономной сессии через хук: до границы «Автономно до:» новейшего списка к утру вместо
# меню владельцу названо умолчание. Чтение границы и слова умолчания стоят в
# `turn-exit-guard.test.sh`. Файл подключается оттуда и берёт его обвязку; бегун пакета зовёт его и
# сам по себе — тогда обвязку он поднимает сам.
if [ -z "${TESTS:-}" ]; then
    . "$(dirname "${BASH_SOURCE[0]}")/turn-exit-lib.sh"
    TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    TE_NIGHT_ALONE=1
    echo "автономная сессия"
    git -C "$REPO" -c user.name=t -c user.email=t@t -c commit.gpgsign=false commit -q --allow-empty -m 'основание' >/dev/null 2>&1
fi

# Граница — местное время: под UTC случай ловит чтение как UTC.
night_local="$(cd "$TESTS" && TZ=Asia/Vladivostok node --input-type=module 2>&1 <<'JS'
import { nightBoundary } from '../assets/checks/flow-verdict.mjs';
const at = (hour) => new Date(2026, 10, 24, hour, 0);
const list = 'Автономно до: 2026-11-24T08:00\n';
console.log(`${nightBoundary(list, at(7))} ${nightBoundary(list, at(9))}`);
JS
)"
report "menu: SC-AK-1930 — граница читается местным временем" "$night_local" "2026-11-24T08:00 null"

# Простой после отказа движка: граница берётся из новейшего списка к утру.
engine_refused() { jq -c -n '{type:"user",message:{content:"Stop hook feedback:\nBLOCKED by turn-exit-guard: сценарий не кончен"}}'; }
IDLE="$(input_stop "$(transcript "$(say 'делай')" "$(edited)" "$(engine_refused)")")"
MENU="The one move is the owner's menu:"
HANDOFF="$REPO/.claude/handoff"
mkdir -p "$HANDOFF"
night_list() { printf '# Список к утру\n\nАвтономно до: %s\n' "$2" > "$1/$3-ночь.md"; }
expect_reason "menu: SC-AK-1930 — без списка к утру простой зовёт меню" "$IDLE" "$MENU"
night_list "$HANDOFF" 2001-01-02T08:00 2001-01-01
expect_reason "menu: SC-AK-1930 — прошедшая граница зовёт меню и через хук" "$IDLE" "$MENU"
night_list "$HANDOFF" 2199-01-02T08:00 2198-01-01
expect_reason "menu: SC-AK-1930 — граница впереди даёт умолчание через хук" "$IDLE" 'An autonomous session does not ask the owner before its boundary, 2199-01-02T08:00'
expect_reason "menu: SC-AK-1930 — умолчание называет новейший список" "$IDLE" '.claude/handoff/2198-01-01-ночь.md'
night_list "$HANDOFF" 2001-01-02T08:00 2199-01-01
expect_reason "menu: SC-AK-1930 — старый список с границей впереди не ночь" "$IDLE" "$MENU"
rm -f "$HANDOFF/2199-01-01-ночь.md"
mkdir "$HANDOFF/2199-01-02-ночь.md"
expect_reason "menu: SC-AK-1930 — нечитаемый список зовёт меню, а не роняет движок" "$IDLE" "$MENU"
rm -rf "$HANDOFF"
ELSEWHERE="$(mktemp -d)"
night_list "$ELSEWHERE" 2199-01-02T08:00 2198-01-01
RT_HANDOFF_DIR="$ELSEWHERE" expect_reason "menu: SC-AK-1930 — каталог списка из окружения, абсолютный тоже" "$IDLE" 'An autonomous session does not ask the owner'
rm -rf "$ELSEWHERE"

# Блок команды `/night`, как он стоит: прошлая ночь своей границей и разрешением не живёт.
NIGHT_TREE="$(mktemp -d)"
NIGHT_BLOCK="$NIGHT_TREE/block.sh"
awk '/^```bash$/ { inside = 1; text = ""; next } /^```$/ { if (inside && text ~ /Автономно до: %s/) printf "%s", text; inside = 0; next } inside { text = text $0 "\n" }' \
    "$TESTS/../assets/commands/night.md" > "$NIGHT_BLOCK"
report "menu: SC-AK-1931 — блок списка взят из команды" "$(grep -c 'Автономно до: %s' "$NIGHT_BLOCK")" "1"
night_run() {
    sed -e "s/^<ГГГГ-ММ-ДДTЧЧ:ММ>\$/$1/" -e "s/^<the owner words, or нет>\$/$2/" "$NIGHT_BLOCK" > "$NIGHT_TREE/run.sh"
    (cd "$NIGHT_TREE" && RT_HANDOFF_DIR=.claude/handoff bash run.sh 2>&1)
}
night_head() { grep -hE '^(Автономно до|Разрешено):' "$NIGHT_TREE/.claude/handoff/$1-ночь.md" 2>/dev/null | tr '\n' ' '; }
TODAY="$(date +%Y-%m-%d)"
night_run 2199-01-02T08:00 "сам сливай, 'всё'" >/dev/null
report "menu: SC-AK-1931 — список заведён и без каталога, апостроф в словах не ломает блок" \
    "$(night_head "$TODAY")" "Автономно до: 2199-01-02T08:00 Разрешено: «сам сливай, 'всё'» "
report "menu: SC-AK-1931 — прерванная ночь продолжается и не переписывается" \
    "$(night_run 2199-02-02T08:00 нет | cut -d: -f1) $(night_head "$TODAY")" "продолжается Автономно до: 2199-01-02T08:00 Разрешено: «сам сливай, 'всё'» "
night_list "$NIGHT_TREE/.claude/handoff" 2001-01-02T08:00 "$TODAY"
night_run 2199-03-02T08:00 нет >/dev/null
report "menu: SC-AK-1931 — вторая ночь того же дня получает свою границу и своё разрешение" \
    "$(night_head "$TODAY")" "Автономно до: 2199-03-02T08:00 Разрешено: «нет» "
report "menu: SC-AK-1931 — прошлый список того же дня отложен, а не стёрт" \
    "$(ls "$NIGHT_TREE/.claude/handoff" | grep -c 'ночь-до-')" "1"
rm -rf "$NIGHT_TREE/.claude"
mkdir -p "$NIGHT_TREE/.claude/handoff"
printf 'Граница: до слияния\n' > "$NIGHT_TREE/.claude/handoff/2001-01-01-ночь.md"
night_run 2199-03-02T08:00 нет >/dev/null
report "menu: SC-AK-1931 — список без границы ночью не считается" "$(night_head "$TODAY")" "Автономно до: 2199-03-02T08:00 Разрешено: «нет» "
rm -rf "$NIGHT_TREE/.claude"
for bad in 'до утра' 2001-01-02T08:00 2199-13-02T08:00 '<ГГГГ-ММ-ДДTЧЧ:ММ>'; do
    report "menu: SC-AK-1931 — граница «${bad}» списка не заводит и названа" \
        "$(night_run "$bad" нет | grep -c 'список не создан') $(ls "$NIGHT_TREE/.claude/handoff" 2>/dev/null | wc -l | tr -d ' ')" "1 0"
done
rm -rf "$NIGHT_TREE"

[ -n "${TE_NIGHT_ALONE:-}" ] && suite_result "автономная сессия"
