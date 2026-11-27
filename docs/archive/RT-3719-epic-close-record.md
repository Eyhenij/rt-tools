# RT-3719 — Итоги эпика RT-3693: веха не достигнута, четыре задачи перенесены в эпик RT-3720

Задача RT-3719 эпика RT-3693, запись от 2026-11-27. Прежний адрес: `docs/tasks/RT-3719-epic-close-record/`.

## Шапка разбора

**Behaviour:** unchanged — правятся только план эпика и файл его находок, код и правила не трогаются

## The owner request

The owner's words of 27.11 in a window, verbatim:

> Закрыть эпик как есть

The option said: the epic goes to the owner for the merge into the main branch with the three done
tasks and the records of the deferred ones; the milestone «не больше 2 обращений на задачу» is
written as not reached; the owner merges by the button.

Before it, three words of the owner the same day, each in a window: «Отложить RT-3698
(Recommended)», «Отложить RT-3699 (Recommended)», «Отложить RT-3700, собрать отчёт (Recommended)»;
and earlier «отложить RT-3697».

## Questions and answers

No question was put: the owner's window answers above decide the work.

## Решения разбора

- **The epic plan names RT-3701 «влита» and RT-3697–RT-3700 «отложено», and the milestone as not
  reached with its reason.** — the owner's words. Rejected: merging the deferred task branches — they
  carry unapproved or unfinished work.
- **The findings file takes the four sections of the deferred tasks from their branches.** — they
  are the report the owner asked for. Rejected: a new report file — the findings file already is it.
- **The deferred cards go back to the backlog.** — the work waits for the owner's word, not for an
  executor.

## What is left unclear

- **The row of RT-3217** stands «вне эпика»; the end measurer may still ask its tip. Checked at the
  end of the stages by `node tools/task-flow-script.mjs measure`.

## Решения по ходу

- **Проверка шага 1.1 заменена:** `grep -c 'перенесены в эпик RT-3720' docs/plans/owner-touches.md` → = 1
  Причина: после одобрения плана владелец набрал «Вынеси эти задачи в отдельный эпик, но не начинай его»:
  RT-3697–RT-3700 не отложены в этом эпике, а ушли в эпик RT-3720, и план эпика RT-3693 называет
  перенос вместо отметок «отложено». Затронут этап 1.
- **Проверка шага 1.2 заменена:** `grep -c 'RT-3701 .*| влито' docs/plans/owner-touches.md` → = 1
  Причина: первый круг ревью нашёл, что разбор плана эпика засчитывает влитую задачу только словом
  «влито»; «влита» в строках 1–3 держала конец эпика. Затронут этап 1.
- **Первый круг ревью: две роли, серьёзных находок 1.** Строка RT-3217 «вне эпика» держала конец
  эпика — она ушла из таблицы в текст; «влита» заменена на «влито»; числа итога взяты из команды
  измерения с окном дат; абзац о ветках переписан в прошедшем; файл находок называет перенос в
  RT-3720; RT-3697 возвращена в очередь на доске. Не правлено: ветки RT-3697–RT-3699 лежат только на
  машине — их отправка относится к старту эпика RT-3720.
- **Проверка вживую — числа по тексту плана эпика.** `node tools/task-flow-script.mjs measure`
  читает план эпика: строк состава 4, из них влитых 3, в работе 1 (эта задача);
  `node tools/check-doc-paths.mjs` — без расхождений; на доске подзадачи RT-3693 — 3695, 3696, 3701,
  3702, 3719, подзадачи RT-3720 — 3697, 3698, 3699, 3700.
- **Цена:** эпик RT-3720 заведён второй копией: отправка черновика из временного клона упала на двух
  локальных папках, которых нет в чистой копии; ветку пришлось переключать с заменой черновика по
  слову владельца.
- **Отменено:** решение разбора «план эпика называет RT-3697–RT-3700 отложенными» — заменено переносом
  в эпик RT-3720 по слову владельца.

## Где стоим

- **Состояние:** `этапы-кончились`
- **Этап:** 1 из 1 — итоги эпика в его плане
- **Сделано:** все четыре шага; план эпика и находки правлены; эпик RT-3720 заведён и отправлен
- **Следующий шаг:** круг ревью, проверки перед отправкой, PR в ветку эпика
- **PR:** ещё не открыт

## Сессии

### 2026-11-27

- Разбор и план по слову владельца «Закрыть эпик как есть».

## Одобрение плана

«Одобряю план RT-3719 (Recommended)»

## Чем подтверждено

- Путь: лёгкий (`node tools/review-path.mjs`), только тексты.
- Круг ревью один: `qa-engineer` и `goal-critic`. Серьёзная находка 1 — строка RT-3217 держала конец эпика; исправлено вместе с остальными («влито», числа из команды, абзац о ветках, строка о переносе, RT-3697 в очередь).
- `node tools/check-doc-paths.mjs` — без расхождений.

## Оставшийся шаг

- PR эпика RT-3693 в main — слияние кнопкой владельца.
- Ветки `RT-3697-no-repeat-windows`, `RT-3698-plan-by-epic-word`, `RT-3699-epic-start-one-window` лежат только на машине исполнителя; их отправка — при старте эпика RT-3720.
