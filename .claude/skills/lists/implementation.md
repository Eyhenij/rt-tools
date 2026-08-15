# lists — что здесь своё

Имена и привязки этого дерева при правиле `SKILL.md` рядом.

Списочного экрана в дереве пока нет ни одного: админка поднята каркасом, входом и оболочкой с
одним пустым разделом, а разделы груза заводит своя задача. Поэтому вторая колонка почти везде
называет не экран, а то, чем он будет собран, — готовое из кита `@rt-tools/ui-kit-v2`. Кит
здесь и есть источник вида: он ведёт таблицу, тулбар, переключатель страниц и настройку
столбцов, и нарушить их правилами проекта нечем.

## Как это называется здесь

| В правиле                         | Здесь                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `<префикс>-`                      | `rt-` — префикс второго кита; первый кит с префиксом `rtui-` админку не собирает                |
| `rt-table`, вход `[dataSource]`   | он же: `rt-table` принимает `dataSource` сеттером поверх `CdkTable`                             |
| `vmToolbarLeft`, `vmToolbarRight` | `rtToolbarLeft`, `rtToolbarCenter`, `rtToolbarRight`                                            |
| `vmTableRow`                      | `rtTableRow`                                                                                    |
| `[vmTableRowActionsRowType]`      | `[rtTableRowActionsRowType]` на `ng-template[rtTableRowActions]`                                |
| `<префикс>-page`                  | своего компонента страницы в ките нет; промежутки задаёт общий слой раскладки кита              |
| `IList.Query.State`               | `IListState<T, M>` из `@rt-tools/utils` — `pageModel`, `sortModel`, `filterModel`, `searchTerm` |
| панель настройки столбцов         | `rt-table-settings-aside`; ключ хранения собирает сама таблица из `[tableId]`                   |

## Где это лежит

| Что                      | Где                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| таблица                  | `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts`                                                 |
| строка и меню строки     | `.../table/rt-table-row.directive.ts`, `.../table/rt-table-row-actions.directive.ts`                                |
| заголовок сортировки     | `.../table/sort-header/rt-table-sort-header.component.ts`                                                           |
| карточка на узком экране | `.../table/rt-table-card.directive.ts`                                                                              |
| настройка столбцов       | `.../table/settings-aside/rt-table-settings-aside.component.ts`, реестр — `.../table/rt-table-settings.registry.ts` |
| тулбар                   | `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts`                                             |
| переключатель страниц    | `projects/ui-kit-v2/src/lib/components/pagination/rt-pagination.component.ts`                                       |
| заголовок страницы       | `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts`                                     |
| типы выборки             | `projects/utils/src/lib/interfaces/list.interface.ts`                                                               |
| шина оповещений          | `projects/ui-kit-v2/src/lib/platform/notification-bus.service.ts`                                                   |
| где будут жить экраны    | `libs/message-bus-admin/<домен>/feature/list/` — семья заведена, домены груза нет                                   |

## Где исполняются статьи

Первая колонка — статья дословно, как она написана в разделе «Как закон применяется здесь»
(жирная часть пункта). Статья без строки и строка без статьи — расхождение: правило обещает то,
чего в дереве нет, либо в дереве стоит то, о чём правило молчит.

| Статья                                                                          | Где исполняется                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Страница собирается общим компонентом страницы списка, а не своей разметкой.    | Общего компонента страницы списка в ките нет; собирают её три готовых — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:RtPageHeaderComponent`, `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts:RtToolbarComponent` и `projects/ui-kit-v2/src/lib/components/pagination/rt-pagination.component.ts:RtPaginationComponent`. Стоит ли свести их в один, покажет первый же список — до него сводить нечего. |
| Механика экрана берётся из общей основы списочного экрана, а не пишется заново. | Основы списочного экрана в дереве нет: `BaseListStoreService` здесь не объявлен. Ближайшее готовое — `projects/store/src/lib/base-async-store.service.ts:BaseAsyncStoreService`. Заводится вместе с первым списком, а не раньше.                                                                                                                                                                                                                               |
| Таблицу экран объявляет сам и кладёт внутрь шаблона.                            | `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts:columnDefs` — `contentChildren(CdkColumnDef)`: столбцы таблица собирает запросом по содержимому, и через посредника они до неё не доходят.                                                                                                                                                                                                                                                  |
| Список собирается `<префикс>-table`, а не своей разметкой.                      | `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts:RtTableComponent` — скелетоны, пустое состояние, карточки и настройка столбцов её входы: `[loading]`, `[emptyMessage]`, `[cards]`, `[columnsConfig]`.                                                                                                                                                                                                                                       |
| Строки объявляются на `rowsTable.displayedColumns()`, а не на своём списке.     | `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts:displayedColumns` — столбец с меню таблица дописывает сама по `[showRowActions]`.                                                                                                                                                                                                                                                                                                           |
| Заголовок сортируемой колонки называет поле сервера, а не ключ колонки.         | `projects/ui-kit-v2/src/lib/components/table/rt-table-sort.logic.ts:nextSort` — заголовок несёт имя поля, и оно же уезжает на сервер в `ISortModel.propertyName`; второй карты перевода нет.                                                                                                                                                                                                                                                                   |
| Сортируема та колонка, у чьей ячейки шапки стоит заголовок сортировки.          | `projects/ui-kit-v2/src/lib/components/table/sort-header/rt-table-sort-header.component.ts:RtTableSortHeaderComponent` — отдельного списка сортируемых полей рядом со столбцами нет, расходиться нечему.                                                                                                                                                                                                                                                       |
| Клик по строке открывает запись, а меню — для действий над ней.                 | `projects/ui-kit-v2/src/lib/components/table/rt-table-row.directive.ts:RtTableRowDirective` — активация мышью и с клавиатуры; вид нажимаемой строки даёт вход `[clickable]` таблицы.                                                                                                                                                                                                                                                                           |
| Доступность действия лежит полем строки, а не вызовом метода компонента.        | `projects/ui-kit-v2/src/lib/components/table/rt-table-row-actions.logic.ts:rowHasAvailableActions` — кит судит по строке, а не зовёт метод экрана. Само поле заводит экран; экранов пока нет, и проверки на это в дереве тоже.                                                                                                                                                                                                                                 |
| Недоступное сейчас действие в меню строки не рисуется вовсе.                    | `projects/ui-kit-v2/src/lib/components/table/rt-table-row-actions.directive.ts:RtTableRowActionsDirective` — пункты проецирует экран своим шаблоном, и `@if` по полю строки стоит там же.                                                                                                                                                                                                                                                                      |
| Кнопка меню не показывается, если у строки не осталось доступных действий.      | `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts:rowHasActions` — предикат по строке; по содержимому спроецированного шаблона это не считается.                                                                                                                                                                                                                                                                                              |
| Отказ загрузки подаётся тостом, а не строкой над таблицей.                      | `projects/ui-kit-v2/src/lib/platform/notification-bus.service.ts:NotificationBus` — общая шина кита, метод `error`.                                                                                                                                                                                                                                                                                                                                            |
| Экран берёт сортировку и условия отбора из ответа, а не из своего запроса.      | `libs/message-bus-common/src/lib/page.ts:IPageAsked` — разобранная выборка, которую приёмник вернёт вместе со страницей. Операции чтения списка у него пока нет: заводится вместе с первым разделом груза.                                                                                                                                                                                                                                                     |
| Строка списка получает короткую модель сущности, а не полную.                   | `libs/message-bus-common/src/lib/page.ts:IPage` — страница строк того типа, который отдаст операция. Уровней нет ни у одной модели дерева: то же расхождение записано у правила `entity-models`.                                                                                                                                                                                                                                                               |

## Что ещё стоит знать при чтении кода

- Кит здесь пишется тем же деревом, что и админка. Правка, которой списку не хватает, чаще
  идёт в кит, а не в экран: экран, обошедший таблицу своей разметкой, второй раз уже не
  выправляется.
- Настройка столбцов ведётся ключом `[tableId]`, а хранит её порт хранилища кита
  (`ERtStorageKeys.TableColumnsPrefix`). Своего ключа экран не заводит.
- Типы выборки лежат в `@rt-tools/utils` и опубликованы наружу: их же читает `rt-pagination`.
  Второго набора этих типов в дереве нет, и заводить его в админке нельзя.

## Чем это проверяется

- `pnpm exec nx test @rt-tools/ui-kit-v2` — спеки таблицы, её строки, меню строки и сортировки
  держат то, что правило зовёт готовым.
- Витрина второго кита: истории таблицы показывают загрузку, пустое состояние и карточки — то
  есть ровно те ветки, которые экран норовит переписать своей разметкой.
- Гейт правил требует это правило на файлах `libs/message-bus-admin/*/feature/list/**` —
  ветка в `.claude/rt-kit/gate-map.sh`.
