# Чем исполняется — первый кит

Правило домена — слева, место, где оно исполняется, — справа. Пути даны от корня дерева: домен
описывает пять предметов из разных каталогов кита, и общего корня, от которого их считать, у них
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
- **Настройку таблицы показывает последнее чтение, а не то, что ответило последним.** — `projects/ui-kit/src/lib/ui-kit/table/util/table-config.service.ts:readSource`
- **Запись и снятие настройки доходят до хранилища в порядке вызовов.** — `projects/ui-kit/src/lib/ui-kit/table/util/table-config.service.ts:writeSource`
- **Панель настройки столбцов открывается одна.** — `projects/ui-kit/src/lib/ui-kit/table/components/table-container/table-container.component.ts:openConfigAsideSource`
- **Мода подменю приходит входом, и умолчание — сегодняшнее поведение.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:subMenuMode`
- **Нажатие переключателя моду не меняет, а просит её.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:onSubMenuModeToggle`
- **Закреплённое подменю показывает активный пункт.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:#pinnedSubMenu`
- **Закрепление не меняет того, что видно.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:#pinnedSubMenu`
- **Закреплённое подменю не закрывается ни уходом указателя, ни переходом по своему пункту.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:toggleSubMenu`
- **Под закреплённым подменю нет подложки.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:isPinned`
- **Поле ищет по открытому подменю, а не по всем разделам.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:visibleSubMenuItems`
- **Отбор идёт по подстроке подписи без учёта регистра, а пустой запрос показывает всё.** — `projects/ui-kit/src/lib/ui-kit/side-menu/side-menu.logic.ts:filterSubMenuItems`
- **Запрос живёт, пока подменю открыто.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:closeSubMenu`
- **Подписи поля, переключателя и пустого отбора зашиты по-английски.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:searchLabel`
- **На узком экране закрепления нет, а поиск есть.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:isPinned`
- **Ручка тяги ловится шире, чем видна.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.scss:resizer` — зона захвата, видимая полоса и свес объявлены своими свойствами меню; красится псевдоэлемент внутри зоны

Сценарии домена связаны с тестами номером в заголовке теста, а не таблицей здесь: связь сверяется
в обе стороны сверкой спеков.
