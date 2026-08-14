# [0.6.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.5.0...rt-ui-kit-v2@0.6.0) (2026-08-13)

### Bug Fixes

- **rt:ui-kit-v2:** кольцо фокуса не пропадает, а эталоны отвечают новым ступеням ([0cd9a55](https://github.com/Eyhenij/rt-tools/commit/0cd9a55a30a4dde42cb8be1f1fb756c6cd34e71d))
- **rt:ui-kit-v2:** комментарий в MDX не ломает указатель историй витрины ([cc7c783](https://github.com/Eyhenij/rt-tools/commit/cc7c7835c24208b226bf9b00c1f54af81439cc7f))
- **rt:ui-kit-v2:** приглушённый текст взял порог, а список принятого перестал врать ([580431f](https://github.com/Eyhenij/rt-tools/commit/580431ff08757ec5b20447bb9e708b68fa272988)), closes [#386](https://github.com/Eyhenij/rt-tools/issues/386)
- **rt:ui-kit-v2:** роль действия обзавелась цветом на поверхности, и безфоновая кнопка перестала пропадать на графите ([3827eb1](https://github.com/Eyhenij/rt-tools/commit/3827eb14c229d288246685c5f3d22b948c8f9b5e))

### Documentation

- **rt:ui-kit-v2:** тексты кита называют слой каскада и переход на него ([495d81e](https://github.com/Eyhenij/rt-tools/commit/495d81e51cc43ab2c09e02204716d83820b5482c))

### Features

- **rt:ui-kit-v2:** бренд становится линейкой, а палитра синего снимается ([c774d0f](https://github.com/Eyhenij/rt-tools/commit/c774d0f1f345d80e8becc2e36d7a9042e10287c7)), closes [#385](https://github.com/Eyhenij/rt-tools/issues/385)
- **rt:ui-kit-v2:** витрина показывает победу правила приложения над правилом кита ([33df955](https://github.com/Eyhenij/rt-tools/commit/33df95504778544ea1e2dd16ae58cf748e81113f))
- **rt:ui-kit-v2:** контраст пар «текст и фон» считает машина, а не комментарий рядом со ступенью ([8a40c97](https://github.com/Eyhenij/rt-tools/commit/8a40c9707d2316c9bcad511ab8531d0dc4d1c2fa))
- **rt:ui-kit-v2:** молчание тёмной темы отличается от намеренно общего цвета ([e7d5b83](https://github.com/Eyhenij/rt-tools/commit/e7d5b83113ad310fd862f7c53026c2b1a5eaf703))
- **rt:ui-kit-v2:** основа кита объявлена подслоем rt-kit.base ([0c4b991](https://github.com/Eyhenij/rt-tools/commit/0c4b9912d3faa6b01edd8ff9d059c4f6df20277e))
- **rt:ui-kit-v2:** палитра кнопки стала ролями действия, а отключённость перестала проигрывать ([14a3549](https://github.com/Eyhenij/rt-tools/commit/14a3549779553701629e618af93e904374681f36))
- **rt:ui-kit-v2:** стили компонентов объявлены подслоем rt-kit.components ([eac99ec](https://github.com/Eyhenij/rt-tools/commit/eac99ec06dca80cf416df0a741e62a4c4464f638))
- **rt:ui-kit-v2:** у имени токена ровно три состояния, и это проверяется ([905ed50](https://github.com/Eyhenij/rt-tools/commit/905ed505594c0fc70535e55b2ba7bc47ab3f74c6))

### BREAKING CHANGES

- **rt:ui-kit-v2:** стили кита объявлены слоем каскада rt-kit. Правило приложения теперь
  выигрывает у правила кита независимо от специфичности, а правило кита проигрывает чужой
  библиотеке, чей CSS объявлен вне слоя: тема редактора текста подключается в подслой
  rt-kit.vendor, иначе панель редактора перестраивается. Таблица в карточном виде больше не
  перебивает min-width приложения восклицательным знаком.

# [0.5.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.4.0...rt-ui-kit-v2@0.5.0) (2026-08-10)

### Bug Fixes

- **rt:ui-kit-v2:** витрина показывает то, что обещает подписью ([ecd66e1](https://github.com/Eyhenij/rt-tools/commit/ecd66e1dbb478f9ae7e1fa3b03a179da313ee258))
- **rt:ui-kit-v2:** заголовок сортировки и контрол вкладок доезжают до потребителя ([1ab31eb](https://github.com/Eyhenij/rt-tools/commit/1ab31eb72dafc58efd6c2d716341ebaebb9ae649))
- **rt:ui-kit-v2:** загрузка значков не отказывает, когда приложение снесли раньше неё ([f3884f1](https://github.com/Eyhenij/rt-tools/commit/f3884f189d57f505b9c62cd35a9ceee2a58c8821))
- **rt:ui-kit-v2:** уход с route-панели спрашивает панель на экране ([0b11d2d](https://github.com/Eyhenij/rt-tools/commit/0b11d2d91f5d0d8708c5ddf00eb5a158b5f5fb81))

### Features

- **rt:ui-kit-v2:** витрина знает, что снимается, а что помечено причиной ([cbc9f5d](https://github.com/Eyhenij/rt-tools/commit/cbc9f5dd0a11dc5024ca68104a368fe15cc3bcf4))
- **rt:ui-kit-v2:** вкладки, панель действий и шапка показаны матрицами ([ce5db27](https://github.com/Eyhenij/rt-tools/commit/ce5db27c66e0ee932b0468f0f78478b47d7371cc))
- **rt:ui-kit-v2:** карточка, текст с обрезкой, список реквизитов и раздел панели показаны матрицами ([148087d](https://github.com/Eyhenij/rt-tools/commit/148087dc07ce6d7a3567ae95fb04aff1c0866b59))
- **rt:ui-kit-v2:** полосы долей, суммы, листание и карточка файла показаны матрицами ([d2fd400](https://github.com/Eyhenij/rt-tools/commit/d2fd4009ce84f451af99f27b1a02b51b082bca97))
- **rt:ui-kit-v2:** рабочий стол и панель подробностей показаны матрицами, волна закрыта ([633e509](https://github.com/Eyhenij/rt-tools/commit/633e509f5f4ec0cfc5227b7698991da279d78ec2))
- **rt:ui-kit-v2:** сверять кадры витрины с эталонами ([a91378f](https://github.com/Eyhenij/rt-tools/commit/a91378f69e6f84949c9bbb43d0ea6ae5c309625f))
- **rt:ui-kit-v2:** сообщение, колокольчик и сетка суток показаны матрицами ([8fb20cd](https://github.com/Eyhenij/rt-tools/commit/8fb20cd42c986e134b3c9dbab38bc33822979bf3))
- **rt:ui-kit-v2:** список переписок, поле набора и сама переписка показаны матрицами ([721e318](https://github.com/Eyhenij/rt-tools/commit/721e3183faeeec5ef4f7371134259f03d9a302e8))
- **rt:ui-kit-v2:** список файлов, заметка, просмотрщик и окно приветствия показаны матрицами ([69cb439](https://github.com/Eyhenij/rt-tools/commit/69cb43960c42c797dcfab764c65efc1e855d96c9))
- **rt:ui-kit-v2:** степпер, лента событий и полоса разделов показаны матрицами ([a9bc904](https://github.com/Eyhenij/rt-tools/commit/a9bc904b69d361a34c209484e4a546dcf048f1b4))
- **rt:ui-kit-v2:** таблица показана матрицами ([9419b12](https://github.com/Eyhenij/rt-tools/commit/9419b127991763f6b6fede628b1f78a0bba9e1d8))
- **rt:ui-kit-v2:** уведомление, выезжающий лист и календарь показаны матрицами ([364a173](https://github.com/Eyhenij/rt-tools/commit/364a17370a506652c8d9e59a3aad75f8ed71e780))
- **rt:ui-kit-v2:** эталоны на всю витрину и детерминированный кадр ([b6512f2](https://github.com/Eyhenij/rt-tools/commit/b6512f2194aac88bb9170e343e83bf623f845c24))

# [0.4.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.3.0...rt-ui-kit-v2@0.4.0) (2026-08-07)

### Bug Fixes

- **rt:ui-kit-v2:** не давать пункту меню рвать свою панель ([4008e9f](https://github.com/Eyhenij/rt-tools/commit/4008e9f166c1dc47c3fc216a8e685d71dff383ad))
- **rt:ui-kit-v2:** показать в матрицах то, что ячейка скрывала ([9a5939f](https://github.com/Eyhenij/rt-tools/commit/9a5939fdca5b6bb06608e16b8f74a7810fc9a84e))
- **rt:ui-kit-v2:** показать режимы, объявленные входом, а не входом одним ([4029ac9](https://github.com/Eyhenij/rt-tools/commit/4029ac9c3c8d1440d31dd8f21e583739ccc5cada))
- **rt:ui-kit-v2:** развести хост и блок у шапки и подвала окна ([a2efbc5](https://github.com/Eyhenij/rt-tools/commit/a2efbc58d3fd49f47a35a64cdd62ba3c397fed71))

* **rt:ui-kit-v2:** вернуть отмеченному флажку и включённому тумблеру их вид. Оба состояния были
  написаны как `&--мод &__элемент` внутри составного родителя, и второй `&` разворачивался в
  родителя целиком — в селектор, требующий флажка внутри флажка. Заливка отмеченного, прочерк
  смешанного, цвет трека и уезжающий бегунок не применялись с перехода кита на единую
  инкапсуляцию.
* **rt:ui-kit-v2:** дать вмещающему полю найти редактор с форматированием. Он был единственным
  наследником основы полей без алиаса базового токена, а `rt-field` ищет контрол запросом по
  абстрактному классу — звёздочка обязательности и текст ошибки под редактором не появлялись.
* **rt:ui-kit-v2:** показать фокус с клавиатуры на кнопке скачивания. Она нарисована ссылкой, и
  умолчательный контур браузер снимал вместе с рамкой — место фокуса не было видно вовсе.
* **rt:ui-kit-v2:** не давать пункту меню кнопки с каретью рвать свою панель. Панель берёт ширину
  кнопки, а пункт нарисован обычной кнопкой кита: длинный лейбл вылезал за скруглённую рамку и
  висел в воздухе, а иконка, у которой не было `flex-shrink`, сжималась им до нуля — место
  занято, иконки не видно. Лейбл пункта теперь обрезается многоточием, а иконка любой кнопки
  держит свой размер и в кнопке с навязанной шириной.
* **rt:ui-kit-v2:** вернуть шапке и подвалу модального окна их раскладку. Класс блока висел на
  хосте и на корне шаблона разом, и правила доставались обоим: хост становился flex-строкой, а
  настоящая шапка внутри него сжималась по содержимому. Крестик стоял вплотную к заголовку вместо
  правого края окна, кнопки подвала не доходили до края, а разделитель рисовался дважды — двумя
  линиями разной длины. Заодно впервые заработало скрытие пустого подвала.

### Code Refactoring

- **rt:ui-kit-v2:** брать подписи функцией-переводчиком приложения ([d54c56e](https://github.com/Eyhenij/rt-tools/commit/d54c56e9b5a54d4a79e58e726bc730779d6fabbe))

### Features

- **rt:ui-kit-v2:** показать состояния всплывающих сеткой ([8694c47](https://github.com/Eyhenij/rt-tools/commit/8694c47b602fa37bb8b6dc235e661155ff03f057))
- **rt:ui-kit-v2:** показать состояния иконки, кольца и заглушек сеткой ([139580c](https://github.com/Eyhenij/rt-tools/commit/139580c57e05ae4e168626e4ccf9d3e1d717d148)), closes [#265](https://github.com/Eyhenij/rt-tools/issues/265)
- **rt:ui-kit-v2:** показать состояния кнопки сеткой и завести обзор компонента ([e2c9b21](https://github.com/Eyhenij/rt-tools/commit/e2c9b21627869f4fbd6b3e8a2635f401f7372e6b)), closes [#265](https://github.com/Eyhenij/rt-tools/issues/265)
- **rt:ui-kit-v2:** показать состояния оверлейных полей сеткой ([1eb5743](https://github.com/Eyhenij/rt-tools/commit/1eb574335af96f5cdb2ca26b948fd17e837ec70c))
- **rt:ui-kit-v2:** показать состояния остальных атомов сеткой ([99ef303](https://github.com/Eyhenij/rt-tools/commit/99ef303d98b36f45e498bca8a89e556a44b1d0a7)), closes [#265](https://github.com/Eyhenij/rt-tools/issues/265)
- **rt:ui-kit-v2:** показать состояния панельных сеткой ([4f1b45b](https://github.com/Eyhenij/rt-tools/commit/4f1b45b20ff1381c3feb9f0c3e00ea590a7d6ea4))
- **rt:ui-kit-v2:** показать состояния переключателей и счётчиков сеткой ([3981341](https://github.com/Eyhenij/rt-tools/commit/398134157c9635d7d08c6ead768e1078a78629bf))
- **rt:ui-kit-v2:** показать состояния поля даты, файлов, фильтра и редактора сеткой ([535aaef](https://github.com/Eyhenij/rt-tools/commit/535aaef5be1e7ddc5bdedf8ec6e11604148ea800))
- **rt:ui-kit-v2:** показать состояния статусов и меток сеткой ([49943cb](https://github.com/Eyhenij/rt-tools/commit/49943cb902d151d15352561241f19ea072ff9c0b)), closes [#265](https://github.com/Eyhenij/rt-tools/issues/265)
- **rt:ui-kit-v2:** показать состояния текстовых полей сеткой ([c0d99db](https://github.com/Eyhenij/rt-tools/commit/c0d99db2cc65b7dba290c50a4da39c305b5ed51a))

* **rt:ui-kit-v2:** витрина показывает все состояния пятнадцати простых компонентов сразу, а не
  по одному через контролы. У каждого из них появилась страница-обзор рядом с кодом — назначение,
  когда применять и когда нет, таблицы осей и состояний, доступность, оформление, входы и выходы, —
  и по истории на каждую ось входов. Наведение, нажатие и фокус с клавиатуры видны в статичной
  сетке; светлая и тёмная темы стоят рядом.
* **rt:ui-kit-v2:** то же покрытие получили тринадцать форменных компонентов: поле-обёртка,
  однострочный, многострочный и числовой ввод, флажок, тумблер, счётчик и его строка, поле даты,
  выбор файлов, группа сегментов, адаптивный фильтр и редактор с форматированием. У каждого —
  страница-обзор рядом с кодом и по истории на каждую ось входов, включая заполненность, ошибку,
  отключённость и режим чтения.
* **rt:ui-kit-v2:** то же покрытие получили тринадцать компонентов с плавающими панелями: список
  и множественный список, поле с подсказками, поповер, подсказка, меню с пунктом, подтверждение
  под кнопкой, кнопка с меню, модальное окно с шапкой, боковая панель с шапкой, каркас страницы,
  полоса разделов и область приёма файлов. Раскрытая панель показана отдельными историями — её
  открывает сама витрина, повторяя жест; наполнение панели видно набором внутри неё.
* **rt:ui-kit-v2:** светлые назначения вынесены в миксин `rt-theme-light-tokens` по образцу
  тёмных. Приложение теперь может включить светлый остров внутри тёмного экрана, а не только
  переключать тему целиком.

### BREAKING CHANGES

- **rt:ui-kit-v2:** `provideRtKitTranslations()` заменён на `provideRtKitLabels()`;
  `RT_KIT_TRANSLATIONS` и семь языков удалены из пакета; ключи потеряли префикс
  `rtKit.`.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>

### ⚠ BREAKING CHANGES

- **rt:ui-kit-v2:** подписи кита переехали приложению. Своего языка у библиотеки компонентов нет
  и быть не может: она не знает ни языка продукта, ни его формулировок, — а восемь вшитых
  словарей навязывали потребителю и набор языков, и текст, и Transloco как способ доставки.

    Что изменилось:
    - `provideRtKitTranslations()` больше нет. Подписи отдаёт `provideRtKitLabels({ translator, locale })`,
      где `translator` — `Signal` функции `(key, params) => string`, а `locale` — `Signal<string>`,
      которой кит форматирует даты. Способ доставки теперь дело приложения: Transloco,
      `$localize`, собственный словарь.
    - `RT_KIT_TRANSLATIONS` и семь языков (de, hi, ko, ru, th, zh-Hans, zh-Hant) удалены из
      пакета. Английский набор остался — умолчанием, а не локализацией: он покрывает все 131
      ключ, поэтому кит без единой настройки рисует текст, а не пустоты. Пустая `aria`-подпись
      означала бы кнопку без имени для скринридера, и это хуже чужого языка.
    - Ключи потеряли префикс `rtKit.` и стали типом `RtKitLabelKey`, выведенным из английского
      набора: ключа, которого кит не рисует, теперь не существует, а опечатка не доживает до
      рантайма.
    - `@jsverse/transloco` убран из `peerDependencies` — в исходниках кита не осталось ни одного
      импорта оттуда.
    - `RtRouteAsideComponent.runMutation()` принимает `successText` вместо `successKey`. Ключ
      принадлежал словарю приложения, а кит чужих словарей не знает: приложение переводит само и
      передаёт готовый текст.

# [0.3.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.1.0...rt-ui-kit-v2@0.3.0) (2026-08-07)

### Bug Fixes

- **rt:ui-kit-v2:** выправить объявления для скринридера и потерянные входы ([c00887f](https://github.com/Eyhenij/rt-tools/commit/c00887f4fdc0980dc52470673fa9d2773f7b9903))
- **rt:ui-kit-v2:** починить четыре дефекта, вскрытых спеками ([2d8ac5e](https://github.com/Eyhenij/rt-tools/commit/2d8ac5e1326288a6153df4caeafc96f4eaf51c71))

* **rt:ui-kit-v2:** починить стили, которые не применялись. Часть компонентов уже была на
  `ViewEncapsulation.None`, где селектор `:host` не совпадает ни с чем, — и написанные через
  него правила лежали мёртвыми: `rt-aside` и `rt-dialog` не получали `display: contents` и
  рисовали вокруг рамки её дубль, `rt-skeleton-wrapper` оставался нулевого размера (через
  него схлопывались строка значения `rt-detail-row` и `rt-field`), а активная плитка
  `rt-section-nav` в тёмной теме не брала свой фон.
* **rt:ui-kit-v2:** свести к одному месту правила панели и backdrop асайда. `rt-aside` и
  `rt-container` держали два набора одних и тех же правил, разошедшихся в значениях, и кто
  из них побеждал — решал порядок загрузки стилей.

### Features

- **rt:ui-kit-v2:** крупные ступени шкалы у кнопок и иконки ([7ae8600](https://github.com/Eyhenij/rt-tools/commit/7ae8600952b6eb2399b0dbf345a1324081473005))

### BREAKING CHANGES

- **rt:ui-kit-v2:** весь кит теперь на `ViewEncapsulation.None` — стили компонентов стали
  глобальными. Переопределения, написанные потребителем в расчёте на эмуляцию, надо
  перепроверить. Порядок адресации в самом ките: класс блока `.rt-<блок>`, а если тот же
  класс висит и на корне шаблона — имя элемента `rt-<блок>`.

# [0.2.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.1.0...rt-ui-kit-v2@0.2.0) (2026-08-06)

### Bug Fixes

- **rt:ui-kit-v2:** выправить объявления для скринридера и потерянные входы ([c00887f](https://github.com/Eyhenij/rt-tools/commit/c00887f4fdc0980dc52470673fa9d2773f7b9903))
- **rt:ui-kit-v2:** починить четыре дефекта, вскрытых спеками ([2d8ac5e](https://github.com/Eyhenij/rt-tools/commit/2d8ac5e1326288a6153df4caeafc96f4eaf51c71))

### Features

- **rt:ui-kit-v2:** крупные ступени шкалы у кнопок и иконки ([7ae8600](https://github.com/Eyhenij/rt-tools/commit/7ae8600952b6eb2399b0dbf345a1324081473005))

# 0.1.0 (2026-08-05)

### Bug Fixes

- **rt:ui-kit-v2:** восстановить повреждённые байты в комментариях ([6a34336](https://github.com/Eyhenij/rt-tools/commit/6a34336797503efaea3f993f3673483798d0a1a2))
- **rt:ui-kit-v2:** довезти стили кнопки до потребителя ([b7e3bb3](https://github.com/Eyhenij/rt-tools/commit/b7e3bb3a3547545867fd328dccec6b4d94c6b926))
- **rt:ui-kit-v2:** проставить типы помощникам документации ([4321d26](https://github.com/Eyhenij/rt-tools/commit/4321d260e0246beffa9077a73bcaeb80f24232f8))

### Features

- **rt:ui-kit-v2:** второй набор компонентов и его дизайн-система ([2d63d3d](https://github.com/Eyhenij/rt-tools/commit/2d63d3d6e70de3df033df49e0fb285dbdfd8e496))
- **rt:ui-kit-v2:** завести витрину Storybook ([c3c6aa0](https://github.com/Eyhenij/rt-tools/commit/c3c6aa018859ea3114d3b72238270fbe73f7353e))
- **rt:ui-kit-v2:** истории компонентов на витрине ([3bc969a](https://github.com/Eyhenij/rt-tools/commit/3bc969a91df18876bbd3235507797607a1cc53b4))

# Changelog

Все заметные изменения пакета `@rt-tools/ui-kit-v2` записываются здесь.

## 0.1.0

Первый выпуск.

- 72 семейства компонентов с префиксом `rt-`: поля формы и `rt-field`, таблица с настройкой
  колонок и пагинацией, панель правки записи на маршруте с защитой несохранённого, диалоги,
  чат с композером и rich-редактором, календарь, шапка страницы с навигацией, тосты,
  просмотрщик фотографий.
- Дизайн-система в `src/styles`: шкалы, назначения, тёмная тема, полосы прокрутки, пороги
  ширины и миксины поверхности. Собранный CSS — `styles/tokens.css`.
- Набор из 335 иконок в `assets/icons`; `provideRtIcons(baseUrl)` собирает их в inline-sprite
  на подъёме приложения.
- Подписи кита — 131 ключ в неймспейсе `rtKit` на восьми языках; подключаются
  `provideRtKitTranslations()` и переопределяются своим словарём.
- Среда исполнения: `ThemeService`, `BreakpointsService`, `NotificationBus`.
