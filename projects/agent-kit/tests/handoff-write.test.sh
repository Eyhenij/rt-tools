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

printf '# Ход работы\n\n## Где стоим\n\n- **Состояние:** `этап-идёт`\n- **Этап:** 2 из 5 — хук\n- **Следующий шаг:** сценарии хука\n- **PR:** #1396, черновик\n' > "$TASK/progress.md"

compact_in() {
    jq -n --arg d "$REPO" --arg t "${1:-auto}" \
        '{session_id:"tests",hook_event_name:"PreCompact",trigger:$t,cwd:$d}'
}

# Запуск хука и чтение того, что он положил. Решения у хука нет — судится файл.
run_hook() {
    rm -f "$HANDOFF"
    printf '%s' "$1" | "$HOOKS/handoff-write.sh" >/dev/null 2>&1
}

has_line() {
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
has_line 'работа вне папки задачи передачу тоже получает' "$(compact_in auto)" 'Папки задачи у этой ветки нет'
mv "$TASK/progress.off" "$TASK/progress.md"

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
