# lists — что здесь своё

Имена и привязки этого дерева при правиле `SKILL.md` рядом.

Списочных экранов в дереве четыре — разборы происшествий, предложения, сводки деревьев и
приглашения, — и собраны они одной основой: общий вид страницы и общая механика экрана лежат в
`common/core`, а своего у раздела ровно три вещи — стор, столбцы и поля порядка. Источник вида
при этом кит
`@rt-tools/ui-kit-v2`: он ведёт таблицу, тулбар, переключатель страниц и настройку столбцов, и
нарушить их правилами проекта нечем.

Говорит раздел с общей страницей слотами и токеном хоста: отбор и свои кнопки он кладёт в слоты,
а чтение, страницу, её размер и настройку столбцов страница спрашивает у него самого. Ни одного
события у страницы нет.

## Как это называется здесь

| В правиле                                       | Здесь                                                                                           |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `<префикс>-`                                    | `rt-` — префикс второго кита; первый кит с префиксом `rtui-` админку не собирает                |
| `rt-table`, вход `[dataSource]`                 | он же: `rt-table` принимает `dataSource` сеттером поверх `CdkTable`                             |
| `<префикс>ToolbarLeft`, `<префикс>ToolbarRight` | `rtToolbarLeft`, `rtToolbarCenter`, `rtToolbarRight`                                            |
| `<префикс>TableRow`                             | `rtTableRow`                                                                                    |
| `[<префикс>TableRowActionsRowType]`             | `[rtTableRowActionsRowType]` на `ng-template[rtTableRowActions]`                                |
| `<префикс>-page`                                | `admin-list-page` в общем слое админки: заголовок, тулбар, место таблицы, отказ и страницы      |
| слоты общей страницы                            | `adminListToolbarLeft`, `adminListToolbarRight`, `adminListAboveTable`                          |
| хост списочной страницы                         | токен `ADMIN_LIST_HOST`, модель `IAdminListHost`, провайдер `provideAdminListHost`              |
| префикс якорей раздела                          | вход `qaPrefix` у `admin-list-page`: `postmortems`, `proposals`, `summaries`, `invites`         |
| `IList.Query.State`                             | `IListState<T, M>` из `@rt-tools/utils` — `pageModel`, `sortModel`, `filterModel`, `searchTerm` |
| панель настройки столбцов                       | `rt-table-settings-aside`; ключ хранения собирает сама таблица из `[tableId]`                   |

## Где это лежит

| Что                      | Где                                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| таблица                  | `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts`                                                                           |
| строка и меню строки     | `.../table/rt-table-row.directive.ts`, `.../table/rt-table-row-actions.directive.ts`                                                          |
| заголовок сортировки     | `.../table/sort-header/rt-table-sort-header.component.ts`                                                                                     |
| карточка на узком экране | `.../table/rt-table-card.directive.ts`                                                                                                        |
| настройка столбцов       | `.../table/settings-aside/rt-table-settings-aside.component.ts`, реестр — `.../table/rt-table-settings.registry.ts`                           |
| тулбар                   | `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts`                                                                       |
| переключатель страниц    | `projects/ui-kit-v2/src/lib/components/pagination/rt-pagination.component.ts`                                                                 |
| заголовок страницы       | `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts`                                                               |
| типы выборки             | `projects/utils/src/lib/interfaces/list.interface.ts`                                                                                         |
| шина оповещений          | `projects/ui-kit-v2/src/lib/platform/notification-bus.service.ts`                                                                             |
| экраны разделов          | `libs/message-bus-admin/postmortems/feature/list/`, `.../proposals/feature/list/`, `.../summaries/feature/list/`, `.../invites/feature/list/` |
| общий вид страницы       | `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts`                                                        |
| общая механика экрана    | `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts`                                                                |
| общая основа стора       | `libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts`                                                             |
| выборка в адресе         | `libs/message-bus-admin/common/core/util/src/lib/list-query.ts`                                                                               |
| токен хоста страницы     | `libs/message-bus-admin/common/core/util/src/lib/list-host.ts`                                                                                |
| отбор по дереву          | `libs/message-bus-admin/common/core/ui/src/lib/tree-filter/admin-tree-filter.component.ts`                                                    |
| сквозные спеки списков   | `apps/message-bus-admin-e2e/src/postmortems-list.spec.ts`, `apps/message-bus-admin-e2e/src/list-states.spec.ts`                               |

## Где исполняются статьи

Первая колонка — статья дословно, как она написана в разделе «Как закон применяется здесь»
(жирная часть пункта). Статья без строки и строка без статьи — расхождение: правило обещает то,
чего в дереве нет, либо в дереве стоит то, о чём правило молчит.

| Статья                                                                          | Где исполняется                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Страница собирается общим компонентом страницы списка, а не своей разметкой.    | `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:AdminListPageComponent` — заголовок с подсказкой, тулбар со слотами, место под таблицу, отказ с повтором и переключатель страниц; своего у раздела остаются таблица и то, что он кладёт в слоты.                                                                                                                                |
| Механика экрана берётся из общей основы списочного экрана, а не пишется заново. | `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:AdminListScreenBase` — выборка из адреса, чтение, порядок, отбор, уход в панель и открытие настройки столбцов; стор раздела наследует `libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts:AdminListStoreBase`.                                                                                             |
| Таблицу экран объявляет сам и кладёт внутрь шаблона.                            | `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts:columnDefs` — `contentChildren(CdkColumnDef)`: столбцы таблица собирает запросом по содержимому, и через посредника они до неё не доходят.                                                                                                                                                                                                         |
| Список собирается `<префикс>-table`, а не своей разметкой.                      | `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts:RtTableComponent` — скелетоны, пустое состояние, карточки и настройка столбцов её входы: `[loading]`, `[emptyMessage]`, `[cards]`, `[columnsConfig]`.                                                                                                                                                                                              |
| Строки объявляются на `rowsTable.displayedColumns()`, а не на своём списке.     | `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts:displayedColumns` — столбец с меню таблица дописывает сама по `[showRowActions]`.                                                                                                                                                                                                                                                                  |
| Заголовок сортируемой колонки называет поле сервера, а не ключ колонки.         | `projects/ui-kit-v2/src/lib/components/table/rt-table-sort.logic.ts:nextSort` — заголовок несёт имя поля, и оно же уезжает на сервер в `ISortModel.propertyName`; второй карты перевода нет.                                                                                                                                                                                                                          |
| Сортируема та колонка, у чьей ячейки шапки стоит заголовок сортировки.          | `projects/ui-kit-v2/src/lib/components/table/sort-header/rt-table-sort-header.component.ts:RtTableSortHeaderComponent` — отдельного списка сортируемых полей рядом со столбцами нет, расходиться нечему.                                                                                                                                                                                                              |
| Клик по строке открывает запись, а меню — для действий над ней.                 | `projects/ui-kit-v2/src/lib/components/table/rt-table-row.directive.ts:RtTableRowDirective` — активация мышью и с клавиатуры; вид нажимаемой строки даёт вход `[clickable]` таблицы.                                                                                                                                                                                                                                  |
| Доступность действия лежит полем строки, а не вызовом метода компонента.        | `projects/ui-kit-v2/src/lib/components/table/rt-table-row-actions.logic.ts:rowHasAvailableActions` — кит судит по строке, а не зовёт метод экрана. Меню строки ни один раздел админки не показывает: груз читается и не правится, и действий над строкой нет вовсе.                                                                                                                                                   |
| Недоступное сейчас действие в меню строки не рисуется вовсе.                    | `projects/ui-kit-v2/src/lib/components/table/rt-table-row-actions.directive.ts:RtTableRowActionsDirective` — пункты проецирует экран своим шаблоном, и `@if` по полю строки стоит там же.                                                                                                                                                                                                                             |
| Кнопка меню не показывается, если у строки не осталось доступных действий.      | `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts:rowHasActions` — предикат по строке; по содержимому спроецированного шаблона это не считается.                                                                                                                                                                                                                                                     |
| Отказ загрузки подаётся тостом, а не строкой над таблицей.                      | Расхождение с деревом, объявленное решением по ходу: отказ занимает место списка — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.html`. Договорённость требует состояния «отказ чтения с повтором», а тост уходит сам, и вернувшемуся к экрану повторять нечем. Шина кита при этом на месте — `projects/ui-kit-v2/src/lib/platform/notification-bus.service.ts:NotificationBus`. |
| Экран берёт сортировку и условия отбора из ответа, а не из своего запроса.      | Расхождение с деревом: выборка живёт в адресе раздела и читается оттуда — `libs/message-bus-admin/common/core/util/src/lib/list-query.ts:listQueryOf`. Ответ приёмника её не несёт вовсе: `libs/message-bus-common/src/lib/page.ts:IPage` отдаёт строки и общее число. Перезагрузка на второй странице отобранного списка иначе теряла бы и страницу, и отбор.                                                        |
| Строка списка получает короткую модель сущности, а не полную.                   | `libs/message-bus-admin/postmortems/util/src/lib/postmortem.model.ts:IPostmortem` — уровни `Short` и `Full`: в строке списка текста разбора нет вовсе, он приезжает панели отдельной операцией.                                                                                                                                                                                                                       |

## Что ещё стоит знать при чтении кода

- Кит здесь пишется тем же деревом, что и админка. Правка, которой списку не хватает, чаще
  идёт в кит, а не в экран: экран, обошедший таблицу своей разметкой, второй раз уже не
  выправляется.
- Настройка столбцов ведётся ключом `[tableId]`, а хранит её порт хранилища кита
  (`ERtStorageKeys.TableColumnsPrefix`). Своего ключа экран не заводит.
- Типы выборки лежат в `@rt-tools/utils` и опубликованы наружу: их же читает `rt-pagination`.
  Второго набора этих типов в дереве нет, и заводить его в админке нельзя.
- Статьи раздела «Чем экран говорит с общей страницей списка» дерево дописало к правилу
  надстройкой, и сверка привязок их не видит: она читает пункты одного раздела правила, а
  надстроечный раздел — второй. Привязки этих статей поэтому здесь, строками:
    - слоты и их директивы, подсказка, якоря от префикса —
      `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts`;
      узлы слота, подсказки и места над таблицей стоят под `@if` в шаблоне рядом;
    - токен хоста, модель спрошенного и провайдер —
      `libs/message-bus-admin/common/core/util/src/lib/list-host.ts`; отвечает на спрошенное
      `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts`;
    - отбор в левом слоте — шаблоны экранов в `libs/message-bus-admin/*/feature/list/`;
    - якоря страницы в сквозном наборе — `apps/message-bus-admin-e2e/src/support/admin.ts`,
      помощник `pageQa`;
    - якоря таблицы и строки от префикса —
      `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts`, поля
      `qaTable` и `qaRow`: раздел называет один `qaPrefix`, остальное собирает основа;
    - тег кита вместо атрибута на `<table>` — шаблоны четырёх экранов там же, а роль таблицы
      ставит себе сам кит: `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts`,
      поле `hostRole` — у нативной `<table>` она от тега, у элемента её нет;
    - вид пустоты и две его строки — тот же файл кита, поля `isEmpty`, `emptyText`,
      `emptyDescription` и `emptyIcon`; вторую строку раздел называет полем
      `emptyDescription` основы, а перебивает своим — как это делает
      `libs/message-bus-admin/invites/feature/list/src/lib/admin-invites-list.component.ts`.

## Чем это проверяется

- `pnpm exec nx test @rt-tools/ui-kit-v2` — спеки таблицы, её строки, меню строки и сортировки
  держат то, что правило зовёт готовым.
- Витрина второго кита: истории таблицы показывают загрузку, пустое состояние и карточки — то
  есть ровно те ветки, которые экран норовит переписать своей разметкой.
- `pnpm exec nx run message-bus-admin-e2e:e2e` — сквозной набор: страницы, порядок, отбор,
  панель, пустота, отказ и карточки на узком экране проверяются нажатиями в браузере.
- Гейт правил требует это правило на файлах `libs/message-bus-admin/*/feature/list/**` —
  ветка в `.claude/rt-kit/gate-map.sh`.
