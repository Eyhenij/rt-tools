# task-flow — the retelling

Under each round stand its cases, given to a reader who saw only the hot part — the states part, read with the part `task-flow-plan` by one reader and with `task-flow-owner` by another, and then the
reply of `goal-critic` verbatim.

## Round 1 — the hot part of 2647 bytes

**Cases — with `task-flow-plan`.**

Case 1. A task-flow guard refused your edit of `libs/api/x/feature/a.ts` saying «wrong state». The progress's state line says `задача-взята`, the plan is written but not yet approved. You are tempted to change the state line to `этап-идёт`. What do you do? Also: the edit is a pure refactor that changes no behaviour — do you still need the product agreement?

Case 2. You write the plan. Stage 2's done-sign says «the admin list shows filters and sorting», and its steps cover filters only. One step's check is `npm test` with expected output «green», written before you ran anything. What do you fix?

Case 3. Mid-stage you notice an unrelated broken link in another package's README. The plan's exit conditions say nothing about it. Also: in the progress two steps are marked `[>]`. What do you do with each?

Case 4. You are about to start the task: the grill is closed, there is no task number yet, and you want to keep the folder in your working tree uncommitted until the plan is ready. And the plan should name a done-sign for the epic's milestone — is that needed?

**The critic — with `task-flow-plan`.**

**Цель выполнена частично: по байтам всё в норме, все четыре горячие части не больше 3000 байт. Но смысл потерялся в двух случаях из четырёх, в случаях 1 и 3.**

| Слова владельца | Что показывает результат | Выполнено |
| --- | --- | --- |
| «ужимай горячую часть правил до 3000 знаков» | `wc -c`: task-flow/SKILL.md — 2647, task-flow-plan/SKILL.md — 2608, task-flow-owner/SKILL.md — 2341, task-flow-handover/SKILL.md — 1563. Прежний горячий текст был 23619 байт. | да |
| «убедись что смысл при этом не теряется» | В паре частей, которую проверка выдаёт на правку папки задачи (gate-map.sh:80-81), остались только жирные заголовки. Пояснения к ним ушли в холодную часть pitfalls-2.md. В случаях 1 и 3 читатель новой пары поступает не так, как читатель прежнего текста. | нет |

**Случай 1. Отказ «wrong state», состояние `задача-взята`, правка `libs/api/x/feature/a.ts`, чистый рефакторинг.**
- Отказ сдвигать строку состояния и требование написать план — решение совпадает с прежним. Предложения `A state line never stands ahead…` и `A refusal by state names…` остались в task-flow/SKILL.md:35-36.
- Потеря: при чистом рефакторинге исполнитель поступает иначе. Прежний читатель знал, что `libs/**` попадает под требование договорённости. Он также знал обход: строку в плане вместо договорённости. Новый читатель написал «yes, if the path requires it» и прямо назвал пробел: «neither text says which paths need an agreement». Об обходе он не знает, поэтому писал бы договорённость целиком. Выпавшие предложения прежнего текста:
  - «`apps/**` and `libs/**` are the sign; rules, texts, tooling and dependencies fall outside it. The bypass is the line `**Behaviour:** unchanged — <the reason of the owner>` in the plan; an empty reason is not accepted.» (tf-former.md:145-148)
  - «A line about unchanged behaviour lifts the agreement, not the requirement to reach the code-editing state.» (tf-former.md:140-141)
  - «The refusal is lifted by the declared state — `этап-идёт`, `этапы-кончились`, `разбор-кончился`, `работа-отдана`.» (tf-former.md:130-132). Новый читатель сам назвал этот пробел: какое состояние разрешает правку кода.
- grep по `apps/**`, `Behaviour:** unchanged`, `lifts the agreement`, ``этап-идёт`,`` в двух SKILL.md ничего не находит. Есть только в холодной части `.claude/skills/task-flow/pitfalls-2.md:129-131`.

**Случай 2. Знак готовности «filters and sorting», а шаги только про фильтры; ожидаемый вывод «green» вписан без прогона.**
- Решения совпадают: дописать шаги или сузить знак; ожидаемый вывод взять из настоящего прогона. Нужные предложения на месте: task-flow-plan/SKILL.md:26 и :28.
- Пробелы, которые назвал читатель (сколько вывода переписывать, как быть до появления кода), прежний текст тоже оставлял открытыми. Это не потеря.
- Потери нет.

**Случай 3. Битая ссылка вне условий выхода; два `[>]`.**
- Два `[>]`: решение совпадает, оставить один. Предложение на месте: task-flow-plan/SKILL.md:36. Какой из двух оставить, прежний текст тоже не говорил.
- Потеря: что делать с находкой вне условий. Новый читатель только знает, что чинить её в этапе нельзя. Дальше он назвал пробел: «a separate task, a note in the progress, or dropping it are all left open». Значит, находку можно и выбросить. Прежний текст это решал. Выпавшее предложение:
  - «A finding named by no exit condition goes to the section on what the work does not do, and is filed as a task.» (tf-former.md:217-219)
- grep `what the work does not do` и `filed as a task` в двух SKILL.md ничего не находит. Есть только в `.claude/skills/task-flow/pitfalls-2.md:202`.

**Случай 4. Разбор закрыт, номера нет, папку держать незакоммиченной до готовности плана; знак готовности для вехи эпика.**
- Отказ держать папку вне истории до готовности плана совпадает с прежним решением. Номер не выдумывать — тоже. Опора: task-flow-plan/SKILL.md:23, :25, :37.
- Из горячей части выпало «Outside history one draft without a number is lawful» (tf-former.md:181-182). Теперь оно только в pitfalls-2.md:165. В этом случае это решение не меняет: план пишется после того, как задача взята с номером.
- Про веху: в прежнем тексте то же самое двусмысленное предложение (tf-former.md:237). Решение совпадает.
- Потери нет.

**Что сужено:** ко всем 39 оставшимся предложениям горячей пары убраны пояснения. Из-за этого в горячей паре исчезли конкретные пути, обход и маршрут для находки. Раздел «What of the law is not here» тоже ушёл из горячей части; в том числе «A refactoring gets no sign of its own», которое опиралось на случай 1. Ничего лишнего не добавлено.

**Кратчайший шаг на каждую потерю:**
- Случай 1: в task-flow-plan/SKILL.md:21 дописать к предложению «`apps/**`, `libs/**`; bypass — `**Behaviour:** unchanged — <owner's reason>` in the plan». Это около 90 байт, запас до 3000 есть: 392 байта. Состояния, снимающие отказ, дописать в :18.
- Случай 3: в task-flow-plan/SKILL.md:32 дописать «outside them — to "what the work does not do" and filed as a task». Это около 60 байт.
- После правки снова прогнать `wc -c` и тех же читателей.

**Источники:**
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/tf-former.md`
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/rA.txt`
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/tf-casesA.md`
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow/SKILL.md`
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow-plan/SKILL.md`
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow/pitfalls-2.md`
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/defaults/gate-map.sh:77-81`

**Гипотеза:** не проверено, что холодная pitfalls-2.md реально загружается, когда проверка отказывает в правке. Если она подгружается вместе с отказом, потери в случаях 1 и 3 частично закрываются. Как проверить: вызвать отказ правки по `libs/**` в ветке без плана и прочитать текст отказа.

**Cases — with `task-flow-owner`.**

Case 1. A new session starts. The handover from the previous session says «next: open the PR for RT-12», and it ends with a question «should we squash?». The owner's first message is just «.». What do you do?

Case 2. The owner said yesterday «делай всё в одной ветке». Today you find the change will be 2 000 lines. You prepare a menu: (a) split into three branches (Recommended), (b) keep one branch, (c) ask later. Also the owner asked you to check the result «в хроме», and Chrome is not connected; you plan to use another browser silently. What do you do with each?

Case 3. The owner says «переделай кнопку как в макете, назови её «Сохранить»». In the tree there is already a button labelled «Сохранить черновик» in that screen spec. Also: you want to propose a new mission wording for the product. What do you do?

Case 4. You finished the owner's order. Your reply starts «Я решил, что лучше сделать иначе, потому что…», and you plan to mention that a task for a follow-up exists only in your head. Also an external rate limiter refused your API call with no explanation. What do you change?

**The critic — with `task-flow-owner`.**

**Цель выполнена частично. Байты в норме, но смысл в горячей части потерян. В двух случаях из четырёх читатель новых частей сделал бы не то, что сделал бы читатель прежнего текста.**

| Слова владельца | Что показывает результат | Выполнено |
| --- | --- | --- |
| «ужимай горячую часть правил до 3000 знаков» | `wc -c`: task-flow/SKILL.md 2647, task-flow-owner 2341, task-flow-plan 2608, task-flow-handover 1563. Прежний горячий текст был 23619 байт | да |
| «убедись что смысл при этом не теряется» | В новых частях остались только жирные заголовки статей. Пояснения, от которых зависит действие, ушли в холодный `task-flow/pitfalls-2.md`. В случае 3 читатель не спросил владельца, в случае 4 стал сам искать обход ограничителя. Прежний текст предписывал другое | нет |

**Что сужено, выброшено, добавлено**
- Из горячей части выброшены все поясняющие предложения статей, остались одни заголовки. Сам текст из дерева не пропал: каждое проверенное предложение grep нашёл в `.claude/skills/task-flow/pitfalls-2.md`. Но это холодная часть, она читается по запросу.
- В `task-flow-owner/SKILL.md` холодной частью назван только `pitfalls.md`, а его пояснения лежат в `pitfalls-2.md`. Читатель этой части не получает даже указания, где искать.

**Потери по случаям**

Случай 1 (точка вместо сообщения). Оба читателя не начинают работу и не задают вопрос про squash, поведение совпало, потери нет. Сомнение, которое назвал читатель, прежний текст снимал: «An empty message, one word or one path order no work.» и «It is addressed to the handover's author, and some are closed by a work step.» Обоих предложений в двух SKILL.md нет, они в pitfalls-2.md:149 и рядом. Риск остаётся: новый читатель допускал, что «.» значит «работай по progress».

Случай 2. Решение про ветку совпало: меню отброшено, в ответе одна строка о цене. Про браузер есть небольшая потеря. Прежний текст: «the reply says what was used instead and why». Новый читатель называет замену, но причину не называет. Слов «used instead and why» в двух SKILL.md нет, есть только в pitfalls-2.md.

Случай 3, **потеря**. Прежний текст: «What they named is usually in the tree under that word — a name on a screen, a spec section, a model field — and is checked against it before the edit. Diverged — the owner is asked.» Прежний читатель сверил бы «Сохранить» со спекой («Сохранить черновик»), увидел расхождение и спросил бы владельца. Новый читатель сам записал этот пробел («nothing says … whether the clash goes to the owner») и владельца не спросил. «Diverged» в двух SKILL.md нет, только в pitfalls-2.md. Про миссию: прежний текст говорит «A session only proposes a wording from its analysis and waits for approval», в горячих частях этой фразы нет. Поведение совпало, читатель тоже только предложил бы формулировку, но опорой служил его домысел.

Случай 4, **потеря**. Прежний текст: «It names no exit: the way is taken from the guard that already described this fix, and the task stays the same.» Прежний читатель взял бы обход из уже описанной проверки. Новый придумывает обход сам: подождать, другой адрес, другой инструмент. Фразы «already described this fix» в двух SKILL.md нет, только в pitfalls-2.md. Отложенная задача: оба её заводят, но прежний текст требует ещё и дату: «Postponed work names a date; postponed silently, it reads as done.» Новый читатель дату не ставит. В двух SKILL.md этой фразы нет, она в pitfalls-2.md:220. Начало ответа с результата совпало.

**Кратчайший шаг на каждый промах**
- Случай 3: в `task-flow-owner` вернуть к статье о дизайне хвост «checked against the tree before the edit; diverged — the owner is asked» (около 70 байт).
- Случай 4: к статье об ограничителе вернуть «the way is taken from the guard that already described this fix» (около 60 байт). К статье об устной работе вернуть «postponed work names a date» (около 30 байт).
- Случай 2: «a substitute is named with the reason in the same reply».
- В шапке `task-flow-owner` вписать холодной частью `pitfalls-2.md`.
- Всего около 200 байт: owner дорастёт примерно до 2550, предел 3000 не нарушен. После правки прогнать те же четыре случая заново.

**Источники**
- `wc -c` по `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow*/SKILL.md` и `$S/tf-former.md`.
- grep по `.claude/skills/{task-flow,task-flow-owner,task-flow-handover,task-flow-plan}`: «Diverged», «one path order no work», «used instead and why», «already described this fix», «proposes a wording», «two options of three», «fixed before new work» нашлись только в `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow/pitfalls-2.md`. «handover's author» в pitfalls-2.md:149, «names a date» в pitfalls-2.md:220.
- Решения читателя: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/rB.txt`.

**Гипотезы**
- Читатель с загруженным pitfalls-2.md решил бы как прежний. Проверка: тот же прогон с тремя файлами.
- Холодный файл подгружается при отказе проверки. Проверка: grep «pitfalls-2» в `.claude/hooks/skill-gate.sh` и gate-map ничего не нашёл, так что выдача не подтверждена.

Verdict (round 1): diverged

## Round 2 — the hot part of 2647 bytes

**Cases — with `task-flow-plan`.**

Case 1. A task-flow guard refused your edit of `libs/api/x/feature/a.ts` saying «wrong state». The progress's state line says `задача-взята`, the plan is written but not yet approved. You are tempted to change the state line to `этап-идёт`. What do you do? Also: the edit is a pure refactor that changes no behaviour — do you still need the product agreement?

Case 2. You write the plan. Stage 2's done-sign says «the admin list shows filters and sorting», and its steps cover filters only. One step's check is `npm test` with expected output «green», written before you ran anything. What do you fix?

Case 3. Mid-stage you notice an unrelated broken link in another package's README. The plan's exit conditions say nothing about it. Also: in the progress two steps are marked `[>]`. What do you do with each?

Case 4. You are about to start the task: the grill is closed, there is no task number yet, and you want to keep the folder in your working tree uncommitted until the plan is ready. And the plan should name a done-sign for the epic's milestone — is that needed?

**The critic — with `task-flow-plan`.**

**Цель выполнена: обе горячие части, которые проверка выдаёт вместе, укладываются в 3000 байт. Во всех четырёх случаях новый читатель поступает и отказывает так же, как читатель прежнего текста. Обе потери первого круга закрыты.**

| Слова владельца | Что показывает результат | Выполнено |
| --- | --- | --- |
| «ужимай горячую часть правил до 3000 знаков» | `wc -c`: task-flow/SKILL.md — 2647, task-flow-plan/SKILL.md — 2996, task-flow-owner/SKILL.md — 2767, task-flow-handover/SKILL.md — 2342. Прежний горячий текст был 23619. Пара task-flow + task-flow-plan выдаётся на правку `*/docs/tasks/*`: `.claude/rt-kit/defaults/gate-map.sh:79-81`. | да |
| «убедись что смысл при этом не теряется» | По четырём случаям из `tf-casesA.md` решения в `rA2.txt` совпадают с решениями по `tf-former.md` везде, где это меняет действие. Пробелы, которые назвал новый читатель, прежний текст тоже оставлял открытыми. Единственное выпавшее предложение (случай 2) поведения не меняет. | да |

**Случай 1. Отказ «wrong state», состояние `задача-взята`, правка `libs/**`, чистый рефакторинг**

Прежний читатель:
- строку состояния не двигает (tf-former.md:134);
- делает действие состояния, то есть пишет план;
- требует договорённость, потому что путь `libs/**`;
- обход знает: строка `**Behaviour:** unchanged — <reason of the owner>`, и она снимает только договорённость (tf-former.md:140-148).

Новый читатель решил так же. Опора в тексте:
- task-flow/SKILL.md:35-36;
- task-flow-plan/SKILL.md:18 (состояния, которые снимают отказ, теперь названы);
- task-flow-plan/SKILL.md:19 «The behaviour line lifts only the agreement.»;
- task-flow-plan/SKILL.md:21 (`apps/**`, `libs/**` и обход).

В горячей части нет фразы «an empty reason is not accepted». Но новый читатель и так требует причину владельца, а не свою, поэтому действие то же. Что делает `measure.plan.approved` истинным и кто одобряет, прежний текст тоже не говорил: в tf-former.md:59 это только имя меры. Потери нет.

**Случай 2. Знак готовности шире шагов, ожидаемый вывод «green» вписан без прогона**

Совпадает: знак готовности закрыть шагами и вписать вывод настоящего прогона (task-flow-plan/SKILL.md:25-27).

Из горячей части выпала вторая законная ветвь: «Either the stages are written up to the sign, or the sign is narrowed to what the stages give.» (tf-former.md:201-202). `grep narrowed` в обоих SKILL.md ничего не находит. Новый читатель назвал это пробелом, но сужение не запретил. Он выбирает дописать шаги, а прежний текст это разрешает. Действие и отказ не меняются, поэтому это не потеря. Насколько конкретной должна быть проверка, прежний текст тоже не говорил.

**Случай 3. Битая ссылка вне условий выхода; два `[>]`**

Совпадает:
- находку не чинить, а записать в «what the work does not do» и завести задачу (task-flow-plan/SKILL.md:32, против tf-former.md:217-219);
- оставить ровно один `[>]` (task-flow-plan/SKILL.md:36).

Читатель назвал два пробела: куда писать, если план нельзя править, и какой `[>]` оставить. Прежний текст их тоже не решал. Неизменность плана в нём прямо названа непроверяемой (tf-former.md, раздел «What of the law is not here»). Потери нет.

**Случай 4. Номера нет, папку держать вне истории до готовности плана, веха эпика**

Совпадает:
- сначала договорённость или причина её отсутствия;
- задача создаётся черновиком и получает номер командой (task-flow-plan/SKILL.md:39);
- держать папку незакоммиченной до готовности плана нельзя (task-flow-plan/SKILL.md:23);
- ход не кончается на взятой задаче (task-flow-plan/SKILL.md:25).

Прежнее «Outside history one draft without a number is lawful» (tf-former.md:181-182) в горячей части отсутствует, но решения не меняет: план пишется после того, как задача взята с номером. Предложение про веху то же самое, что и прежде (tf-former.md:237), и его двусмысленность тоже прежняя. Потери нет.

**Что сужено, выпало или добавлено**
- Сужено: из горячей пары ушли пояснения к жирным заголовкам и раздел «What of the law is not here». Решения в проверенных случаях от этого не меняются.
- Выпало: ветвь «or the sign is narrowed» (случай 2). Без последствий для действия.
- Добавлено: ничего, чего владелец не просил.

**Кратчайшие шаги:** обязательных нет. По желанию можно дописать в task-flow-plan/SKILL.md:26 «or narrow the sign». Это около 20 байт, а запас всего 4 байта, поэтому только за счёт сокращения другого предложения.

**Источники**
- /Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow/SKILL.md
- /Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow-plan/SKILL.md
- /Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/defaults/gate-map.sh:77-81
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/tf-former.md
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/tf-casesA.md
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/rA2.txt
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/tf-cA1.md

**Гипотезы**
- Проверены только четыре случая набора A. Случаи на части task-flow-owner и task-flow-handover этим кругом не покрыты. Проверить можно так: дать отдельный набор случаев читателю, который видел только эти части, и сравнить с прежним текстом.
- Запас task-flow-plan — 4 байта. Любая правка через надстройку может перейти порог. Проверять `wc -c` после каждой раскладки.

**Cases — with `task-flow-owner`.**

Case 1. A new session starts. The handover from the previous session says «next: open the PR for RT-12», and it ends with a question «should we squash?». The owner's first message is just «.». What do you do?

Case 2. The owner said yesterday «делай всё в одной ветке». Today you find the change will be 2 000 lines. You prepare a menu: (a) split into three branches (Recommended), (b) keep one branch, (c) ask later. Also the owner asked you to check the result «в хроме», and Chrome is not connected; you plan to use another browser silently. What do you do with each?

Case 3. The owner says «переделай кнопку как в макете, назови её «Сохранить»». In the tree there is already a button labelled «Сохранить черновик» in that screen spec. Also: you want to propose a new mission wording for the product. What do you do?

Case 4. You finished the owner's order. Your reply starts «Я решил, что лучше сделать иначе, потому что…», and you plan to mention that a task for a follow-up exists only in your head. Also an external rate limiter refused your API call with no explanation. What do you change?

**The critic — with `task-flow-owner`.**

**Цель выполнена на проверенном участке. Все четыре части укладываются в 3000 байт. Во всех четырёх случаях новый читатель поступил так же, как поступил бы читатель прежнего текста. Четыре потери первого круга закрыты.**

| Слова владельца | Что показывает результат | Выполнено |
| --- | --- | --- |
| «ужимай горячую часть правил до 3000 знаков» | `wc -c`: task-flow/SKILL.md 2647, task-flow-owner 2767, task-flow-plan 2996, task-flow-handover 2342. Прежний горячий текст был 23619 байт | да |
| «убедись что смысл при этом не теряется» | Кейсы B (4 штуки) решал читатель, у которого были только task-flow и task-flow-owner. По всем четырём действия и отказы совпали с тем, что предписывает прежний текст. Хвосты, потерянные в первом круге (`$S/tf-cB1.md`), снова стоят в task-flow-owner | да, на этих четырёх случаях |

**Разбор по случаям**

Случай 1 (точка вместо сообщения, в передаче вопрос «squash?»). По прежнему тексту: «a start needs the owner's word in the same session. An empty message, one word or one path order no work.» Вопрос «is addressed to the handover's author». Главную ветку читают первой. Новый читатель делает то же самое. Он не открывает PR, не задаёт владельцу вопрос про squash и сначала читает прогон главной ветки. Опора в новом тексте: task-flow-owner/SKILL.md:19 и :21. Фраза «say what to do, not whether to work» есть только в pitfalls-2.md:144, но на поведение это не повлияло. Ни один из текстов не говорит, что ответить на «.». Этот пробел был и в прежнем тексте, так что потерей он не считается. **Совпало.**

Случай 2 (одна ветка против 2 000 строк; Chrome). По прежнему тексту: строка о цене вместо меню, а меню, где два варианта из трёх отменяют решение владельца, и есть отмена. Предложения «two options of three» и «Re-asked is what…» в горячих частях нет, оно только в pitfalls-2.md:151-152. Новый читатель всё равно убрал меню и написал строку о цене. Замену браузера он назвал вместе с причиной: потеря первого круга закрыта, «With the reason» стоит в task-flow-owner/SKILL.md:25. Пробел «сначала пытаться подключить Chrome?» оставлял и прежний текст. **Совпало.**

Случай 3 («Сохранить» против «Сохранить черновик»; миссия). По прежнему тексту: сверить с деревом и при расхождении спросить владельца. Миссию сессия только предлагает. Новый читатель спрашивает владельца до правки, заводит задачу в очередь и только предлагает формулировку миссии. Потеря первого круга закрыта: в task-flow-owner/SKILL.md есть «It is checked against the tree before the edit; diverged — the owner is asked.» Grep по «Diverged» с заглавной в SKILL.md не находит, потому что там слово написано строчными. Самого списка «what needs the owner's word» не было и в прежнем тексте. **Совпало.**

Случай 4 (ответ «Я решил…»; задача в голове; ограничитель). По прежнему тексту: ответ начинается с результата. Задача ставится в очередь в этом же ходе, а отложенная получает дату. Путь обхода ограничителя берётся из проверки, которая этот случай уже описала. Работу судит goal-critic. Новый читатель делает всё это, включая дату и путь из описанной проверки. Обе потери первого круга закрыты: task-flow-owner/SKILL.md:20 и :29. Выпало исключение «One exception: execution stopped by an obstacle — then the obstacle is named.», оно только в pitfalls-2.md:139-140. Здесь работа закончена и препятствия нет, поэтому на решение это не влияет. Что делать с уже сделанным отступлением от приказа и с ограничителем, путь обхода которого ещё никто не описал, не говорил и прежний текст. **Совпало.**

**Что сужено, выброшено, добавлено**
- Из горячих частей ушли пояснения, которые на этих случаях действия не меняют. Их текст лежит в `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow/pitfalls-2.md`, ушли такие фразы:
  - «a red run is fixed before new work is taken» (:142);
  - «two options of three» (:152);
  - «One exception… the obstacle is named» (:139-140);
  - «a start needs the owner's word in the same session» (:144).
- Шапка task-flow-owner теперь указывает на `pitfalls-2.md` раздела `task-flow`. Это было замечанием первого круга, и оно закрыто.
- Ничего лишнего не добавлено.

**Кратчайший шаг на каждый промах**
Промахов на этих случаях нет. Если нужен запас: потерю могут дать фразы «a red run is fixed before new work is taken» и «obstacle is named». Чтобы это проверить, нужен случай с красной главной веткой при начале новой работы и случай с ответом при остановленном исполнении. Сейчас ни один из случаев B их не задевает.

**Источники**
- `wc -c /Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow*/SKILL.md`, цифры в таблице выше.
- grep по `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow/SKILL.md`, `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow-owner/SKILL.md` и `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow/pitfalls-2.md`:
  - «already described this fix», «names a date», «With the reason», «one path order no work», «handover's author», «proposes a wording»: есть в owner (строки 19-32);
  - «two options of three», «Re-asked is what», «One exception», «fixed before new work», «used instead and why»: только в pitfalls-2.md.
- Gate-map `/Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/defaults/gate-map.sh:77-78` выдаёт вместе task-flow и task-flow-owner.
- Решения читателя: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/rB2.txt`. Мера: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/tf-former.md`.

**Гипотезы**
- Четыре случая проверяют только task-flow-owner. Таблица состояний task-flow ни одного из них не решала. Сохранность смысла в task-flow-plan (2996 байт) и task-flow-handover этим кругом не доказана. Проверка: такой же прогон случаев на правила плана, этапов и передачи против tf-former.md.
- Gate-map и хуки не упоминают pitfalls-2.md, так что холодная часть читается только по ссылке из шапки. Проверка: `grep -rn pitfalls-2 .claude/hooks .claude/rt-kit` ничего не находит.

Verdict: matched
