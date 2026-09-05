# Наблюдения — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека рядом. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

Якорь здесь — слово, которое утверждение и держит. Сверка ищет его по всему файлу и любым словом
удовлетворяется, поэтому имя поля из чужой строки проходит её так же, как нужное предложение, — и
утверждение остаётся зелёным, когда сам текст роли переписан целиком.

- **Наблюдение записывается в дерево, а не во временный каталог.** — `projects/agent-kit/src/lib/observations.ts:OBSERVATIONS_DIR`
- **Наблюдение не называет из дерева ничего, кроме рода файла.** — `projects/agent-kit/assets/hooks/observe.sh:rt_observe_clean`
- **Запись наблюдений выключается настройкой дерева.** — `projects/agent-kit/assets/hooks/observe.sh:rt_observe_dir`
- **Гард, не сумевший записать наблюдение, пропускает действие.** — `projects/agent-kit/assets/hooks/observe.sh:rt_note`
- **Сводка называет и то, чем ни разу не пользовались.** — `projects/agent-kit/src/lib/observations.ts:summarize`
- **Сводка отвечает за отрезок дней, а не за всё время.** — `projects/agent-kit/src/lib/observations.ts:DEFAULT_DAYS`
- **Наблюдения старше срока хранения снимаются сводкой.** — `projects/agent-kit/src/lib/observations.ts:readObservations`
- **Надстройка считается состоянием, а не событием.** — `projects/agent-kit/src/lib/snapshot.ts:treeSnapshot`
- **Снимок надстроек называет ресурс, раздел и род правки, а не содержимое правки.** — `projects/agent-kit/src/lib/snapshot.ts:overridesOf`
- **Заголовок своего раздела наружу не уезжает.** — `projects/agent-kit/src/lib/cargo.ts:TOverrideKind`
- **Снимок называет невыбранное наравне с надстроенным.** — `projects/agent-kit/src/lib/snapshot.ts:unpickedOf`
- **Наблюдение несёт признак дерева, и адрес дерева по нему не восстанавливается.** — `projects/agent-kit/src/lib/shipment.ts:treeSlugOf`
- **Признак дерева одинаков у всех, кто работает с одним репозиторием.** — `projects/agent-kit/src/lib/shipment.ts:remoteMarkOf`
- **Дерево без удалённого репозитория называет свой признак настройкой.** — `projects/agent-kit/src/lib/shipment.ts:treeSlugOf`
- **Строка наблюдения несёт версию схемы записи.** — `projects/agent-kit/src/lib/cargo.ts:CARGO_SCHEMA_VERSION`
- **Строки неизвестной версии схемы считаются отдельно и называются числом.** — `projects/agent-kit/src/lib/observations.ts:parseObservation`
- **Гард, не отбивший за отрезок ни разу, стоит в сводке отдельной строкой.** — `projects/agent-kit/src/lib/observations.ts:summarize` — поле `silentGuards`; сценарий `SC-AK-809`
- **Гардом сводка считает того, кто заявил своё имя для наблюдений.** — `projects/agent-kit/src/lib/commands.ts:guardsOfTree` — имя берётся из заявки в шапке гарда; сценарий `SC-AK-809`
- **Отбой гарда записывает общий хвост отказа, а не сам гард.** — `projects/agent-kit/assets/hooks/deny-tail.sh:rt_deny_tail` — зовёт запись перед сборкой хвоста; сценарий `SC-AK-811`
- **Перечень гардов сводка спрашивает у дерева, а не у пакета.** — `projects/agent-kit/src/lib/commands.ts:stats` — каталог хуков берётся из раскладки дерева; сценарий `SC-AK-809`
- **Молчание гарда отказом не делается.** — `projects/agent-kit/src/lib/commands.ts:statsLines` — раздел печатается наравне с прочими и кода возврата не меняет; сценарий `SC-AK-810`
- **Исходы гейта пуша сводка считает отдельно от отбоев гардов.** — `projects/agent-kit/src/lib/observations.ts:pushGate` — счёт идёт по роду события `push-gate`; сценарий `SC-AK-836`
