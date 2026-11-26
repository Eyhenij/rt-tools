#!/usr/bin/env bash
# Сценарии одного разбора цели записи: второго разбора в хуках нет, а без модуля слов проверка
# пропускает действие и молчит.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "один разбор цели записи"

# Второй разбор узнаётся по образцу команды записи в хуке: знак образца сразу за словом или за
# стрелкой, слово команды в кавычках у выбора, отрезание слова от текста. Под судом не стоят сам разбор из
# трёх файлов, вопрос «кладёт ли вызов исполняемый им сценарий сам» — он про имя одного файла, а не про
# цели, — и линтер после правки: его чтение `git mv` ждёт своей задачи.
NAME='(tee|cp|mv|install)'
SIGN="\\\\b(tee|cp|mv)\\\\b|(^|[^A-Za-z_])$NAME( ?[.]?[*+]|\\[\\[|\\\\s| ?\\[|\\(\\[)"
SIGN="$SIGN|(^|[^A-Za-z_])(sed|perl)\\)?( ?[.*+]|\\[\\[|\\\\s|\\[\\^| ?\\(| -\\[| -i(\\[|\\.))|(cp|mv|tee|sed)\\|(cp|mv|tee|install|sed|rm)"
SIGN="$SIGN|(^|[^-=])>\\\\?\\)?(\\[\\[|\\\\s| ?\\[|\\(\\[| \\*| \\?|\\+|\\.\\*)|>>\\?"
SIGN="$SIGN|[*\"'](git )?$NAME ?[\"']\\*?\\)|##\\*>|#\\*?(git )?(mv|cp|tee) |== *\"(cp|mv|tee|sed)\"|writeFileSync|rt_shell_words"
SIGN="$SIGN|grep[^|;]*( -[a-zA-Z]*w[a-zA-Z]* +[\"']?|[\"'])(tee|cp|mv)([\"' ]|\$)|-[dF] ?[\"']>|= [\"']?(cp|mv|tee|sed)[\"']? *\\]"
second_parse() {
    local hook
    for hook in "$1"/*.sh; do
        case "${hook##*/}" in shell-words.sh | code-writes.sh | write-targets.sh | script-files.sh | lint-after-edit.sh) continue ;; esac
        grep -v '^[[:space:]]*#' "$hook" | grep -qE "$SIGN" && printf '%s\n' "${hook##*/}"
    done
    return 0
}
SECOND="$(mktemp -d)"
report "SC-AK-1965 — в хуках второго разбора нет" "$(second_parse "$HOOKS" | tr '\n' ' ')" ''
second() {
    rm -f "$SECOND"/*
    printf '%s\n' "$2" > "$SECOND/a.sh"
    report "SC-AK-1965 — $1" "$(second_parse "$SECOND")" "${3-a.sh}"
}
second "прежний разбор проверки правил узнан" 'grep -qE -e "(>|(^|[[:space:];&|])tee[[:space:]]([^;&|]*[[:space:]])?)[[:space:]]*${path}"'
second "прежний разбор записи целиком узнан" "sed -nE 's/^>[[:space:]]*([^[:space:]|&;]+).*/\\1/p'"
second "копия командой grep узнана" "grep -E '(cp|mv)[[:space:]]+.*a.md'"
second "правка на месте командой perl узнана" "perl -ne 'print if /sed\\s+-i/'"
second "стрелка в awk узнана" "awk '/>[ \\t]*a/ { print }'"
second "перебор имён команд узнан" "case \"\$w\" in *) printf '%s' \"\$w\" | grep -qE 'tee|cp' ;; esac"
second "стрелка с отрицанием узнана" "grep -oE '>[^&|;]+'"
second "стрелка с повтором узнана" "re='(cat|echo) >+ ?([^ ]+)'"
second "стрелка с пробелами узнана" 'grep -qE "> *$path"'
second "tee с пробелами узнан" 'grep -qE "tee +$path"'
second "cp с чем угодно узнана" 'grep -qE "cp .+ $path"'
second "слова с границей узнаны" "grep -qE '\\btee\\b|\\bcp\\b'"
second "стрелка с необязательной второй узнана" "grep -oE '>>?[[:space:]]*x'"
second "стрелка с любым классом и с любым знаком узнана" "grep -oE '>[[:blank:]]*x'; grep -oE '>.*'"
second "стрелка с группой узнана" "grep -oE '>([^ ]+)'"
second "sed с группой флага узнан" "grep -oE 'sed( -E)? -i'"
second "sed с любым знаком за флагом узнан" "grep -oE 'sed -i[^|;]*'"
second "perl с классом флага узнан" "grep -oE 'perl -[a-z]*i'"
second "install с пробелами узнан" "grep -oE 'install[[:space:]]+-m.*'"
second "отрезание до стрелки узнано" 'target="${cmd##*>}"'
second "отрезание до слова команды узнано" 'set -- ${segment#*git mv }'
second "слово команды в выборе узнано" "case \"\$cmd\" in *'tee '*) x ;; esac"
second "слово команды в awk узнано" "awk '\$1 == \"cp\" { print \$NF }'"
second "имя вызова записи кода узнано" "grep -oE 'writeFileSync\\([^)]*'"
second "слова команды мимо общего разбора узнаны" 'printf "%s" "$cmd" | rt_shell_words'
second "tee перед путём в grep узнан" 'grep -q "tee $path"'
second "целое слово в grep узнано" 'grep -qw tee'
second "резка по стрелке узнана" "cut -d'>' -f2; awk -F'>' '{ print \$2 }'"
second "сравнение имени команды узнано" 'set -- $cmd; if [ "$1" = cp ]; then shift; fi'
second "комментарий о записи не разбор" '# cp[[:space:]] и tee[[:space:]] разбирает сосед' ''
second "запуск команды записи не разбор" 'cp "$a" "$b"; printf x | tee -a "$log"; sed -i "" s/a/b/ "$b"' ''
rm -rf "$SECOND"

# Без модуля слов проверка пропускает действие: сломанный разбор не мешает работе. Без модуля кода не
# читается только код.
ALONE="$(mktemp -d)"
cp "$HOOKS/write-targets.sh" "$HOOKS/shell-words.sh" "$HOOKS/script-files.sh" "$ALONE/"
report "SC-AK-1966 — без модуля кода названа запись оболочкой, код молчит, ошибки нет" \
    "$( (. "$ALONE/write-targets.sh"; printf "python3 -c \"open('c/d.py','w')\"; printf x > a/b.sh" | rt_write_targets) 2>&1)" 'a/b.sh'
rm "$ALONE/shell-words.sh"
report "SC-AK-1966 — без модуля слов цели нет, ошибки нет" \
    "$( (. "$ALONE/write-targets.sh"; printf 'printf x > a/b.sh' | rt_write_targets; printf 'printf x > a/b.sh' | rt_overwrite_targets) 2>&1)" ''
cp -R "$HOOKS/.." "$ALONE/assets" && rm -f "$ALONE/assets/hooks/shell-words.sh"
report "SC-AK-1966 — проверка переопределений без модуля слов молчит" \
    "$(mkdir -p "$ALONE/tree/.claude/rt-kit/overrides/rules" && printf 'a\n' > "$ALONE/tree/.claude/rt-kit/overrides/rules/a.md" \
        && input_cmd 'printf x > .claude/rt-kit/overrides/rules/a.md' Bash "$ALONE/tree" | CLAUDE_PROJECT_DIR="$ALONE/tree" "$ALONE/assets/hooks/override-write-guard.sh" 2>&1)" ''
report "SC-AK-1966 — с модулем слов тот же вызов отказан" \
    "$(input_cmd 'printf x > .claude/rt-kit/overrides/rules/a.md' Bash "$ALONE/tree" | CLAUDE_PROJECT_DIR="$ALONE/tree" "$HOOKS/override-write-guard.sh" 2>/dev/null | jq -r '.hookSpecificOutput.permissionDecision')" deny
rm -rf "$ALONE"

suite_result "один разбор цели записи"
