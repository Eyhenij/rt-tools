# Grill

## The owner request

> ну так если новые кадры в главной значит их надо учитывать!!!

> блядь я е понимаю если кадры актуальны схуя они будут краснеть?

> заведи тикет

> его стоит взять после текущей задачи?

## What the tree already has

- `docs/archive/RT-2165-showcase-font-from-machine.md` — разбор той же семьи расхождений: поле
  переписки мерилось начертанием машины. Там же дописано, чем расходятся кадры главной.
- `apps/message-bus-admin-e2e/playwright.config.ts` — браузеру названы три величины:
  `--force-color-profile=srgb`, `--disable-gpu`, `--disable-partial-raster`.
- `projects/ui-kit-v2/.storybook/test-runner.ts` и `projects/ui-kit/.storybook/test-runner.ts` —
  обвязки витрин; аргументов запуска браузера не называют вовсе.
- Коммиты главной `bb396a3b3` и `105a7a988` от 16 сентября 2026 года — пересъёмка 27 кадров.

## What the rules already say

- Правило `testing`: «The browser raster is named explicitly, otherwise a frame does not match
  itself» — и называет ровно три величины: цветовой профиль, ускоритель, мозаичную перерисовку.
  Отрисовки знаков среди них нет.
- Правило `ui-component-tests`: «A reference is taken after the frame has been looked at, not
  before» и «A reference is re-taken deliberately and one at a time».
- Закон ведения работ: замеченное по дороге и не принадлежащее эпику заводится задачей.

## Questions and answers

**Стоит ли брать эту работу сразу после текущей?**
«его стоит взять после текущей задачи?» — владелец назвал порядок сам.

## Decisions

- **Работа идёт веткой от главной, не от ветки эпика** — чинится состояние самой главной, и эпик
  до неё дойдёт нескоро. Отклонено: ждать слияния эпика — тогда цену платит каждая ветка до тех пор.

## What is left unclear

- Причина расхождения растра не найдена: известно только, что разметка та же, а знаки нарисованы
  иначе. Это первый этап работы, а не помеха ей.
