# План

**Task:** RT-3611 · **Branch:** RT-3611-stages-match-decision
**Behaviour:** unchanged — работа правит слой правил, код приложений `apps/` и `libs/` не трогает.

## Points

- **A:** конец этапов смотрит, тронут ли заявленный путь, и не смотрит, как устроен код. Отказ не называет причины. Путь
  следа с `*` сравнивается буквально, и у RT-3592 состояние не закрылось.
- **This task reaches:** состояние `этапы-кончились` не закрывается, пока символа или набора из «Решения» нет в коде,
  зацепление выше записанного, обещанное снижение связей не выполнено или бюджет превышен. Отказ называет каждое расхождение. Любое,
  кроме нового цикла и нового обхода, снимает строка решений с причиной, а после разбора папки — такая же строка в
  тексте коммита. Путь с `*` считается тронутым.
- **Sign:** шаги 1.1–1.4 и 2.1–2.5.
- **Milestone G of the epic:** у 20 задач после выпуска новых циклов и обходов ноль, медиана строк первого
  круга ревью меньше, чем у 20 задач до.
- **Metric:** строки первого круга ревью: вниз; медиана 275,5 у последних 20 задач на `d51cada26`.

## Решение

| Часть | Что выбрано |
| --- | --- |
| Модули | `measure/design.mjs:gaps` — чем код вершины ветки расходится с «Решением» плана; `measure/design.mjs:held` — список пуст. `measure/text.mjs:touches` — раскрывает маску следа. `source/design.mjs:open` — разбор раздела из `flow-decision.mjs`, чисел связей и решений из `coupling-plan.mjs`. `source/coupling.mjs:open` — отказ и числа `check-coupling` от коммита плана, хранимые по вершине, ветке, коммиту плана и незаписанным правкам. `source/git.mjs:commits` — отдаёт тексты коммитов и признак своего, не привезённого слиянием. `checks/coupling-plan.mjs:namedOf` — отдаёт и число до стрелки. `checks/task-flow-script.mjs:measureStates` и `checks/flow-verdict.mjs:holdReason` — печатают расхождения |
| Зависимости | `measure/design.mjs` подключает `measure/text.mjs`; `flow.js` называет мерило и источники; источники зовут разбор и команду. Мерило диска и процессов не читает: всё приходит портами. Обратно никто |
| Зацепление | `projects/agent-kit/assets/task-flow/measure/design.mjs` исходящие 0 → 1; `projects/agent-kit/assets/task-flow/source/design.mjs` исходящие 0 → 0; `projects/agent-kit/assets/task-flow/source/coupling.mjs` исходящие 0 → 0; `projects/agent-kit/assets/task-flow/measure/text.mjs` исходящие 0 → 0; `projects/agent-kit/tests/flow-design.test.sh` исходящие 0 → 3. Входящие `text.mjs` 8 → 9. Циклов и обходов нет |
| Паттерны | Dependency Inversion — `measure/design.mjs:gaps`: разбор, версии файлов и ответ о зацеплении приходят портами, случаи зовут мерило без репозитория; отброшено: звать команду из мерила. Pure Fabrication — `source/coupling.mjs:open`; отброшено: второй счёт связей |
| Термины | расхождение — строка о том, чего решение обещало, а в коде нет; снятие — строка решений хода работы или коммита с путём или символом, словом и причиной. Оба — в словаре пакета |
| Данные: символ | объявлен; удалён; остался в комментарии; остался в импорте; файл удалён; короткий путь одного файла; пакет и его разложенная копия; два файла, символ в одном. Имя внутри другого слова; `Класс.метод`; `#private`; класс стилей; имя с дефисом. Место после слова «отброшено» и до него в одном предложении; «удаляется» сразу после места или списка мест — удалён и остался; «переезжает в» в своей части между «;». Ещё: паттерн удалён из кода, а в его предложении стоит «отброшено», — назван; функция оболочки, ключ объекта, метод; файл незнакомого языка. SC-AK-1974, `flow-design.test.sh` |
| Данные: набор и новый файл | набор есть и тронут; набора нет; не тронут, но нёс номер; не тронут и номера не нёс; без номера сценария; «ввода нет». Новый файл назван «Модулями», точным путём следа, папкой следа, никем; набор и копия — проход. SC-AK-1974, `flow-design.test.sh` |
| Данные: бюджет | «до N» меньше, равно, больше; «плюс N»; двоичный и удалённый файл; число без пути; «новых файлов кода: N»; «новых зависимостей: N» с правкой и без правки зависимостей. SC-AK-1975, `flow-design.test.sh` |
| Данные: снятие | строкой решений с причиной; без причины; папка разобрана — коммитом; чужим коммитом; стопка из двух задач. Слита база или ветка эпика с чужими новыми файлами, функциями и зависимостями — молчание; новый цикл и новый обход не снимаются. SC-AK-1975, `flow-design.test.sh` |
| Данные: зацепление | команда молчит; строка `violations`; число в плане и строка превышения в решениях. Снижение: не выполнено, выполнено не целиком, модуль не тронут — названо; выполнено с запасом, модуль удалён, число без изменения, папка — молчание. Неизвестная ревизия; команды нет; упала. Ответ хранится по вершине; две ветки на одной вершине ответа не делят; незаписанная правка и новый файл вне истории ответа вершины не портят; «не ответила» не хранится. SC-AK-1976, `flow-design.test.sh` |
| Данные: движок | символ удалён и возвращён; лишний импорт, который видит настоящая команда; строка сверх бюджета; то же разложенной копией; отказ в конце хода называет расхождение. SC-AK-1978, `flow-design.test.sh` |
| Данные: след | `tools/*.mjs` и `tools/a/b.mjs` мимо него; `**/x.sh`; `dir/*/a`; точка в имени; прежние пути без маски. SC-AK-1977, `task-flow-script.test.sh` |
| Данные: план | полный; без «Решения»; «Решения нет» без новых символов, с новым файлом кода, с новой функцией, классом или экспортом в прежнем файле; старая версия; чужая ветка; папка разобрана. SC-AK-1974, `flow-design.test.sh` |
| Границы | `check-coupling`, прежние ответы `namedOf`, запись плана, метка одобрения и `flow-guard.mjs:namedBy` не правятся. Плана без «Решения» мерило не судит. Источник, который не ответил, состояния не держит |
| Приоритет | надёжность: ложный отказ держит ход владельца, поэтому непрочитанное пропускается, а отказ называет причину. Мерило на той же вершине — до 0,2 секунды, на новой — до пяти |
| Бюджет | `projects/agent-kit/assets/task-flow/measure/design.mjs` до 190 строк; `projects/agent-kit/assets/task-flow/source/coupling.mjs` до 80; `projects/agent-kit/assets/task-flow/source/design.mjs` до 40; `projects/agent-kit/tests/flow-design.test.sh` до 330. Прежние файлы: `projects/agent-kit/assets/task-flow/measure/text.mjs` плюс 15; `projects/agent-kit/assets/task-flow/flow.js` плюс 6; `projects/agent-kit/assets/task-flow/source/git.mjs` плюс 8; `projects/agent-kit/assets/checks/task-flow-script.mjs` плюс 14; `projects/agent-kit/assets/checks/flow-verdict.mjs` плюс 8; `projects/agent-kit/assets/checks/coupling-plan.mjs` плюс 6; `projects/agent-kit/tests/flow-doubles.mjs` плюс 30; `projects/agent-kit/tests/task-flow-script.test.sh` плюс 20; новых файлов кода: 4; новых зависимостей: 0 |

## Task footprint

| What             | Where                            |
| ---------------- | -------------------------------- |
| Specs (правится) | `docs/specs/agent-kit/turn-guards/flow-script/decision/`, `docs/specs/agent-kit/turn-guards/flow-script/spec.md`, `docs/specs/agent-kit/turn-guards/flow-script/implementation.md`, `projects/agent-kit/assets/docs/GLOSSARY.md` |
| Rules (правится) | `projects/agent-kit/assets/rules/task-flow.md`, `projects/agent-kit/assets/patterns/code-design-choose.md` |
| Code (правится)  | `projects/agent-kit/assets/task-flow/measure/design.mjs`, `projects/agent-kit/assets/task-flow/measure/text.mjs`, `projects/agent-kit/assets/task-flow/source/design.mjs`, `projects/agent-kit/assets/task-flow/source/coupling.mjs`, `projects/agent-kit/assets/task-flow/source/git.mjs`, `projects/agent-kit/assets/task-flow/flow.js`, `projects/agent-kit/assets/task-flow/flow.md`, `projects/agent-kit/assets/checks/task-flow-script.mjs`, `projects/agent-kit/assets/checks/flow-verdict.mjs`, `projects/agent-kit/assets/checks/coupling-plan.mjs`, `projects/agent-kit/tests/flow-design.test.sh`, `projects/agent-kit/tests/flow-doubles.mjs`, `projects/agent-kit/tests/task-flow-script.test.sh` |

## What counts as done

- Символ, набор или новый файл расходится с «Решением» — состояние не закрывается, отказ называет, что именно.
- Файл длиннее бюджета, лишний файл или зависимость и рост связей сверх плана держат состояние; записанное снятие
  отпускает, после разбора папки — текстом коммита.
- Путь `tools/*.mjs` считается тронутым; план без «Решения», одобренный раньше, закрывается как прежде.

## Stages

### 1. Мерило

- **Steps:**
    1. Символ, набор и новый файл, которые расходятся с решением, названы; сошедшиеся молчат
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/flow-design.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1974'` → >= 40
    2. Бюджет сверх числа назван, снятие с причиной отпускает
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/flow-design.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1975'` → >= 16
    3. Отказ зацепления назван, отсутствие ответа молчит, ответ хранится по вершине
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/flow-design.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1976'` → >= 14
    4. Обещанное снижение связей, выполненное не целиком или не выполненное, названо
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/flow-design.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1976.*снижени'` → >= 6
- **Readiness sign:** набор зелёный, мерило зовётся в случаях без репозитория.
- **Verified by:** `bash projects/agent-kit/tests/flow-design.test.sh` — без провалов.

### 2. След и состояние

- **Steps:**
    1. Путь с маской считается тронутым, прежние пути отвечают так же
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1977'` → >= 6
    2. Символ удалён — движок стоит на `этапы-кончились` и печатает символ; возвращён — идёт дальше
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/flow-design.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1978.*символ'` → >= 4
    3. Лишний импорт держит движок с настоящей командой зацепления
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/flow-design.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1978.*импорт'` → >= 2
    4. Разложенная копия отвечает то же: символ и лишний импорт
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/flow-design.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1978.*разложенн'` → >= 2
    5. Отказ в конце хода называет расхождение
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/flow-design.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1978.*конце хода'` → >= 2
    6. Таблица состояний правила сходится с движком
       Check: `node projects/agent-kit/assets/checks/flow-sync.mjs --check > /dev/null && grep -c 'measure.design.held' projects/agent-kit/assets/rules/task-flow.md` → >= 1
    7. Описание, сценарии и привязки сходятся
       Check: `node tools/check-specs.mjs > /dev/null && grep -cE '^### SC-AK-197[4-8] ' docs/specs/agent-kit/turn-guards/flow-script/decision/scenarios.md` → = 5
- **Readiness sign:** прежние случаи `task-flow-script.test.sh` и `turn-replay.test.sh` зелёные.
- **Verified by:** набор перед отправкой, шаг `test-hooks`.

### 3. Проверка вживую

- **Steps:**
    1. Установленное мерило на вершине этой ветки нашло план, получило ответ команды и расхождений не называет
       Check: `node -e 'Promise.all(["measure/design", "source/git", "source/design", "source/coupling"].map(n => import("./tools/task-flow/" + n + ".mjs"))).then(([m, g, d, c]) => { const [git, design, coupling] = [g, d, c].map(s => s.open()), sha = git.addedBy("docs/tasks/RT-3611-stages-match-decision/plan.md"); console.log([m.gaps({git, design, coupling})().length, !!sha, coupling.from(sha).answered].join()); })'` → `0,true,true`
- **Readiness sign:** в черновой копии удалён один символ, вывод `measure` с его именем вставлен в `progress.md`; мерило
  на планах RT-3609 и RT-3615 ответило, числа там же.
- **Verified by:** `node tools/task-flow-script.mjs measure` до и после удаления символа.

## What this work does not do

- Не судит качество решения, зависимости и границы словами: их читает роль RT-3612, точка B RT-3612 это называет.
- Не считает связи сама: это `check-coupling`. Снижения связей папки не сравнивает: команда его не печатает. Входящих не сравнивает: план называет их, а команда отказа за них не даёт.
- Не видит символа, который стоял до плана и не правился: он сходится без правки. Место с коротким путём, которое есть в
  нескольких файлах, сходится по одному.
- Не видит удаления и добавления поровну в «плюс N»: вместо `git diff --numstat` считается разность длин. Файл без числа
  в бюджете не судится. Новый символ в прежнем файле судится только при «Решения нет».
- Не ищет случая на каждую форму входа: судит набор и номер сценария, слово владельца 25.11 о сужении RT-3610.
- Не держит состояния, когда `check-coupling` не ответил.
- Не правит форму плана: её держит RT-3610.
- Не переписывает `maskOf` черновика RT-3612: при переносе он возьмёт маску у `text.mjs`.
