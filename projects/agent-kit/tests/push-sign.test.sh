#!/usr/bin/env bash
# Сценарии разбора команды перед пушем: что разбор `push-sign.sh` читает как пуш, как несколько
# пушей и как переключение ветки.
#
# Стоит отдельным набором от гарда проверок перед пушем: здесь проверяется разбор формы команды,
# там — что гард делает с её итогом. Общий набор упёрся в предел длины; граница проведена по
# файлу разбора, а не по числу строк.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "разбор команды перед пушем"

# Набор в фикстуре красный: отказ значит, что разбор нашёл пуш, пропуск — что не нашёл.
gate() {
    local label="$1" dir="$2" cmd="$3" want="$4" out
    out="$(CLAUDE_PROJECT_DIR="$dir" input_cmd "$cmd" Bash "$dir" \
        | CLAUDE_PROJECT_DIR="$dir" "$HOOKS/git-guard-push-tests.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
    report "$label" "${out:-PASS}" "$want"
}

RED_GATE="$(fixture_repo RT-72-gate)"
mkdir -p "$RED_GATE/.claude/rt-kit"
printf 'rt_push_checks() { printf "%%s\\n" false; }\n' > "$RED_GATE/.claude/rt-kit/project.sh"

# SC-AK-1237. Команда разбирается так, как её читает оболочка. Разделитель в кавычках значения
# ключа не режет вызов; push внутри скобок, условия, цикла, подстановки, `bash -c` и `eval`
# исполняется и судится набором. Текст в кавычках и тело heredoc — данные.
gate "SC-AK-1237 — ключ -c с ; в кавычках пуш не прячет" "$RED_GATE" \
    "git -c 'http.extraheader=A; B' push origin RT-72-gate" deny
gate "SC-AK-1237 — ключ -c с & в кавычках пуш не прячет" "$RED_GATE" \
    "git -c 'http.extraheader=A & B' push origin RT-72-gate" deny
gate "SC-AK-1237 — ключ -c с | в кавычках пуш не прячет" "$RED_GATE" \
    "git -c 'http.extraheader=A | B' push origin RT-72-gate" deny
gate "SC-AK-1237 — пуш в фигурных скобках узнаётся" "$RED_GATE" '{ git push origin RT-72-gate; }' deny
gate "SC-AK-1237 — пуш в обратных кавычках узнаётся" "$RED_GATE" 'echo `git push origin RT-72-gate`' deny
gate "SC-AK-1237 — пуш в подстановке узнаётся" "$RED_GATE" 'echo "$(git push origin RT-72-gate)"' deny
gate "SC-AK-1237 — пуш в bash -c узнаётся" "$RED_GATE" "bash -c 'git push origin RT-72-gate'" deny
gate "SC-AK-1237 — пуш в eval узнаётся" "$RED_GATE" 'eval git push origin RT-72-gate' deny
gate "SC-AK-1237 — пуш в условии if узнаётся" "$RED_GATE" 'if git push origin RT-72-gate; then :; fi' deny
gate "SC-AK-1237 — пробный пуш рядом с настоящим набор не снимает" "$RED_GATE" \
    'git push --dry-run origin RT-72-gate && git push origin RT-72-gate' deny
gate "SC-AK-1237 — пуш в тексте в кавычках пушем не считается" "$RED_GATE" 'echo "x; git push "' PASS
gate "SC-AK-1237 — пуш в теле heredoc пушем не считается" "$RED_GATE" "cat > notes.txt <<'EOF'
git push origin RT-72-gate
EOF" PASS
gate "SC-AK-1237 — подстановка в heredoc без кавычек исполняется и судится" "$RED_GATE" 'cat > notes.txt <<EOF
$(git push origin RT-72-gate)
EOF' deny
gate "SC-AK-1237 — обратные кавычки в heredoc без кавычек исполняются и судятся" "$RED_GATE" 'cat > notes.txt <<-EOF
	`git push origin RT-72-gate`
	EOF' deny

# SC-AK-1237. Обёртка снимается вместе со своими ключами и их значениями. Ключ `-p` у `time`
# становился именем команды, и разбор до `git` не доходил.
gate "SC-AK-1237 — пуш под time -p узнаётся" "$RED_GATE" 'time -p git push origin RT-72-gate' deny
gate "SC-AK-1237 — пуш под timeout -s со значением узнаётся" "$RED_GATE" \
    'timeout -s KILL 600 git push origin RT-72-gate' deny
gate "SC-AK-1237 — пуш под sudo -u со значением узнаётся" "$RED_GATE" \
    'sudo -u builder git push origin RT-72-gate' deny
gate "SC-AK-1237 — пуш в строке env -S узнаётся" "$RED_GATE" \
    "env -S 'git push origin RT-72-gate'" deny
gate "SC-AK-1237 — пуш под xargs узнаётся" "$RED_GATE" \
    'printf "%s\n" RT-72-gate | xargs -I {} git push origin {}' deny
gate "SC-AK-1237 — пуш под parallel узнаётся" "$RED_GATE" \
    'parallel -j 2 git push origin ::: RT-72-gate' deny
gate "SC-AK-1237 — пуш под find -exec узнаётся" "$RED_GATE" \
    'find . -maxdepth 0 -exec git push origin RT-72-gate \;' deny

# SC-AK-1237. Тело функции исполняется только при вызове. Определение без вызова ничего не шлёт,
# а вызов судится так же, как пуш в самой команде.
gate "SC-AK-1237 — определение функции без вызова пушем не считается" "$RED_GATE" \
    'f() { git push origin RT-72-gate; }' PASS
gate "SC-AK-1237 — определение через function без вызова пушем не считается" "$RED_GATE" \
    'function f { git push origin RT-72-gate; }' PASS
gate "SC-AK-1237 — вызов функции с пушем судится" "$RED_GATE" \
    'f() { git push origin RT-72-gate; }; f' deny
gate "SC-AK-1237 — пуш после определения функции судится" "$RED_GATE" \
    'f() { echo; }; git push origin RT-72-gate' deny
gate "SC-AK-1237 — тело функции после fi без разделителя не съедает пуш за ней" "$RED_GATE" \
    'f() { if true; then :; fi }; git push origin RT-72-gate' deny
gate "SC-AK-1237 — функция с телом в круглых скобках судится при вызове" "$RED_GATE" \
    'f() ( git push origin RT-72-gate ); f' deny
gate "SC-AK-1237 — функция, передающая слова вызова в git, судится" "$RED_GATE" \
    'f() { git "$@"; }; f push origin RT-72-gate' deny
gate "SC-AK-1237 — функция с именем git пуш через command не прячет" "$RED_GATE" \
    'git() { :; }; command git push origin RT-72-gate' deny
gate "SC-AK-1237 — функция git в подоболочке пуш за ней не прячет" "$RED_GATE" \
    '(git() { :; }); git push origin RT-72-gate' deny

# SC-AK-1237. Формы, которые разбор сначала читал неверно. Апостроф в heredoc внутри подстановки
# съедал весь текст за собой — это обычная форма коммита перед пушем. Перенос строки с отступом
# давал пустое слово на месте команды. `$'…\'…'` закрывал кавычку раньше времени.
gate "SC-AK-1237 — апостроф в heredoc внутри подстановки пуш за ней не прячет" "$RED_GATE" \
    'git commit -qm "$(cat <<'"'"'EOF'"'"'
don'"'"'t break
EOF
)" && git push origin RT-72-gate' deny
gate "SC-AK-1237 — пуш за переносом строки с отступом узнаётся" "$RED_GATE" 'cd . && \
  git push origin RT-72-gate' deny
gate "SC-AK-1237 — пуш за строкой \$'"'"'…'"'"' узнаётся" "$RED_GATE" \
    "echo \$'it\\'s'; git push origin RT-72-gate" deny

# SC-AK-1237. Оболочка, которой команды даны во входе, исполняет их целиком. Heredoc такой
# оболочке разбирается целиком; вход из конвейера разбору не виден, и команда отбивается.
gate "SC-AK-1237 — пуш в heredoc для bash узнаётся" "$RED_GATE" "bash <<'EOF'
git push origin RT-72-gate
EOF" deny
gate "SC-AK-1237 — пуш во входе bash из конвейера отбит" "$RED_GATE" \
    "echo 'git push origin RT-72-gate' | bash" deny
gate "SC-AK-1237 — пуш в heredoc для bash /dev/stdin узнаётся" "$RED_GATE" "bash /dev/stdin <<'EOF'
git push origin RT-72-gate
EOF" deny
gate "SC-AK-1237 — пуш в строке <<< для source /dev/stdin узнаётся" "$RED_GATE" \
    '. /dev/stdin <<<"git push origin RT-72-gate"' deny
gate "SC-AK-1237 — скрипт из файла во входе bash не читается и не отбивается" "$RED_GATE" \
    'bash < scripts/push-release.sh' PASS
gate "SC-AK-1237 — слово push без git во входе bash не отбивается" "$RED_GATE" \
    'echo pushd | bash' PASS

# SC-AK-1237. Формы второго раунда ревью: zsh закрывает `}` без `;`, `<<<` внутри `$( )` — не
# heredoc, `<<` в арифметике — сдвиг, модификаторы zsh стоят перед командой.
gate "SC-AK-1237 — } без ; в zsh не съедает пуш за функцией" "$RED_GATE" \
    'f() { echo x }; git push origin RT-72-gate' deny
gate "SC-AK-1237 — <<< внутри подстановки пуш за ней не прячет" "$RED_GATE" \
    'x=$(cat <<<")"; echo); git push origin RT-72-gate' deny
gate "SC-AK-1237 — сдвиг << в арифметике пуш за ним не прячет" "$RED_GATE" '(( y = 1 << 2 ))
git push origin RT-72-gate' deny
gate "SC-AK-1237 — пуш под noglob узнаётся" "$RED_GATE" 'noglob git push origin RT-72-gate' deny
gate "SC-AK-1237 — пуш через =git узнаётся" "$RED_GATE" '=git push origin RT-72-gate' deny
gate "SC-AK-1237 — пуш в безымянной функции zsh узнаётся" "$RED_GATE" \
    'function { git push origin RT-72-gate; }' deny

# SC-AK-1237. Без perl разбора нет, и проверка пропускает команду, как при любой своей поломке.
# Сначала проверяется, что в урезанном пути perl действительно нет, иначе случай зелёный зря.
NOPERL="$(mktemp -d)"
for d in /bin /usr/bin "$(dirname "$(command -v jq)")" "$(dirname "$(command -v git)")"; do
    for f in "$d"/*; do
        case "${f##*/}" in perl*) continue ;; esac
        [ -e "$NOPERL/${f##*/}" ] || ln -s "$f" "$NOPERL/${f##*/}"
    done
done
gate "SC-AK-1237 — тот же пуш с perl отбит красным набором" "$RED_GATE" 'git push origin RT-72-gate' deny
noperl="$(PATH="$NOPERL" command -v perl || echo absent)"
report "SC-AK-1237 — в урезанном пути perl нет" "$noperl" absent
out="$(CLAUDE_PROJECT_DIR="$RED_GATE" input_cmd 'git push origin RT-72-gate' Bash "$RED_GATE" \
    | PATH="$NOPERL" CLAUDE_PROJECT_DIR="$RED_GATE" "$HOOKS/git-guard-push-tests.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
report "SC-AK-1237 — без perl проверка пропускает пуш" "${out:-PASS}" PASS
rm -rf "$NOPERL"

# SC-AK-1238. Несколько получателей в одном пуше — несколько пушей: набор судит только текущую
# ветку. Цикл ищется по всему тексту команды, а не по строке. Набор здесь зелёный: отказ даёт
# только разбор получателей.
printf 'rt_push_checks() { printf "%%s\\n" true; }\n' > "$RED_GATE/.claude/rt-kit/project.sh"
gate "SC-AK-1238 — пуш --all отбит" "$RED_GATE" 'git push --all origin' deny
gate "SC-AK-1238 — пуш --mirror отбит" "$RED_GATE" 'git push --mirror origin' deny
gate "SC-AK-1238 — две ветки одним пушем отбиты" "$RED_GATE" 'git push origin RT-72-gate RT-72-other' deny
gate "SC-AK-1238 — цикл в несколько строк отбит" "$RED_GATE" 'for b in a b; do
    git push origin "$b"
done' deny
gate "SC-AK-1238 — пуш одной ветки с -u проходит" "$RED_GATE" 'git push -u origin RT-72-gate' PASS
gate "SC-AK-1238 — пуш одной ветки с ключом и значением проходит" "$RED_GATE" \
    'git push --push-option ci.skip origin RT-72-gate' PASS
gate "SC-AK-1238 — пуш со ссылкой источник:цель проходит" "$RED_GATE" \
    'git push origin HEAD:RT-72-gate' PASS
gate "SC-AK-1238 — пуш шаблоном ссылок отбит" "$RED_GATE" \
    "git push origin 'refs/heads/*:refs/heads/*'" deny
gate "SC-AK-1238 — пуш в условии цикла while отбит" "$RED_GATE" \
    'while git push origin RT-72-gate; do :; done' deny
gate "SC-AK-1238 — пуш после цикла проходит" "$RED_GATE" \
    'for f in a; do echo "$f"; done; git push origin RT-72-gate' PASS
gate "SC-AK-1238 — пуш после if проходит" "$RED_GATE" \
    'if true; then echo; fi; git push origin RT-72-gate' PASS
gate "SC-AK-1238 — пуш внутри if проходит" "$RED_GATE" \
    'if true; then git push origin RT-72-gate; fi' PASS
gate "SC-AK-1238 — одна ветка через подстановку проходит" "$RED_GATE" \
    'git push origin "$(git branch --show-current)"' PASS
gate "SC-AK-1238 — значение ключа с пробелом проходит" "$RED_GATE" \
    'git push --push-option="a b" origin RT-72-gate' PASS
gate "SC-AK-1238 — значение --receive-pack с пробелом проходит" "$RED_GATE" \
    'git push --receive-pack="git receive-pack" origin RT-72-gate' PASS
gate "SC-AK-1238 — удаление двух веток получателей не считает" "$RED_GATE" \
    'git push origin :a :b' PASS
gate "SC-AK-1238 — перенаправление вывода получателем не считается" "$RED_GATE" \
    'git push origin RT-72-gate 2>&1' PASS
gate "SC-AK-1238 — две ссылки после --repo отбиты" "$RED_GATE" \
    'git push --repo origin RT-72-gate RT-72-other' deny
gate "SC-AK-1238 — одна ссылка после --repo проходит" "$RED_GATE" \
    'git push --repo=origin RT-72-gate' PASS
gate "SC-AK-1238 — пуш под xargs — пуш на каждый вход, отбит" "$RED_GATE" \
    'printf "%s\n" a b | xargs -n 1 git push origin' deny
gate "SC-AK-1238 — вызов функции с пушем в цикле отбит" "$RED_GATE" \
    'f() { git push origin "$1"; }; for b in a b; do f "$b"; done' deny

# SC-AK-405. Переключение ветки внутри bash -c и eval находится тем же разбором, что и пуш.
gate "SC-AK-405 — переключение и пуш в bash -c отбиты" "$RED_GATE" \
    "bash -c 'git checkout main && git push origin RT-72-gate'" deny
gate "SC-AK-405 — переключение и пуш в eval отбиты" "$RED_GATE" \
    'eval "git checkout main && git push origin RT-72-gate"' deny
gate "SC-AK-406 — заведение ветки в bash -c пуш не отбивает" "$RED_GATE" \
    "bash -c 'git checkout -b RT-72-gate && git push origin RT-72-gate'" PASS
gate "SC-AK-405 — новая ветка от другой точки — другое дерево, отбита" "$RED_GATE" \
    'git checkout -b RT-72-gate origin/main && git push -u origin RT-72-gate' deny
gate "SC-AK-405 — переход на PR через gh перед пушем отбит" "$RED_GATE" \
    'gh pr checkout 12 && git push origin RT-72-gate' deny
gate "SC-AK-406 — восстановление файлов после -- переключением не считается" "$RED_GATE" \
    'git checkout -- notes.txt && git push origin RT-72-gate' PASS
gate "SC-AK-406 — switch -C от текущей вершины переключением не считается" "$RED_GATE" \
    'git switch -C RT-72-gate && git push origin RT-72-gate' PASS
gate "SC-AK-406 — переключение после пуша набор не обманывает" "$RED_GATE" \
    'git push origin RT-72-gate && git checkout main' PASS
gate "SC-AK-1238 — раскрытие фигурных скобок — две ветки, отбито" "$RED_GATE" \
    'git push origin {RT-72-gate,RT-72-other}' deny
gate "SC-AK-1238 — функция, передающая две ветки в push, отбита" "$RED_GATE" \
    'p() { git push "$@"; }; p origin RT-72-gate RT-72-other' deny
gate "SC-AK-1238 — пуш под watch повторяется и отбит" "$RED_GATE" \
    'watch -n 5 git push origin RT-72-gate' deny
gate "SC-AK-1238 — пуш в цикле foreach zsh отбит" "$RED_GATE" 'foreach b (a b)
git push origin "$b"
end' deny
gate "SC-AK-1238 — функция с \${@:1} и двумя ветками отбита" "$RED_GATE" \
    'f() { git push "${@:1}"; }; f origin RT-72-gate RT-72-other' deny
gate "SC-AK-1238 — пуш в группе с } без ; — одна ветка, проходит" "$RED_GATE" \
    '{ git push origin RT-72-gate }' PASS
gate "SC-AK-405 — gh с ключом -R перед pr checkout отбит" "$RED_GATE" \
    'gh -R x/y pr checkout 12 && git push origin RT-72-gate' deny
gate "SC-AK-406 — git checkout . переключением не считается" "$RED_GATE" \
    'git checkout . && git push origin RT-72-gate' PASS
gate "SC-AK-406 — слитный -bимя переключением не считается" "$RED_GATE" \
    'git checkout -bRT-72-gate && git push origin RT-72-gate' PASS

# SC-AK-405, SC-AK-406. Точка старта новой ветки решает, сменилось ли дерево. Слитное имя `-bимя`
# — значение ключа, а не точка старта; `HEAD` и `@` — текущая вершина; `-` — предыдущая ветка;
# `--` после точки старта её не отменяет. Без нового имени слова после первого — пути: файлы
# восстанавливаются из него, ветка остаётся та же. Так же `--ours`, `-p` и `--pathspec-from-file`.
for form in 'checkout -bRT-72-new origin/main' 'switch -cRT-72-new origin/main' \
    'checkout -BRT-72-new origin/main' 'switch -CRT-72-new origin/main' \
    'checkout -b RT-72-new -' 'checkout -b RT-72-new main --' 'checkout main --' 'switch main --' \
    'switch --orphan RT-72-new' 'checkout main' 'checkout -f main' 'checkout --detach main' \
    'switch --detach main'; do
    gate "SC-AK-405 — git $form перед пушем — другое дерево, отбито" "$RED_GATE" \
        "git $form && git push origin RT-72-new" deny
done
for form in 'checkout -b RT-72-new HEAD' 'switch -c RT-72-new HEAD' 'checkout -b RT-72-new @' \
    'checkout main -- notes.txt' 'checkout -bRT-72-new HEAD' 'checkout -b RT-72-new --conflict merge' \
    'checkout -b RT-72-new head' 'checkout --orphan RT-72-new' 'checkout main .' \
    'checkout main notes.txt' 'checkout main notes.txt other.txt' 'checkout -b RT-72-new .' \
    'checkout -b RT-72-new main notes.txt' 'checkout --ours notes.txt' 'checkout --theirs notes.txt' \
    'checkout -p main' 'checkout --pathspec-from-file=list main' 'checkout --detach'; do
    gate "SC-AK-406 — git $form перед пушем — дерево то же, проходит" "$RED_GATE" \
        "git $form && git push origin RT-72-new" PASS
done
gate "SC-AK-1238 — пуш за переносом строки — одна ветка, проходит" "$RED_GATE" 'git push \
  origin RT-72-gate' PASS
gate "SC-AK-1238 — слитный ключ -vn — пробный пуш, проходит" "$RED_GATE" \
    'git push -vn origin RT-72-gate RT-72-other' PASS
rm -rf "$RED_GATE"

suite_result "разбор команды перед пушем"
