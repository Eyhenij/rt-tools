# Grill

## The owner request

> бери в работу эпик 2370, перетяни тикет на борде в колонку in progress, создавай ветку и выполняй
> задачи друг за другом, ветки делай каскадом чтобы при слиянии веток по очереди не было
> мерж-конфликтов

The task itself, as written in the queue:

> У таблицы второго кита нет входа `radius`, а у остальных компонентов с поверхностью он есть.
> Приложение не может скруглить карточку таблицы на узком экране тем же способом, что и соседние
> компоненты.
>
> Причина: файл компонента таблицы уже занимает 500 строк, это предел длины. Строка подключения
> директивы в нём не помещается.
>
> Что сделать: разделить файл компонента таблицы на части, не меняя поведения. Подключить вход
> `radius`. Скругление получает карточка узкого вида, а у широкого вида углов нет: в макете у него
> `none`. Добавить таблицу в тест контракта входа и в строку таблицы входов на странице описания.
>
> Как проверить: тест контракта входа проходит вместе с таблицей. Сетка витрины показывает
> карточку таблицы на каждом шаге.

## What the tree already has

- The radius-scale spec names the table out of scope: its wide view has no corners, and the card
  of the narrow view takes the input by a task of its own — this one.
- The table component file stands at 500 lines, the limit.
- The column settings of the table (the registry, the saved settings, their load and save) live
  inside the component, next to the rest of its state.
- The contract test of the input lists every surface by hand.

## Questions and answers

The task names what to do and where the step goes. The owner answered the recommended option in
every menu of this epic and ordered the tasks to be done one after another. No question is left
open:

- **Which part leaves the component file** — the column settings: they are a whole of their own
  (the registry, the load, the save) and the component only delegates to them.
- **Where the step lands** — the card of the narrow view; the wide view keeps no corners.
- **Does it need an edit of a law or a rule** — no.

## Decisions

- **The column settings of the table move into a class of their own**, the behaviour unchanged.
- **The table takes `radius` by the shared directive**; the step reassigns the own property of the
  card.
