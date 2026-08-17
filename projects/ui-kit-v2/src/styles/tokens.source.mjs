/* Источник свойств оформления второго кита.

   Это единственное место, где объявление слоя оформления правится руками. Три файла стилей —
   `_primitives.scss`, `_semantic.scss`, `_theme-dark.scss` — и типы имён из `tokens.ts` пишет
   генератор `tools/build-tokens-v2.mjs`; правка в них теряется на следующей сборке, а сверку
   держит `pnpm run check:tokens-build`.

   Устройство узла: `scale` — ступени шкалы, `light` — назначения светлой темы вместе с
   ответом тёмной в поле `dark`, `darkLayout` — порядок и записки тёмного файла, `coarsePointer`
   — переопределение для грубого указателя. Поле `lead` несёт блок записки над объявлением,
   `note` — записку в его строке, обе уезжают в собранный файл как есть.

   Сами узлы лежат частями рядом, по предмету: цвет шкалы — `tokens.scale-color.mjs`, размеры
   набора — `tokens.scale-metrics.mjs`, тени и поведение — `tokens.scale-effects.mjs`; цвет
   назначений — `tokens.light-color.mjs`, набор и контролы формы — `tokens.light-forms.mjs`,
   навигация — `tokens.light-navigation.mjs`, обёртка поля — `tokens.light-field.mjs`; порядок
   тёмного файла — `tokens.dark-layout.mjs`, грубый указатель — `tokens.coarse-pointer.mjs`.
   Здесь остаётся порядок: части складываются в те же два ряда, что были до деления, и
   генератор читает их отсюда.

   Пара «светлая и тёмная» стоит в одном узле нарочно: забытая половина видна прямо здесь, а
   не вылавливается сверкой двух файлов. */

import { scaleColor } from './tokens.scale-color.mjs';
import { scaleMetrics } from './tokens.scale-metrics.mjs';
import { scaleEffects } from './tokens.scale-effects.mjs';
import { lightColor } from './tokens.light-color.mjs';
import { lightForms } from './tokens.light-forms.mjs';
import { lightNavigation } from './tokens.light-navigation.mjs';
import { lightField } from './tokens.light-field.mjs';

export const scale = [...scaleColor, ...scaleMetrics, ...scaleEffects];

export const light = [...lightColor, ...lightForms, ...lightNavigation, ...lightField];

export { darkLayout } from './tokens.dark-layout.mjs';
export { coarsePointer } from './tokens.coarse-pointer.mjs';
