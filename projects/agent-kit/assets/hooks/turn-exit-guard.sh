#!/usr/bin/env bash
# rt-hook: Stop
# Требует: hooks/deny-tail.sh
# Страж выходов хода: ход, в котором по работе не сделано ничего, не заканчивается, пока работа
# не отдана. Stop.
#
# Зачем именно так. Правило перечисляет четыре законных выхода хода — вопрос без ответа в
# правилах, отказ гарда, заполненное окно, отданная работа с начатой следующей, — и держится
# это памятью исполнителя. Держится плохо: ход, кончившийся отчётом о сделанном, выглядит
# работой лучше всякой другой — он полон, в нём названы номера и состояния, и пустоты за ним не
# видно ни владельцу, ни самому заходу. Владелец назвал это прямо: прерываться посреди работы
# нельзя, и запрет должна держать машина.
#
# Что считается работой: правка файла и команда, меняющая дерево или его состояние. Чтение,
# поиск и разговор работой не считаются — именно ими и заполняется ход, который встал.
#
# Что отпускает ход:
#   1. Работа отдана либо влита — состояние работы говорит об этом само.
#   2. За ход была работа: правка файла или команда, меняющая дерево.
#   3. Вопрос владельцу инструментом опроса.
#   4. Отказ гарда — он кончает ход по правилу.
#   5. Передача захода написана — окно кончилось.
#   6. Владелец сказал остановиться.
#
# Работа без ветки и без папки задачи судится вторым признаком. Состояния у неё нет, и первый
# признак взять неоткуда, — но ход, в котором не было ни одной правки дерева, не кончается и
# здесь: просьба владельца «разложи», «обнови», «посмотри» живёт без задачи и без ветки, и
# защищена она была меньше всего. Отпускают такой ход те же четыре вещи: вопрос, отказ гарда,
# написанная передача и слово владельца об остановке.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: при любой ошибке, нехватке `jq`, отсутствии записи хода, папки задачи
# или строки состояния ход РАЗРЕШАЕТСЯ (exit 0). Сломанный страж не имеет права заклинить
# разговор.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

# Повторный заход по тому же ходу не судится: страж сказал своё один раз и отпускает.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

workdir="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

root="$(git rev-parse --show-toplevel 2>/dev/null)"
[ -z "$root" ] && exit 0

# Ветка, папка задачи и строка состояния берутся, пока они есть. Пусто — ход судится вторым
# признаком, а не отпускается: отсюда раньше уходили нулём, и работа по слову владельца
# кончалась объявлением намерения молча.
branch="$(git branch --show-current 2>/dev/null)"
tasks_dir="${RT_TASKS_DIR:-docs/tasks}"
progress=""
state=""
if [ -n "$branch" ] && [ -f "$root/$tasks_dir/$branch/progress.md" ]; then
    progress="$root/$tasks_dir/$branch/progress.md"
    state="$(sed -n 's/^[[:space:]]*[-*][[:space:]]*\*\*Состояние:\*\*[[:space:]]*`\([^`]*\)`.*/\1/p' "$progress" 2>/dev/null | head -1)"
fi

# Работа, дошедшая до этих двух состояний, чужого шага уже дождалась: дальше её двигает
# владелец, и ход, закрытый здесь, ничего не роняет.
case "$state" in
    работа-отдана | влито) exit 0 ;;
esac

# Следующий шаг из хода работы — его страж и называет в отказе: исполнитель, которому сказано
# только «работа не кончена», перечитывает ту же строку сам.
next_step=""
[ -n "$progress" ] && next_step="$(sed -n 's/^[[:space:]]*[-*][[:space:]]*\*\*Следующий шаг:\*\*[[:space:]]*\(.*\)/\1/p' "$progress" 2>/dev/null | head -1)"
[ -z "$next_step" ] && next_step="что стоит в разделе «Где стоим» хода работы"

# Команда, меняющая дерево или его состояние. Чтение и поиск сюда не входят намеренно: ими и
# заполняется ход, который встал.
work_re='git (add|commit|push|checkout|merge|rm)|npm run|pnpm (run|exec)|nx (build|test|run)|gh (pr|issue|api|run)|task:(new|move)|mkdir|cp |mv |rm |sed -i|tee |>>?[[:space:]]*[^|&]'

verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r --arg work "$work_re" '
    def is_input:
        .type == "user"
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then [] else .[$i:] end) as $turn
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")] as $uses
    # Правка файла — работа по определению, каким бы инструментом она ни шла.
    | ($uses | map(.name // "") | any(test("^(Edit|Write|MultiEdit|NotebookEdit)$"))) as $edited
    | ($uses | map(.name // "") | any(test("AskUserQuestion"))) as $asked
    | ($uses | map((.input.command // "")) | join("\n")) as $ran
    | ($ran | test($work)) as $ran_work
    # Отказ гарда и передача захода — оба кончают ход по правилу.
    | ([$turn[] | select(.type == "user") | .message.content // [] | select(type == "array") | .[]
          | select(.type == "tool_result") | .content
          | if type == "string" then .
            elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
            else tostring end] | join("\n")) as $out
    | (($out | test("BLOCKED by|Отбито гейтом")) or ($ran | test("BLOCKED by"))) as $denied
    | ($ran | test("handoff")) as $handed
    # Слово владельца об остановке: судится его собственная реплика, а не пересказ исполнителя.
    | ([$turn[] | select(.type == "user") | .message.content
          | if type == "string" then . elif type == "array"
            then (map(if type == "object" then (.text // "") else "" end) | join("\n")) else "" end] | join("\n")) as $said
    | ($said | test("останов|стоп|хватит|подожди|не надо|прерв|отложи")) as $told_stop
    | { worked: ($edited or $ran_work), released: ($asked or $denied or $handed or $told_stop), ran: $ran }
' 2>/dev/null)"

[ -z "$verdict" ] && exit 0

worked="$(printf '%s' "$verdict" | jq -r '.worked // false' 2>/dev/null)"
released="$(printf '%s' "$verdict" | jq -r '.released // false' 2>/dev/null)"
commands="$(printf '%s' "$verdict" | jq -r '.ran // ""' 2>/dev/null)"

[ "$released" = "true" ] && exit 0

# Контракт этапа. Отметка «этап сделан» — утверждение о дереве, и подтверждается оно выводом
# команды, а не словами: этап, отмеченный по памяти, через заход неотличим от проверенного.
# Страж сравнивает номер этапа с тем, что лежит в истории ветки, и на выросшем номере требует
# команды из строки «Чем проверяется» — она стоит в замысле обратными кавычками. Приём, записанный
# прозой, страж не читает: подтвердить его выводом нечем, и это его известная граница.
stage_now=""
stage_was=""
if [ -n "$progress" ]; then
    stage_now="$(sed -n 's/^[[:space:]]*[-*][[:space:]]*\*\*Этап:\*\*[[:space:]]*\([0-9][0-9]*\).*/\1/p' "$progress" 2>/dev/null | head -1)"
    stage_was="$(git -C "$root" show "HEAD:$tasks_dir/$branch/progress.md" 2>/dev/null | sed -n 's/^[[:space:]]*[-*][[:space:]]*\*\*Этап:\*\*[[:space:]]*\([0-9][0-9]*\).*/\1/p' | head -1)"
fi

if [ -n "$progress" ] && [ -n "$stage_now" ] && [ -n "$stage_was" ] && [ "$stage_now" -gt "$stage_was" ] 2>/dev/null; then
    plan="$root/$tasks_dir/$branch/plan.md"
    # Контракт закрытого этапа, а не начатого: подтверждается то, что объявлено сделанным.
    contract="$(awk -v n="$stage_was" '
        $0 ~ "^### " n "\\." { inside = 1; next }
        /^### / { inside = 0 }
        inside && /\*\*Чем проверяется:\*\*/ { print }
    ' "$plan" 2>/dev/null)"
    missing=""
    while IFS= read -r cmd; do
        [ -z "$cmd" ] && continue
        printf '%s' "$commands" | grep -qF -- "$cmd" || missing="$missing\n    $cmd"
    done <<EOF
$(printf '%s' "$contract" | grep -o '`[^`]*`' | tr -d '`')
EOF
    if [ -n "$missing" ]; then
        reason="BLOCKED by turn-exit-guard: этап ${stage_was} объявлен закрытым, а команды, которыми он проверяется, за этот ход не запускались:$(printf '%b' "$missing")

Отметка «этап сделан» — утверждение о дереве, и подтверждается оно выводом команды, а не словами: через заход отмеченное по памяти неотличимо от проверенного.

Запусти их этим же ходом либо верни прежний номер этапа в ход работы.

Страж судит один ход: следующий заход не отбивается."
        # Общий хвост отказа: два законных хода. Файл может быть не разложен — тогда хвоста нет,
        # а причина отказа остаётся прежней.
        # shellcheck disable=SC1090
        [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
            && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
        command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
        deny_tail_text="$(rt_deny_tail "")"
        [ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

        jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
            || printf '{"decision":"block","reason":"turn-exit-guard: закрытый этап не подтверждён выводом команды."}\n'
        exit 0
    fi
fi

[ "$worked" = "true" ] && exit 0

if [ -z "$state" ]; then
    reason="BLOCKED by turn-exit-guard: за этот ход не сделано ничего — ни правки, ни команды, меняющей дерево. Папки задачи у этой работы нет, и состояние взять неоткуда, но ход это не кончает.

Ход кончается четырьмя способами, и других нет: вопрос владельцу, ответа на который в правилах нет; отказ гарда; заполненное окно захода; отданная работа с начатой следующей. Названная и не запущенная команда выходом не является: строка «сейчас запущу» — объявление намерения, а оно прямо названо ложным концом хода.

Работа по слову владельца — «разложи», «обнови», «посмотри» — идёт без задачи и без ветки, и остановить её нечем, кроме этого признака.

Запусти названное этим же ходом. Владелец сказал остановиться — так и напиши: страж читает его слово, а не пересказ.

Страж судит один ход: следующий заход не отбивается."
else
    reason="BLOCKED by turn-exit-guard: работа в состоянии '${state}', а за этот ход по ней не сделано ничего — ни правки, ни команды, меняющей дерево.

Ход кончается четырьмя способами, и других нет: вопрос владельцу, ответа на который в правилах нет; отказ гарда; заполненное окно захода; отданная работа с начатой следующей. Отчёт о сделанном выходом не является — он выглядит работой лучше всякой другой, и пустоты за ним не видно.

Следующий шаг записан в ходе работы: ${next_step}

Сделай его этим же ходом. Владелец сказал остановиться — так и напиши: страж читает его слово, а не пересказ.

Страж судит один ход: следующий заход не отбивается."
fi

# Общий хвост отказа: два законных хода. Файл может быть не разложен — тогда хвоста нет,
# а причина отказа остаётся прежней.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"turn-exit-guard: работа не кончена — следующий шаг стоит в ходе работы."}\n'

exit 0
