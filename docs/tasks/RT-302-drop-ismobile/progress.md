# Ход работы

## Где стоим

- **Состояние:** `работа-закрыта`
- **Этап:** 3 из 3 — все закрыты
- **Сделано:** вход снят у семнадцати компонентов, `narrow` читает только службу, истории
  витрины переведены на рамку кадра, спека пагинации переписана, журнал разделён и получил
  запись о ломающем изменении, правило дерева и замысел приведены к новому договору
- **Следующий шаг:** заявку открывает владелец — ветки этого захода локальные
- **Незакоммиченное:** нет
- **Ждём владельца:** да — открытие заявки и слияние
- **PR:** не открывался: заход автономный, пуш запрещён словом владельца

## Решения по ходу

- **Мобильные истории переводятся на рамку кадра** — вход был единственным способом показать
  узкий вид на широком окне. Затронутый этап замысла: 2. Рамка объявлена в настройке показа
  первого кита именем `narrow` — 360 пикселей при пороге 599.
- **Журнал кита разделён** — с новой записью он перевалил предел длины, и прежняя линия номеров
  `0.1.x`–`0.3.x` вынесена в `CHANGELOG-0.1-0.3.md` целиком, без правок. Затронутый этап
  замысла: 3.
- **Вход был объявлен у семнадцати компонентов, а не у восьми** — разведка папки задачи
  считала по одной форме объявления и пропустила вторую. Число в журнале названо по разбору
  правки, а не по разведке. Затронутый этап замысла: 1.

## Заходы

### 2026-08-31

- Папка задачи заведена; пятнадцатая работа ночи, ветка стоит на RT-303.
- Вход снят, витрина и спека переведены, журнал разделён и получил запись о ломающем изменении.

## Передача захода

Собрана хуком перед сжатием контекста (auto).

**Рабочее дерево:** /Users/eyhenij/WebstormProjects/rt-tools
**Ветка:** RT-302-drop-ismobile

### Где стоим на минуту сжатия

- **Состояние:** `этап-идёт`
- **Этап:** 1 из 3 — снятие входа с компонентов
- **Следующий шаг:** снять входы и упростить `narrow`
- **PR:** ещё не открыт — заход автономный, ветки локальные

Ход работы целиком — `docs/tasks/RT-302-drop-ismobile/progress.md`; замысел рядом с ним.

### Незакоммиченное

```
 M projects/ui-kit/src/lib/ui-kit/aside/components/container/aside-container.component.ts
 M projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/actions/rtui-dynamic-selector-list-actions.component.ts
 M projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/dynamic-selectors-directive.ts
 M projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/multi-selector-popup/rtui-multi-selector-popup.component.ts
 M projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/selected-list/rtui-dynamic-selector-selected-list.component.ts
 M projects/ui-kit/src/lib/ui-kit/header/header.component.ts
 M projects/ui-kit/src/lib/ui-kit/image-uploader/image-uploader/rtui-image-upload.component.ts
 M projects/ui-kit/src/lib/ui-kit/info-badge/info-badge.component.ts
 M projects/ui-kit/src/lib/ui-kit/side-menu/menu-sub-item/rtui-side-menu-sub-item.component.ts
 M projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts
 M projects/ui-kit/src/lib/ui-kit/table/components/clear-search-button/rtui-clear-button.component.ts
 M projects/ui-kit/src/lib/ui-kit/table/components/pagination-view/rtui-pagination.component.ts
 M projects/ui-kit/src/lib/ui-kit/table/components/table-base-cell/table-base-cell.component.ts
 M projects/ui-kit/src/lib/ui-kit/table/components/table-container/table-container.component.ts
 M projects/ui-kit/src/lib/ui-kit/table/components/table-header-filter-cell/table-header-filter-cell.component.ts
 M projects/ui-kit/src/lib/ui-kit/table/components/table/rtui-table.component.ts
 M projects/ui-kit/src/lib/ui-kit/table/dynamic-list.component.ts
```

### Коммиты сверх главной

```
212ed2ec2 docs(rt:ui-kit): папка задачи о снятии входа узкого экрана
aaa7d8843 chore: версии зависимостей записаны точными номерами
18a67c144 chore: папка задачи о точных номерах версий
f1507e99b refactor(rt:agent-kit): три закона приложения ушли из пакета
853ec292f docs(rt:agent-kit): папка задачи о законах приложения вне пакета
57a0a3b3e feat(rt:agent-kit): сверка очереди видит многозаходную работу и упавшую выкатку
9c4b8b956 docs(rt:agent-kit): папка задачи о многозаходной работе и красной выкатке
b858868ca feat(rt:agent-kit): пропуск сверки схемы кончается там, где ветка тронула хранилище
5a751223a docs(rt:agent-kit): папка задачи о прогоне цепочки миграций в гейте
8b60362bd feat(rt:agent-kit): набор перед пушем виден целиком, а снятое из умолчания названо
cc7d649fb docs(rt:agent-kit): папка задачи о видимом наборе гейта пуша
2ee53e0c6 feat(rt:agent-kit): главная ветка берётся удалённой ссылкой и в действиях
ab4e2b830 docs(rt:agent-kit): папка задачи об удалённой ссылке главной ветки
59a17f561 feat(rt:agent-kit): словарь называет источник своей правки сам
2bbbe8c48 docs(rt:agent-kit): папка задачи об источнике правки словаря
574ff156c feat(rt:agent-kit): гард разговора видит, что на этот вопрос уже отвечали
09b7a0b55 docs(rt:agent-kit): папка задачи о втором признаке гарда разговора
bc8fabb48 chore(rt:agent-kit): раскладка проверки единообразия и её признаков
dcff40342 docs(rt:agent-kit): папка задачи RT-546 разобрана
01e365dcd feat(rt:agent-kit): признаки нативных тегов знают о второй дизайн-системе
```

Написана хуком перед сжатием контекста. Всё, что здесь стоит, проверяется деревом:
передача пересказывает записанное и описывает минуту, когда её собрали.
