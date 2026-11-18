# task-flow-owner — the retelling

Under each round stand its cases, given to a reader who saw only the hot part together with the states part `task-flow`, as the gate gives them on an edit of a grill, and then the
reply of `goal-critic` verbatim.

## Round 1 — the hot part of 2341 bytes

**Cases.**

Case 1. A new session starts. The handover from the previous session says «next: open the PR for RT-12», and it ends with a question «should we squash?». The owner's first message is just «.». What do you do?

Case 2. The owner said yesterday «делай всё в одной ветке». Today you find the change will be 2 000 lines. You prepare a menu: (a) split into three branches (Recommended), (b) keep one branch, (c) ask later. Also the owner asked you to check the result «в хроме», and Chrome is not connected; you plan to use another browser silently. What do you do with each?

Case 3. The owner says «переделай кнопку как в макете, назови её «Сохранить»». In the tree there is already a button labelled «Сохранить черновик» in that screen spec. Also: you want to propose a new mission wording for the product. What do you do?

Case 4. You finished the owner's order. Your reply starts «Я решил, что лучше сделать иначе, потому что…», and you plan to mention that a task for a follow-up exists only in your head. Also an external rate limiter refused your API call with no explanation. What do you change?

**The critic.**

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

## Round 2 — the hot part of 2767 bytes

**Cases.**

Case 1. A new session starts. The handover from the previous session says «next: open the PR for RT-12», and it ends with a question «should we squash?». The owner's first message is just «.». What do you do?

Case 2. The owner said yesterday «делай всё в одной ветке». Today you find the change will be 2 000 lines. You prepare a menu: (a) split into three branches (Recommended), (b) keep one branch, (c) ask later. Also the owner asked you to check the result «в хроме», and Chrome is not connected; you plan to use another browser silently. What do you do with each?

Case 3. The owner says «переделай кнопку как в макете, назови её «Сохранить»». In the tree there is already a button labelled «Сохранить черновик» in that screen spec. Also: you want to propose a new mission wording for the product. What do you do?

Case 4. You finished the owner's order. Your reply starts «Я решил, что лучше сделать иначе, потому что…», and you plan to mention that a task for a follow-up exists only in your head. Also an external rate limiter refused your API call with no explanation. What do you change?

**The critic.**

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
