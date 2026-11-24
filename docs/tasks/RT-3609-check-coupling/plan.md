# План

**Task:** RT-3609 · **Branch:** RT-3609-check-coupling
**Behaviour:** unchanged — работа правит слой правил и инструменты, код приложений `apps/` и `libs/` не трогает.

## Points

- **A:** зацепление модулей не измеряет ничто. Циклы судятся только у `.ts` под `projects/`, а число
  связей и обходы входного файла исполнитель считает руками.
- **This task reaches:** исполнитель видит по своей ветке «было → стало»: входящие, исходящие, обходы входа,
  долю отданного без потребителя, число циклов и обходов дерева. Отправка ветки отказана на новом цикле
  модулей, новом цикле блоков, новом обходе и росте исходящих сверх названного в плане.
- **Sign:** шаги 3.3, 4.1 и 4.3: набор перед отправкой зовёт команду с базой, ветка печатает свои числа, три
  прошлых слияния с нарушением отказаны, чистое пропущено.
- **Milestone G of the epic:** у 20 задач после выпуска новых циклов и обходов ноль, медиана строк первого
  круга ревью меньше, чем у 20 задач до.
- **Metric:** слияния с новым циклом или новым обходом, вниз. Точка отсчёта — 60 последних слияний: с циклом
  1, с обходом 2, с циклом блоков 0. Считает сама команда: `--base=<слияние>^1 --at=<слияние>`. После
  выпуска считаются и записи, добавленные в список долга.

## Решение

| Часть | Что выбрано |
| --- | --- |
| Модули | `checks/coupling-graph.mjs:graphOf` — строит граф импортов из текстов. `checks/coupling-numbers.mjs:numbersOf` — считает по графу: `cyclesOf`, `bypassesOf`, `blocksOf`. `checks/coupling-judge.mjs:structureOf` — решает, что из этого нарушение; рядом `growthOf`. `checks/coupling-plan.mjs:namedOf` — читает числа, названные текстом. `checks/coupling-read.mjs:ownVersions` — отдаёт тексты с диска и с ревизии. `checks/check-coupling.mjs` — команда: настройки, вызов, печать |
| Зависимости | команда импортирует пять модулей и `rt-kit-checks.config.mjs`. Суд импортирует числа. Граф, числа, суд и чтение плана не читают диск и git; чтение не знает о суде |
| Зацепление | сейчас модулей нет. Станет: `projects/agent-kit/assets/checks/check-coupling.mjs` исходящие 0 → 6; `projects/agent-kit/assets/checks/coupling-judge.mjs` исходящие 0 → 1; у остальных четырёх исходящих нет. Циклов и обходов нет |
| Паттерны | Dependency Inversion — `checks/coupling-read.mjs:revisionFiles`: суд проверяется без диска и git; отброшено: чтение внутри графа. Information Expert — `checks/coupling-graph.mjs:resolverOf`: вариант имени `x.github.mjs` знает тот, кто разрешает импорт; отброшено: список имён в настройке |
| Термины | модуль — файл кода; блок — папка со входом или объявленная настройкой; вход — файл из `barrelFiles`, цель пути `tsconfig` или объявленный настройкой; обход — импорт снаружи папки мимо её входа |
| Данные | корни `sourceRoots` и `coupling.extraRoots`. Импорт `import … from`, `export … from`, `import '…'`, `import('…')`, `require('…')`; путь относительный, по псевдониму, по имени разложенной копии. Подключение `.` и `source`, запуск `bash`, `sh`, `node` с постоянным именем, в том числе через `$(cd … && pwd)`. Переименованный файл. Строка `` `путь` исходящие N → M `` в плане или ходе работы, путь с `/` на конце — папка. Отказано: запись долга без причины, запись без нарушения, превышение без причины, ревизия, которой нет. У каждой формы случай набора |
| Настройка дерева | `coupling.extraRoots` — `tools`. `coupling.blocks` — папки скриптов пакета (`checks`, `hooks`, `defaults`, `task-flow` с `measure` и `source` под `projects/agent-kit/assets`), `tools` и каждое приложение под `apps/`. `coupling.entries` пусто. `coupling.harness` — умолчание пакета: `tests`, `__tests__`, `__mocks__`, `fixtures`, `stories`, `.storybook` |
| Границы | ответ о циклах `.ts` сохраняется и расширяется. Список долга читает общий `parseAllowlist`. Дерево без кода под корнями — пропуск с кодом 0. Новых запросов сети нет |
| Приоритет | надёжность важнее полноты: ложный отказ стоит отправки. Команда с базой — до 5 секунд на этом дереве |
| Бюджет | файлов пакета шесть, вместе до 1000 строк, черновик занял 891; набор один, до 400 строк; описание из трёх файлов; новых зависимостей ноль |

## Что судится

| Нарушение | Отказ | Не отказ |
| --- | --- | --- |
| цикл модулей или блоков | цикла нет в базе | старый цикл; цикл, у которого стало меньше участников; цикл блоков только через тест |
| обход входа | этого импорта нет в базе | тест, стори, e2e и обвязка; цель — другой вход или новый файл со своим псевдонимом. Вход сам доходит до импортирующего. У старого импорта появился вход. Импорт переехал от соседа той же папки |
| рост исходящих | модуль вырос, а план его не назвал или назвал меньше | входной файл, тест, стори, e2e и обвязка, если план их не назвал; переименованный файл; работа, приехавшая слиянием |

- **С базой** команду зовут набор перед отправкой и CI. Список долга нового нарушения не снимает. Снимает
  запись, в причине которой стоит слово владельца с датой и цитатой; такая запись печатается. В CI собственных
  коммитов у слияния нет, поэтому рост там не судится: его судит отправка ветки.
- **Без базы** команда судит дерево целиком списком долга. С базой старое, чего в списке нет, печатается, и
  список остаётся полным.
- **Настройки** базы действуют вместе с настройками ветки: снятый веткой блок, корень или папка задач,
  добавленная обвязка, вход или псевдоним не снимают ни отказа за обход, ни отказа за рост. Блок, объявленный
  веткой над старыми связями, нового цикла не создаёт.
- **Рост** судится по собственным коммитам ветки и по первой версии её плана, а в стопке — и планов нижних
  веток, записанных раньше. План читается и после разбора папки. Дерево без папки задач печатает рост и
  проходит.
- **Папка** одним числом отвечает за новые модули внутри. Модуль, который был в базе, называется сам. Корень
  дерева папкой не принимается.
- **Превышение** — строка с числами и причиной в ходе работы. Число, дописанное в план позже или записанное в
  план чужой папки, тоже превышение. Команда печатает каждое словом `overrun`.

На 60 последних слияниях цикл, цикл блоков и обход дали бы отказ трём: цикл 1, обход 2, цикл блоков 0. Рост был
в 23 слияниях: 120 раз у прежних модулей и 173 новых модуля со связями. Их теперь называет план: модулем или
папкой. Имён планов в тех слияниях не было, поэтому число отказов за рост по ним не считается.

## Task footprint

| What             | Where                            |
| ---------------- | -------------------------------- |
| Specs (правится) | `docs/specs/agent-kit/checks/coupling/spec.md`, `docs/specs/agent-kit/checks/coupling/scenarios.md`, `docs/specs/agent-kit/checks/coupling/implementation.md`, `docs/specs/agent-kit/scenarios.md` |
| Code (правится)  | `projects/agent-kit/assets/checks/check-coupling.mjs`, `projects/agent-kit/assets/checks/coupling-graph.mjs`, `projects/agent-kit/assets/checks/coupling-numbers.mjs`, `projects/agent-kit/assets/checks/coupling-judge.mjs`, `projects/agent-kit/assets/checks/coupling-plan.mjs`, `projects/agent-kit/assets/checks/coupling-read.mjs`, `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs`, `projects/agent-kit/assets/defaults/push.sh`, `projects/agent-kit/tests/check-coupling.test.sh` |
| Tree (правится)  | `tools/coupling-allowlist.json`, `.claude/rt-kit/project.sh`, `.claude/rt-kit/checks.json`, `.claude/rt-kit/push-inputs.json`, `.github/workflows/ci.yml`, `package.json` |
| Rules (правится) | `projects/agent-kit/assets/rules/code-design.md`, `projects/agent-kit/assets/patterns/code-design-choose.md`, `.claude/skills/code-design/implementation.md`, `.claude/rt-kit/overrides/rules/lib-layers.md`, `.claude/rt-kit/overrides/pitfalls/lib-layers.md` |
| Removed (правится) | `tools/check-cycles.mjs` |

## What counts as done

- Случаи набора показывают отказ на новом цикле модулей и блоков, новом обходе и росте сверх названного и
  пропуск старого.
- Команда на этом дереве без базы печатает числа и выходит с нулём; с базой печатает «было → стало».
- Набор перед отправкой зовёт команду с базой один раз, CI зовёт её с базой `origin/main`, прежней проверки
  циклов нет.
- Правило, таблица и файл привязок называют команду вместо счёта руками; строка примера в таблице читается
  командой.

## Stages

### 1. Граф и числа

- **Steps:**
    1. Граф читает каждую форму импорта и подключения и не читает комментарий и текст
       Check: `o="$(VERBOSE=1 bash projects/agent-kit/tests/check-coupling.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1933'` → >= 29
    2. Цикл модулей находится в любом виде файлов, цикл блоков — без цикла файлов
       Check: `o="$(VERBOSE=1 bash projects/agent-kit/tests/check-coupling.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1934'` → >= 9
    3. Обход входа находится, в том числе мимо объявленного; неизбежный и законный не находятся
       Check: `o="$(VERBOSE=1 bash projects/agent-kit/tests/check-coupling.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1935'` → >= 11
    4. По модулю печатаются входящие, исходящие, обходы и доля отданного без потребителя
       Check: `o="$(VERBOSE=1 bash projects/agent-kit/tests/check-coupling.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1936'` → >= 5
- **Readiness sign:** случаи графа зелёные.
- **Verified by:** `bash projects/agent-kit/tests/check-coupling.test.sh` — без провалов.

### 2. Сравнение с базой и отказы

- **Steps:**
    1. С базой печатается «было → стало» по модулям, блокам и дереву, с `--at` — по прошлой ревизии
       Check: `o="$(VERBOSE=1 bash projects/agent-kit/tests/check-coupling.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1937'` → >= 10
    2. Новый цикл модулей и блоков отказан и при ослабленной веткой настройке, старый пропущен
       Check: `o="$(VERBOSE=1 bash projects/agent-kit/tests/check-coupling.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1938'` → >= 9
    3. Новый обход отказан; старый импорт не становится новым от нового входа и от ушедшей связи
       Check: `o="$(VERBOSE=1 bash projects/agent-kit/tests/check-coupling.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1939'` → >= 10
    4. Рост сверх названного отказан; план читается из истории; работа, приехавшая слиянием, не судится
       Check: `o="$(VERBOSE=1 bash projects/agent-kit/tests/check-coupling.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1940'` → >= 30
    5. Своя запись долга не снимает отказ, слово владельца снимает; запись без причины и без нарушения отказана
       Check: `o="$(VERBOSE=1 bash projects/agent-kit/tests/check-coupling.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1941'` → >= 12
- **Readiness sign:** отказ на четырёх нарушениях и пропуск старого видны в наборе.
- **Verified by:** `bash projects/agent-kit/tests/check-coupling.test.sh` — без провалов.

### 3. Дерево, тексты и набор перед отправкой

- **Steps:**
    1. Команда на дереве выходит с нулём и называет циклы, циклы блоков и обходы числом
       Check: `o="$(node tools/check-coupling.mjs)" && printf '%s\n' "$o" | grep -cE '^check-coupling: modules 3[0-9]{3}, links 9[0-9]{3}, cycles 2, cycles of blocks 3, past the entry 78$'` → = 1
    2. Прежней проверки циклов нет, и её не зовёт ничто
       Check: `test ! -f tools/check-cycles.mjs && cat package.json .github/workflows/ci.yml .claude/rt-kit/project.sh .claude/rt-kit/checks.json .claude/rt-kit/push-inputs.json | grep -c 'check-cycles'` → = 0
    3. Набор перед отправкой зовёт команду с базой один раз
       Check: `bash -c '. .claude/rt-kit/defaults/project.sh; . .claude/rt-kit/project.sh; rt_push_checks origin/main' 2> /dev/null | grep -c 'check-coupling.mjs --base=origin/main'` → = 1
    4. CI зовёт команду с базой, соответствие CI и набора сходится
       Check: `test -f tools/check-coupling.mjs && node tools/check-push-gate.mjs > /dev/null && grep -cE '^ +run: node tools/check-coupling.mjs --base=origin/main$' .github/workflows/ci.yml` → = 1
    5. Описание, сценарии и привязки команды на месте
       Check: `node tools/check-specs.mjs > /dev/null && grep -cE '^### SC-AK-19(3[3-9]|4[01]) ' docs/specs/agent-kit/checks/coupling/scenarios.md` → = 9
    6. Правило, таблица приёмов и файл привязок называют команду
       Check: `grep -lE 'check-coupling' projects/agent-kit/assets/rules/code-design.md projects/agent-kit/assets/patterns/code-design-choose.md .claude/skills/code-design/implementation.md | wc -l | tr -d ' '` → = 3
    7. Счёта руками в таблице приёмов нет
       Check: `test -f tools/check-coupling.mjs && grep -cE 'read by hand|until the tree has a command' projects/agent-kit/assets/patterns/code-design-choose.md` → = 0
- **Readiness sign:** проверки текстов зелёные, разложенное сходится с пакетом.
- **Verified by:** `node tools/check-specs.mjs` и `node dist/agent-kit/bin/agent-kit.js sync --check`.

### 4. Проверка вживую

- **Steps:**
    1. Команда с базой на этой ветке не отказывает и печатает «было → стало»
       Check: `o="$(node tools/check-coupling.mjs --base=origin/RT-3603-clear-task-statement)" && printf '%s\n' "$o" | grep -cE 'check-coupling\.mjs: .*outgoing 0 → 6'` → = 1
    2. Время с базой не больше пяти секунд
       Check: `s=$(date +%s); node tools/check-coupling.mjs --base=origin/RT-3603-clear-task-statement > /dev/null && echo $(( $(date +%s) - s ))` → <= 5
    3. Прошлые слияния с нарушением отказаны, чистое пропущено
       Check: `for m in 819535a12242 798bcbd73fe0 b66e3a8eb83f b498977b3e1a; do node tools/check-coupling.mjs --base=$m^1 --at=$m > /dev/null 2>&1; printf '%s ' $?; done` → `1 1 1 0`
    4. Отказ прошлого слияния называет сам цикл
       Check: `node tools/check-coupling.mjs --base=819535a12242^1 --at=819535a12242 2>&1 | grep -c 'a new cycle: .*quality-result.util.ts'` → = 1
- **Readiness sign:** «было → стало» ветки в `progress.md` до ревью.
- **Verified by:** `bash projects/agent-kit/tests/run.sh` — «ВСЕ НАБОРЫ ЗЕЛЁНЫЕ».

## What this work does not do

- Не правит старый код: 2 цикла модулей, 3 цикла блоков и 78 обходов лежат в списке долга.
- Не требует раздела «Решение» в плане: RT-3610. Не сравнивает символы и бюджет: RT-3611.
- Не судит входящие и долю отданного без потребителя: они печатаются.
- Не измеряет, тестируется ли модуль без соседей: это видит роль ревью, RT-3612.
- Не видит имя, лежащее в переменной, путь через `join`, запуск скрипта из кода и связи через шаблон Angular.
  Для них в таблице приёмов остаётся поиск.
- Не объявляет входов папкам скриптов пакета: у них нет файла, через который зовут снаружи. Их связи держит
  цикл блоков, новая связь блоков печатается.
- Не видит нового цикла внутри старого, если участники те же, и обхода, который вход сделал неизбежным своей
  новой связью.
- Не отличает рост своего модуля от роста, который в тот же модуль привезло слияние базы: оба сравниваются с
  точкой отхода. Превышение называет ход работы.
