#!/usr/bin/env bash
# Сценарии хука передачи: перед сжатием контекста на диске оказывается свежая передача.
#
# Хук ничего не отбивает — он пишет файл. Поэтому сценарии судят не решение, а то, что легло на
# диск: есть ли файл, что в нём стоит и не роняет ли хук сжатие на битом входе.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "хук передачи"

REPO="$(fixture_repo RT-1-probe)"
export CLAUDE_PROJECT_DIR="$REPO"
cleanup() { rm -rf "$REPO"; }
trap cleanup EXIT

TASK="$REPO/docs/tasks/RT-1-probe"
mkdir -p "$TASK"
HANDOFF="$REPO/.claude/handoff/RT-1-probe.md"
PROGRESS="$TASK/progress.md"

printf '# Ход работы\n\n## Где стоим\n\n- **Состояние:** `этап-идёт`\n- **Этап:** 2 из 5 — хук\n- **Следующий шаг:** сценарии хука\n- **PR:** #1396, черновик\n' > "$TASK/progress.md"

compact_in() {
    jq -n --arg d "$REPO" --arg t "${1:-auto}" \
        '{session_id:"tests",hook_event_name:"PreCompact",trigger:$t,cwd:$d}'
}

# Ход работы возвращается к исходному перед каждым прогоном: передача ложится его разделом, и
# прошлый прогон оставил бы в нём свой.
PROGRESS_TEXT="$(cat "$PROGRESS")"

# Запуск хука и чтение того, что он положил. Решения у хука нет — судится записанное.
run_hook() {
    rm -f "$HANDOFF"
    [ -f "$PROGRESS" ] && printf '%s\n' "$PROGRESS_TEXT" > "$PROGRESS"
    printf '%s' "$1" | "$HOOKS/handoff-write.sh" >/dev/null 2>&1
}

# Передача ветки с папкой задачи стоит разделом её хода работы, а не своим файлом вне дерева.
has_line() {
    run_hook "$2"
    if [ -f "$PROGRESS" ] && grep -qF "$3" "$PROGRESS" 2>/dev/null; then
        report "$1" 'есть' 'есть'
    else
        report "$1" 'нет' 'есть'
    fi
}

# То же для запасного пути: файл вне дерева.
has_file_line() {
    run_hook "$2"
    if [ -f "$HANDOFF" ] && grep -qF "$3" "$HANDOFF" 2>/dev/null; then
        report "$1" 'есть' 'есть'
    else
        report "$1" 'нет' 'есть'
    fi
}

has_line 'состояние работы попадает в передачу' "$(compact_in auto)" 'этап-идёт'
has_line 'следующий шаг попадает в передачу' "$(compact_in auto)" 'сценарии хука'
has_line 'открытая заявка попадает в передачу' "$(compact_in auto)" '#1396'
has_line 'ветка названа' "$(compact_in auto)" 'RT-1-probe'
has_line 'ручное сжатие пишет передачу так же' "$(compact_in manual)" 'этап-идёт'
has_line 'род сжатия назван в заголовке' "$(compact_in manual)" 'manual'

# Работа вне папки задачи: состояние взять неоткуда, но ветка и дерево известны. Передача без
# состояния лучше отсутствующей — заход после сжатия хотя бы знает, где он.
mv "$TASK/progress.md" "$TASK/progress.off"
has_file_line 'работа вне папки задачи передачу тоже получает' "$(compact_in auto)" 'This branch has no task folder'
mv "$TASK/progress.off" "$TASK/progress.md"

# Раздел передачи один: второе сжатие переписывает прежний, а не дописывает второй.
run_hook "$(compact_in auto)"
run_hook "$(compact_in auto)"
report 'второе сжатие раздел не удваивает' \
    "$(grep -c '^## Handover of the session' "$PROGRESS" 2>/dev/null)" 1
report 'раздел «Где стоим» остаётся на месте' \
    "$(grep -c '^## Где стоим' "$PROGRESS" 2>/dev/null)" 1

# SC-AK-804: та же выемка под локалью с национальными настройками. Сравнение строк по правилам
# локали на этой системе считает разные кириллические заголовки равными, и раздел «Где стоим»
# уезжал вместе с прежней передачей — виден промах был только на прогоне конвейера, где локаль
# объявлена, а у исполнителя с `C.UTF-8` набор оставался зелёным.
rm -f "$HANDOFF"
printf '%s\n' "$PROGRESS_TEXT" > "$PROGRESS"
printf '%s' "$(compact_in auto)" | LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 "$HOOKS/handoff-write.sh" >/dev/null 2>&1
report 'SC-AK-804: под локалью с национальными настройками «Где стоим» остаётся' \
    "$(grep -c '^## Где стоим' "$PROGRESS" 2>/dev/null)" 1
report 'SC-AK-804: под той же локалью передача ложится разделом' \
    "$(grep -c '^## Handover of the session' "$PROGRESS" 2>/dev/null)" 1
# Ход работы с папкой задачи файла вне дерева не заводит вовсе: второй записи об одном и том же
# не бывает.
run_hook "$(compact_in auto)"
if [ -f "$HANDOFF" ]; then
    report 'файл вне дерева при папке задачи не пишется' 'есть' 'нет'
else
    report 'файл вне дерева при папке задачи не пишется' 'нет' 'нет'
fi

# Отсоединённая голова: имени у ветки нет, а всё остальное дерево знает целиком. Прежде хук
# выходил здесь нулём, и сжатие приходило без передачи — заход после него начинал с пустого
# места, и молчание было полным. Дерево тут своё: отсоединиться можно только там, где коммит
# уже есть.
DREPO="$(fixture_repo_branched main RT-1-probe)"
git -C "$DREPO" checkout -q --detach 2>/dev/null
short="$(git -C "$DREPO" rev-parse --short HEAD 2>/dev/null)"
DETACHED="$DREPO/.claude/handoff/detached-$short.md"
printf '%s' "$(jq -n --arg d "$DREPO" '{session_id:"tests",hook_event_name:"PreCompact",trigger:"auto",cwd:$d}')" \
    | "$HOOKS/handoff-write.sh" >/dev/null 2>&1

detached_line() {
    if [ -f "$DETACHED" ] && grep -qF "$2" "$DETACHED" 2>/dev/null; then
        report "$1" 'есть' 'есть'
    else
        report "$1" 'нет' 'есть'
    fi
}

if [ -f "$DETACHED" ]; then
    report 'на отсоединённой голове передача пишется' 'есть' 'есть'
else
    report 'на отсоединённой голове передача пишется' 'нет' 'есть'
fi
detached_line 'передача называет голову вместо имени ветки' 'a detached head'
detached_line 'передача говорит, как её искать' 'by the last record of the directory'
rm -rf "$DREPO"

# SC-AK-910 — ключи хода работы читаются под английским именем: образец папки задачи в пакете
# английский, а папки дерева до перевода русские, и передача собирается одинаково с обоих.
ENGLISH_PROGRESS='# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 5 — the hook
- **Next step:** the scenarios of the hook
- **PR:** #1396, a draft'
RUSSIAN_PROGRESS="$PROGRESS_TEXT"
PROGRESS_TEXT="$ENGLISH_PROGRESS"
has_line 'SC-AK-910 — состояние из английского ключа попадает в передачу' "$(compact_in auto)" 'этап-идёт'
has_line 'SC-AK-910 — этап из английского ключа попадает в передачу' "$(compact_in auto)" '2 of 5'
has_line 'SC-AK-910 — следующий шаг из английского ключа попадает в передачу' "$(compact_in auto)" 'the scenarios of the hook'
PROGRESS_TEXT="$RUSSIAN_PROGRESS"

# Незакоммиченное берётся из дерева, а не из хода работы: оно там устаревает первым.
printf 'проба\n' > "$REPO/probe.txt"
has_line 'незакоммиченное берётся из дерева' "$(compact_in auto)" 'probe.txt'
rm -f "$REPO/probe.txt"

# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: сломанный хук не роняет сжатие и не оставляет мусора.
exit_code_of() {
    printf '%s' "$2" | "$HOOKS/handoff-write.sh" >/dev/null 2>&1
    report "$1" "код:$?" 'код:0'
}
exit_code_of 'пустой вход пропускается' ''
exit_code_of 'неразбираемый вход пропускается' 'не json'
exit_code_of 'вход без рабочего каталога пропускается' "$(jq -n '{hook_event_name:"PreCompact",trigger:"auto"}')"

# Не репозиторий вовсе — писать нечего: ветки нет, состояния нет.
BARE="$(mktemp -d)"
printf '%s' "$(jq -n --arg d "$BARE" '{hook_event_name:"PreCompact",trigger:"auto",cwd:$d}')" \
    | "$HOOKS/handoff-write.sh" >/dev/null 2>&1
code=$?
if [ "$code" -eq 0 ] && [ ! -d "$BARE/.claude/handoff" ]; then
    report 'вне репозитория передача не пишется' 'пусто' 'пусто'
else
    report 'вне репозитория передача не пишется' "код:$code" 'пусто'
fi
rm -rf "$BARE"

suite_result "хук передачи"
