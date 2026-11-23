# RT-3427 — девять длинных правил помещаются в выдачу проверки правил

Задача RT-3427 эпика RT-3471, запись от 2026-11-23. Прежний адрес: `docs/tasks/RT-3427-long-rules-fit-2/`.

## Просьба владельца

> продолжай RT-3471, эпик (четвёртая часть переделки проверок)

Слово владельца от 21.11.2026; задача — строка 8 плана эпика RT-3471. Карточка #3427 просила
сжать девять правил длиннее 3 000 знаков так, чтобы проверка правил выдавала их одним куском:
горячая часть держит заявление, границу, исключение и признак каждой статьи и таблицу имён,
доводы и примеры уходят в холодную часть целиком.

План одобрен владельцем 22.11 ответом «Одобряю план RT-3427».

## Что сделано

- Горячие части девяти правил сжаты: observability — 4 793 знака, platform-access — 2 674,
  остальные семь — от 2 775 до 3 000. Доводы и примеры стоят слово в слово в холодных частях
  `pitfalls.md`; шесть новых холодных частей пакета внесены в список покрытия.
- Проба проверки правил проходит на всех 43 строках: правка хранилища и компонента кита с
  `window.`, сервиса и входа приёмника с переменными окружения, плана эпика. До задачи — 37.
- task-delivery-loop держит горячими статьи, таблицу имён и пять обязанностей шагов; пятнадцать
  шагов и разделы после PR ушли в холодную часть по плану.

## Что решили и почему

- **observability — до 4 800 знаков.** Таблица имён и 29 заявлений весят около 4 200.
- **Признак пересказа выполнен не целиком.** У observability 9 потерь, у platform-access 1: места
  для них в выдаче нет. Владелец 23.11 выбрал «Отдельной задачей эпика» — RT-3510 делит
  observability на два правила и возвращает потери. Проверка шага 3.2 заменена и закрепляет
  10 потерь у этих двух правил.
- **Признак пробы сужен с 47 строк до 43.** Папка задачи и команды с телом PR и карточки
  отказываются «вместе» при любом размере сжимаемых правил; точка B эпика ими не достигнута,
  находка рядом с планом эпика.
- **Сверка смысла в папке задачи не правилась.** Шаг меряет файл из коммита плана; ошибку в
  регулярке таблицы имён нашёл первый круг, исправленная копия дала 0.

## Чем подтверждено

- `step --done`: 8 шагов из 8 совпали. Проба — 43 «pass»; самая полная строка — кнопка кита,
  9 977 знаков из 10 000.
- Сверка смысла от `bad7711d8` — 0 потерь; исправленная копия с таблицей имён — тоже 0.
- Пять кругов пересказа вслепую и сверки критиком; семь правил без потерь.
- `check-file-size`, `check-doc-paths`, `check:spec-coverage`, `check:descriptions`,
  `agent-kit:check` — без расхождений.
- Два круга ревью тремя ролями; подтверждённые находки исправлены в ветке.

## Потери для RT-3510

Формулировки критика, которые возвращаются в горячую часть:

- **platform-access** — The linter misses it; only a running SSR server shows the failure.
- **observability** — The line is also the lock: a second call on the same record does not leave.
- **observability** — Occurrences go first by limit, then by age; an empty group goes third, only
  if older than an hour.
- **observability** — The limit is a number next to the client, per service.
- **observability** — Three lists, not a map name → state: scrubbing would blank the state.
- **observability** — Sink interface next to the logger, implemented by the failures domain, set
  from outside at startup.
- **observability** — Groups, and under each its occurrences with cause, line fields and bodies.
- **observability** — Linter and throw-side tests miss it; it shows only on the reader's screen.
- **observability** — Framework lines go to the same output and the same selection as ours.
- **observability** — Reading an environment variable demands this rule: add the feature to the
  digest, or production shows it as nonexistent.

## Цена

- Запас до предела 10 000 знаков — от 23 до 52 знаков на самых полных строках; его ничто не
  держит после задачи. Находки — `docs/plans/checks-rework-4-findings-RT-3427.md`.
