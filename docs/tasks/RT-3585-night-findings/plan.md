# Plan

**Task:** RT-3585 · **Branch:** RT-3585-night-findings
**Behaviour:** unchanged — слово владельца 24.11.2026: «исправь все что нашел»; правка проверок дерева и их текстов, приложения не меняются

## Points

- **A:** проверка согласий кита отвечает своей записью ветки за все правки кита от главной, и в
  архивной записи RT-3569 стоит строка «Без вида» с цитатой не о виде; `graphify update` оставляет
  graph.html, который читает `check:ngdoctor`; сценарии хуков краснеют, когда общий TMPDIR полон.
- **This task reaches:** ветка задачи эпика без своих правок кита проходит проверку согласий без
  строки согласий; после сборки графов проверка Angular Doctor не краснеет; набор сценариев хуков
  не зависит от TMPDIR машины.
- **Sign:** `bash tools/tests/check-kit-approval.test.sh`; `pnpm run agent-kit:hooks`.
- **Milestone G of the epic:** RT-3586 — проверка согласий судит слитые задачи по их записям,
  сборка графов удаляет graph.html.
- **Metric:** нет: исправление того, что ночью сломалось.

## Task footprint

| What    | Where                                                                                       |
| ------- | ------------------------------------------------------------------------------------------- |
| Code    | `tools/check-kit-approval.mjs`, `tools/graphs-build.mjs`, `projects/agent-kit/tests/run.sh` |
| Tests   | `tools/tests/check-kit-approval.test.sh`, `tools/tests/check-package-release.test.sh`       |
| Rules   | `projects/agent-kit/assets/pitfalls/task-flow-graph.needs-graph.md`                         |
| Archive | `docs/archive/RT-3569-ngdoctor-milestone.md`                                                |

## What counts as done

- Решение проверки согласий вынесено в чистую функцию: ветка со своей записью отвечает ею только
  за свои правки кита, слитые задачи — своими записями; сценарий это ловит.
- В записи RT-3569 нет строки «Без вида», а раздел согласий говорит, что правок кита задача не
  несёт.
- Сборка графов и образец ручной сборки удаляют graph.html.
- Каждый набор сценариев хуков получает свой TMPDIR, тест выпуска убирает свой каталог.

## Stages

### 1. Проверка согласий кита

- **Steps:**
    1. Решение проверки вынесено в чистую функцию
       Check: `grep -c "export function judgeBranch" tools/check-kit-approval.mjs` → >= 1
    2. Сценарий: своя запись отвечает только за свои правки кита
       Check: `grep -c "own record answers only for its own kit edits" tools/tests/check-kit-approval.test.sh` → >= 1
    3. В записи RT-3569 нет строки «Без вида»
       Check: `grep -c "Без вида" docs/archive/RT-3569-ngdoctor-milestone.md` → = 0
- **Readiness sign:** набор сценариев проверки согласий зелёный с новым случаем.
- **Verified by:** `bash tools/tests/check-kit-approval.test.sh` — без строки FAIL.

### 2. Graph.html

- **Steps:**
    1. Сборка графов удаляет graph.html после `graphify update`
       Check: `grep -c "'graphify-out', 'graph.html'" tools/graphs-build.mjs` → >= 1
    2. Образец ручной сборки графа удаляет graph.html
       Check: `grep -c "rm -f graphify-out/graph.html" projects/agent-kit/assets/pitfalls/task-flow-graph.needs-graph.md` → >= 1
- **Readiness sign:** после сборки графа одной папки graph.html в ней нет.
- **Verified by:** `node tools/graphs-build.mjs projects/utils` и
  `find projects/utils/graphify-out -name graph.html` — пусто.

### 3. Сценарии хуков

- **Steps:**
    1. Каждый набор сценариев получает свой TMPDIR
       Check: `grep -cF 'TMPDIR="$(mktemp -d' projects/agent-kit/tests/run.sh` → >= 1
    2. Тест выпуска пакета убирает свой каталог
       Check: `grep -c "rmSync(dir" tools/tests/check-package-release.test.sh` → >= 1
- **Readiness sign:** набор хуков зелёный; после теста выпуска в TMPDIR не прибавилось каталогов
  `rt-release-*`.
- **Verified by:** `pnpm run agent-kit:hooks` — «ВСЕ НАБОРЫ ЗЕЛЁНЫЕ»; `bash tools/tests/check-package-release.test.sh`
  и `ls -d "$TMPDIR"/rt-release-* | wc -l` до и после — число не растёт.

## What this work does not do

- Правила ночной работы и защита конца хода — задача RT-3587; статьи правил по находкам ревью —
  RT-3588.
- Форму вызова PR машинным аккаунтом без подстановки `$(cat …)` не меняет: защита доставки узнаёт
  автора PR по этой подстановке (`RT_PULL_TOKEN_VAR`), и обёртка спрятала бы вызов от неё. Ночью
  форму проверяют до ухода владельца — статья RT-3587.
