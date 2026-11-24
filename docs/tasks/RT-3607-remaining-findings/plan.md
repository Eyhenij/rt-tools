# Plan

**Task:** RT-3607 · **Branch:** RT-3607-remaining-findings
**Behaviour:** unchanged — слово владельца 24.11.2026: «исправь все что нашел»; правка правил, защит, проверок и скриптов дерева, приложения не меняются

## Points

- **A:** 21 пункт двух файлов находок, снимки по образцу пути, восемь пунктов ревью RT-3589 и разбор
  22.11 не стоят ни в одном правиле; две длины после слияния главной красные.
- **This task reaches:** каждый пункт исправлен кодом или статьёй либо назван с доводом, и первая
  строка каждого пункта это говорит.
- **Sign:** `pnpm run agent-kit:hooks` и `bash tools/tests/run.sh` зелёные, `pnpm run agent-kit:check` и
  `node tools/check-file-size.mjs` сходятся, в трёх файлах находок нет пункта без отметки.
- **Milestone G of the epic:** RT-3597 — каждая находка названа там, где исправлена.
- **Metric:** нет: исправление найденного.

## Task footprint

| What            | Where                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Rules           | `projects/agent-kit/assets/rules/`, `projects/agent-kit/assets/patterns/`                          |
| Rules           | `projects/agent-kit/assets/pitfalls/`, `.claude/skills/turn-conduct/implementation.md`             |
| Hooks           | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/assets/checks/`                            |
| Code (правится) | `projects/agent-kit/assets/checks/flow-plan.mjs`                                                   |
| Code (правится) | `projects/agent-kit/assets/task-flow/measure/session.mjs`                                          |
| Code (правится) | `docs/specs/agent-kit/turn-guards/flow-script/`                                                    |
| Specs           | `docs/specs/agent-kit/`                                                                            |
| Tests           | `projects/agent-kit/tests/`, `tools/tests/`                                                        |
| Rules           | `.claude/skills/agent-kit-source/`, `.claude/skills/task-delivery-loop/`                           |
| Rules           | `.claude/skills/task-delivery-loop-run/`, `.claude/skills/git-workflow/implementation.md`          |
| Rules           | `.claude/skills/doc-style/implementation.md`, `.claude/skills/ui-component-tests-visual/`          |
| Rules           | `.claude/rt-kit/overrides/`, `.claude/rt-kit/postmortems/`                                         |
| Hooks           | `.claude/hooks/git-guard-draft-ready.sh`, `.claude/rt-kit/project.sh`                              |
| Code            | `tools/shot-browser.mjs`, `tools/visual-gate.mjs`, `tools/visual-snapshots-v2.mjs`, `package.json` |
| Code            | `tools/tests/run.sh`, `apps/auth-example-e2e/stand/`                                               |
| Plans           | `docs/plans/angular-doctor-findings.md`, `docs/plans/angular-doctor-review-findings.md`            |
| Plans           | `docs/plans/night-rules-findings.md`, `docs/plans/night-rules.md`                                  |

## What counts as done

- Файлы правил и наборов в пределах длины после каждого этапа; разложенное сходится с пакетом.
- Защиты и проверки пакета и дерева исправлены, у каждой правки — сценарий в её наборе и строка в
  спеке.
- Статьи пакета и дерева стоят в источнике и разложены.
- В трёх файлах находок первая строка каждого пункта называет задачу или довод; план эпика не называет
  чужих задач в строке состава.
- Разбор 22.11 и разбор слияния 24.11 лежат в приёмнике.

## Stages

### 1. Ремонт слияния

- **Steps:**
    1. Правило хода: короткий ответ и свои кнопки — статьёй в горячей части
       Check: `grep -cF "one's own questions and buttons" projects/agent-kit/assets/rules/turn-conduct.md` → >= 1
    2. Повтор о неверном выводе снят из правила хода
       Check: `grep -qF "A wrong conclusion from a right command" projects/agent-kit/assets/rules/turn-conduct.md` → exit 1
    3. Оборванный конец статьи о повторе команды снят
       Check: `grep -qF "work where it was not expected:" projects/agent-kit/assets/rules/turn-conduct.md` → exit 1
    4. Набор шагов разрезан, длины в пределе
       Check: `node tools/check-file-size.mjs` → exit 0
- **Readiness sign:** проверка длин зелёная.
- **Verified by:** `node tools/check-file-size.mjs` — «divergences» нет.

### 2. Защиты и проверки пакета

- **Steps:**
    1. Заявка задачи эпика: пять классов отказа работают
       Check: `bash projects/agent-kit/tests/delivery-epic-classes.test.sh` → /: [0-9]{2,} ok, 0 провалов$/
    2. Подстановка токена, которая даёт чужую запись, — отказ
       Check: `bash projects/agent-kit/tests/delivery-token-account.test.sh` → /: ([4-9]|[0-9]{2,}) ok, 0 провалов$/
    3. Записи 1455 и 1460 называют меню нынешними вариантами
       Check: `grep -qF "подскажу путь" projects/agent-kit/tests/fixtures/turn-replay/1460-rt3276-menu-after-refusal.json && grep -cF "подскажу путь" projects/agent-kit/tests/fixtures/turn-replay/1455-deadlock-menus-held.json` → >= 2
    4. В меню записей 1455 и 1460 нет варианта «стоп»
       Check: `grep -qE 'RT-101", "стоп"|^ +"стоп"$' projects/agent-kit/tests/fixtures/turn-replay/1455-deadlock-menus-held.json projects/agent-kit/tests/fixtures/turn-replay/1460-rt3276-menu-after-refusal.json` → exit 1
    5. Судья вопроса держит меню, где работа вся у владельца
       Check: `grep -cF "Every option hands the work to the owner" projects/agent-kit/assets/hooks/ask-judge.md` → >= 1
    6. Запись такого меню судится в прогоне судей
       Check: `grep -F "1939-menu-hands-work-over" projects/agent-kit/tests/turn-replay.expected.json` → /"ask": "block"/
    7. Записи о меню судят читатели без ожиданий
       Check: `grep -cE "^(1939-menu-hands-work-over ask block|1455-deadlock-menus-held ask allow|1460-rt3276-menu-after-refusal ask allow)$" docs/tasks/RT-3607-remaining-findings/judges.md` → >= 3
    8. План: труба без pipefail и ноль grep -c отказаны при записи, одобренный план — нет
       Check: `bash projects/agent-kit/tests/flow-plan-forms.test.sh` → /: ([6-9]|[0-9]{2,}) ok, 0 провалов$/
    9. Разбор мест записи: ключ своего интерпретатора, sed -i, переменная
       Check: `bash projects/agent-kit/tests/write-targets.test.sh` → /: ([8-9]|[0-9]{2,}) ok, 0 провалов$/
    10. Файл сценария за интерпретатором читают защита записи и защита доставки
        Check: `bash projects/agent-kit/tests/script-file-read.test.sh` → /: ([8-9]|[0-9]{2,}) ok, 0 провалов$/
    11. Конец фоновой задачи считается от доставки уведомления
        Check: `bash projects/agent-kit/tests/background-delivery.test.sh` → /: ([4-9]|[0-9]{2,}) ok, 0 провалов$/
    12. Набор отправки не отдаёт шагам окружение своего вызова
        Check: `grep -qF "окружение вызова отправки: GIT_DIR" projects/agent-kit/tests/push-set-runs.test.sh && grep -qF "окружение вызова отправки: RT_HOOK" projects/agent-kit/tests/push-set-runs.test.sh && bash projects/agent-kit/tests/push-set-runs.test.sh` → / 0 провалов$/
    13. Судья, который не запустился, — не расхождение
        Check: `grep -qF "судья не запустился" projects/agent-kit/tests/turn-replay.test.sh && bash projects/agent-kit/tests/turn-replay.test.sh` → / 0 провалов$/
    14. Защита с метками слияния называет команду восстановления, и она проходит
        Check: `grep -qF "защита с метками слияния" projects/agent-kit/tests/dispatch.test.sh && bash projects/agent-kit/tests/dispatch.test.sh` → / 0 провалов$/
    15. Отказ на составной команде называет судимый кусок — место правки и шаги
        Check: `bash projects/agent-kit/tests/combined-command-refusal.test.sh` → /: ([4-9]|[0-9]{2,}) ok, 0 провалов$/
- **Readiness sign:** каждая правка защиты держится своим набором, полный набор зелёный.
- **Verified by:** `pnpm run agent-kit:hooks` — «ВСЕ НАБОРЫ ЗЕЛЁНЫЕ»; `node tools/check-file-size.mjs`.

### 3. Статьи пакета

- **Steps:**
    1. План: отсутствие читают по попаданиям, а не по числу
       Check: `grep -cF "A check of absence is read by its hits" projects/agent-kit/assets/pitfalls/task-flow-plan.md` → >= 1
    2. План: искомая фраза стоит на одной строке
       Check: `grep -cF "A phrase a check looks for stands on one line" projects/agent-kit/assets/pitfalls/task-flow-plan.md` → >= 1
    3. План: неверную проверку заменяют, а не обходят
       Check: `grep -cF "A check the plan got wrong is replaced" projects/agent-kit/assets/pitfalls/task-flow-plan.md` → >= 1
    4. Правка состояния идёт отдельно
       Check: `grep -cF "The edit that moves the state goes alone" projects/agent-kit/assets/pitfalls/task-flow-plan.md` → >= 1
    5. Как снять шаг из одобренного плана
       Check: `grep -cF "A step leaves an approved plan" projects/agent-kit/assets/pitfalls/task-flow-resume.md` → >= 1
    6. Блок команд проверен в bash и zsh
       Check: `grep -cF "in bash and in zsh" projects/agent-kit/assets/patterns/spec-driven-rule.md` → >= 1
    7. Статья, которая приказывает над чужим предметом, цитирует его правило
       Check: `grep -cF "quotes the nearest one" projects/agent-kit/assets/patterns/spec-driven-rule.md` → >= 1
    8. Скрипт правки, сохранённый в файл, — та же запись
       Check: `grep -cF "An edit script saved to a file" projects/agent-kit/assets/pitfalls/doc-style.2.md` → >= 1
    9. Образец ночи без третьего пересказа вызовов
       Check: `grep -qF "The allowed calls are rehearsed before the owner leaves" projects/agent-kit/assets/patterns/autonomous-work-run.md` → exit 1
    10. Главная берётся ссылкой хоста, местная подтягивается тем же ходом
        Check: `grep -cF "fast-forwarded by the same fetch" projects/agent-kit/assets/pitfalls/git-workflow.2.github.md` → >= 1
    11. Отказ с готовой командой выполняется до вопроса — горячей статьёй
        Check: `grep -cF "carried out before any question" projects/agent-kit/assets/rules/task-flow-owner.md` → >= 1
    12. Меню, где каждый вариант отдаёт работу владельцу, — обход, горячей статьёй
        Check: `grep -cF "every option hands the work to the owner" projects/agent-kit/assets/rules/task-flow-owner.md` → >= 1
    13. Красное после разбора папки — в запись тем же коммитом
        Check: `grep -cF "A red fixed after the taking-apart" projects/agent-kit/assets/pitfalls/task-flow-archive.md` → >= 1
    14. Метки конфликта в защитах снимает сама команда слияния
        Check: `grep -cE "git merge .*[|][|].*checkout --ours -- .claude/hooks" projects/agent-kit/assets/patterns/git-workflow-merge.md` → >= 1
- **Readiness sign:** каждая статья находится поиском и разложена, длины в пределе.
- **Verified by:** `pnpm run agent-kit:check` — «разложенное сходится»; `node tools/check-file-size.mjs`.

### 4. Дерево

- **Steps:**
    1. Образец плана: строки таблицы несут «(правится)»
       Check: `grep -cE "\(правится\) +[|]" .claude/rt-kit/overrides/samples/tasks/_template/plan.md` → >= 2
    2. Образец плана: план одобряется вместе с пометками
       Check: `grep -cF "a mark added later is a new approval" .claude/rt-kit/overrides/samples/tasks/_template/plan.md` → >= 1
    3. Правка пакета: блок команд исполняют в bash и zsh
       Check: `grep -cF "in bash and in zsh" .claude/skills/agent-kit-source/pitfalls.md` → >= 1
    4. Правка пакета: повтор, чей судья не запустился, ничего не мерит
       Check: `grep -cF "A replay whose judge did not run" .claude/skills/agent-kit-source/pitfalls.md` → >= 1
    5. Правка пакета: проверки раскладки нового ресурса
       Check: `grep -qF "node tools/check-format-ignore.mjs" .claude/skills/agent-kit-source/pitfalls.md && grep -cF "push-inputs.mjs" .claude/skills/agent-kit-source/pitfalls.md` → >= 1
    6. Правка пакета: защита называет безвредные части
       Check: `grep -cF "names the harmless parts" .claude/skills/agent-kit-source/pitfalls.md` → >= 1
    7. Цикл задачи: шаг отмечает движок
       Check: `grep -cF "marked by the engine" .claude/skills/task-delivery-loop/pitfalls.md` → >= 1
    8. Цикл задачи: ответы ролей лежат файлом
       Check: `grep -cF "replies of the roles are saved" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
    9. Цикл задачи: PR не прячется в файл сценария
       Check: `grep -cF "never from a script file" .claude/skills/task-delivery-loop/GUARDS.md` → >= 1
    10. Привязка doc-style называет скрипт, исполненный по пути
        Check: `grep -cF "a script file an interpreter runs" .claude/skills/doc-style/implementation.md` → >= 1
    11. Привязка git-workflow называет местную главную
        Check: `grep -cF "fast-forward" .claude/skills/git-workflow/implementation.md` → >= 1
    12. Пересылка портов образа снимков: предел соединения и повтор
        Check: `bash tools/tests/shot-forward.test.sh` → /: ([5-9]|[0-9]{2,}) ok, 0 failures$/
    13. Снимки витрины по образцу пути без переснятия
        Check: `grep -qF "pointed match" tools/tests/visual-gate.test.sh && bash tools/tests/visual-gate.test.sh` → / 0 failures$/
    14. Текст цикла не говорит, что образец читается только при переснятии
        Check: `grep -qF "is read only after" .claude/skills/task-delivery-loop-run/SKILL.md` → exit 1
    15. Стенд входа пересоздаёт Keycloak на новой теме
        Check: `grep -qF "drop-stale" package.json && grep -qF "drop-stale" tools/tests/auth-stand-fresh.test.sh && bash tools/tests/auth-stand-fresh.test.sh` → / 0 failures$/
    16. Наборы дерева убирают свои каталоги
        Check: `grep -qF "leaves no directory" tools/tests/run-sets.test.sh && bash tools/tests/run-sets.test.sh` → / 0 failures$/
    17. Подсказка токена отказывает на пустом файле
        Check: `bash -c '. .claude/rt-kit/project.sh; printf %s "$RT_PULL_TOKEN_HINT"'` → /test -s/
    18. Готовый вызов PR отказывает на пустом файле токена
        Check: `grep -cF "test -s ~/.config/rt-tools-bot-token" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
    19. Привязка git-workflow несёт вызов PR с той же проверкой токена
        Check: `grep -cF "test -s ~/.config/rt-tools-bot-token" .claude/skills/git-workflow/implementation.md` → >= 1
    20. Черновик чужой ветки называется один раз на вершину
        Check: `grep -qF "один раз на вершину" tools/tests/git-guard-draft-ready.test.sh && bash tools/tests/git-guard-draft-ready.test.sh` → / 0 failures$/
- **Readiness sign:** наборы дерева зелёные, стенд входа и снимки по образцу пути прогнаны вживую, числа в
  ходе работы.
- **Verified by:** `bash tools/tests/run.sh` — «ALL SETS ARE GREEN»; `node tools/check-file-size.mjs`.

### 5. Отметки и разбор

- **Steps:**
    1. Находки RT-3477 и RT-3492 отмечены все
       Check: `awk '/^- \*\*/{t++; if(!/^- \*\*Исправлено/)n++} END{print n ? -n : t}' docs/plans/angular-doctor-findings.md` → >= 8
    2. Находки ревью RT-3585, RT-3587, RT-3588, RT-3589 отмечены все
       Check: `awk '/^[0-9]+\. /{t++; if(!/^[0-9]+\. \*\*Исправлено/)n++} END{print n ? -n : t}' docs/plans/night-rules-findings.md` → >= 23
    3. Снимки по образцу пути отмечены в файле находок ревью
       Check: `grep -cF "Исправлено в RT-3607" docs/plans/angular-doctor-review-findings.md` → >= 1
    4. План эпика: строка RT-3589 влита
       Check: `grep -cE "RT-3589 .*[|] влито" docs/plans/night-rules.md` → >= 1
    5. План эпика: строка RT-3607 не называет чужих задач
       Check: `grep -E "^[|] 4 " docs/plans/night-rules.md` → /^((?!RT-3(477|492|587|588)).)*$/
    6. Разбор 22.11 называет, где исправлен
       Check: `grep -cF "RT-3607" .claude/rt-kit/postmortems/2026-11-22-epic-main-merge-menus.md` → >= 1
    7. Разбор слияния с метками в защитах написан по образцу
       Check: `grep -cF "**Resource:**" .claude/rt-kit/postmortems/2026-11-24-merge-markers-in-guards.md` → >= 1
    8. Разборы ушли в приёмник, ответ приёма в ходе работы
       Check: `grep -cE "разборов 1[1-9].*разборы → 2026-11" docs/tasks/RT-3607-remaining-findings/progress.md` → >= 1
- **Readiness sign:** в трёх файлах находок нет пункта без отметки.
- **Verified by:** шаги 5.1–5.3.

## What this work does not do

- Уборка накопленных `tmp.*` в системном TMPDIR: не из набора, отдельной командой.
- Прогон судей настоящей моделью: вход `claude` на машине возвращает владелец. До того пункты о судье
  вопроса судят читатели, и отметка это говорит.
- Выпуск пакета и слияние эпика в главную: слово владельца.
