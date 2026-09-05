#!/usr/bin/env bash
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Требует: hooks/profile-check.sh, hooks/deny-tail.sh
# Гард «ничего не пишется с нуля». PreToolUse на правке кода и разметки.
#
# Линтеры знают правила, но не знают ИНВЕНТАРЬ: линтер стилей поймает сырой цвет, линтер кода —
# нетипизированное значение, но ни один из них не знает, что готовое сообщение уже написано, и
# молча пропустит свою область оповещения с текстом, кнопкой и стилями. Гард закрывает ровно
# эту дыру: сверяет то, что пишется, с тем, что в дереве уже есть.
#
# Правило целиком — `reuse-first`.
#
# Что считается переизобретением, знает профиль дерева: функция `rt_reinvented_in <файл>`
# печатает по строке на правило, четырьмя полями через табуляцию:
#
#   <над чем>  <образец>  <образец отмены>  <чем заменить>
#
# «Над чем» — `added` (только новый текст правки) или `whole` (правка вместе с содержимым
# файла). Второе нужно там, где признак виден только целиком: наследование основы и метка
# процедуры в точечную правку не попадают. «Образец отмены» гасит правило: маппер, который уже
# наследует общую основу, переизобретением не является; пустое поле не гасит ничего.
#
# Функция получает путь и вправе решать по нему сама — заглянуть в инвентарь кита, различить
# слой дерева, промолчать на файле, который уже существует. Нет профиля или нет функции — гард
# пропускает: инвентарь дерева пакет знать не может.
#
# Образцы разбирает `perl`: конъюнкция и отрицание пишутся заглядыванием вперёд, а без них
# самодельный оверлей не отличить от липкой шапки, а нативную кнопку — от кнопки кита.
#
# Осознанный выход: маркер отступления в тексте правки. Он объясняет, чего именно не хватает;
# «эти строки были здесь раньше» причиной не считается, и оттого проверяется только НОВЫЙ текст.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: нет разборщика, битый ввод, чужой инструмент — пропуск.

# Своё имя в наблюдениях: отбой пишет общий хвост отказа, а не сам гард.
RT_GUARD_NAME=reuse-first-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0
command -v perl >/dev/null 2>&1 || exit 0

tool="$(rt_hook_tool)"
shell_cmd=""
case "$tool" in
    # Инструмент среды заводит файл теми же двумя данными, только называет их иначе — без этой
    # ветки файл заводился мимо всех проверок.
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file) ;;
    # Команда оболочки, которая пишет файл, — та же правка. Без этой ветки гард обходится
    # сменой не инструмента, а способа записи; текстом правки тогда служит сама команда, и
    # заведённое ею в heredoc читается наравне с телом правки. Разбор —
    # `2026-08-15-guard-denied-shell-wrote-anyway.md`.
    #
    # Терминал среды исполняет ту же командную строку и кладёт её в то же поле: без этих двух
    # имён гард стоял бы объявленным на них и молча пропускал — состояние хуже необъявленного,
    # потому что снаружи выглядит закрытым.
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool)
        shell_cmd="$(rt_hook_cmd)"
        [ -z "$shell_cmd" ] && exit 0
        # Универсальный исполнитель прячет настоящую команду во вложенной строке: без её разбора
        # путь стоит за кавычкой, и до него не дотягивается ни один образец.
        if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
            inner="$(printf '%s' "$shell_cmd" | perl -0ne '
                if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
                    print defined $1 ? $1 : (defined $2 ? $2 : $3);
                }
            ' 2>/dev/null)"
            [ -n "$inner" ] && shell_cmd="$inner"
        fi
        ;;
    *) exit 0 ;;
esac

# Профиль дерева: сперва умолчание пакета, поверх него — надстройка проекта, если она есть.
# Читается до разбора пути: пути из команды оболочки вынимает как раз профиль.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

if [ -n "$shell_cmd" ]; then
    command -v rt_shell_writes >/dev/null 2>&1 && command -v rt_shell_paths >/dev/null 2>&1 || exit 0
    rt_shell_writes "$shell_cmd" || exit 0
    # Из команды берётся первый путь, чьё расширение гарду интересно: остальные ему безразличны.
    path=""
    while IFS= read -r candidate; do
        case "$candidate" in
            *.html | *.scss | *.ts) path="$candidate"; break ;;
        esac
    done <<EOF
$(rt_shell_paths "$shell_cmd")
EOF
    [ -z "$path" ] && exit 0
else
    path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
fi
# Путь от корня дерева приводится к абсолютному один раз, чтобы образцы не двоились.
case "$path" in
    /*) ;;
    ?*) path="${CLAUDE_PROJECT_DIR:-.}/$path" ;;
esac
case "$path" in
    *.html | *.scss | *.ts) ;;
    *) exit 0 ;;
esac

# Слово о нехватке функции профиля: хук, вышедший молча, неотличим от работающего. Файл может
# быть не разложен — тогда остаётся прежнее поведение, молчаливое.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }
rt_needs rt_reinvented_in reuse-first-guard || exit 0

# Правила этого дерева действуют на код этого дерева: без положительной проверки гард требовал
# бы собирать готовым и в черновике за пределами дерева.
if rt_needs rt_is_app_code reuse-first-guard; then
    rt_is_app_code "$path" || exit 0
fi

# Готовое собирается там, где ему и место: внутри кита нативные контролы и примитивы уместны,
# витрина и спеки — тоже не забота этого гарда.
if [ -n "${RT_REUSE_SKIP_RE:-}" ] && printf '%s' "$path" | grep -qE "$RT_REUSE_SKIP_RE"; then
    exit 0
fi

# Только новый текст: строка, уже лежавшая в файле, этой правкой не заводилась. У команды
# оболочки таким текстом служит она сама: что она кладёт в файл, лежит в ней же.
if [ -n "$shell_cmd" ]; then
    added="$shell_cmd"
else
    added="$(printf '%s' "$input" | jq -r '
        [ .tool_input.content?, .tool_input.text?, .tool_input.new_string?, (.tool_input.edits[]?.new_string) ]
        | map(select(. != null)) | join("\n")
    ' 2>/dev/null)"
fi
[ -z "$added" ] && exit 0

# Явный отказ от правила: готового такого нет, автор это осознал и пометил. Считается по
# исходному тексту правки, до вычёркивания ниже: маркер обычно и стоит на строке, которая уже
# лежит в файле, и вычеркнутый маркер отбивал бы правку соседней строки.
case "$added" in
    *native-ok*) exit 0 ;;
esac

# Перенос — не написание заново. Строку, которая уже лежит в файле, гард из проверяемого текста
# вычёркивает: блок, переехавший вместе с экраном из одного места файла в другое, отбивался
# наравне с новым, и маркер отступления приходилось ставить вслепую.
#
# Сверка идёт без отступов: при переезде блок меняет отступ, оставаясь тем же кодом.
if [ -f "$path" ]; then
    added="$(
        printf '%s' "$added" | awk '
            NR == FNR {
                line = $0
                gsub(/^[ \t]+|[ \t]+$/, "", line)
                if (line != "") { existing[line] = 1 }
                next
            }
            {
                line = $0
                gsub(/^[ \t]+|[ \t]+$/, "", line)
                if (line == "" || !(line in existing)) { print }
            }
        ' "$path" - 2>/dev/null
    )"
    [ -z "${added//[[:space:]]/}" ] && exit 0
fi

# Признак, который виден только целиком по файлу (наследование основы, метка процедуры),
# считается по итоговому содержимому: точечная правка приносит кусок без объявления класса.
whole="$added"
if [ -f "$path" ]; then
    whole="$added
$(cat "$path" 2>/dev/null)"
fi

has_re() {
    printf '%s' "$1" | RT_RE="$2" perl -0777 -ne 'exit(/$ENV{RT_RE}/s ? 0 : 1)' 2>/dev/null
}

# Что дерево объявило своим: наборы признаков и файл собственных. Настройка проверок — та же,
# что читает сплошная проверка; каталог наборов называет профиль дерева, потому что раскладка
# проверок у каждого дерева своя.
rt_checks_json="${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/checks.json"
rt_bundles=''
rt_own_signals=''
rt_backend_roots=''
if [ -f "$rt_checks_json" ]; then
    rt_bundles="$(jq -r '.reuse.bundles[]? // empty' "$rt_checks_json" 2>/dev/null | tr '\n' ' ')"
    own="$(jq -r '.reuse.signals // empty' "$rt_checks_json" 2>/dev/null)"
    [ -n "$own" ] && rt_own_signals="${CLAUDE_PROJECT_DIR:-.}/$own"
    # Тем же ключом, каким их читает сплошная проверка: второе объявление тех же корней
    # разошлось бы с первым молча.
    rt_backend_roots="$(jq -r '.backendRoots[]? // empty' "$rt_checks_json" 2>/dev/null | tr '\n' ' ')"
fi

# Путь от корня дерева: образец в признаке пишет дерево, и писать его от корня машины оно не
# может. Абсолютный путь нужен только для чтения файла с диска.
rel_path="${path#"${CLAUDE_PROJECT_DIR:-.}"/}"
rt_signals_dir="${CLAUDE_PROJECT_DIR:-.}/${RT_REUSE_SIGNALS_DIR:-tools/signals}"

# Признаки объявленных наборов: те же файлы читает сплошная проверка. Ключ признака совпал с
# ключом дерева — побеждает дерево: оно видит своё готовое, а пакет его не видел.
signals_json() {
    [ -n "$rt_signals_dir" ] || return 0
    [ -d "$rt_signals_dir" ] || return 0
    # Шапка раскладки снимается до разбора: в JSON комментария нет, и с ней разбор падает.
    for name in $rt_bundles; do
        file="$rt_signals_dir/$name.json"
        [ -f "$file" ] && grep -v '^# rt-kit ' "$file" | jq -c '.signals[]?' 2>/dev/null
    done
    [ -n "$rt_own_signals" ] && [ -f "$rt_own_signals" ] && grep -v '^# rt-kit ' "$rt_own_signals" | jq -c '.signals[]?' 2>/dev/null
}

# Поля читаются по одному, а не разбором строки: таб в `IFS` — пробельный разделитель, и пустое
# поле в середине схлопывается, из-за чего совет уезжает в образец отмены и гасит признак молча.
field() { printf '%s' "$1" | jq -r "$2 // empty" 2>/dev/null; }

found=''
signals_seen=0
while IFS= read -r signal; do
    [ -z "$signal" ] && continue
    signals_seen=1
    ext="$(field "$signal" '.ext')"
    case "$ext" in
        '') ;;
        *) case "$path" in *"$ext") ;; *) continue ;; esac ;;
    esac
    # Пропуск корней бэкенда: признак, объявленный с ним, на бэкенде не действует вовсе — там
    # принят другой способ, и базового класса, которого признак требует, у бэкенда нет. Поле
    # читает и сплошная проверка; читать его одному из двоих значит отбивать гардом ту самую
    # правку, которую проверка пропускает, — а провести её больше нечем: маркер отступления
    # объявляет обход готового, а обхода тут не было.
    if [ "$(field "$signal" '.skipBackendRoots')" = 'true' ] && [ -n "$rt_backend_roots" ]; then
        skip_backend=''
        for backend_root in $rt_backend_roots; do
            case "$rel_path" in "$backend_root"*) skip_backend=1 ;; esac
        done
        [ -n "$skip_backend" ] && continue
    fi

    # Образец имени сверяется с путём от корня дерева, а не с именем файла: слои, которые
    # признак и разделяет, зовут свои файлы одинаково, и по имени они неразличимы. Сплошная
    # проверка сверяет с путём — расходиться им нельзя.
    only_named="$(field "$signal" '.onlyNamed')"
    if [ -n "$only_named" ]; then
        printf '%s' "$rel_path" | grep -qE "$only_named" || continue
    fi

    # Обратная сторона образца имени: дерево, которое готовое само и пишет, выводит из-под
    # признака папки источника этого готового. Без неё выбор у такого дерева один — не брать
    # набор вовсе, и тогда внутри самого набора готовых компонентов обход готового не ловит
    # ничто. Поле читает и сплошная проверка: расходиться им нельзя.
    except_named="$(field "$signal" '.exceptNamed')"
    if [ -n "$except_named" ]; then
        printf '%s' "$rel_path" | grep -qE "$except_named" && continue
    fi

    case "$(field "$signal" '.scope')" in
        whole) text="$whole" ;;
        *) text="$added" ;;
    esac

    pattern="$(field "$signal" '.find')"
    [ -z "$pattern" ] && continue
    strip="$(field "$signal" '.strip')"
    [ -n "$strip" ] && text="$(printf '%s' "$text" | RT_RE="$strip" perl -0777 -pe 's/$ENV{RT_RE}//gs' 2>/dev/null)"

    has_re "$text" "$pattern" || continue

    cancel="$(field "$signal" '.cancel')"
    [ -n "$cancel" ] && has_re "$text" "$cancel" && continue

    skip_signal=''
    while IFS= read -r one; do
        [ -z "$one" ] && continue
        has_re "$text" "$one" || skip_signal=1
    done <<ALL
$(printf '%s' "$signal" | jq -r '.all[]? // empty' 2>/dev/null)
ALL
    [ -n "$skip_signal" ] && continue

    found="${found}
  - $(field "$signal" '.instead')"
done <<EOF
$(signals_json | jq -s -c 'reduce .[] as $one ({}; .[$one.key] = $one) | .[]' 2>/dev/null)
EOF

# Функция профиля остаётся вторым источником: деревья её уже написали. Поля читаются построчно,
# по тем же четырём колонкам, что объявлены выше.
while IFS= read -r line; do
    [ -z "$line" ] && continue
    signals_seen=1
    scope="$(printf '%s' "$line" | cut -f1)"
    pattern="$(printf '%s' "$line" | cut -f2)"
    cancel="$(printf '%s' "$line" | cut -f3)"
    replacement="$(printf '%s' "$line" | cut -f4)"
    [ -z "$pattern" ] && continue
    case "$scope" in
        whole) text="$whole" ;;
        *) text="$added" ;;
    esac
    has_re "$text" "$pattern" || continue
    [ -n "$cancel" ] && has_re "$text" "$cancel" && continue
    found="${found}
  - ${replacement}"
done <<EOF
$(rt_reinvented_in "$path" 2>/dev/null)
EOF

# Гард без единого признака неотличим от гарда, которому нечего отбивать. Правку он пропускает —
# останавливать работу за ненастроенное дерево не за что, — но говорит, чем это настраивается.
if [ "$signals_seen" = 0 ]; then
    printf '%s\n' 'reuse-first-guard: признаков нет — объявите наборы ключом `reuse.bundles` в настройке проверок' >&2
    exit 0
fi

[ -z "$found" ] && exit 0

reason="BLOCKED: это уже написано. Файл: ${path##*/}
${found}

Порядок действий: 1) открой готовое — барель кита или базовый класс — и используй его; 2) найди в дереве экран, где этот случай уже собран, и повтори сборку; 3) если готового правда не хватает — расширяй его на месте, у готового, а не клонируй рядом: клон забирает правки на себя и расходится с оригиналом с первой же.
Свой примитив, своя основа и свои инлайновые стили заводятся только с явного одобрения владельца, и спрашивается это до первого написанного файла. Разовое исключение помечается маркером отступления в той же строке, с объяснением, чего именно нет в готовом. Переименованием файла это не обходится."

# Общий хвост отказа: два законных хода и законная форма обхода, если она у отказа есть.
# Файл может быть не разложен — тогда хвоста нет, а причина отказа остаётся прежней.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "маркер отступления в той же строке, с объяснением, чего именно нет в готовом")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Написано своё там, где готовое уже есть."}}\n'

exit 0
