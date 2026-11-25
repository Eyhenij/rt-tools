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

# Блок команды `/night`, как он стоит, обеими оболочками: сессия зовёт его из своей, и она бывает zsh.
# Прошлая ночь своей границей и разрешением не живёт.
NIGHT_WORDS='<the boundary in the owner words>'
NIGHT_AT='<ГГГГ-ММ-ДДTЧЧ:ММ>'
NIGHT_SAID='<the owner words, or нет>'
night_run() {
    W="$1" M="$2" A="$3" awk -v w="$NIGHT_WORDS" -v m="$NIGHT_AT" -v a="$NIGHT_SAID" '
        $0 == w { print ENVIRON["W"]; next }
        $0 == m { print ENVIRON["M"]; next }
        $0 == a { print ENVIRON["A"]; next }
        { print }' "$NIGHT_BLOCK" > "$NIGHT_TREE/run.sh"
    (cd "${4:-$NIGHT_TREE}" && env -u CLAUDE_PROJECT_DIR -u RT_HANDOFF_DIR "$NIGHT_SHELL" "$NIGHT_TREE/run.sh" 2>&1)
}
night_head() { grep -hE '^(Граница|Автономно до|Разрешено):' "$NIGHT_TREE/$HAND/$1-ночь.md" 2>/dev/null | tr '\n' ' '; }
night_files() { ls "$NIGHT_TREE/$HAND" 2>/dev/null | grep -c "$1"; }
night_fresh() {
    rm -rf "$NIGHT_TREE/.claude" "$NIGHT_TREE/elsewhere"
    mkdir -p "$NIGHT_TREE/$HAND"
}
night_far() { TZ=Asia/Vladivostok node -e "const d = new Date(Date.now() + $1 * 60000); const p = (n) => String(n).padStart(2, '0'); console.log(\`\${d.getFullYear()}-\${p(d.getMonth() + 1)}-\${p(d.getDate())}T\${p(d.getHours())}:\${p(d.getMinutes())}\`)"; }
night_block_cases() {
    local at="menu: SC-AK-1931 [${NIGHT_SHELL##*/}]" today bad
    today="$(date +%Y-%m-%d)"
    local new='Граница: до 9 Автономно до: 2199-03-02T08:00 Разрешено: нет '
    HAND=.claude/handoff
    rm -rf "$NIGHT_TREE/.claude"
    night_run 'до "8 утра" `x` $HOME' 2199-01-02T08:00 "сам сливай, 'всё'
PR в main не открывай \\n" >/dev/null
    report "$at — список заведён и без каталога, слова владельца целиком и дословно" \
        "$(night_head "$today")" "Граница: до \"8 утра\" \`x\` \$HOME Автономно до: 2199-01-02T08:00 Разрешено: «сам сливай, 'всё' PR в main не открывай \\n» "
    printf '| RT-1 | строка таблицы |\nРазрешено: в строке после таблицы\n' >> "$NIGHT_TREE/$HAND/$today-ночь.md"
    report "$at — прерванная ночь без новых слов продолжается и не переписывается" \
        "$(night_run "$NIGHT_WORDS" "$NIGHT_AT" "$NIGHT_SAID" | cut -d, -f1) $(night_head "$today" | cut -d' ' -f1-3)" 'продолжается до 2199-01-02T08:00 Граница: до "8'
    mkdir -p "$NIGHT_TREE/sub"
    night_run 'до 9' 2199-03-02T08:00 нет "$NIGHT_TREE/sub" >/dev/null
    report "$at — новые слова до старой границы меняют голову, строки остаются, из подкаталога тоже" \
        "$(night_head "$today")$(grep -c 'строка таблицы' "$NIGHT_TREE/$HAND/$today-ночь.md") $(find "$NIGHT_TREE/sub" -name '*ночь*' | wc -l | tr -d ' ')" \
        "${new}Разрешено: в строке после таблицы 1 0"
    night_list "$NIGHT_TREE/$HAND" 2001-01-02T08:00 "$today"
    night_run 'до 9' 2199-03-02T08:00 нет >/dev/null
    report "$at — вторая ночь того же дня получает свою границу и своё разрешение" "$(night_head "$today")" "$new"
    report "$at — прошлый список того же дня отложен, а не стёрт" "$(night_files 'ночь-до-')" "1"
    night_fresh
    night_list "$NIGHT_TREE/$HAND" 2199-01-02T08:00 2000-01-01
    night_list "$NIGHT_TREE/$HAND" 2001-01-02T08:00 2000-01-02
    night_run 'до 9' 2199-03-02T08:00 нет >/dev/null
    report "$at — судится новейший список, а не старый с границей впереди" "$(night_head "$today")" "$new"
    night_fresh
    mkdir "$NIGHT_TREE/$HAND/inner"
    night_list "$NIGHT_TREE/$HAND/inner" 2199-01-02T08:00 2198-01-01
    night_list "$NIGHT_TREE/$HAND" 2001-01-02T08:00 2199-01-01
    night_run 'до 9' 2199-03-02T08:00 нет >/dev/null
    report "$at — список с поздним именем отложен, вложенный не читается: новейшим остаётся новый" "$(night_files 'ночь.md') $(night_head "$today")" "1 $new"
    for bad in 'до слияния' 2199-13-02T08:00 '2199-01-02T08:00 (по Москве)' 9 2199-01-02; do
        night_fresh
        night_list "$NIGHT_TREE/$HAND" "$bad" 2001-01-01
        night_run 'до 9' 2199-03-02T08:00 нет >/dev/null
        report "$at — список с границей «${bad}» ночью не считается" "$(night_head "$today")" "$new"
    done
    night_fresh
    printf 'Автономно до: 2001-01-02T08:00\nАвтономно до: 2199-01-02T08:00\n\n| RT-1 |\nАвтономно до: 2199-01-02T08:00\n' > "$NIGHT_TREE/$HAND/2001-01-01-ночь.md"
    night_run 'до 9' 2199-03-02T08:00 нет >/dev/null
    report "$at — судится первая граница головы, строка после таблицы границей не считается" "$(night_head "$today")" "$new"
    for bad in 'до утра' 2001-01-02T08:00 2199-13-02T08:00 2199-01-02T25:00 2199-01-32T08:00 '2199-01-02T08:00 (по Москве)' "$NIGHT_AT" ''; do
        rm -rf "$NIGHT_TREE/.claude"
        report "$at — граница «${bad}» списка не заводит и названа" \
            "$(night_run 'до 9' "$bad" нет | grep -c 'список не создан') $(night_files .)" "1 0"
    done
    report "$at — незаполненные слова списка не заводят" \
        "$(night_run "$NIGHT_WORDS" 2199-03-02T08:00 нет | grep -c 'список не создан') $(night_run 'до 9' 2199-03-02T08:00 "$NIGHT_SAID" | grep -c 'список не создан') $(night_files .)" "1 1 0"
    mkdir -p "$NIGHT_TREE/.claude/rt-kit"
    printf 'RT_HANDOFF_DIR=elsewhere\n' > "$NIGHT_TREE/.claude/rt-kit/project.sh"
    HAND=elsewhere
    night_run 'до 9' 2199-03-02T08:00 нет "$NIGHT_TREE/sub" >/dev/null
    report "$at — каталог списка взят из профиля дерева" "$(night_files 'ночь.md')" "1"
    HAND=.claude/handoff
    rm -rf "$NIGHT_TREE/.claude" "$NIGHT_TREE/elsewhere"
    mkdir -p "$NIGHT_TREE/.claude"
    : > "$NIGHT_TREE/.claude/handoff"
    report "$at — отказ записи успехом не назван" \
        "$(night_run 'до 9' 2199-03-02T08:00 нет | grep -c '^ночь до') $(night_run 'до 9' 2199-03-02T08:00 нет | grep -c 'список не записан')" "0 1"
    # Граница в минутах по местному времени: зона далеко от UTC отличает местные часы от UTC.
    rm -rf "$NIGHT_TREE/.claude"
    report "$at — граница через пять минут — впереди" "$(TZ=Asia/Vladivostok night_run 'до 9' "$(night_far 5)" нет | grep -c '^ночь до')" "1"
    rm -rf "$NIGHT_TREE/.claude"
    report "$at — граница пять минут назад — прошла" "$(TZ=Asia/Vladivostok night_run 'до 9' "$(night_far -5)" нет | grep -c 'список не создан')" "1"
    rm -rf "$NIGHT_TREE/.claude" "$NIGHT_TREE/sub"
}
NIGHT_TREE="$(mktemp -d)"
git init -q "$NIGHT_TREE" >/dev/null 2>&1
NIGHT_BLOCK="$NIGHT_TREE/block.sh"
awk '/^```bash$/ { inside = 1; text = ""; next } /^```$/ { if (inside && text ~ /Автономно до: %s/) printf "%s", text; inside = 0; next } inside { text = text $0 "\n" }' \
    "$TESTS/../assets/commands/night.md" > "$NIGHT_BLOCK"
report "menu: SC-AK-1931 — блок списка взят из команды" "$(grep -c 'Автономно до: %s' "$NIGHT_BLOCK")" "1"
for night_shell in bash zsh; do
    NIGHT_SHELL="$(command -v "$night_shell")" || continue
    night_block_cases
done
rm -rf "$NIGHT_TREE"

[ -n "${TE_NIGHT_ALONE:-}" ] && suite_result "автономная сессия"
