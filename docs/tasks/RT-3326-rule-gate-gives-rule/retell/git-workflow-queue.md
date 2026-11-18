# git-workflow-queue — the retelling

Under each round stand its cases, given to a reader who saw only the hot part together with the branch part `git-workflow`, as the gate gives them when a task is created, and then the
reply of `goal-critic` verbatim.

## Round 1 — the hot part of 1845 characters

**Cases.**

Case 1. You create a task with the creation command. Its output says «created RT-41». You start the branch right away. The task key in the tree settings is not set, and the board call later returns an error you do not recognise; you plan to create the card through the web page instead. What do you do?

Case 2. You start working on a task that stands in the first column of the board. Two other tasks turn out to be fixed by the same edit as yours. What do you do with the columns and with the three tasks?

Case 3. You return to work after a day. You have four open PRs of your own; one of them shows a conflict, and one conflicting PR belongs to a neighbouring session. You plan to check only the branch you have checked out. What do you do?

Case 4. You want to put the PR itself on the board as a card, so the owner sees it. The epic card still stands in the first column although its first task is in progress. What do you do?

**The critic.**

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

## Round 2 — the hot part of 2388 characters

**Cases.**

Case 1. You create a task with the creation command. Its output says «created RT-41». You start the branch right away. The task key in the tree settings is not set, and the board call later returns an error you do not recognise; you plan to create the card through the web page instead. What do you do?

Case 2. You start working on a task that stands in the first column of the board. Two other tasks turn out to be fixed by the same edit as yours. What do you do with the columns and with the three tasks?

Case 3. You return to work after a day. You have four open PRs of your own; one of them shows a conflict, and one conflicting PR belongs to a neighbouring session. You plan to check only the branch you have checked out. What do you do?

Case 4. You want to put the PR itself on the board as a card, so the owner sees it. The epic card still stands in the first column although its first task is in progress. What do you do?

**The critic.**

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
