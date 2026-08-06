# `rt-toggle-switch`

```html
<rt-toggle-switch ariaLabel="Тёмная тема" size="md" iconOff="ico-sun" iconOn="ico-moon" [formControl]="darkTheme" />
```

| вход                 | тип                    | умолчание |
| -------------------- | ---------------------- | --------- |
| `inputId`            | `string \| null`       | `null`    |
| `ariaLabel`          | `string \| null`       | `null`    |
| `size`               | `'sm' \| 'md' \| 'lg'` | `'sm'`    |
| `iconOff` / `iconOn` | `IRtIcon.Name \| null` | `null`    |
| `disabled`           | `boolean`              | `false`   |

Значение — `boolean` через `ControlValueAccessor`. Своей подписи на экране нет.

## Главное, что нужно знать

**`role="switch"`, а не `checkbox`.** Скринридер произносит «switch off/on» вместо «checkbox
unchecked» — для тумблера это точнее. Своего текста у контрола нет, поэтому подпись задаётся
входом `ariaLabel` или внешним `<label for>` через `inputId`.

## Как этим пользоваться

- Умолчание размера — `sm`: он совпадает по высоте с плотными контролами формы, где тумблер
  стоит в одном ряду с текстом.
- Достаточно одной из двух иконок, чтобы включился режим с иконками
  (`rt-toggle-switch--with-icons`). Бегунок непрозрачен и наезжает на иконку текущего состояния,
  так что видна всегда иконка того состояния, куда переключится контрол.
- Отключение приходит двумя путями — вход и `FormControl.disable()` — и оба пишут в один сигнал.

## Рядом

- [`rt-checkbox`](../checkbox/CONTEXT.md) — для «отмечено», а не «включено».
- [`rt-theme-toggle`](../theme-toggle/CONTEXT.md) — готовый переключатель темы поверх этого.
