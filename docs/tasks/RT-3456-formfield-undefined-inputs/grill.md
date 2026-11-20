# Grill

Работа пришла поручением запустившей сессии; владельцу вопросов не задаётся, решения принимает
исполнитель.

## The owner request

> Потребитель кита переводит все формы с реактивных форм Angular на signal forms. Контролы кита
> работают с `[formField]` через interop ControlValueAccessor, и почти всё собирается, кроме четырёх
> контролов: их входы ограничений типизированы без `undefined`, а директива FormField передаёт туда
> `undefined`, когда у поля нет ограничения. Обходить на стороне потребителя нельзя: правка нужна в
> ките, с выпуском патч-версии в npm. Работай по правилам и гардам этого репозитория, вопросов
> владельцу не задавай.
>
> Пакет `@rt-tools/ui-kit-v2` (0.48.0). Директива `FormField` из `@angular/forms/signals`
> (Angular 22) переносит состояние поля во входы контрола с тем же именем и передаёт `undefined`,
> когда у поля нет ограничения. Сейчас с `[formField]` не собираются четыре контрола, TS2322:
> - `rt-date-picker`: `min`, `max` объявлены `string | null`;
> - `rt-date-range`: `min`, `max` объявлены `string | null`;
> - `rt-input-number`: `min`, `max` (и шаговые входы) объявлены `number | null`;
> - `rt-autocomplete`: `minLength` объявлен `number`.
>
> 1. Все входы, которые заполняет FormField (`min`, `max`, `minLength`, `maxLength`, `required`,
>    `disabled`, `readonly`, `pattern`, `name`), у этих четырёх контролов, а также у `rt-input`,
>    `rt-select`, `rt-textarea`, должны принимать `undefined`; с `null` всё работает как раньше.
> 2. Тест на каждый из четырёх: контрол в хосте с `form(model)` и `[formField]`, шаблон собирается,
>    значение уходит в модель.
> 3. Сборка, линтер, тесты и сторибук по правилам этого репозитория. Ветка, PR в `main`, слияние
>    после зелёного прогона; решения принимай сам.
> 4. Выпуск патч-версии: Actions → «Publish @rt-tools/ui-kit-v2 to npm» → Run workflow с `main`,
>    `patch`. Сверить `npm view @rt-tools/ui-kit-v2 versions --json` и назвать номер новой версии в
>    отчёте.

## What the tree already has

- Спек `docs/specs/ui-kit-v2/signal-forms/` — поле кита под сигнальной формой, сценарии
  `SC-UKV-77`…`SC-UKV-83`, тест `rt-form-control.signal-forms.spec.ts` (хост с `form()` и
  `[formField]` на `rt-input`).
- Пакет уже на `0.49.0`, не на `0.48.0`: патч даст `0.49.1`.
- Проба `ngc` со `strictTemplates` на хосте из семи контролов даёт семь TS2322: `rt-date-picker`
  (`min`, `max`: `string | undefined`), `rt-date-range` (`min`, `max`: `Value | undefined` — тип
  ограничения повторяет тип значения поля), `rt-input-number` (`min`, `max`), `rt-autocomplete`
  (`minLength`).
- `rt-input`, `rt-select`, `rt-textarea` не объявляют входов с именами состояния поля, кроме
  `readonly` у `rt-textarea`: он `BooleanInput` и уже принимает `undefined`. У `rt-input` и
  `rt-textarea` есть `maxlength` в нижнем регистре — FormField его не заполняет.
- Шаг `rt-input-number` (`step`) объявлен `number` и FormField его не заполняет.
- Спеки идут в Jest без проверки типов шаблона; типы спеки проверяет `nx typecheck` (`tsc`).

## What the rules already say

- Поручение запустившей сессии — решать самому, вопросы ей, не владельцу.
- Вход с преобразованием — `input<T, TWrite>(default, { transform })` с явным типом стрелки.

## Questions and answers

Вопросов нет: поручение называет и правку, и выпуск.

## Decisions

- **Расширяется тип записи, а не тип чтения.** `input<string | null, string | null | undefined>`
  с `transform: v => v ?? null` — внутри контрола всё по-прежнему `null`, код ниже не меняется.
  Отвергнуто: `input<string | null | undefined>` — каждый читатель внутри получил бы третий случай.
- **`rt-date-range` принимает в `min`, `max` и значение диапазона.** FormField типизирует
  ограничение типом значения поля (`IRtDateRange.Value | undefined`); такой диапазон не задаёт
  границы и читается как её отсутствие. Отвергнуто: только `undefined` — шаблон всё равно не
  соберётся.
- **`step` не трогается.** FormField его не заполняет; «шаговые входы» поручения — это `min`, `max`.
- **`rt-input`, `rt-select`, `rt-textarea` не правятся.** Входов, которые заполняет FormField, у них
  нет, а `readonly` у `rt-textarea` уже принимает `undefined`; проба `ngc` на них чистая.
- **Доказательство сборки — проверка типов в спеке и проба `ngc`.** Jest шаблон не типизирует,
  поэтому спека держит утверждение о типе записи входа, его ловит `nx typecheck`.

## What is left unclear

- Нет.
