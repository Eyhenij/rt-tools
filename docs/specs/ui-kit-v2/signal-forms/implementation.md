# Чем исполняется — поле набора и сигнальная форма

Первая колонка — правило спека рядом дословно. Вторая — где оно исполняется в дереве; там же
назван сценарий, которым это проверяется, а чем именно покрыт каждый сценарий, сказано в
`scenarios.md`.

Правило без строки и строка без правила — расхождение: спек обещает то, чего в дереве нет, либо
в дереве стоит то, о чём спек молчит.

- **Поле работает с обеими привязками.** — `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.ts:ngOnInit`; сценарии `SC-UKV-77`, `SC-UKV-83`
- **Отсутствие событий у контрола падением не бывает.** — `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.ts:emitsEvents`; сценарий `SC-UKV-77`
- **Состояние сигнальной привязки доходит до поля целиком.** — `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.ts:stateOf`; сценарии `SC-UKV-78`, `SC-UKV-80`, `SC-UKV-81`, `SC-UKV-82`
- **Негодность показывается после касания или правки, а не сразу.** — `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.ts:stateOf`; сценарий `SC-UKV-79`
- **Обёртка поля берёт состояние у поля, а не у формы.** — `projects/ui-kit-v2/src/lib/components/field/rt-field.component.ts:showError`; сценарий `SC-UKV-80`
