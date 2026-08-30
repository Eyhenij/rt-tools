# Чем исполняется — кнопка с двумя положениями

Первая колонка — правило спека рядом дословно. Вторая — где оно исполняется в дереве; там же
назван сценарий, которым это проверяется, а чем именно покрыт каждый сценарий, сказано в
`scenarios.md`.

Правило без строки и строка без правила — расхождение: спек обещает то, чего в дереве нет, либо
в дереве стоит то, о чём спек молчит.

- **Признак положения трёхзначен: нажата, отжата, положения нет вовсе.** — `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts:pressed`; сценарий `SC-UKV-92`
- **Отжатое положение объявляется наравне с нажатым.** — `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts:ariaPressed`; сценарий `SC-UKV-93`
- **Вид нажатого положения берётся у удерживаемого нажатия самой кнопки.** — `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.scss:pressed`; сценарий `SC-UKV-94`
- **Положение не меняется само по нажатию.** — `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts:pressed` — вход и только вход: своего состояния директива не держит; сценарий `SC-UKV-94`
- **Отключённая кнопка сохраняет своё положение.** — `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.scss:pressed`; сценарий `SC-UKV-95`
