#!/usr/bin/env bash
# Сценарии гарда подписи машинного коммита: чей это коммит, той ли почтой он подписан и что
# делать, если не той.
#
# Свой набор, а не раздел в наборе гардов поставки: подпись — самый отдельный из его предметов,
# у неё своя точка проверки, свои условия молчания и свой отказ. Разошлись они по файлам не по
# вкусу, а по пределу длины: общий файл перерос пятьсот строк, и предел не двигают — делят.
#
# Ярус состояния задачи здесь не проверяется: он требует сети и помощника очереди работ, а
# набор обязан идти одинаково на любой машине.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "подпись машинного коммита"

# --- подпись машинного коммита -------------------------------------------------------------------
#
# Логин и почта здесь выдуманные: набор проверяет механику, а не карту дерева, в котором его
# запустили. Домен служебного адреса взят несуществующим намеренно — по нему видно, что ни в
# какой хостинг набор не ходит.

BOT_LOGIN='probe-bot'
BOT_MAIL="424242+${BOT_LOGIN}@users.noreply.example"
STRANGER_MAIL="111111+${BOT_LOGIN}@users.noreply.example"

# Репозиторий с объявленной машинной записью: вершина главной ветки есть, профиль называет
# почту. Логин гард читает из неё же.
sig_repo() {
    local dir
    dir="$(fixture_repo_branched main RT-70-signature)"
    git -C "$dir" update-ref refs/remotes/origin/main main 2>/dev/null
    mkdir -p "$dir/.claude/rt-kit"
    printf 'RT_COMMIT_EMAIL="%s"\n' "$BOT_MAIL" \
        > "$dir/.claude/rt-kit/project.sh"
    printf '%s' "$dir"
}

# Гард зовётся с корнем дерева фикстуры: профиль он ищет от него, а не от рабочего дерева.
sig() {
    local label="$1" dir="$2" cmd="$3" want="$4" out
    out="$(CLAUDE_PROJECT_DIR="$dir" input_cmd "$cmd" Bash "$dir" \
        | CLAUDE_PROJECT_DIR="$dir" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
    report "$label" "${out:-PASS}" "$want"
}

WRONG_SIG="$(sig_repo)"
fixture_commit_as "$WRONG_SIG" "$BOT_LOGIN" "$STRANGER_MAIL" src/probe.ts 'export const x = 1;' 'feat: правка'
sig "SC-AK-178 — чужая почта у машинного имени отбивает пуш" "$WRONG_SIG" 'git push origin RT-70-signature' deny
# Настоящий пуш идёт с ключами между `git` и `push`: помощник учётных данных и заголовок
# запроса. Подстрокой «git push» такую команду не поймать.
sig "пуш с ключами между командой и подкомандой узнаётся" "$WRONG_SIG" \
    'git -c credential.helper= -c http.extraheader="AUTHORIZATION: basic x" push -u origin RT-70-signature' deny
sig "SC-AK-184 — пробный пуш подписи не судит" "$WRONG_SIG" 'git push --dry-run origin RT-70-signature' PASS
sig "чтение истории пушем не считается" "$WRONG_SIG" 'git log --oneline -5' PASS
# Пуш набирают с подстановкой токена — этого требует соседняя проверка того же гарда. Признак,
# считавший вызовом только команду в начале строки, пропускал ровно ту форму, ради которой
# подпись и судится: коммит с чужим числом уехал в главную ветку мимо этого отказа.
sig "SC-AK-559 — вызов с подстановкой переменной судится наравне с голым" "$WRONG_SIG" \
    'GH_TOKEN="$TOKEN" git push origin RT-70-signature' deny
sig "SC-AK-559 — несколько присваиваний подряд вызова не скрывают" "$WRONG_SIG" \
    'TOKEN=x GH_TOKEN="$TOKEN" git push origin RT-70-signature' deny
sig "SC-AK-559 — присваивание без команды за ним вызовом не считается" "$WRONG_SIG" \
    'GH_TOKEN="$TOKEN"' PASS
sig "SC-AK-559 — упоминание команды в кавычках вызовом не становится" "$WRONG_SIG" \
    'echo "git push origin RT-70-signature"' PASS

CLAUDE_PROJECT_DIR="$WRONG_SIG" expect_reason "SC-AK-179 — отказ называет коммит и найденную почту" \
    git-guard-delivery.sh "$(input_cmd 'git push origin RT-70-signature' Bash "$WRONG_SIG")" \
    'Diverging: [0-9a-f]{7,} <111111'
CLAUDE_PROJECT_DIR="$WRONG_SIG" expect_reason "SC-AK-179 — отказ называет объявленную почту" \
    git-guard-delivery.sh "$(input_cmd 'git push origin RT-70-signature' Bash "$WRONG_SIG")" \
    'Declared: 424242'

# Дерево, не назвавшее почты, требования не получает: тот же коммит, профиль без объявления.
printf 'RT_COMMIT_EMAIL=""\n' > "$WRONG_SIG/.claude/rt-kit/project.sh"
sig "SC-AK-183 — дерево, не назвавшее почты, требования не получает" "$WRONG_SIG" \
    'git push origin RT-70-signature' PASS
printf 'RT_COMMIT_EMAIL="%s"\n' "$BOT_MAIL" > "$WRONG_SIG/.claude/rt-kit/project.sh"

# SC-AK-753 — подпись судится и на коммите, а не только на отправке
# Промах делается на коммите и до отправки успевает лечь в несколько коммитов подряд: каждый
# следующий берёт адрес у предыдущего. Судится при этом вклад, уже лежащий в ветке, а не текст
# команды: почта задаётся её переменными.
sig "SC-AK-753 — коммит поверх испорченного вклада отбивается" "$WRONG_SIG" \
    'git commit -m "feat: следующая правка"' deny
sig "SC-AK-753 — переписывание последнего коммита судится так же" "$WRONG_SIG" \
    'git commit --amend --no-edit' deny
sig "SC-AK-753 — слово команды внутри строки коммитом не считается" "$WRONG_SIG" \
    'echo "git commit -m x"' PASS

# Починка, названная в самом отказе, — тоже коммит. Без исключения гард отбивал её вместе со
# всеми, и выйти из круга его же способом было нельзя: расхождение снимается только коммитом,
# а коммит отбит, пока расхождение есть. Узнаётся починка по объявленной почте в обеих
# переменных рядом с правкой последнего коммита — подделать это значит поставить верную подпись.
sig "SC-AK-934 — починка, названная в отказе, проходит" "$WRONG_SIG" \
    "GIT_AUTHOR_EMAIL=\"$BOT_MAIL\" GIT_COMMITTER_EMAIL=\"$BOT_MAIL\" git commit --amend --no-edit --reset-author" PASS
sig "SC-AK-934 — та же починка в одинарных кавычках" "$WRONG_SIG" \
    "GIT_AUTHOR_EMAIL='$BOT_MAIL' GIT_COMMITTER_EMAIL='$BOT_MAIL' git commit --amend --no-edit --reset-author" PASS
sig "SC-AK-934 — та же починка без кавычек" "$WRONG_SIG" \
    "GIT_AUTHOR_EMAIL=$BOT_MAIL GIT_COMMITTER_EMAIL=$BOT_MAIL git commit --amend --no-edit --reset-author" PASS
sig "SC-AK-934 — чужая почта в переменных починкой не считается" "$WRONG_SIG" \
    "GIT_AUTHOR_EMAIL=\"$STRANGER_MAIL\" GIT_COMMITTER_EMAIL=\"$STRANGER_MAIL\" git commit --amend --no-edit" deny
sig "SC-AK-934 — одна переменная из двух починкой не считается" "$WRONG_SIG" \
    "GIT_AUTHOR_EMAIL=\"$BOT_MAIL\" git commit --amend --no-edit" deny
sig "SC-AK-934 — верные переменные без правки последнего коммита не пропускают обычный коммит" "$WRONG_SIG" \
    "GIT_AUTHOR_EMAIL=\"$BOT_MAIL\" GIT_COMMITTER_EMAIL=\"$BOT_MAIL\" git commit -m \"feat: следующая правка\"" deny
sig "SC-AK-934 — верные переменные и правка коммита пуш всё равно не пропускают" "$WRONG_SIG" \
    "GIT_AUTHOR_EMAIL=\"$BOT_MAIL\" GIT_COMMITTER_EMAIL=\"$BOT_MAIL\" git commit --amend --no-edit && git push origin RT-70-signature" deny
rm -rf "$WRONG_SIG"

RIGHT_SIG="$(sig_repo)"
fixture_commit_as "$RIGHT_SIG" "$BOT_LOGIN" "$BOT_MAIL" src/probe.ts 'export const x = 1;' 'feat: правка'
sig "SC-AK-180 — верная подпись пуш не задерживает" "$RIGHT_SIG" 'git push origin RT-70-signature' PASS
sig "SC-AK-753 — верная подпись коммит не задерживает" "$RIGHT_SIG" 'git commit -m "feat: ещё"' PASS
rm -rf "$RIGHT_SIG"

# Коммит, назвавшийся человеком, гард не судит: чужая работа своими руками в том же дереве.
HUMAN_SIG="$(sig_repo)"
fixture_commit_as "$HUMAN_SIG" 'Хозяин дерева' 'owner@example.com' src/probe.ts 'export const x = 1;' 'feat: правка'
sig "SC-AK-181 — коммит, назвавшийся человеком, не судится" "$HUMAN_SIG" 'git push origin RT-70-signature' PASS
rm -rf "$HUMAN_SIG"

# SC-AK-882 — коммит под записью, которой дерево не объявляло
# Прежде помощник судил только коммит, назвавшийся машинной записью: пять коммитов подряд под
# чужим логином в это условие не попадали вовсе. Вторая половина включается объявлением почт
# людей — без него требовать известной подписи от каждого коммита значило бы отбивать работу,
# сделанную человеком своими руками.
UNKNOWN_SIG="$(sig_repo)"
fixture_commit_as "$UNKNOWN_SIG" 'Кто-то ещё' 'someone@example.com' src/probe.ts 'export const x = 1;' 'feat: правка'
sig "SC-AK-882 — без объявленных почт людей чужая запись проходит" "$UNKNOWN_SIG" \
    'git push origin RT-70-signature' PASS
printf 'RT_COMMIT_EMAIL="%s"\nRT_HUMAN_EMAILS="owner@example.com"\n' "$BOT_MAIL" \
    > "$UNKNOWN_SIG/.claude/rt-kit/project.sh"
sig "SC-AK-882 — с объявленными почтами неизвестная запись отбивается" "$UNKNOWN_SIG" \
    'git push origin RT-70-signature' deny
CLAUDE_PROJECT_DIR="$UNKNOWN_SIG" expect_reason "SC-AK-882 — отказ называет коммит и его почту" \
    git-guard-delivery.sh "$(input_cmd 'git push origin RT-70-signature' Bash "$UNKNOWN_SIG")" \
    'Diverging: [0-9a-f]{7,} <someone@example.com>'
rm -rf "$UNKNOWN_SIG"

KNOWN_SIG="$(sig_repo)"
fixture_commit_as "$KNOWN_SIG" 'Хозяин дерева' 'owner@example.com' src/probe.ts 'export const x = 1;' 'feat: правка'
printf 'RT_COMMIT_EMAIL="%s"\nRT_HUMAN_EMAILS="owner@example.com"\n' "$BOT_MAIL" \
    > "$KNOWN_SIG/.claude/rt-kit/project.sh"
sig "SC-AK-882 — объявленная почта человека проходит" "$KNOWN_SIG" \
    'git push origin RT-70-signature' PASS
rm -rf "$KNOWN_SIG"

# Влитое в главную этой веткой уже не чинится: судится вклад ветки.
MERGED_SIG="$(fixture_repo_branched main RT-71-merged)"
git -C "$MERGED_SIG" checkout -q main 2>/dev/null
fixture_commit_as "$MERGED_SIG" "$BOT_LOGIN" "$STRANGER_MAIL" src/old.ts 'export const y = 2;' 'feat: старое'
git -C "$MERGED_SIG" update-ref refs/remotes/origin/main main 2>/dev/null
git -C "$MERGED_SIG" checkout -q RT-71-merged 2>/dev/null
git -C "$MERGED_SIG" merge -q main 2>/dev/null
mkdir -p "$MERGED_SIG/.claude/rt-kit"
printf 'RT_TASK_BOT="%s"\nRT_COMMIT_EMAIL="%s"\n' "$BOT_LOGIN" "$BOT_MAIL" \
    > "$MERGED_SIG/.claude/rt-kit/project.sh"
fixture_commit_as "$MERGED_SIG" "$BOT_LOGIN" "$BOT_MAIL" src/new.ts 'export const z = 3;' 'feat: новое'
sig "SC-AK-182 — судится вклад ветки, а не вся история" "$MERGED_SIG" 'git push origin RT-71-merged' PASS
rm -rf "$MERGED_SIG"

suite_result "подпись машинного коммита"
