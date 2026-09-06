#!/usr/bin/env bash
# Сценарии хука входа в заход: на запуске в контекст уезжают передача и карта хода.
#
# Хук ничего не отбивает — он печатает. Поэтому сценарии судят не решение, а вывод: что в нём
# стоит, чего в нём нет и не роняет ли хук запуск, когда читать нечего.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "хук входа в заход"

REPO="$(fixture_repo RT-1-probe)"
export CLAUDE_PROJECT_DIR="$REPO"
cleanup() { rm -rf "$REPO"; }
trap cleanup EXIT

mkdir -p "$REPO/.claude/handoff" "$REPO/.claude/rt-kit/defaults" "$REPO/.claude/skills/task-flow"
HANDOFF="$REPO/.claude/handoff/RT-1-probe.md"
MAP="$REPO/.claude/rt-kit/defaults/turn-map.md"

printf '# Передача\n\nПрошлый заход встал на пробе.\n' > "$HANDOFF"
printf '# Передача\n\nЭто чужая ветка.\n' > "$REPO/.claude/handoff/RT-2-alien.md"
cp "$DEFAULTS/turn-map.md" "$MAP"

# Хук читает свой профиль от каталога гардов пакета, а разложенной карты рядом с ним нет:
# фикстура кладёт её туда, куда смотрит второй адрес — каталог умолчаний дерева.
out_of() {
    "$HOOKS/turn-entry-load.sh" 2>/dev/null
}

has() {
    local got='нет'
    printf '%s' "$2" | grep -qF "$3" && got='есть'
    report "$1" "$got" "${4:-есть}"
}

OUT="$(out_of)"

has 'SC-AK-436 — передача прошлого захода приходит в контекст' "$OUT" 'Прошлый заход встал на пробе'
has 'SC-AK-437 — передача берётся по имени текущей ветки' "$OUT" 'Это чужая ветка' 'нет'
has 'SC-AK-439 — карта приходит тем же запуском, что и передача' "$OUT" '# Turn map'
has 'SC-AK-440 — карта называет обязательное действие состояния' "$OUT" 'finish the stage and mark it in the progress'
has 'SC-AK-441 — карта называет выходы хода' "$OUT" 'the window filled where there is no compaction'
has 'SC-AK-442 — карта берётся из ресурса, а не из разметки правила' "$OUT" 'States and mandatory actions'

# Передача ветки с папкой задачи лежит разделом её хода работы: он коммитится и едет в ветку,
# поэтому переживает переход на другую машину. Найдя раздел, вход файла вне дерева не читает —
# это одна и та же передача, и копия в файле старше.
mkdir -p "$REPO/docs/tasks/RT-1-probe"
printf '# Ход работы\n\n## Где стоим\n\n- **Состояние:** `этап-идёт`\n\n## Передача захода\n\nСостояние лежит в ходе работы.\n' \
    > "$REPO/docs/tasks/RT-1-probe/progress.md"
SECTION_OUT="$(out_of)"
has 'SC-AK-803 — передача из хода работы приходит в контекст' "$SECTION_OUT" 'Состояние лежит в ходе работы'
has 'SC-AK-803 — файл вне дерева при этом не читается' "$SECTION_OUT" 'Прошлый заход встал на пробе' 'нет'
has 'SC-AK-803 — вход называет, где раздел лежит' "$SECTION_OUT" 'docs/tasks/RT-1-probe/progress.md'
rm -rf "$REPO/docs/tasks/RT-1-probe"

# Правило в дереве есть и переписано до неузнаваемости: карта от этого не меняется — она лежит
# своим файлом, а не вынимается разбором.
printf '# Ведение работы\n\nТаблицы состояний здесь больше нет.\n' > "$REPO/.claude/skills/task-flow/SKILL.md"
has 'SC-AK-442 — переписанное правило карту не ломает' "$(out_of)" 'finish the stage and mark it in the progress'

# SC-AK-443 — предел размера карты. Судит его проверка дерева, а не хук: здесь проверяется, что
# карта, которую хук кладёт в контекст, эту проверку проходит.
SIZE="$(wc -c < "$MAP" | tr -d ' ')"
if [ "$SIZE" -lt 6144 ]; then
    report 'SC-AK-443 — карта короче объявленного предела' 'короче' 'короче'
else
    report 'SC-AK-443 — карта короче объявленного предела' "$SIZE" 'короче 6144'
fi

# SC-AK-444 — вход подаётся на всех четырёх запусках. Род запуска хук не спрашивает вовсе:
# объявлен он на четыре матчера сразу, и вывод от рода не зависит. Проверяется это тем, что
# при любом входе на стандартном потоке вывод один и тот же.
FIRST="$(printf '{"hook_event_name":"SessionStart","source":"startup"}' | out_of)"
COMPACT="$(printf '{"hook_event_name":"SessionStart","source":"compact"}' | out_of)"
if [ "$FIRST" = "$COMPACT" ] && [ -n "$FIRST" ]; then
    report 'SC-AK-444 — вход одинаков на первом запуске и после сжатия' 'одинаков' 'одинаков'
else
    report 'SC-AK-444 — вход одинаков на первом запуске и после сжатия' 'разный' 'одинаков'
fi

# SC-AK-438 — передачи нет, и вход об этом молчит.
mv "$HANDOFF" "$HANDOFF.off"
OUT_NO_HANDOFF="$(out_of)"
has 'SC-AK-438 — передачи нет: о ней в контексте ни строки' "$OUT_NO_HANDOFF" 'HANDOVER OF THE PREVIOUS SESSION' 'нет'
has 'SC-AK-438 — карта при этом приходит' "$OUT_NO_HANDOFF" '# Turn map'
mv "$HANDOFF.off" "$HANDOFF"

# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: нечитаемая передача и отсутствующая карта запуск не отбивают.
chmod 000 "$HANDOFF"
OUT_UNREADABLE="$(out_of)"
CODE_UNREADABLE=$?
chmod 644 "$HANDOFF"
has 'SC-AK-445 — нечитаемая передача: о ней ни строки' "$OUT_UNREADABLE" 'HANDOVER OF THE PREVIOUS SESSION' 'нет'
has 'SC-AK-445 — карта при нечитаемой передаче приходит' "$OUT_UNREADABLE" '# Turn map'
report 'SC-AK-445 — нечитаемая передача запуска не отбивает' "$CODE_UNREADABLE" '0'

mv "$MAP" "$MAP.off"
OUT_NO_MAP="$(out_of)"
CODE_NO_MAP=$?
has 'SC-AK-446 — карты нет: о ней ни строки' "$OUT_NO_MAP" '# Turn map' 'нет'
has 'SC-AK-446 — передача при этом приходит' "$OUT_NO_MAP" 'Прошлый заход встал на пробе'
report 'SC-AK-446 — отсутствующая карта запуска не отбивает' "$CODE_NO_MAP" '0'

# Ни передачи, ни карты: вывод пуст, код нулевой. Хук, промолчавший с ненулевым кодом, читается
# как отбитый запуск.
mv "$HANDOFF" "$HANDOFF.off"
OUT_EMPTY="$(out_of)"
CODE_EMPTY=$?
report 'SC-AK-446 — без обеих частей вывод пуст' "${#OUT_EMPTY}" '0'
report 'SC-AK-446 — без обеих частей код нулевой' "$CODE_EMPTY" '0'
mv "$HANDOFF.off" "$HANDOFF"
mv "$MAP.off" "$MAP"

suite_result "хук входа в заход"
