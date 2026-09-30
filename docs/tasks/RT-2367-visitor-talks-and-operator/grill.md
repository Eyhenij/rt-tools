# Grill

## The owner request

> бери в работу эпик 2370, перетяни тикет на борде в колонку in progress, создавай ветку и выполняй
> задачи друг за другом, ветки делай каскадом чтобы при слиянии веток по очереди не было
> мерж-конфликтов

The task itself, as written in the queue:

> Посетитель сайта видит в виджете только один разговор и не знает, кто ему отвечает. Вернуться к
> прошлому обращению или начать новое он не может, а в ответах стоит безличное «Поддержка».
>
> В макете это уже нарисовано:
>
> - экран «Ваши обращения» — список обращений посетителя с аватаром сотрудника, последней репликой,
>   временем, точкой непрочитанного и меткой «Закрыто», внизу кнопка «Новое обращение»;
> - в открытом обращении в шапке стрелка назад к списку, аватар, имя и роль сотрудника; пока
>   сотрудник не ответил — общий значок и часы ответа.
>
> Что мешает сейчас (`docs/specs/chat/spec.md`):
>
> - у посетителя один живой разговор на площадку — списка нет, а новое обращение не отличить от
>   продолжения старого;
> - сообщение знает только «посетитель или оператор»: имени и фото сотрудника у сервиса нет.
>
> Что сделать: решить и записать в спеку, как посетитель получает список своих разговоров и чем
> новое обращение отличается от старого, откуда берутся имя и фото сотрудника; потом сделать это в
> сервисе и в виджете.

## What the mockup shows

- «Ваши обращения» (6033:3737): rows with an initials avatar or the common support icon, the name,
  the last remark cut to one line, the time or the day, a dot for unread, the mark «Закрыто»; the
  button «Новое обращение» at the bottom.
- An open talk with an answer (6016:1484): the head carries a back arrow, the initials avatar, the
  name «Анна Смирнова» and the role «Служба поддержки»; the bubble of the answer names the first
  name «Анна».
- An open talk without an answer (6033:3920): the head carries the common icon, «Поддержка» and the
  hours.
- The avatar is drawn by initials in every frame; no frame shows a photo.

## What the tree already has

- The chat service: `libs/message-bus-api/chat/` — `api`, `data-access`, `feature`, `util`.
- The widget: `apps/chat-widget/src/lib/`.
- The specs: `docs/specs/chat/spec.md` and the subdomains, the widget in `docs/specs/chat/widget/`.

## Questions and answers

Filled after the exploration of the data model.

## Decisions

## What is left unclear

- Where the name and the role of the operator come from, and how the visitor's talks are listed —
  the exploration of the data model goes on.
