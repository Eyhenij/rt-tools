# Привязка — сегментированный переключатель

- **Одиночный и множественный выбор объявляются разными входами** — `rt-toggle-button-group.component.ts:values`
- **В множественном выборе нажатие добавляет сегмент или снимает его** — `rt-toggle-button-group.component.ts:onOptionClick`
- **Множественный выбор отдаёт весь набор выбранного, а не разницу** — `rt-toggle-button-group.component.ts:valuesChange`
- **Недоступный сегмент остаётся видимым и нажатие не пропускает** — `rt-toggle-button-group.component.ts:isDisabled`
- **Отключённая группа делает недоступными все свои сегменты** — `rt-toggle-button-group.component.ts:isDisabled`
- **Недоступность сегмента объявлена рядом с его подписью, а не отдельным списком** — `rt-toggle-button-group.model.ts:Option`

Пути от корня пакета: `projects/ui-kit-v2/src/lib/components/toggle-button-group/`.

- **Сценарий** — Тест
- **`SC-UKV-84`** — `rt-toggle-button-group.component.spec.ts`
- **`SC-UKV-85`** — `rt-toggle-button-group.component.spec.ts`
- **`SC-UKV-86`** — `rt-toggle-button-group.component.spec.ts`
- **`SC-UKV-87`** — `rt-toggle-button-group.component.spec.ts`
