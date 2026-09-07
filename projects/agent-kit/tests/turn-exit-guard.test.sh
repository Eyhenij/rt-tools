#!/usr/bin/env bash
# Сценарии стража выходов хода: чем ход кончается законно и что выходом не является.
#
# Проверяется механика, а не карта дерева: запись хода и папка задачи собираются здесь же.
# Страж судит пару — объявленное состояние работы и то, что за ход по ней сделано.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "страж выходов хода"

TURNS="$(mktemp -d)"
REPO="$(fixture_repo RT-1-probe)"
export CLAUDE_PROJECT_DIR="$REPO"
cleanup() { rm -rf "$TURNS" "$REPO"; }
trap cleanup EXIT

TASK="$REPO/docs/tasks/RT-1-probe"
mkdir -p "$TASK"

state_is() {
    printf '# Ход работы\n\n## Где стоим\n\n- **Состояние:** `%s`\n- **Следующий шаг:** дописать страж\n' \
        "$1" > "$TASK/progress.md"
}

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
reply() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"tool_use",name:"Read",input:{file_path:"a.md"}}]}}'; }
ran() {
    jq -c -n --arg c "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'
}
edited() {
    jq -c -n '{type:"assistant",message:{content:[{type:"tool_use",name:"Edit",input:{file_path:"a.md"}}]}}'
}
asked() {
    jq -c -n '{type:"assistant",message:{content:[{type:"tool_use",name:"AskUserQuestion",input:{questions:[]}}]}}'
}
answered() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"tool_result",content:$t}]}}'; }

input_stop() {
    jq -n --arg p "$1" --arg d "$REPO" --argjson a "${2:-false}" \
        '{session_id:"tests",transcript_path:$p,cwd:$d,stop_hook_active:$a}'
}

expect_stop() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/turn-exit-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

# Отказ читается тем, кому он адресован: страж называет первый этап замысла, а не общие слова.
expect_reason() {
    local label="$1" json="$2" want="$3" out
    out="$(printf '%s' "$json" | "$HOOKS/turn-exit-guard.sh" 2>/dev/null | jq -r '.reason // ""' 2>/dev/null)"
    case "$out" in
        *"$want"*) report "$label" "есть:$want" "есть:$want" ;;
        *) report "$label" "нет:$want" "есть:$want" ;;
    esac
}

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
expect_stop "SC-AK-748 — открытая заявка ярус снимает" \
    "$(input_stop "$(transcript "$(say 'работай')" "$(ran 'gh pr create --draft --title x')" "$(ran 'gh run list')" "$(ran 'npm run task:new -- --title y --slug z')")")" PASS
# Отслеживание снимается тем же блоком: оставленное, оно судило бы каждый следующий сценарий
# ярусом неотданной работы, к которому те не относятся вовсе.
git -C "$REPO" config --unset branch.RT-1-probe.remote >/dev/null 2>&1
git -C "$REPO" config --unset branch.RT-1-probe.merge >/dev/null 2>&1


expect_stop "SC-AK-296 — ход, в котором по работе не сделано ничего, не закрывается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)" )")" BLOCK

# --- четыре законных выхода ---------------------------------------------------------------
expect_stop "SC-AK-297 — правка файла ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" PASS
expect_stop "SC-AK-298 — команда, меняющая дерево, ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git commit -m x')")")" PASS
expect_stop "SC-AK-299 — вопрос владельцу ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(asked)")")" PASS
expect_stop "SC-AK-300 — отказ гарда кончает ход" \
    "$(input_stop "$(transcript "$(say 'правь')" "$(ran 'echo x > a.ts')" "$(answered 'BLOCKED by task-flow: нет замысла')")")" PASS
expect_stop "SC-AK-301 — написанная передача захода кончает ход" \
    "$(input_stop "$(transcript "$(say 'закрывай заход')" "$(ran 'cat > .claude/handoff/2026-08-19.md')")")" PASS

# --- слово владельца ------------------------------------------------------------------------
# Судится реплика самого владельца, а не пересказ исполнителя: иначе остановку объявлял бы тот,
# кому она в эту минуту удобна.
expect_stop "SC-AK-302 — сказанная владельцем остановка ход отпускает" \
    "$(input_stop "$(transcript "$(say 'останови работу, дальше сам')" "$(reply)")")" PASS
expect_stop "SC-AK-303 — остановка, объявленная исполнителем, ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(jq -c -n '{type:"assistant",message:{content:[{type:"text",text:"останавливаюсь на этом"}]}}')")")" BLOCK

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
state_is 'разбор-кончился'
expect_stop "SC-AK-880 — разобранный ход без заявки тоже отбивается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git push')")")" BLOCK
expect_stop "SC-AK-880 — слово владельца об остановке отпускает и это состояние" \
    "$(input_stop "$(transcript "$(say 'останови, дальше сам')" "$(reply)")")" PASS

# --- вопрос, вернувшийся прозой ------------------------------------------------------------------
# Гард разговора судит вызов инструмента вопроса и прозы не видит: отбитый вопрос возвращался той
# же формулировкой через строку и проходил свободно.
denied_ask() {
    jq -c -n '{type:"user",message:{content:[{type:"tool_result",content:"BLOCKED by grill-gate: на этот вопрос владелец уже отвечал"}]}}'
}
said_prose() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"text",text:$t}]}}'; }

state_is 'этап-идёт'
expect_stop "SC-AK-883 — вопрос прозой после отказа гарда разговора ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(denied_ask)" "$(said_prose 'Какой стенд поднимать?')")")" BLOCK
expect_stop "SC-AK-883 — тот же ответ без отказа гарда разговора судится прежним признаком" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(said_prose 'Какой стенд поднимать?')")")" PASS
expect_stop "SC-AK-883 — отказ гарда разговора без вопроса прозой ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(denied_ask)" "$(said_prose 'Беру следующую задачу.')")")" PASS

# --- ожидание слова владельца ------------------------------------------------------------------
# Слово об остановке читается у владельца: фраза «жду твоего слова» без его слова за ход и без
# вопроса ему инструментом — остановка, объявленная исполнителем. Правка последним действием
# отпускала бы ход общим ярусом — здесь он отбивается по имени.
state_is 'этап-идёт'
expect_stop "SC-AK-891 — ход, кончившийся ожиданием слова владельца, не отпускается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(said_prose 'Разведка кончена. Жду твоего слова.')")")" BLOCK
expect_reason "SC-AK-891 — отказ называет фразу остановкой исполнителя" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(said_prose 'Жду вашего решения по стенду.')")")" "a stop announced by the executor"
expect_stop "SC-AK-891 — та же фраза при слове владельца об остановке ход отпускает" \
    "$(input_stop "$(transcript "$(say 'подожди, дальше скажу сам')" "$(edited)" "$(said_prose 'Жду твоего слова.')")")" PASS
expect_stop "SC-AK-891 — та же фраза после вопроса инструментом ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)" "$(asked)" "$(answered 'Стенд А')" "$(said_prose 'Жду твоего слова.')")")" PASS

# --- отказ в пользу работы ---------------------------------------------------------------------
state_is 'этап-идёт'
expect_stop "SC-AK-306 — повторный заход по тому же ходу не судится" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")" true)" PASS

# --- работа без папки задачи ------------------------------------------------------------------
# Состояния у неё нет, и первый признак взять неоткуда: судится второй — была ли за ход хоть
# одна правка дерева. Раньше страж отпускал такую работу молча, и просьба владельца «разложи»
# кончалась объявлением намерения.
rm -f "$TASK/progress.md"
expect_stop "SC-AK-307 — работа без хода работы судится вторым признаком" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")")" BLOCK
expect_stop "SC-AK-312 — правка дерева отпускает и работу без хода работы" \
    "$(input_stop "$(transcript "$(say 'разложи файлы')" "$(edited)")")" PASS
expect_stop "SC-AK-313 — слово владельца об остановке отпускает работу без хода работы" \
    "$(input_stop "$(transcript "$(say 'останови, дальше сам')" "$(reply)")")" PASS

# Отсоединённая голова — тот же случай: имени у ветки нет, и папку задачи искать негде.
git -C "$REPO" checkout -q --detach 2>/dev/null
expect_stop "SC-AK-314 — на отсоединённой голове пустой ход не закрывается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")")" BLOCK
expect_stop "SC-AK-315 — на отсоединённой голове правка дерева ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" PASS
git -C "$REPO" checkout -q - 2>/dev/null

printf '# Ход работы\n\n## Где стоим\n\n- **Этап:** 1 из 2\n' > "$TASK/progress.md"
expect_stop "SC-AK-308 — ход работы без объявленного состояния судится вторым признаком" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")")" BLOCK

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

# --- разведка ---------------------------------------------------------------------------------
# Читающая подкоманда `git` и клиента хостинга стоит в образце работы наравне с меняющей —
# образец знает только первое слово. Ход, где переключились на главную ветку, прочитали историю
# и написали владельцу отчёт, выходил отсюда нулём.
state_is 'этап-идёт'
expect_stop "SC-AK-630 — ход из одного переключения и подтягивания не закрывается" \
    "$(input_stop "$(transcript "$(say 'где правки?')" "$(ran 'git checkout -q main && git pull --ff-only')")")" BLOCK
expect_stop "SC-AK-631 — чтение заявок клиентом хостинга ход не кончает" \
    "$(input_stop "$(transcript "$(say 'что у тебя открыто?')" "$(ran '/opt/homebrew/bin/gh pr list --state open --json number')")")" BLOCK
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
expect_stop "SC-AK-693 — запись во временный каталог работой не считается" \
    "$(input_stop "$(transcript "$(say 'ну что там?')" "$(ran 'cat > /tmp/pr-body.md <<EOF')")")" BLOCK
expect_stop "SC-AK-694 — отвод потока ошибок работой не считается" \
    "$(input_stop "$(transcript "$(say 'ну что там?')" "$(ran 'curl -s http://127.0.0.1:3000/health 2>/dev/null')")")" BLOCK
expect_stop "SC-AK-695 — команда из перечня с перенаправлением ход отпускает по-прежнему" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'tee -a docs/tasks/RT-1-probe/progress.md < заметка')")")" PASS

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

# --- общий рубеж: последним действием хода бывает только работа ----------------------------------
# Девять разборов происшествий за сутки описывают девять разных остановок, и во всех девяти
# последним действием хода был текст владельцу. Ярус на каждый вид — гонка без конца.
state_is 'этап-идёт'
expect_stop "SC-AK-652 — работа была, а последним действием стало чтение — ход не кончается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git commit -q -m fix')" "$(ran 'git log --oneline -5')")")" BLOCK
expect_stop "SC-AK-653 — ход, кончившийся правкой файла, отпускается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git log --oneline -5')" "$(edited)")")" PASS
expect_stop "SC-AK-654 — заведение ветки разведкой не считается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git checkout -b RT-3-next origin/main')")")" PASS
expect_stop "SC-AK-872 — заведение ветки с флагом перед -b — та же работа" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git checkout -q -b RT-3-next origin/main')")")" PASS
expect_stop "SC-AK-655 — переключение на ветку разведкой остаётся" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git commit -q -m fix')" "$(ran 'git checkout main')")")" BLOCK

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

# --- снятая папка задачи ----------------------------------------------------------------------
# Папка разбирается ДО открытия заявки, и между этими двумя движениями работа не отдана никому.
# Прежде страж выходил здесь нулём — и ход, которому до отдачи оставался один шаг, закрывался
# пустым. Теперь признак снимает только требование состояния: дальше судит второй признак.
ARCHIVED="$(fixture_repo_branched main RT-2-archived)"
fixture_commit "$ARCHIVED" docs/tasks/RT-2-archived/progress.md '# Ход работы' 'docs: папка задачи'
fixture_remove "$ARCHIVED" docs/tasks/RT-2-archived 'docs: папка задачи разобрана'

input_archived() {
    jq -n --arg p "$1" --arg d "$ARCHIVED" \
        '{session_id:"tests",transcript_path:$p,cwd:$d,stop_hook_active:false}'
}

expect_stop "SC-AK-574 — снятая папка задачи пустой ход не кончает" \
    "$(input_archived "$(transcript "$(say 'ну что там?')" "$(reply)")")" BLOCK
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
expect_stop "SC-AK-627 — слово владельца об остановке отпускает и взятую работу" \
    "$(input_taken "$(transcript "$(say 'останови, дальше сам')" "$(ran 'npm run task:move -- 7 in-progress')")")" PASS

mkdir -p "$TAKEN/docs/tasks/RT-7-taken"
printf '# Замысел\n' > "$TAKEN/docs/tasks/RT-7-taken/plan.md"
expect_stop "SC-AK-628 — собранная папка задачи ярус снимает" \
    "$(input_taken "$(transcript "$(say 'работай дальше')" "$(ran 'npm run task:move -- 7 in-progress')")")" PASS

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

suite_result "страж выходов хода"
