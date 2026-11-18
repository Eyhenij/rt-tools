# ui-component-tests-screens — the retelling

Under each round stand its cases. A reader got them with only the hot part of the screens and the showcase part, as the gate gives them on the harness or a reference. Then stands the reply of `goal-critic` verbatim.

## Round 1 — the hot part of 2116 characters

**Cases.**

Case 1. A showcase snapshot diverged after your edit. You plan to re-take all references of the kit at once by the update flag, without looking at the frames, and commit them. You raised the showcase on your own port with your own settings. What do you do?

Case 2. You built an admin list screen. You plan to confirm it by a showcase story of the table component. Its frame shows a date column that changes every day; you plan to raise the comparison threshold to 2 %. What do you do?

Case 3. The end-to-end suite's frame of a screen shows rows whose content depends on today's date, though the clock is fixed. A mask covers the column. The seeding script inserts rows and the frame is trusted to show if it went wrong. What do you change?

Case 4. You removed a settled-frame wait from the snapshot harness. You plan to rely on the snapshot run to show if anything broke. Also you wrote a one-off script to measure frames and plan to commit it to `tools/`. What do you do?

**The critic.**

**Цель выполнена частично: обе горячие части укладываются в 3000 знаков, но в части `ui-component-tests-screens` смысл теряется в случаях 2, 3 и 4.**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -m`: `ui-component-tests-screens/SKILL.md` = 2116, `ui-component-tests/SKILL.md` = 2864 | да |
| «убедись что смысл при этом не теряется» | Читатель одной горячей части `-screens` в случае 1 решил так же, как читатель прежнего текста. В случаях 2, 3 и 4 он оставляет маску, не знает признака и момента отказа самопроверки засева, а пробу строит по-другому. | нет |

## По случаям

**Случай 1 (переснять все эталоны со своей витрины): потерь нет.** Читатель прежнего текста сделал бы то же: сначала посмотреть кадр, переснимать по одному, брать ту витрину, которую поднимает проверка, перед коммитом поднять второй раз. Пробелы нового читателя («как поднять ту же витрину», «что считать прошедшим повторным подъёмом») были и в прежнем тексте. Там сказано только «The tree assembles two», а какую из них поднимает проверка, не сказано.

**Случай 2 (экран через историю витрины, порог 2 %): одна потеря — маска.**
- Прежний текст: «A column under a mask takes its place as before, and a drifting value inside it moves its neighbours past the mask. What drifts is cured in the seeding — by a constant value — and then no mask is needed at all.»
- Новый читатель предлагает на выбор фиксированные часы или «a mask over that column's content that keeps the width visible». Он прочёл заголовок как разрешение на маску. Прежний читатель маску не ставит: он чинит засев, и маска становится не нужна.
- `grep -n "no mask is needed\|cured in the seeding" .claude/skills/ui-component-tests-screens/SKILL.md` ничего не находит. Фраза есть только в холодной части `.claude/skills/ui-component-tests/pitfalls-2.md:208`.
- Вне потерь: отказ от истории витрины и от порога совпал. Пробел «где этот кадр запускается» не меняет действия: нового шага читатель не добавляет. Не проверено случаями: прежний текст требовал снимать страницу целиком, в спеке самого экрана, на production-сборке за стендом. Из горячей части это ушло, но ни один случай этого не спрашивает. Это гипотеза; проверить можно случаем «кадр окна в отдельном файле snapshots.spec.ts».

**Случай 3 (строки зависят от сегодняшней даты, маска, засев без проверки): две потери.**
1. Маска. Новый читатель проверяет, «that the mask hides only the cell content», и прямо пишет в пробелах: «does not say whether the mask should be removed once the data is fixed». Прежний текст отвечает «then no mask is needed at all»: маску снимают. Действие другое.
2. Признак и момент отказа самопроверки. Прежний текст: «a seeding refusal names the reason in words and arrives at the stand's startup, before a single frame is taken … a time value that landed on the run day or later was computed by the machine clock and not pinned by the seeding. A deliberate future — a far expiry date — is separated by a boundary and named apart.» Новый читатель пишет: «does not say how the self-check fails». Без признака «день прогона или позже» и границы для намеренного будущего он напишет другую проверку. `grep -n "run day or later\|stand's startup" …/ui-component-tests-screens/SKILL.md` ничего не находит, а в `pitfalls-2.md:217` фраза есть.
- Вне потерь: исправление «производное берётся от тех же часов» совпало по сути.

**Случай 4 (ожидание убрано из обвязки, одноразовый скрипт в `tools/`): две потери.**
1. Что делает проба. Прежний текст: «the probe reads whether the call stands in the harness and whether it stands after the shot, then holds back what is awaited on its approach and matches the frame before the wait against the frame after it. The first half catches a rollback by an edit, the second a rollback in substance». Новый читатель пишет только «guard … with a probe». Проба, которая ищет лишь вызов в коде, его не смутит, а прежний текст её прямо отвергает. `grep -n "frame before the wait" …/ui-component-tests-screens/SKILL.md` ничего не находит.
2. Сколько замеров. Прежний текст: «The measurements are taken one after another until they diverge; the refusal comes only when they all matched, and it names how many were taken.» Новый читатель пишет «more than one measurement» и в пробелах «how many measurements are enough». `grep "until they diverge"` в SKILL.md ничего не находит.
- Вне потерь: отказ коммитить одноразовый скрипт совпал. Пробел «где хранить вместо этого» на решение в случае не влияет, хотя прежний текст отвечал: «It lives in a temporary directory».

Смягчающее обстоятельство (не доказательство): проверка правил (`.claude/hooks/skill-gate.sh:283`) прикладывает `ui-component-tests-screens/implementation.md`, если он влезает в лимит. В нём есть «held at zero», «causes … closed in the stand's seeding», `FAR_FUTURE`, «frame before the wait». Но «no mask is needed» и признака «run day or later» нет и там. К тому же вариант задачи — «читатель видел только горячую часть».

## Что сужено, выброшено, добавлено
- Сужено: каждая статья свелась к жирной фразе без пояснения. Где пояснение задавало действие (маска, самопроверка засева, устройство пробы), действие пропало.
- Выброшено из горячей части: снимать страницу целиком в спеке экрана (случаями не проверено).
- Добавлено: ничего. Указатель на холодную часть работает: `-screens/pitfalls.md:4` ведёт в `ui-component-tests/pitfalls-2.md`.

## Самые короткие шаги (бюджет есть: 2116 + примерно 230 ≤ 3000)
- Маска (строка 30): «**A mask covers the content but not the width:** what drifts is made constant in the seeding, and the mask goes.»
- Засев (строка 32): «**The seeding checks itself instead of relying on the frame:** at the stand's startup it refuses in words on a time value on the run day or later, a far future named apart.»
- Проба (строка 14): «**… not by the snapshot run:** it matches the frame before the wait against the frame after it.»
- Замеры (строка 16): «**… guards against:** measured until two diverge.»
После правки прогнать случаи 2–4 на новом читателе ещё раз.

## Источники
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/ui-component-tests-screens/SKILL.md` (строки 14–33; `wc -m` = 2116)
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/ui-component-tests/SKILL.md` (`wc -m` = 2864)
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/uct-former.md`: строки 142–148, 153–156, 207–209, 215–220
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/uctB1.txt`: строки 8, 11, 14, 17, 20, 23
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/ui-component-tests/pitfalls-2.md`: строки 154, 208, 217
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/ui-component-tests-screens/implementation.md`
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/hooks/skill-gate.sh`: строки 283, 411

Гипотезы, которые стоит проверить: что теряется правило «страница целиком, в спеке экрана» (нужен случай, который это спрашивает); что `implementation.md` действительно доходит вместе с правилом при обоих частях сразу (собрать текст проверки на `__snapshots__/*` и сравнить с лимитом).

Verdict (round 1): diverged

## Round 2 — the hot part of 2364 characters

**Cases.**

Case 1. A showcase snapshot diverged after your edit. You plan to re-take all references of the kit at once by the update flag, without looking at the frames, and commit them. You raised the showcase on your own port with your own settings. What do you do?

Case 2. You built an admin list screen. You plan to confirm it by a showcase story of the table component. Its frame shows a date column that changes every day; you plan to raise the comparison threshold to 2 %. What do you do?

Case 3. The end-to-end suite's frame of a screen shows rows whose content depends on today's date, though the clock is fixed. A mask covers the column. The seeding script inserts rows and the frame is trusted to show if it went wrong. What do you change?

Case 4. You removed a settled-frame wait from the snapshot harness. You plan to rely on the snapshot run to show if anything broke. Also you wrote a one-off script to measure frames and plan to commit it to `tools/`. What do you do?

**The critic.**

**Цель выполнена: обе горячие части не длиннее 3000 знаков, и во втором круге читатель решает все четыре случая так же, как решил бы читатель прежнего текста.**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -m`: в `ui-component-tests-screens/SKILL.md` 2364 знака, в `ui-component-tests/SKILL.md` 2999 знаков | да |
| «убедись что смысл при этом не теряется» | Все четыре потери первого круга закрыты строками 14, 16, 30 и 32 новой части. Решения читателя в `uctB2.txt` совпадают с решениями по прежнему тексту во всех четырёх случаях. | да |

## По случаям

**Случай 1 (переснять все эталоны разом со своей витрины): совпало.**
- Читатель делает всё, что требовал прежний текст: сначала смотрит кадр, переснимает по одному эталону, берёт ту витрину, которую поднимает проверка, и перед коммитом поднимает её второй раз.
- Соответствующие строки прежнего текста: «a raised showcase, the eyes, then the reference», «one at a time», «the same showcase the gate raises», «confirmed by a second raising» (`uct-former.md:166–178`).
- Читатель добавил замер для правки стилей. Это есть и в общей части (`ui-component-tests/SKILL.md:28`), так что лишнего действия нет.

**Случай 2 (экран через историю витрины, порог 2 %): совпало.**
- Читатель закрывает экран кадром сквозного набора, а дрейф чинит в засеве: постоянной делает и саму дату, и всё, что приложение из неё вывело. Остаток убирает по имени. От истории витрины и от порога отказывается.
- В первом круге читатель допускал маску. Теперь не допускает: строка 30 «the mask goes».

**Случай 3 (маска, строки зависят от даты, засев без проверки): совпало.**
- Читатель делает засев постоянным, включая выведенные значения, и снимает маску.
- Самопроверку засева он ставит на запуск стенда. Отказ звучит словами на время «в день прогона или позже», далёкое будущее названо отдельно. Проверяются столбцы времени всех таблиц, которые читают экраны.
- Обе потери первого круга закрыты. Это строка 32 против `uct-former.md:215–223` и строка 30 против `uct-former.md:207–209`.

**Случай 4 (ожидание убрано из обвязки, одноразовый скрипт в `tools/`): совпало.**
- Проба сравнивает кадр до ожидания с кадром после него (строка 14). Замеры идут, пока два не разойдутся (строка 16).
- Остальные три требования к пробе тоже на месте. От прогона снимков как от защиты и от коммита скрипта читатель отказывается.
- Остаток, который действие не меняет: прежний текст делил пробу на две половины. Первая читала, «whether the call stands in the harness and whether it stands after the shot» (`uct-former.md:144–145`), то есть стоит ли вызов в обвязке и стоит ли он после снимка. Новый читатель строит только вторую половину, сравнение кадров. Возврат по существу эта половина ловит. Удалённый вызов она, скорее всего, тоже поймает: без ожидания нечего сравнивать. Это гипотеза. Проверить её можно случаем «вызов ожидания закомментирован одной косой чертой».
- Ещё две подробности не вошли, и ни один случай их не спрашивает: «refusal names how many were taken» (отказ называет, сколько замеров снято) и «It lives in a temporary directory» (где держать одноразовый скрипт).

## Что сужено, выброшено, добавлено
- **Сужено.** Пояснения к статьям ушли в холодную часть. Где пояснение задавало действие, оно сохранено короткой второй фразой (строки 14, 16, 30, 32).
- **Выброшено из горячей части, случаями не проверено:**
  - снимать страницу целиком, на production-сборке, в спеке самого экрана, а не в отдельном файле «про снимки» (`uct-former.md:185–191`);
  - при дрейфе сравнивать кадры попиксельно (`uct-former.md:205`).
- **Добавлено:** ничего.
- **Запас:** в общей части 2999 знаков, на один знак меньше лимита. Любая правка в ней потребует сокращения в другом месте.

## Самые короткие шаги
Потерь в случаях нет. Если нужно закрыть первую гипотезу, хвост для строки 14 (не длиннее 80 знаков):
`It also reads that the call stands after the shot.`

## Источники
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/ui-component-tests-screens/SKILL.md`, строки 14–33
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/ui-component-tests/SKILL.md`
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/uct-former.md`, строки 142–223
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/uctB2.txt`, строки 1–15
- `/Users/eyhenij/WebstormProjects/rt-tools/docs/tasks/RT-3326-rule-gate-gives-rule/retell/ui-component-tests-screens.md` (вердикт первого круга)

**Гипотезы для проверки:**
1. Проба из одних кадров ловит закомментированный вызов. Проверить случаем «вызов закомментирован».
2. Правило «страница целиком, в спеке экрана» доходит до читателя. Проверить случаем «кадр окна в отдельном snapshots.spec.ts».

Verdict: matched
