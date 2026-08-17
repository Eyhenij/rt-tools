# Разделы верхним рядом и доводка входа — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» договорённости. Правило
без строки и строка без правила — расхождение.

Привязки ставятся по ходу работы: код на день заведения договорённости ещё не написан, и пустая
привязка здесь законна ровно до последнего коммита PR, которым договорённость въезжает в спек
поддомена.

| Правило                                                           | Где исполняется                                                                                          |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Разделы показаны верхним рядом страницы, а не левой колонкой.     | `libs/message-bus-admin/common/container/feature/src/lib/admin-container.component.html`                 |
| Верхний ряд рисует готовый компонент кита.                        | `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:RtPageHeaderComponent`    |
| Пункт объявлен декларацией меню и несёт адрес раздела.            | `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:ADMIN_MENU`                    |
| Подсветку текущего раздела даёт маршрутизатор, а не оболочка.     | `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.html`                        |
| Панели второго уровня нет, пока нет вложенных разделов.           | `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:IAdminMenuItem`                |
| Логотип стоит в том же ряду, левее разделов.                      | `libs/message-bus-admin/common/container/ui/src/index.ts`                                                |
| На узком экране те же разделы открываются кнопкой-бургером.       | `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-mobile.scss`                           |
| Нажатие на профиль открывает попап, а не выходит.                 | `libs/message-bus-admin/common/container/ui/src/index.ts`                                                |
| Попап профиля показывает имя вошедшего, тему, язык и выход.       | `libs/message-bus-admin/common/container/ui/src/index.ts`                                                |
| Смены пароля в попапе нет.                                        | `docs/specs/message-bus/admin/spec.md`                                                                   |
| Колокольчика непрочитанного нет.                                  | `docs/specs/message-bus/admin/spec.md`                                                                   |
| Выход обрывает тот вход, которым пришли, и уводит на экран входа. | `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts:signOut`                                  |
| Тем две, и человек выбирает между ними.                           | `projects/ui-kit-v2/src/lib/components/theme-toggle/rt-theme-toggle.component.ts:RtThemeToggleComponent` |
| Выбор темы живёт на устройстве и переживает перезагрузку.         | `projects/ui-kit-v2/src/lib/components/theme-toggle/rt-theme-toggle.component.ts:RtThemeToggleComponent` |
| Переключатель стоит и в попапе профиля, и на экране входа.        | `libs/message-bus-admin/auth/feature/sign-in/src/lib/admin-sign-in.component.html`                       |
| Обе темы проверяются замером, а не взглядом.                      | `apps/message-bus-admin-e2e/src`                                                                         |
| Человек выбирает язык подписей, которые рисует кит.               | `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts`                                        |
| Подписи админки остаются русскими при любом выборе.               | `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts:ADMIN_LABELS`                           |
| Выбор языка стоит на экране входа и в попапе профиля.             | `libs/message-bus-admin/auth/feature/sign-in/src/lib/admin-sign-in.component.html`                       |
| Выбор языка живёт на устройстве и переживает перезагрузку.        | `apps/message-bus-admin/src/app/app.config.ts`                                                           |
| Форма входа остаётся той же.                                      | `libs/message-bus-admin/auth/ui/src/lib/sign-in-form/admin-sign-in-form.component.ts`                    |
| Общую часть экрана входа держит его оболочка, а не сама форма.    | `libs/message-bus-admin/auth/feature/sign-in/src/lib/admin-sign-in.component.html`                       |
| Поля входа несут иконку и плейсхолдер.                            | `libs/message-bus-admin/auth/ui/src/lib/sign-in-form/admin-sign-in-form.component.html`                  |
| Отказ входа остаётся сообщением в форме.                          | `libs/message-bus-admin/auth/ui/src/lib/sign-in-form/admin-sign-in-form.component.html`                  |
| Стопка тостов одна, и рисует её каркас.                           | `projects/ui-kit-v2/src/lib/components/container/rt-container.component.html`                            |
| Заголовок вкладки называет приложение, а не проект сборки.        | `apps/message-bus-admin/src/index.html`                                                                  |
| Страница объявляет язык документа тем, на котором написана.       | `apps/message-bus-admin/src/index.html`                                                                  |
