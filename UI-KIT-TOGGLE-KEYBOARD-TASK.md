# `@rt-tools/ui-kit` — `rtui-toggle` не берётся с клавиатуры

Замерено 23 сентября 2026 года: чтением
`projects/ui-kit/src/lib/ui-kit/toggle/rtui-toggle.component.scss` и разбором собранной страницы
потребителя пакета. Ни сборка, ни линтеры, ни юниты этого не читают.

Версия на реестре на момент замера — 0.9.0. Дефект живёт в v1 и только в нём.

---

## Что не так

`.rtui-toggle__check` — это `<input type="checkbox">`, скрытый `display: none`. Элемент с
`display: none` выпадает из порядка обхода. Ни одного `tabindex` внутри компонента нет, поэтому у
контрола нет точки входа с клавиатуры вообще.

Замер на собранной странице:

```js
getComputedStyle(document.querySelector('rtui-toggle input')).display; // 'none'
document.querySelector('rtui-toggle').querySelectorAll('[tabindex]').length; // 0
```

Следствия:

| Что                             | Сейчас                       |
| ------------------------------- | ---------------------------- |
| Tab                             | не останавливается на тоггле |
| Space                           | не переключает               |
| Фокусное кольцо                 | не рисуется                  |
| Единственный способ переключить | мышь или тач                 |

Форма, состоящая из тогглов, целиком недоступна с клавиатуры.

## Где

`projects/ui-kit/src/lib/ui-kit/toggle/rtui-toggle.component.scss:95`

```scss
&__check {
    display: none;
```

Шаблон — `projects/ui-kit/src/lib/ui-kit/toggle/rtui-toggle.component.html`: инпут лежит внутри
`<label rtBlock="rtui-toggle-container">`, соседями `<b rtElem="switch">` и `<b rtElem="track">`.

## Образец лежит в том же пакете

`rtui-checkbox` решает ровно эту задачу и решает правильно —
`projects/ui-kit/src/lib/ui-kit/checkbox/rtui-checkbox.component.scss`:

```scss
&__input {
    @include mixins.visually-hidden;
}

&__input:focus {
    outline: none;
}

&:focus-within {
    outline: 2px dashed var(--rt-checkbox-box-active-color);
    outline-offset: 2px;
}
```

Миксин `visually-hidden` уже лежит в `projects/ui-kit/src/styles/base/_mixin.scss:50` и уже
подключён в `rtui-toggle.component.scss` первой строкой (`@use '../../../styles/base/mixin' as
mixins`), так что новых импортов не нужно.

## Чем чинить

Три правила, по образцу чекбокса.

```diff
             &__check {
-                display: none;
+                @include mixins.visually-hidden;
+
+                &:focus {
+                    outline: none;
+                }

                 &:checked ~ .rtui-toggle__track {
```

и фокусное кольцо на самом переключателе:

```diff
         .rtui-toggle {
             position: relative;
             overflow: hidden;
             ...
             cursor: pointer;

+            &:focus-within {
+                outline: 2px dashed var(--rt-control-checked);
+                outline-offset: 2px;
+            }
+
             b {
                 display: block;
             }
```

Кольцо вешается на `.rtui-toggle` (коробка 3.125rem), а не на `.rtui-toggle-container`: контейнер
— это `display: flex; justify-content: space-between` во всю ширину строки, и кольцо на нём
обвело бы строку целиком вместе с подписью.

## На что смотреть при правке

- **Селекторы `~` обязаны продолжать работать.** `visually-hidden` ставит инпуту
  `position: absolute`, но соседом `__track` и `__switch` он быть не перестаёт, так что
  `&__check:checked ~ .rtui-toggle__track` остаётся рабочим. Проверить обе величины (`--md`, `--sm`).
- **`pointer-events: none` из миксина — это нормально.** Инпут лежит в `<label>`, клик по
  переключателю доходит до него через метку. Так же устроен чекбокс.
- **`overflow: hidden` на `.rtui-toggle` кольцо не срежет** — `outline` рисуется вне коробки и
  собственным `overflow` элемента не обрезается. У `.rtui-toggle-container` `overflow` не задан.
- **Раскладка не должна поехать.** Инпут уходит из потока: до правки он занимал место как
  `display: none`, то есть нисколько, — и после правки занимает столько же.
- **Enter не переключает и переключать не должен.** Это штатное поведение `checkbox`: Space
  переключает, Enter отправляет форму. Требовать Enter не нужно.
- **Цвет кольца.** В диффе взят `--rt-control-checked` — тот же токен, которым красится включённый
  трек (`toggle-check` в карте `$toggle`, строка 19). Если для фокуса заведён отдельный токен —
  брать его.

## Чем проверяется

Юнит и сборка этого не видят, проверка только руками:

```bash
pnpm storybook:ui-kit-v1        # nx run @rt-tools/ui-kit:storybook, порт 6006
```

На истории тоггла:

1. Tab — фокус встаёт на переключатель, видно кольцо.
2. Space — переключается, кольцо остаётся.
3. Shift+Tab — фокус уходит, кольцо гаснет.
4. Клик мышью — работает как прежде, кольцо по клику не остаётся (если оставаться не должно —
   взять `:focus-visible` вместо `:focus-within`, но тогда кольцо надо вешать на сам инпут и
   тянуть его на трек соседним селектором).
5. `disabled` — фокус на выключенный тоггл не встаёт.
6. Обе величины `md` и `sm` — переключатель не изменил размер и положение.

Снимки — `pnpm test:visual` при поднятом сторибуке v1; эталоны тоггла лежат в
`.rt-snapshot-evidence/components-toggle--toggle-*`. Кольцо рисуется только в фокусе, поэтому
обычный снимок измениться не должен: изменился — поехала раскладка.

## Область работы

Только `rtui-toggle` из v1.

- Это **единственный** `display: none` на инпуте во всём v1. Проверено
  `grep -rn "display: none" --include="*.scss" projects/ui-kit/src/lib/ui-kit` — две строки, вторая
  (`side-menu-sub-item`) задаёт значение переменной `--mat-icon-button-touch-target-display`, а не
  прячет контрол.
- `toggle-switch` из `ui-kit-v2` не затронут: он собран на `<button>` и уже имеет
  `&:focus-visible` (`projects/ui-kit-v2/src/lib/components/toggle-switch/rt-toggle-switch.component.scss:45`).
- Остальные контролы v1 с инпутом (`checkbox`, `file-uploader`, `image-uploader`,
  `dynamic-selectors`, `table`, `side-menu`, `modal`) инпут не прячут.

## Выпуск

Патч-версия поверх 0.9.0. Потребители подтянут её подъёмом зависимости — правок на их стороне
не требуется, тоггл чинится везде разом.
