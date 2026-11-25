# План

**Task:** RT-3615 · **Branch:** RT-3615-one-write-target-parse
**Behaviour:** unchanged — работа правит слой правил, код приложений `apps/` и `libs/` не трогает.

## Points

- **A:** цель записи командой читают три разбора в хуках: общий `rt_write_targets`, `rt_gate_is_target` проверки
  правил и `rt_overwrite_targets` проверки переопределений. Они отвечают по-разному. Правило кода не приходит на
  `>|`, `perl -pi`, копию в папку, путь с пробелом, тело толкователя.
- **This task reaches:** цель записи читает один разбор, и три проверки спрашивают его. Правило кода приходит на
  каждую из этих форм. Чтение и запуск рядом с записью правила кода не получают.
- **Sign:** шаги 1.1, 1.2, 2.1 и 2.2.
- **Milestone G of the epic:** у 20 задач после выпуска новых циклов и обходов ноль, медиана строк первого
  круга ревью меньше, чем у 20 задач до.
- **Metric:** нет: починка. Описание обещает один разбор, а их три.

## Решение

| Часть | Что выбрано |
| --- | --- |
| Модули | `hooks/shell-words.sh:rt_shell_words` — режет текст команды на слова, называет, что пишет каждый вызов и кто читает тело heredoc. `hooks/code-writes.sh:rt_code_writes` — называет, что пишет и что запускает код толкователя. `hooks/write-targets.sh:rt_write_targets` — отвечает, какие файлы пишет команда; рядом `rt_overwrite_targets` — какие целиком. `hooks/skill-gate.sh` и `hooks/override-write-guard.sh` своего разбора не держат |
| Зависимости | `write-targets.sh` подключает `shell-words.sh`, `code-writes.sh` и прежний `script-files.sh`. Проверки подключают `write-targets.sh`, называют его в `# Requires:` и о словах и коде не знают. `shell-words.sh` и `code-writes.sh` не подключают никого и друг о друге не знают: строки одного второму отдаёт `write-targets.sh` |
| Зацепление | `projects/agent-kit/assets/hooks/write-targets.sh` исходящие 1 → 3; `projects/agent-kit/assets/hooks/code-writes.sh` исходящие 0 → 0; `projects/agent-kit/assets/hooks/skill-gate.sh` исходящие 6 → 7; `projects/agent-kit/assets/hooks/override-write-guard.sh` исходящие 5 → 6; `projects/agent-kit/assets/hooks/shell-words.sh` исходящие 0 → 0. Входящие `write-targets.sh` 6 → 8. Циклов и обходов нет |
| Как спрашивает проверка правил | цели берутся у `rt_write_targets` по самой команде, вне условия `rt_shell_writes`: каждая цель дерева получает предметное правило и слои по пути. Сценарии, которые команда запускает, она не читает (`RT_WT_SCRIPT=1`), как и прежде: запуск правила не требует. Цель без косой черты и путь через неизвестную переменную пропускаются: имя после `cd` в другую папку от файла корня текст не отличает, и SC-AK-109 остаётся. Путь от `$PWD` и `$CLAUDE_PROJECT_DIR` раскрывает общий разбор, для всех восьми хуков. Прежний цикл по `rt_shell_paths` остаётся и даёт только предметное правило: он видит `rm`, `touch` и `git checkout`, которых разбор не называет |
| Паттерны | Facade — `hooks/write-targets.sh:rt_write_targets`: проверки спрашивают одну функцию; отброшено: каждая зовёт `rt_shell_words` сама. State — `hooks/shell-words.sh:rt_shell_words`: кавычка, подстановка, тело и перенос — состояния; отброшены: ещё пять выражений `sed`, которые не различают `;` в кавычках, и резка команды из `script-files.sh:rt_script_words`: она отвечает, какой сценарий запущен, и слов с кавычками после имени команды не сохраняет. Single Responsibility — `hooks/code-writes.sh:rt_code_writes`: слова оболочки и вызовы кода меняются по разным причинам; отброшено: оставить знание о коде в двух файлах, как было до первого круга ревью |
| Термины | слово — часть вызова между разделителями; цель — файл, который вызов пишет; запись целиком — содержимое файла заменено; тело — код, отданный толкователю или оболочке |
| Данные: запись | `>`, `>>`, `>` с чертой, `&>`, `>&имя`, `tee`, `tee -a`, `cp`, `mv`, `install`, `git mv`, `docker cp`, копия в папку с косой чертой, без неё и с `-t`; `sed -i` в любом месте флагов и с суффиксом, `perl -pi`, `ruby -i`, код в `-c`, `-e`, `--eval=`, тело heredoc и строка `<<<` толкователя и оболочки, тело в подстановке после `-c`, команда в `bash -c`, `eval` и `env -S`, вложенная до четырёх раз; команда, которую код запускает строкой или списком слов; адрес записи кодом через имя, список, цикл, поле и второй довод копии; команда терминала среды; тело, записанное в файл и запущенное той же командой; путь через переменную, которой команда дала слово, и от `$PWD`; слово со скобками `{a,b}`; текст, напечатанный в трубу толкователю или оболочке |
| Данные: папка | путь команды внутри команды и сценария стоит от папки своего вызова: `cd`, `cd -P`, `cd --`, `pushd`, два подряд, папка с точкой в имени, назад на уровень, подоболочка, группа, объявленная функция, папка через переменную, корень дерева по имени и через `git rev-parse`. Папка, которую текст вычисляет иначе, папка над деревом, `cd -` и `popd` — пути нет. Переменные, которые называют друг друга, чтение кончают. `cd` самой строки команды не учитывается. У каждой формы случай в `write-dirs.test.sh` |
| Данные: вокруг имени | присваивание, `sudo`, `doas`, `arch`, `env`, `timeout`, `gtimeout`, `nice`, `stdbuf`, `xargs`, `caffeinate`, `find -exec`, `op run --`, `uv run`, `pnpm exec` с флагами и значениями до и после `exec`, слово оболочки; русское слово без кавычек в любой локали; подстановка `$(…)`, обратные кавычки, `<(…)`, `${…}`, `$'…'`, перенос `\`, комментарий; метка heredoc любая |
| Данные: не запись | стрелка в кавычках, `[[ a > b ]]`, `(( a > b ))`, `<<<`, `>&2`, `/dev/null`, чтение, в том числе кодом с `=>`, `.replace(` и словами `mkdir`, `touch`, `install` в строке, чтение, запуск и копия наружу кодом рядом с записью, запуск скрипта со своими флагами или телом, тело документа рядом с запуском, проверка синтаксиса `bash -n` и `node --check`, команда в комментарии и в строке кода, сценарий во временной папке, команда на чужой машине и в контейнере. У каждой формы всех трёх строк случай набора с её именем |
| Что снимает отказ | проверка правил: цель за скобками, в подстановке, в теле — названа. Проверка переопределений: `>` с чертой, `tee --`, копия в папку, запись кодом — отказ; `>>`, `tee -a`, `sed -i`, дописывание кодом и код, который читает файл, а потом пишет его, — проход, как прежде. Без `shell-words.sh` проверка пропускает действие и молчит, без `code-writes.sh` не читается только код |
| Границы | шесть хуков, которые уже зовут `rt_write_targets`, не правятся; их ответ меняется через разбор. `defaults/shell.sh`, `script-files.sh` и движок задач не правятся. Сценарий, который запускает команда, читается как прежде |
| Приоритет | надёжность: ложная цель отказывает чужую команду, пропущенная открывает обход. Разбор команды в 40 КБ — до пяти секунд на занятой машине. Разбор настоящей команды — до 60 мс в среднем, проверка правил зовёт его и на чтении. Замер на 3000 настоящих командах: 39 мс, у главной 37; загрузка модулей добавляет около 10 мс на вызов |
| Бюджет | новых файлов кода два: `shell-words.sh` до 495 строк, `code-writes.sh` до 480; четыре набора до 1100 строк вместе; `write-targets.sh` до 200 строк вместо 392; `skill-gate.sh` до 500 строк, сейчас 498; `override-write-guard.sh` не длиннее прежнего; случаев около 500; зависимостей ноль. В `shell-words.test.sh` 499 строк из 500: новый случай слов идёт своим набором |

## Что судится

| Форма | Было | Станет |
| --- | --- | --- |
| `perl -pi`, `sed` с `\&\&` в выражении | молчит или `\` | цель названа |
| `sed -i` и `tee` на два файла | один файл | оба |
| `cp a.sh папка/`, `cp a.sh папка` | папка | `папка/a.sh`; папку без черты узнаёт диск |
| путь с пробелом в кавычках | обрывок после пробела | путь целиком |
| код толкователя с именем файла через переменную | молчит | цель названа |
| запись целиком через переменную команды | молчит | цель названа |
| чтение рядом с записью, документ рядом с `node` | путь чтения | молчит |
| `>>` и `tee -a` на переопределение | не запись целиком | не запись целиком |

**Второй разбор** узнаётся по образцу команды записи, а не по имени функции. Формы образца названы случаями набора:
знак образца сразу за стрелкой или словом записи, слово записи в выборе, отрезание слова от текста, имя вызова записи
кода, вызов `rt_shell_words` мимо общего разбора. Форма вне случаев не узнаётся. Вне суда сам разбор из трёх файлов,
`script-files.sh` — он судит имя одного файла — и `lint-after-edit.sh`: его чтение `git mv` ждёт своей задачи.
`defaults/shell.sh` вне суда: он отвечает, пишет ли команда вообще, и дерево его переопределяет.

Разбор сравнен с разбором главной на 3000 настоящих командах: ответ один у 2919. В 81 расхождении ушли папки копий,
обрывки слов, имена из текста внутри строк и `/dev/null`. Пришли файлы в этих папках, цели `perl -pi` и цели кода. Ни
одно расхождение не потеряло файла, который команда пишет.

## Task footprint

| What             | Where                            |
| ---------------- | -------------------------------- |
| Specs (правится) | `docs/specs/agent-kit/edit-place/spec.md`, `docs/specs/agent-kit/edit-place/scenarios.md`, `docs/specs/agent-kit/edit-place/implementation.md`, `docs/specs/agent-kit/rule-gate/spec.md`, `docs/specs/agent-kit/rule-gate/scenarios.md`, `docs/specs/agent-kit/rule-gate/implementation.md`, `docs/specs/agent-kit/decision-table/spec.md`, `docs/plans/clear-task-statement-findings.md` |
| Code (правится)  | `projects/agent-kit/assets/hooks/shell-words.sh`, `projects/agent-kit/assets/hooks/code-writes.sh`, `projects/agent-kit/assets/hooks/write-targets.sh`, `projects/agent-kit/assets/hooks/skill-gate.sh`, `projects/agent-kit/assets/hooks/override-write-guard.sh`, `projects/agent-kit/assets/checks/decision-table.json`, `projects/agent-kit/tests/shell-words.test.sh`, `projects/agent-kit/tests/code-writes.test.sh`, `projects/agent-kit/tests/write-dirs.test.sh`, `projects/agent-kit/tests/write-parse-one.test.sh`, `projects/agent-kit/tests/skill-gate-design.test.sh`, `projects/agent-kit/tests/override-write-guard.test.sh`, `projects/agent-kit/tests/rule-source-guard.test.sh` |

## What counts as done

- Каждая форма трёх строк «Данные» отвечает ожидаемой целью, формы чтения молчат; у каждой есть случай набора.
- Проверка правил и проверка переопределений спрашивают общий разбор; своих функций разбора в хуках нет.
- Набор отказывает, когда в хуках появляется второй разбор любой из форм, названных его случаями.

## Stages

### 1. Разбор

- **Steps:**
    1. Каждая форма записи называет цель
       Check: `set -o pipefail; o="$(for t in shell-words code-writes; do VERBOSE=1 bash "projects/agent-kit/tests/$t.test.sh" 2>&1 || exit 1; done)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1962'` → >= 253
    2. Чтение, запуск и текст молчат, запись рядом с ними названа, длинная команда читается быстро
       Check: `set -o pipefail; o="$(for t in shell-words code-writes; do VERBOSE=1 bash "projects/agent-kit/tests/$t.test.sh" 2>&1 || exit 1; done)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1963'` → >= 109
    3. Запись целиком отличается от дописывания и правки на месте
       Check: `set -o pipefail; o="$(for t in shell-words code-writes; do VERBOSE=1 bash "projects/agent-kit/tests/$t.test.sh" 2>&1 || exit 1; done)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1964'` → >= 36
    4. Имена форм есть среди зелёных случаев
       Check: `f="$(mktemp)"; for t in shell-words code-writes; do VERBOSE=1 bash "projects/agent-kit/tests/$t.test.sh" >> "$f" 2>&1 || exit 1; done; n=0; for w in 'с чертой' '&>' '>&имя' '>&2' 'tee -a' 'tee на два' 'install' 'git mv' 'docker cp' 'cp -t' 'без косой черты' 'sed -i.bak' 'perl -pi' 'ruby -i' 'node -e' 'python3 -c' '--eval' 'bash -c' 'bash -c внутри' 'eval со' 'env -S' 'русское слово' 'строка <<<' 'из подстановки' 'heredoc толкователю' 'heredoc оболочке' 'после do' 'sudo' 'env' 'timeout' 'gtimeout' 'nice' 'stdbuf' 'xargs' 'caffeinate' 'pnpm exec' 'pnpm --filter' 'find -exec' 'из переменной' 'подстановка' 'подстановка процесса' '${' "\$'" 'перенос' 'комментарием' '[[' '((' '<<<' 'заглуш' 'стрелк' 'replace' 'документ рядом' 'тело скрипта' 'ssh'; do awk -v w="$w" '/^  ok +SC-AK-196[234]/ { l = $0; gsub(/\047/, " ", l); gsub(/\047/, " ", w); if (index(l, " " w)) hit = 1 } END { exit !hit }' "$f" && n=$((n + 1)); done; echo $n` → = 54
    5. Путь команды внутри команды стоит от папки своего вызова
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/write-dirs.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1967'` → >= 60
- **Readiness sign:** наборы разбора зелёные, прежние тоже.
- **Verified by:** `shell-words.test.sh`, `code-writes.test.sh`, `write-dirs.test.sh` — без провалов. Прежние случаи —
  наборы `shell-write-paths`, `write-targets`, `script-file-read` и `combined-command-refusal`: они зелёные и до работы,
  поэтому шагом не стоят.

### 2. Проверки, которые спрашивают

- **Steps:**
    1. Проверка правил даёт правило на `>` с чертой, `sed` и `perl` с `;`, копию в папку, путь с пробелом, `git mv`
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/skill-gate-design.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1919'` → >= 49
    2. Проверка переопределений отказывает `>` с чертой, `tee --`, копию в папку с косой чертой и без неё и пропускает текст в кавычках
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/override-write-guard.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-54[0-2]'` → >= 32
    3. Второй разбор в хуках отказан в каждой форме, названной случаями, дерево чисто
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/write-parse-one.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1965'` → >= 32
    4. Прежних функций нет: ни `rt_gate_is_target`, ни своей `rt_overwrite_targets` у проверки переопределений
       Check: `test -f projects/agent-kit/assets/hooks/shell-words.sh && ! grep -qE 'rt_gate_is_target|rt_overwrite_targets\(\) \{$' projects/agent-kit/assets/hooks/skill-gate.sh projects/agent-kit/assets/hooks/override-write-guard.sh docs/specs/agent-kit/rule-gate/implementation.md` → exit 0
    5. Без модуля слов проверка пропускает действие и молчит
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/write-parse-one.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1966'` → >= 4
    6. Описание, сценарии и привязки сходятся
       Check: `node tools/check-specs.mjs > /dev/null && grep -cE '^### SC-AK-196[2-7] ' docs/specs/agent-kit/edit-place/scenarios.md` → = 6
- **Readiness sign:** наборы проверок и тексты зелёные, вместе с `skill-gate.test.sh` и `decision-table.test.sh`.
- **Verified by:** `node tools/check-specs.mjs`, `node dist/agent-kit/bin/agent-kit.js sync --check` и наборы хуков,
  до которых доходит правка.

### 3. Проверка вживую

- **Steps:**
    1. Установленная копия проверки правил, вызов руками: правило на `perl -pi` по скрипту дерева, молчание на его запуске, на чтении кодом и на чтении рядом с записью
       Check: `f="$(mktemp)"; n=; for c in 'perl -pi -e "s/a;/b/" projects/agent-kit/assets/hooks/utf8.sh' 'bash projects/agent-kit/assets/hooks/utf8.sh' 'node -e "require(\"fs\").readFileSync(\"projects/agent-kit/assets/hooks/utf8.sh\").filter(x => x.y)"' 'node -e "const p=\"projects/agent-kit/assets/hooks/utf8.sh\"; const s=require(\"fs\").readFileSync(p); require(\"fs\").writeFileSync(\"/tmp/o.txt\", s)"'; do a="$(jq -nc --arg c "$c" --arg s "live-$RANDOM" '{session_id:$s,tool_name:"Bash",tool_input:{command:$c}}' > "$f"; CLAUDE_PROJECT_DIR="$PWD" bash .claude/hooks/skill-gate.sh < "$f" 2> /dev/null)"; case "$a" in *code-design*) n="$n 1" ;; *) n="$n 0" ;; esac; done; echo $n` → /^1 0 0 0$/
- **Readiness sign:** сравнение с прежним разбором на настоящих командах записано в `progress.md` до ревью.
- **Verified by:** набор перед отправкой, шаг `test-hooks`.

## What this work does not do

- Не трогает `rt_shell_writes` и `rt_shell_paths` в `defaults/shell.sh`: они отвечают, пишет ли команда вообще и
  какие пути называет. Дерево переопределяет их своим профилем. Поэтому предметное правило по-прежнему приходит
  и на источник `cp`.
- Не трогает `script-files.sh`: он отвечает, какой сценарий запущен, и режет команду для своего вопроса. Его вопрос
  «кладёт ли вызов этот сценарий сам» остаётся образцом по имени файла.
- Не трогает `facts.sh:rt_move_rules`: он предсказывает правило для хода, который называет отказ, и ходов командой
  с новыми формами в таблице решений нет.
- Не видит `dd`, `touch`, `truncate`, `rsync`, `ln`, `patch`, `git apply`, `git checkout`, `sort -o`, `curl -o` и
  запись кодом самих `sed` и `awk`.
- Не трогает `lint-after-edit.sh:collect_moved`: он читает `git mv` сам, и это отдельная находка.
- Не читает сценарий у проверки переопределений: запись целиком внутри него она не видит, как и прежде.
- Не учитывает `cd` самой строки команды и папку, в которой она начинается. Путь после такого `cd` стоит от корня,
  поэтому `cd` в папку переопределений снимает отказ проверки переопределений, а имя без косой черты — правило. Вход
  проверки папку несёт, это своя задача: ночная попытка вести `cd` строки открыла обходы и снята.
- Не видит запись кодом по доводу функции, по доводам сценария (`sys.argv`, `process.argv`, `environ`), по пути из
  частей, по словарю, по списку рядов через имя и переменную, которой дана другая переменная. На 3000 настоящих командах
  записью кодом заняты 169, у 62 из них цели нет.
- Не видит файла, которого в тексте команды нет: имя из потока у `xargs`, `{}` у `find -exec` и `xargs -I`, цикл по
  маске. Имя, названное словом, у них видно.
- Точка B эпика говорит «на каждую форму записи»; хватит ли названных форм, решает владелец.
- Не трогает `flow-guard.mjs`: он судит шаги задачи своим разбором, и его правит другая задача.
- Не видит команды из переменной, второго `-exec` у одного `find`, записанного сценария, запущенного из другой папки.
- Не видит перенаправления внутри обратных кавычек: текст в них чаще цитата; цели без косой черты — для проверки
  правил; группу `{ … }` в трубе; переименованное при импорте имя вызова записи; команду контейнера и чужой машины.
- В теле толкователя путь на строке записи остаётся целью, если чтение не узнано вызовом.
- Не раскрывает маску и переменную, которую команда не задала словом или задала дважды; `case` внутри `$(…)` рвёт
  разбор.
