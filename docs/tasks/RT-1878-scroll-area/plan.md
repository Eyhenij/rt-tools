# Plan

**Task:** RT-1878 · **Branch:** RT-1878-scroll-area
**Spec:** `docs/specs/ui-kit-v2/scroll-area/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/scroll-area/` — заводится; `docs/specs/ui-kit-v2/scrollbar/` — читается                                                         |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`, `docs/constitution/reuse-first.md`                                 |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/scroll-area/`; образец — `projects/ui-kit/src/lib/ui-kit/scrollable/`                                          |

## What counts as done

- Семья `rt-scroll-area` работает во втором ките: три слота, признак непоказанного снизу, полоса
  растушёвки со значком, подъём полосы по высоте подвала.
- Ни одного импорта `@angular/material`: значок и подсказка взяты семьями второго кита, подпись —
  словарём кита.
- Каждое обещание семьи названо правилом договорённости и закрыто пробой.
- На витрине стоит обзорная страница и матрица показов, обе темы и обе половины набора оформления.
- Эталонный снимок снят и лежит под гитом.
- Вид сличён с кадром первого кита: расхождений цвета, скругления, кегля, тени и отступа нет.

## Stages

### 1. Договорённость записана

- **What is done:** заводится поддомен `docs/specs/ui-kit-v2/scroll-area/` — `spec.md`,
  `scenarios.md`, `implementation.md`. Сценарии берут номера с `SC-UKV-148`.
- **Readiness sign:** число сценариев выросло на столько, сколько правил у семьи, и ни один новый
  не стоит в списке «without tests».
- **Verified by:** `npm run check:specs` — сейчас строка «domains 6, scenarios 1600 — covered 1447,
  partial 16, without tests 137». После этапа сценариев больше, и `scroll-area` в списке непокрытых
  до этапа 3 стоит законно.

### 2. Семья написана на примитивах второго кита

- **What is done:** компонент `rt-scroll-area`, три директивы слотов, разметка, стили в слое
  `rt-kit.components`, подпись значка в словаре кита, вывод наружу.
- **Readiness sign:** сборка и линтер второго кита зелёные, ни одного импорта `@angular/material`.
- **Verified by:** `pnpm exec nx run-many -t lint build -p @rt-tools/ui-kit-v2` — «Successfully ran
  targets lint, build».

### 3. Пробы рядом с компонентом

- **What is done:** `rt-scroll-area.component.spec.ts` — по пробе на каждое правило
  договорённости, заголовок с номером сценария.
- **Readiness sign:** пробы зелёные, и ни один сценарий `scroll-area` не остался без пробы.
- **Verified by:** `npm run check:specs` — в списке «without tests» сценариев `scroll-area` нет.

### 4. Витрина показывает семью

- **What is done:** `Overview.mdx`, `Playground`, показ на каждую ось, `States`, `Themes`; раздел
  `Organisms/Layout/ScrollArea`, пара половин набора оформления на каждом показе.
- **Readiness sign:** счёт семей вырос на одну, и страница входов у новой семьи есть.
- **Verified by:** `node tools/check-kit-coverage.mjs` — сейчас «families of the second kit 74,
  reaching the showcase 73» и «families that have one 71». После этапа — 75 и 74, страница входов
  у 72.

### 5. Эталонный снимок снят

- **What is done:** снимки показов семьи сняты и положены под гит.
- **Readiness sign:** прогон снимков зелёный, осиротевших эталонов нет.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — в выводе «References in the directory:
  <число>. There are no orphaned ones.» и ни одного упавшего показа.

### 6. Вид сличён с кадром первого кита

- **What is done:** кадр прокрутки из 85 снимков первого кита ставится рядом со свежим кадром
  второго; расхождения разбираются по одному.
- **Readiness sign:** цвет, скругление, кегль, тень и отступ сходятся; расхождение разметки названо
  словами и дефектом не считается.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` после правок по итогам сличения — тот же
  зелёный прогон, и в состоянии записано, что именно сличалось.

## What this work does not do

- Не трогает семью прокрутки первого кита: она открывается образцом и не правится.
- Не переносит соседние семьи яруса — значок-бейдж, полосу действий, загрузчик изображений,
  настройки и тему: каждая своей задачей.
- Не решает про боковое меню и динамические селекторы: они стоят за RT-1882 и ждут слова владельца.
