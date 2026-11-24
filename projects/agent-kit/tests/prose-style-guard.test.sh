#!/usr/bin/env bash
# Сценарии гарда слога: канцелярит в новом тексте не уезжает в файл.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард слога"

edit_in() {
    jq -n --arg f "$1" --arg b "$2" --arg t "${3:-Edit}" \
        '{session_id:"tests",tool_name:$t,tool_input:{file_path:$f,new_string:$b}}'
}

g() { expect_decision "$1" prose-style-guard.sh "$(edit_in "$2" "$3")" "$4"; }

g "SC-AK-336 — канцелярит в новом тексте отбивается" \
    /репозиторий/docs/x.md 'Проверка является инструментом контроля.' deny
g "SC-AK-337 — слово из левой колонки словаря отбивается" \
    /репозиторий/docs/x.md 'Эта таска ждёт разбора.' deny
g "SC-AK-338 — чистый текст проходит" \
    /репозиторий/docs/x.md 'Гард отбивает правку и называет следующий шаг.' PASS

# Судится проза, а не код: расширение выбирает гард, и на код он не смотрит вовсе.
g "SC-AK-339 — файл кода не судится" \
    /репозиторий/src/a.ts 'const данный = 1; // является примером' PASS

# Описание прошлого не правится вовсе, а ход работы живёт до слияния: судить их незачем.
g "SC-AK-340 — описание прошлого не судится" \
    /репозиторий/docs/archive/RT-1.md 'Данный разбор является записью.' PASS
g "SC-AK-341 — папка задачи не судится" \
    /репозиторий/docs/tasks/RT-1-x/progress.md 'Данный этап является закрытым.' PASS

# Та же запись командой оболочки: гард судит запись, а не инструмент. Текст берётся из тела
# команды — записываемое стоит внутри неё.
cmd_in() {
    jq -n --arg c "$1" '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c}}'
}
c() { expect_decision "$1" prose-style-guard.sh "$(cmd_in "$2")" "$3"; }

c "SC-AK-928 — канцелярит в перенаправлении отбивается" \
    'printf "Проверка является инструментом контроля." > docs/x.md' deny
c "SC-AK-928 — канцелярит в теле heredoc отбивается" \
    "$(printf 'cat > docs/x.md <<MD\nЭта таска ждёт разбора.\nMD')" deny
c "SC-AK-928 — чистый текст командой проходит" \
    'printf "Гард отбивает правку и называет шаг." > docs/x.md' PASS
c "SC-AK-928 — чтение документа гарда не будит" \
    'cat docs/x.md' PASS
c "SC-AK-928 — запись не в документ гарда не будит" \
    'printf "данный является" > src/a.ts' PASS
c "SC-AK-928 — описание прошлого командой не судится" \
    'printf "Данный разбор является записью." > docs/archive/RT-1.md' PASS

# Без тела heredoc судится только то, что команда печатает: цепочка правок и проверок длиннее
# сорока слов читалась одним предложением и отбивалась, хотя своего текста не несла.
CHAIN='sed -i "" -e s/a/b/ docs/x.md'
for word in $(seq 1 30); do CHAIN="$CHAIN && node tools/check.mjs слово${word}"; done
c "SC-AK-1136 — a sed chain over 60 words passes" "$CHAIN" PASS
c "SC-AK-1136 — printf of officialese into a .md is refused" \
    "${CHAIN} && printf '%s\\n' 'Проверка является инструментом контроля.' > docs/x.md" deny
c "SC-AK-1136 — печать группы в документ судится" \
    '{ printf "# Заголовок\n"; echo "Данный этап является закрытым."; } > docs/x.md' deny
c "SC-AK-1136 — печать в трубу до tee судится" \
    'echo "Данный этап является закрытым." | tee docs/x.md' deny
c "SC-AK-1136 — печать без кавычек судится" 'echo Данный этап является закрытым > docs/x.md' deny
c "SC-AK-1136 — строка на входе судится" 'tee docs/x.md <<< "Данный этап является закрытым."' deny
# Формы, которыми текст попадает в документ без heredoc: судится всё, кроме частей, которые текста не несут.
BAD='Данный этап является закрытым.'
c "SC-AK-1136 — запись кодом node судится" "node -e \"require('fs').writeFileSync('docs/x.md','$BAD')\"" deny
c "SC-AK-1136 — запись кодом python судится" "python3 -c \"open('docs/x.md','w').write('$BAD')\"" deny
c "SC-AK-1136 — печать в цикле судится" "for i in 1; do echo '$BAD'; done > docs/x.md" deny
c "SC-AK-1136 — текст переменной судится" "T='$BAD'; echo \"\$T\" > docs/x.md" deny
c "SC-AK-1136 — печать через exec судится" "exec > docs/x.md; echo '$BAD'" deny
c "SC-AK-1136 — текст после перенаправления судится" "echo > docs/x.md '$BAD'" deny
c "SC-AK-1136 — перенаправление перед печатью судится" "> docs/x.md echo '$BAD'" deny
c "SC-AK-1136 — печать по полному пути судится" "/usr/bin/printf '%s' '$BAD' > docs/x.md" deny
c "SC-AK-1136 — печать кодом awk судится" "awk 'BEGIN{print \"$BAD\"}' > docs/x.md" deny
c "SC-AK-1136 — новый текст замены sed судится" "sed -i '' 's/старое/$BAD/' docs/x.md" deny
c "SC-AK-1136 — прежняя редакция в замене sed не судится" "sed -i '' 's/$BAD/Этап закрыт./' docs/x.md" PASS
c "SC-AK-1136 — печать sed в документ судится" "sed 's/^/$BAD/' docs/y.md > docs/x.md" deny
c "SC-AK-1136 — текст export судится" "export T='$BAD'; echo \"\$T\" > docs/x.md" deny
c "SC-AK-1136 — печать jq судится" "jq -rn '\"$BAD\"' > docs/x.md" deny
c "SC-AK-1136 — формат git судится" "git log --format='$BAD' > docs/x.md" deny
c "SC-AK-1136 — текст внутри подстановки процесса судится" "cat <(echo '$BAD') > docs/x.md" deny
c "SC-AK-1136 — текст, отданный сценарию, судится" "bash gen.sh '$BAD' > docs/x.md" deny
c "SC-AK-1136 — образец поиска не судится" "grep '$BAD' docs/y.md > docs/x.md" PASS
c "SC-AK-1136 — апостроф в комментарии печать не прячет" "$(printf "# it's the note\nprintf '%%s' '%s' > docs/x.md" "$BAD")" deny

# Текст берётся из тел heredoc: правка, несущая внутри команды прежнюю редакцию, отбивалась
# словами той редакции — и на второй попытке снова, потому что старый текст оставался в команде.
c "SC-AK-1136 — прежняя редакция вне тела heredoc не судится" \
    "$(printf 'cat > docs/x.md <<MD\nчистая строка\nMD\nprintf "Данный является инструментом" # прежняя редакция\n')" PASS
c "SC-AK-1136 — канцелярит внутри тела heredoc отбивается по-прежнему" \
    "$(printf 'cat > docs/x.md <<MD\nДанный этап является закрытым.\nMD')" deny

# Граница суждения — корень дерева: черновик в системном временном каталоге ничей.
root_case() {
    CLAUDE_PROJECT_DIR=/репозиторий expect_decision "$1" prose-style-guard.sh "$(edit_in "$2" "$3")" "$4"
}
root_case "SC-AK-1137 — документ вне корня дерева не судится" \
    /tmp/проба/x.md 'Данный разбор является записью.' PASS
root_case "SC-AK-1137 — документ внутри корня судится по-прежнему" \
    /репозиторий/docs/x.md 'Данный разбор является записью.' deny

expect_reason "и отказ называет замену" prose-style-guard.sh \
    "$(edit_in /репозиторий/docs/x.md 'Проверка является инструментом.')" 'глаголом'

exit_code_of() {
    printf '%s' "$2" | "$HOOKS/prose-style-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "правка без нового текста пропускается" \
    "$(jq -n '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:"/р/docs/x.md"}}')"

suite_result "гард слога"
