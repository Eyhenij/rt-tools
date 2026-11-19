# Grill

The work is begun from no cargo record.

## The owner request

> Делай эпик дальше

The epic plan `docs/plans/ai-chat-blocks.md`, row 6, names the next task: RT-3338 — the block of KPI
cards with a delta to a base. The task card, verbatim:

> ## Что не так
>
> Для обзорных ответов («обзор месяца») ассистенту нужен ряд ключевых показателей с изменением к базе сравнения. В ленте чата таких карточек нет.
>
> ## Что нужно от кита
>
> Блок `kpi` для `rt-ai-chat` поверх `rt-stat-tile`:
>
> - элемент: название, значение, формат (`number` / `percent` / `currency`), дельта к базе с подписью базы (`vs LY`), период;
> - цвет и знак дельты из токенов, направление «рост — хорошо» задаётся на элементе;
> - сетка 2 колонки в узкой панели, 4 в полноэкранном режиме.
>
> ## Готово, когда
>
> Ряд из 4 карточек с положительной, отрицательной и нулевой дельтой рисуется в узкой и полноэкранной панели. В витрине есть обе ширины и обе темы.

## What the tree already has

The exploration is running; its findings land here before the first decision.

## What the rules already say

- The rule `kit-approval`: a visible kit edit starts with a Figma mockup and the owner's approval,
  then the code and every state in the showcase; the showcase matches the mockup and is approved.
- The rule `reuse-first`: the block is built on the ready `rt-stat-tile`, not drawn anew.
- The pattern `task-flow-start`: the owner took the recommended option more than twice in a row in
  this session, so the six questions close by assumption and go below as decisions.

## Questions and answers

None asked: see the decisions.

## Decisions

The decisions are written after the exploration returns.

## What is left unclear

- The mockup is the owner's step: it is drawn and shown before the code.
