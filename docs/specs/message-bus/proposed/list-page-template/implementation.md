# Привязка — страница списка по образцу шаблона

| Утверждение                                                        | Где исполняется                                       |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| Страница растёт под содержимое, и прокручивается она целиком       | `admin-container.component.html:rt-container`         |
| Все записи страницы достижимы прокруткой                           | `_page.scss:.admin-page`                              |
| Переключатель страниц достижим при любом числе строк               | `admin-list-page.component.html:rt-pagination`        |
| Название раздела набрано кеглем и начертанием образца              | `_page.scss:__title`                                  |
| Шапка раздела — строка с переносом                                 | `_page.scss:__header`                                 |
| Подсказка стоит под названием, а не рядом с ним                    | `_page.scss:__header-main`                            |
| Раздел без подсказки места под неё не оставляет                    | `admin-list-page.component.html:hint`                 |
| Поля страницы и промежутки между её блоками — те же, что у образца | `_page.scss:.admin-page`                              |
| Вид страницы объявлен один раз на все разделы                      | `admin-list-page.component.ts:AdminListPageComponent` |
| То, что стоит поверх страницы, красит свою подложку само           | `_profile-menu.scss:.admin-profile-menu`              |
| Закреплённая наверху шапка непрозрачна по всей ширине              | `_header.scss:.admin-header`                          |

Пути от корня дерева: слой раскладки — `apps/message-bus-admin/src/styles/`, страница списка —
`libs/message-bus-admin/common/core/ui/src/lib/list-page/`, оболочка —
`libs/message-bus-admin/common/container/feature/src/lib/`.

| Сценарий    | Тест                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------- |
| `SC-MB-163` | `apps/message-bus-admin-e2e/src/list-page.spec.ts`                                          |
| `SC-MB-164` | `apps/message-bus-admin-e2e/src/list-page.spec.ts`                                          |
| `SC-MB-165` | `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.spec.ts` |
| `SC-MB-166` | `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.spec.ts` |
