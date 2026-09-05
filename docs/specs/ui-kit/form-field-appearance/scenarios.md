# Сценарии — вид поля ввода в настройке кита

### SC-UK-53 — без настройки поле остаётся прежним

Дано настройка кита не объявлена
Когда селектор рисуют
Тогда поле показывается с заливкой — прежним умолчанием кита

Покрыто: `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/dynamic-selector/rtui-dynamic-selector.component.spec.ts`.

### SC-UK-54 — раздел компонента задаёт вид поля

Дано в настройке кита объявлен вид поля для селекторов
Когда селектор рисуют без входа вида
Тогда поле показывается видом из настройки

Покрыто: `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/dynamic-selector/rtui-dynamic-selector.component.spec.ts`.

### SC-UK-55 — вход на месте перебивает настройку

Дано в настройке кита объявлен один вид, а входом передан другой
Когда селектор рисуют
Тогда поле показывается видом из входа

Покрыто: `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/dynamic-selector/rtui-dynamic-selector.component.spec.ts`.
