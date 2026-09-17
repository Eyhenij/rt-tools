# Plan

**Task:** RT-2220 · **Branch:** RT-2220-first-kit-frames-in-image
**Behaviour:** unchanged — «делать чтобы избежать постоянного рассинхрона», слово владельца
17 сентября 2026 года. Правка трогает только оснастку съёмки: ни один компонент первого кита не
меняется, и то, что видит человек, остаётся прежним.

## Task footprint

| What  | Where                                                                                |
| ----- | ------------------------------------------------------------------------------------ |
| Rules | `.claude/skills/ui-component-tests/`, `.claude/skills/ui-component-tests-visual/`    |
| Code  | `tools/visual-gate.mjs`, `projects/ui-kit/.storybook/`, `.github/workflows/ci.yml`   |
| Specs | `docs/specs/ui-kit-v2/snapshots/` — соседняя договорённость, читается на расхождение |

## What counts as done

- Кадры витрины первого кита снимает браузер из образа, и та же команда судит их всюду, а не
  только в конвейере.
- Все 89 эталонов первого кита сняты заново образом и подтверждены вторым подъёмом.
- Конвейер зовёт ту же команду, что и машина: своего подъёма витрины у него не остаётся.
- Тексты дерева не говорят больше, что первый кит снимает браузер машины.

## Stages

### 1. Витрина первого кита собирается и раздаётся так же, как вторая

- **What is done:** в `KITS['ui-kit']` встают собранная витрина и раздача файлами вместо сервера
  разработки, как у второго кита.
- **Readiness sign:** сегодня команда печатает «The frames of ui-kit are matched in the pipeline
  only: its showcase shoots with the machine's browser» и до сравнения не доходит. После правки
  этой строки в выводе нет, и поднимается собранная витрина.
- **Verified by:** `node tools/visual-gate.mjs ui-kit` — строки про «pipeline only» в выводе нет.

### 2. Настройка набора снимков в каталоге витрины первого кита

- **What is done:** заводится `projects/ui-kit/.storybook/test-runner-jest.config.js` по образцу
  соседнего: адрес браузера образа из `RT_SHOT_BROWSER`, язык `ru-RU`, пояс `UTC`.
- **Readiness sign:** запуск без образа отбивается словами самого файла, запуск через
  `visual-gate` доходит до сравнения эталонов.
- **Verified by:** `node tools/visual-gate.mjs ui-kit` — в выводе строка «Snapshots:».

### 3. Съёмка эталонов образом и подтверждение вторым подъёмом

- **What is done:** 89 эталонов сняты заново браузером образа; те, под которыми нет историй,
  удаляются.
- **Readiness sign:** два подъёма подряд дают зелёное на всех эталонах, сирот нет.
- **Verified by:** `node tools/visual-gate.mjs ui-kit` — «Snapshots: N passed, N total».

### 4. Конвейер и тексты дерева

- **What is done:** шаг `Visual tests` в `.github/workflows/ci.yml` зовёт
  `node tools/visual-gate.mjs ui-kit` вместо своего подъёма на порту 6106; в правилах
  `ui-component-tests` и `ui-component-tests-visual` выправлены строки о том, чем снимает первый
  кит; в шапке `tools/visual-gate.mjs` снимается довод про запрет эпика.
- **Readiness sign:** ни один текст дерева не говорит, что кадры первого кита судятся только в
  конвейере.
- **Verified by:** `npm run check:docs` и `node tools/check-specs.mjs` — оба зелёные.

## What this work does not do

- Компоненты первого кита не правятся: разрешение владельца дано на оснастку съёмки, а не на кит.
- Эталоны второго кита не трогаются: их дорога уже та же, и сняты они заново сегодня.
- Кадры экранов админки не трогаются: они ушли в образ раньше.
