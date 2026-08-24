# Оболочка админки — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

| Правило                                                           | Где исполняется                                                                                                                                              |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Разделы показаны верхним рядом страницы, а не левой колонкой.     | `libs/message-bus-admin/common/container/ui/src/lib/header/admin-header.component.ts:AdminHeaderComponent`                                                   |
| Верхний ряд рисует готовый компонент кита.                        | `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:RtPageHeaderComponent`                                                        |
| Пункт объявлен декларацией меню и несёт адрес раздела.            | `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:ADMIN_MENU`                                                                        |
| Подсветку текущего раздела даёт маршрутизатор, а не оболочка.     | `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:RtPageHeaderComponent`                                                        |
| Панели второго уровня нет, пока нет вложенных разделов.           | `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:IAdminMenuItem`                                                                    |
| Название приложения стоит в том же ряду, левее разделов.          | `libs/message-bus-admin/common/container/ui/src/lib/header/admin-header.component.ts:AdminHeaderComponent`                                                   |
| Приложение называет себя словом, а не знаком.                     | `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts:ADMIN_LABELS`                                                                               |
| На узком экране те же разделы открываются кнопкой-бургером.       | `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:RtPageHeaderComponent`                                                        |
| Нажатие на профиль открывает попап, а не выходит.                 | `libs/message-bus-admin/common/container/ui/src/lib/header/admin-header.component.ts:AdminHeaderComponent`                                                   |
| Попап профиля показывает имя вошедшего, тему, язык и выход.       | `libs/message-bus-admin/common/container/ui/src/lib/header/admin-header.component.ts:AdminHeaderComponent`                                                   |
| Смены пароля в попапе нет.                                        | Не проверяется: отсутствие пункта машине не видно — держится чтением шаблона попапа шапки.                                                                   |
| Колокольчика непрочитанного нет.                                  | Не проверяется: отсутствие пункта машине не видно — держится чтением шаблона попапа шапки.                                                                   |
| Выход обрывает тот вход, которым пришли, и уводит на экран входа. | `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts:signOut`                                                                                      |
| Тем две, и человек выбирает между ними.                           | `projects/ui-kit-v2/src/lib/components/theme-toggle/rt-theme-toggle.component.ts:RtThemeToggleComponent`                                                     |
| Выбор темы живёт на устройстве и переживает перезагрузку.         | `projects/ui-kit-v2/src/lib/platform/theme.service.ts:ThemeService`                                                                                          |
| Переключатель темы стоит и в попапе профиля, и на экране входа.   | `libs/message-bus-admin/common/container/ui/src/lib/header/admin-header.component.ts:AdminHeaderComponent`                                                   |
| Обе темы проверяются замером, а не взглядом.                      | `apps/message-bus-admin-e2e/src/shell.spec.ts:SC-MB-147`                                                                                                     |
| Человек выбирает язык подписей, которые рисует кит.               | `libs/message-bus-admin/common/core/ui/src/lib/locale-switch/admin-locale-switch.component.ts:AdminLocaleSwitchComponent`                                    |
| Даты в списках показываются одним видом при любом выборе.         | `libs/message-bus-admin/common/core/ui/src/lib/moment/admin-moment.pipe.ts:AdminMomentPipe`                                                                  |
| Подписи админки остаются русскими при любом выборе.               | `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts:ADMIN_LABELS`                                                                               |
| Выбор языка стоит на экране входа и в попапе профиля.             | `libs/message-bus-admin/auth/feature/sign-in/src/lib/admin-sign-in.component.ts:AdminSignInComponent`                                                        |
| Выбор языка живёт на устройстве и переживает перезагрузку.        | `libs/message-bus-admin/common/core/util/src/lib/admin-locale.ts:AdminLocaleService`                                                                         |
| Форма входа остаётся реактивной и отдельным компонентом.          | `libs/message-bus-admin/auth/ui/src/lib/sign-in-form/admin-sign-in-form.component.ts:AdminSignInFormComponent`                                               |
| Поля входа несут иконку и плейсхолдер.                            | `apps/message-bus-admin-e2e/src/sign-in-chrome.spec.ts:SC-MB-151`                                                                                            |
| Отказ входа остаётся сообщением в форме.                          | `libs/message-bus-admin/auth/ui/src/lib/sign-in-form/admin-sign-in-form.component.ts:FAULT_TEXT`                                                             |
| Стопка тостов одна, и рисует её каркас.                           | `libs/message-bus-admin/common/container/feature/src/lib/admin-container.component.ts:AdminContainerComponent`                                               |
| Заголовок вкладки называет приложение, а не проект сборки.        | `libs/message-bus-admin/common/core/util/src/lib/admin-title.strategy.ts:AdminTitleStrategy`                                                                 |
| Страница объявляет язык документа тем, на котором написана.       | Не проверяется: признак стоит атрибутом разметки, и символа в ней нет; держится сквозной спекой SC-MB-152 и чтением `apps/message-bus-admin/src/index.html`. |
| Закреплённая наверху шапка непрозрачна по всей ширине.            | `apps/message-bus-admin/src/styles/_header.scss:admin-header`                                                                                                |
| То, что стоит поверх страницы, красит свою подложку само.         | `apps/message-bus-admin/src/styles/_profile-menu.scss:admin-profile-menu`                                                                                    |
