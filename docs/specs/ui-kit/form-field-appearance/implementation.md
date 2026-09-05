# Чем исполняется — вид поля ввода в настройке кита

Первая колонка — правило спека рядом дословно. Вторая — где оно исполняется в дереве; там же
назван сценарий, которым это проверяется, а чем именно покрыт каждый сценарий, сказано в
`scenarios.md`.

Правило без строки и строка без правила — расхождение: спек обещает то, чего в дереве нет, либо
в дереве стоит то, о чём спек молчит.

- **Вид поля разрешается тем же порядком, что и остальные умолчания кита.** — `projects/ui-kit/src/lib/ui-kit/config/rt-ui-config.ts:DynamicSelectors`; сценарий `SC-UK-54`
- **Умолчание входа — пустота, а прежнее значение стоит в конце цепочки.** — `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/dynamic-selectors-directive.ts:DEFAULT_APPEARANCE`; сценарий `SC-UK-53`
- **Разрешённое значение считается один раз, а шаблоны читают его.** — `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/dynamic-selectors-directive.ts:resolvedAppearance`; сценарий `SC-UK-55`
- **Вложенный компонент получает уже разрешённое значение, а не разрешает заново.** — `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/dynamic-selector/rtui-dynamic-selector.component.html:resolvedAppearance`; сценарий `SC-UK-54`
