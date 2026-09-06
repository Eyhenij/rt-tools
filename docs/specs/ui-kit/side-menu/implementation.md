# Чем исполняется — второй уровень бокового меню

Правило поддомена — слева, место, где оно исполняется, — справа. Пути даны от корня дерева.

- **Мода подменю приходит входом, и умолчание — сегодняшнее поведение.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:subMenuMode`
- **Нажатие переключателя моду не меняет, а просит её.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:onSubMenuModeToggle`
- **Закреплённое подменю показывает активный пункт.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:#pinnedSubMenu`
- **Закрепление не меняет того, что видно.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:#pinnedSubMenu`
- **Нажатие пункта полосы переставляет закреплённое подменю на его раздел.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:#pickPinnedSubMenu`
- **Пункт со своим адресом и без разделов закреплённое подменю снимает.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:#pickPinnedSubMenu`
- **Закреплённой панели нечего показать — места она не занимает.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.scss:.rtui-sub-side-menu--opened`, `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.html:rtui-side-menu-resizer`
- **Закреплённое подменю не закрывается ни уходом указателя, ни переходом по своему пункту.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:toggleSubMenu`
- **Под закреплённым подменю нет подложки.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:isPinned`
- **Поле ищет по открытому подменю, а не по всем разделам.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:visibleSubMenuItems`
- **Отбор идёт по подстроке подписи без учёта регистра, а пустой запрос показывает всё.** — `projects/ui-kit/src/lib/ui-kit/side-menu/side-menu.logic.ts:filterSubMenuItems`
- **Запрос живёт, пока подменю открыто.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:closeSubMenu`
- **Подписи поля, переключателя и пустого отбора зашиты по-английски.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:searchLabel`
- **На узком экране закрепления нет, а поиск есть.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:isPinned`
- **Ручка тяги захватывается шире, чем видна.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.scss:resizer` — зона захвата, видимая полоса и свес объявлены своими свойствами меню; красится псевдоэлемент внутри зоны

Сценарии поддомена связаны с тестами номером в заголовке теста, а не таблицей здесь: связь
сверяется в обе стороны сверкой спеков.
