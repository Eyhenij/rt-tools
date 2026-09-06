#!/usr/bin/env bash
# Сценарии проверки карты хода: обе формы записи состояний, забытое состояние и предел размера.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: карта хода"

TREE="$(mktemp -d)"
mkdir -p "$TREE/tools" "$TREE/.claude/rt-kit/defaults" "$TREE/.claude/skills/task-flow"
cp "$CHECKS/check-turn-map.mjs" "$TREE/tools/"

cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT

# Правило объявляет состояния таблицей — так они и стоят в пакете. Тем же видом строки списка
# в правиле записаны паттерны: их проверка состояниями считать не должна.
rule() {
    {
        printf -- '---\nname: task-flow\nkind: rule\n---\n\n# Ведение работы\n\n'
        printf '| Состояние | Вход | Обязательное действие |\n'
        printf '| --- | --- | --- |\n'
        for state in "$@"; do
            printf '| `%s` | вход | действие |\n' "$state"
        done
        printf '\n## Паттерны\n\n- `task-flow-start` — начало работы.\n'
    } > "$TREE/.claude/skills/task-flow/SKILL.md"
}

# Карта списком: та форма, ради которой из текста ушли пробелы выравнивания.
map_list() {
    {
        printf '# Карта хода\n\n## Состояния и обязательные действия\n\n'
        for state in "$@"; do
            printf -- '- `%s` — действие; ведёт `task-flow-start`\n' "$state"
        done
        printf '\n## Чем ход кончается\n\n'
        printf -- '- **вопрос владельцу, ответа на который в правилах нет** — вопрос задан\n'
        printf -- '- **отказ гарда** — отказ назван владельцу\n'
        printf -- '- **заполненное окно там, где сжатия нет** — передача написана\n'
        printf -- '- **работа отдана, и следующая начата** — PR открыт\n'
    } > "$TREE/.claude/rt-kit/defaults/turn-map.md"
}

# Карта таблицей: прежняя форма остаётся законной — дерево, которое её не переписывало,
# работает как раньше.
map_table() {
    {
        printf '# Карта хода\n\n## Состояния и обязательные действия\n\n'
        printf '| Состояние | Обязательное действие |\n| --- | --- |\n'
        for state in "$@"; do
            printf '| `%s` | действие |\n' "$state"
        done
        printf '\n## Чем ход кончается\n\n'
        printf -- '- **вопрос владельцу, ответа на который в правилах нет** — вопрос задан\n'
        printf -- '- **отказ гарда** — отказ назван владельцу\n'
        printf -- '- **заполненное окно там, где сжатия нет** — передача написана\n'
        printf -- '- **работа отдана, и следующая начата** — PR открыт\n'
    } > "$TREE/.claude/rt-kit/defaults/turn-map.md"
}

run() { (cd "$TREE" && node tools/check-turn-map.mjs 2>&1); }

rule этап-идёт влито
map_list этап-идёт влито
out="$(run)"
case "$out" in
    *'сошлось'*) report 'SC-AK-643 — состояния, записанные списком, проверка читает' 'сошлось' 'сошлось' ;;
    *) report 'SC-AK-643 — состояния, записанные списком, проверка читает' 'расхождения' 'сошлось' ;;
esac

map_table этап-идёт влито
out="$(run)"
case "$out" in
    *'сошлось'*) report 'SC-AK-644 — прежняя форма таблицей читается по-прежнему' 'сошлось' 'сошлось' ;;
    *) report 'SC-AK-644 — прежняя форма таблицей читается по-прежнему' 'расхождения' 'сошлось' ;;
esac

map_list этап-идёт
out="$(run)"
case "$out" in
    *'влито: состояние объявлено правилом и забыто в карте'*)
        report 'SC-AK-645 — состояние, забытое в карте, названо поимённо' 'названо' 'названо' ;;
    *) report 'SC-AK-645 — состояние, забытое в карте, названо поимённо' 'молчит' 'названо' ;;
esac

# Список паттернов в правиле записан тем же видом, что и состояние в карте. Прочитанный как
# состояние, он дал бы расхождение на ровном месте — и оно бы держалось, пока правило зовёт
# свои паттерны по именам.
rule этап-идёт влито
map_list этап-идёт влито
out="$(run)"
case "$out" in
    *'task-flow-start: состояние'*)
        report 'SC-AK-646 — список паттернов правила состоянием не считается' 'считается' 'не считается' ;;
    *) report 'SC-AK-646 — список паттернов правила состоянием не считается' 'не считается' 'не считается' ;;
esac

# SC-AK-905 — выходы хода читаются и под английскими именами: карта пакета переведена, а карта
# дерева со своими русскими именами сходится по-прежнему (случаи выше).
map_list_en() {
    {
        printf '# Turn map\n\n## States and mandatory actions\n\n'
        for state in "$@"; do
            printf -- '- `%s` — action; leads `task-flow-start`\n' "$state"
        done
        printf '\n## What a turn ends with\n\n'
        printf -- '- **a question to the owner that the rules do not answer** — asked\n'
        printf -- '- **a guard refusal** — named to the owner\n'
        printf -- '- **the window filled where there is no compaction** — handover written\n'
        printf -- '- **work handed over, and the next one started** — PR open\n'
    } > "$TREE/.claude/rt-kit/defaults/turn-map.md"
}

rule этап-идёт влито
map_list_en этап-идёт влито
out="$(run)"
case "$out" in
    *'сошлось'*) report 'SC-AK-905 — выходы хода под английскими именами читаются' 'сошлось' 'сошлось' ;;
    *) report 'SC-AK-905 — выходы хода под английскими именами читаются' 'расхождения' 'сошлось' ;;
esac

suite_result "проверки: карта хода"
