# task-flow-plan — the retelling

Under each round stand its cases, given to a reader who saw only the hot part together with the states part `task-flow`, as the gate gives them on an edit of a task folder, and then the
reply of `goal-critic` verbatim.

## Round 1 — the hot part of 2608 bytes

**Cases.**

Case 1. A task-flow guard refused your edit of `libs/api/x/feature/a.ts` saying «wrong state». The progress's state line says `задача-взята`, the plan is written but not yet approved. You are tempted to change the state line to `этап-идёт`. What do you do? Also: the edit is a pure refactor that changes no behaviour — do you still need the product agreement?

Case 2. You write the plan. Stage 2's done-sign says «the admin list shows filters and sorting», and its steps cover filters only. One step's check is `npm test` with expected output «green», written before you ran anything. What do you fix?

Case 3. Mid-stage you notice an unrelated broken link in another package's README. The plan's exit conditions say nothing about it. Also: in the progress two steps are marked `[>]`. What do you do with each?

Case 4. You are about to start the task: the grill is closed, there is no task number yet, and you want to keep the folder in your working tree uncommitted until the plan is ready. And the plan should name a done-sign for the epic's milestone — is that needed?

**The critic.**

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

Verdict (round 1): diverged

## Round 2 — the hot part of 2996 bytes

**Cases.**

Case 1. A task-flow guard refused your edit of `libs/api/x/feature/a.ts` saying «wrong state». The progress's state line says `задача-взята`, the plan is written but not yet approved. You are tempted to change the state line to `этап-идёт`. What do you do? Also: the edit is a pure refactor that changes no behaviour — do you still need the product agreement?

Case 2. You write the plan. Stage 2's done-sign says «the admin list shows filters and sorting», and its steps cover filters only. One step's check is `npm test` with expected output «green», written before you ran anything. What do you fix?

Case 3. Mid-stage you notice an unrelated broken link in another package's README. The plan's exit conditions say nothing about it. Also: in the progress two steps are marked `[>]`. What do you do with each?

Case 4. You are about to start the task: the grill is closed, there is no task number yet, and you want to keep the folder in your working tree uncommitted until the plan is ready. And the plan should name a done-sign for the epic's milestone — is that needed?

**The critic.**

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

Verdict: matched
