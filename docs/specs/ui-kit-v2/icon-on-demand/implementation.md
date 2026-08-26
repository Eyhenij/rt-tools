# Чем исполняется — значок по требованию

Первая колонка — правило спека рядом дословно. Вторая — где оно исполняется в дереве; там же
назван сценарий, которым это проверяется, а чем именно покрыт каждый сценарий, сказано в
`scenarios.md`.

Правило без строки и строка без правила — расхождение: спек обещает то, чего в дереве нет, либо
в дереве стоит то, о чём спек молчит.

- **Значок едет по запросу имени, а не вперёд.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts:request` — вызов на одно имя, файл забирается только по нему; сценарий `SC-UKV-58`
- **Повторный запрос того же имени сети не трогает.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts:#requested` — имена, за которыми уже сходили; сценарий `SC-UKV-59`
- **Отказ одного имени гасит только его значок.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts:#load` — отказ гасится внутри своего потока; сценарий `SC-UKV-60`
- **Обе разметки значка просят одинаково.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.component.ts:RtIconComponent`, `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts:#createIcon` — обе зовут один и тот же вызов реестра; сценарий `SC-UKV-61`
- **Символ, уже лежащий в спрайте страницы, запроса не даёт.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts:RT_ICON_SYMBOL_ID_PREFIX` — имя символа ищется в разметке до похода в сеть; сценарий `SC-UKV-63`
- **Смена имени у нарисованного значка тянет новое имя.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.component.ts:RtIconComponent` — эффект следит за входом имени; сценарий `SC-UKV-62`
- **На сервере набор не грузится.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts:#platform` — ранний выход по признаку среды; сценарий `SC-UKV-64`
- **Предзагрузки всего набора у кита нет.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.providers.ts:provideRtIcons` — приём отдаёт только адрес набора и не заводит ни одного шага подъёма; сценарий `SC-UKV-65`
