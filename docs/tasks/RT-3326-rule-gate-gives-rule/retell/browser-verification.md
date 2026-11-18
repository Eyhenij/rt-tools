# browser-verification — the retelling

Under each round stand its cases, given to a reader who saw only the hot part, and then the
reply of `goal-critic` verbatim.

## Round 1 — the hot part of 2 996 bytes

**Cases.**

Case 1. You need to check an admin screen. Port 4200 already answers. You don't know who started it or from which branch. Your own branch is behind its base by three commits. The screen needs sign-in. What do you do before the first request, how do you sign in, and from which branch is the stand you show the owner built?

Case 2. The browser profile choice call was made an hour ago; now the select call is refused because the pinned profile is not among the connected ones. The helper that prints the profile returned empty output earlier. A colleague suggests launching Chrome with `open -a` or a Playwright script instead. What do you do?

Case 3. You changed a navigation row from four items to eight and replaced a label inside a shared layout frame used by six pages. The labels come from a CMS and can be long. How do you confirm the edit before showing the owner, and what counts as confirmation?

Case 4. You carried over the look of a sample site to your own screen. Tests, build and linters are green. The screen's data never exists in the development database. This measurement will need to be repeated after future edits. How do you accept the work?

**The critic.**

**Смысл частично потерян: в трёх случаях из четырёх читатель горячей части поступает не так, как поступил бы читатель прежнего текста.** Требование «до 3000 знаков» выполнено: `wc -c .claude/skills/browser-verification/SKILL.md` → 2996. Требование «смысл не теряется» не выполнено. Всё выпавшее лежит в `pitfalls.md` дословно, но горячая часть на него не указывает, кроме общей строки «Cold part: `pitfalls.md`». Читателю, который видит только горячую часть, оно недоступно.

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `SKILL.md`: 2996 байт | да |
| «убедись что смысл при этом не теряется» — случай 1 (порт занят чужой сборкой, вход) | Читатель не знает, что чужой процесс оставляют в покое, а стенд поднимают на свободном порту. Он прямо спрашивает, «how to free 4200». Не знает и того, что показывают продакшн-сборку. | нет |
| то же — случай 2 (профиль отказан, пустой вывод помощника, `open -a` / Playwright) | Совпадает с прежним текстом: повторить выбор, остановиться, назвать владельцу, обходы отвергнуть. | да |
| то же — случай 3 (ряд 4→8, общий каркас на 6 страниц) | Совпадает почти целиком. Выпало, что перед push запускается набор, который обходит экраны, и что список экранов берут из каркаса. | частично |
| то же — случай 4 (перенос вида образца, данных нет в БД разработки) | Выпало, что каждый переделанный экран показывают владельцу. Пропал и сам приём (разметку вставляют в открытый экран с его scope-атрибутом), поэтому источник данных читатель оставил открытым. | нет |

**Расхождения по случаям**

1. **Случай 1, стенд на свободном порту.** Прежний текст (`bv-former.md`:42): «Yes, built from another branch → It is left alone, and the stand is raised on a free port». Строки 71–72: «otherwise the stand is raised on a free port». Строки 208–213: при отказе остановить процесс — «a free port for the new stand, and the list of what was left is named to the owner at the end of the session». В горячей части осталось только «used only if built from this edit's branch; a duplicate stops by process id». Прежний текст этот пробел закрывал, а читатель решил его неверно: он ищет, как освободить 4200, то есть готов остановить чужой стенд.
2. **Случай 1, продакшн или dev-сервер.** Прежний текст (`bv-former.md`:20): «the place where the user sees it | the production build behind the tree's real proxy, not the dev server». Строка 190 добавляет образец `browser-verification-stand` — «a stand from the production build». Читатель назвал этот вопрос открытым, хотя прежний текст на него отвечал. Стенд для владельца может оказаться dev-сервером.
3. **Случай 3, набор перед push.** Прежний текст (`bv-former.md`:138–139): «The list of screens is read from what the frame shows, not from the page the task named, and the suite that walks them runs before the push». Читатель измеряет шесть страниц вручную и спрашивает, нужен ли e2e. Требование запустить набор пропущено.
4. **Случай 4, показ владельцу.** Прежний текст (`bv-former.md`:173–174): «Every remade screen is looked at by the executor and shown to the owner». В горячей части осталось только «Every remade screen opened». Читатель показ владельцу каждого экрана не назвал.
5. **Случай 4, приём с реальными стилями.** Прежний текст (`bv-former.md`:151–155): «The markup is inserted into an already open screen with its own scope attribute… only the row content is invented. A workaround would be measuring another screen». Читатель пишет «where the missing data comes from (seed, fixture, or stub)» — открыто то, что прежний текст закрывал. Сид или заглушка — другое действие.

Не считаю расхождением:
- Случай 2: смешение пустого вывода помощника с «нет файла профиля». Отказ выбора по закреплённому профилю означает, что файл есть. Прежний текст сам ограничивает исключение отсутствием файла (`bv-former.md`:271–272), и итоговое действие читателя совпадает.
- Пороги и пиксели «both sides» в случае 3 и «measure set not written before» в случае 4: прежний текст их тоже оставляет открытыми.

**Что сузилось или выпало (случаи этого не проверяли)**
- Кто поднимает стенд. Если владелец, ему говорят сразу, и проверка ждёт его стенда, потому что проверка не пускает агента (`bv-former.md`:46, 68).
- Объяснение кешем — не подтверждение: кеш очищают и измеряют заново (`bv-former.md`:57–59, 224–227).
- Подменённый ответ входа — запасной путь, только где рядом со стендом нет службы входа (`bv-former.md`:95–96).
- Чем измерять: `getComputedStyle`, `getBoundingClientRect`, контраст, совпадение центров (`bv-former.md`:21).
- Признак проверки организации: три заголовка на одном стенде и ожидаемый ответ на каждый (`bv-former.md`:126–127).
- Признак служебного визита пишут один раз на профиль, а не на каждый адрес (`bv-former.md`:148–149).
- Драйвер остаётся для незнакомого экрана. Вывод «нечем измерить» за закрытым входом — неверный инструмент (`bv-former.md`:161–163).
- Отметки из «Pitfalls»: `lsof` по PID каждого процесса, три пути запуска сервера, признак берут из вопроса владельца, `403` — не диагноз настройки, прежнее поведение читают через `git show` (`bv-former.md`:196–267).

Не добавлено ничего, о чём не просили.

**Самый короткий шаг на каждый промах**
1. Расхождение 1: в утверждение о порте дописать «otherwise left alone; the stand goes on a free port».
2. Расхождение 2: в утверждение «What a person is shown is built from the work's branch» дописать «a production build, not the dev server».
3. Расхождение 3: «Before the push» заменить на «screens read from the frame; their suite runs before the push».
4. Расхождение 4: «Every remade screen opened» заменить на «every remade screen opened and shown to the owner».
5. Расхождение 5: в утверждение о реальных стилях дописать «markup inserted into the open screen under its scope attribute».
6. Выпавшие утверждения о кеше и о стенде владельца — по короткому хвосту. Чтобы уложиться в 3000 байт, можно сжать хвосты «This tree».

После правки нужен повторный прогон читателя только по горячей части на тех же четырёх случаях.

**Источники**
- Горячая часть: `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/browser-verification/SKILL.md`, 2996 байт по `wc -c`.
- Прежний текст: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/bv-former.md`, строки указаны выше.
- Решения читателя: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/bv-decisions1.md`.
- Холодная часть: `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/browser-verification/pitfalls.md`. `grep` показал, что все пять выпавших мест там дословно, на строках 19, 41, 45, 95, 138, 151, 174.

**Гипотезы для проверки**
- `implementation.md` рядом с правилом может называть, кто поднимает стенд, и пороги макета. Это снимет часть выпавшего, но только если горячая часть на него укажет. Проверить: прочитать его и найти ссылку на него в `SKILL.md`.
- Читатель с одной горячей частью, вероятно, не откроет `pitfalls.md` сам, потому что строка «Cold part» не говорит, когда его читать. Проверить: прогнать того же читателя с разрешением открывать файлы и посмотреть, откроет ли он `pitfalls.md` в случае 1.

Verdict (round 1): diverged

## Round 2 — the hot part of 2 995 bytes

**Cases.**

Case 1. You need to check an admin screen. Port 4200 already answers. You don't know who started it or from which branch. Your own branch is behind its base by three commits. The screen needs sign-in. What do you do before the first request, how do you sign in, and from which branch and what kind of build is the stand you show the owner?

Case 2. The browser profile choice call was made an hour ago; now the select call is refused because the pinned profile is not among the connected ones. The helper that prints the profile returned empty output earlier. A colleague suggests launching Chrome with `open -a` or a Playwright script instead. What do you do?

Case 3. You changed a navigation row from four items to eight and replaced a label inside a shared layout frame used by six pages. The labels come from a CMS and can be long. How do you confirm the edit before showing the owner, and what counts as confirmation?

Case 4. You carried over the look of a sample site to your own screen. Tests, build and linters are green. The screen's data never exists in the development database. This measurement will need to be repeated after future edits. How do you accept the work?

**The critic.**

Итог: цель выполнена. Ни в одном из четырёх случаев действие читателя горячей части не расходится с действием читателя прежнего текста. В горячей части остались три мелкие потери, и ни одна не меняла решения в этих случаях.

| Слова владельца / случай | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -c` SKILL.md даёт 2 995 байт, как заявлено. Повторно я не замерял, это гипотеза, проверка ниже | да (по заявлению) |
| «смысл при этом не теряется». Случай 1: порт 4200, отставшая ветка, вход | Прежний текст требует: выяснить, кто отвечает на порту (bv-former.md:66-72, схема :37-46). Чужую ветку не трогать, стенд на свободный порт. Свои остатки снимать по номеру процесса. Влить конец базы (:141-144). Входить через форму засеянной учётной записью, человека о шаге не просить (:94-98). Показывать сборку из ветки работы и называть ветку (:131-136). Прод-сборку требуют таблица (:20) и SKILL.md. Стенд поднимает агент (implementation.md:44). Читатель делает то же самое | да |
| Случай 2: выбор профиля отказан, хелпер пуст, предлагают `open -a`/Playwright | Прежний текст: выбор повторить (:80-81). Отказ останавливает работу с браузером и называется владельцу (:82-86). Профиль не выбирать и не спрашивать (:87-88). Пустой вывод означает остановку (:89-93). `open` и скрипт запрещены (:73-79). Исключение дерева действует только без файла профиля (:271-281). Читатель делает то же и исключение отводит верно | да |
| Случай 3: строка навигации 4→8, общий каркас на шесть страниц, длинные метки из CMS | Прежний текст: это правка вёрстки, замер ширины на каждом пороге с обеих сторон (:103-110). Самое длинное значение во все узлы строки (:111-117). Все экраны под каркасом по списку из каркаса, набор до push (:137-140). Число, а не взгляд (:180). Замер до показа (:165-170). Читатель делает то же самое | да |
| Случай 4: перенос вида с образца, данных в dev-базе нет, замер повторяемый | Прежний текст: кадр своего экрана рядом с кадром образца, каждый переделанный экран открыть и показать (:172-178). Разметку вставить в открытый экран с его атрибутом области (:151-155). Повторяемый замер оформить e2e-тестом (:157-163). Зелёная сборка ничего не доказывает (:173-174). Читатель делает то же самое | да |

**Разрывы, которые назвал читатель, против прежнего текста**
- Случай 1, «как узнать, кто отвечает на порту». Прежний текст отвечал `lsof` (:196). Теперь это в холодной части (pitfalls.md), действие читателя от этого не меняется.
- Случай 1, «свой процесс со старого коммита». Схема прежнего текста закрывала это развилкой «построен из этой ветки → использовать, остаток прошлого запуска → снять по номеру процесса» (:41-43, 70-72). Читатель решения не принял, но и неверного не принял. К тому же ветку он и так обновляет и пересобирает. Расхождением это не считаю.
- Случай 3, «как задавать пороги и что делать, если не влезает». Прежний текст тоже этого не закрывает: пороги лежат в шаблоне `browser-verification-measure`.
- Случай 4, «набор мер не записан до правки». Прежний текст тоже не говорит, что делать в этом случае.

**Что горячая часть по-прежнему опускает**
1. «The answering instance is used only when it is built from the branch of this edit» (:70-71). В горячей части есть только «another branch's is left alone». Что работающий экземпляр из своей ветки надо использовать, а не поднимать заново, из неё не следует.
2. «A substituted sign-in answer is the fallback where no sign-in service runs next to the stand» (:95-96). Без этого читатель, у которого рядом со стендом нет службы входа, остаётся без хода.
3. «the set is taken from what the work is accepted by» (:177-178). В горячей части осталось только «written before the edit». Требование брать набор мер из критериев приёмки, а не собирать его автору под свою правку, пропало.

**Самый короткий шаг на каждую потерю**
1. В хвост первой статьи дописать: «one from this branch is used».
2. В хвост статьи о входе дописать: «a substituted answer only where no sign-in service runs».
3. В последней статье заменить «the measure set written before the edit» на «the measure set taken from the acceptance and written before the edit».

Нужно около 60–80 байт, в 3 000 это может не влезть. Тогда пункт 2 можно оставить в pitfalls.md: он касается редкой обстановки.

**Источники**
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/bv-former.md (строки указаны выше)
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/bv-decisions2.md
- /Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/browser-verification/SKILL.md
- /Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/browser-verification/implementation.md:44 (стенды поднимает агент), :50 (исключение дерева)
- /Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/browser-verification/pitfalls.md (там есть схема и статьи прежнего текста)

**Гипотезы для проверки**
- Размер 2 995 байт я не измерял. Проверка: `wc -c /Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/browser-verification/SKILL.md`.
- Что pitfalls.md переносит раздел «Pitfalls» и раздел дерева дословно, я сверил только выборочно по строкам статей. Проверка: построчный diff нужных разделов bv-former.md и pitfalls.md.

After this verdict two of the three soft losses it named came back at their articles: an answering instance built from this branch is used, and the measure set is taken from what the work is accepted by. The third, the substituted sign-in answer, stays in the cold part, as the critic allowed. The hot part is 3 000 bytes, and the meaning check finds nothing of the former text missing.

Verdict: matched
