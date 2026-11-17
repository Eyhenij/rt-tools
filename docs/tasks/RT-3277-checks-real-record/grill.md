# Grill

## The owner request

Текст задачи #3277:

> ## Что не так
>
> Проверки тестируются только на придуманных заготовках. 13.11.2026 набор проверки конца эпика был
> зелёный, а на настоящей записи разговора она отказывала на согласии владельца. После починки
> набор снова был зелёный, а запуск на настоящей записи показал восемь ложных пропусков из двадцати
> трёх. Правка аудита очереди прошла тесты и упала на настоящем хостинге из-за прав токена.
>
> ## Что сделать
>
> Для каждой проверки, которая читает разговор или хостинг, завести запуск на сохранённых настоящих
> данных: запись разговора с вырезанными личными данными и ответы хостинга под токеном машинной
> учётной записи. Запуск стоит в наборе пакета. Новая проверка без такого запуска не принимается.
>
> ## Как поймём, что готово
>
> - Запуск на сохранённой записи от 13.11.2026 стоит в наборе пакета и зелёный.
> - Аудит очереди проверяется ответами хостинга под токеном машинной учётной записи.
> - Проверка пакета отказывает проверке, у которой такого запуска нет.

Задача эпика RT-3302, пятая по его плану. Эпик идёт по слову владельца «делай эпик дальше».

## What the tree already has

- The conversation record is read in one place, `rt_fact_transcript` and its helpers in
  `projects/agent-kit/assets/hooks/facts.sh`; about 21 of 89 hooks reach it, 12 of them by name.
  The checks `task-flow-script.mjs` and `owner-nudges.mjs` read it too.
- The hosting is read by the work queue audit `check-board` with the `board-*` modules, by
  `task-new`, `check-kit-approval`, `check-hooks` and by the delivery hooks. The machine token is
  passed in `board-gh` by `botToken()`.
- Suites fake the host by a bash `gh` stub from `tests/lib-board.sh` (13 suites) and build records
  inline (18 suites). The closest to a saved record is `tests/fixtures/turn-replay/`: synthetic by
  design, labels instead of text. No saved hosting answers, no redaction tool.
- The record of 13.11.2026 is most likely session `f2c03ded…` (15.5 MB, last written 14.11); no
  content read yet.
- Since 13.11 the conversation checks that read consent by words were removed or handed to a model
  (RT-3271, RT-3276): the check named in the request no longer exists in that form.
- A meta-suite that judges every hook file already exists: `tests/hooks-kind.test.sh`.

## Questions and answers

**Что сохранять из настоящей записи разговора от 13.11?** Варианты: «Только поля проверок
(Recommended)» — кусок вокруг конца эпика, только то, что читают проверки, текст заменён; «Полный
текст с заменами».
Ответ: «Только поля проверок (Recommended)».

**Как проверять аудит очереди ответами хостинга?** Варианты: «Записать и проигрывать
(Recommended)» — ответы сняты один раз под токеном машинной учётки, набор проигрывает их
заглушкой; «Живой запрос в наборе».
Ответ: «Записать и проигрывать (Recommended)».

**Где отказывать проверке без запуска на настоящих данных?** Варианты: «В наборе вида хуков
(Recommended)»; «Колонка в покрытии таблицы».
Ответ: «В наборе вида хуков (Recommended)».

## Decisions

The three answers took the recommended option.

- **Behaviour of the application: unchanged.** The edit touches the rules package, its suites and
  fixtures, no `apps/**` or `libs/**`.

**Behaviour:** unchanged — the work adds suites on saved real data and a check that demands them; no
application code is touched.
- **The saved record keeps the fields the checks read.** Roles, times, call names, menu answers,
  exit codes; the text of the conversation is replaced. A redaction script cuts it from the session
  record and is kept with the fixtures, so the cut can be repeated.
- **Hosting answers are recorded once under the machine token and replayed by a stub.** The stub
  of `tests/lib-board.sh` gains a mode that answers from the recorded files.
- **The demand lives in `tests/hooks-kind.test.sh`.** A hook or check that reads the record or the
  hosting must be named by a suite on saved data.

## What is left unclear

- Which checks still read consent or the conversation in the form named in the request after
  RT-3271 and RT-3276: the plan measures it over the hooks, not asked.
