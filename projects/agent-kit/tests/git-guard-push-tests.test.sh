#!/usr/bin/env bash
# Сценарии гарда проверок перед пушем: что считается вызовом пуша и что гонится до него.
#
# Стоит отдельным набором от гардов поставки: гард здесь другой, и репозитории он заводит свои —
# каждому нужен профиль дерева со своим набором проверок. Общий набор рос вместе с обоими и
# упёрся в предел длины; граница проведена по гарду, а не по числу строк.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард проверок перед пушем"

# --- гард проверок перед пушем -----------------------------------------------------------------
# SC-AK-258, SC-AK-259. Пуш здесь идёт с ключами между `git` и `push` — помощник учётных данных
# и заголовок запроса, — и подстрокой «git push» его не поймать. Пока признаком была подстрока,
# весь набор гейта на таком пуше не гонялся вовсе, а молчание гарда читалось как «зелено»:
# наведённое расхождение раскладки прошло в удалённое дерево, не задев ни одной проверки.
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
gate "SC-AK-258 — красная проверка отбивает пуш" "$RED_GATE" 'git push origin RT-72-gate' deny
gate "SC-AK-259 — пуш с ключами между командой и подкомандой узнаётся" "$RED_GATE" \
    'git -c credential.helper= -c http.extraheader="AUTHORIZATION: basic x" push -u origin RT-72-gate' deny
gate "SC-AK-259 — пуш за разделителем узнаётся" "$RED_GATE" \
    'TOKEN=$(cat t) && git -c http.extraheader="AUTHORIZATION: basic x" push origin RT-72-gate' deny
gate "пробный пуш набора не гоняет" "$RED_GATE" 'git push --dry-run origin RT-72-gate' PASS
gate "чтение истории пушем не считается" "$RED_GATE" 'git log --oneline -5' PASS
gate "слово push без команды git пушем не считается" "$RED_GATE" 'npm run push' PASS

# SC-AK-1237. Пуш — подкоманда того же вызова git. Чтение запусков конвейера с отбором по событию
# push гоняло весь набор дольше десяти минут, а потом отбивало команду, которая ничего не шлёт.
gate "SC-AK-1237 — слово push в отборе другой команды пушем не считается" "$RED_GATE" \
    "git fetch origin && gh run list --json event --jq '.[] | select(.event == push)'" PASS
gate "SC-AK-1237 — слово push в тексте другой команды пушем не считается" "$RED_GATE" \
    'git fetch origin && echo push later' PASS
gate "SC-AK-1237 — слово push после ключа git пушем не считается" "$RED_GATE" \
    'git log --grep push -5' PASS
gate "SC-AK-1237 — пуш с ключами -c и -C узнаётся" "$RED_GATE" \
    'git -C . -c credential.helper= push origin RT-72-gate' deny
gate "SC-AK-1237 — пуш после другой команды git узнаётся" "$RED_GATE" \
    'git fetch origin && git push origin RT-72-gate' deny

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
gate "SC-AK-1238 — пуш за переносом строки — одна ветка, проходит" "$RED_GATE" 'git push \
  origin RT-72-gate' PASS
gate "SC-AK-1238 — слитный ключ -vn — пробный пуш, проходит" "$RED_GATE" \
    'git push -vn origin RT-72-gate RT-72-other' PASS
printf 'rt_push_checks() { printf "%%s\\n" false; }\n' > "$RED_GATE/.claude/rt-kit/project.sh"

# SC-AK-1239. Пуш, набранный во вкладке терминала сессии, судится как вызов оболочки.
terminal_gate() {
    local label="$1" dir="$2" cmd="$3" want="$4" out
    out="$(CLAUDE_PROJECT_DIR="$dir" input_cmd "$cmd" mcp__terminal__run_in_terminal "$dir" \
        | CLAUDE_PROJECT_DIR="$dir" "$HOOKS/git-guard-push-tests.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
    report "$label" "${out:-PASS}" "$want"
}
terminal_gate "SC-AK-1239 — пуш во вкладке терминала отбит красным набором" "$RED_GATE" \
    'git push origin RT-72-gate' deny

printf 'rt_push_checks() { printf "%%s\\n" true; }\n' > "$RED_GATE/.claude/rt-kit/project.sh"
gate "зелёный набор пуш не задерживает" "$RED_GATE" 'git push origin RT-72-gate' PASS
rm -rf "$RED_GATE"

# --- SC-AK-1077, SC-AK-1078. Вызов из второй рабочей копии ------------------------------------
# Вторую копию берут для чтения: слияние главной идёт на ней, пока в копии сессии лежит чужая
# незакоммиченная работа. Вызов, сделанный оттуда, судился копией сессии — то есть чужим деревом:
# её устаревший архив и недописанное описание отбивали вызов, а вклад, который уезжал на хостинг,
# не проверялся вовсе.
#
# Вторая копия — тот же общий каталог `.git` под другим корнем, поэтому она заводится настоящей:
# `git worktree add` от репозитория сессии.
GREEN_GATE="$(fixture_repo_branched main RT-73-gate)"
mkdir -p "$GREEN_GATE/.claude/rt-kit"
printf 'rt_push_checks() { printf "%%s\\n" true; }\n' > "$GREEN_GATE/.claude/rt-kit/project.sh"
SECOND_HOME="$(mktemp -d)"
SECOND="$SECOND_HOME/second"
git -C "$GREEN_GATE" worktree add -q -b RT-73-second "$SECOND" main 2>/dev/null

gate "SC-AK-1077 — вызов из второй копии отбит" "$GREEN_GATE" \
    "cd $SECOND && git push origin RT-73-second" deny
gate "SC-AK-1078 — переход в свой же корень вызов не отбивает" "$GREEN_GATE" \
    "cd $GREEN_GATE && git push origin RT-73-gate" PASS
gate "SC-AK-1078 — вызов без перехода идёт как прежде" "$GREEN_GATE" \
    'git push origin RT-73-gate' PASS
rm -rf "$SECOND_HOME" "$GREEN_GATE"

# --- SC-AK-1173. Вызов в чужом репозитории этот гард не судит ----------------------------------
# Корень чужого репозитория не совпадает с корнем сессии всегда. Пока вторую копию узнавали по
# корню, сессия одного дерева не могла отправить ветку в другой репозиторий вовсе. Набор дерева
# сессии здесь красный нарочно: по нему видно, что за чужой вызов гард его не гонит.
OWN_RED="$(fixture_repo RT-74-own)"
mkdir -p "$OWN_RED/.claude/rt-kit"
printf 'rt_push_checks() { printf "%%s\\n" false; }\n' > "$OWN_RED/.claude/rt-kit/project.sh"
FOREIGN="$(fixture_repo RT-74-foreign)"

gate "SC-AK-1173 — вызов в чужом репозитории проходит" "$OWN_RED" \
    "cd $FOREIGN && git push origin RT-74-foreign" PASS
gate "SC-AK-1173 — свой вызов судится своим набором как прежде" "$OWN_RED" \
    'git push origin RT-74-own' deny
rm -rf "$OWN_RED" "$FOREIGN"

# --- SC-AK-851. У красного по вине самой проверки есть свой ход --------------------------------
# Гард проверяет код возврата и двух родов красного не различает. Когда ошибается сама проверка,
# текст «почини и пушь снова» велит чинить код, которого никто не трогал: разобранный однажды
# отказ целиком лежал в документах, не тронутых ни одним коммитом ветки.
WAYS="$(fixture_repo RT-1701-ways)"
mkdir -p "$WAYS/.claude/rt-kit"
printf 'rt_push_checks() { printf "%%s\\n" false; }\n' > "$WAYS/.claude/rt-kit/project.sh"
ways_says="$(CLAUDE_PROJECT_DIR="$WAYS" input_cmd 'git push origin RT-1701-ways' Bash "$WAYS" \
    | CLAUDE_PROJECT_DIR="$WAYS" "$HOOKS/git-guard-push-tests.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null)"
case "$ways_says" in
    *'Three moves from here'*) report "SC-AK-851 — отказ называет три хода" да да ;;
    *) report "SC-AK-851 — отказ называет три хода" "нет" да ;;
esac
case "$ways_says" in
    *'fix the check itself'*) report "SC-AK-851 — среди них починка самой проверки" да да ;;
    *) report "SC-AK-851 — среди них починка самой проверки" "нет" да ;;
esac
case "$ways_says" in
    *'What is in dispute is not added to the known list'*) report "SC-AK-851 — список известного назван неверным вариантом" да да ;;
    *) report "SC-AK-851 — список известного назван неверным вариантом" "нет" да ;;
esac
rm -rf "$WAYS"

# --- SC-AK-835. Строка наблюдения на каждый исход ----------------------------------------------
# Гард, пишущий только отбои, отвечает на один вопрос из трёх: сколько пушей он остановил.
# «Набор прогнан и зелёный» и «набора не нашлось» выглядят в записи одинаково — молчанием, — и
# гейт, не гонявший ни одной проверки за неделю, неотличим от гейта, у которого всё зелено.
NOTED="$(fixture_repo RT-1690-noted)"
mkdir -p "$NOTED/.claude/rt-kit"
noted_says() {
    cat "$NOTED/.claude/rt-kit/observations/"*.jsonl 2>/dev/null | grep -c "\"ev\":\"push-gate\".*\"res\":\"$1\""
}

printf 'rt_push_checks() { printf "%%s\\n" true; }\n' > "$NOTED/.claude/rt-kit/project.sh"
gate "зелёный набор пуш не задерживает" "$NOTED" 'git push origin RT-1690-noted' PASS
report "SC-AK-835 — зелёный набор записан" "$(noted_says green)" 1

printf 'rt_push_checks() { printf "%%s\\n" false; }\n' > "$NOTED/.claude/rt-kit/project.sh"
gate "красный набор пуш отбивает" "$NOTED" 'git push origin RT-1690-noted' deny
report "SC-AK-835 — красный набор записан" "$(noted_says red)" 1

printf 'rt_push_checks() { :; }\n' > "$NOTED/.claude/rt-kit/project.sh"
gate "пустой набор пуш не задерживает" "$NOTED" 'git push origin RT-1690-noted' PASS
report "SC-AK-835 — ненайденный набор записан" "$(noted_says no-checks)" 1
rm -rf "$NOTED"

# SC-AK-678, SC-AK-679. Проверка, которой нечего смотреть, выходит кодом пропуска. Прежде такой
# исход был нулём: в наборе он стоял рядом с пройденными и ничем от них не отличался, и сводка
# читалась как проверенная целиком. Пуш он не отбивает — поломкой пропуск не является, — но
# называется вслух, иначе всё вернулось бы к молчаливому нулю.
SKIP_GATE="$(fixture_repo RT-1202-skip)"
mkdir -p "$SKIP_GATE/.claude/rt-kit"
printf 'rt_push_checks() { printf "%%s\\n" "exit 7"; }\n' > "$SKIP_GATE/.claude/rt-kit/project.sh"
gate "SC-AK-679 — пропуск пуш не отбивает" "$SKIP_GATE" 'git push origin RT-1202-skip' PASS

skip_says="$(CLAUDE_PROJECT_DIR="$SKIP_GATE" input_cmd 'git push origin RT-1202-skip' Bash "$SKIP_GATE" \
    | CLAUDE_PROJECT_DIR="$SKIP_GATE" "$HOOKS/git-guard-push-tests.sh" 2>&1 >/dev/null)"
case "$skip_says" in
    *'exit 7'*) report "SC-AK-679 — пропущенная проверка названа вслух" да да ;;
    *) report "SC-AK-679 — пропущенная проверка названа вслух" нет да ;;
esac
rm -rf "$SKIP_GATE"

# SC-AK-405…407. Составная «переключиться и запушить» проходила гейт молча: набор гоняется в том
# дереве, какое лежит на момент разбора команды, то есть по прежней ветке. Зелёный набор при этом
# читается как проверка ушедшего. Набор здесь зелёный намеренно — судится не он, а сама форма
# команды: отказ обязан прийти раньше, чем гард дойдёт до прогона.
SWITCH_GATE="$(fixture_repo RT-73-switch)"
mkdir -p "$SWITCH_GATE/.claude/rt-kit"
printf 'rt_push_checks() { printf "%%s\\n" true; }\n' > "$SWITCH_GATE/.claude/rt-kit/project.sh"
gate "SC-AK-405 — переключение и пуш одной командой отбиваются" "$SWITCH_GATE" \
    'git checkout RT-73-switch && git push origin RT-73-switch' deny
gate "SC-AK-405 — то же через switch" "$SWITCH_GATE" \
    'git switch RT-73-switch && git push origin RT-73-switch' deny
gate "SC-AK-406 — заведение новой ветки в той же команде пуш не отбивает" "$SWITCH_GATE" \
    'git checkout -b RT-74-fresh && git push -u origin RT-74-fresh' PASS
gate "SC-AK-406 — то же через switch -c" "$SWITCH_GATE" \
    'git switch -c RT-74-fresh && git push -u origin RT-74-fresh' PASS
gate "SC-AK-872 — заведение с флагом перед -b — новая ветка, а не переключение" "$SWITCH_GATE" \
    'git checkout -q -b RT-74-fresh && git push -u origin RT-74-fresh' PASS
gate "SC-AK-407 — пробный пуш формы команды не судит" "$SWITCH_GATE" \
    'git checkout RT-73-switch && git push --dry-run origin RT-73-switch' PASS

# SC-AK-1204. Одна команда — одна проверка одного дерева. Два пуша в команде или пуш в цикле
# отправляют ветки, которых набор не видел.
gate "SC-AK-1204 — два пуша одной командой отбиваются" "$SWITCH_GATE" \
    'git push origin RT-73-switch && git push origin RT-74-other' deny
gate "SC-AK-1204 — пуш в цикле отбит" "$SWITCH_GATE" \
    'for b in RT-73-switch RT-74-other; do git push origin "$b"; done' deny
gate "SC-AK-1204 — один пуш проходит" "$SWITCH_GATE" \
    'git push -u origin RT-73-switch' PASS
gate "SC-AK-1204 — слово for в сообщении коммита циклом не считается" "$SWITCH_GATE" \
    'git commit -qm "fix for loop" && git push -u origin RT-73-switch' PASS

# SC-AK-408. Отложенная правка наружу ничего не отправляет, а слово `push` в ней стоит отдельным:
# набор гейта гонялся на ней целиком и отбивал вызов первой же красной проверкой.
gate "SC-AK-408 — отложенная правка пушем не считается" "$SWITCH_GATE" \
    'git stash push -u -m проба' PASS

# Тайник рядом с настоящим пушем признака не гасит: вырезается он, а не вся команда. Набор здесь
# красный намеренно — иначе «прошло» значило бы только, что гонять было нечего.
STASH_GATE="$(fixture_repo RT-75-stash)"
mkdir -p "$STASH_GATE/.claude/rt-kit"
printf 'rt_push_checks() { printf "%%s\\n" false; }\n' > "$STASH_GATE/.claude/rt-kit/project.sh"
gate "SC-AK-408 — тайник признака настоящего пуша не гасит" "$STASH_GATE" \
    'git stash push -u && git push origin RT-75-stash' deny
gate "SC-AK-408 — один тайник набора не гоняет" "$STASH_GATE" \
    'git stash push -u -m проба' PASS
rm -rf "$STASH_GATE"

CLAUDE_PROJECT_DIR="$SWITCH_GATE" expect_reason "SC-AK-405 — отказ называет законный ход" \
    git-guard-push-tests.sh \
    "$(input_cmd 'git checkout RT-73-switch && git push origin RT-73-switch' Bash "$SWITCH_GATE")" \
    'Split the calls'
rm -rf "$SWITCH_GATE"

# --- SC-AK-820 — чем набор гейта уже набора конвейера --------------------------------------
# Правило требует, чтобы гейт не был уже конвейера, а собрать это требование нечем: файл
# конвейера у каждого дерева свой. Молчание при этом читается как «проверено всё», и расхождение
# узнаётся из красного конвейера после заявки. Говорится оно один раз за сессию — на каждый пуш
# та же строка повторялась бы за заход десятки раз.
GAP_GATE="$(fixture_repo RT-76-gap)"
mkdir -p "$GAP_GATE/.claude/rt-kit"
printf 'rt_push_checks() { printf "%%s\\n" true; }\n' > "$GAP_GATE/.claude/rt-kit/project.sh"

gap_says() {
    CLAUDE_PROJECT_DIR="$GAP_GATE" jq -n --arg c 'git push origin RT-76-gap' --arg d "$GAP_GATE" --arg s "$1" \
        '{session_id:$s,cwd:$d,tool_name:"Bash",tool_input:{command:$c}}' \
        | CLAUDE_PROJECT_DIR="$GAP_GATE" "$HOOKS/git-guard-push-tests.sh" 2>&1 >/dev/null \
        | grep -c 'not the pipeline set'
}

GAP_SESSION="gap-$$-$RANDOM"
rm -f "${TMPDIR:-/tmp}/rt-kit-push-gate-gap-$GAP_SESSION"
report "SC-AK-820 — первый пуш сессии называет разницу с конвейером" "$(gap_says "$GAP_SESSION")" 1
report "SC-AK-820 — второй пуш той же сессии молчит" "$(gap_says "$GAP_SESSION")" 0
rm -f "${TMPDIR:-/tmp}/rt-kit-push-gate-gap-$GAP_SESSION"
rm -rf "$GAP_GATE"

suite_result "гард проверок перед пушем"

# --- SC-AK-1166. Один отказ называет все красные лёгкие проверки ------------------------------
# Набор выходил на первой красной, и каждая починка открывала следующую причину своим пушем: на
# одной ветке так ушло три пуша подряд. Тяжёлая проверка после первой красной не запускается —
# пуш всё равно отбит, — но называется отложенной, чтобы молчание о ней не читалось зелёным.
ALL_RED="$(fixture_repo RT-2302-all-red)"
mkdir -p "$ALL_RED/.claude/rt-kit"
cat > "$ALL_RED/.claude/rt-kit/project.sh" <<'PROFILE'
rt_push_checks() {
    printf '%s\n' 'echo first-red-output; false' 'true' 'echo second-red-output; exit 3' 'touch heavy-ran; false'
}
rt_push_check_heavy() { case "$1" in *heavy-ran*) return 0 ;; esac; return 1; }
PROFILE
all_red_says="$(CLAUDE_PROJECT_DIR="$ALL_RED" input_cmd 'git push origin RT-2302-all-red' Bash "$ALL_RED" \
    | CLAUDE_PROJECT_DIR="$ALL_RED" "$HOOKS/git-guard-push-tests.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null)"
case "$all_red_says" in
    *'first-red-output'*'second-red-output'*) report "SC-AK-1166 — отказ называет обе красные проверки" да да ;;
    *) report "SC-AK-1166 — отказ называет обе красные проверки" нет да ;;
esac
case "$all_red_says" in
    *'Red checks: 2'*) report "SC-AK-1166 — зелёная в число красных не попала" да да ;;
    *) report "SC-AK-1166 — зелёная в число красных не попала" нет да ;;
esac
report "SC-AK-1166 — тяжёлая после красной не запущена" "$([ -e "$ALL_RED/heavy-ran" ] && echo да || echo нет)" нет
case "$all_red_says" in
    *'Not started after the red ones'*'heavy-ran'*) report "SC-AK-1166 — отложенная тяжёлая названа" да да ;;
    *) report "SC-AK-1166 — отложенная тяжёлая названа" нет да ;;
esac
rm -rf "$ALL_RED"
