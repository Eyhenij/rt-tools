# `rt-calendar`

Календарь-витрина: месяцы, дни с подписями (цена, занятость), стрелки переключения.

```html
<rt-calendar
    prevAriaLabel="Предыдущий месяц"
    [months]="months()"
    [weekdayLabels]="weekdays"
    [canPrev]="canPrev()"
    [canNext]="canNext()"
    (prevMonth)="shift(-1)"
    (dayClick)="pick($event)" />
```

| вход                              | тип                 | умолчание      |
| --------------------------------- | ------------------- | -------------- |
| `months`                          | `readonly Month[]`  | **обязателен** |
| `weekdayLabels`                   | `readonly string[]` | **обязателен** |
| `canPrev` / `canNext`             | `boolean`           | `false`        |
| `prevAriaLabel` / `nextAriaLabel` | `string`            | `''`           |
| `sublabelsLoading`                | `boolean`           | `false`        |

Выходы: `prevMonth`, `nextMonth`, `dayClick`. Слот `[calendarHint]` — подсказка в шапке.

## Главное, что нужно знать

**Календарь ничего не считает.** Раскладку месяца готовит потребитель: сколько пустых клеток в
начале (`leadingBlanks`), какие дни заняты (`state`), что писать под числом (`sublabel`), какие
дни недоступны (`disabled`). Компонент только показывает готовое — поэтому он одинаково годится
и для выбора дат, и для витрины занятости.

**Это не поле ввода.** Значение он не хранит и в форму не пишет; для ввода даты есть
[`rt-date-picker`](../date-picker/CONTEXT.md).

## Края

- Недоступный день не кликается — `dayClick` для него не поднимается.
- `sublabelsLoading` подменяет подписи под числами заглушками, оставляя сами числа.
- Стрелки отключены, пока не разрешены явно: календарь не знает границ диапазона.
- Подписи стрелок задаёт приложение — своих слов у календаря здесь нет.

## Проверки

[`rt-calendar.component.spec.ts`](./rt-calendar.component.spec.ts).
