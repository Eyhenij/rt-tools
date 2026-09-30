# Grill

## The owner request

> бери в работу эпик 2370, перетяни тикет на борде в колонку in progress, создавай ветку и выполняй
> задачи друг за другом, ветки делай каскадом чтобы при слиянии веток по очереди не было
> мерж-конфликтов

The task itself, as written in the queue:

> Оператор закрывает разговор в панели, а посетитель в виджете об этом не узнаёт. Он пишет дальше в
> разговор, который уже никто не ждёт, и не понимает, ответят ему или нет.
>
> В спеке виджета этого случая нет: не сказано, что посетитель видит после закрытия и что
> происходит с его следующей репликой — уходит в тот же разговор, открывает его снова или начинает
> новый.
>
> Что сделать: решить поведение и дописать его в спеку виджета, раздел состояний экрана; сделать
> это в виджете.
>
> Набросок есть в макете: под лентой черта «Разговор завершён · 12:50», в поле — «Новый вопрос?
> Напишите нам». Это догадка, а не решение.

## What the tree already has

- The operator-reading spec: a remark of a visitor into a closed conversation opens it again. The
  rule was written when a visitor had one conversation per site.
- Since RT-2367 a visitor holds several talks, reads their list and starts a new one by a mark.
- The closing is sent outward by a call to the application of the site; the stream of the widget
  carries remarks only. The storage keeps no minute of the closing.

## What the documents already say

- The operator-reading spec answers what the service does with a remark into a closed talk; nothing
  says what the widget shows at the closing or where its next remark goes.

## Questions and answers

The owner answered the recommended option in every menu of this epic and ordered the tasks to be
done one after another. The menu of this task was refused by the grill guard, which reads every
question after the first menu as answered. The question is closed by assumption, by the option the
menu recommended:

- **Where the next remark goes** — closed by assumption: a new talk. The closed talk stays closed
  and is read; under its thread stands the line «Разговор завершён · <time>», and the field says
  «Новый вопрос? Напишите нам». The service rule about reopening stays for any other writer; the
  widget no longer writes into a closed talk.
- **Does it need an edit of a law or a rule** — closed by assumption: no.

## Decisions

- **The storage keeps the minute of the closing**; the reopening clears it.
- **The closing reaches the open widget by the stream**, as an event of its own kind.
