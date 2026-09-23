# Grill

## The owner request

> ты сравнил как выглядит динамик лист и таблица в первом ките и перенесенная во втором?

> то что я вижу нихуя не похоже на 1 кит, палитра тем применяется? Инпуты серча не такие

> палитра тем материала должна поддерживаться

> или палитра второго кита может расширятся кастомной у примеру из материала уже в апке?!

> что значит читае сам? кит не должен ьянуть материал зависимости

Answer to the choice between «the kit reads Material names with a fallback colour» and «the
application maps its colours itself»: **Имена Material в ките с запасным цветом**.

> так что с перенесенной таблицей во второй кит она готова к миграции? если заюзать я увижу разницу?
>
> в шапке колонка с чекбоксами чекбокс смещен вверх относительно заголовков

> если тупик заводи дубликт и работаем

## What the tree already has

- The first kit colours are wrapped as `var(--mat-sys-<name>, <fallback>)` in its tokens file
  for primary, primary-container, error, error-container, surface, surface-container and
  inverse-surface. A page with a Material theme repaints the first kit; a page without one keeps
  the fallbacks.
- The first kit showcase theme is the violet Material palette, density -1, Roboto. Its dynamic
  list story sets the fill look.
- The first kit table is built of Material parts: the header fill, the round small toolbar
  buttons, the radio selection and the paginator come from Material itself.
- The second kit material preset is generated from the tokens source and assigns fixed first-kit
  fallback colours; it reads no Material name.
- The proposed material preset spec holds the rule «Материальный вид снимается с первого кита, а
  не с системы Material»: it forbids both the dependency and the Material system names.
- The list of differences by frames stands in the body of #2330.

## What the rules already say

- The kit takes colour as a `--rt-*` token (rule `styling-bem`): a Material name may stand only in
  the token assignment, never in a component file.
- The tokens file is generated; it is edited at its source, not in place.

## Questions and answers

**Does the kit read the Material theme itself, or does the application map it?**
Имена Material в ките с запасным цветом. The kit must not pull a Material dependency.

**#2329 does not show on the board — what to do?**
если тупик заводи дубликт и работаем

## Decisions

- **The material preset reads `var(--mat-sys-*, <current value>)` for the steps the first kit
  reads** — the owner's word. The rule of the proposed material preset spec is rewritten: the
  dependency stays forbidden, the names are allowed with a fallback. Rejected: the application
  mapping its own colours — the owner chose the kit side.
- **Work goes in a local branch without a number while the board does not list new cards** —
  GitHub keeps 41 cards in the board listing and lists neither #2329 nor #2330, though each task
  names the board; the delivery guard reads the listing. #2329 is closed as a duplicate of #2330.

## What is left unclear

- Which of the eight differences fit this task and which leave as tasks of their own. Stage 1
  decides it by measurement, and the owner hears it with the numbers.
