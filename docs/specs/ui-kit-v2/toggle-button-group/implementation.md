# Чем исполняется — сегментированный переключатель

Первая колонка — правило спека рядом дословно. Вторая — где оно исполняется в дереве; там же
назван сценарий, которым это проверяется, а чем именно покрыт каждый сценарий, сказано в
`scenarios.md`.

Правило без строки и строка без правила — расхождение: спек обещает то, чего в дереве нет, либо
в дереве стоит то, о чём спек молчит.

- **Одиночный и множественный выбор объявляются разными входами.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.ts:values`; сценарий `SC-UKV-87`
- **В множественном выборе нажатие добавляет сегмент или снимает его.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.ts:onOptionClick`; сценарий `SC-UKV-88`
- **Множественный выбор отдаёт весь набор выбранного, а не разницу.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.ts:valuesChange`; сценарий `SC-UKV-88`
- **Недоступный сегмент остаётся видимым и нажатие не пропускает.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.ts:items`; сценарий `SC-UKV-89`
- **Отключённая группа делает недоступными все свои сегменты.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.ts:items`; сценарий `SC-UKV-90`
- **Недоступность сегмента объявлена рядом с его подписью, а не отдельным списком.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.model.ts:Option`; сценарий `SC-UKV-89`
