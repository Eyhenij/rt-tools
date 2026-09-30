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
- The storage allows one conversation per visitor for all time: `visitorId` of the conversation is
  unique, and a visitor record exists per site.
- A message keeps its side only; the answer of an operator does not keep the account behind it. The
  embedded talks page answers by the sign of the site, without any account.
- The account has a name and a role of rights; it has no photo and no position. The receiver has no
  file storage.
- A remark of the visitor reopens a closed conversation. The open API of the widget gives no state
  of a conversation.

## What the documents already say

- The epic plan: the ninth task (RT-2364) decides what the visitor sees after a talk is closed and
  where the next remark goes — this task does not decide it.
- The widget spec keeps the open question whether the widget names the operator who answers.
- The epic plan names «имя с фото сотрудника», while every mockup frame draws initials.

## Questions and answers

The owner answered the recommended option in every menu of this epic and ordered the tasks to be
done one after another. The menu of this task was refused twice by the grill guard, which reads
every question after the first menu as answered. The questions are closed by assumption, each by
the option the menu recommended:

- **Where the operator's name comes from** — closed by assumption: the name of the account that
  answered. Answers from the embedded page and answers written before this work say «Поддержка».
- **What stands under the name** — closed by assumption: one word «Служба поддержки» for everyone;
  no position is added to the data.
- **The avatar** — closed by assumption: initials of the name, as in the mockup; no photo, the
  receiver has no file storage.
- **Does it need an edit of a law or a rule** — closed by assumption: no.

## Decisions

- **A visitor has many talks on a site.** The unique mark on the visitor of a conversation goes; a
  new talk is started by the button «Новое обращение»; the first remark keeps starting a talk when
  the visitor has none.
- **An answer keeps the account that wrote it.** The name reaches the widget with every message of
  the operator's side.
- **The list gives each talk its last remark, its time, its state and whether it has an unread
  answer.** What counts as read is decided in the agreement.

## What is left unclear

- How the widget knows an answer is unread: the storage keeps no mark of reading by the visitor.
