# Grill

## The owner request

> бери в работу эпик 2370, перетяни тикет на борде в колонку in progress, создавай ветку и выполняй
> задачи друг за другом, ветки делай каскадом чтобы при слиянии веток по очереди не было
> мерж-конфликтов

The task itself, as written in the queue:

> Виджет чата на сайте выглядит не так, как в макете. Посетитель видит кнопку-пилюлю со словом,
> узкую панель 320 px с белой шапкой и системный шрифт. В макете у виджета синяя шапка с крестиком,
> круглая кнопка с иконкой, пузыри сообщений и поля как в остальном интерфейсе, панель 380 px.
>
> Макет решено считать целью: виджет нужно привести к нему.
>
> Где макет: Figma, страница «Переписка с поддержкой», раздел «Виджет посетителя» — кадры для
> широкого экрана и для телефона, все состояния.
>
> Что учесть:
>
> - по спеке виджет не несёт кита (`docs/specs/chat/widget/spec.md`, правило «The widget carries no
>   kit of the tree»), поэтому вид повторяется своими значениями в стилях виджета, а не подключением
>   компонентов;
> - у поля ввода сейчас нет своего стиля фокуса, и браузер рисует свою обводку 2 px `#005FCC`; в
>   макете это так и нарисовано — решить, оставлять ли её или рисовать кольцо, как у полей кита.

## What the tree already has

- The widget in `apps/chat-widget/src/lib/`: an element with a shadow tree, markup by hand, styles
  as a string in `chat-widget.styles.ts` with its own properties at the root.
- The look today: a pill button with a word, a panel of 320 px, a white head with the hours and a
  cross, a system font, grey and light blue bubbles, an input and a text button «Отправить».
- The spec `docs/specs/chat/widget/` already names the bubble as a round button, the corner on a
  wide screen and the whole screen on a narrow one.
- End-to-end frames: `widget-page` in `chat-widget.spec.ts`, `widget-narrow` in
  `chat-widget.narrow.spec.ts`.

## What the rules already say

- The spec of the widget: no kit; the look is repeated by the widget's own values.
- `ui-component-tests`: a screen is closed by its end-to-end frame.

## Questions and answers

The owner answered the recommended option in every menu of this epic and ordered the tasks to be
done one after another. The questions are closed by assumption, each by the option a menu would
have recommended:

- **The focus of the field** — closed by assumption: the ring of the kit's fields, repeated by the
  widget's own values; the browser outline is removed.
- **The font** — closed by assumption: the widget takes the kit's family by name with system
  fallbacks and loads no font file of its own; a font file would be a second request.
- **Does it need an edit of a law or a rule** — closed by assumption: no.

## Decisions

- **The look is repeated by the widget's own values.** The spec forbids the kit in the widget.

## What is left unclear

- The page of the mockup is not found yet in the file of the kit; the frames are looked for.
