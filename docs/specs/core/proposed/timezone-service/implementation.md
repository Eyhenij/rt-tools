# Привязка — часовой пояс читателя

- **Пояс спрашивается у окружения только в браузере** — `timezone.service.ts:getCurrentTimezone`
- **Там, где пояса читателя знать неоткуда, отдаётся согласованный пояс** — `timezone.service.ts:FALLBACK_TIMEZONE`
- **Пояс читается при каждом обращении** — `timezone.service.ts:getCurrentTimezone`
- **Обращение к окружению стоит в службе, а не в вызывающем** — `timezone.service.ts:RtTimezoneService`

Пути от корня пакета: `projects/core/src/lib/services/`.

- **Сценарий** — Тест
- **`SC-CR-05`** — `timezone.service.spec.ts`
- **`SC-CR-06`** — `timezone.service.spec.ts`
- **`SC-CR-07`** — `timezone.service.spec.ts`
