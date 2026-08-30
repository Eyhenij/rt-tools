#!/usr/bin/env bash
# Сценарии гарда ожидания: что считается открытием PR и чем требование снимается.
#
# Проверяется механика, а не карта дерева: запись хода собирается здесь же. Полноту набора
# образцов гард не обещает и здесь — проверяется, что открытие PR ловится всеми тремя формами, а
# первое действие по следующей задаче требование снимает.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард ожидания"

TURNS="$(mktemp -d)"
cleanup() { rm -rf "$TURNS"; }
trap cleanup EXIT

transcript() {
    local path
    path="$TURNS/turn-$RANDOM.jsonl"
    : >"$path"
    for line in "$@"; do
        printf '%s\n' "$line" >>"$path"
    done
    printf '%s' "$path"
}

say() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"text",text:$t}]}}'; }
reply() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"text",text:$t}]}}'; }
ran() {
    jq -c -n --arg c "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'
}

input_stop() {
    jq -n --arg p "$1" --argjson a "${2:-false}" '{session_id:"tests",transcript_path:$p,stop_hook_active:$a}'
}

expect_stop() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/waiting-turn-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

# --- SC-AK-246 — ход, открывший PR и не взявший следующую задачу, не закрывается --------------
expect_stop "SC-AK-246 — PR открыт, дальше ничего" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x --body-file тело.md')" "$(reply 'PR #10 открыт. Пока жду, беру следующую задачу.')")")" BLOCK
# Слова о следующей задаче действием не являются: гард судит команды, а не обещания.
expect_stop "SC-AK-246 — обещание следующей задачи требования не снимает" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(reply 'Беру задачу #11.')")")" BLOCK
# Открытие вызовом хостинга напрямую ловится наравне с командой клиента.
expect_stop "SC-AK-246 — открытие через вызов хостинга" \
    "$(input_stop "$(transcript "$(say 'открывай')" "$(ran 'gh api -X POST repos/o/r/pulls -f title=x')" "$(reply 'Открыт.')")")" BLOCK
# Гард переносится между хостингами целиком: набор называет все три формы.
expect_stop "SC-AK-246 — форма второго хостинга" \
    "$(input_stop "$(transcript "$(say 'открывай')" "$(ran 'glab mr create --draft --title x')" "$(reply 'Открыт.')")")" BLOCK
expect_stop "SC-AK-246 — форма третьего хостинга" \
    "$(input_stop "$(transcript "$(say 'открывай')" "$(ran 'az repos pr create --draft true --title x')" "$(reply 'Открыт.')")")" BLOCK

# --- SC-AK-247 — первое действие по следующей задаче снимает требование ------------------------
# Состояние отданной работы при этом спрошено: следующая задача берётся сверх доведения
# отданного до снятого черновика, а не вместо него — это SC-AK-583 ниже.
expect_stop "SC-AK-247 — задача заведена тем же ходом" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(ran 'gh run list --branch RT-1-probe')" "$(ran 'npm run task:new -- --title y --slug z')")")" PASS
expect_stop "SC-AK-247 — ветка заведена тем же ходом" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(ran 'gh run list --branch RT-1-probe')" "$(ran 'git checkout -b RT-11-next')")")" PASS
expect_stop "SC-AK-247 — папка задачи заведена тем же ходом" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(ran 'gh run list --branch RT-1-probe')" "$(ran 'cp -r docs/tasks/_template docs/tasks/RT-11-next')")")" PASS
expect_stop "SC-AK-247 — колонка очереди работ двинута тем же ходом" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(ran 'gh run list --branch RT-1-probe')" "$(ran 'npm run task:move -- 11 in-progress')")")" PASS

# --- SC-AK-747 — ни одного из двух действий: отказ называет оба -------------------------------
# Прежде такой ход отбивался только требованием следующей задачи, и снимался им же: признак
# открытой заявки уходил вместе с ходом, а второе требование не звучало никогда.
expect_stop "SC-AK-747 — ни состояния, ни следующей задачи" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(reply 'Готово, PR #10.')")")" BLOCK
# Одно из двух сделано — отказ остаётся, но говорит уже о недостающем, а не об обоих.
expect_stop "SC-AK-747 — состояние спрошено, следующая не взята" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(ran 'gh run list --branch RT-1-probe')" "$(reply 'Прогон идёт.')")")" BLOCK
# Оба сделаны — ход проходит.
expect_stop "SC-AK-747 — оба действия сделаны" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(ran 'gh run list --branch RT-1-probe')" "$(ran 'npm run task:new -- --title y --slug z')")")" PASS

# --- SC-AK-583 — отданная работа доводится до снятого черновика --------------------------------
# Следующая задача, взятая вместо доведения, оставляет готовое невидимым: у черновика кнопка
# слияния заблокирована хостингом, и по списку заявок готовое от недоделанного не отличить.
expect_stop "SC-AK-583 — следующая задача без спроса о прогоне ход не кончает" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(ran 'npm run task:move -- 11 in-progress')")")" BLOCK
expect_stop "SC-AK-583 — снятый черновик требование снимает" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(ran 'gh pr ready 11')" "$(ran 'npm run task:move -- 11 in-progress')")")" PASS
expect_stop "SC-AK-583 — сверка очереди работ показывает то же" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(ran 'npm run check:board')" "$(ran 'npm run task:move -- 11 in-progress')")")" PASS

# --- SC-AK-248 — ход без открытия PR гард ожидания не судит ------------------------------------
expect_stop "SC-AK-248 — PR не открывали" \
    "$(input_stop "$(transcript "$(say 'почини стили')" "$(ran 'pnpm run lint')" "$(reply 'Зелено.')")")" PASS
# Правка тела уже открытого PR открытием не является.
expect_stop "SC-AK-248 — правка тела PR открытием не считается" \
    "$(input_stop "$(transcript "$(say 'перепиши тело')" "$(ran 'gh api -X PATCH repos/o/r/pulls/10 -f body=x')" "$(reply 'Переписал.')")")" PASS

# --- SC-AK-262 — прочитанный красный прогон судится наравне с открытым PR ----------------------
#
# Признак лежит не в команде, а в её выводе: конец прогона читают и затем, чтобы пойти чинить.
result() {
    jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"tool_result",content:$t}]}}'
}

RED_LIST='completed	failure	[RT-9] Готово	CI	RT-9-probe	pull_request	31987106774	8m48s'
GREEN_LIST='completed	success	[RT-9] Готово	CI	RT-9-probe	pull_request	31987106774	8m48s'

expect_stop "SC-AK-262 — красный прогон прочитан, дальше ничего" \
    "$(input_stop "$(transcript "$(say 'что там прогон')" "$(ran 'gh run list --branch RT-9-probe --limit 1')" "$(result "$RED_LIST")" "$(reply 'Прогон упал. Разберусь.')")")" BLOCK
expect_stop "SC-AK-262 — красный ответ в форме поля тоже ловится" \
    "$(input_stop "$(transcript "$(say 'что там прогон')" "$(ran 'gh run view 42 --json conclusion')" "$(result '{"conclusion":"failure"}')" "$(reply 'Красный.')")")" BLOCK
expect_stop "SC-AK-262 — действие по следующей задаче снимает требование и здесь" \
    "$(input_stop "$(transcript "$(say 'что там прогон')" "$(ran 'gh run list --limit 1')" "$(result "$RED_LIST")" "$(ran 'git checkout -b RT-11-next')")")" PASS

# --- SC-AK-263 — зелёный прогон и чтение без красного ответа гард не судит ---------------------
#
# За зелёным прогоном идёт своя работа — уборка и снятие черновика, — а не чужой шаг.
expect_stop "SC-AK-263 — зелёный прогон хода не судит" \
    "$(input_stop "$(transcript "$(say 'что там прогон')" "$(ran 'gh run list --limit 1')" "$(result "$GREEN_LIST")" "$(reply 'Зелено.')")")" PASS
# Слово «failure» без команды чтения прогона признаком не является: гард судит пару.
expect_stop "SC-AK-263 — красное слово без чтения прогона признаком не является" \
    "$(input_stop "$(transcript "$(say 'почини тест')" "$(ran 'pnpm test')" "$(result 'Tests: 1 failure')" "$(reply 'Чиню.')")")" PASS

# --- отказ в пользу работы ------------------------------------------------------------------
# Повторный заход по тому же ходу не судится: иначе ход не кончится никогда.
expect_stop "повторный заход отпускается" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(reply 'Открыт.')")" true)" PASS
expect_stop "нет записи хода — нечего судить" "$(input_stop "$TURNS/нетакого.jsonl")" PASS


# --- SC-AK-750 — ход, объявивший своё следующее действие и не сделавший ничего --------------
#
# Пустой ход, назвавший свой же шаг словами, прежними признаками не ловился: заявку он не
# открывал, прогона не читал. Судится форма — набор образцов будущего времени, — и только там,
# где за словами не стоит ни одного вызова.
expect_stop "SC-AK-750 — объявление без единого вызова отбивается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply 'Этап закрыт. Дальше беру приведение текстов домена.')")")" BLOCK
expect_stop "SC-AK-750 — другая форма того же объявления" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply 'Следующим шагом сделаю разбор папки задачи.')")")" BLOCK
# За словами стоит работа — объявление сказано по ходу, а не вместо него.
expect_stop "SC-AK-750 — объявление при сделанной работе проходит" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'npm run task:move -- 12 in-progress')" "$(reply 'Дальше беру первый этап.')")")" PASS
# Ход без объявления и без вызовов остаётся ходом разговора: судить его этому гарду нечем.
expect_stop "SC-AK-750 — ход разговора без объявления проходит" \
    "$(input_stop "$(transcript "$(say 'что там по задаче?')" "$(reply 'Задача закрыта вчера, заявка влита.')")")" PASS

# --- SC-AK-812 — шаг закрытия работы за взятие следующей задачи не считается ------------------
#
# Перевод закрываемой задачи в колонку разбора и снятие её папки — обязательные шаги закрытия, и
# оба стоят в том же ходе, которым открыт PR. Пока признак перечислял их наравне со взятием, он
# совпадал всегда, и ход отпускался — гард выглядел работающим и молчал ровно там, ради чего
# заведён.
expect_stop "SC-AK-812 — перевод закрываемой задачи в разбор" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" \
        "$(ran 'gh pr create --title x')" \
        "$(ran 'npm run task:move -- 990 in-review')")")" BLOCK
# Снятие папки закрываемой задачи — второй шаг того же закрытия.
expect_stop "SC-AK-812 — снятая папка закрываемой задачи взятием не считается" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" \
        "$(ran 'gh pr create --title x')" \
        "$(ran 'gh run list --limit 1')" \
        "$(ran 'git rm -r docs/tasks/RT-990-done')")")" BLOCK
# Перевод в колонку работы — по-прежнему взятие: закрытие туда не переводит ничего.
expect_stop "SC-AK-812 — перевод в колонку работы требование снимает" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" \
        "$(ran 'gh pr create --title x')" \
        "$(ran 'gh run list --limit 1')" \
        "$(ran 'npm run task:move -- 991 in-progress')")")" PASS
# Папка следующей задачи заводится и не оболочкой: инструмент письма пишет её первым файлом.
wrote() {
    jq -c -n --arg n "$1" --arg f "$2" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:$n,input:{file_path:$f}}]}}'
}
expect_stop "SC-AK-812 — папка следующей задачи написана инструментом письма" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" \
        "$(ran 'gh pr create --title x')" \
        "$(ran 'gh run list --limit 1')" \
        "$(wrote Write 'docs/tasks/RT-991-next/plan.md')")")" PASS
# Чтение того же файла работой не является: судятся только инструменты письма.
expect_stop "SC-AK-812 — чтение папки задачи взятием не считается" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" \
        "$(ran 'gh pr create --title x')" \
        "$(ran 'gh run list --limit 1')" \
        "$(wrote Read 'docs/tasks/RT-991-next/plan.md')")")" BLOCK

suite_result "гард ожидания"
