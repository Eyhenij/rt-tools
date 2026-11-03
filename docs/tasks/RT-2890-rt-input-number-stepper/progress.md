# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 из 3 — Showcase
- **Done:** stage 1 — the step labels, the `step` and `stepper` inputs, the arrows and the keys;
  15 arrow tests green. The sm field has smaller arrows by the approved mockup: column 16×24,
  glyph 10, field stays 32 tall. Match with the mockup — 171 of 171 numbers, md and sm
- **Next step:** the owner's word on the showcase
- **Uncommitted:** nothing
- **Waiting for the owner:** the word on the showcase — Stepper and Size stories, 171 of 171 numbers
- **After this task:** stop, RT-2895 is not taken — «после этой задачи стоп»
- **PR:** not open yet

## Steps

- [x] 1.1 Add the step labels to the kit labels
- [x] 1.2 Add the `step` and `stepper` inputs and the step logic
- [x] 1.3 Draw the arrows in the field after the clear button
- [x] 1.4 Handle the Up and Down keys in the field
- [x] 1.5 Cover SC-UKV-1133…1143 by unit tests
- [x] 2.1 Add the arrows to the field stories
- [x] 2.2 Check the stories by eye and by measurement against the mockup
- [>] 2.3 Get the owner's word on the showcase
- [ ] 3.1 Merge the agreement into the kit spec
- [ ] 3.2 Run the push gate set
- [ ] 3.3 Take the task folder apart and open the PR

## Decisions along the way

- **The branch is taken from RT-2927, not from the main branch** — the chain goes on: RT-2927 stands
  on RT-3041, and the owner's mail in the signature list lives there until they merge.

- **The up and down arrows look different, and the cause is the icons themselves** — the kit's
  `chevron-up` and `chevron-down` (and the mockup's glyphs) have one arm heavier than the other and
  are not mirror copies; at 12 px that reads as a different size. The owner asked about it; the
  choice of glyph waits for their word. Affected stage of the plan: 2.
- **The down arrow is the up glyph turned over** — the owner: «как на макете должно быть ,
  разбирайся». The kit's `chevron-up` matches the mockup's glyph to the pixel, while the kit's
  `chevron-down` at 12 px lays its left arm darker than the right; turned over, the up glyph gives
  two equal arrows, and the kit's icon set stays untouched. Affected stage of the plan: 2.
- **The stepper column reaches over the field border** — in the sm field (32 px) the 32 px column
  grew the field to 34 px; the mockup lays it over the border. Affected stage of the plan: 2.
- **The sm field gets smaller arrows** — the owner: «по стрелочкам для инпута маленького размера
  стрелочки нужны меньшего размера». The mockup's stepper set got `Size=sm`. Affected stage: 2.

## Sessions

### 2026-11-03

- The task was free: no assignee, no branch, no archive record. Assigned to `treble3d`, moved to
  in progress.
- The mockup read: the stepper column 20×32, two buttons 20×16 with radius 4, glyph 12.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2890-rt-input-number-stepper

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 2 из 3 — Showcase
- **Next step:** the owner's word on the showcase
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2890-rt-input-number-stepper/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/ui-kit-v2/proposed/input-number-stepper/scenarios.md
 M docs/specs/ui-kit-v2/proposed/input-number-stepper/spec.md
 M docs/tasks/RT-2890-rt-input-number-stepper/approvals.md
 M docs/tasks/RT-2890-rt-input-number-stepper/progress.md
 M projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-inputnumber--appearance.png
 M projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-inputnumber--bordered.png
 M projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-inputnumber--filling.png
 M projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-inputnumber--fraction.png
 M projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-inputnumber--prefix.png
 M projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-inputnumber--presets.png
 M projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-inputnumber--size.png
 M projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-inputnumber--states.png
 M projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-inputnumber--themes.png
 M projects/ui-kit-v2/.storybook/__snapshots__/foundation-design-tokens-field-descenders--field-descenders.png
 M projects/ui-kit-v2/.storybook/__snapshots__/foundation-design-tokens-kit-clear-tabbable--kit-clear-tabbable.png
 M projects/ui-kit-v2/.storybook/__snapshots__/foundation-radius--controls.png
 M projects/ui-kit-v2/.storybook/__snapshots__/molecules-forms-field--label-inside.png
 M projects/ui-kit-v2/.storybook/__snapshots__/molecules-forms-field--material.png
 M projects/ui-kit-v2/.storybook/__snapshots__/organisms-table-tablefilterheader--in-table.png
 M projects/ui-kit-v2/.storybook/__snapshots__/organisms-table-tablefilterheader--kinds.png
```

### Commits over the main branch

```
3383eda81 feat(rt:ui-kit-v2): витрина стрелок шага — история Stepper и описание поля
308641a28 feat(rt:ui-kit-v2): стрелки шага в поле числа
64b5d3a1a docs: договорённость и план RT-2890 — стрелки шага в поле числа
1327f105a docs: одобрения макета и витрины RT-2927 в записи архива
e4e8df4e0 refactor(rt:ui-kit-v2): пояснение о строке разницы плитки стоит над своим полем
c70a0cbec docs: папка RT-2927 разобрана в запись архива
0b02607ff refactor(rt:ui-kit-v2): стили витрины плитки — в своём файле
56a6b10f6 test(rt:ui-kit-v2): эталоны витрины плитки — Unit, Growth, Framed и обновлённая Themes
dc5c297ae docs: витрина плитки RT-2927 одобрена владельцем
36bb35d21 feat(rt:ui-kit-v2): витрина плитки — обе темы и плитки в карточке
17f99cfc1 docs(rt:ui-kit-v2): договорённость о разнице плитки вошла в описание второго кита
dd659d84b docs: витрина плитки RT-2927 сверена с макетом — 101 из 101
b3a2d2dc7 feat(rt:ui-kit-v2): плитка показателя пишет разницу в пунктах и знает «рост хуже»
6b2108c61 docs: план RT-2927 и одобрение макета плитки
676b62742 docs: договорённость RT-2927 — единица разницы и «рост хуже» у плитки
ad9d494f1 docs: макет плитки RT-2927 ждёт слова владельца
4bffa468e docs: разбор RT-2927 — единица разницы и признак «рост хуже» у плитки
27c69ab0a docs(rt:agent-kit): сценарии заведения ветки укладываются в предел длины файла
b65558967 docs: папка RT-3041 разобрана в запись архива
861468d41 chore: адрес владельца в списке людей, подписывающих коммиты
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
