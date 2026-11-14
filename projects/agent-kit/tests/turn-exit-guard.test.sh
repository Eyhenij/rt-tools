#!/usr/bin/env bash
# Сценарии стража выходов хода: чем ход кончается законно и что выходом не является.
#
# Проверяется механика, а не карта дерева: запись хода и папка задачи собираются здесь же.
# Страж судит пару — объявленное состояние работы и то, что за ход по ней сделано.
. "$(dirname "${BASH_SOURCE[0]}")/turn-exit-lib.sh"

echo "проверка выхода из хода"

# --- ход, кончившийся отчётом ------------------------------------------------------------
# Он выглядит работой лучше всякой другой: полон, называет номера и состояния, и пустоты за
# ним не видно. Ровно его страж и ловит.
state_is 'этап-идёт'
# --- SC-AK-748 — работа, оставшаяся в рабочем дереве, ход не кончает ---------------------------
# Удалённая ссылка заводится здесь же: страж читает её локально, сети ему не нужно. Ветка,
# ушедшая вперёд неё без открытой заявки, означает работу, которой не видит никто.
git -C "$REPO" add -A >/dev/null 2>&1
git -C "$REPO" -c user.name=t -c user.email=t@t commit -qm 'основание' >/dev/null 2>&1
git -C "$REPO" config remote.origin.url . >/dev/null 2>&1
git -C "$REPO" config remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*' >/dev/null 2>&1
git -C "$REPO" config branch.RT-1-probe.remote origin >/dev/null 2>&1
git -C "$REPO" config branch.RT-1-probe.merge refs/heads/RT-1-probe >/dev/null 2>&1
git -C "$REPO" update-ref refs/remotes/origin/RT-1-probe HEAD >/dev/null 2>&1
state_is 'этап-идёт'
expect_stop "SC-AK-748 — ветка вровень с удалённой: ярус молчит" \
    "$(input_stop "$(transcript "$(say 'работай')" "$(edited)")")" PASS
printf 'ещё строка\n' >> "$TASK/progress.md"
git -C "$REPO" add -A >/dev/null 2>&1
git -C "$REPO" -c user.name=t -c user.email=t@t commit -m 'проба' >/dev/null 2>&1
expect_stop "SC-AK-748 — неотданный коммит ход не кончает" \
    "$(input_stop "$(transcript "$(say 'работай')" "$(edited)")")" BLOCK
# SC-AK-1199 — названная причина неотправленных коммитов ход отпускает: отказ сам велит её
# назвать, а без неё push шёл ради снятия отказа через старую проверку на пятнадцать минут.
expect_stop "SC-AK-1199 — названная причина неотправленного ход отпускает" \
    "$(input_stop "$(transcript "$(say 'работай')" "$(edited)" \
        "$(said 'Не отправлено: в ветке старая проверка перед push, она гоняет всё приложение.')")")" PASS
expect_stop "SC-AK-1199 — метка без причины ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'работай')" "$(edited)" "$(said 'Не отправлено:')")")" BLOCK
expect_stop "SC-AK-748 — открытая заявка ярус снимает" \
    "$(input_stop "$(transcript "$(say 'работай')" "$(ran 'gh pr create --draft --title x')" "$(ran 'gh run list')" "$(ran 'npm run task:new -- --title y --slug z')")")" PASS
# Отслеживание снимается тем же блоком: оставленное, оно судило бы каждый следующий сценарий
# ярусом неотданной работы, к которому те не относятся вовсе.
git -C "$REPO" config --unset branch.RT-1-probe.remote >/dev/null 2>&1
git -C "$REPO" config --unset branch.RT-1-probe.merge >/dev/null 2>&1

# --- четыре законных выхода ---------------------------------------------------------------
expect_stop "SC-AK-297 — правка файла ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" PASS
expect_stop "SC-AK-298 — команда, меняющая дерево, ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git commit -m x')")")" PASS
# Клиент GitLab меняет состояние так же: слияние и перезапуск задания — работа, чтение — нет.
expect_stop "SC-AK-298 — слияние через glab ход отпускает" "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'glab mr merge 5')")")" PASS
expect_stop "SC-AK-298 — перезапуск задания через glab ход отпускает" "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'glab ci retry 17123456')")")" PASS
# Вопрос отпускает ход после работы: вопрос во главе пустого хода в идущем этапе — SC-AK-1126.
expect_stop "SC-AK-299 — вопрос владельцу после работы ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(asked)")")" PASS
expect_stop "SC-AK-300 — отказ гарда кончает ход" \
    "$(input_stop "$(transcript "$(say 'правь')" "$(ran 'echo x > a.ts')" "$(answered 'BLOCKED by task-flow: нет замысла')")")" PASS
expect_stop "SC-AK-301 — написанная передача захода кончает ход" \
    "$(input_stop "$(transcript "$(say 'закрывай заход')" "$(ran 'cat > .claude/handoff/2026-08-19.md')")")" PASS

# --- состояние работы -------------------------------------------------------------------------
# Отданная и влитая работа чужого шага уже дождалась: дальше её двигает владелец.
state_is 'работа-отдана'
expect_stop "SC-AK-304 — в отданной работе ход закрывается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")")" PASS
state_is 'влито'
expect_stop "SC-AK-305 — во влитой работе ход закрывается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")")" PASS

# --- записанный замысел -----------------------------------------------------------------------
# Обязательное действие этого состояния — делать первый этап, а начавший его переводит состояние
# той же правкой. Второй признак сюда не годится: заведение задачи, ветки, колонки и папки он
# считает работой.
plan_is() {
    printf '# Замысел\n\n## Этапы\n\n### %s\n\n- **Что делается:** проба\n' "$1" > "$TASK/plan.md"
}

state_is 'замысел-записан'
plan_is 'Правка стража'
expect_stop "SC-AK-591 — записанный замысел ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'npm run task:new -- --title проба')")")" BLOCK
expect_reason "SC-AK-592 — отказ называет первый этап замысла" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")")" 'Правка стража'
state_is 'этап-идёт'
expect_stop "SC-AK-593 — начатый этап судится прежним признаком" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" PASS
rm -f "$TASK/plan.md"

# --- работа дошла до отдачи ---------------------------------------------------------------------
# Состояния «этапы-кончились» и «разбор-кончился» объявляют, что код написан и остаётся довести
# работу до заявки. Второй признак этого не спрашивает: правок и команд в таком ходе полно, и он
# отпускает его целиком — а между разбором папки и открытием заявки работу не видит никто.
state_is 'этапы-кончились'
expect_stop "SC-AK-880 — работа до отдачи ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git commit -m проба')")")" BLOCK
expect_reason "SC-AK-880 — отказ называет обязательное действие состояния" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")")" 'run the suite'
# Заявка открыта и следующая работа начата — прежний ярус отдачи такой ход отпускает, и новый
# ему не мешает: он спрашивает только про заявку.
expect_stop "SC-AK-880 — открытая заявка с начатой следующей работой ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'gh pr create --draft --base main')" "$(ran 'git checkout -b RT-2-next')")")" PASS
expect_stop "SC-AK-880 — заявка, открытая клиентом GitLab, ход отпускает так же" "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'glab mr create --draft --target-branch main')" "$(ran 'git checkout -b RT-2-next')")")" PASS
state_is 'разбор-кончился'
expect_stop "SC-AK-880 — разобранный ход без заявки тоже отбивается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git push')")")" BLOCK

# --- отказ в пользу работы ---------------------------------------------------------------------
state_is 'этап-идёт'
expect_stop "SC-AK-306 — повторный заход по тому же ходу не судится" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")" true)" PASS

# --- проверка закрытого этапа ----------------------------------------------------------------
# Отметка «этап сделан» — утверждение о дереве, и подтверждается оно выводом команды. Прежний
# номер этапа страж читает из истории ветки, поэтому папка задачи кладётся в коммит.
printf '# Замысел\n\n### 1. Первый\n\n- **Чем проверяется:** `npm run check:board` — расхождений нет\n\n### 2. Второй\n' \
    > "$TASK/plan.md"
printf '# Ход работы\n\n## Где стоим\n\n- **Состояние:** `этап-идёт`\n- **Этап:** 1 из 2\n- **Следующий шаг:** делать первый\n' \
    > "$TASK/progress.md"
git -C "$REPO" add -A >/dev/null 2>&1
git -C "$REPO" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false \
    commit -q -m 'chore: этап 1' 2>/dev/null

printf '# Ход работы\n\n## Где стоим\n\n- **Состояние:** `этап-идёт`\n- **Этап:** 2 из 2\n- **Следующий шаг:** делать второй\n' \
    > "$TASK/progress.md"

expect_stop "SC-AK-309 — закрытый этап без команды проверки ход не закрывает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" BLOCK
expect_stop "SC-AK-310 — запущенная команда проверки ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'npm run check:board')" "$(edited)")")" PASS

# Номер этапа не вырос — контракт не спрашивается: подтверждать нечего.
printf '# Ход работы\n\n## Где стоим\n\n- **Состояние:** `этап-идёт`\n- **Этап:** 1 из 2\n- **Следующий шаг:** делать первый\n' \
    > "$TASK/progress.md"
expect_stop "SC-AK-311 — при прежнем номере этапа команда проверки не спрашивается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" PASS

# --- SC-AK-1132 — следующий шаг, вписанный в ход работы, начат тем же ходом ------------------
# Четыре остановки одной формы: этап закрыт и закоммичен, отчёт полон, следующий этап назван и не
# тронут. Проверка читает порядок действий: после последней правки хода работы нужна работа, кроме
# коммита и отправки его же. Отданная работа судится своим ярусом.
PROGRESS="$TASK/progress.md"
expect_stop "SC-AK-1132 — правка хода работы и один коммит после неё ход не отпускают" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(edited_file "$PROGRESS")" "$(ran 'git add -A && git commit -m x')")")" BLOCK
expect_reason "SC-AK-1132 — отказ называет ненáчатый шаг" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(edited_file "$PROGRESS")" "$(ran 'git add -A && git commit -m x')")")" "is not begun"
expect_stop "SC-AK-1132 — правка хода работы командой и коммит после неё ход не отпускают" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(ran "sed -i 's/a/b/' $PROGRESS")" "$(ran 'git commit -m x')")")" BLOCK
expect_stop "SC-AK-1132 — правка файла после хода работы ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited_file "$PROGRESS")" "$(edited)")")" PASS
expect_stop "SC-AK-1132 — команда, меняющая дерево, после хода работы ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited_file "$PROGRESS")" "$(ran 'npm run check:board')")")" PASS
expect_stop "SC-AK-1132 — отданная работа после хода работы судится своим ярусом" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(edited_file "$PROGRESS")" "$(ran 'git commit -m x')" "$(ran 'gh pr create --draft')")")" PASS

# --- SC-AK-1135 — запуск в фоне последним действием ход не кончает ---------------------------
# Разбор кончился запуском ролей в фоне и отчётом «роли работают»; проверка сочла запуск работой.
# Запуск — объявление намерения: пока роль идёт, делается то, что от неё не зависит. Судится
# последнее действие: запуск в середине хода законен.
launched() { jq -c -n '{type:"assistant",message:{content:[{type:"tool_use",name:"Agent",input:{subagent_type:"skill-curator",prompt:"обзор"}}]}}'; }
ran_bg() { jq -c -n --arg c "$1" '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c,run_in_background:true}}]}}'; }
state_is 'этап-идёт'
expect_stop "SC-AK-1135 — роль, запущенная последним действием, ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(launched)")")" BLOCK
expect_reason "SC-AK-1135 — отказ называет запуск в фоне" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(launched)")")" "launch in the background"
expect_stop "SC-AK-1135 — команда в фоне последним действием ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(ran_bg 'npm run storybook')")")" BLOCK
expect_stop "SC-AK-1135 — запуск роли без работы до него ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'разбери просьбу')" "$(launched)")")" BLOCK
expect_stop "SC-AK-1135 — работа после запуска ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(launched)" "$(edited)")")" PASS

# --- разведка ---------------------------------------------------------------------------------
# Читающая подкоманда `git` и клиента хостинга стоит в образце работы наравне с меняющей —
# образец знает только первое слово. Ход, где переключились на главную ветку, прочитали историю
# и написали владельцу отчёт, выходил отсюда нулём.
state_is 'этап-идёт'
expect_stop "SC-AK-632 — чтение вперемешку с работой ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git checkout -q main && npm run check:docs')")")" PASS
expect_stop "SC-AK-633 — читающая часть коммит не отменяет" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git status --short')" "$(ran 'git commit -q -m fix')")")" PASS
expect_stop "SC-AK-634 — открытие заявки чтением не считается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'gh pr create --draft')" "$(ran 'npm run task:new -- следующая')")")" PASS

# --- перенаправление вывода ----------------------------------------------------------------------
# Стрелка в образце работы не спрашивала, куда ведёт, и засчитывала работой запись мимо дерева:
# тело будущей заявки во временном каталоге захода и отвод потока ошибок в устройство пустоты.
# Пять ходов из семи простоявших выходили отсюда нулём ровно по ней.
state_is 'этап-идёт'
expect_stop "SC-AK-695 — команда из перечня с перенаправлением ход отпускает по-прежнему" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'tee -a docs/notes.md < заметка')")")" PASS

# --- ход, кончившийся ожиданием ---------------------------------------------------------------
# Работы в таком ходе было много — тем он и обманчив. Судится последнее действие, а не наличие
# работы: ожидание чужого шага концом хода не бывает.
state_is 'этап-идёт'
expect_stop "SC-AK-639 — ход, кончившийся ожиданием прогона, не закрывается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git push origin HEAD')" "$(ran 'until [ \"$(gh run list --limit 1 --json status -q .[0].status)\" = completed ]; do sleep 30; done')")")" BLOCK
expect_stop "SC-AK-640 — слежение за прогоном концом хода не бывает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(ran 'gh run watch 12345')")")" BLOCK
expect_stop "SC-AK-641 — ожидание в середине хода ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'until [ -f готово ]; do sleep 5; done')" "$(ran 'git commit -q -m fix')")")" PASS
expect_reason "SC-AK-642 — отказ об ожидании называет следующий шаг" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'gh run watch 12345')")")" 'дописать страж'

# --- что считается работой: правка файла и заведение ветки ------------------------------------
state_is 'этап-идёт'
expect_stop "SC-AK-653 — ход, кончившийся правкой файла, отпускается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git log --oneline -5')" "$(edited)")")" PASS
expect_stop "SC-AK-654 — заведение ветки разведкой не считается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git checkout -b RT-3-next origin/main')" "$(edited)")")" PASS
expect_stop "SC-AK-872 — заведение ветки с флагом перед -b — та же работа" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git checkout -q -b RT-3-next origin/main')" "$(edited)")")" PASS

# --- работа отдана, а следующая только названа ---------------------------------------------------
# Работы в таком ходе больше, чем в любом другом, и вся она по сданной задаче. Отдача завершает
# прошлую работу, а не ход: правило требует, чтобы по следующей было сделано действие.
state_is 'этап-идёт'
expect_stop "SC-AK-647 — отдача работы без начала следующей ход не кончает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git push origin HEAD')" "$(ran 'gh pr create --draft --title x')")")" BLOCK
expect_stop "SC-AK-648 — заведённая следующая задача ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'gh pr create --draft --title x')" "$(ran 'npm run task:new -- следующая')")")" PASS
expect_stop "SC-AK-649 — заведённая ветка следующей работы ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'gh pr create --draft --title x')" "$(ran 'git checkout -b RT-2-next origin/main')")")" PASS
expect_stop "SC-AK-650 — ход без открытия заявки этим ярусом не судится" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git commit -q -m fix')")")" PASS
expect_reason "SC-AK-651 — отказ об отдаче называет команду заведения следующей" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'gh pr create --draft --title x')")")" 'task:new'
expect_stop "SC-AK-647 — отдача через glab без начала следующей ход не кончает" "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git push origin HEAD')" "$(ran 'glab mr create --draft --title x')")")" BLOCK
expect_stop "SC-AK-648 — отдача через glab с заведённой следующей ход отпускает" "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'glab mr create --draft --title x')" "$(ran 'npm run task:new -- следующая')")")" PASS

# --- снятая папка задачи ----------------------------------------------------------------------
# Папка разбирается ДО открытия заявки, и между этими двумя движениями работа не отдана никому.
# Прежде страж выходил здесь нулём — и ход, которому до отдачи оставался один шаг, закрывался
# пустым. Теперь признак снимает только требование состояния.
ARCHIVED="$(fixture_repo_branched main RT-2-archived)"
fixture_commit "$ARCHIVED" docs/tasks/RT-2-archived/progress.md '# Ход работы' 'docs: папка задачи'
fixture_remove "$ARCHIVED" docs/tasks/RT-2-archived 'docs: папка задачи разобрана'

input_archived() {
    jq -n --arg p "$1" --arg d "$ARCHIVED" \
        '{session_id:"tests",transcript_path:$p,cwd:$d,stop_hook_active:false}'
}

expect_stop "SC-AK-575 — при снятой папке открытие заявки с начатой следующей ход отпускает" \
    "$(input_archived "$(transcript "$(say 'продолжай')" "$(ran 'gh pr create --draft')" "$(ran 'npm run task:new -- следующая')")")" PASS
expect_stop "SC-AK-576 — при снятой папке правка дерева ход отпускает" \
    "$(input_archived "$(transcript "$(say 'продолжай')" "$(edited)")")" PASS

rm -rf "$ARCHIVED"

# --- взятая, но не начатая работа --------------------------------------------------------------
# Ветка по номеру задачи заведена, папки при ней нет: работа объявлена взятой и не начата ни
# одной строкой. Второй признак такой ход отпускал целиком — заведение ветки и перевод колонки
# сами по себе команды, меняющие дерево.
TAKEN="$(fixture_repo RT-7-taken)"
input_taken() {
    jq -n --arg p "$1" --arg d "$TAKEN" \
        '{session_id:"tests",transcript_path:$p,cwd:$d,stop_hook_active:false}'
}

expect_stop "SC-AK-625 — взятая работа без папки задачи ход не кончает" \
    "$(input_taken "$(transcript "$(say 'работай дальше')" "$(ran 'git checkout -b RT-7-taken origin/main')")")" BLOCK
expect_stop "SC-AK-626 — перевод колонки взятую работу началом не делает" \
    "$(input_taken "$(transcript "$(say 'работай дальше')" "$(ran 'npm run task:move -- 7 in-progress')")")" BLOCK

mkdir -p "$TAKEN/docs/tasks/RT-7-taken"
printf '# Замысел\n' > "$TAKEN/docs/tasks/RT-7-taken/plan.md"
expect_stop "SC-AK-628 — собранная папка задачи ярус снимает" \
    "$(input_taken "$(transcript "$(say 'работай дальше')" "$(ran 'npm run task:move -- 7 in-progress')" "$(edited)")")" PASS

rm -rf "$TAKEN"

# Ветка без номера задачи не судится: под пробу заводят и такие.
PROBE="$(fixture_repo feat-probe)"
expect_stop "SC-AK-629 — ветка без номера задачи этим ярусом не судится" \
    "$(jq -n --arg p "$(transcript "$(say 'разложи')" "$(edited)")" --arg d "$PROBE" \
        '{session_id:"tests",transcript_path:$p,cwd:$d,stop_hook_active:false}')" PASS
rm -rf "$PROBE"

# SC-AK-911 — ключи хода работы и замысла читаются под английским именем: образцы папки задачи
# в пакете английские, папки дерева до перевода русские, и страж судит обе одинаково.
printf '# Progress\n\n## Where we stand\n\n- **State:** `%s`\n- **Next step:** finish the guard\n' \
    'замысел-записан' > "$TASK/progress.md"
printf '# Plan\n\n## Stages\n\n### The guard edit\n\n- **What is done:** a probe\n' > "$TASK/plan.md"
expect_stop "SC-AK-911 — английский ключ состояния ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'npm run task:new -- --title проба')")")" BLOCK
expect_reason "SC-AK-911 — отказ называет первый этап английского замысла" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")")" 'The guard edit'
printf '# Progress\n\n## Where we stand\n\n- **State:** `%s`\n- **Next step:** finish the guard\n' \
    'этап-идёт' > "$TASK/progress.md"
expect_stop "SC-AK-911 — начатый этап под английским ключом отпускается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" PASS
rm -f "$TASK/plan.md"

state_is 'этап-идёт'
exit_code_of() {
    printf '%s' "$2" | "$HOOKS/turn-exit-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "запись хода, которой нет, пропускается" "$(input_stop "$TURNS/нет-такой.jsonl")"

# SC-AK-1066, SC-AK-1067, SC-AK-1069 — роды последнего действия хода: фоновый запуск проверок, чтение
# лога фоновой задачи, взятие задачи.
state_is 'этап-идёт'

expect_stop "SC-AK-1066 — фоновый запуск проверок последним действием ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(ran 'npm run test -- --watch=false &')")")" BLOCK

expect_stop "SC-AK-1066 — тот же запуск в середине хода ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'npm run test -- --watch=false &')" "$(edited)")")" PASS

expect_stop "SC-AK-1067 — чтение лога фоновой задачи ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(ran 'tail -20 /tmp/tasks/b1.output')")")" BLOCK

expect_stop "SC-AK-1069 — взятие задачи последним действием ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(ran 'npm run task:move -- 2030 in-progress')")")" BLOCK

expect_stop "SC-AK-1069 — взятие задачи после отданной работы ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'gh pr create --draft')" "$(ran 'npm run task:move -- 2030 in-progress')")")" PASS

# --- SC-AK-1247 — ход, разбуженный уведомлением о своей фоновой задаче ----------------------
# Уведомление, будящее сессию, пишется под ролью владельца и открывает ход, в котором делать
# нечего: ждать осталось вторую задачу. Ход из одного уведомления отпускается, пока своя задача
# ещё идёт: такой ход проверка не судит вовсе.
ran_bg_id() {
    jq -c -n --arg c "$1" --arg i "$2" \
        '{type:"assistant",message:{content:[{type:"tool_use",id:$i,name:"Bash",input:{command:$c,run_in_background:true}}]}}'
}
notified() {
    jq -c -n --arg i "$1" --arg s "${2:-completed}" '{type:"user",origin:{kind:"task-notification"},
        message:{content:("<task-notification>\n<task-id>b1</task-id>\n<tool-use-id>" + $i
            + "</tool-use-id>\n<status>" + $s + "</status>\n</task-notification>")}}'
}
state_is 'этап-идёт'
expect_stop "SC-AK-1247 — пустой ход по уведомлению, пока вторая своя задача идёт, отпускается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran_bg_id 'node a.mjs' t1)" "$(ran_bg_id 'node b.mjs' t2)" \
        "$(edited)" "$(notified t1)")")" PASS

suite_result "проверка выхода из хода"
