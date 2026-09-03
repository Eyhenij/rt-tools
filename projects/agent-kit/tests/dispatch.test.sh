#!/usr/bin/env bash
# Сценарии диспетчера событий: какие ветки он зовёт, как сверяет образец вызова и что делает с
# отказом ветки.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "диспетчер событий"

# Фикстура — свой каталог гардов: набор судит механику диспетчера, а не карту этого дерева.
DISPATCH_DIR="$(mktemp -d)"
cp "$ASSETS/hooks/dispatch.sh" "$ASSETS/hooks/hook-input.sh" "$ASSETS/hooks/utf8.sh" "$DISPATCH_DIR/" 2>/dev/null

# Ветка с объявлением: имя файла, событие, образец вызова и код возврата.
branch() {
    {
        printf '#!/usr/bin/env bash\n'
        printf '# rt-hook: %s %s\n' "$2" "$3"
        printf 'printf "звали %s\\n"\n' "$1"
        printf 'exit %s\n' "$4"
    } > "$DISPATCH_DIR/$1.sh"
    chmod +x "$DISPATCH_DIR/$1.sh"
}

# Вывод диспетчера на заданном событии и вводе.
dispatch_says() {
    printf '%s' "$2" | bash "$DISPATCH_DIR/dispatch.sh" "$1" 2>&1
}
dispatch_code() {
    printf '%s' "$2" | bash "$DISPATCH_DIR/dispatch.sh" "$1" >/dev/null 2>&1
    printf '%s' "$?"
}

INPUT_BASH='{"tool_name":"Bash","tool_input":{"command":"git status"},"cwd":"/tmp"}'
INPUT_EDIT='{"tool_name":"Edit","tool_input":{"file_path":"/tmp/a.ts"},"cwd":"/tmp"}'

# --- SC-AK-522 — зовутся только ветки своего события --------------------------------------------
branch first PreToolUse '.*' 0
branch second PostToolUse '.*' 0
report "SC-AK-522 — ветка своего события позвана" "$(dispatch_says PreToolUse "$INPUT_BASH" | grep -c 'звали first')" 1
report "SC-AK-522 — ветка чужого события не позвана" "$(dispatch_says PreToolUse "$INPUT_BASH" | grep -c 'звали second')" 0

# --- SC-AK-523 — образец вызова сверяет диспетчер -----------------------------------------------
rm -f "$DISPATCH_DIR/first.sh" "$DISPATCH_DIR/second.sh"
branch only_edit PreToolUse 'Edit|Write|MultiEdit' 0
branch any_tool PreToolUse '.*' 0
report "SC-AK-523 — ветка с чужим образцом не позвана" "$(dispatch_says PreToolUse "$INPUT_BASH" | grep -c 'звали only_edit')" 0
report "SC-AK-523 — та же ветка на своём вызове позвана" "$(dispatch_says PreToolUse "$INPUT_EDIT" | grep -c 'звали only_edit')" 1
report "SC-AK-523 — ветка без образца зовётся на любом" "$(dispatch_says PreToolUse "$INPUT_BASH" | grep -c 'звали any_tool')" 1

# Образец сверяется с именем целиком, а не куском: иначе `Edit` ловил бы `NotebookEdit`.
INPUT_OTHER='{"tool_name":"NotebookEdit","tool_input":{"file_path":"/tmp/a.ipynb"},"cwd":"/tmp"}'
report "SC-AK-523 — образец сверяется с именем целиком" "$(dispatch_says PreToolUse "$INPUT_OTHER" | grep -c 'звали only_edit')" 0

# --- SC-AK-833 — сломанная ветка названа по имени ------------------------------------------------
# Ветка, вышедшая ненулём и не сказавшая ничего, снаружи неотличима от отказа по делу, а
# починить нечего: вывод ошибок веток диспетчер глушит, и какой файл сломан, не знает никто.
rm -f "$DISPATCH_DIR"/*.sh 2>/dev/null
cp "$ASSETS/hooks/dispatch.sh" "$ASSETS/hooks/hook-input.sh" "$ASSETS/hooks/utf8.sh" "$DISPATCH_DIR/" 2>/dev/null
{
    printf '#!/usr/bin/env bash\n'
    printf '# rt-hook: PreToolUse .*\n'
    printf 'exit 3\n'
} > "$DISPATCH_DIR/broken_branch.sh"
chmod +x "$DISPATCH_DIR/broken_branch.sh"
report "SC-AK-833 — имя сломанной ветки названо" \
    "$(dispatch_says PreToolUse "$INPUT_BASH" | grep -c 'broken_branch.sh')" 1
report "SC-AK-833 — код возврата отдан как есть" "$(dispatch_code PreToolUse "$INPUT_BASH")" 3
rm -f "$DISPATCH_DIR/broken_branch.sh"

# --- SC-AK-524 — отказ ветки доходит до агента --------------------------------------------------
rm -f "$DISPATCH_DIR"/only_edit.sh "$DISPATCH_DIR"/any_tool.sh
branch aaa_denies PreToolUse '.*' 2
branch zzz_after PreToolUse '.*' 0
report "SC-AK-524 — код отказа отдан как есть" "$(dispatch_code PreToolUse "$INPUT_BASH")" 2
report "SC-AK-524 — вывод отказавшей ветки виден" "$(dispatch_says PreToolUse "$INPUT_BASH" | grep -c 'звали aaa_denies')" 1
report "SC-AK-524 — ветки за отказом не зовутся" "$(dispatch_says PreToolUse "$INPUT_BASH" | grep -c 'звали zzz_after')" 0

# --- SC-AK-525 — отказ в пользу работы ----------------------------------------------------------
#
# Ветка-отказ отсюда убрана: её код возврата законен и на битом вводе, а проверяется здесь другое —
# что сам диспетчер не падает и не заклинивает работу.
rm -f "$DISPATCH_DIR/aaa_denies.sh"
report "SC-AK-525 — без события выход нулём" "$(printf '%s' "$INPUT_BASH" | bash "$DISPATCH_DIR/dispatch.sh" >/dev/null 2>&1; printf '%s' "$?")" 0
report "SC-AK-525 — пустой ввод выход нулём" "$(dispatch_code PreToolUse '')" 0
report "SC-AK-525 — битый ввод веток не роняет" "$(dispatch_code PreToolUse 'не JSON')" 0

# --- SC-AK-577 — у файла читаются все объявления события ----------------------------------------
#
# Гард, стоящий и на вызове инструмента, и на завершении хода, называет оба события своими
# строками. Пока читалась одна, вторая ветка не звалась ни разу — и снаружи это неотличимо от
# гарда, который посмотрел и пропустил.
{
    printf '#!/usr/bin/env bash\n'
    printf '# rt-hook: PreToolUse AskUserQuestion\n'
    printf '# Требует: hooks/deny-tail.sh\n'
    printf '# rt-hook: Stop\n'
    printf 'printf "звали two_events\\n"\n'
    printf 'exit 0\n'
} > "$DISPATCH_DIR/two_events.sh"
chmod +x "$DISPATCH_DIR/two_events.sh"

INPUT_ASK='{"tool_name":"AskUserQuestion","tool_input":{},"cwd":"/tmp"}'
INPUT_STOP='{"transcript_path":"/tmp/нет.jsonl","cwd":"/tmp"}'
report "SC-AK-577 — ветка первого объявления позвана" "$(dispatch_says PreToolUse "$INPUT_ASK" | grep -c 'звали two_events')" 1
report "SC-AK-577 — ветка второго объявления позвана" "$(dispatch_says Stop "$INPUT_STOP" | grep -c 'звали two_events')" 1
report "SC-AK-577 — чужой вызов первое объявление не ловит" "$(dispatch_says PreToolUse "$INPUT_BASH" | grep -c 'звали two_events')" 0
report "SC-AK-577 — на своём событии ветка зовётся один раз" "$(dispatch_says Stop "$INPUT_STOP" | grep -c 'звали two_events')" 1
rm -f "$DISPATCH_DIR/two_events.sh"


# --- SC-AK-578 — отбой в выводе ветки останавливает обход ---------------------------------------
#
# Гарды завершения хода отбивают решением в выводе, а выходят нулём. Склеенный с выводом
# следующей ветки такой объект не разбирается вовсе — и отбой пропадает целиком.
{
    printf '#!/usr/bin/env bash\n'
    printf '# rt-hook: Stop\n'
    printf '%s\n' 'printf "{\"decision\":\"block\",\"reason\":\"aaa не пускает\"}\n"'
    printf 'exit 0\n'
} > "$DISPATCH_DIR/aaa_blocks.sh"
{
    printf '#!/usr/bin/env bash\n'
    printf '# rt-hook: Stop\n'
    printf '%s\n' 'printf "{\"decision\":\"block\",\"reason\":\"zzz тоже\"}\n"'
    printf 'exit 0\n'
} > "$DISPATCH_DIR/zzz_blocks.sh"
chmod +x "$DISPATCH_DIR/aaa_blocks.sh" "$DISPATCH_DIR/zzz_blocks.sh"

STOP_OUT="$(printf '%s' '{"transcript_path":"/tmp/нет.jsonl","cwd":"/tmp"}' | bash "$DISPATCH_DIR/dispatch.sh" Stop 2>/dev/null)"
report "SC-AK-578 — вывод остаётся разбираемым" "$(printf '%s' "$STOP_OUT" | jq -r '.reason' 2>/dev/null)" 'aaa не пускает'
report "SC-AK-578 — ветки за отбоем не зовутся" "$(printf '%s' "$STOP_OUT" | grep -c 'zzz тоже')" 0
rm -f "$DISPATCH_DIR/aaa_blocks.sh" "$DISPATCH_DIR/zzz_blocks.sh"


# --- SC-AK-700, SC-AK-701 — отбой настоящего стража доходит до вывода --------------------------
#
# Сценарий выше судит плотницкую работу: рукописная ветка печатает решение, диспетчер его не
# склеивает. Чего он не судит — что настоящий страж объявлен тем событием, что диспетчер его
# находит и что его отказ доходит как есть. Гард, чей отказ теряется по дороге, защитой не
# считается, а молчание его читается как согласие.
cp "$ASSETS/hooks/turn-exit-guard.sh" "$DISPATCH_DIR/" 2>/dev/null

REAL_REPO="$(fixture_repo RT-9-real)"
mkdir -p "$REAL_REPO/docs/tasks/RT-9-real"
printf '# Ход работы\n\n## Где стоим\n\n- **Состояние:** `этап-идёт`\n- **Следующий шаг:** делать первый\n' \
    > "$REAL_REPO/docs/tasks/RT-9-real/progress.md"

REAL_TURN="$(mktemp)"
{
    jq -c -n '{type:"user",message:{content:[{type:"text",text:"продолжай"}]}}'
    jq -c -n '{type:"assistant",message:{content:[{type:"tool_use",name:"Read",input:{file_path:"a.md"}}]}}'
} > "$REAL_TURN"

WORK_TURN="$(mktemp)"
{
    jq -c -n '{type:"user",message:{content:[{type:"text",text:"продолжай"}]}}'
    jq -c -n '{type:"assistant",message:{content:[{type:"tool_use",name:"Edit",input:{file_path:"a.md"}}]}}'
} > "$WORK_TURN"

# Ввод собирается тем же приёмом, что у самого стража: путь записи хода и корень дерева.
real_input() {
    jq -n --arg p "$1" --arg d "$REAL_REPO" \
        '{session_id:"tests",transcript_path:$p,cwd:$d,stop_hook_active:false}'
}

REAL_OUT="$(printf '%s' "$(real_input "$REAL_TURN")" | bash "$DISPATCH_DIR/dispatch.sh" Stop 2>/dev/null)"
report "SC-AK-700 — решение стража дошло до вывода" \
    "$(printf '%s' "$REAL_OUT" | jq -r '.decision' 2>/dev/null)" 'block'
report "SC-AK-700 — довод в выводе от стража, а не общий" \
    "$(printf '%s' "$REAL_OUT" | jq -r '.reason' 2>/dev/null | grep -c 'делать первый')" 1
report "SC-AK-700 — код возврата диспетчера нулевой" \
    "$(printf '%s' "$(real_input "$REAL_TURN")" | bash "$DISPATCH_DIR/dispatch.sh" Stop >/dev/null 2>&1; printf '%s' "$?")" 0

WORK_OUT="$(printf '%s' "$(real_input "$WORK_TURN")" | bash "$DISPATCH_DIR/dispatch.sh" Stop 2>/dev/null)"
report "SC-AK-701 — ход с работой отбоя не получает" \
    "$(printf '%s' "$WORK_OUT" | grep -c '"decision":"block"')" 0

rm -f "$DISPATCH_DIR/turn-exit-guard.sh" "$REAL_TURN" "$WORK_TURN"
rm -rf "$REAL_REPO"

rm -rf "$DISPATCH_DIR"

suite_result "диспетчер событий"
