#!/usr/bin/env bash
# Сценарии раздела «Решение» в плане: план без раздела, без строки, без места, числа или набора не
# записывается и не получает одобрения. Раздел держала память исполнителя.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "раздел «Решение» в плане"

# Полное решение: имя строки, табуляция, ячейка.
FD_ROWS="$(printf '%s\t%s\n' \
    'Модули' '`mail/read.mjs:readMail` — читает письмо' \
    'Зависимости' 'чтение подключает запись, обратно никто' \
    'Зацепление' '`mail/read.mjs` исходящие 1 → 2' \
    'Паттерны' 'Adapter — `mail/read.mjs:readMail`; отброшено: приведение у каждого' \
    'Термины' 'новых терминов нет: слова уже в словаре' \
    'Данные' 'письмо с файлом; письмо без файла. SC-AK-1972, `mail.test.sh`' \
    'Границы' 'запись хранит свои поля' \
    'Приоритет' 'надёжность важнее скорости' \
    'Бюджет' '`mail/read.mjs` до 100 строк; новых файлов кода: 1; новых зависимостей: 0')"
# Таблица решения; у строки $1 ячейка $2, «-» — строки нет.
fd_rows() { N="${1:-}" C="${2:-}" awk -F'\t' '{ c = $1 == ENVIRON["N"] ? ENVIRON["C"] : $2; if (c != "-") printf "| %s | %s |\n", $1, c }' <<< "$FD_ROWS"; }
# План с разделом: $1 — строки раздела, $2 — его заголовок.
fd_body() { printf '# Plan\n\n## %s\n\n%s\n\n## Stages\n\n### 1. Первый\n\n- **Steps:**\n    1. Шаг\n       Check: `test -f нет` → exit 0\n' "${2:-Решение}" "$1"; }
fd_plan() { fd_body "$(printf '| Часть | Что выбрано |\n| --- | --- |\n%s' "$(fd_rows "$@")")"; }
# Что названо в тексте со входа; полное решение — «чисто».
fd() { node -e 'import(process.argv[1]).then(m => console.log(m.decisionProblems(require("fs").readFileSync(0, "utf8")).join("; ") || "чисто"))' "$CHECKS/flow-decision.mjs"; }
# Прочитанное в строке $1 с ячейкой $2: выражение $3 от строки.
fd_read() { fd_plan "$1" "$2" | node -e 'import(process.argv[1]).then(m => { const r = m.decisionRows(require("fs").readFileSync(0, "utf8")).rows.find(x => x.name === process.argv[2]); console.log(eval(process.argv[3])); })' "$CHECKS/flow-decision.mjs" "$1" "$3"; }
named() { case "$1" in *"$2"*) echo назван ;; *) echo "${1:-молчит}" ;; esac; }

report "SC-AK-1971 — раздела нет" "$(named "$(printf '# Plan\n' | fd)" 'is not there')" назван
report "SC-AK-1971 — полный раздел «Решение»" "$(fd_plan | fd)" чисто
report "SC-AK-1971 — полный раздел «Decision»" "$(fd_body "$(fd_rows)" Decision | fd)" чисто
report "SC-AK-1971 — пустой раздел называет все девять строк" "$(fd_body '' | fd | grep -o '([A-Z][a-z]*)' | wc -l | tr -d ' ')" 9
report "SC-AK-1971 — таблица без строк" "$(named "$(fd_body "$(printf '| Часть | Что |\n| --- | --- |')" | fd)" 'no row «Модули»')" назван
report "SC-AK-1971 — одна строка с причиной" "$(fd_body 'Решения нет: правка двух слов.' | fd)" чисто
report "SC-AK-1971 — одна строка с причиной по-английски" "$(fd_body 'No decision: probe fixture' | fd)" чисто
for line in 'Решения нет:' 'Решения нет' 'Решения нет: <причина>' 'Решения нет: мелочь'; do
    report "SC-AK-1971 — «${line}» причины не даёт" "$(named "$(fd_body "$line" | fd)" 'gives no reason')" назван
done
report "SC-AK-1971 — второй раздел с тем же именем" "$(named "$( (fd_plan; fd_plan) | fd)" 'more than once')" назван
report "SC-AK-1971 — таблица в блоке кода не считается" "$(named "$(fd_body "$(printf '```text\n%s\n```' "$(fd_rows)")" | fd)" 'no row «Модули»')" назван
report "SC-AK-1971 — строка причины рядом с таблицей суда не снимает" \
    "$(named "$(fd_body "$(printf 'Решения нет: правка двух слов\n\n%s' "$(fd_rows Бюджет -)")" | fd)" 'no row «Бюджет»')" назван

report "SC-AK-1971 — раздела нет — строки названы тем же сообщением" "$(printf '# Plan\n' | fd | grep -o '([A-Z][a-z]*)' | wc -l | tr -d ' ')" 9
report "SC-AK-1971 — строки после раздела ему не принадлежат" "$(named "$(printf '%s\n%s\n' "$(fd_body "$(fd_rows Бюджет -)")" "$(fd_rows | tail -1)" | fd)" 'no row «Бюджет»')" назван
report "SC-AK-1971 — концы строк другой системы" "$(fd_body 'Решения нет: правка двух слов' | sed "s/$(printf '\r')*\$/$(printf '\r')/" | fd)/$(fd_plan | sed "s/\$/$(printf '\r')/" | fd)" чисто/чисто
report "SC-AK-1971 — блок кода из тильд и из четырёх знаков не считается" \
    "$(named "$(fd_body "$(printf '~~~\n%s\n~~~' "$(fd_rows)")" | fd)" 'no row')/$(named "$(fd_body "$(printf '````\n```\n%s\n```\n````' "$(fd_rows)")" | fd)" 'no row')" назван/назван
report "SC-AK-1971 — код в строке блоком не считается" "$(printf '```один``` знак\n\n%s\n\n```text\nкод\n```\n' "$(fd_plan)" | fd)" чисто
while IFS="$(printf '\t')" read -r row _; do
    report "SC-AK-1972 — строки «${row}» нет" "$(named "$(fd_plan "$row" - | fd)" "no row «${row}»")" назван
    report "SC-AK-1972 — ячейка строки «${row}» пуста" "$(named "$(fd_plan "$row" '' | fd)" "the row «${row}» says nothing")" назван
done <<< "$FD_ROWS"
report "SC-AK-1972 — ячейка из одного слова" "$(named "$(fd_plan Границы нет | fd)" 'says nothing')" назван
report "SC-AK-1972 — ячейка в скобках шаблона" "$(named "$(fd_plan Границы '<что не меняется>' | fd)" 'says nothing')" назван
report "SC-AK-1972 — «<<<» внутри ячейки" "$(fd_plan Границы 'тело `<<<` и метка <имя> остаются' | fd)" чисто
report "SC-AK-1972 — черта внутри ячейки" "$(fd_read Границы 'знак `a\|b` остаётся' 'r.text')" 'знак `a|b` остаётся'
report "SC-AK-1972 — имя с хвостом после двоеточия" "$(fd_plan | sed 's/^| Данные |/| Данные: письмо |/' | fd)" чисто
report "SC-AK-1972 — имя в единственном числе" "$(fd_plan | sed 's/^| Модули |/| Модуль |/' | fd)" чисто
report "SC-AK-1972 — имена по-английски" "$(fd_plan | sed -e 's/^| Модули/| Modules/' -e 's/^| Зависимости/| Dependencies/' -e 's/^| Зацепление/| Coupling/' -e 's/^| Паттерны/| Patterns/' \
    -e 's/^| Термины/| Terms/' -e 's/^| Данные/| Input/' -e 's/^| Границы/| Bounds/' -e 's/^| Приоритет/| Priority/' -e 's/^| Бюджет/| Budget/' | fd)" чисто
report "SC-AK-1972 — две строки данных, у второй нет набора" \
    "$(named "$(fd_body "$(printf '%s\n| Данные: журнал | строка журнала. SC-AK-1973 |' "$(fd_rows)")" | fd)" 'the row «Данные: журнал» does not name a test suite')" назван
report "SC-AK-1972 — незнакомая строка" "$(fd_body "$(printf '%s\n| Цена | |' "$(fd_rows)")" | fd)" чисто
for cell in 'модуль чтения письма' '`mail/read.mjs:12` — чтение письма' '`mail.test.sh:check` — случаи чтения' 'чтение письма. Отброшено: `mail/read.mjs:readMail`'; do
    report "SC-AK-1972 — модуль «${cell}» места не называет" "$(named "$(fd_plan Модули "$cell" | fd)" 'names no place')" назван
done
for place in 'checks/check-specs.mjs:main' 'src/test-setup.ts:setup' '_tokens.scss:--rt-color' 'a/store.ts:Base<T>' 'a/x.mjs:read(text)' 'apps/api/Dockerfile:runner'; do
    report "SC-AK-1972 — место «${place}» узнано" "$(fd_plan Модули "\`$place\` — читает письмо" | fd)" чисто
done
report "SC-AK-1972 — шапка второй таблицы не строка" "$(fd_body "$(printf '%s\n\n| Термин | |\n| --- | --- |\n| письмо | почта |' "$(fd_rows)")" | fd)" чисто
for cell in 'Adapter — `a/b.mjs:one`; Facade — один вход' 'Adapter — `a/b.mjs:one`<br>Facade — один вход' 'паттерна нет: обычная функция; Facade — один вход'; do
    report "SC-AK-1972 — «${cell}» прячет паттерн без места" "$(named "$(fd_plan Паттерны "$cell" | fd)" 'for «Facade»')" назван
done
report "SC-AK-1972 — место после точки с запятой и сокращение" "$(fd_plan Паттерны 'Adapter — приводит письмо, т. е. меняет форму; в `a/b.mjs:one`' | fd)" чисто
report "SC-AK-1972 — место, которое удаляется, паттерна не даёт" "$(named "$(fd_plan Паттерны 'Adapter — `a/b.mjs:one` удаляется' | fd)" 'for «Adapter»')" назван
report "SC-AK-1972 — паттерн без места" "$(named "$(fd_plan Паттерны 'Adapter — чтение письма' | fd)" 'for «Adapter»')" назван
report "SC-AK-1972 — у второго паттерна места нет" "$(named "$(fd_plan Паттерны 'Adapter — `a/b.mjs:one`. Facade — один вход' | fd)" 'for «Facade»')" назван
report "SC-AK-1972 — предложение без тире не пункт" "$(fd_plan Паттерны 'Adapter — `a/b.mjs:one`. Вход у него один' | fd)" чисто
report "SC-AK-1972 — предложение, начатое словом «отброшено», не пункт" "$(fd_plan Паттерны 'Adapter — `a/b.mjs:one`. Отброшено: Facade — лишний вход' | fd)" чисто
report "SC-AK-1972 — место только после слова «отброшено»" "$(named "$(fd_plan Паттерны 'Adapter — чтение; отброшено: `a/b.mjs:one`' | fd)" 'for «Adapter»')" назван
report "SC-AK-1972 — пометка «отброшено» до конца предложения" \
    "$(fd_read Паттерны 'Adapter — `a.mjs:one`; отброшено: `b.mjs:two`; `c.mjs:three`. Facade — `d.mjs:four`' 'r.symbols.map(s => s.fate || "есть").join()')" 'есть,dropped,dropped,есть'
report "SC-AK-1972 — «удаляется» и «переезжает в» в своей части" \
    "$(fd_read Модули '`a.mjs:one` удаляется; `b.mjs:two` переезжает в `c.mjs:three`; `d.mjs:four`' 'r.symbols.map(s => s.fate || "есть").join()')" 'removed,moved,есть,есть'
report "SC-AK-1972 — паттерна нет с причиной" "$(fd_plan Паттерны 'паттерна нет: обычная функция' | fd)" чисто
report "SC-AK-1972 — паттерна нет без причины" "$(named "$(fd_plan Паттерны 'паттерна нет: не нужен' | fd)/$(fd_plan Паттерны 'паттерна нет: да' | fd)" 'чисто/the row «Паттерны» names no pattern')" назван
report "SC-AK-1972 — зацепление словами" "$(named "$(fd_plan Зацепление 'связей станет больше' | fd)" 'names no number')" назван
report "SC-AK-1972 — кода нет с причиной" "$(fd_plan Зацепление 'кода нет: правка двух текстов' | fd)" чисто
report "SC-AK-1972 — бюджет без пути" "$(named "$(fd_plan Бюджет 'сто строк; новых файлов кода: 1; новых зависимостей: 0' | fd)" 'a path with')" назван
report "SC-AK-1972 — бюджет без новых файлов и зависимостей называет оба" "$(named "$(fd_plan Бюджет '`a.mjs` плюс 15 строк' | fd)" 'does not name «новых файлов кода: N» («new code files: N»), «новых зависимостей: N»')" назван
report "SC-AK-1972 — числа бюджета" "$(fd_read Бюджет '`a.mjs` до 10; `b.mjs` плюс 5; новых файлов кода: 2; новых зависимостей: 0' 'r.limits.map(l => l.path + (l.grows ? "+" : "=") + l.lines).join() + "/" + r.newFiles + "/" + r.newDependencies')" 'a.mjs=10,b.mjs+5/2/0'
for suite in 'mail.test.sh' 'mail/read.spec.ts' 'apps/mail-e2e/src/read.ts'; do
    report "SC-AK-1972 — набор «${suite}» узнан" "$(fd_plan Данные "письмо с файлом. SC-AK-1972, \`$suite\`" | fd)" чисто
done
report "SC-AK-1972 — описание набором не считается" "$(named "$(fd_plan Данные 'письмо с файлом. SC-AK-1972, `docs/specs/mail/spec.md`' | fd)" 'a test suite')" назван
report "SC-AK-1972 — номера сценария нет" "$(named "$(fd_plan Данные 'письмо с файлом, `mail.test.sh`' | fd)" 'a scenario number')" назван
report "SC-AK-1972 — «номера нет: причина» с набором" "$(fd_plan Данные 'письмо с файлом; номера нет: дерево без описаний. `mail.test.sh`' | fd)" чисто
for cell in 'письмо. SC-AK-1972, `tools/check-specs.mjs`' 'письмо. SC-AK-1972, `projects/mail/tests/`' 'письмо. SC-, `mail.test.sh`' 'письмо; номера нет: да. `mail.test.sh`'; do
    report "SC-AK-1972 — «${cell}» данных не подтверждает" "$(named "$(fd_plan Данные "$cell" | fd)" 'the row «Данные» does not name')" назван
done
report "SC-AK-1972 — набор со строкой" "$(fd_plan Данные 'письмо с файлом. SC-AK-1972, `mail/read.spec.ts:12`' | fd)" чисто
report "SC-AK-1972 — английские слова строк" "$(fd_plan Бюджет '`a.mjs` up to 10; `b.mjs` plus 5; new code files: 2; new dependencies: 0' | fd)/$(fd_plan Данные 'no input: a text only' | fd)/$(fd_read Модули '`a.mjs:one` moves to `b.mjs:two`' 'r.symbols.map(s => s.fate || "есть").join()')" чисто/чисто/moved,есть
report "SC-AK-1972 — ввода нет с причиной" "$(fd_plan Данные 'ввода нет: правка текста' | fd)" чисто
report "SC-AK-1972 — «ввода нет» при названных формах" "$(named "$(fd_plan Данные 'письмо с файлом; ввода нет: так вышло само' | fd)" 'a scenario number and a test suite')" назван

FD="$(fixture_repo_branched main RT-3-decision)"
trap 'rm -rf "$FD"' EXIT
PLAN="$FD/docs/tasks/RT-3-decision/plan.md"
mkdir -p "$(dirname "$PLAN")"
fd_hook() { (cd "$FD" && CLAUDE_PROJECT_DIR="$FD" "$HOOKS/flow-step-guard.sh" 2>/dev/null) | jq -r '.hookSpecificOutput.permissionDecisionReason // empty' 2>/dev/null | tr '\n' ' '; }
# Ответ проверки на запись текста $1 в файл $2; пусто — прошло.
fd_write() { jq -n --arg d "$FD" --arg f "${2:-$PLAN}" --arg c "$1" '{session_id:"tests",tool_name:"Write",cwd:$d,tool_input:{file_path:$f,content:$c}}' | fd_hook; }
fd_edit() { jq -n --arg d "$FD" --arg f "$PLAN" --arg o "$1" --arg n "$2" '{session_id:"tests",tool_name:"Edit",cwd:$d,tool_input:{file_path:$f,old_string:$o,new_string:$n}}' | fd_hook; }
fd_commit() { git -C "$FD" add -A && git -C "$FD" -c user.name=t -c user.email=t@e -c commit.gpgsign=false commit -qm "$1"; }
ENGINE="$CHECKS/task-flow-script.mjs"
fd_red() { (cd "$FD" && node "${1:-$ENGINE}" plan-red 2>&1); }
REFUSED='the decision of the plan is not complete'

report "SC-AK-1973 — запись плана без раздела отказана" "$(named "$(fd_write "$(printf '# Plan\n')")" "$REFUSED")" назван
got="$(fd_write "$(fd_body "$(fd_rows Бюджет - | grep -v Термины)")")"
report "SC-AK-1973 — отказ называет все недостающие строки сразу" "$(named "$got" 'no row «Термины» (Terms), «Бюджет» (Budget)')" назван
report "SC-AK-1973 — отказ даёт готовую строку" "$(named "$got" '«Решения нет: <reason>»')" назван
report "SC-AK-1973 — отказ говорит о решении, а не словами о задаче" "$(named "$got" "BLOCKED by flow-step-guard: $REFUSED")" назван
report "SC-AK-1973 — полный план записывается" "$(fd_write "$(fd_plan)")" ''
report "SC-AK-1973 — план с одной строкой записывается" "$(fd_write "$(fd_body 'Решения нет: правка двух слов')")" ''
fd_plan > "$PLAN"
report "SC-AK-1973 — правка, которая убирает строку, отказана" "$(named "$(fd_edit '| Бюджет |' '| Цена |')" 'no row «Бюджет»')" назван
report "SC-AK-1973 — правка полного плана проходит" "$(fd_edit 'надёжность' 'простота')" ''
TEMPLATE="$ASSETS/samples/tasks/_template/plan.md"
report "SC-AK-1973 — шаблон без правки отказан" "$(named "$(fd_write "$(cat "$TEMPLATE")")" "$REFUSED")" назван
cp "$TEMPLATE" "$PLAN"
report "SC-AK-1973 — правка шаблона по частям проходит" "$(fd_edit '<branch>' 'RT-3-decision')" ''
report "SC-AK-1973 — план чужой ветки не судится" "$(fd_write "$(printf '# Plan\n')" "$FD/docs/tasks/RT-4-other/plan.md")" ''
report "SC-AK-1973 — план эпика и другой файл не судятся" "$(fd_write "$(printf '# Epic\n')" "$FD/docs/plans/plan.md")$(fd_write текст "$FD/docs/a.md")" ''
report "SC-AK-1973 — сломанный ввод проходит" "$(printf '{"tool_name":"Write","tool_input":{"file_path":"/plan.md"' | fd_hook)" ''
fd_body '| Модули | `a.mjs:one` читает письмо |' > "$PLAN"
git -C "$FD" update-ref refs/remotes/origin/main main
fd_commit plan
report "SC-AK-1973 — plan-check называет" "$(named "$(cd "$FD" && node "$ENGINE" plan-check "$PLAN")" "$REFUSED")" назван
report "SC-AK-1973 — plan-red без метки называет и даёт ход" "$(named "$(fd_red)" "$REFUSED")/$(named "$(fd_red)" 'the fix goes into that commit before the push')" назван/назван
git -C "$FD" update-ref refs/remotes/origin/RT-3-decision HEAD
report "SC-AK-1973 — отправленный план называется так же" "$(named "$(fd_red)" "$REFUSED")" назван
cp -R "$CHECKS" "$FD/tools" && cp -R "$ASSETS/task-flow" "$FD/tools/task-flow"
report "SC-AK-1973 — движок вне истории раздел спрашивает" "$(named "$(fd_red tools/task-flow-script.mjs)" "$REFUSED")" назван
fd_commit engine
report "SC-AK-1973 — план, написанный до обновления, plan-red пропускает" "$(fd_red tools/task-flow-script.mjs | grep -oE "^1\.1 red|$REFUSED")" '1.1 red'
git -C "$FD" checkout -q -b RT-5-after && mkdir -p "$FD/docs/tasks/RT-5-after" && cp "$PLAN" "$FD/docs/tasks/RT-5-after/plan.md" && fd_commit after
report "SC-AK-1973 — план, написанный после обновления, назван" "$(named "$(fd_red tools/task-flow-script.mjs)" "$REFUSED")" назван
mkdir -p "$FD/.git/rt-kit/approval" && printf '{}\n' > "$FD/.git/rt-kit/approval/RT-5-after.json"
report "SC-AK-1973 — план с меткой не судится ни записью, ни plan-red" \
    "$(fd_write "$(printf '# Plan\n')" "$FD/docs/tasks/RT-5-after/plan.md")$(fd_red | grep -c "$REFUSED")" 0

suite_result "раздел «Решение» в плане"
