# Чем исполняется — панель раздела: закрепление и поиск

Первая колонка — правило спека рядом дословно. Вторая — где оно исполняется в дереве; там же
назван сценарий, которым это проверяется, а чем именно покрыт каждый сценарий, сказано в
`scenarios.md`.

Правило без строки и строка без правила — расхождение: спек обещает то, чего в дереве нет, либо
в дереве стоит то, о чём спек молчит.

- **Мода панели приходит входом, а нажатие переключателя уходит выходом.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:onPanelModeToggle`; сценарий `SC-UKV-98`
- **Умолчание моды — всплывающая.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:panelMode`; сценарий `SC-UKV-96`
- **Закреплённая панель стоит в потоке разметки, а не поверх страницы.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:pinnedSection`; сценарий `SC-UKV-97`
- **Закреплённая мода показывает панель раздела, чей адрес открыт.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.logic.ts:pinnedSectionOf`; сценарий `SC-UKV-99`
- **Активного раздела нет — закреплённой панели нет вовсе.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.logic.ts:pinnedSectionOf`; сценарий `SC-UKV-100`
- **Обе моды рисуются одним шаблоном.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.html:panelTpl` — попап берёт тот же шаблон контекстом, а в закреплённой моде выключен
- **Запрос поиска отбирает пункты по подстроке подписи, без учёта регистра.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.logic.ts:filterSection`; сценарии `SC-UKV-101`, `SC-UKV-102`, `SC-UKV-103`, `SC-UKV-104`
- **Пустой запрос возвращает набор целиком.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.logic.ts:filterSection`; сценарий `SC-UKV-105`
- **Отбор считается вне шаблона.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:panelViews` — шаблон получает готовую пару «раздел и его отобранная панель»
- **Запрос поиска живёт, пока панель открыта, и предпочтением не является.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:onPanelClosed`
- **На узком экране переключателя не видно.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:pinnedSection`; сценарий `SC-UKV-106`
