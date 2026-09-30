# Grill

## The owner request

> бери в работу эпик 2370, перетяни тикет на борде в колонку in progress, создавай ветку и выполняй
> задачи друг за другом, ветки делай каскадом чтобы при слиянии веток по очереди не было
> мерж-конфликтов

The task itself, as written in the queue:

> Поле сообщения в чате выглядит устаревшим: прямоугольник с рамкой, под текстом черта и отдельная
> строка кнопок. Так оно выглядит у оператора в панели «Чат» и на странице «Переписки» в админке
> площадки.
>
> В макете поле переделано. Это капсула со скруглением 24: слева круглая кнопка вложения, справа
> круглая кнопка отправки со стрелкой. Пока поле пустое, кнопка отправки серая; с текстом она
> синяя, при отправке крутится. В фокусе у поля рамка и кольцо, как у полей кита. Текст растёт до 6
> строк, кнопки прижаты к низу. Вложения показываются внутри капсулы. Под полем можно включить
> подсказку «Enter — отправить, Shift + Enter — новая строка».
>
> Где макет: Figma, страница Message Composer — 7 состояний (пустое, фокус, набор, несколько строк,
> отправка, с текстом без фокуса, недоступно). На странице «Переписка с поддержкой» — экраны с этим
> полем.
>
> Что сделать: переделать компонент `rt-message-composer` второго кита по макету, обновить его
> историю в витрине и снимки. Виджет посетителя сюда не входит — он без кита, его вид ведёт задача
> #2365.

## What the tree already has

- `rt-message-composer` in the rich-editor entry of the second kit: an autosizing textarea, a
  divider, a row with the attach and send icon buttons, file cards under the text, a formatting
  mode with the rich editor. Its consumer in the kit is `rt-chat`; the admin panel shows it through
  the chat.
- The mockup page Message Composer holds nine states: empty, focus, typing, multiline, sending,
  filled, disabled, long and overflow.
- The kit's fields draw the focus by the border and the ring of `--rt-input-*`.
- No spec subdomain describes the composer yet.

## What the rules already say

- `reuse-first`: the buttons are the kit's icon buttons, the focus ring is the fields' one.
- `rt-tools-storybook`: every visible state in a story; the sending and the hint are states.
- `ui-component-tests`: an admin screen that shows the chat is closed by its end-to-end frame.

## Questions and answers

The owner answered the recommended option in every menu of this epic and ordered the tasks to be
done one after another. The questions are closed by assumption, each by the option a menu would
have recommended:

- **Does the public contract change** — closed by assumption: no input or output is removed; the
  hint is a new boolean input `hint`, off by default.
- **What the send button shows while sending** — closed by assumption: a spinner in place of the
  arrow, the button stays pale and inactive.
- **The formatting mode** — closed by assumption: it keeps its toolbar and gets the same capsule;
  the mockup has no frame of it.
- **Does it need an edit of a law or a rule** — closed by assumption: no.

## Decisions

- **The capsule is the composer's own look, not a new component** — the task asks to redraw
  `rt-message-composer`. Rejected: a second composer next to the old one.
- **The focus is the fields' border and ring** — the mockup says «как у полей кита».

## What is left unclear

- none that blocks the work
