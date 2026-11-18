# ui-component-tests — the retelling

Under each round stand its cases. A reader got them with only the hot part of the showcase, as the gate gives it on a spec or a story. Then stands the reply of `goal-critic` verbatim.

## Round 1 — the hot part of 2864 characters

**Cases.**

Case 1. You changed the padding of a kit button. The story snapshots passed without a single divergence, and the spec checks that the class `rt-button--compact` is on the node. You plan to report the edit as confirmed. What do you do?

Case 2. A story opens a dropdown overlay in `play`, and the snapshot sometimes shows it closed. The harness waits 300 ms before the shot. Someone proposes waiting 600 ms instead. What do you change?

Case 3. A wave of edits to many stories is done, and the run is green. You plan to close the wave by that. One story's state (a focused input) is invisible in the frame, and you planned a snapshot for it. What do you do?

Case 4. A snapshot of a tall story leaves a trace on the next story's frame once in twenty runs. You plan to rerun the suite in a loop until it passes. What do you do?

**The critic.**

**Цель выполнена частично: объём уложен (2 864 знака из 3 000), но смысл горячей части потерян во всех четырёх случаях. Без открытия холодной части читатель новой горячей части знает, от чего отказаться, но не знает, что делать вместо этого.**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -m`: `.claude/skills/ui-component-tests/SKILL.md` — 2 864, `.claude/skills/ui-component-tests-screens/SKILL.md` — 2 116 | да |
| «убедись что смысл при этом не теряется» | В горячей части остались только жирные заголовки, пояснения к ним убраны. Все четыре случая расходятся с решением читателя прежнего текста. Пояснения дословно сохранились в холодной `pitfalls-2.md` (23 264 знака), поэтому правило целиком смысл не потеряло, а горячая часть потеряла | нет |

**Что сужено, что выброшено, что добавлено**
- Сужено: в горячей части остались одни утверждения без способа. Таблица «вопрос → чем отвечать» (спека / снимок истории / кадр сквозного набора / замер) удалена целиком.
- Выброшено из горячей части: команда обхода, параметр снимка для оверлея, «отдельная история» для невидимого состояния, порядок «окно расширяется до кадра, по узлу, а не по странице», доля расхождения как признак. Всё это лежит в `pitfalls-2.md`: строки 31, 46, 61, 123, 139, 287.
- Добавлено: вторая горячая часть `ui-component-tests-screens`. Владелец её не просил, но это способ уложиться в лимит, и он не мешает цели.

**Потери по случаям**

**Случай 1** (отступ кнопки, снимки чистые, спека проверяет класс).
- Читатель прежнего текста не засчитывает правку и смотрит на долю расхождения. Отступ он замеряет вычисленными значениями через `browser-verification-measure`.
- Новый читатель тоже не засчитывает, но меряет «растр или кадр» и пишет, что текст не говорит, что такое вторая половина проверки. Способ проверки другой, и признак разбора (доля расхождения) ему неизвестен.
- Утрачены фразы: «The sign is the share of the divergence, not the colour of the run.» и строка таблицы «Do the padding, the font size and the colour match the reference? | a measurement of computed values — `browser-verification-measure`».
- grep по SKILL.md: `share of the divergence` и `browser-verification-measure` не найдены. Есть только в `pitfalls-2.md`: 287 и 31.
- Хвост: «…half checked — sorted out by the share of the divergence; a size by `browser-verification-measure`.»

**Случай 2** (оверлей иногда закрыт в кадре, ожидание 300 мс).
- Читатель прежнего текста называет узел оверлея параметром снимка истории. Тогда обвязка глушит уход указателя и отказывает, если узла нет к моменту кадра.
- Новый читатель пишет «убедиться, что оверлей объявлен», но не знает, как его объявить («does not say where or how the declared lifetime is written»). Без параметра снимка ожидание по событию не помешает указателю закрыть оверлей, так что исправление не сработает.
- Утрачена фраза: «So a story names the overlay's node as a shot parameter: the harness mutes the pointer leaving on its page and refuses when it does not find the promised node».
- grep по SKILL.md: `shot parameter` не найдено. Есть в `pitfalls-2.md:139`.
- Хвост: «…only where that is declared — the overlay node as a shot parameter.»

**Случай 3** (волну закрывают зелёным прогоном, фокус в кадре не виден).
- Читатель прежнего текста закрывает волну командой `pnpm run test:stories:v2` и заводит фокусу отдельную историю.
- Новый читатель не знает, что такое «обход» («does not define sweep»). Запланированный снимок он отбрасывает и проверяет фокус замером растра. Это расходится с прежним текстом, который требует историю, а не отказ от снимка.
- Утрачены фразы: «there is nothing in this tree but the sweep — `pnpm run test:stories:v2`» и «Such a state gets a story of its own rather than being credited with a neighbour's coverage.»
- grep по SKILL.md: `test:stories:v2` и `story of its own` не найдены. Есть в `pitfalls-2.md`: 46 и 61.
- Хвосты: «…not by the colour of a run — `pnpm run test:stories:v2`.» и «…not checked by a snapshot — it gets a story of its own.»

**Случай 4** (след высокой истории на соседнем кадре раз в двадцать прогонов).
- Читатель прежнего текста расширяет окно до кадра, ждёт, пока показ устоится, и снимает обычный кадр. Окно он расширяет по снимаемому узлу, а не по странице. Высоту узла он меряет до затвора и после, чтобы отличить снимок от вёрстки.
- Новый читатель пишет «size the viewport» и прямо называет пробел: «does not say how big the window must be». Если он расширит окно по странице, сдвинутся истории, которые этого не просили. Прежний текст это запрещает.
- Утрачены фразы: «the window is widened **before** the frame» и «The window is widened to the node being shot, not to the page».
- grep по SKILL.md: `to the node being shot` и `before the frame` не найдены. Есть в `pitfalls-2.md:123` и в холодных частях.
- Хвост: «…but by the window — widened before the frame to the node, not the page.»

**Самый короткий шаг**

Пять хвостов выше стоят около 235 знаков, а запас сейчас 136. Нужно освободить около 100 знаков:
- слить «A frame of a node beyond the window is cured the same way.» с предыдущей строкой («A shot of a page or a node beyond the window…»), это примерно −60;
- убрать «This tree's rule, not from the package.», это −40.

После этого вписать пять хвостов, проверить `wc -m` ≤ 3000 и заново прогнать четыре случая читателем, который видит только горячую часть. Есть запасной шаг, если хвосты не влезают: добавить в строку «Cold part» слова «the how of every line — `pitfalls-2.md`». Это около 45 знаков. Тогда читатель откроет холодную часть, но это слабее хвостов: решение будет зависеть от того, откроет ли он файл.

**Источники**
- `wc -m`: `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/ui-component-tests/SKILL.md` — 2864, `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/ui-component-tests-screens/SKILL.md` — 2116, `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/uct-former.md` — 23326.
- Прежний текст, `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/uct-former.md`: строки 27–36, 44–48, 60–62, 71–73, 116–125, 138–141.
- Решения нового читателя: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/uctA1.txt`, строки «Gap» в каждом случае.
- Холодная часть: `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/ui-component-tests/pitfalls-2.md`: 31, 46, 61, 123, 139, 260, 287. Это новый файл, который ещё не в истории (`??`).

**Гипотезы для проверки**
- Что все хвосты влезут после двух предложенных сокращений, я посчитал на глаз. Проверка: вписать хвосты и сделать `wc -m`.
- Что читатель, который может открыть холодную часть, решит так же, как читатель прежнего текста, я не проверял. Проверка: прогнать те же четыре случая читателем с правом открыть `pitfalls-2.md`.

Verdict (round 1): diverged

## Round 2 — the hot part of 2999 characters

**Cases.**

Case 1. You changed the padding of a kit button. The story snapshots passed without a single divergence, and the spec checks that the class `rt-button--compact` is on the node. You plan to report the edit as confirmed. What do you do?

Case 2. A story opens a dropdown overlay in `play`, and the snapshot sometimes shows it closed. The harness waits 300 ms before the shot. Someone proposes waiting 600 ms instead. What do you change?

Case 3. A wave of edits to many stories is done, and the run is green. You plan to close the wave by that. One story's state (a focused input) is invisible in the frame, and you planned a snapshot for it. What do you do?

Case 4. A snapshot of a tall story leaves a trace on the next story's frame once in twenty runs. You plan to rerun the suite in a loop until it passes. What do you do?

**The critic.**

Второй круг выявил одно расхождение: три случая из четырёх совпали, случай 3 расходится из-за двух добавленных слов. Горячая часть занимает 2 999 знаков (`wc -m`), в лимит 3 000 укладывается.

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -m /Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/ui-component-tests/SKILL.md` → 2999 | да |
| «убедись что смысл при этом не теряется» | Случаи 1, 2 и 4 совпали с прежним текстом. В случае 3 новая горячая часть разрешает «A story of its own or a spec», а в прежнем тексте было только «gets a story of its own» | нет, остался один пункт |

**По случаям**

**Случай 1** (отступ кнопки, снимки чистые, спека проверяет класс): совпал.
- Читатель прежнего текста не засчитывает правку («half checked») и меряет отступ через `browser-verification-measure` (прежний текст, строки 32 и 71).
- Новый читатель делает то же самое (SKILL.md:28).
- Его оговорка «reading the style value is not enough» взята из строки 25 и прямо повторяет прежнюю строку 64 («not by the value of a written style»). Прежнему тексту она не противоречит.
- Признак «share of the divergence» к этому случаю не относится: расхождений ноль.
- Потеря первого круга закрыта.

**Случай 2** (оверлей иногда закрыт в кадре, ожидание 300 мс): совпал.
- Новый читатель отказывается от 600 мс и от любого отсчёта времени. Он ждёт по событию, ожидание при неудаче отказывает, ждёт он сам оверлей, а не его следствие.
- Узел оверлея он объявляет параметром снимка (SKILL.md:43). Это прежняя строка 140: «names the overlay's node as a shot parameter».
- Потеря первого круга закрыта.

**Случай 3** (волну закрывают зелёным прогоном, фокус в кадре не виден): разошёлся.
- Обход историй совпал: `pnpm run test:stories:v2`, с обзорными страницами в том же вызове. Потеря первого круга по команде закрыта.
- Расхождение в выборе проверки:
  - Прежний текст, строка 62: «Such a state gets a story of its own rather than being credited with a neighbour's coverage.» Про спеку там ни слова. Ещё раньше, в строке 36: «A styling edit is confirmed by a snapshot, not by a spec».
  - Новая горячая часть, строка 24: «A story of its own or a spec.»
  - Новый читатель так и записал: «It gets a story of its own or a spec instead». Значит, он может закрыть видимое состояние спекой. Читатель прежнего текста так бы не сделал, он завёл бы отдельную историю.
- Это не потеря, а добавленный вариант, которого в прежнем тексте не было.

**Случай 4** (след высокой истории на соседнем кадре раз в двадцать прогонов): совпал.
- Новый читатель отказывается от прогона в цикле, расширяет окно до кадра и по размеру узла, а след ищет на следующей истории (SKILL.md:38–40).
- Это прежние строки 116–126: «widened **before** the frame», «widened to the node being shot».
- Замер высоты узла до затвора и после он не упоминает (прежняя строка 127). Но в условии случая причина уже названа, поэтому на решение это не влияет.
- Потеря первого круга закрыта.

**Что сужено, выброшено или добавлено**
- Добавлено: «or a spec» в SKILL.md:24.
- Других расхождений по этим четырём случаям нет.

**Самый короткий шаг**
- В SKILL.md:24 заменить «A story of its own or a spec.» на «A story of its own.». Получится 2 989 знаков (−10).
- Хвост не нужен: шаг сводится к удалению двух слов.
- Если запас позволяет, точнее передаёт прежний смысл вариант «A story of its own, not a neighbour's.». Но он добавляет 7 знаков к нынешним 2 999, это сверх лимита. Без других сокращений этот вариант не подходит.

**Источники**
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/ui-component-tests/SKILL.md`, строки 24, 25, 28, 38–40, 43; `wc -m` = 2999.
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/uct-former.md`, строки 32, 36, 47, 62, 64, 71–73, 116–127, 140.
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/uctA2.txt`, строки 2, 6, 10, 14.

**Гипотеза для проверки:** после удаления «or a spec» читатель выберет в случае 3 отдельную историю. Проверить можно так: прогнать случай 3 заново читателем, который видит только горячую часть.

Verdict (round 2): diverged

## Round 3 — the hot part of 2989 characters

**Cases.**

Case 3. A wave of edits to many stories is done, and the run is green. You plan to close the wave by that. One story's state (a focused input) is invisible in the frame, and you planned a snapshot for it. What do you do?

**The critic.**

Цель выполнена: горячая часть занимает 2 989 знаков, и случай 3 теперь совпадает с прежним текстом. Случаи 1, 2 и 4 опираются на строки, которые не менялись.

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -m /Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/ui-component-tests/SKILL.md` → 2989 | да |
| «убедись что смысл при этом не теряется» | Случаи 1, 2 и 4 совпали во втором круге, и строки, на которые они опирались (SKILL.md:21, 25, 28, 38–40, 43), стоят без изменений. Случай 3 совпал в третьем круге: отдельная история без варианта со спекой | да |

**Остались ли без изменений строки для случаев 1, 2 и 4**
- Во втором круге критик ссылался на строки 24, 25, 28, 38–40 и 43 при объёме 2 999 знаков. Сейчас объём 2 989, разница −10. Это ровно « or a spec», а именно это удаление предлагал шаг второго круга.
- Строка 25: «…a frame or a measurement of the raster, not by the value of a written style.» На месте (случай 1).
- Строка 28: «…half checked.** A size: by `browser-verification-measure`.» На месте (случай 1).
- Строка 43: «…only where that is declared.** Its node is a shot parameter.» На месте (случай 2).
- Строки 37–40: доля расхождения, «Widened before the frame.», «To the node.», след на истории после высокой. Всё на месте (случай 4).
- Строки 20–21: обход и `pnpm run test:stories:v2`. На месте (случай 3).
- Изменилась только строка 24, теперь она такая: «**A state invisible in the frame is not checked by a snapshot.** A story of its own.»

**Случай 3**
- Прежний текст, `uct-former.md`:45–48 и 60–62: волна закрывается обходом `pnpm run test:stories:v2`, а не цветом прогона. Невидимое в кадре состояние снимком не проверяют: «Such a state gets a story of its own rather than being credited with a neighbour's coverage.»
- Новый читатель (`uctA3.txt`) не закрывает волну по зелёному прогону. Он запускает обход той же командой, с обзорными страницами в том же вызове. Состоянию с фокусом он заводит отдельную историю, а от снимка этого состояния отказывается. Спеки в его решении больше нет.
- Он добавляет: признак состояния проверять кадром или замером растра, а не значением стиля. Это строка 25 горячей части и прежняя строка 64, так что противоречия нет.
- Он молчит о том, как показать фокус в этой истории. Прежний текст в разделе ловушек говорит, что `expectScreen` убирает фокус с кнопок, а поле фокус сохраняет (`uct-former.md`:274–276). Но условие случая уже говорит, что состояние в кадре не видно, а решение («своя история, не снимок») от этого не меняется. Это не расхождение.
- Оттенок «rather than being credited with a neighbour's coverage» в горячей части сокращён до «A story of its own.». Читатель всё равно выбрал отдельную историю, поэтому на решение это не повлияло.

**Что сужено, выброшено или добавлено.** По этим четырём случаям ничего. Добавка второго круга («or a spec») убрана.

**Шаги.** Промахов нет.

**Источники**
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/ui-component-tests/SKILL.md`: строки 20–21, 24, 25, 28, 37–40, 43; `wc -m` = 2989.
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/uct-former.md`: строки 34–36, 45–48, 60–64, 274–276.
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/uctA3.txt`, случай 3.
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/uctA2.txt`: ответы на случаи 1, 2 и 4 из второго круга.
- `/Users/eyhenij/WebstormProjects/rt-tools/docs/tasks/RT-3326-rule-gate-gives-rule/retell/ui-component-tests.md`: строки 95–146.

**Гипотеза.** Я считаю, что случаи 1, 2 и 4 дадут то же решение, что во втором круге, потому что их строки не менялись. В третьем круге их заново не прогоняли. Проверить можно так: дать эти три случая читателю, который видит только нынешнюю горячую часть.

Verdict: matched
