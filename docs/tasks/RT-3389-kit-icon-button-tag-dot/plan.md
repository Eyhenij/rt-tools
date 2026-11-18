# План

**Task:** RT-3389 · **Branch:** RT-3389-kit-icon-button-tag-dot
**Draft:** `docs/specs/ui-kit-v2/proposed/tag-dot/`
**Behaviour:** changes

## Точки

- **A:** в Figma кнопка-квадрат и точка у метки нарисованы и одобрены владельцем 18.11; в коде
  квадрат у кнопки есть, точки у `rt-tag` нет; на npm `@rt-tools/ui-kit-v2` 0.47.1.
- **Задача достигает:** в Figma у Button/Outlined, Filled, Text есть `Icon only=true`, у Tag —
  `Appearance=dot`; у `rt-tag` вход `appearance="dot"`; в витрине обе детали во всех
  состояниях; новая версия `@rt-tools/ui-kit-v2` на npm.
- **Признак:** выпущенный пакет новой minor-версии несёт `rt-tag--appearance--dot`; строка сверки
  `kit-match numbers` — N из N по перечню шага 3.1; владелец одобрил макет и витрину.
- **Веха эпика:** RT-3390, веха G — новая версия `@rt-tools/ui-kit-v2` с точкой у метки на npm.
- **Метрика:** нет: правка кита, не правила.

## След задачи

| Что     | Где                                                        |
| ------- | ---------------------------------------------------------- |
| Спеки   | `docs/specs/ui-kit-v2/tag/`, `docs/specs/ui-kit-v2/proposed/tag-dot/` |
| Законы  | `docs/constitution/mockups.md`, `docs/constitution/frontend-application.md` |
| Правила | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/styling-bem/` |
| Код     | `projects/ui-kit-v2/src/lib/components/tag/`, `projects/ui-kit-v2/src/lib/components/button/stories/` |

## Что считается сделанным

- `rt-tag` с `appearance="dot"` рисует круг цвета severity (secondary и neutral — `text-muted`)
  со стороной 6/8/10 по ступени, без подписи, значков и крестика; значение — в подсказке и в
  `aria-label` при `role="img"`, точка берёт фокус с клавиатуры; шаг `radius` круг не меняет.
- В витрине: точки всех severity и размеров в светлой и тёмной теме; кнопки-квадраты трёх видов
  во всех темах, размерах и состояниях.
- Сверка с Figma числами — N из N, кадр наложения показан владельцу; витрина одобрена.
- Договорённость влита в спек метки, PR влит, пакет выпущен.

## Этапы

### 1. Точка у rt-tag

- **Steps:**
    1. Значение `dot` в `IRtTag.Appearance`, разметка и стили точки в `rt-tag`
    2. Спеки SC-UKV-1378…1381 в `rt-tag.component.spec.ts`
- **Readiness sign:** спеки метки зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/tag/rt-tag.component.spec.ts` — все тесты прошли.

### 2. Витрина

- **Steps:**
    1. Стори точки: палитра × размер, светлая и тёмная тема
    2. Стори кнопки-квадрата: вид × тема × размер × состояние
    3. Эталоны кадров новых и изменённых стори: `node tools/visual-gate.mjs ui-kit-v2 --update '(tag|button)-matrix\.stories'`
- **Readiness sign:** стори собираются, кадры сняты.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — расхождений нет.

### 3. Сверка с макетом и показ владельцу

- **Steps:**
    1. Числа Figma и витрины, `node tools/kit-match.mjs numbers`. Перечень ключей: кнопка —
       Outlined, Filled, Text × sm…2xl: ширина, высота, сторона значка; Outlined secondary sm —
       32, 32 и цвет рамки. Точка — каждая severity × sm, md, lg: ширина, высота, цвет заливки,
       в светлой и тёмной теме
    2. Кадр наложения, `node tools/kit-match.mjs overlay`
    3. Показ витрины владельцу, запись второго одобрения в `approvals.md` (строка макета с
       `node-id` наборов Button и Tag записана туда до этапа 1)
- **Readiness sign:** N из N по перечню шага 3.1 и цитаты обоих одобрений в записи. Расхождение
  квадрата кнопки с макетом — правка кода кнопки отдельным шагом и новый показ владельцу.
- **Verified by:** `node tools/check-kit-approval.mjs` — нет отказов.

### 4. Сдача

- **Steps:**
    1. Договорённость влита в `docs/specs/ui-kit-v2/tag/`, привязки в `implementation.md`
    2. Папка задачи разобрана в архив, набор перед отправкой, PR задачи в `RT-3390-kit-icon-tag-dot`
    3. Слияние PR задачи, PR эпика в main, его слияние, выпуск minor `@rt-tools/ui-kit-v2`
       (прежний 0.47.1); номер версии — запустившей сессии для владельца
- **Readiness sign:** выпущенный пакет несёт точку.
- **Verified by:** `npm pack @rt-tools/ui-kit-v2@latest --dry-run --json` и поиск `rt-tag--appearance--dot` в его CSS — строка найдена в версии новее 0.47.1.

## Чего эта работа не делает

- Макет и код шапки страницы записи — работа эпика по мессенджерам.
- Код кнопки: квадрат уже есть, правка только в Figma и в витрине.
