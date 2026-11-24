# План

**Task:** RT-3608 · **Branch:** RT-3608-code-design-rule
**Behaviour:** unchanged — работа правит слой правил, код приложений `apps/` и `libs/` не трогает.

## Points

- **A:** исполнитель пишет код без записанных приёмов: слов «зацепление», «изоляция», SOLID, GRASP нет ни
  в законах, ни в правилах кода.
- **This task reaches:** при разборе просьбы, до записи плана, приходят правило о том, как делить код на
  модули, и таблица «проблема, приём, чем проверить». При правке кода приходит правило.
- **Sign:** `bash projects/agent-kit/tests/skill-gate-design.test.sh` и шаги 4.1 и 4.2: исполнитель видит
  текст правила в ответе на запись разбора и на правку модуля.
- **Milestone G of the epic:** у 20 задач после выпуска новых циклов и обходов ноль, медиана строк первого
  круга ревью меньше, чем у 20 задач до.
- **Metric:** строки первого круга ревью на задачу, вниз; точку отсчёта и счёт даёт RT-3612, здесь
  измеряется только приход правила.

## Решение

| Часть | Что выбрано |
| --- | --- |
| Модули | Закон `code-structure` — что верно. Правило `code-design` — приёмы для правки кода. Паттерн `code-design-choose` — таблица для разбора и плана. Холодная часть — примеры. `skill-gate-layers.sh` — когда приходит. `skill-gate.sh` — слои и для записи командой. `skill-gate-design.test.sh` — случаи прихода |
| Зависимости | закон не называет никого; правило называет закон и свой паттерн; паттерн называет правило; слой знает только два имени |
| Зацепление | сейчас файл слоёв подключает один `skill-gate.sh` в одной ветке; станет тот же потребитель в двух ветках, слоёв девять вместо восьми. Карта `gate-map.sh` не меняется |
| Паттерны | паттерна нет: имя правила дописывается готовой функцией `rt_layer_add` в `projects/agent-kit/assets/hooks/skill-gate-layers.sh`. Отброшено: строка в каждой ветке карты — семь копий одного условия |
| Данные | приходит: `grill.md` и `plan.md` папки задачи, план эпика (оба имени); `.ts`, `.mjs`, `.cjs`, `.js`, `.sh`, входной файл (правило). Молчит: тест, стори, настройки, `.d.ts`, собранное дерево, файл агента. У каждой формы случай набора |
| Границы | предметное правило остаётся первым; снятие слоя деревом прежнее, `skill_layer_skip`; ответ хука не меняет формы. Файл с `process.env` и сейчас занимает 9949 знаков из 10000: там правила загружаются вызовом, один раз за сессию |
| Приоритет | приход до записи плана важнее полноты: в правиле только то, что нужно при правке, остальное в паттерне |
| Бюджет | правило до 2800 байт: новый компонент сейчас занимает 6750 знаков из 10000, и правила должны прийти вместе; слой до 25 строк, `skill-gate.sh` до 12; новых файлов пакета четыре; новых зависимостей ноль |

## Принципы видео и места

| Принцип | Где после этой задачи |
| --- | --- |
| сначала план | уже держит `task-flow`; правило: проектирует исполнитель, до кода |
| приёмку проверяет исполнитель | уже держат строки «Check:»; правило: у каждой формы случай |
| число вместо оценки | статья закона о связях модуля; статья о бюджете |
| бюджет назван заранее | статья правила о бюджете |
| границы явно | статья правила о границах |
| данные названы | статья правила о формах входа |
| приоритет назван | статья правила о приоритете |
| общее живёт в файлах проекта | уже держат линтер и правила; ссылка на соседние правила |
| говорим терминами | SOLID, GRASP, «банда четырёх», зацепление, связность, изоляция в правиле, паттерне и словаре |
| изменение минимальное | статья правила «только нужное шагам» |
| задача режется до модуля и функции | статья правила об одной обязанности и строка таблицы |

## Task footprint

| What             | Where                            |
| ---------------- | -------------------------------- |
| Specs (правится) | `docs/specs/agent-kit/rule-gate/spec.md`, `docs/specs/agent-kit/rule-gate/scenarios.md`, `docs/specs/agent-kit/rule-gate/implementation.md`, `docs/specs/agent-kit/rules/implementation.md`, `docs/specs/agent-kit/patterns/implementation.md` |
| Law (правится)   | `projects/agent-kit/assets/laws/code-structure.md` |
| Rules (правится) | `projects/agent-kit/assets/rules/code-design.md`, `projects/agent-kit/assets/patterns/code-design-choose.md`, `projects/agent-kit/assets/pitfalls/code-design.md`, `.claude/skills/code-design/implementation.md` |
| Code (правится)  | `projects/agent-kit/assets/hooks/skill-gate-layers.sh`, `projects/agent-kit/assets/hooks/skill-gate.sh`, `projects/agent-kit/tests/skill-gate-design.test.sh` |
| Glossary (правится) | `projects/agent-kit/assets/docs/GLOSSARY.md` |
| Rules            | `typescript-conventions`, `reuse-first`, `lib-layers` |

## What counts as done

- Правило и таблица приходят при разборе, правило — при правке кода, скрипта и входного файла, в том
  числе когда код пишет команда оболочки.
- Одиннадцать принципов видео названы местами из таблицы выше.
- Новый компонент по-прежнему получает свои правила одним ответом.
- Разложенные копии сходятся с пакетом.

## Stages

### 1. Приход правила

- **Steps:**
    1. Слой требует правило и таблицу на разборе, на плане задачи и на плане эпика
       Check: `VERBOSE=1 bash projects/agent-kit/tests/skill-gate-design.test.sh 2>&1 | grep -cE '^  ok +SC-AK-1915'` → >= 3
    2. Слой требует правило на коде, скрипте и входном файле
       Check: `VERBOSE=1 bash projects/agent-kit/tests/skill-gate-design.test.sh 2>&1 | grep -cE '^  ok +SC-AK-1916'` → >= 6
    3. Слой молчит на тесте, стори, настройках, описании типов, собранном дереве и файле агента
       Check: `VERBOSE=1 bash projects/agent-kit/tests/skill-gate-design.test.sh 2>&1 | grep -cE '^  ok +SC-AK-1917'` → >= 6
    4. Снятый деревом слой не требуется
       Check: `VERBOSE=1 bash projects/agent-kit/tests/skill-gate-design.test.sh 2>&1 | grep -cE '^  ok +SC-AK-1918'` → >= 1
    5. Запись кода командой оболочки получает те же слои
       Check: `VERBOSE=1 bash projects/agent-kit/tests/skill-gate-design.test.sh 2>&1 | grep -cE '^  ok +SC-AK-1919'` → >= 2
    6. Новый и прежний наборы проверки правил зелёные
       Check: `bash projects/agent-kit/tests/skill-gate-design.test.sh > /dev/null 2>&1 && bash projects/agent-kit/tests/skill-gate.test.sh > /dev/null 2>&1 && echo green` → `green`
- **Readiness sign:** случаи новых наборов зелёные, прежние не изменились.
- **Verified by:** `bash projects/agent-kit/tests/skill-gate-design.test.sh` — без провалов.

### 2. Тексты

- **Steps:**
    1. Закон о структуре кода получает пять статей о модуле с доводом у каждой
       Check: `grep -cE '^- \*\*(A module has one duty|Dependencies go one way|A module shows outside only|A change stays|The links of a module)[^*]*\*\* .{10,}' projects/agent-kit/assets/laws/code-structure.md` → = 5
    2. Правило code-design называет каждое слово точки A и каждый принцип из таблицы
       Check: `for w in SOLID GRASP coupling cohesion isolation budget priority bounds 'input form' 'one duty'; do grep -qiF "$w" projects/agent-kit/assets/rules/code-design.md 2> /dev/null && echo "$w"; done | wc -l | tr -d ' '` → = 10
    3. Паттерн code-design-choose держит таблицу, и у каждой строки назван приём и проверка
       Check: `grep -cE '^\| [A-Z][^|]{8,}\| [^|]{8,}\| [^|]{8,}\|$' projects/agent-kit/assets/patterns/code-design-choose.md` → >= 13
    4. Холодная часть показывает два случая из истории этого дерева до и после
       Check: `grep -cE '^- \*\*(Before|After)\.\*\* .{40,}' projects/agent-kit/assets/pitfalls/code-design.md` → >= 4
- **Readiness sign:** тексты лежат в пакете.
- **Verified by:** `bash projects/agent-kit/tests/rules-kind.test.sh` и `bash projects/agent-kit/tests/patterns-kind.test.sh` — без провалов.

### 3. Описание, копии в дереве и привязки

- **Steps:**
    1. Описание проверки правил называет приход и сценарии
       Check: `grep -cE '^### SC-AK-191[56789] ' docs/specs/agent-kit/rule-gate/scenarios.md` → = 5
    2. Описания правил и паттернов называют новые тексты
       Check: `grep -lE 'code-design' docs/specs/agent-kit/rules/implementation.md docs/specs/agent-kit/patterns/implementation.md | wc -l | tr -d ' '` → = 2
    3. Пакет разложен, правило и таблица лежат в дереве
       Check: `grep -lE '^name: code-design(-choose)?$' .claude/skills/code-design/SKILL.md .claude/skills/code-design-choose/SKILL.md 2> /dev/null | wc -l | tr -d ' '` → = 2
    4. Статьи правила привязаны к местам этого дерева или названы непроверяемыми
       Check: `test -f .claude/skills/code-design/implementation.md && node tools/check-specs.mjs > /dev/null && echo bound` → `bound`
    5. Словарь называет зацепление, связность и изоляцию
       Check: `for w in coupling cohesion isolation; do grep -qi "$w" docs/GLOSSARY.md && echo "$w"; done | wc -l | tr -d ' '` → = 3
- **Readiness sign:** проверки текстов зелёные.
- **Verified by:** `node dist/agent-kit/bin/agent-kit.js sync --check` — «сходится».

### 4. Проверка вживую

- **Steps:**
    1. Разложенный хук называет правило на записи разбора, модуля и скрипта с чистой сессией
       Check: `n=0; for f in docs/tasks/RT-1-x/grill.md projects/agent-kit/src/lib/x-new.ts projects/agent-kit/assets/hooks/x-new.sh; do printf '{"session_id":"live-%s-%s","tool_name":"Write","tool_input":{"file_path":"%s","content":"x"}}' $$ $n "$PWD/$f" | CLAUDE_PROJECT_DIR="$PWD" bash .claude/hooks/skill-gate.sh 2>&1 | grep -q 'code-design' && n=$((n+1)); done; echo $n` → = 3
    2. Новый компонент получает свои правила вместе с новым одним ответом
       Check: `printf '{"session_id":"live-c-%s","tool_name":"Write","tool_input":{"file_path":"%s","content":"x"}}' $$ "$PWD/projects/ui-kit-v2/src/lib/x-new.component.ts" | CLAUDE_PROJECT_DIR="$PWD" bash .claude/hooks/skill-gate.sh 2>&1 | grep -c 'Passed by the rules gate.*code-design'` → = 1
    3. Размер разложенного правила не выше бюджета
       Check: `wc -c .claude/skills/code-design/SKILL.md | awk '{print $1}' | grep -E '^[0-9]+$'` → <= 2800
- **Readiness sign:** числа в `progress.md`.
- **Verified by:** `bash projects/agent-kit/tests/run.sh` — «0 провалов».

## What this work does not do

- Не меряет зацепление: команда — RT-3609.
- Не требует раздела «Решение» в плане: отказ — RT-3610.
- Не сравнивает код с планом и не меняет ролей: RT-3611, RT-3612.
- Не переписывает старый код под новые статьи.
- Не поднимает предел доставки 10000 знаков: где правила вместе не помещаются, хук велит загрузить их.
