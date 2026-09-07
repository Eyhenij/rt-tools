# git-workflow — как это устроено здесь

Имена этого дерева при правиле `SKILL.md` рядом. Отдельный файл потому, что правило говорит
приёмом и переносится между репозиториями целиком, а всё, что ниже, верно только здесь и
устаревает при каждом переименовании.

Главное отличие от общего случая: слияние в главную ветку здесь ничего не выкатывает. Дерево
публикует пакеты, и публикация — отдельный ручной запуск рабочего потока, а не следствие
слияния.

## Как это называется здесь

- **В правиле** — Здесь
- **главная ветка** — `main`
- **очередь работ** — доска проекта на GitHub; задача — это issue на ней
- **колонка задачи** — поле `Status`: «In progress» при заведении ветки, «In review» при открытии PR
- **первая колонка** — «📋 Backlog» — туда команда заведения ставит новую задачу, оттуда её забирают в работу
- **команда перевода колонки** — `npm run task:move <номер> <короткое имя колонки>`: `npm run task:move 899 in-progress`
- **короткое имя колонки** — ключ в `board.statusOptions` файла `.claude/rt-kit/checks.json`; полное имя лежит там же, рядом
- **ключ задач** — `RT` — назван в `.claude/rt-kit/checks.json`, ключом `board.taskKey`
- **заголовок задачи** — `[RT-<номер задачи>] <Что не так>`: `[RT-88] Add select button component`
- **имя ветки** — `RT-<номер задачи>-<краткое имя>`: `RT-88-add-select-button`
- **род правки** — `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `perf`, `test`, `build`, `ci`
- **строка связи с задачей** — `Closes #<номер>` в теле PR
- **учётная запись машинной работы** — `rt-tools-dev` — ею подписан коммит, ею заводится задача и открывается PR; ревьювером она не бывает
- **подстановка токена в вызов** — `.claude/rt-kit/project.sh:RT_PULL_TOKEN_VAR` — `GH_TOKEN`; готовая строка для отказа гарда — там же, `RT_PULL_TOKEN_HINT`
- **раздел тела заявки об оставшемся шаге** — `.claude/rt-kit/project.sh:RT_PULL_BODY_SECTION` — заголовок «Оставшийся шаг»: гард поставки требует его в теле каждой заявки

## Где это лежит

- **токен машинной учётной записи** — `~/.config/rt-tools-bot-token` — вне дерева, в историю не попадает
- **активная запись клиента хостинга** — запись владельца; спрашивается `gh auth status` — строка «Active account: true» стоит у одной записи. Машинная запись подставляется на вызов переменной `GH_TOKEN` и активной не делается: вход под неё уводит все соседние сессии на машине
- **работа с доской** — `.claude/skills/git-workflow/scripts/board.sh`
- **сбор состояния ветки перед PR** — `.claude/skills/git-workflow/scripts/gather-context.sh`
- **формы описания PR и журнала** — `.claude/skills/git-workflow/REFERENCE.md`
- **гард главной ветки, поставки, пуша** — `.claude/hooks/git-guard-main.sh`, `git-guard-delivery.sh`, `git-guard-push-tests.sh`
- **гард пары «правка и её документ»** — `.claude/hooks/docs-guard.sh`
- **профиль дерева для гардов** — `.claude/rt-kit/project.sh`
- **проверка заголовка коммита** — `commitlint.config.cjs`, вызывается хуком гита из `.husky/commit-msg`

## Что переносится в новое рабочее дерево

`git worktree add --detach <путь> origin/main` разворачивает индекс и больше ничего. Руками
копируется:

- **`.env`** — ключи, которыми живут скрипты дерева
- **`.claude/settings.local.json`** — локальные разрешения; без них заход спрашивает подтверждение на каждую команду
- **`.claude/rt-kit/browser-device-id`** — закреплённый идентификатор устройства браузера — новый не заводится и не спрашивается

Следом `pnpm install` в новом дереве: `node_modules` рабочие деревья не делят.

## Где исполняются статьи

Первая колонка — статья дословно, как она написана в разделе «Как закон применяется здесь»
(жирная часть пункта). Статья без строки и строка без статьи — расхождение: правило обещает
то, чего в дереве нет, либо в дереве стоит то, о чём правило молчит.

- **A commit into the main branch is refused by the guard.** — `.claude/hooks/git-guard-main.sh:default` — имя главной ветки берётся у удалённой ссылки и сверяется с текущей; зарегистрирован в `.claude/settings.json` на вызов оболочки.
- **A branch without a task number opens no PR.** — `.claude/rt-kit/project.sh:rt_task_branch_ok` — форма `RT-<номер>-<имя>`; зовёт её `.claude/hooks/git-guard-delivery.sh`.
- **The next work's branch is taken from the previous one while the chain is unbroken.** — **Не проверяется ничем.** Гард поставки судит форму имени ветки и свежесть основания, а родство соседних веток ему не видно. Ветка от предыдущей и ветка от главной для него одинаковы. Держится порядком паттерна `git-workflow-stack`.
- **A PR in a chain has the previous branch as its base, not main.** — **Не проверяется ничем.** Основание заявки читается у хостинга, а какое из двух верно, знает только тот, кто ветвился. У работы, не связанной с предыдущей, база — главная, и это законно.
- **A chain is merged bottom-up, and the order stands in every PR body.** — **Не проверяется ничем.** Сверка очереди читает тело заявки как текст; отличить названный порядок от его отсутствия ей нечем.
- **The lower branch of a chain does not rewrite history — neither `rebase` nor a force push.** — `.claude/hooks/git-guard-delivery.sh:cmd` — силовая отправка отбивается разбором командной строки; `rebase` в ветке, под которой стоит другая, не судится ничем.
- **A divergence inside a chain is resolved by the one who branches.** — **Не проверяется ничем.** Кто разрешил расхождение, в истории не записано: слияние выглядит одинаково, чьей бы рукой оно ни сделано.
- **On a machine with several runners, any path from the home directory is shared.** — **Не проверяется ничем.** Ни гард, ни сверка не знают, сколько раннеров стоит на машине: список заданий у хостинга один, а машина у них общая только по факту. Держится статьёй и именами по проекту в настройке конвейера
- **The working tree is not emptied for a tool run.** — **Не проверяется ничем.** Прятанье от законного переключения ветки формой команды не отличается: обе снимают правки с рабочей копии, и какая из них ради прогона, а какая ради работы, машине не видно
- **The main branch is merged into the task branch before the PR opens.** — `.claude/hooks/git-guard-delivery.sh:remote_main` — вершина главной ветки спрашивается у удалённой ссылки и сверяется с предками текущей; расхождение называется числом коммитов.
- **Unmet delivery conditions are named in one refusal.** — `.claude/hooks/git-guard-delivery.sh:deny_faults` — накопитель `fault` собирает их по ходу разбора, а печатает одним отказом уже перед выходом.
- **A condition known at the start of work is asked at the start.** — `.claude/hooks/git-guard-delivery.sh:branch_arg` — на `git checkout -b` и `git switch -c` спрашиваются вершина главной ветки у хостинга в основании и `git config user.email` против `RT_COMMIT_EMAIL`. Флаги между глаголом и `-b` образец принимает.
- **The base judged is the one named by the command, not the tip of the working copy.** — `.claude/hooks/git-guard-delivery.sh:base_ref` — вторым доводом команды заведения ветки; названного основания нет — судится вершина рабочей копии, неизвестного дереву — не судится ничего.
- **A branch without a task number gets no delivery conditions.** — `.claude/hooks/git-guard-delivery.sh:branch_arg` — имя без формы `RT-<номер>` выводит гард нулём, не спросив ни основания, ни подписи.
- **A task left in the first column opens no PR.** — `.claude/rt-kit/project.sh:RT_BOARD_BACKLOG` — «📋 Backlog»; читает её `.claude/hooks/git-guard-delivery.sh:check_task` на открытии PR; на заведении ветки колонка не спрашивается.
- **The draft is not lifted from a branch that does not merge.** — `.claude/hooks/git-guard-delivery-draft.sh:conflicting` — сливаемость приходит тем же ответом, что ревьювер и отзыв; поля нет — требования нет.
- **One's own open PRs are reread in three places: before a push, on taking a task and after every known merge.** — `tools/board.mjs:behindMain` вместе с `tools/check-board.mjs` называют отставшие и конфликтующие заявки; между прогонами сверки это держится порядком паттерна `git-workflow-stack`.
- **One's own conflicting PR is fixed by the turn's first action, and no new work is taken before that.** — `.claude/hooks/git-guard-delivery-conflict.sh:rt_delivery_conflict` — помощник гарда поставки отбивает четыре команды взятия работы, пока `tools/board.mjs:conflictingPulls` называет хоть одну свою открытую заявку конфликтующей.
- **A conflicting open PR is a work queue audit discrepancy.** — `tools/check-board.mjs:checkConflicting` — судится только прямое «конфликтует»; непосчитанная сливаемость строки не даёт.
- **An index that branches only append lines to is declared a union of both sides.** — Не проверяется: настройку слияния не читает ни одна сверка дерева, а хостинг её не читает вовсе. Объявление лежит в `.gitattributes` — таблице записей описания прошлого и таблице доменов договорённостей.
- **An edit brought to a commit is brought to the host in the same turn.** — Не исполняется: рабочее дерево исполнителя не видит ни одна проверка. Держится этой статьёй.
- **The draft is not lifted while the PR has no review.** — `.claude/hooks/git-guard-delivery-draft.sh:rt_pull_state` — состояние PR приходит от `tools/board.mjs`, разбором считается запрошенный ревьювер либо оставленный отзыв не от автора.
- **The task key is set once, and all three name forms derive from it.** — `.claude/rt-kit/checks.json:taskKey` — оттуда его берут и заведение задачи, и гард поставки, и сверка очереди.
- **An unset key refuses work with the queue on the spot.** — `tools/board.mjs:TASK_KEY` — пустое значение кончает первый же вызов отказом с указанием, где ключ задаётся.
- **A created task is confirmed by the work queue's answer, not by the creation command's output.** — `tools/task-new.mjs:describeTaskState` — пятым шагом команда спрашивает борду по номеру и печатает присутствие, колонку и исполнителя; расхождение кончает её ненулевым кодом.
- **The visibility of what was created is checked by the side it is meant for.** — `tools/task-new.mjs:describeTaskState` — пятый шаг спрашивает борду отдельным вызовом, а не читает ответ заведения; для заявки того же нет — её видимость называется владельцу номером и проверяется им. Чьими глазами снят ответ, печатает поле `viewer` — `tools/board.mjs:viewerOf`: `machine` у чтения задачи с токеном, `client` у чтения заявки.
- **A refusal is read before it is bypassed by a second way.** — Не проверяется машиной: обход отказа неотличим от вызова, который с самого начала шёл вторым способом. Признак спрашивается у хостинга — `/opt/homebrew/bin/gh api rate_limit`: у ограниченной записи там ноль.
- **The branch number and the PR title number are checked on the spot, the task state — by the board.** — `.claude/hooks/git-guard-delivery.sh:check_task` читает номер из имени ветки и сверяет его с номером в заголовке PR. Второй ярус — `npm run check:board`, он же показывает исполнителя и колонку.
- **The task column moves in the same motion as the work.** — `.claude/skills/git-workflow/scripts/board.sh:cmd_status` — вызов сразу за заведением ветки и сразу за открытием PR.
- **The board holds tasks, not PRs about them.** — `tools/check-board.mjs:foreign` — строка на каждую карточку PR. Заводит их встроенное правило борды «Auto-add to project», выключается оно только в интерфейсе, накопившееся снимает `deleteProjectV2Item`.
- **A lagging column is found by the queue audit, not by eye.** — `tools/check-board.mjs:IN_REVIEW` — колонка судится по открытым PR в обе стороны: PR при задаче не в разборе и разбор без открытого PR.
- **A branch with an open PR lags behind main silently.** — `tools/board.mjs:behindMain` — сравнение главной ветки с головой каждой открытой заявки; строку печатает `tools/check-board.mjs`.
- **The link between a task and an epic is read by the audit both ways.** — `tools/board-epics.mjs:checkEpicLinks` — состав эпика читается в замысле, названном телом его карточки, а тело каждой задачи — у хостинга; расхождение называется в обе стороны, без метки эпика проверка молчит.
- **Tasks fixed by one edit are merged before the merge.** — Не проверяется ничем: слияние двух задач в одну машине неотличимо от закрытия второй. Держится разбором — поглощённая дописывается в первую и уходит с борды до слияния PR.
- **Work that one session cannot close is marked in two places, and they are audited.** — `projects/agent-kit/assets/checks/board-long-work.github.mjs:checkLongWork` — обе стороны: метка карточки без строки в линии и строка без метки. Имя метки и каталог линий названы ключом `longWork` в `.claude/rt-kit/checks.json`; не названо любое из двух — связь не судится вовсе. Сценарий SC-AK-823
- **The tip of an open PR without a run is seen by the work queue audit.** — `tools/check-board.mjs:checkHeadRun` — прогоны на вершине спрашиваются, пока в дереве лежит названный настройкой файл конвейера; свежей вершине даётся десять минут.
- **A PR whose base is not the main branch is checked by the same set as a PR into main.** — `.github/workflows/ci.yml:on` — условие запуска здесь объявлено на заявку без отбора по базе, поэтому каждая заявка стопки прогон получает. Статья приехала от дерева, где отбор по базе стоит; **не проверяется ничем** то, что отбор не появится позже: заведённый однажды, он снимет проверку со всей стопки молча.
- **A run pushed out of the pipeline queue gets a separate audit line.** — `tools/check-board.mjs:checkEvicted` — признак берётся числом заданий прогона: `tools/board-runs.mjs:evictedOnHead` спрашивает его только у отменённых, а зелёный прогон на той же вершине строку снимает.
- **A draft with a green run on its tip is an audit discrepancy.** — `tools/check-board.mjs:checkReadyDraft` — цвет прогона спрашивается только у черновика: зелёный при нём значит, что работа готова, а кнопка слияния у владельца заблокирована.
- **One's own drafts are judged all at once, not only the checked-out branch's.** — `.claude/hooks/git-guard-draft-ready.sh:judge_abandoned` — список открытых черновиков спрашивается по имени машинной записи из `.claude/rt-kit/checks.json`; папка чужой ветки читается по `origin/<ветка>`, а её отсутствие — по `carries_folder`.
- **Opening a PR is refused while the branch carries its task folder.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_delivery_open_folder` — ярус на `gh pr create`; второй рубеж на `gh pr merge` — `rt_delivery_merge_folder`. Каталог задач `docs/tasks`, каталог архива `docs/archive`, главная `main`.
- **A document goes in the same commit as the edit.** — `.claude/rt-kit/project.sh:rt_docs_pair_for` — пары этого дерева: описание компонента второго кита рядом с ним и описание набора токенов при правке самих токенов; сторожит их `.claude/hooks/docs-guard.sh`.
- **The commit subject is checked against the format on the spot.** — `commitlint.config.cjs:rules` — набор `@commitlint/config-angular` плюс правило `subject-russian`: описание пишется по-русски. Зовёт его хук гита из `.husky/commit-msg`, то есть судит он руку; коммит конвейера мимо хука идёт, и язык там держат сами шаблоны выпуска. Случаи — `projects/agent-kit/tests/tree-commit-language.test.sh`.
- **Before a push all linters are run, not one.** — `.claude/rt-kit/project.sh:rt_push_checks` — линт, типы и спеки по задетому, затем отдельно линтер стилей: линтер кода файлы стилей не читает вовсе. Зовёт набор `.claude/hooks/git-guard-push-tests.sh`.
- **The build is in the set on a par with lint and unit tests.** — `.claude/rt-kit/project.sh:rt_push_checks` — сборка стоит в том же наборе: ошибка типов в непокрытом коде до неё не краснеет нигде.
- **The gate set calls the package default instead of listing it line by line.** — `.claude/rt-kit/project.sh:rt_push_checks` — своя функция профиля зовёт `rt_push_checks_default` и дописывает к нему проверки дерева; отсеянное называется поимённо в ней же.
- **The final set before a push is read from the state review, not assembled in the head.** — `projects/agent-kit/src/lib/push-gate.ts:pushGateLines` — раздел печатает `pnpm exec agent-kit doctor`. В этом дереве под заголовком «умолчание печатало, а в наборе нет» стоят три строки — это замены своими вариантами тех же проверок, а не снятие охраны.
- **The push gate set is never narrower than the pipeline set.** — `tools/check-push-gate.mjs:pipelineSteps` против `pushGate` в `.claude/rt-kit/checks.json`; сама проверка стоит строкой в `rt_push_checks`. Сколько шагов конвейера чем закрыто, печатает она же при каждом прогоне — числа здесь не переписываются.
- **An exclusion reason naming a task is judged on whether that task is alive.** — `tools/check-push-gate.mjs:taskNumbers` — номер вынимается по ключу задач из `.claude/rt-kit/checks.json`, а живость спрашивается у `tools/board.mjs:taskState`; нет сети или доступа — опрос кончается молча.
- **The layout audit stands in the push gate set on a par with lint and the build.** — `.claude/rt-kit/project.sh:rt_push_checks` — первой строкой набора стоит `pnpm run agent-kit:check`: пакет правил лежит в этом же дереве, поэтому сверка сперва пересобирает его и только потом читает собранное. Умолчание пакета печатает свою форму — `projects/agent-kit/assets/defaults/project.sh:rt_push_checks_default`.
- **After merging main in, the check set is revised by what the branch now carries.** — Не проверяется ничем: гард видит набор, но не знает, что именно принесло вливание. Держится чеклистом перед публикацией PR.
- **The main branch is taken by the remote ref — in words and in actions.** — `.claude/hooks/git-guard-push-tests.sh:main_branch` — база берётся у удалённой ссылки, а не у локальной вершины. Само утверждение владельцу этим не стережётся: сетевой вызов в разборе команды падал бы вместе со связью. Шаги закрытия захода — подтягивание главной, счёт влитого и невлитого — ссылку берут ту же, и не стережёт их ничто: команда читается заходом, а не проверкой
- **A code edit is handed to a person by an open PR, not by a pushed branch.** — Не проверяется ничем: гард поставки судит открытие PR, но не его отсутствие — работы, которая кончилась пушем и не дошла до PR, он не видит вовсе. Держится этой статьёй и записью памяти о поставке.
- **What is not ready to merge opens as a draft — `gh pr create --draft`.** — Не проверяется ничем: гард видит вызов `gh pr create` и его ключи, но не знает, закрыты ли этапы замысла. Держится статьёй и паттерном `git-workflow-commit`.
- **The PR body is written in the turn the PR opens, and next to the sample.** — **Не проверяется ничем.** Тело живёт в файле, который исчезает после вызова, и ни одна сверка его не читает. Сверка очереди находит только последствие — заявку без строки связи с задачей.
- **The draft is lifted by a separate call — `gh pr ready <номер>`.** — Сам вызов гардом не требуется: полноту работы машине не видно, и признак здесь — второе сообщение владельцу из паттерна `task-flow-close`. Судится он в другую сторону — `.claude/hooks/git-guard-delivery-draft.sh:pull_ref` отбивает снятие черновика у PR без разбора.
- **The PR merge is pressed by a person, not by the work's executor.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_folder_in_branch` — на вызове `gh pr merge` гард судит папку задачи; сам запрет проверкой не закрыт и не будет: владелец сливает кнопкой в браузере, где хуков нет вовсе.
- **The identity of the call opening a PR is guarded by the delivery guard, not by the executor's memory.** — `.claude/hooks/git-guard-delivery.sh:pull_token_var` — подстановка `GH_TOKEN` ищется в тексте команды открытия заявки; автор заявки спрашивается у `tools/board.mjs:pullState` на снятии черновика и сверяется с `RT_TASK_BOT`. Обе строки объявлены профилем дерева.
- **The PR author cannot be its reviewer.** — `tools/board.mjs:pullState` — из ревьюверов PR вычёркивается его автор, и запрос разбора на самого себя разбором не считается. Спрашивается это на снятии черновика; в прочих точках держится статьёй и разделом о машинной записи ниже.
- **The host client call goes from the tree, and a command chain does not check the outcome.** — **Не проверяется ничем.** Каталог, из которого позван клиент, гардам не виден: они читают текст команды, а не рабочий каталог вызова. Держится чтением тела заявки обратно тем же ходом
- **PR labels, assignee and reviewer are set by `gh api` calls, not by `gh pr edit`:** — Не проверяется ничем: гард судит вызов открытия PR, а не то, чем потом правят его поля. Держится статьёй — на репозитории со старой бордой `gh pr edit` до правки не доходит вовсе.
- **The board is edited by a GraphQL query by the board id, not by the owner's name.** — `.claude/skills/git-workflow/scripts/board.sh:resolve_project` — идентификатор берётся у самой борды, а не собирается из имени владельца.
- **The machine commit's email is copied from the companion, not typed from memory.** — `.claude/rt-kit/project.sh:RT_COMMIT_EMAIL` — та же строка, что в разделе о подписи ниже; `.claude/hooks/git-guard-delivery.sh` отбивает пуш, если коммит вклада ветки назвался машинной записью с другим адресом.
- **The identity of the machine account is confirmed by the host's answer, not by recognising a string:** — Не проверяется ничем: гард сверяет строку со строкой и о хостинге не спрашивает вовсе — сетевой вызов падал бы вместе со связью. Держится командой из раздела о подписи ниже, при заведении записи и при смене её адреса.
- **Guard scenarios set the git settings themselves, not take them from the machine.** — `projects/agent-kit/tests/git-guards.test.sh:gpgsign` — автор, почта и подпись передаются флагами `-c` прямо в команду, а не наследуются от общего конфига машины.
- **Every commit of the branch's contribution is signed by the machine account, and the push set checks it.** — `.claude/rt-kit/project.sh:RT_HUMAN_EMAILS` — почты людей этого дерева; коммит под записью вне списка отбивает `.claude/hooks/git-guard-delivery-signature.sh:rt_delivery_signature`
- **Every commit of the branch's contribution is signed by the machine account, and the push set checks it.** — **Не проверяется здесь.** Гейт пуша дерева судит подпись каждого коммита вклада; пакетный гард поставки смотрит только коммит, назвавшийся машинной записью
- **The PR state is reread from the host right after publishing.** — **Не проверяется ничем.** Код возврата у молча пропущенного запроса тот же, что у сделанного; держится паттерном заявки
- **The author of an open PR and whether it has a reviewer are audited by the work queue.** — **Не проверяется здесь.** `tools/check-board.mjs` спрашивает у хостинга колонку, прогон и сливаемость открытых заявок, а автора и ревьювера пока не судит — это названо отдельной работой
- **The host client's active account is chosen per machine, not per tree; the machine account is substituted per call, never made active.** — **Не проверяется ничем.** Вход в клиент меняет состояние машины, а гарды судят вызовы дерева. Держится статьёй; активная запись спрашивается `gh auth status`.
- **Reviewers are asked by a REST call, not by the client's selection.** — **Не проверяется ничем.** Выборка клиента собирается запросом GraphQL и падает под токеном машинной записи целиком; выбор способа держится этой статьёй
- **A wave of branches off one main is checked by a trial merge, not one by one:** — **Не проверяется ничем.** Проверка судит одну ветку, а столкновение живёт между ветками, и до слияния его не видит ничто. Держится паттерном `git-workflow-stack`.

## Что ещё стоит знать при чтении кода

- Слияние PR — только обычным слиянием: сжатое слияние в репозитории выключено.
- **`lint-staged` переформатирует файлы прямо в коммите.** Замена по шаблону, написанная под
  однострочный биндинг, после первого коммита промахивается: форматтер уже разложил его на
  несколько строк, и следующая такая же правка срабатывает не везде. Массовая правка шаблонов
  либо идёт до первого коммита целиком, либо повторяется по факту — а не считается сделанной по
  числу совпадений.
- Файлы к коммиту добавляются явными путями. Сторонние инструменты добавляют в индекс сами,
  поэтому перед каждым коммитом читается, что в индексе на самом деле.
- Голый вызов `git` или `gh` на этой машине может уйти в оболочку выбора учётной записи;
  надёжный вызов — с приставкой `command`.
- **`gh` залогинен учётной записью владельца, и сам по себе от машинной не работает.** Всё, что
  должно идти от неё — заведение задачи, открытие PR, перевод колонки, — зовётся с токеном
  в окружении вызова:

    ```bash
    GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) command gh pr create …
    ```

    `gh auth login` под машинной учётной записью не делается: он затрёт вход владельца в
    `hosts.yml`. Токен читается в окружение вызова и не печатается.

- **Прежняя машинная запись была ограничена хостингом, и работа переехала на новую.**
  `rt-tools-agent` с 14 августа 2026 года отвечала «не найдено» всем, кроме себя: задачи и PR,
  заведённые её токеном, для владельца и для сверок не существовали, и задачи приходилось
  заводить записью владельца. С 18 августа работа идёт от `rt-tools-dev` — её профиль виден
  всем, она стоит исполнителем задач, и обход с чужим исполнителем снят. Проверяется тем же
  вызовом: `gh api users/rt-tools-dev` отвечает профилем, а не «не найдено».

- **PR открывает машинная запись, а не запись владельца.** Свой PR исполнитель открывает сам:
  у заявки, открытой владельцем, ревьювера не бывает вовсе — автор не может быть ревьювером, а
  разбор требует гард снятия черновика. Открывается заявка токеном машинной записи:

    ```bash
    GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) command gh pr create --draft --base main \
        --head <ветка> --title '<заголовок>' --body-file <файл>
    ```

    Исполнитель ставится ей же, ревьювером — владелец; оба вызова `gh api` идут тем же токеном.
    Заявка, открытая не той записью, чинится только переоткрытием: автора у неё не сменить.

- **Невидимость PR машинной записью была свойством прежней записи, а не машинной работы
  вообще.** `rt-tools-agent` открывала заявку успешно, а владельцу хостинг отвечал «не найдено»
  и на неё, и на профиль самой записи — так один PR был открыт, не увиден и закрыт вручную. С
  переездом на `rt-tools-dev` 18 августа 2026 года ограничение снято: заявка #1008, открытая ею,
  видна владельцу и в списке, и по номеру. Утверждение о видимости не запоминается, а
  спрашивается — вызовами от владельца, без токена:

    ```bash
    /opt/homebrew/bin/gh pr list --json number,author     # заявка машинной записи стоит в списке
    /opt/homebrew/bin/gh pr view <номер> --json author    # отвечает автором, а не отказом
    ```

    `gh pr create --draft` работает у обеих записей: черновик — свойство заявки, а не учётной
    записи.

- **Очередь работ этой записью не правится вовсе, и токен для неё дерево больше не называет.**
  Квота на язык запросов у машинной записи не исчерпана, а равна нулю, — борда же живёт только
  там. Отвечает хостинг текстом про исчерпанный предел, и он читается как временный, хотя
  проходящим не считается:

    ```bash
    GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) command gh api rate_limit --jq '.resources.graphql'
    ```

    Поэтому ключа `board.tokenPath` в `.claude/rt-kit/checks.json` больше нет: сверка очереди,
    перевод колонки и заведение задачи идут учётной записью, под которой залогинен `gh`, то есть
    владельцем. Вернётся запись — ключ называется снова, и обвязка возьмёт её без правок.
    Подписи коммита это не касается: она читается на машине, из `RT_COMMIT_EMAIL`, и сети не
    спрашивает.

- **Пуш идёт тем же токеном, а не тем, что отдаёт связка ключей.** Помощник `osxkeychain`
  отвечает учётной записью от чужого дерева, и пуш падает на `403` с именем, которого здесь
  быть не должно. Адрес удалённого репозитория токеном не переписывается — он лёг бы открытым
  текстом в `.git/config`:

    ```bash
    git -c credential.helper= \
        -c credential.helper='!f() { echo username=x-access-token; echo "password=$(cat ~/.config/rt-tools-bot-token)"; }; f' \
        push -u origin <ветка>
    ```

- **Подпись коммита задаётся переменными самой команды**, а не `git config user.*`: конфиг общий
  и переписал бы подпись владельцу. Подписи в дереве нет — `commit.gpgsign` включён, а ключ
  лежит за менеджером паролей, поэтому машинный коммит идёт с `-c commit.gpgsign=false`:

    ```bash
    GIT_AUTHOR_NAME="rt-tools-dev" GIT_AUTHOR_EMAIL="317887029+rt-tools-dev@users.noreply.github.com" \
    GIT_COMMITTER_NAME="rt-tools-dev" GIT_COMMITTER_EMAIL="317887029+rt-tools-dev@users.noreply.github.com" \
        git -c commit.gpgsign=false commit -F -
    ```

    **Почта копируется отсюда, а не набирается по памяти.** Хостинг сопоставляет служебный адрес
    по числу в нём, логин рядом не сверяет никто, и коммит с чужим числом уезжает подписанным
    посторонним человеком — изнутри промах не виден вовсе. Так одиннадцать коммитов ушло в
    главную ветку, и чинилось это переписыванием истории. Ту же строку держит профиль дерева
    ключом `RT_COMMIT_EMAIL`, и гард поставки отбивает пуш при расхождении.

    **Личность записи подтверждается ответом хостинга, а не тем, что строка выглядит знакомой** —
    промах выглядел знакомо. Спрашивается токеном самой записи, и логин с числом приходят одним
    ответом:

    ```bash
    GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) gh api user --jq '.login, .id'   # rt-tools-dev, 317887029
    ```

    Ответ о себе годится всегда, а поиск по числу — только для незаблокированной записи: у
    прежней `gh api user/314674161` отвечал «не найдено» любым токеном, включая её собственный.
    Поэтому число сверяется ответом о себе, а не поиском по номеру.

- Журнал изменений при выпуске собирается из заголовков коммитов: выпущенные разделы не
  переписываются, дописывается только неизданный. Едет он отдельным коммитом после пуша ветки.
- **Карточки PR заводит встроенное правило борды «Auto-add to project», и выключается оно
  только в интерфейсе.** Через API правила проекта не правятся вовсе — ни `gh project`, ни
  GraphQL их не меняют, — поэтому накопившееся снимается вызовом, а источник закрывает человек.
  Что стоит на борде сейчас:

    ```bash
    /opt/homebrew/bin/gh api graphql -f query='{ node(id: "<идентификатор борды>") {
        ... on ProjectV2 { workflows(first: 20) { nodes { name enabled } } } } }'
    ```

    Накопившиеся карточки снимаются по одной, идентификатор элемента берётся у самой борды:

    ```bash
    /opt/homebrew/bin/gh api graphql -f query='mutation { deleteProjectV2Item(input:
        {projectId: "<борда>", itemId: "<элемент>"}) { deletedItemId } }'
    ```

    Десять таких карточек висели с апреля; после снятия `npm run check:board` по этой строке
    молчит.

- Планы работ живут в репозитории — `docs/plans/<тема>.md` рядом с `docs/adr/`, и едут тем же
  коммитом, что и работа, которую описывают.

## Чем это проверяется

- Гарды сами: `git-guard-main.sh` на коммите, `git-guard-delivery.sh` на заведении ветки и
  открытии PR, `git-guard-push-tests.sh` на пуше.
- От кого пойдёт вызов — до вызова, а не по автору уже открытого PR:

    ```bash
    GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) command gh api user -q '.login'   # rt-tools-dev
    ```

- `pnpm run check:affected` — то же, что гоняет гард пуша, только руками.
- `scripts/board.sh list` — сверка колонок с открытыми PR.
