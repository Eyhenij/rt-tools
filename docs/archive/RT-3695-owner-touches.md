# RT-3695 — Обращения к владельцу посчитаны, предложение по их сокращению готово

Задача RT-3695 эпика RT-3693, запись от 2026-11-26. Прежний адрес: `docs/tasks/RT-3695-owner-touches/`.

## The owner request

> Заведи новый эпик и задача в нем. Мне нужно, чтобы ты ускорил рабочий процесс. Изучи досконально
> task flow и вынеси в предложение, что можно уменьшить по ресурсам и времени, какие шаги, либо что
> можно вообще пропустить. Например, какие-то подтверждения плана, либо еще что-то. Свести несколько
> подтверждений в одно со стороны человека, либо еще как-то другими способами ускорить процесс
> разработки и уменьшить количество обращений к человеку. Ты можешь внести в качестве метрики именно
> количество обращений к человеку. Оно должно свестись к минимуму. Это цель эпика, и бери этот эпик в
> работу, в это дерево.

## Questions and answers

No question went to the owner: the request answers the six, and each is closed below by assumption.

- **Does the task change the application's behaviour** — closed by assumption: no, the subject is the
  work process; the task writes a proposal and changes no code.
- **Does it need an edit of a law or a rule** — closed by assumption: not in this task. The proposals
  will edit laws and rules, and each is an owner's decision in the proposal.
- **One task or several** — closed by the request: «новый эпик и задача в нем». The epic's further
  tasks are the proposals the owner approves.
- **What is not part of the task** — closed by assumption: implementing the proposals.
- **What will show that the task is closed** — closed by the request: a proposal whose metric is the
  number of contacts with the owner, measured before the start, with the expected drop for each
  measure.
- **Is there a sample** — closed by exploration: the plan `docs/plans/delivery-speed.md`.

## Решения разбора

- **The metric of the epic is contacts with the owner per task** — the owner named it. Counted from the
  session journals: every question window, every answer to it and every message the owner typed.
  Rejected: active minutes alone — RT-3624 already moved them, and they do not show the owner's load.
- **The proposal is the plan of the epic, and the owner decides it in one window** — fewer contacts is
  the goal itself.

## What is left unclear

- Which proposals the owner approves: the window after the proposal.

## Решения по ходу

- **Одобрение плана и выбор предложений идут одним окном** — цель эпика сама требует меньше обращений;
  предложение показано владельцу в чате до окна. Affected stage of the plan: 1.
- **Команда измерения получила границу по времени, 26.11 11:00 UTC** — без неё она на ходу этой сессии
  дала 38 задач и 293 обращения вместо 36 и 277: записанный ответ поплыл бы. Affected stage of the plan: 1.

- **Цена:** два окна владельцу вместо одного — первое он закрыл сообщением о сломанном выпуске; окно с
  П6 судья вопросов вернул. Первое измерение вышло с повторами строк и ушло бы в веху завышенным на
  10%, его поймал `qa-engineer`.
- **Отменено:** цепочка веток задач — заменена ветками от ветки эпика по одной; карточка RT-3702 —
  заменена RT-3217; прогноз «1–2 обращения» — заменён «около 3».

## Live check

- Команда измерения из плана эпика с границей: `{"tasks":36,"total":277,"median":5}`; разбивка той же
  границей: окна 93, между ходами 103, во время хода 81, окна разрешений 44, вызовов окна 140.
- Карточки RT-3696–RT-3702: у всех семи тело называет «Задача эпика #3693».
- После первого круга ревью, без повторов строк: `{"tasks":36,"total":250,"median":5}`; окна 93, между
  ходами 103, во время хода 54, окна разрешений 37, прерывания 44, вызовов окна 140.

## Первый круг ревью

`qa-engineer` и `goal-critic` по разнице ветки. Исправлено в плане эпика одним коммитом:

- повторы строк в наблюдениях завышали измерение: 277 → 250, «во время хода» 81 → 54; команда считает
  строку один раз, карточка RT-3696 приняла 250 и починку записи повторов;
- П5 опирался на 44 окна разрешений, а это другие окна и вне медианы: теперь 37 по хукам, окно PR кита
  названо ненаблюдаемым, карточка RT-3697 правлена;
- прогноз «1–2 вместо 5» не опирался на числа: теперь «около 3», остаток — набранные сообщения;
- у вехи G не было числа и окна измерения: медиана не больше 3 и окон разрешений не больше 5 за шесть
  дней после слияния эпика, на этой машине — наблюдения вне истории;
- нет раздела о времени и ресурсах: добавлен «Время и ресурсы до начала», и перечень 22 мест таблицей;
- П7 повторял открытую RT-3217 эпика RT-3190: RT-3702 закрыта повтором, П7 ведёт RT-3217;
- цепочка веток не подходила под слово закона о слиянии в ветку эпика: ветки задач берутся от ветки эпика
  по одной, П3 вторым;
- таблицы плана эпика выровнены форматтером.

Списано: определение метрики в разборе называет и сами окна, план считает ответы — разбор после коммита
плана не правится, расхождение названо в плане эпика; проверки шагов плана задачи читают заголовки, а не
содержание — план не правится, содержание прочитано ролями; П6 снял судья вопросов, а не владелец — это
открыто записано в плане эпика.

## Цитаты из разбора и хода работы

- The epic RT-3624 «Простая правка доходит до слияния за полчаса», plan `docs/plans/delivery-speed.md`,
  is closed and merged into main on 26.11 (commit 107186a17). It measured active minutes per task and
  shipped the light path, the second round by risk, `--single`, the snapshots of touched stories and the
  command `pnpm run session:time`. It measured no contact with the owner: that metric is new.

- The pattern `task-flow-start` already closes the remaining grill questions by assumption after two
  «recommended» answers in a row; the rule `task-flow-owner` lets the owner be asked only for decisions
  and approvals.

- Ветки дерева почищены (11 влитых), борд: расхождений 67 → 54. Второе окно: «Одобряю план RT-3695
  (Recommended)», все семь предложений.

## Одобрение плана

«Одобряю план RT-3695 (Recommended)»

## Чем подтверждено

- Один круг ревью, `qa-engineer` и `goal-critic`: путь лёгкий (`node tools/review-path.mjs`). Правки круга — один коммит «…после первого круга ревью (RT-3695)»: повторы строк в наблюдениях (277 → 250), окна П5 (44 → 37 по хукам), прогноз и веха с числом, П7 на RT-3217, ветки задач от ветки эпика по одной.
- Списано с причиной: разбор называет метрикой и сами окна — разбор после коммита плана не правится, расхождение названо в плане эпика; П6 снял судья вопросов, это записано открыто.
- Набор перед отправкой — зелёный перед этим PR.

## Оставшийся шаг

Слияние в ветку эпика RT-3693, затем RT-3696 — команда измерения.
