#!/usr/bin/env bash
# Сценарии проверки выхода из хода при открытом эпике: ход с работой и второй проход не
# отпускаются, пока у эпика есть незакрытая задача; вопрос без работы в идущем этапе и передача
# рукой отбиваются.
#
# Таблица эпика подменяется двойником: что он печатает на `--unfinished`, то и есть состояние эпика
# в сценарии. Общая обвязка — `turn-exit-lib.sh` рядом.
. "$(dirname "${BASH_SOURCE[0]}")/turn-exit-lib.sh"

echo "проверка выхода из хода: открытый эпик"

# --- SC-AK-1126 — вопрос без работы в идущем этапе ---------------------------------------------
# Ожидание одной части этапа не останавливает этап: части, не зависящие от ответа, делаются в том
# же ходу, и вопрос идёт за ними. Вопрос во главе пустого хода — остановка с приложенным вопросом.
state_is 'этап-идёт'
expect_stop "SC-AK-1126 — вопрос без единой правки в идущем этапе ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)" "$(asked)")")" BLOCK
expect_reason "SC-AK-1126 — отказ называет части, не зависящие от ответа" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)" "$(asked)")")" "do not depend on the answer"
expect_stop "SC-AK-1126 — вопрос после работы ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(asked)")")" PASS
state_is 'этапы-кончились'
expect_stop "SC-AK-1126 — вопрос без работы в другом состоянии ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)" "$(asked)")")" PASS

# --- SC-AK-1117 — открытый эпик: ход с работой и второй проход ---------------------------------
# Таблица эпика подменяется двойником: что он печатает на `--unfinished`, то и есть состояние
# эпика в сценарии. Пустой ответ с нулевым кодом — эпик закрыт; ненулевой код — прочесть нельзя.
state_is 'этап-идёт'
mkdir -p "$REPO/.claude" "$REPO/tools"
printf '%s\n' '{"layout":{"checks":"tools"}}' > "$REPO/.claude/rt-kit.json"
cat > "$REPO/tools/epic-table.mjs" <<'STUB'
const left = process.env.STUB_LEFT ?? '';
const code = Number(process.env.STUB_CODE ?? '0');
if (left !== '') {
    process.stdout.write(`${left}\n`);
}
process.exit(code);
STUB
export STUB_LEFT='RT-2 RT-3' STUB_CODE=0

expect_stop "SC-AK-1117 — ход, кончившийся правкой, при открытом эпике не отпускается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" BLOCK
expect_reason "SC-AK-1117 — отказ называет незакрытые задачи эпика" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" "RT-2 RT-3"
expect_stop "SC-AK-1117 — отданная работа со взятой следующей при открытом эпике не отпускается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'gh pr create --draft')" "$(ran 'npm run task:move -- 3 in-progress')" "$(edited)")")" BLOCK
expect_stop "SC-AK-1117 — второй проход при открытом эпике судится" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(said 'Готово.')")" true)" BLOCK
expect_stop "SC-AK-1117 — вопрос после работы отпускает и при открытом эпике" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(asked)")")" PASS
expect_stop "SC-AK-1117 — отказ проверки последним действием отпускает и при открытом эпике" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(ran 'echo x > a.ts')" "$(answered 'BLOCKED by task-flow: нет замысла')")")" PASS
expect_stop "SC-AK-1117 — слово владельца об остановке отпускает и при открытом эпике" \
    "$(input_stop "$(transcript "$(say 'останови, дальше сам')" "$(edited)")")" PASS

# --- SC-AK-1118 — передача рукой при открытом эпике --------------------------------------------
# Передача при уплотнении пишется хуком, не командой в ходу; написанная рукой до порога — остановка,
# объявленная тем, кому она удобна. Отказ проверки окна отпускает как любой отказ.
expect_stop "SC-AK-1118 — передача рукой при открытом эпике ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(ran 'npm run handoff')")")" BLOCK
expect_reason "SC-AK-1118 — отказ называет передачу рукой" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(ran 'npm run handoff')")")" "by the hand of the executor"
expect_stop "SC-AK-1118 — отказ проверки окна последним действием отпускает ход" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(ran 'npm run handoff')" "$(ran 'echo x > a.ts')" "$(answered 'BLOCKED by window-fill-guard: window fill 52%')")")" PASS

# --- SC-AK-1122 — отказ проверки на закрытие разговора не выход -----------------------------------
# Отклонённый вызов сам был остановкой, не работой: такой отказ не отпускает ход.
expect_stop "SC-AK-1122 — отказ на закрытие разговора последним действием при открытом эпике ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(ran 'echo x > a.ts')" "$(answered 'BLOCKED by end-conversation-guard: the executor does not end the conversation')")")" BLOCK
expect_stop "SC-AK-1122 — отказ другой проверки последним действием отпускает как прежде" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(ran 'echo x > a.ts')" "$(answered 'BLOCKED by task-flow: нет плана')")")" PASS

# --- SC-AK-1120 — стоящее слово владельца в кавычках в строке ожидания ---------------------------
# Проверка читает слово владельца, не пересказ. Строка без кавычек не отпускает.
waiting_is() {
    # Отличие от state_is одно: строка ожидания.
    printf '# Ход работы\n\n- **Состояние:** `этап-идёт`\n- **Waiting for the owner:** %s\n' "$1" > "$TASK/progress.md"
}
waiting_is '«эпик чата пока откладываем» — сказано вчера.'
expect_stop "SC-AK-1120 — слово владельца в кавычках в строке ожидания отпускает ход при открытом эпике" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" PASS
expect_stop "SC-AK-1120 — то же слово отпускает и пустой ход" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")")" PASS
waiting_is 'ждём его решения по хранилищу.'
expect_stop "SC-AK-1120 — строка ожидания без кавычек ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" BLOCK
state_is 'этап-идёт'

# --- SC-AK-1119 — закрытый и нечитаемый эпик: прежнее поведение --------------------------------
export STUB_LEFT='' STUB_CODE=0
expect_stop "SC-AK-1119 — при закрытом эпике ход с работой отпускается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" PASS
expect_stop "SC-AK-1119 — при закрытом эпике второй проход отпускается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(said 'Готово.')")" true)" PASS
expect_stop "SC-AK-1119 — при закрытом эпике передача рукой отпускает ход" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(ran 'npm run handoff')")")" PASS
export STUB_LEFT='RT-2' STUB_CODE=1
expect_stop "SC-AK-1119 — нечитаемая таблица: ход с работой отпускается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" PASS
expect_stop "SC-AK-1119 — нечитаемая таблица: второй проход отпускается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(said 'Готово.')")" true)" PASS
rm -f "$REPO/tools/epic-table.mjs"
unset STUB_LEFT STUB_CODE
expect_stop "SC-AK-1119 — без таблицы вовсе: ход с работой отпускается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" PASS


suite_result "проверка выхода из хода: открытый эпик"
