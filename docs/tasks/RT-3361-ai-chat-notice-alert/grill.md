# Grill

## The owner request

> Делай эпик дальше

Задача заведена по находке второго круга ревью RT-3334: плашка `notice` в ленте ответа рисуется через `rt-message` с `role="alert"`.

## What the tree already has

- `rt-message.component.html` ставит `role="alert"` на `aside` всегда.
- Блоки ответа рисуют `notice` через `rt-message` с `severity`.

## Decisions

- **Вход `live` у `rt-message`, а не своя разметка в чате.** Своя разметка с ролью обошла бы готовый компонент кита.
- **По умолчанию `alert`.** Вне чата плашка остаётся срочной, как была.
