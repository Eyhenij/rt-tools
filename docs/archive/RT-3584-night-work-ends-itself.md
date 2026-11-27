# RT-3584 — Судья вопросов пускает вопрос о влитии ветки задачи

Задача RT-3584 эпика RT-3602, запись от 2026-11-27. Прежний адрес: `docs/tasks/RT-3584-night-work-ends-itself/`.

## Шапка разбора

**Behaviour:** unchanged — правятся только текст судьи вопросов и наборы `projects/agent-kit`, `apps/**` и `libs/**` не затронуты; слово владельца: «Судья сейчас, ночь после»
**Задач в разборе:** 1

## The owner request

> Исправляй это прямо сейчас в текущем эпике

Said 24.11 at 07:40 in answer to the analysis `2026-11-24-night-stood-six-hours-on-exit-menu.md`: at night the
session stood 6 h 7 min on the menu of the exit check. The night order of the same owner:

> работай далее без остановок в режиме ночной автономной работы

27.11 the task went to the epic RT-3714 by «RT-3593 и RT-3584 в новый эпик» and came back the same day as task 5
of RT-3602. The menu answers of the owner 27.11: «Сначала RT-3584» — step 2.11 of RT-3594 waits for the fix of the
ask judge; «Вернуть в RT-3602» — the branch stands over the branch of RT-3594; «Судья сейчас, ночь после» — this
task fixes the ask judge, and the night part goes to RT-3721 right after the release of the kit.

## Questions and answers

**Where is the fix made?** In the current epic, now: «Исправляй это прямо сейчас в текущем эпике»; since 27.11 the
epic is RT-3602, the branch over RT-3594: «Вернуть в RT-3602».

**What does this task do?** The ask judge only: «Судья сейчас, ночь после». The night declared in words, the
release of a night with no work and the rule `autonomous-work` go to RT-3721. The menu of 27.11 asked «Как
делим?», and the chosen option said:

> RT-3584 правит только судью вопросов. Потом RT-3594, PR эпика и выпуск кита — примерно 3 часа. Ночь по слову
> и отпуск ночи без работы уходят новой задачей сразу после выпуска; точку B плана эпика правлю под это.

The other option was «Всё в RT-3584 сейчас», with the release moved by 5–7 hours.

## Решения разбора

- **The merge of a task branch named by its key is an approval the owner gives, also when the question names a
  hold of the judge as its cause.** The branch carries its own plan and review; the option only names the merge.
  The item wins over the item of a walk around a check, which pulled the question of 24.11 07:55 the other way.
  The direction `allow` of the two morning questions is the one of the plan of RT-3594, approved by the owner
  27.11.
- **The boundary is the description of the branch.** A hold of this judge on an earlier question is no check — a
  check is a guard, a linter, a test or a threshold of the work — and no refusal of a guard for the item of a
  ready move. A branch that makes a check take another form of the same proof is no weakening while the decision
  is still given by the owner by an action of their own: an approval by a message as well as by a button. Held
  stay: a description that says the branch switches a check off, drops a case of it, lowers its threshold or lets
  a decision count without a part of its proof; an option that appends to the merge an action of its own on a
  check; and a menu whose every option hands the work to the owner after a refusal that named a ready move — the
  merge item wins over the item of a walk around a check only, not over the item of a ready move. Five fixtures of
  scenario SC-AK-2020 expect `block`: the twin of held-4 whose description says the branch switches the check of
  marks off; the twin whose branch lets an approval count without the calls of the roles; the twin whose branch
  counts an approval with no word of the owner; the merge with an appended lift; «Влить RT-101 — солью сам» /
  «Стоп, отложить RT-101» after a refusal that named a ready move. No fixture of a plain merge of the main branch:
  the menu 1939 already holds that merge after a ready move. The expectations of the sixteen earlier pairs stay
  as they are.
- **The verdict is measured on all pairs `ask` of the replay, on the model of the base.** The neighbouring menus
  1939, 1470 and 1914 read the same items. `judge-replay.mjs` gets `--key ask`, 21 pairs; the model stays the one
  the replay takes, the model of the hook on Stop, on which the base of 27.11 and step 2.11 of RT-3594 were taken.
  A flag `--model` measures on the model of background work as well, without changing the default: the holds and
  merge questions of the morning, 18 of 20 over four runs, and the five merges of SC-AK-2020, 19 of 20 over four
  runs.
  Four runs go in parallel inside the check of one step: a call took 10–19 s, 12.3 s on average, so the step
  stays under the limit of 540 s, and a miss of any run turns the step red whole — four marks gathered from
  separate attempts would prove nothing. Each run writes its own file, and the step prints the mismatches. A
  call with no verdict or no answer is repeated by the replay once, with a line `retry`; a wrong verdict is not.
  A wrong verdict first repeats the step without a fix; the text is fixed only when the same pair misses again,
  the package is laid out by `pnpm run agent-kit:sync`, and the step is measured again; after two fixes the owner
  is asked. A second call with no verdict, «the judge did not run» and a step past the limit are
  failures of the call: the step is repeated without a fix, and so is a wrong verdict on the measure before the
  PR when the same text already gave every pair. The progress writes every run.
- **The live judge is not measured by this task.** `--as-hook` serves the pairs `judge` only; the hook of the
  questions reads the record and the progress, the replay only the turns. The hook of the questions names no
  model, so the host runs it on its model of background work; the draft was measured on it once before the plan,
  and the limit is named in the plan.

## What is left unclear

- Nothing.

## Решения по ходу

- 27.11 владелец в меню одобрения: «Завести карточку» — промахи живого судьи вопросов на фоновой модели (1460,
  1911-approval, 1934-product-choice, 2411-morning-roles-after-1) ушли в карточку RT-3729 вне эпика. Её папка
  `docs/tasks/RT-3729-ask-judge-background-model/`, созданная `task:new`, в коммиты этой ветки не входит.
- **Цена:** план прошёл тринадцать кругов ролей, пока проверки шагов не перестали зеленеть на неверной работе.
  Живой судья вопросов на фоновой модели по-прежнему задерживает вопрос утра о влитии примерно в каждом третьем
  запуске: правка меряется на модели судьи хода, а живая модель — карточка RT-3729. Повтор вызова и предел 90 с
  действуют и на пары судьи хода. Граница влития идёт по описанию ветки, которое пишет исполнитель: голое
  «Влить RT-N» после задержки судьи проходит. Набор записанных ходов вырос на 15 строк при бюджете 12.
- **Отменено:** ночная часть задачи — меню ночью при открытом списке к утру и отпуск ночи без работы строкой
  «Работа ночи кончилась». Владелец 27.11 в меню: «Судья сейчас, ночь после»; работа ушла задачей RT-3721 сразу
  после выпуска кита. Отменён и перенос задачи в эпик RT-3714: в тот же день словом «Вернуть в RT-3602».

## Цитаты из разбора и хода работы

- `projects/agent-kit/assets/hooks/ask-judge.md` lets a merge leave as an approval the owner must give and holds an
  option that weakens a check. The question of `2411-morning-held-5.json` — «Влить RT-102 — ветка, где одобрение
  засчитывается и сообщением» or «Отложить RT-101» — fits both readings: on 27.11 the judge held it in 1 and in 2
  of 4 runs, and `judge-replay.mjs --only 2411-` gave 6 of 7 and 11 and 12 of 14.

- **Done:** разбор записан; задача вернулась в эпик RT-3602 пятой задачей словом владельца 27.11 в меню
  «Вернуть в RT-3602»; ветка стоит над веткой RT-3594; план прошёл тринадцать кругов ролей, владелец одобрил его
  27.11: «Одобряю план RT-3584»; план в коммите `e7256bea3`, plan-red — все 31 шаг красные, отметка одобрения
  записана. Оба этапа сделаны, все 31 шаг отмечены; карточки RT-3584, RT-3602 и RT-3721 переписаны на хосте

- Задача взята после слов владельца в меню: «Сначала RT-3584», «Вернуть в RT-3602». Подзадача RT-3584 перенесена
  из карточки RT-3714 в карточку RT-3602, тела обеих карточек правлены; план эпика RT-3714 в его ветке ещё
  называет RT-3584 — правится, когда эпик берут.

- Третий круг: ночь по слову растёт — приказ хвостом длинного сообщения, очередь сообщений, цитата на двух строках,
  а отпуск ночи без работы RT-3587 передала сюда (`docs/archive/RT-3587-night-work-rules.md`, «Списано»). Владелец
  27.11 в меню: «Судья сейчас, ночь после». Задача правит судью вопросов; ночная часть заведена карточкой RT-3721
  вне эпика с этими словами и идёт сразу после выпуска кита. План переписан под одну правку судьи.

- Пятый круг. goal-critic: смена модели прогона меняет замер одобренного шага 2.11 RT-3594 — модель прогона
  остаётся; граница «та же форма доказательства, пока решение даёт владелец своим действием»; задержка судьи — не
  отказ защиты для пункта готового хода. product-strategist: проверка шага 1.4 не зеленеет без `; true`; четыре
  запуска отдельными шагами собираются из разных попыток — один шаг с четырьмя параллельными запусками; четвёртая
  фикстура — ветка засчитывает одобрение без ролей; синхронизация пакета перед повтором; живой хук идёт на модели
  фоновой работы. План переписан (v6), `plan-check` — выход 0, дешёвые проверки шагов сегодня красные.

- Шестой круг. goal-critic: на красном шаг 1.5 не показывает пару и запуск; шум вызова лечился бы правкой текста;
  карточки о модели живого хука нет; заголовок карточки и итог плана эпика не проверяются; шаг 2.9 зеленеет при
  сбое `gh`; журнал ищется одной формой слова. product-strategist: четыре новые фикстуры не мерены; RT-3555
  тянет тот же раздел; строка состава плана эпика и «Next step» RT-3594 устарели. Запись: шаг 1.5 пишет файл на
  запуск и печатает промахи; «вердикта нет» и сверх предела — повтор без правки, после двух правок — владелец;
  шаг 1.6 — проверка 2.11 RT-3594; проверки заголовка, итога эпика и тела карточки переписаны. Проверка плана по
  ветке (находка 5 product-strategist) снята: папка задачи лежит в её ветке, нажимает владелец.

- Седьмой круг. goal-critic: шаг 1.5 зеленеет правкой ожиданий, а не текста; карточка эпика RT-3602 обещает ночь;
  перемерка перед PR лечилась бы правкой; старая строка `limit RT-3584` не проверяется; нет фикстуры ветки без
  действия владельца. product-strategist: ворота держатся на 94 вердиктах подряд, а движок перемеряет шаг сам —
  повтор вызова без вердикта внутри прогона; `plan-red` гонял бы шаги модели до работы — быстрое красное условие;
  шаг 1.6 повторяет пары шага 1.5 — снят; карточка RT-3721 ссылается на исчезающие тексты. Запись в план v8:
  шаг «прежние ожидания не тронуты», пятая фикстура, повтор вызова с `retry` и его шаг, быстрое красное у шага
  запусков, карточки RT-3602 и RT-3721 в этапе 2, правило перемерки перед PR, текст меню 27.11 в разборе.

- Девятый круг. goal-critic: в окружении движка (`LANG` пуст, `grep` в локали C) шаблон `суд[а-я]* вопросов`
  не находит «судьи вопросов» — проверено, 0 против 1 у `суд(ья|ьи|ью|ьёй) вопросов`; шаг на модели фоновой
  работы зеленел без довода `--model`; шаг «не повторяет неверный» зеленел при тихом повторе; повтор спорит со
  спеком SC-AK-1941, а спека шага нет в следе; у предела 90 с нет проверки; отпечаток фикстур ломал форматтер.
  product-strategist: удержания на модели фоновой работы не мерены шагом; ветки RT-3594 нет на хосте; карточка
  эпика называет старый состав, план эпика отдаёт ночное меню списанной RT-3587. Запись в план v10: шаблоны слов
  с окончаниями, шаг подставного `claude` с доводами и пределом 90 с, точная строка `mismatch`, шаг пяти влитий
  на модели фоновой работы, граница повтора в Bounds, спек шага в следе и его шаг, отпечаток фикстур по
  содержимому JSON `82be2681…0f47`, предел повторов при сбое вызова, отправка RT-3594 с `--no-pr`, состав
  карточки эпика и строка плана эпика о ночном меню.

- Одиннадцатый круг, блокеров нет. goal-critic: предел 90 с на настоящем вызове не доказан; запрет ночи в карточке
  эпика краснел на верной строке и пропускал абзац «Ночью она задаёт меню»; спек SC-AK-1941 мог сохранить «code 0
  and nothing»; «ровно один повтор» не мерен для ответа без вердикта; разбор говорил о мере утра иначе, чем план.
  product-strategist: G достижима; нынешний текст на `haiku`, held-1…5 четыре запуска — 15 из 20 (промахи
  held-4 и held-5), так что порог 18 отличает правку; итог перемерки перед выпуском некуда записать. Запись в план
  v12: шаг 1.9 с подставным `claude`, который спит 95 с на первом вызове, ждёт два вызова; запрет карточки эпика
  по строкам без RT-3721 и по номеру в списке — проверен на верной и неверной карточке критика, 0 и 1; два
  отрицания в шаге спека; шаг 1.15; `retry` в stderr; итог перемерки перед выпуском — в план эпика.

- Слово владельца 27.11: «я вмержил изменения в main, подтяни себе локально и в главное дерево и вмержи в свои
  рабочие ветки». Главная копия перемотана на `b615b17c7` (выпуск 0.42.0), её местная строка таблицы назначений
  (rt-tools — RT-3694) сохранена. Ветка эпика: `b7ffac6ea` — main влита, в конфликтах разложенных файлов
  разошлись только строки заголовка. Ветка RT-3594: `e64c31512` — эпик влит, журнал сшит, `[Unreleased]` над
  0.42.0; `ee4f7838f` — раскладка 0.42.0 заново, `agent-kit:check` сходится. Ветка RT-3584: `562d7bb9f`. Папка
  задачи вернулась из отложенной записи, сверена с копией в `~/.cache/rt-draft-3611/`. Ветки на хост не
  отправлены: RT-3594 уходит с `--no-pr` до набора этой ветки, эпик получает слияние через PR цепочки.

- Тринадцатый круг, обе роли: блокеров нет. Правки по находкам:
  - 2.11 — шаблон ночи `(Н|н)оч` и отдельный запрет ночи в строке RT-3584 до первой точки (образцы w2, w5, w6
    зеленели);
  - 2.10 — запрет «не останавливает работу меню» в строках без RT-3721;
  - 2.14 — запрет пары «code 0 and nothing» и строки Then «stops on the first call» без once/second вместо одной
    фразы, которая краснела на верном спеке;
  - 2.6 — запрет «Эпик кончается задачей RT-3584»;
  - перемерка судьи перед выпуском — без условия `git diff --quiet` (оно ничего не различало): строку несёт план
    эпика, её держит новый шаг 2.16;
  - в разборе признак пяти влитий — 19 из 20, как в плане.

  Прогон в bash без LANG: 2.6 и 2.16 сегодня выход 1; 2.14 на нынешнем спеке выход 1, на верных образцах 0; 2.10 и
  2.11 — верные карточки 0, неверные 1.

- Второй круг (qa-engineer, goal-critic, product-strategist): блокеров нет. Исправлено:
  - qa 1, средняя: запись первого круга «флаг без значения — код 1» была неверной: флаг молча терял фильтр, и
    `--key --model haiku` давал 49 вызовов модели вместо отказа. Теперь флаг без значения — отказ с кодом 1 до
    вызовов; случай в наборе;
  - qa 2: случай пустого набора проверяет и строку `judge replay: 0 of 0 match`, не только код;
  - qa 3: SC-AK-2020 и SC-AK-1941 несут `Coverage: partial` с тем, что меряется вручную;
  - qa 4: строка `has` проверяет и «also only records the decision»; «this judge itself is one» стоит через
    перенос строки, `has` её не читает — списано;
  - qa 6: журнал называет повтор вызова за пределом и код 1 без пар и без значения флага;
  - goal-critic 1: точка B плана эпика говорит, что вердикт верен на модели судьи хода, а живой судья на фоновой
    модели ещё задерживает `held-4` — карточка RT-3729;
  - goal-critic 2 и 3: заголовок RT-3714 — «Меню застревания кнопками»; заголовок RT-3729 называет вопрос утра о
    влитии, строка слова владельца отнесена к четырём старым парам.

  Списано: qa 5 (после правки судья — проверка, и вопрос о влитии после задержки может читаться как обход) —
  пункт влития сильнее пункта обхода, перемерка дала 84 из 84; goal-critic 4 — строка RT-3721 в «Next step»
  RT-3594 пишется в той ветке вместе с тремя строками решений.

## Одобрение плана

«Одобряю план RT-3584»

## Чем подтверждено

- Путь ревью: `node tools/review-path.mjs --base RT-3594-wait-owner-scenario-release` — «путь: полный» (правятся защиты правил). Второй круг: `--round-two --serious 1` — «нужен».
- Первый круг (qa-engineer, goal-critic, product-strategist):
  - главная находка — тест SC-AK-2020 ничего не проверял: bash 3.2 раскрывал фигурные скобки;
  - прогон без пар выходил с кодом 0;
  - фраза о задержке судьи читалась как лазейка для ветки, ослабляющей самого судью;
  - промах `held-4` на фоновой модели не был записан.

  Всё исправлено коммитом «…после первого круга ревью».
- Второй круг: блокеров нет. Флаг без значения терял фильтр молча — теперь отказ с кодом 1. Добавлены `Coverage: partial` в спеках, оговорка в точке B, заголовки #3714 и #3729. Исправлено коммитом «…после второго круга ревью».
- Замер после правок: `--key ask` — 21, 21, 21, 21 из 21 (84 из 84), `retry` 0, 0, 1, 0. На `--model haiku`: задержки и вопросы о влитии утра — 20 из 20, пять влитий SC-AK-2020 — 20 из 20.
- Замеры ролей на фоновой модели в первом круге: `held-1…5` — 17 из 20 и 18 из 20. `held-4` задерживается примерно в каждом третьем запуске; это записано в #3729.
- Набор записанных ходов — 169 ok, 0 провалов; набор дня — 8 ok, `limit RT-3721`; `check-specs`, `check-doc-paths`, `agent-kit:check` — выход 0; набор перед отправкой зелёный.

## Оставшийся шаг

После влития этого PR в ветку RT-3594 в ней запускается `node tools/task-flow-script.mjs step 2`: он должен отметить шаг 2.11. В тот же ход в ход работы RT-3594 ложатся три строки решений и «Next step» с RT-3721 после выпуска. Дальше — этап 3 RT-3594, PR стопки в ветку эпика, PR эпика в `main`: его вливает владелец кнопкой. Последний шаг — выпуск патча кита с перемеркой `--key ask` на главной ветке.
