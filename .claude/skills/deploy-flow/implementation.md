# deploy-flow — что здесь своё

Имена и привязки этого дерева при правиле `SKILL.md` рядом. Работа с очередью, ветка,
коммит и заявка — правило `git-workflow`, и своё у него лежит в `implementation.md` при нём.

## Как это называется здесь

- **В правиле** — Здесь
- **выкатка** — ручной запуск рабочего потока публикации, по потоку на пакет
- **журнал изменений** — `projects/<пакет>/CHANGELOG.md`, раздел `## [Unreleased]`

## Где это лежит

- **потоки публикации** — `.github/workflows/` — `publish.yml` и по потоку на пакет

## Где исполняются статьи

Первая колонка — статья дословно, как она написана в разделе «Как закон применяется здесь»
(жирная часть пункта). Статья без строки и строка без статьи — расхождение: правило обещает
то, чего в дереве нет, либо в дереве стоит то, о чём правило молчит.

- **The pipeline judges by the makeup of the edit and does not run everything in a row.** — `.github/workflows/ci.yml:docs_only` — признак, посчитанный от главной ветки шагом «Состав правки»; по нему пропускаются стенд, снимки обеих витрин, `verify` и обе сборки образов.
- **What starts the rollout is named by the tree, not by the rule.** — `.github/workflows/deploy.yml:workflow_dispatch` — здесь единственный триггер ручной: слияние не выкатывает ничего. Что выкачено на самом деле, спрашивается у последней успешной выкатки: `gh run list --workflow=deploy.yml --status=success --limit 1 --json headSha`.
- **The rollout goes from the merge — environment variables, secrets and name records are set before it.** — **Не исполняется.** Здесь выкатка идёт не от мержа, а от ручного запуска, и граница у переменных, секретов и записей имён — сам запуск: до него, а не до слияния.
- **The production stack is raised on one's own machine before the merge, not after.** — Не проверяется: что состав поднимали, в дереве следа не оставляет. Состав — `docker-compose.prod.yml`, тот же, что едет на узел; поднимается он `docker compose -f docker-compose.prod.yml up`.
- **The mode sign is declared in the image, not only in the production stack.** — `deploy/message-bus.Dockerfile:NODE_ENV` — вторая стадия: образ поднимают и мимо состава прода, ручным прогоном и отладкой на узле.
- **The image carries every file its own startup steps read.** — `deploy/message-bus.Dockerfile:prisma` — вторая стадия берёт схему, миграции и настройку клиента хранилища: сам приёмник их не читает, а накат изменений хранилища читает, и без них он отказывает на первом подъёме.
- **Images are rolled out by commit sha, not by the tag "latest".** — `.github/workflows/deploy.yml:IMAGE_TAG` — узел поднимается по sha; метка «последний» остаётся человеку.
- **The rollout cleans up old images after itself, keeping the last three sha.** — `deploy/prune-images.sh:KEEP` — глубина отката, три последних; помеченный sha образ висячим не бывает, и чистка висячего его не касается.
- **The machine that builds the images cleans up after itself too.** — **Не применимо.** Образов это дерево не собирает и не выкатывает: оно везёт пакеты в реестр пакетов
- **A production breakage that has happened is analysed in a record, not by a fix alone.** — Не проверяется ничем: что прод стоял, в дереве следа не оставляет, и связать починку с записью нечем. Записи живут в приёме, форму держит правило `doc-style`.
- **An edit to the rollout itself is run before the merge, and "I will check after the merge" is never the executor's decision.** — Не проверяется ничем: ручной запуск потока выкатки на ветке следа в дереве не оставляет, а слово владельца об отложенной проверке лежит вне репозитория. Держится этой статьёй и статьёй о ручном прогоне выше.
- **The description of production is edited together with the production stack.** — `.claude/rt-kit/project.sh:rt_docs_pair_for` — пара «правка и её документ», которую сторожит `.claude/hooks/docs-guard.sh`.
- **An edit to the pipeline is run before the merge with a manual run.** — `.github/workflows/deploy.yml:workflow_dispatch` — запускается на любой ветке, а сама выкатка прибита условием к главной.
- **A PR is checked before the merge by the same pipeline as the main branch.** — `.github/workflows/ci.yml:pull_request` — проверки и сборки образов идут на этом событии; выкатки среди них нет.
- **A divergence of production from the main branch is visible by the work queue audit.** — `tools/board-runs.mjs:deployLag` — последняя успешная выкатка против вершины главной ветки; поток и ветка названы в `.claude/rt-kit/checks.json` ключом `deploy`. Строку печатает `tools/check-board.mjs`.
- **The migration chain is run from an empty storage before the merge.** — Не проверяется ничем: миграции в дереве есть, а сверки с пустым хранилищем нет — она заведена задачей RT-663 и до гейта не доехала.
- **The divergence of migrations from the schema is measured on a shadow storage, not on the one the pusher works with.** — `tools/check-schema-drift.mjs:SHADOW_SUFFIX` — теневая база заводится рядом с рабочей; гейт и выкатка зовут одну и ту же проверку.
- **Skipping the schema audit is lawful while the branch has not touched the storage.** — `tools/check-schema-drift.mjs:unavailable` — стоит в наборе гейта пуша строкой `node tools/check-schema-drift.mjs`; сценарий SC-AK-822
- **A failed rollout is visible by the work queue audit apart from lagging production.** — `projects/agent-kit/assets/checks/board-runs.github.mjs:lastDeploy` — рабочий поток выкатки назван ключом `deploy.workflow` в `.claude/rt-kit/checks.json`; сценарий SC-AK-824
- **A check standing in the gate set refuses when it could not do its work.** — **Не проверяется.** Разделить «проверять негде» и «проверка сломана» может только сама проверка, каждая по-своему; общего признака, по которому это судилось бы снаружи, нет. Накопленное правится по одной проверке за раз.
