# `rt-progress-bar`

```html
<rt-progress-bar ariaLabel="Обновление набора данных" color="success" [value]="percent()" />
```

| вход        | тип                                | умолчание       |
| ----------- | ---------------------------------- | --------------- |
| `mode`      | `'determinate' \| 'indeterminate'` | `'determinate'` |
| `value`     | `number`                           | `0`             |
| `color`     | `IRtProgressBar.Color`             | `'primary'`     |
| `ariaLabel` | `string \| null`                   | `null`          |

Выходов нет.

## Главное, что нужно знать

**Доля зажата в 0–100 одним местом — `clampProgress`.** Ширина заполнения и `aria-valuenow`
берут одно и то же число и разойтись не могут.

**Живая доля — просто сигнал на входе.** Заполнение идёт за ним движением ширины; полоса в
уведомлении получает долю из потока задачи.
