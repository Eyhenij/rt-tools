# Наблюдения и груз наружу — где исполняются правила

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
- **Предложение выгружается файлом с адресом в заголовке.** — `projects/agent-kit/src/lib/proposals.ts:parseProposals`
- **Роль разбора закрытой задачи файлов не пишет.** — `projects/agent-kit/assets/commands/skill-curator.md:предложения`
- **Наружу уезжают только предложения с адресом «пакет».** — `projects/agent-kit/src/lib/shipment.ts:propose`
- **Отправка отказывает, если в тексте предложения найден адрес дерева.** — `projects/agent-kit/src/lib/proposals.ts:leaksIn`
- **Отправленное предложение помечается принявшим его месяцем и второй раз не уезжает.** — `projects/agent-kit/src/lib/proposals.ts:markSent`
- **Адрес приёма читается из настройки дерева.** — `projects/agent-kit/src/lib/config.ts:intake`
- **Наружу не уходит ничего, чего не отправил человек командой.** — `projects/agent-kit/src/lib/shipment.ts:propose`
- **Незнакомый довод отправку кончает, а не пропускается молча.** — `projects/agent-kit/src/lib/argv.ts:unknownFlagsIn`
- **Сведение отделяет пришедшее из нескольких деревьев от пришедшего из одного.** — `.claude/commands/agent-kit-digest.md:overrides`
- **Выпуск версии остаётся отдельным решением владельца.** — `.claude/commands/agent-kit-digest.md:ARGUMENTS`
- **Команда кладёт блок на диск и в сеть не ходит.** — `projects/agent-kit/assets/commands/feedback.md:propose`
- **Блок собирает агент, а не человек.** — `projects/agent-kit/assets/commands/feedback.md:ARGUMENTS`
- **Слово без ясного адреса не превращается в блок молча.** — `projects/agent-kit/assets/commands/feedback.md:ARGUMENTS`
- **Блок ложится в файл сегодняшнего дня, а не в свой.** — `projects/agent-kit/assets/commands/feedback.md:date`
- **Файл дня заводится с образца, если его ещё нет.** — `projects/agent-kit/assets/commands/feedback.md:cp`
- **Текст блока проверяется на адрес дерева тем же, чем проверяется всё остальное.** — `projects/agent-kit/src/lib/proposals.ts:leaksIn`
- **Команда говорит, куда лёг блок и чем он уедет.** — `projects/agent-kit/assets/commands/feedback.md:dry-run`
- **Надстройка считается состоянием, а не событием.** — `projects/agent-kit/src/lib/snapshot.ts:treeSnapshot`
- **Снимок надстроек называет ресурс, раздел и род правки, а не содержимое правки.** — `projects/agent-kit/src/lib/snapshot.ts:overridesOf`
- **Заголовок своего раздела наружу не уезжает.** — `projects/agent-kit/src/lib/cargo.ts:TOverrideKind`
- **Снимок называет невыбранное наравне с надстроенным.** — `projects/agent-kit/src/lib/snapshot.ts:unpickedOf`
- **Наблюдение несёт признак дерева, и адрес дерева по нему не восстанавливается.** — `projects/agent-kit/src/lib/shipment.ts:treeSlugOf`
- **Признак дерева одинаков у всех, кто работает с одним репозиторием.** — `projects/agent-kit/src/lib/shipment.ts:remoteMarkOf`
- **Дерево без удалённого репозитория называет свой признак настройкой.** — `projects/agent-kit/src/lib/shipment.ts:treeSlugOf`
- **Строка наблюдения несёт версию схемы записи.** — `projects/agent-kit/src/lib/cargo.ts:CARGO_SCHEMA_VERSION`
- **Строки неизвестной версии схемы считаются отдельно и называются числом.** — `projects/agent-kit/src/lib/observations.ts:parseObservation`
- **Груз уезжает при каждом прогоне отправки, а предложения — когда они есть.** — `projects/agent-kit/src/lib/shipment.ts:shipmentsOf`
- **Проверка на адрес дерева накрывает сводку и предложения, но не разбор происшествия.** — `projects/agent-kit/src/lib/shipment.ts:leaksOfCargo`
- **Найденный в грузе адрес дерева отбивает отправку целиком, а не свой блок.** — `projects/agent-kit/src/lib/shipment.ts:propose`
- **Груз уезжает в закрытый приём, а не в открытую очередь работ.** — `projects/agent-kit/src/lib/ship.ts:intakeUrl`
- **Адрес приёма объявлен настройкой дерева, а не зашит в код пакета.** — `projects/agent-kit/src/lib/shipment.ts:IShipOptions`
- **Дерево представляется приёму токеном, а реестр держит только его хеш.** — `projects/agent-kit/src/lib/cargo.ts:TREE_TOKEN_HEADER`
- **Токен выдаётся и отзывается командами приёмника.** — `projects/agent-kit/src/lib/shipment.ts:readToken`
- **Одна запись на пару «дерево — месяц»: нашлась — дописывается, не нашлась — заводится.** — `projects/agent-kit/src/lib/cargo.ts:IIntakeAccepted`
- **Груз каждого рода принимается своей операцией.** — `projects/agent-kit/src/lib/ship.ts:httpShip`
- **Выключатель наблюдений гасит и отправку целиком, вместе со снимком надстроек.** — `projects/agent-kit/src/lib/observations.ts:OBSERVATIONS_DIR`
- **Дерево заводится двумя путями, и человек выбирает доводом.** — `projects/agent-kit/src/lib/enroll.ts:pathChosen`
- **Выданный токен в сеть не уходит.** — `projects/agent-kit/src/lib/enroll.ts:accept`
- **Два довода вместе отбиваются.** — `projects/agent-kit/src/lib/enroll.ts:pathChosen`
- **Ни одного довода — отказ называет оба пути.** — `projects/agent-kit/src/lib/enroll.ts:pathChosen`
- **Токен ложится на диск одинаково, каким бы путём ни пришёл.** — `projects/agent-kit/src/lib/enroll.ts:lay`
- **Лежащий токен не перезаписывается молча ни у одного из путей.** — `projects/agent-kit/src/lib/enroll.ts:enroll`
- **Проверки, общие обоим путям, стоят до развилки.** — `projects/agent-kit/src/lib/enroll.ts:enroll`
- **Адрес приёма и запрет открытого пути требуются только обмену по коду.** — `projects/agent-kit/src/lib/enroll.ts:intakeAllowed`
- **Блок предложения называет ближайшее утверждение ресурса, и цитата проверяется.** — `projects/agent-kit/src/lib/proposals.ts:nearestMissing`
- **Похожесть текстов повтора не отличает, и порогом она не судится.** — `projects/agent-kit/src/lib/proposals.ts:NEAREST`
- **Отбивается блок поимённо, а соседние едут.** — `projects/agent-kit/src/lib/shipment.ts:propose`
- **Отбитый блок остаётся на диске с отметкой и причиной.** — `projects/agent-kit/src/lib/shipment.ts:markRefused`
- **Проверка на адрес дерева судит все готовые блоки, а не одни уезжающие.** — `projects/agent-kit/src/lib/shipment.ts:leaksOfCargo`
- **Настоящий прогон называет перечень груза до его результатов.** — `projects/agent-kit/src/lib/shipment.ts:manifest`
- **Сухой прогон объявляется первой строкой, а не окончанием глагола.** — `projects/agent-kit/src/lib/shipment.ts:propose`
- **Гард, не отбивший за отрезок ни разу, стоит в сводке отдельной строкой.** — `projects/agent-kit/src/lib/observations.ts:summarize` — поле `silentGuards`; сценарий `SC-AK-809`
- **Гардом сводка считает того, кто умеет записать свой отбой.** — `projects/agent-kit/src/lib/commands.ts:guardsOfTree` — имя берётся из самой записи отбоя; сценарий `SC-AK-809`
- **Перечень гардов сводка спрашивает у дерева, а не у пакета.** — `projects/agent-kit/src/lib/commands.ts:stats` — каталог хуков берётся из раскладки дерева; сценарий `SC-AK-809`
- **Молчание гарда отказом не делается.** — `projects/agent-kit/src/lib/commands.ts:statsLines` — раздел печатается наравне с прочими и кода возврата не меняет; сценарий `SC-AK-810`
