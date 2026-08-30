# Чем исполняется — первый кит

Правило домена — слева, место, где оно исполняется, — справа. Пути даны от корня дерева: домен
описывает четыре предмета из разных каталогов кита, и общего корня, от которого их считать, у них
нет.

- **Кнопка копирования не показывается у пустой ячейки.** — `projects/ui-kit/src/lib/ui-kit/table/components/table-base-cell/table-base-cell.component.ts:isCellEmpty`
- **Пустым считается то же, что кит считает пустым везде.** — `projects/ui-kit/src/lib/ui-kit/table/components/table-base-cell/table-base-cell.component.ts:isCellEmpty`
- **Признак копируемости колонки остаётся на колонке.** — `projects/ui-kit/src/lib/ui-kit/table/util/table-column.interface.ts:copyable`
- **Ячейка со значением ведёт себя как раньше.** — `projects/ui-kit/src/lib/ui-kit/table/components/table-base-cell/table-base-cell.component.ts:onCopyToClipboard`
- **Спиннер ждёт задержку и только потом становится виден.** — `projects/ui-kit/src/lib/ui-kit/spinner/spinner.component.ts:visible`
- **Умолчание задержки — ноль.** — `projects/ui-kit/src/lib/ui-kit/spinner/spinner.component.ts:delay`
- **Задержка отсчитывается от вставки спиннера, а не от первой перерисовки.** — `projects/ui-kit/src/lib/ui-kit/spinner/spinner.component.ts:visible`
- **Снятый до срока спиннер счётчик за собой убирает.** — `projects/ui-kit/src/lib/ui-kit/spinner/spinner.component.ts:visible`
- **Задержка живёт в самом спиннере.** — `projects/ui-kit/src/lib/ui-kit/spinner/spinner.component.ts:delay`
- **Клавиша Esc шторку не закрывает.** — `projects/ui-kit/src/lib/ui-kit/aside/aside.service.ts:closesOf`
- **Прежнее поведение остаётся доступным настройкой открытия.** — `projects/ui-kit/src/lib/ui-kit/aside/aside.types.ts:IAsideConfig`
- **Клик по подложке и уход по маршруту закрывают шторку по-прежнему.** — `projects/ui-kit/src/lib/ui-kit/aside/aside.service.ts:closesOf`
- **Запрещённый источник не подписывается вовсе.** — `projects/ui-kit/src/lib/ui-kit/aside/aside.service.ts:closesOf`
- **Программное закрытие настройкой не гасится.** — `projects/ui-kit/src/lib/ui-kit/aside/aside.service.ts:open`
- **Таблица отдаёт сортировку только по той колонке, которую сама рисует.** — `projects/ui-kit/src/lib/ui-kit/table/components/table/rtui-table.component.ts:onSortChange`
- **Имя сверяется с тем же набором колонок, который таблица рисует.** — `projects/ui-kit/src/lib/ui-kit/table/components/table/rtui-table.component.ts:sortOfKnownColumn`
- **Несовпавшее имя не уходит наружу вовсе.** — `projects/ui-kit/src/lib/ui-kit/table/components/table/rtui-table.component.ts:sortOfKnownColumn`

Сценарии домена связаны с тестами номером в заголовке теста, а не таблицей здесь: связь сверяется
в обе стороны сверкой спеков.
