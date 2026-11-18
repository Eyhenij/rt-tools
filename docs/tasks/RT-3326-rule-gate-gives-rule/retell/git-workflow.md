# git-workflow — the retelling

Under each round stand its cases, given to a reader who saw only the hot part — the branch part, read with the part `git-workflow-push` by one reader and with `git-workflow-queue` by another, and then the
reply of `goal-critic` verbatim.

## Round 1 — the hot part of 2721 characters

**Cases — with `git-workflow-push`.**

Case 1. Your task branch was taken from the epic branch. A neighbouring task merged into the epic branch an hour ago and touched the same files. You want to bring it in by `git rebase origin/<epic>` and then force-push. Also your last commit holds a typo in a file, and you plan to fix it by one more commit "fix typo". What do you do?

Case 2. You are about to push. You ran `npm run lint` for one project and the unit tests, but not the build. The push guard does not fire in this terminal (you are pushing from a script). You also want to skip the layout audit because "it is slow". What do you do before the push?

Case 3. A teammate asks you to review their branch. You read the diff and plan to approve it by eye. Separately, you just merged the epic branch into yours, and it brought new files from another package. What changes in your checks?

Case 4. You created a branch named `fix-login` (no task number) and committed to it. You then open a second working copy to try something, run the commit from there, and to free space for a tool you plan to `git stash` your working tree. What do you do with each?

**The critic — with `git-workflow-push`.**

**Цель выполнена частично: обе горячие части укладываются в 3000 знаков, но смысл потерян в двух случаях из четырёх (3 и 4).**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -m`: `git-workflow/SKILL.md` — 2721, `git-workflow-push/SKILL.md` — 1752. Раньше был один горячий текст на 24212 знаков | да |
| «убедись что смысл при этом не теряется» | В случаях 1 и 2 читатель новых частей решает так же, как читатель прежнего текста. В случаях 3 и 4 он делает другое: исчезли сами действия, а не только пояснения. Исчезнувшие фразы теперь лежат только в холодной части `pitfalls-2.md`, а проверка при коммите и отправке её не выдаёт | нет |

## Решения по случаям

**Случай 1 (rebase эпика, force push, коммит «fix typo»). Потери нет.** Читатель прежнего текста делает то же: вливает эпик merge'ем и отказывается от rebase, force push и исправляющего коммита. Если коммит ещё не на сервере — `--soft`, а не `--hard`. Пробел «опечатка уже отправлена» был и в прежнем тексте.
- Пропала одна фраза, но в этом случае на действие она не влияет: «Before its PR opens a branch takes its base in; with the PR open — only on a conflict.» (`gw-former.md:109-110`). В случае не сказано, открыт ли PR, а соседняя задача трогала те же файлы, поэтому конфликт вероятен и решение не меняется. В других случаях потеря возможна: при открытом PR и без конфликта новый читатель вольёт базу, а прежний не стал бы. В горячих частях этой фразы нет, она есть только в `pitfalls-2.md:109`.

**Случай 2 (отправка из скрипта, неполный набор, пропуск аудита раскладки). Потери нет.** Оба читателя отправляют по пути, где стоит проверка, запускают все линтеры, сборку и аудит раскладки и не пропускают аудит как «медленный». Новый читатель видит противоречие между «только по пути проверки» и «где ничего не срабатывает — набор целиком». Прежний текст снимает его фразой «unless the tree wired the git hook `pre-push`» (`gw-former.md:136-137`), но решение от этого не меняется.
- Пробел «где читать итоговый набор»: прежний текст называет раздел — «The "set before push" section prints it whole» (`gw-former.md:193-194`). В горячих частях его нет. Действие то же: читать набор из обзора состояния, а не собирать по памяти.

**Случай 3 (ревью чужой ветки и пересмотр набора после слияния). Потеря есть.** Прежний читатель запускает набор на вершине чужой ветки, а кроме того отдельно гоняет проверку формулировок по изменённым текстам. Вывод он кладёт в ревью, а при следующей отправке в эту ветку прогоняет набор снова. Новый читатель запускает только набор на вершине: проверку формулировок не запускает, вывод в ревью не кладёт. Фраза «approve only if it passes» — его собственное добавление, этого нет ни в одном тексте. Пересмотр набора после слияния оба делают одинаково.
- Прежняя фраза (`gw-former.md:140-142`): «A check that stands only on an edit, such as the wording one, is run over the changed texts apart. The output goes into the review, and a later push into that branch is run again.»
- grep по `changed texts apart`, `output goes into the review`, `run again` в двух SKILL.md ничего не находит. Есть только в `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow/pitfalls-2.md:140-141`.
- Короткий хвост к пункту в `git-workflow-push/SKILL.md` (около 110 знаков, запас 1248): «**A review of a foreign branch starts with the gate set run on its tip.** The wording check runs apart over the changed texts; the output goes into the review.»

**Случай 4 (ветка без номера, вторая копия, stash). Потеря есть, в части про stash.** Ветка без номера и вторая копия решаются так же. Но прежний текст даёт замену stash: «The comparison goes on a second copy» — инструмент запускается во второй копии. Новый читатель такого хода не знает и пишет «find space another way», это неопределённое действие.
- Прежняя фраза (`gw-former.md:272-273`): «The comparison goes on a second copy: stashing takes uncommitted work where neither the tree state nor the audit sees it.»
- grep по `comparison goes on a second copy` в двух SKILL.md ничего не находит. Есть только в `pitfalls-2.md:271`.
- Короткий хвост в `git-workflow/SKILL.md` (около 35 знаков, запас 279): «**The working tree is not emptied for a tool run** — the tool runs on a second copy.»

## Что сужено, выброшено, добавлено

- **Сужено:** условие «with the PR open — only on a conflict» и название раздела «set before push» ушли в холодную часть. В случаях 1 и 2 действие от этого не меняется.
- **Выброшено из горячего:** отдельный прогон проверки формулировок при ревью чужой ветки, вывод в ревью и повторный прогон (случай 3); вторая копия как замена stash (случай 4).
- **Добавлено:** ничего, чего владелец не просил.

## Кратчайший шаг на каждый промах

1. Случай 3 — дописать хвост выше к пункту о ревью чужой ветки в `git-workflow-push` (сейчас 1752 знака, станет около 1860).
2. Случай 4 — дописать хвост выше к пункту о рабочем дереве в `git-workflow` (сейчас 2721, станет около 2760).
3. Затем ещё раз дать случаи 3 и 4 читателю, который видит только две горячие части.

## Источники и гипотезы

- `wc -m`: 2721 `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow/SKILL.md`, 1752 `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow-push/SKILL.md`.
- Прежний текст: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gw-former.md`, строки 109-110, 136-137, 140-142, 193-194, 272-273.
- Решения нового читателя: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gwA1.txt`.
- Где сейчас лежат исчезнувшие фразы: `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow/pitfalls-2.md:78,109,140-144,190-193,271`.
- Гипотеза: проверка при коммите и отправке выдаёт только эти две горячие части, а `pitfalls-2.md` не выдаёт. Это сказано в поручении, но я не проверял. Как проверить: найти `git-workflow-push` в `/Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/defaults/gate-map.sh` и в `.claude/hooks/skill-gate.sh`.

**Cases — with `git-workflow-queue`.**

Case 1. You create a task with the creation command. Its output says «created RT-41». You start the branch right away. The task key in the tree settings is not set, and the board call later returns an error you do not recognise; you plan to create the card through the web page instead. What do you do?

Case 2. You start working on a task that stands in the first column of the board. Two other tasks turn out to be fixed by the same edit as yours. What do you do with the columns and with the three tasks?

Case 3. You return to work after a day. You have four open PRs of your own; one of them shows a conflict, and one conflicting PR belongs to a neighbouring session. You plan to check only the branch you have checked out. What do you do?

Case 4. You want to put the PR itself on the board as a card, so the owner sees it. The epic card still stands in the first column although its first task is in progress. What do you do?

**The critic — with `git-workflow-queue`.**

**Цель выполнена частично: по размеру всё сходится, но смысл потерян в случаях 2, 3 и 4. Новый читатель в них поступает не так, как читатель прежнего текста.**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -m`: `git-workflow/SKILL.md` — 2721, `git-workflow-queue/SKILL.md` — 1845. Соседние части тоже в пределе: `-hosting` — 2860, `-push` — 1752. Прежний цельный текст был 24212 | да |
| «убедись что смысл при этом не теряется» | Суждено по четырём случаям из `gw-casesB.md` против ответов `gwB1.txt`. Случай 1 совпал. В случаях 2, 3 и 4 действия расходятся: из горячих частей ушли пояснения после заголовков | нет |

## Что сужено, что выпало, что добавлено
- **Сужено.** Каждая статья в `git-workflow-queue/SKILL.md` сведена к одному заголовку. Пояснение за ним — как именно действовать — ушло в `pitfalls-2.md` и `implementation.md`. Ворота их не выдают: при создании задачи приходят только два SKILL.md (`gate-map.sh:201-202`).
- **Выпало.** Статья «One's own conflicting PR is fixed by the turn's first action…» перенесена в `git-workflow-hosting/SKILL.md:18`. При создании задачи и правке доски эта часть не приходит.
- **Добавлено.** Ничего сверх просьбы.

## Потери по случаям

**Случай 1 (ключ не задан, «created RT-41», ошибка доски) — потери нет.**
Оба читателя делают одно и то же:
- прекращают работу с очередью;
- не верят выводу команды;
- читают ошибку до обхода.

Новый читатель отметил пробел: «read before bypass» как будто разрешает обход после чтения. Прежний текст оставлял его так же открытым («It can be an early sign of a write limit…»), так что это не потеря.

**Случай 2 (три задачи на одну правку) — потеря.**
1. Прежний текст: «The second is erased with its number, and the missing is added to the first: after the merge the branch went in whole.» По нему лишние задачи удаляются вместе с номером, а недостающее дописывается в первую. Новый читатель не знает, какая задача остаётся и что делать с остальными: «closed as duplicates, or linked». Grep `erased with its number` по двум SKILL.md — 0 совпадений; фраза есть только в `git-workflow/pitfalls-2.md` и `git-workflow-commit/pitfalls.md`.
2. Прежний текст: «Branch created — the task is in progress, PR opened — awaiting review; the move command does it, not GraphQL calls from memory.» Новый читатель двигает колонку GraphQL-запросом («The board edit itself goes by a GraphQL query by the board id»). Прежний текст это прямо запрещал. Grep `move command does it`, `Branch created`, `task:move` по двум SKILL.md — 0.

**Случай 3 (четыре своих PR, один в конфликте, один конфликтный чужой) — потеря.**
1. Прежний текст: «One's own conflicting PR is fixed by the turn's first action, and no new work is taken before that. Work here means creating a task or a branch, moving the column and opening a PR.» Новый читатель «handle the conflict», но порядок не знает: создать задачу или ветку до исправления конфликта он не откажется. Grep `turn's first action` по двум SKILL.md — 0; фраза есть только в `git-workflow-hosting/SKILL.md:18`.
2. Прежний текст: «One's own branch is the one this working copy led; a neighbour's PR is named to the owner, and work is taken as usual.» Новый читатель не знает, как отличить свой PR от чужого и надо ли кому-то сообщить; в итоге владельцу ничего не скажет. Grep `this working copy led` и `named to the owner` по двум SKILL.md — 0.
3. Прежний текст: «Two signs — a green run on the tip and a folder taken apart.» Новый читатель «judge my drafts all at once», но по каким признакам — не знает. Grep `green run on the tip` по двум SKILL.md — 0.

**Случай 4 (PR как карточка на доске, карточка эпика в первой колонке) — потеря частичная.**
- Отказ ставить PR на доску совпал.
- Расходится движение карточки эпика. Прежний текст: «First task taken — the epic is in progress; the PR of the epic into `main` opens — the epic awaits review. `npm run task:move -- <номер эпика> in-progress`.» Новый читатель сам пишет, что первый момент он угадал («my reading»). Второй момент — открытие PR эпика в `main` — он не знает и на нём карточку не сдвинет. Кроме того, он снова смешивает команду переноса с GraphQL. Grep `task:move` и `first task` по двум SKILL.md — 0.

## Кратчайшие шаги (хвосты в `git-workflow-queue`, сейчас 1845 знаков, все шесть — около +600)
1. После «Tasks fixed by one edit are merged before the merge.» дописать: «The second is erased with its number; what it lacks goes into the first.»
2. После «The task column moves in the same motion as the work.» дописать: «Branch created — in progress, PR opened — in review; by the move command, not GraphQL from memory.»
3. После «The epic card moves … at two moments.» дописать: «First task taken — in progress; the epic's PR into main opens — in review.»
4. Добавить в `git-workflow-queue` статью «One's own conflicting PR is fixed by the turn's first action; no new work is taken before that.»
5. После «A conflicting PR of a neighbouring session is not one's own.» дописать: «One's own — led by this working copy; a neighbour's is named to the owner.»
6. После «One's own drafts are judged all at once…» дописать: «Signs: a green run on the tip and a folder taken apart.»

После правки снова проверить `wc -m` (должно быть ≤ 3000) и повторить те же четыре случая со свежим читателем.

## Источники
- Горячие части:
  - `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow/SKILL.md`
  - `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow-queue/SKILL.md`
- Прежний текст: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gw-former.md`. Нужные строки:
  - про слияние задач — «Tasks fixed by one edit are merged…»;
  - про колонку и команду переноса — «The task column moves…»;
  - про два момента эпика — «The epic card moves…»;
  - про свой и чужой конфликтный PR — «One's own conflicting PR…» и «A conflicting PR of a neighbouring session…».
- Случаи и решения:
  - `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gw-casesB.md`
  - `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gwB1.txt`
- Что выдают ворота: `/Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/defaults/gate-map.sh:193-205`.
- Куда ушли пояснения:
  - `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow/pitfalls-2.md`
  - `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow-queue/implementation.md`
  - `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow-hosting/SKILL.md:18`

**Гипотеза:** ворота не подкладывают `implementation.md` и `pitfalls-2.md` к SKILL.md. Если подкладывают, часть потерь закрыта. Проверка: создать задачу в сессии и посмотреть, какие файлы пришли в контекст.

Verdict (round 1): diverged

## Round 2 — the hot part of 2823 characters

**Cases — with `git-workflow-push`.**

Case 1. Your task branch was taken from the epic branch. A neighbouring task merged into the epic branch an hour ago and touched the same files. You want to bring it in by `git rebase origin/<epic>` and then force-push. Also your last commit holds a typo in a file, and you plan to fix it by one more commit "fix typo". What do you do?

Case 2. You are about to push. You ran `npm run lint` for one project and the unit tests, but not the build. The push guard does not fire in this terminal (you are pushing from a script). You also want to skip the layout audit because "it is slow". What do you do before the push?

Case 3. A teammate asks you to review their branch. You read the diff and plan to approve it by eye. Separately, you just merged the epic branch into yours, and it brought new files from another package. What changes in your checks?

Case 4. You created a branch named `fix-login` (no task number) and committed to it. You then open a second working copy to try something, run the commit from there, and to free space for a tool you plan to `git stash` your working tree. What do you do with each?

**The critic — with `git-workflow-push`.**

**Цель достигнута: все четыре горячие части укладываются в 3000 знаков, и во втором круге ни в одном из четырёх случаев новый читатель не решает иначе, чем читатель прежнего текста.**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -m`: `git-workflow/SKILL.md` — 2823, `git-workflow-push/SKILL.md` — 1838, `git-workflow-queue/SKILL.md` — 2388, `git-workflow-hosting/SKILL.md` — 2904. Прежний единый горячий текст был 24212 знаков (`gw-former.md`) | да |
| «убедись что смысл при этом не теряется» | При коммите и отправке проверка выдаёт `git-workflow` вместе с `git-workflow-push` (`.claude/rt-kit/defaults/gate-map.sh:204-205`). По этим двум частям новый читатель (`gwA2.txt`) в случаях 1–4 делает и запрещает то же, что сделал бы и запретил читатель прежнего текста. Обе потери первого круга закрыты хвостами. Пробелы, которые остались, были и в прежнем тексте | да |

## Решения по случаям

**Случай 1: rebase эпика, force push, коммит «fix typo». Потери нет.**
- Оба читателя вливают эпик merge'ем. Оба отказываются от rebase, force push и исправляющего коммита, а неотправленный коммит снимают через `--soft`, не через `--hard`.
- Прежний текст говорит «rewriting history hides the trace, not the cause» (`gw-former.md:247`). Но он же прямо разрешает «that is `--soft`» (`gw-former.md:105`), так что прежний читатель тоже снимает коммит через `--soft`.
- Фразы «Before its PR opens a branch takes its base in; with the PR open — only on a conflict» в горячих частях нет, она есть только в `pitfalls-2.md:109`. Здесь она на действие не влияет: соседняя задача трогала те же файлы, конфликт есть, и база вливается при любом прочтении.
- Пробел «опечатка уже отправлена» был и в прежнем тексте.

**Случай 2: отправка из скрипта, неполный набор, пропуск аудита раскладки. Потери нет.**
- Оба читателя запускают все линтеры, сборку и аудит раскладки. Оба отказываются пропустить аудит и берут набор из обзора состояния.
- Хвоста «unless the tree wired the git hook `pre-push`: then git runs the set there too» (`gw-former.md:136-137`) в горячих частях нет, он есть только в `pitfalls-2.md:136`. Хук в этом дереве подключён: `.husky/pre-push` → `bash .claude/hooks/pre-push.sh`. Поэтому прежний читатель мог бы считать отправку из скрипта допустимой. Новый от неё отказывается и отправляет по пути, где стоит проверка. Его действие допустимо и по прежнему тексту, ничего запрещённого он не делает, так что потерей я это не считаю.
- Противоречие, которое видит новый читатель, отчасти снимает уже горячая фраза «nor the git hook fires».

**Случай 3: ревью чужой ветки и пересмотр набора после слияния. Потеря первого круга закрыта.**
- Теперь в горячей части есть: «The wording check runs apart over the changed texts; the output goes into the review.» (`git-workflow-push/SKILL.md:16`). Новый читатель отдельно запускает проверку формулировок и кладёт вывод в ревью, как и прежний.
- Хвоста «a later push into that branch is run again» в горячих частях нет, он есть только в `pitfalls-2.md:141`. В этом случае отправки в чужую ветку нет, поэтому на решение он не влияет.
- Пробел «в какой копии гонять набор чужой ветки» прежний текст тоже не закрывал.

**Случай 4: ветка без номера, вторая копия, stash. Потеря первого круга закрыта.**
- Теперь в горячей части есть: «The tool runs on a second copy.» (`git-workflow/SKILL.md:36`). Новый читатель вместо stash запускает инструмент во второй копии, как и прежний.
- По ветке `fix-login` оба читателя решают одинаково: PR нет, условий доставки нет, работа переносится в ветку с номером. Прежний текст добавляет «The work moves to a branch with a number», и новый читатель пришёл к тому же сам.
- Коммит оба делают из копии, где стоит сессия.

## Что сужено, выброшено, добавлено

- **Ушло в холодную часть, но в случаях действие не меняет:**
  - «with the PR open — only on a conflict»;
  - оговорка о хуке `pre-push`;
  - «a later push into that branch is run again»;
  - название раздела «set before push»;
  - обоснования («rewriting history hides the trace…», «The gate runs its set where the session was started…»).
- **Добавлено:** ничего, о чём владелец не просил.

## Шаги на промахи

Промахов, которые меняют действие, нет. Если нужен запас, есть необязательный шаг на случай, которого в этом наборе нет: дописать «; a later push into that branch is run again» к пункту о ревью в `git-workflow-push` (получится около 1880 знаков).

## Источники и что ещё стоит проверить

- `wc -m` по четырём файлам в `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow*/SKILL.md` — цифры в таблице.
- grep по двум SKILL.md:
  - «changed texts» и «output goes into the review» → `git-workflow-push/SKILL.md:16`;
  - «second copy» → `git-workflow/SKILL.md:36`;
  - «run again», «only on a conflict», «pre-push», «set before push», «rewriting history» в этих двух файлах не находятся; первые три лежат в `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow/pitfalls-2.md:109,136,141`.
- Состав того, что выдаёт проверка: `/Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/defaults/gate-map.sh:204-205`.
- Хук: `/Users/eyhenij/WebstormProjects/rt-tools/.husky/pre-push`, `core.hooksPath=.husky/_`.
- Прежний текст: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gw-former.md`. Решения нового читателя: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gwA2.txt`.
- Не проверено: здесь проверены только четыре случая и только части `git-workflow` и `git-workflow-push`. Части `-queue` и `-hosting` и случаи про PR, доску и машинную учётную запись не проверялись. Как проверить: те же опросы по `gw-casesB.md` и `gw-casesC.md`.

**Cases — with `git-workflow-queue`.**

Case 1. You create a task with the creation command. Its output says «created RT-41». You start the branch right away. The task key in the tree settings is not set, and the board call later returns an error you do not recognise; you plan to create the card through the web page instead. What do you do?

Case 2. You start working on a task that stands in the first column of the board. Two other tasks turn out to be fixed by the same edit as yours. What do you do with the columns and with the three tasks?

Case 3. You return to work after a day. You have four open PRs of your own; one of them shows a conflict, and one conflicting PR belongs to a neighbouring session. You plan to check only the branch you have checked out. What do you do?

Case 4. You want to put the PR itself on the board as a card, so the owner sees it. The epic card still stands in the first column although its first task is in progress. What do you do?

**The critic — with `git-workflow-queue`.**

**Во втором круге смысл не потерян: по всем четырём случаям новый читатель поступает так же, как читатель прежнего текста. Все шесть потерь первого круга закрыты, обе горячие части меньше 3000 знаков.**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -m`: `git-workflow/SKILL.md` — 2823, `git-workflow-queue/SKILL.md` — 2388. Две другие части тоже в пределе: `-hosting` — 2904, `-push` — 1838. Прежний цельный текст был 24212 знаков | да |
| «убедись что смысл при этом не теряется» | Проверил четыре случая из `gw-casesB.md` по ответам `gwB2.txt`. В каждом случае новый читатель делает и отказывается от того же, что читатель прежнего текста. Пробелы, которые он назвал, прежний текст оставлял открытыми так же | да |

## Хвосты первого круга вернулись
grep по двум SKILL.md: каждая фраза находится по одному разу, все в `git-workflow-queue/SKILL.md`, в `git-workflow/SKILL.md` их нет.
- «erased with its number»
- «Branch created»
- «First task taken»
- «turn's first action»
- «this working copy led»
- «green run on the tip»

## Разбор по случаям

**Случай 1 (ключ не задан, «created RT-41», ошибка доски) — потери нет.**
Прежний текст (`gw-former.md:127-134`) требует трёх вещей: работу с очередью остановить на месте, задачу подтверждать ответом очереди, отказ прочитать до обхода. Новый читатель делает то же самое.
- Пробел «где задаётся ключ»: в прежнем тексте он назван только в таблице словаря (`gw-former.md:24`, `board.taskKey`). Действие от этого не меняется. Сам отказ называет ключ и файл: `projects/agent-kit/assets/checks/board.github.mjs:65` — «set it by the key `board.taskKey` in .claude/rt-kit/checks.json».
- Пробел «можно ли через веб после прочтения»: прежний текст тоже его не закрывал (`gw-former.md:133-134`).

**Случай 2 (три задачи на одну правку, задача в первой колонке) — потери нет.**
- Колонка двигается командой переноса, а не GraphQL: прежний текст — `gw-former.md:150-151`, новый — `git-workflow-queue/SKILL.md`, статья «The task column moves…».
- Вторая задача стирается вместе с номером: прежний текст — `gw-former.md:163-164`.
- Из первой колонки PR не открывается: прежний текст — `gw-former.md:156`.

Какая из трёх задач остаётся, прежний текст тоже не говорил, там тоже только «the second».

**Случай 3 (четыре своих PR, один свой конфликтный, один чужой) — потери нет.**
Новый читатель:
- перечитывает все PR сразу и знает два признака;
- свой конфликт исправляет первым действием хода;
- чужой PR называет владельцу.

Это совпадает с `gw-former.md:167-177`.

Одно место не вернулось — конец фразы «…a neighbour's PR is named to the owner, **and work is taken as usual**» (`gw-former.md:177`). grep «taken as usual» по двум SKILL.md — 0. В этом случае на действия это не влияет: свой конфликт всё равно исправляется до новой работы. Но если конфликтует только чужой PR, новый читатель может зря отложить работу; он сам назвал это пробелом. Хвост в 26 знаков: после «a neighbour's is named to the owner» дописать «, and work is taken as usual». Потерей это не считаю: в случаях такой ситуации нет.

**Случай 4 (PR карточкой на доске, эпик в первой колонке) — потери нет.**
- Отказ ставить PR на доску совпадает с `gw-former.md:161`.
- Эпик переносится в «in progress» сейчас, а в «in review» — когда откроется PR эпика в main. Это совпадает с `gw-former.md:152-153`.
- Противоречие «move command, not GraphQL» и «board is edited by a GraphQL query by the board id» читатель назвал пробелом. Оно было и в прежнем тексте: `gw-former.md:151` против `gw-former.md:254`.
- В новом тексте нет готовой команды `npm run task:move -- <номер эпика> in-progress` (`gw-former.md:154`): grep «task:move» по двум SKILL.md — 0. Решение от этого не меняется: читатель называет «the move command». Имя команды дерево показывает в других местах: `git-workflow/implementation.md:22`, `package.json:76`, подсказка команды создания задачи (`gw-former.md:281-282`).

## Сужено, выпало, добавлено
- Сужено: объяснения «почему» после заголовков, например «No default on purpose…» или «A PR card has no column…». На то, что исполнитель делает, они не влияют.
- Выпало: «and work is taken as usual» и готовая строка `task:move`; на эти случаи ни то ни другое не влияет.
- Добавлено: ничего.

## Источники
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow/SKILL.md`
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow-queue/SKILL.md`
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/defaults/gate-map.sh:198-202` — при `gh issue create|edit` и `task:new` проверка правил выдаёт обе части.
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gw-former.md:24,124-177,254,281-282`
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gw-casesB.md`
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gwB2.txt`
- `/Users/eyhenij/WebstormProjects/rt-tools/projects/agent-kit/assets/checks/board.github.mjs:65`

Гипотеза: правка доски (`gh issue edit` и GraphQL-запрос) приходит к исполнителю через ту же ветку проверки правил. Для `gh api graphql` я этого не проверял. Как проверить: найти `graphql` в `gate-map.sh` и запустить `gh api graphql …` в сессии.

Verdict: matched
