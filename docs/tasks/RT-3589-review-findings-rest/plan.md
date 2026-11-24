# Plan

**Task:** RT-3589 · **Branch:** RT-3589-review-findings-rest
**Behaviour:** unchanged — слово владельца 24.11.2026: «исправь все что нашел»; правка правил, защит и проверок, приложения не меняются; спека движка правится шагом 2.16

## Points

- **A:** 43 пункта девяти разделов ревью правил эпика Angular Doctor и пять дневных разборов 23.11
  лежат в файле находок и в разборах и ни в одном правиле; те же промахи повторятся в следующей
  работе.
- **This task reaches:** каждая находка стоит статьёй, правкой защиты или проверки со сценарием, а
  файл находок отмечает каждый пункт первой строкой: где исправлен или почему списан.
- **Sign:** `pnpm run agent-kit:hooks` и `bash tools/tests/run.sh` зелёные, `pnpm run agent-kit:check`
  сходится, в файле находок нет пункта без отметки.
- **Milestone G of the epic:** RT-3597 — каждая находка названа там, где исправлена.
- **Metric:** нет: исправление найденного.

## Task footprint

| What            | Where                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| Laws            | `projects/agent-kit/assets/laws/verifiability.md`                                                                     |
| Rules           | `projects/agent-kit/assets/rules/`, `projects/agent-kit/assets/patterns/`                                             |
| Rules           | `projects/agent-kit/assets/pitfalls/`, `projects/agent-kit/assets/agents/project-manager.md`                          |
| Hooks           | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/assets/checks/`                                               |
| Code (правится) | `projects/agent-kit/assets/checks/flow-step.mjs`                                                                      |
| Code (правится) | `docs/specs/agent-kit/turn-guards/flow-script/`                                                                       |
| Tests           | `projects/agent-kit/tests/`, `tools/tests/`                                                                           |
| Rules           | `.claude/skills/task-delivery-loop/`, `.claude/skills/task-delivery-loop-run/SKILL.md`                                |
| Rules           | `.claude/skills/rt-tools-storybook/SKILL.md`, `.claude/skills/rt-tools-storybook-story/SKILL.md`                      |
| Rules           | `.claude/skills/task-flow-plan/implementation.md`, `.claude/rt-kit/overrides/pitfalls/task-flow-graph.needs-graph.md` |
| Rules           | `.claude/skills/git-workflow-push/implementation.md`, `.claude/skills/testing/implementation.md`                      |
| Code            | `tools/check-boolean-inputs.mjs`, `tools/tests/run.sh`                                                                |
| Plans           | `docs/plans/angular-doctor-review-findings.md`, `docs/plans/night-rules-findings.md`                                  |

## What counts as done

- Статьи пакета по находкам и разборам стоят в источнике и разложены в дерево; у правки судей — запись
  хода в их прогоне.
- Защиты и проверки пакета исправлены, у каждой правки — сценарий в её наборе.
- Правила дерева о цикле задачи, витрине, наборе перед отправкой и их компаньоны несут свои статьи.
- В файле находок нет пункта без отметки в первой строке, а предложение об отказах на составных
  командах ушло в приёмник.

## Stages

### 1. Статьи пакета

- **Steps:**
    1. Ожидаемое число пишется голым, прогон тестов — числом прошедших
       Check: `grep -cF "never by exit 0" projects/agent-kit/assets/pitfalls/task-flow.2.md` → >= 1
    2. Сравнение с другой веткой называет её коммит
       Check: `grep -cF "git rev-parse --short <branch>" projects/agent-kit/assets/pitfalls/task-flow.2.md` → >= 1
    3. Вердикт — код выхода всей строки, VERBOSE задаёт сама строка
       Check: `grep -cF "VERBOSE=1" projects/agent-kit/assets/pitfalls/task-flow.2.md` → >= 1
    4. Добавки круга ревью несут свой признак
       Check: `grep -cF "Rewording the added items" projects/agent-kit/assets/pitfalls/task-flow.2.md` → >= 1
    5. Починки слияния главной идут в ветку задачи, папка — там же
       Check: `grep -cF "The folder is created in the task branch" projects/agent-kit/assets/rules/git-workflow.github.md` → >= 1
    6. Что такое сжатие компонента
       Check: `grep -cF "dropping blank lines and joining lines are squeezing" projects/agent-kit/assets/pitfalls/component-structure.md` → >= 1
    7. Язык каждой реплики владельцу
       Check: `grep -cF "holds for every later message of the session" projects/agent-kit/assets/patterns/doc-style-human.md` → >= 1
    8. Код, переделанный мимо проверки, — то же вынимание
       Check: `grep -cF "a key assembled from parts" projects/agent-kit/assets/laws/verifiability.md` → >= 1
    9. Сценарии задают настройки git и локаль сами
       Check: `grep -cF "set the git settings and the locale themselves" projects/agent-kit/assets/rules/git-workflow-push.github.md` → >= 1
    10. Защита отправки гоняет шаги под C.UTF-8
        Check: `grep -cF "C.UTF-8" projects/agent-kit/assets/pitfalls/git-workflow.2.github.md` → >= 1
    11. Разборщик вывода проверяется на настоящем выводе
        Check: `grep -cF "Synthetic output lacks the fields" projects/agent-kit/assets/pitfalls/testing.md` → >= 1
    12. Слитая база спрашивается списком слитых PR
        Check: `grep -cF "gh pr list --head <base> --state merged" projects/agent-kit/assets/pitfalls/git-workflow-pr.github.md` → >= 1
    13. Текст карточки — тоже ответ
        Check: `grep -cF "repeats the text of the task" projects/agent-kit/assets/patterns/task-flow-start.md` → >= 1
    14. Находка против записанного решения — строка цены
        Check: `grep -cF "a cost line in the grill" projects/agent-kit/assets/patterns/task-flow-start.md` → >= 1
    15. Движок читает план коммита, который его добавил
        Check: `grep -cF "the plan of the commit that added it" projects/agent-kit/assets/pitfalls/task-flow-start.md` → >= 1
    16. Число, которое растёт кругами ревью, — нижняя граница
        Check: `grep -cF "a lower bound" projects/agent-kit/assets/agents/project-manager.md` → >= 1
    17. Вопрос сверяется с ответами в записи сессии
        Check: `cat projects/agent-kit/assets/rules/turn-conduct.md projects/agent-kit/assets/pitfalls/turn-conduct.md | grep -cF "checked against their answers in the record of the session"` → >= 1
    18. Лишний после работы вопрос снимается в том же ходе
        Check: `cat projects/agent-kit/assets/rules/turn-conduct.md projects/agent-kit/assets/pitfalls/turn-conduct.md | grep -cF "is withdrawn in the same turn"` → >= 1
    19. Короткий ответ ищется среди своих вопросов
        Check: `cat projects/agent-kit/assets/rules/turn-conduct.md projects/agent-kit/assets/pitfalls/turn-conduct.md | grep -cF "is looked for in the record of the session"` → >= 1
    20. Ход, который уходит в следующую работу, не спрашивает
        Check: `cat projects/agent-kit/assets/rules/turn-conduct.md projects/agent-kit/assets/pitfalls/turn-conduct.md | grep -cF "goes on to the next work"` → >= 1
    21. Судья хода держит реплику не на языке владельца
        Check: `grep -cF "not in the owner's language" projects/agent-kit/assets/hooks/turn-judge.md` → >= 1
    22. Судья вопроса держит вопрос не на языке владельца
        Check: `grep -cF "not in the owner's language" projects/agent-kit/assets/hooks/ask-judge.md` → >= 1
    23. Судья вопроса отличает выбор продукта от проверки
        Check: `grep -cF "what the product sanitizes" projects/agent-kit/assets/hooks/ask-judge.md` → >= 1
    24. Запись хода не на языке владельца в прогоне судей
        Check: `ls projects/agent-kit/tests/fixtures/turn-replay | grep -c "owner-language"` → >= 1
    25. Правило плана: после коммита плана растут прочие записи папки
        Check: `grep -cF "the other records of the folder grow" projects/agent-kit/assets/rules/task-flow-plan.md` → >= 1
    26. Отсутствие проверяется кодом выхода, а не числом ноль
        Check: `grep -cF "Absence is written" projects/agent-kit/assets/pitfalls/task-flow.2.md` → >= 1
    27. Фигурные скобки в подстановке сценария раскрываются
        Check: `grep -cF "braces with a comma" projects/agent-kit/assets/pitfalls/testing.md` → >= 1
    28. Записи вопроса в прогоне судей: язык и выбор продукта
        Check: `ls projects/agent-kit/tests/fixtures/turn-replay | grep -cE "question-language|product-choice"` → >= 2
    29. Обратные кавычки в ожидании значат целую строку
        Check: `grep -cF "backticks mean a whole line" projects/agent-kit/assets/pitfalls/task-flow.2.md` → >= 1
    30. Строка с трубой называет pipefail
        Check: `grep -cF "pipefail" projects/agent-kit/assets/pitfalls/task-flow.2.md` → >= 1
- **Readiness sign:** каждая статья находится поиском по её словам; прогон судей держит новую запись.
- **Verified by:** `node tools/check-doc-paths.mjs` — 0 находок; `node projects/agent-kit/tests/judge-replay.mjs`
  — запись о языке держится.

### 2. Защиты и проверки пакета

- **Steps:**
    1. Защита доставки не берёт перенаправление за базу
       Check: `grep -cF "a redirect after the branch name is no base" projects/agent-kit/tests/guard-epic-base.test.sh` → >= 1
    2. Отказ про вершину главной называет, где лежат починки
       Check: `grep -cF "the main tip refusal names the task branch" projects/agent-kit/tests/git-guards-readiness.test.sh` → >= 1
    3. Сравнение внутри кода интерпретатора — не запись
       Check: `grep -cF "process.exit(a>b?1:0)" projects/agent-kit/tests/shell-write-paths.test.sh` → >= 1
    4. Отказ защиты отправки называет файл полного вывода
       Check: `grep -cF "the refusal names the file of the full output" projects/agent-kit/tests/push-ahead-call-guard.test.sh` → >= 1
    5. Красная строка защиты отправки называет локаль
       Check: `grep -cF "the red line names the locale" projects/agent-kit/tests/push-ahead-call-guard.test.sh` → >= 1
    6. Защита слога не судит команду без своего текста
       Check: `grep -cF "a sed chain over 60 words passes" projects/agent-kit/tests/prose-style-guard.test.sh` → >= 1
    7. Защита слога по-прежнему судит printf в .md
       Check: `grep -cF "printf of officialese into a .md is refused" projects/agent-kit/tests/prose-style-guard.test.sh` → >= 1
    8. Гейт выдаёт правила, сколько влезает, и называет остальные
       Check: `grep -cF "delivers as many as fit" projects/agent-kit/tests/skill-gate-refusal.test.sh` → >= 1
    9. Перевзвод гейта говорит то же
       Check: `grep -cF "delivers as many as fit" projects/agent-kit/tests/skill-gate-rearm.test.sh` → >= 1
    10. Проверка путей не берёт удалённую ветку за путь
        Check: `grep -cF "remote main branch is a ref" projects/agent-kit/tests/checks-doc-paths.test.sh` → >= 1
    11. Движок замораживает только план и разбор
        Check: `grep -cF "an approval line added after the plan passes" projects/agent-kit/tests/task-flow-script-steps.test.sh` → >= 1
    12. Черновик эпика уходит из временной рабочей копии
        Check: `grep -cF "the epic draft goes from a temporary tree" projects/agent-kit/tests/task-new-epic.test.sh` → >= 1
    13. Тело задачи эпика пишет «план», а не «замысел»
        Check: `grep -cF "замысел — " projects/agent-kit/assets/checks/task-new.github.mjs || true` → = 0
    14. Подсказки и отказы проверок эпиков пишут «план»
        Check: `grep -rlF --include='*.mjs' "замысел" projects/agent-kit/assets/checks | wc -l` → = 0
    15. Пакет собран и разложен
        Check: `grep -cF "a key assembled from parts" docs/constitution/verifiability.md` → >= 1
    16. Спека движка и прежние сценарии говорят, что замораживаются план и разбор
        Check: `grep -cF "a file of the task folder differs from the commit of the plan" docs/specs/agent-kit/turn-guards/flow-script/spec.md || true` → = 0
- **Readiness sign:** набор хуков зелёный, разложенное сходится.
- **Verified by:** `pnpm run agent-kit:hooks` — «ВСЕ НАБОРЫ ЗЕЛЁНЫЕ»; `pnpm run agent-kit:check`.

### 3. Правила дерева

- **Steps:**
    1. Шаги 11–12 цикла: набор до зелёного, потом разбор папки
       Check: `grep -cF "take the folder apart by the last commit and push" .claude/skills/task-delivery-loop/pitfalls.md` → >= 1
    2. План называет сквозные наборы, которых требуют его пути
       Check: `grep -cF "end-to-end suites its paths demand" .claude/skills/task-delivery-loop/pitfalls.md` → >= 1
    3. На этапе идут быстрые проверки набора
       Check: `grep -cF "the quick checks of the push set" .claude/skills/task-delivery-loop/pitfalls.md` → >= 1
    4. Статья о счёте кругов ушла как повтор
       Check: `grep -rcF "No guard counts the rounds" .claude/skills/task-delivery-loop | grep -vc ":0$" || true` → = 0
    5. Защита покрытия судит отправленную вершину
       Check: `grep -cF "coverage guard judges the pushed head" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
    6. Образец цикла называет быстрые проверки
       Check: `grep -cF "node tools/check-file-size.mjs" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
    7. Переменные личности пишутся в команде по одной
       Check: `grep -cF "zsh does not split" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
    8. Слияние базы несёт машинную личность
       Check: `grep -cF "GIT_AUTHOR_NAME=rt-tools-dev GIT_COMMITTER_NAME=rt-tools-dev git merge --no-edit origin/<base>" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
    9. Переподпись слияния базы идёт отдельным вызовом
       Check: `grep -cF "re-signing amend goes by a call of its own" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
    10. Слитая база спрашивается списком слитых PR
        Check: `grep -cF "gh pr list --head" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
    11. PR открывается после ответа отправки
        Check: `grep -cF "after the push has answered" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
    12. Снимки витрины идут одной дорогой
        Check: `grep -cF "node tools/visual-gate.mjs ui-kit-v2" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
    13. Своя витрина и стенд останавливаются перед набором
        Check: `grep -cF "stopped before the run ahead" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
    14. Графы не собираются в ветке задачи
        Check: `grep -cF "is not run in a task branch" .claude/rt-kit/overrides/pitfalls/task-flow-graph.needs-graph.md` → >= 1
    15. История приносит снимок
        Check: `grep -cF "a story brings a snapshot reference" .claude/skills/rt-tools-storybook/SKILL.md` → >= 1
    16. Обёртка истории с вычислением объявляет входы
        Check: `grep -cF "derives its values by computed" .claude/skills/rt-tools-storybook-story/SKILL.md` → >= 1
    17. Ложный комментарий проверки логических входов исправлен
        Check: `grep -cF "The showings. The stories lie outside" tools/check-boolean-inputs.mjs || true` → = 0
    18. Компаньон плана называет pipefail и сравнение ожидания
        Check: `grep -cF "compareExpected" .claude/skills/task-flow-plan/implementation.md` → >= 1
    19. Компаньон отправки называет локаль набора
        Check: `grep -cF "LC_ALL" .claude/skills/git-workflow-push/implementation.md` → >= 1
    20. Компаньон тестов помечает статью о настоящем выводе
        Check: `grep -cF "output the tool printed" .claude/skills/testing/implementation.md` → >= 1
    21. Набор сценариев дерева называет красные наборы и задаёт локаль
        Check: `grep -cF "a red set is named with its code" tools/tests/run-sets.test.sh` → >= 1
    22. Набор сценариев дерева идёт под C.UTF-8
        Check: `grep -cF "LC_ALL=C.UTF-8" tools/tests/run.sh` → >= 1
    23. Компаньон плана называет pipefail
        Check: `grep -cF "pipefail" .claude/skills/task-flow-plan/implementation.md` → >= 1
    24. Прежний порядок шага 11 ушёл
        Check: `grep -cF "up to what was done, take the folder apart" .claude/skills/task-delivery-loop/pitfalls.md || true` → = 0
    25. Образец цикла говорит, как узнать наборы, которые задевает правка
        Check: `grep -cF "the suites a change touches" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
- **Readiness sign:** набор сценариев дерева зелёный.
- **Verified by:** `bash tools/tests/run.sh` — без красных наборов.

### 4. Файл находок и приёмник

- **Steps:**
    1. Каждый пункт файла находок отмечен в первой строке
       Check: `test "$(grep -cE "^[0-9]+\. \*\*" docs/plans/angular-doctor-review-findings.md)" -ge 56 && (grep -E "^[0-9]+\. \*\*" docs/plans/angular-doctor-review-findings.md | grep -cvE "Исправлено|Списано" || true)` → = 0
    2. Пункт RT-3484.3 называет код этой задачи
       Check: `grep -cF "код — RT-3589" docs/plans/angular-doctor-review-findings.md` → >= 1
    3. Предложение об отказах на составных командах отправлено
       Check: `grep -rlF "combined commands" .claude/rt-kit/proposals | xargs grep -lF "отправлено" | wc -l` → >= 1
    4. Находки ревью RT-3585 названы там, где исправлены
       Check: `grep -cF "Исправлено в RT-3589" docs/plans/night-rules-findings.md` → >= 2
    5. Семь разборов 23.11 отмечены разделом в файле находок
       Check: `sed -n '/^## Разборы 23.11/,$p' docs/plans/angular-doctor-review-findings.md | grep -cE "Исправлено|Списано"` → >= 7
- **Readiness sign:** сухой прогон отправки показывает предложение, затем отправка его уносит.
- **Verified by:** `node dist/agent-kit/bin/agent-kit.js propose --dry-run`, затем
  `node dist/agent-kit/bin/agent-kit.js propose`.

## What this work does not do

- Находки RT-3477 и RT-3492, разбор 22.11 и ревью правил RT-3587 — задача RT-3607 того же эпика.
- Различение невидимой правки кита по diff — списано, довод в разборе.
- Состояние `замысел-записан` в таблице решений остаётся: это имя состояния движка, а не слово для
  человека.
- Старые карточки эпиков с «замысел» в теле не переписываются: сверка эпиков читает строку по номеру
  эпика.
