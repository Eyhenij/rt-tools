# [0.6.0](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.5.1...rt-tools@0.6.0) (2026-09-09)

### Bug Fixes

- **rt:ui-kit:** выбранная тягой ширина подменю заменяет заданную оформлением ([87bd7ca](https://github.com/Eyhenij/rt-tools/commit/87bd7ca9ec71617b29ab49ff013e4f9f799baed8))
- **rt:ui-kit:** закреплённое подменю не держит место, когда показывать нечего ([63c2300](https://github.com/Eyhenij/rt-tools/commit/63c23002c3a6c025bf3b129710823962ef1496a4))
- **rt:ui-kit:** закреплённое подменю помечено залитым значком, а не только цветом ([e978a28](https://github.com/Eyhenij/rt-tools/commit/e978a28ed48faf73f48b1f61e79d0a6618d325ce))
- **rt:ui-kit:** нижний предел ширины подменю оставлен за оформлением, как решено в RT-1673 ([33e8df9](https://github.com/Eyhenij/rt-tools/commit/33e8df9de86dfc502ee284c90370cc490cc04a62))
- **rt:ui-kit:** шторка не переживает того, кто её открыл ([9314350](https://github.com/Eyhenij/rt-tools/commit/9314350ed59dc27af32fce093bd813f75be1ea76))

### Features

- **rt:ui-kit:** вид поля ввода задаётся настройкой кита ([59322ba](https://github.com/Eyhenij/rt-tools/commit/59322ba46dc2b6abbe908edb83902acc416558ee)), closes [#8](https://github.com/Eyhenij/rt-tools/issues/8)

## [0.5.1](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.5.0...rt-tools@0.5.1) (2026-09-04)

### Bug Fixes

- **rt:ui-kit:** [RT-1672] ручка тяги подменю ловится шире, чем видна ([c8cc075](https://github.com/Eyhenij/rt-tools/commit/c8cc0758554b8b79af9294f7c991733d66e45365))

# [0.5.0](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.4.0...rt-tools@0.5.0) (2026-09-03)

### Bug Fixes

- **rt:agent-kit:** правило приставки типа говорит про T, а узловые глобали доходят до серверных проектов ([a0bd361](https://github.com/Eyhenij/rt-tools/commit/a0bd361c1c6df5e8aeb3c5efc032b3dfc75fb1ce))
- **rt:agent-kit:** проверка классов вёрстки собирает имя из вложенности, а долг разобран до нуля ([95f28c8](https://github.com/Eyhenij/rt-tools/commit/95f28c83e4736061acfde8cc3a361a652513fff1))
- **rt:agent-kit:** следы деления сняты по всему набору гейта ([16138fa](https://github.com/Eyhenij/rt-tools/commit/16138fa0f4607b1f97cb3bc03830844bc7123880))
- **rt:ui-kit:** [RT-1678] пункт подменю не выходит за край панели ([0922b8e](https://github.com/Eyhenij/rt-tools/commit/0922b8eb4433d80364aef81294fddb2a34688b55))
- **rt:ui-kit:** [RT-1682] нажатие на значок принимает событие любого рода ([d88183d](https://github.com/Eyhenij/rt-tools/commit/d88183d3c3613eb07ad78ddfb1dda4167a73adbc))
- **rt:ui-kit:** [RT-1682] растушёвка доходит до разделителя подвала ([bc040d0](https://github.com/Eyhenij/rt-tools/commit/bc040d077bc7d30aab9ada1b0fa63ea74f802990))
- **rt:ui-kit:** [RT-1682] растушёвка доходит до содержимого подвала ([a955d32](https://github.com/Eyhenij/rt-tools/commit/a955d3291cf2d8ec6e2153c5a673fdfba636c6f8))
- **rt:ui-kit:** [RT-1684] полоса подменю не срезается углом панели, вид взят с образца ([2de2e9c](https://github.com/Eyhenij/rt-tools/commit/2de2e9cc070c06a06a609d3d52fd9d75d4fc8509)), closes [#e0e0e0](https://github.com/Eyhenij/rt-tools/issues/e0e0e0) [#3f3e43](https://github.com/Eyhenij/rt-tools/issues/3f3e43) [#a3a3a3](https://github.com/Eyhenij/rt-tools/issues/a3a3a3) [#747474](https://github.com/Eyhenij/rt-tools/issues/747474)
- **rt:ui-kit:** [RT-1684] радиус панели подменю задан числом, а не общим именем ([45f866f](https://github.com/Eyhenij/rt-tools/commit/45f866fed93321232ee074ce79a8cef5229c150e))
- **rt:ui-kit:** закрепление подменю не стирает того, что видно ([8647ce9](https://github.com/Eyhenij/rt-tools/commit/8647ce90e29f06adb2d13f455f01cdb940eb5b87))
- **rt:ui-kit:** значок закрепления меняется сменой семейства, а не осью шрифта ([3b143b6](https://github.com/Eyhenij/rt-tools/commit/3b143b61b41f4012c0de677ab9c6651cddcd9402))
- **rt:ui-kit:** кадр витрины снимается с нарисованной страницы, а не с вставшей ([65519e1](https://github.com/Eyhenij/rt-tools/commit/65519e1a442ee696edd504154eeff1b803bc084d))
- **rt:ui-kit:** кадр снимка снимается до совпадения двух подряд ([0b18363](https://github.com/Eyhenij/rt-tools/commit/0b18363b6f8fd3d57da819cd8a47a5a8b0a734ae))
- **rt:ui-kit:** кнопка копирования не показывается у пустой ячейки таблицы ([30ffa81](https://github.com/Eyhenij/rt-tools/commit/30ffa81b2f8fd57d559fb162ae06d55d74202856))
- **rt:ui-kit:** найденное подсвечено жёлтым, как это делает браузер ([65a4ccd](https://github.com/Eyhenij/rt-tools/commit/65a4ccd10a481f1e8d3c81c7b0d4bc96071be42b))
- **rt:ui-kit:** ожидание в показах меню идёт по часам, а не по кадрам ([0cb91e1](https://github.com/Eyhenij/rt-tools/commit/0cb91e1ca8006ee67694ee243a6c7aecc130e38e))
- **rt:ui-kit:** ожидание шрифта значков в снимках витрины перестало гасить свой отказ ([dc0af97](https://github.com/Eyhenij/rt-tools/commit/dc0af97926249819f3522782b8e4bc46012be43d))
- **rt:ui-kit:** поле поиска подменю ниже ростом, значок ближе к запросу ([4958267](https://github.com/Eyhenij/rt-tools/commit/495826714379688750cf5525b10f3050a24eb2f1))
- **rt:ui-kit:** полоса тяги идёт во всю высоту и не срезается панелью ([01e4093](https://github.com/Eyhenij/rt-tools/commit/01e4093190e8b4744dc291f43cd9c72f600970b6))
- **rt:ui-kit:** полоса тяги подменю не попадает в срезанные углы панели ([5477e55](https://github.com/Eyhenij/rt-tools/commit/5477e55b54c5b6ba1358941c50997fb2883e83fe))
- **rt:ui-kit:** раскладка хоста меняется только у закреплённой моды ([f661dde](https://github.com/Eyhenij/rt-tools/commit/f661dde9869b1b9276f897ee0c69fc86c2eeea48))
- **rt:ui-kit:** скругление поля поиска взято ступенью, общей с обоими китами ([26c0734](https://github.com/Eyhenij/rt-tools/commit/26c0734250d0d8dea6fc805d5bb42b5fbb8d9915))
- **rt:ui-kit:** снимок ждёт не только шрифт значков, но и перерисовку по нему ([0d53770](https://github.com/Eyhenij/rt-tools/commit/0d537707432d838324452a3e4e616dc48687d94d))
- **rt:ui-kit:** сортировка отдаётся только по объявленной колонке ([17513a3](https://github.com/Eyhenij/rt-tools/commit/17513a3795bb4a30a4700355aabf306df0459416))
- **rt:ui-kit:** шрифт значков в снимках витрины уехал из чужой сети в дерево ([e1a41a7](https://github.com/Eyhenij/rt-tools/commit/e1a41a7e1166981f658295f975bbbaef61855258))

### Code Refactoring

- **rt:ui-kit:** публичные имена кита пишутся с малой буквы ([4296663](https://github.com/Eyhenij/rt-tools/commit/42966637f11d6db8f08757e02b0a024ceba832bf))

### Features

- **rt:message-bus:** админка заводится каркасом, входом и оболочкой с меню ([7736c6c](https://github.com/Eyhenij/rt-tools/commit/7736c6cf9f79e335c550ca5e41764ba265c23c75))
- **rt:ui-kit:** [RT-1675] работа с полем держит подменю открытым ([93f63b9](https://github.com/Eyhenij/rt-tools/commit/93f63b911fbad271bec24839012a6e895d265cea))
- **rt:ui-kit:** [RT-1678] пункт подменю занимает ширину панели ([5f817d0](https://github.com/Eyhenij/rt-tools/commit/5f817d07c2124d37bf822e0564124b9c8f36a2e8))
- **rt:ui-kit:** [RT-1682] нажатие на значок уводит список вниз, тень красится темой ([103ad08](https://github.com/Eyhenij/rt-tools/commit/103ad088fdbe11762897f957cabbe33fa707b474))
- **rt:ui-kit:** [RT-1682] растушёвка идёт за выбранной цветовой схемой ([f32bbdf](https://github.com/Eyhenij/rt-tools/commit/f32bbdfb51a82296dd090bfaafe4b0f0fd8c5d35))
- **rt:ui-kit:** [RT-1682] список говорит, что снизу осталось непоказанное ([1a3b2f2](https://github.com/Eyhenij/rt-tools/commit/1a3b2f232e2a30303d3eb88503bf8e43e0c223ca))
- **rt:ui-kit:** [RT-1684] списки меню прокручиваются своей узкой полосой ([0e8b653](https://github.com/Eyhenij/rt-tools/commit/0e8b65339096c1ddc0142da7a6c66634dce20a24)), closes [#f5f6f8](https://github.com/Eyhenij/rt-tools/issues/f5f6f8) [#232226](https://github.com/Eyhenij/rt-tools/issues/232226) [#ccc](https://github.com/Eyhenij/rt-tools/issues/ccc) [#4a494e](https://github.com/Eyhenij/rt-tools/issues/4a494e)
- **rt:ui-kit:** в отобранной подписи отмечено то, чем она совпала ([9f1446d](https://github.com/Eyhenij/rt-tools/commit/9f1446d9ae113a922b1d7cd58520788acd6124b4))
- **rt:ui-kit:** витрина показывает закреплённое подменю и поиск по нему ([42ae336](https://github.com/Eyhenij/rt-tools/commit/42ae336f92b0ba377ce0f8ab6dcc036934b0843d))
- **rt:ui-kit:** выбор моды подменю хранится ключом кита ([00b42ca](https://github.com/Eyhenij/rt-tools/commit/00b42ca2caec2a218b07d58b0f384249dd9d18ee))
- **rt:ui-kit:** подменю бокового меню закрепляется и ищет по своим пунктам ([30bdbee](https://github.com/Eyhenij/rt-tools/commit/30bdbeecdccd31af6c8515e51685a5314b204612))
- **rt:ui-kit:** правый край закреплённого подменю тянется указателем ([5ddcf0d](https://github.com/Eyhenij/rt-tools/commit/5ddcf0d8ba7ca1a0cd5b674bda8382f98ce90cc6))
- **rt:ui-kit:** пункты подменю отбираются по подстроке подписи ([c6a3900](https://github.com/Eyhenij/rt-tools/commit/c6a390054b10c1f6eb664d7d5e8bbd5403d6fbcb))
- **rt:ui-kit:** спиннер ждёт названную задержку, прежде чем показаться ([b01dcf7](https://github.com/Eyhenij/rt-tools/commit/b01dcf771c1c6e50b965088e09eb5caf56a3128c))
- **rt:ui-kit:** у всплывающего слоя есть показ и замер положения ([b1667e2](https://github.com/Eyhenij/rt-tools/commit/b1667e2a93ff569bc5436a82fba6a3d417a54cf2))
- **rt:ui-kit:** у панели действий есть показ и замер вида кнопок ([2a449f6](https://github.com/Eyhenij/rt-tools/commit/2a449f60ff46e807e64974a6ba9751f38917c58a))
- **rt:ui-kit:** у панели инструментов есть показ и замер раскладки ([47ebbc8](https://github.com/Eyhenij/rt-tools/commit/47ebbc817470d98a75f4e54b2fa0d6fce7e251e2))
- **rt:ui-kit:** у прокручиваемого контейнера есть показ и замер прокрутки ([10a64d7](https://github.com/Eyhenij/rt-tools/commit/10a64d79bf9c9288f617a3fcba434fb08bb68348))
- **rt:ui-kit:** узкий экран кит определяет сам, входа isMobile больше нет ([e0a88d4](https://github.com/Eyhenij/rt-tools/commit/e0a88d46a2d47b481deb1937eb9b8af7517284d1))
- **rt:ui-kit:** ширина закреплённого подменю хранится ключом кита ([880c7a6](https://github.com/Eyhenij/rt-tools/commit/880c7a6478259ed77e096251c5b7124e98fe9470))
- **rt:ui-kit:** шторка не закрывается по Esc, а источники закрытия называет потребитель ([6f82ce8](https://github.com/Eyhenij/rt-tools/commit/6f82ce8083c8c3143074ee15b031ebe580d5cf8d))

### BREAKING CHANGES

- **rt:ui-kit:** снят вход `isMobile` у семнадцати компонентов первого кита. Переход
  состоит в снятии привязки `[isMobile]="…"` из разметки; порог прежний — 599 пикселей, своё
  число приложение задаёт через `BreakpointService.setBreakpoints()`.
- **rt:ui-kit:** `RtAsideService.Open()` переименован в `open()`, вход флажка `Value` — в `value`.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EZAAnW4RMcCah7RZeXPsHs

- **rt:ui-kit:** снят вход `isMobile` — узкий экран кит определяет сам, службой точек перелома.
  Вход был вторым источником одного признака и главнее замера: приложение, передавшее его
  однажды, задавало вид кита навсегда, а расхождение между переданным значением и настоящей
  шириной окна не видел никто. Снят он у семнадцати компонентов:

    - `rtui-aside-container`
    - `rtui-clear-button`
    - `rtui-dynamic-input` и `rtui-dynamic-selector` — вход стоял на их общей основе
    - `rtui-dynamic-list`
    - `rtui-dynamic-selector-list-actions`
    - `rtui-dynamic-selector-selected-list`
    - `rtui-header`
    - `rtui-image-upload`
    - `rtui-info-badge`
    - `rtui-multi-selector-popup`
    - `rtui-pagination`
    - `rtui-side-menu`
    - `rtui-side-menu-sub-item`
    - `rtui-table`
    - `rtui-table-base-cell`
    - `rtui-table-container`
    - `rtui-table-header-filter-cell`

    Переход состоит в снятии привязки: `[isMobile]="…"` убирается из разметки, и кит начинает
    отвечать на настоящую ширину окна. Порог прежний — 599 пикселей; своё число приложение
    задаёт через `BreakpointService.setBreakpoints()`.

    Привязку с прежним именем видит не всякая сборка: у приложения с нестрогим разбором шаблонов
    она молча перестаёт что-либо задавать, и заметить это можно только чтением этой записи.

- **rt:ui-kit:** снят набор триггеров полосы загрузки — `progressIncreaseAnimation` и
  `progressDecreaseAnimation` вместе с каталогом `animation`. Они были метаданными пакета
  `@angular/animations`, объявленного устаревшим целиком, и без него от них не остаётся ничего.
  Замена — правило стилей на самом элементе: ширина от `0` до `100%` и обратно с
  `transition: width <время> linear`, где время задаётся своим свойством. Ни один компонент кита
  их не звал.

    Вместе с этим `@angular/animations` снят из требуемых пакетов кита: он его больше не зовёт
    нигде, а набор Material этой версии его не требует вовсе.

- **rt:ui-kit:** у всплывающего сообщения снята публичная поверхность проигрывателя анимаций —
  поле `player` типа `AnimationPlayer` и обработчики `onMouseOver()` / `onMouseOut()`. Полоса
  срока идёт покадровым правилом стилей и стоит под указателем сама
  (`animation-play-state: paused`), поэтому держать проигрыватель и переключать его руками
  больше нечем и незачем. Само поведение прежнее: полоса стягивается за время жизни сообщения,
  стоит под наведением и закрывает сообщение по концу.

- **rt:ui-kit:** публичные имена приведены к соглашению о языке кода: метод и свойство пишутся с
  малой буквы. Прежних имён не оставлено — у символа одно имя, и переход состоит в правке вызовов
  и разметки. Переименовано два:

    - `RtAsideService.Open()` → `RtAsideService.open()`
    - вход флажка `Value` → `value`: в разметке `[Value]="…"` и `[(Value)]="…"` меняются на
      `[value]="…"` и `[(value)]="…"`

    Вход флажка сборкой и типами не проверяется: разметка с прежним именем молча перестаёт что-либо
    задавать, и заметить это можно только чтением этой записи.

- **rt:ui-kit:** псевдонимы типа получили приставку `T`: в этом дереве `I` носит интерфейс, а `T` — псевдоним типа, и
  правило линтера требует именно её. Псевдонимов под прежними именами не оставлено — у символа одно имя, и переход
  состоит в правке импортов. Переименовано 15:

    - `AsideButtonsType` → `TAsideButtonsType`
    - `AsidePositions` → `TAsidePositions`
    - `IImageUploadFormat` → `TImageUploadFormat`
    - `IInfoBadgeSizeType` → `TInfoBadgeSizeType`
    - `IconSideType` → `TIconSideType`
    - `InfoBadgeType` → `TInfoBadgeType`
    - `MenuItemTrigger` → `TMenuItemTrigger`
    - `ModalWindowSizeType` → `TModalWindowSizeType`
    - `RtAccentRole` → `TRtAccentRole`
    - `RtColorSchemeRamp` → `TRtColorSchemeRamp`
    - `RtThemeType` → `TRtThemeType`
    - `RtUiDesign` → `TRtUiDesign`
    - `RtuiIconSizeType` → `TRtuiIconSizeType`
    - `RtuiIconThemeType` → `TRtuiIconThemeType`
    - `ToggleSizeType` → `TToggleSizeType`

# [0.4.0](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.3.1...rt-tools@0.4.0) (2026-08-10)

### Bug Fixes

- **rt:ui-kit:** вернуть клавиатуру интерактивным элементам и перерисовку по требованию ([977454d](https://github.com/Eyhenij/rt-tools/commit/977454d89540722a4051c3c7a46a6b6f5004ff23))
- **rt:ui-kit:** перевести оформление иконки и кнопки на токены ([2741cbb](https://github.com/Eyhenij/rt-tools/commit/2741cbb8abaf8f42db4c4909381bd3d4ee08967a))
- **rt:ui-kit:** снять с употребления набор .c-button ([4a91ad2](https://github.com/Eyhenij/rt-tools/commit/4a91ad22a9c32d17606fe32f4b31a781700e9034)), closes [#290](https://github.com/Eyhenij/rt-tools/issues/290)

* **rt:ui-kit:** the `pill` button reads 12px at size `xs` and 14px at size `md` (was 11px and 13px, both off the type scale)
* **rt:ui-kit:** keyboard reaches the filter-operator menu, the action-bar buttons, the side-menu items and the checkbox — they carried click handlers on non-focusable nodes
* **rt:ui-kit:** `rtui-aside-panel` and `rtui-action-bar-container` run on `OnPush` again

### Features

- **rt:ui-kit:** сверять витрину со снимками ([0bede88](https://github.com/Eyhenij/rt-tools/commit/0bede886eefc42f03cf60bda924c9e0a28289e2b))

* **rt:ui-kit:** `--rt-icon-size-{xs,sm,md,lg,xl,xxl,3xl}` sizes an icon box whole — width, height and font-size take the same step, so an app can resize `rtui-icon` without touching three declarations
* **rt:ui-kit:** the spacing scale gained the 10px and 14px steps (`--rt-spacing-10`, `--rt-spacing-14`)
* **rt:ui-kit:** the kit measures the narrow screen itself through `BreakpointService`, so `[isMobile]` is optional everywhere. Pass it and your value still wins — it is the way to render the kit narrow inside a panel on a wide screen.

### BREAKING CHANGES

- **rt:ui-kit:** every component now carries its block class on the host element. If your app targets a kit component by an inner wrapper class, target the host instead.
- **rt:ui-kit:** `rtui-button` moved its block to the host: the inner `<button>` is `.rtui-button__control`, the Material branch is `.rtui-button__material` (was `.rtui-button-material`), and every modifier (`--type-*`, `--size-*`, `--variant-*`, `--radius-*`, `--appearance-*`) sits on the host. Selectors like `.rtui-button--type-pill { … }` still match, but now they match the host, not the button.
- **rt:ui-kit:** `rtui-info-badge` renamed its state classes to block modifiers: `.size-l` / `.size-m` / `.size-s` / `.bold` are now `.c-info-badge--size-l` / `-m` / `-s` / `--bold`.
- **rt:ui-kit:** `rtui-aside-panel` no longer emits `position-left`, `position-right` and `full-screen` — none of them had a single style rule.
- **rt:ui-kit:** `RtuiCheckboxComponent.onChangeValue()` is gone; the checkbox toggles itself and reports through `ngModelChange`.
- **rt:ui-kit:** `RtuiTableComponent` and `RtuiDynamicListComponent` expose `narrow` instead of `isMobile`, matching the `ITableComponent` contract. The `isMobile` input is untouched — this is the read side, used by projected templates.
- **rt:ui-kit:** the deprecated `.c-button` set is gone — `styles/components/_button.scss` no longer ships, and with it the `--rt-button-*` custom properties. Map your classes with the table in `src/styles/TOKENS.md`; an app that overrode `--rt-button-*` (dark mode included) overrides `--rt-rtui-btn-*` instead. `button { cursor: pointer; line-height: 1 }` rode along with that file and stays, now in `styles/base/_base.scss`.
- **rt:ui-kit:** the kit's own buttons no longer carry `.c-button`, so a few labels inside composite components read at Material's own 14px instead of the set's 16px: `rtui-file-upload`, the `rtui-image-upload` cropper actions, the `rtui-multi-selector-popup` footer and the `rtui-dynamic-selector` placeholder. The text buttons of `rtui-aside-error-box`, `rtui-dynamic-input` and `rtui-dynamic-selector` moved onto `.rtui-btn .rtui-btn-secondary-text` and sit 2px taller.
- **rt:ui-kit:** three pagination custom properties were renamed to say what they do: `--rt-table-pagination-container-mobile-gap`, `-paging-mobile-margin` and `-size-toggle-selector-mobile-margin` are now `--rt-table-pagination-container-clipped-gap`, `-paging-clipped-margin` and `-size-toggle-selector-clipped-margin`. They drive the clipped layout, which applies above the mobile breakpoint, not below it.

- **rt:ui-kit:** перечисления получили приставку `E` и имя в PascalCase: приставка рода в этом дереве одна на все
  объявления, и правило линтера требует её у перечисления так же, как у интерфейса и псевдонима типа. Значения внутри
  перечислений не тронуты. Переименовано 10:

    - `ASIDE_BUTTONS_ENUM` → `EAsideButtons`
    - `INFO_BADGE_SIZE_ENUM` → `EInfoBadgeSize`
    - `INFO_BADGE_TYPE_ENUM` → `EInfoBadgeType`
    - `MODAL_WINDOW_SIZE_ENUM` → `EModalWindowSize`
    - `RT_ACCENT_ROLE_ENUM` → `ERtAccentRole`
    - `RT_THEME_ENUM` → `ERtTheme`
    - `TABLE_COLUMN_FILTER_TYPES_ENUM` → `ETableColumnFilterTypes`
    - `TABLE_COLUMN_TYPES_ENUM` → `ETableColumnTypes`
    - `TEXT_CELL_COLOR_ENUM` → `ETextCellColor`
    - `TOGGLE_SIZE_TYPE_ENUM` → `EToggleSizeType`

## [0.3.1](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.3.0...rt-tools@0.3.1) (2026-08-02)

# [0.3.0](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.2.0...rt-tools@0.3.0) (2026-08-02)

### Code Refactoring

- prefix the interfaces and generic type helpers with I ([bcb5e76](https://github.com/Eyhenij/rt-tools/commit/bcb5e76c064b82d46f152a6af807b94b2010384d)), closes [#234](https://github.com/Eyhenij/rt-tools/issues/234)

### BREAKING CHANGES

- every renamed type is part of the published surface.
  `import { Nullable } from '@rt-tools/utils'` becomes
  `import { INullable } from '@rt-tools/utils'`, and likewise for the rest.
  No aliases are left behind — a symbol keeps exactly one name.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01CkpaW5obf3ezRvTHYaDw2i

## [0.0.28](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.27...rt-tools@0.0.28) (2026-07-14)

### BREAKING CHANGES

- **rt:ui-kit:** `NameValueType` → `INameValueType` and `Select` → `ISelect`, matching the `I`-prefix convention.

# [0.2.0](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.1.0...rt-tools@0.2.0) (2026-08-02)

### Features

- **rt:ui-kit:** the aside error inputs (`rtui-aside-container [requestError]`, `rtui-aside-error-box [error]`) accept any failure value instead of an `HttpErrorResponse`, so a non-HTTP transport can feed them its own error object

# [0.1.0](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.29...rt-tools@0.1.0) (2026-08-02)

## [0.0.29](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.27...rt-tools@0.0.29) (2026-07-28)

### Features

- **rt:ui-kit:** `RtHideTooltipDirective` now ships from this package (`lib/ui-kit/tooltip`), alongside the components that use it

## [0.0.27](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.26...rt-tools@0.0.27) (2026-07-09)

## [0.0.26](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.25...rt-tools@0.0.26) (2026-07-03)

### Bug Fixes

- **rt:ui-kit:** keep projected button content in the material design branch ([fc21cd2](https://github.com/Eyhenij/rt-tools/commit/fc21cd22130f17f0f3d2fa8316bbdb1b446d26a2))

## [0.0.25](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.24...rt-tools@0.0.25) (2026-07-03)

### Features

- **rt:ui-kit:** render the material button design via the native Material button ([2318eba](https://github.com/Eyhenij/rt-tools/commit/2318eba2bc17417c559a2e834321756c8705bb1b))

## [0.0.24](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.23...rt-tools@0.0.24) (2026-07-03)

### Features

- **rt:ui-kit:** add RT_UI_CONFIG with global/per-component defaults and a material design mode for rtui-button ([7832cc9](https://github.com/Eyhenij/rt-tools/commit/7832cc9a98fb793a8b9bde140653fa6c3835b265))

## [0.0.23](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.22...rt-tools@0.0.23) (2026-06-28)

### Features

- **rt:ui-kit:** add a pinned-group divider to `rtui-multi-selector-popup` via a `pinnedKeys` input (trailing separator after the pinned options, in both radio and checkbox modes) ([839675e](https://github.com/Eyhenij/rt-tools/commit/839675e43df665789bb0e3fc1b33184c8c7a9c95)), closes [#207](https://github.com/Eyhenij/rt-tools/issues/207)

## [0.0.22](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.21...rt-tools@0.0.22) (2026-06-28)

### Features

- **rt:ui-kit:** add a Material ripple to `rtui-button` press feedback, disabled while loading or disabled and clipped to the button bounds ([04cdae4](https://github.com/Eyhenij/rt-tools/commit/04cdae40e40c401af212b3c6f6e8017b9388e639)), closes [#205](https://github.com/Eyhenij/rt-tools/issues/205)

## [0.0.21](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.20...rt-tools@0.0.21) (2026-06-26)

### Bug Fixes

- **rt:ui-kit:** let the `text` appearance honour the `radius` modifier instead of hardcoding a 5px border-radius ([9440079](https://github.com/Eyhenij/rt-tools/commit/94400797b2739eeca34ea16771793f45b98e1a9d))
- **rt:ui-kit:** render projected icons in text-appearance buttons at a uniform size ([101c3ef](https://github.com/Eyhenij/rt-tools/commit/101c3ef0edf7abec85deb8f0c02c4c13c4977964))

### Features

- **rt:ui-kit:** add a transparent, borderless `text` appearance for every button colour, with a neutral hover wash via `--rt-bg-base-hover` ([47d4386](https://github.com/Eyhenij/rt-tools/commit/47d4386eead13900cb4f34c851372d1881bdf9d5))
- **rt:ui-kit:** unify all button variants into a single `rtui-button` component (`type` icon/fab/pill, `variant` default/primary/danger/success/warning/accent, `size` xs/sm/md/lg, `radius` none/sm/md/lg/full, `appearance` solid/outline/light/text) with built-in tooltip, loading spinner and icon slots
- **rt:ui-kit:** add a standalone `rtui-icon` component (Material Symbols Outlined) with `size`, `theme`, `glyph`, `outlined` and `rotate` inputs plus font-load tracking

### BREAKING CHANGES

- **rt:ui-kit:** the legacy `rtui-button` directive and `rtui-round-icon-button` component are removed. Migrate usages to the new `rtui-button` component (use `type="icon"`/`type="fab"` for the former round-icon button).

## [0.0.20](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.19...rt-tools@0.0.20) (2026-06-08)

### Bug Fixes

- **rt:ui-kit:** address color-scheme review notes ([abc7bab](https://github.com/Eyhenij/rt-tools/commit/abc7bab17c134b2465835e8d26783eed66dd05cd))
- **rt:ui-kit:** import ModDirective where rtMod is used in templates ([a0147ec](https://github.com/Eyhenij/rt-tools/commit/a0147ec94842b5284ffb45d985394d7796a81f7f))
- terminate leaking RxJS subscriptions with take(1) ([7a73637](https://github.com/Eyhenij/rt-tools/commit/7a736379376153cef2c3b8ff5b9227c7b796e3fc)), closes [#context](https://github.com/Eyhenij/rt-tools/issues/context)

### Features

- **rt:ui-kit:** add custom color-scheme (brand palette) support ([369fbb3](https://github.com/Eyhenij/rt-tools/commit/369fbb32dc86c7269116d952f9fd360f6bc299b5))

## [0.0.19](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.18...rt-tools@0.0.19) (2026-06-07)

## [0.0.18](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.17...rt-tools@0.0.18) (2026-06-07)

## [0.0.17](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.16...rt-tools@0.0.17) (2026-06-07)

### Features

- **rt:ui-kit:** add GMT-style design tokens v2 ([b053a03](https://github.com/Eyhenij/rt-tools/commit/b053a0353a5bf4bdccc26b752ec4d67783f668a4))
- **rt:ui-kit:** add theme runtime (RtThemeService, RtThemeDirective) ([18f054a](https://github.com/Eyhenij/rt-tools/commit/18f054ab736a608fe4ad780534abd0870193f8d8))

## [0.0.16](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.15...rt-tools@0.0.16) (2026-05-08)

## [0.0.15](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.14...rt-tools@0.0.15) (2026-04-30)

## [0.0.14](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.13...rt-tools@0.0.14) (2026-04-26)

## [0.0.13](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.12...rt-tools@0.0.13) (2026-04-25)

## [0.0.12](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.11...rt-tools@0.0.12) (2026-04-03)

## [0.0.11](https://github.com/Eyhenij/rt-tools/compare/rt-tools@0.0.10...rt-tools@0.0.11) (2026-04-03)

## 0.0.10 (2026-04-03)

### Bug Fixes

- change type and handler of table row event ([b3c4c30](https://github.com/Eyhenij/rt-tools/commit/b3c4c30ef3cf7000daa3523966b0a7b40f7f69b2))
- change type of table row event ([8b73a9e](https://github.com/Eyhenij/rt-tools/commit/8b73a9e9524ba0eb72d76a6373cc289d0ae7b227))
- column base cell copyable component ([5d44251](https://github.com/Eyhenij/rt-tools/commit/5d44251ec05a9771a1c128f721ee0b5877d3e8e6))
- empty to dash pipe ([#128](https://github.com/Eyhenij/rt-tools/issues/128)) ([1f08c23](https://github.com/Eyhenij/rt-tools/commit/1f08c2349ae7afd303d9020955a952279ffa11c1))
- fix action height based on local debug in web-store browser console ([75fd911](https://github.com/Eyhenij/rt-tools/commit/75fd911d7dd2b60ba2682c521cc1a1f4a62d56ef))
- fix position copy-btn logic ([e84ed2e](https://github.com/Eyhenij/rt-tools/commit/e84ed2e94e7e91f521010e940454b28f7a055c46))
- fix scrollable host height for mobile devices ([7c77513](https://github.com/Eyhenij/rt-tools/commit/7c77513224fb02c800e48ebf08cdb65a7d623942))
- fix table pagination ([08d9a12](https://github.com/Eyhenij/rt-tools/commit/08d9a12b04c205053848e08509730cde95dea540))
- fix table row actions position for Apple devices ([ea7c17b](https://github.com/Eyhenij/rt-tools/commit/ea7c17bea54b7abe31f281c2c6ca5fae3ee787c5))
- fix table selector visible and propagation ([15308d1](https://github.com/Eyhenij/rt-tools/commit/15308d1f4408ead99f730561952ca2edd7e793b1))
- placeholder and button add roles ([fe1bde4](https://github.com/Eyhenij/rt-tools/commit/fe1bde47f7b2007e685d8275f2538cbc31f9fd48))
- remove eslint comments ([#107](https://github.com/Eyhenij/rt-tools/issues/107)) ([f37a046](https://github.com/Eyhenij/rt-tools/commit/f37a046fdd13058598b77d32a9d948359456fe8c))
- row table actions position ([9cd18c0](https://github.com/Eyhenij/rt-tools/commit/9cd18c0b37560a443c004bc4fc0606f552839a1f))
- rtIconOutlined directive ([d62608e](https://github.com/Eyhenij/rt-tools/commit/d62608e160cf5fddaae725c63cbce58e6c3068d2))
- table row actions height ([cace356](https://github.com/Eyhenij/rt-tools/commit/cace356c78c1465cbd1890126c3f103d6ba688da))
- use areArraysEqualUnordered in rtui-dynamic-selector for pure comparison ([15878c4](https://github.com/Eyhenij/rt-tools/commit/15878c4524bd652a9ea18f884bf0027b1fb0ea91))

### Features

- add checks in pipe ([c9785d1](https://github.com/Eyhenij/rt-tools/commit/c9785d1b065fd9b80dad3fe617d35c09310e6e1d))
- add copyBtnAlign parameter in props of table-base-cell ([ff02209](https://github.com/Eyhenij/rt-tools/commit/ff0220986c0a91555afae8a31e09a813ca7e12ce))
- add default values fields to type cast helpers ([908a83f](https://github.com/Eyhenij/rt-tools/commit/908a83f7d65c451675f0f848de820cc48bf8fb99))
- add edit field option for dynamic input ([56bc83e](https://github.com/Eyhenij/rt-tools/commit/56bc83e7781557a96fe99cd4626ba3c2db77ea92))
- add empty-to-dash function ([#114](https://github.com/Eyhenij/rt-tools/issues/114)) ([3f6e5a2](https://github.com/Eyhenij/rt-tools/commit/3f6e5a2dcbaee8d042a1b9fffa5bd954e6cf85e5))
- add has property in chain function ([7d9f4fd](https://github.com/Eyhenij/rt-tools/commit/7d9f4fd1d8e550ae2aa2d763145ea85d2ac2fa0a))
- add has property in chain function export ([802365c](https://github.com/Eyhenij/rt-tools/commit/802365cb4076050148a532d8e161f2818ec7c3e6))
- add isFooterShown flag in aside container ([b2d31ba](https://github.com/Eyhenij/rt-tools/commit/b2d31ba9cab50a928c330f6163c485cb3be02e9d))
- add optimization to image cropper ([e83f0ad](https://github.com/Eyhenij/rt-tools/commit/e83f0addaa3c1ab2a96ea7596612cea55b0d326b))
- add save emitter ([27c510c](https://github.com/Eyhenij/rt-tools/commit/27c510c9d9898cfbce4d36534f5ed012fd6ff959))
- add selection column for table ([#47](https://github.com/Eyhenij/rt-tools/issues/47)) ([508ad0d](https://github.com/Eyhenij/rt-tools/commit/508ad0df779338209a04b8d31b51f58bac20279f))
- add table border width vars ([2e61f34](https://github.com/Eyhenij/rt-tools/commit/2e61f34228dd9c27ca07c9966c16c68f066eb5de))
- add table filter header row ([2085dcc](https://github.com/Eyhenij/rt-tools/commit/2085dcc664cf03224bc85c416b9d8a8b5abb3550))
- export is empty helpers ([#124](https://github.com/Eyhenij/rt-tools/issues/124)) ([1488d5b](https://github.com/Eyhenij/rt-tools/commit/1488d5b86926c9b60029c47f6383e084544a245c))
- extend basic types ([#104](https://github.com/Eyhenij/rt-tools/issues/104)) ([9ba8afe](https://github.com/Eyhenij/rt-tools/commit/9ba8afe4630932d1a6f4ff507e5d84b5d5230dd6))
- extend table interface ([bed9882](https://github.com/Eyhenij/rt-tools/commit/bed98822e59224d60a1b91b58b64eb7c984b914f))
- implement button component ([74233d0](https://github.com/Eyhenij/rt-tools/commit/74233d09814586eea565852c640e708a6e19ef89))
- implement multi-button component ([38e9a97](https://github.com/Eyhenij/rt-tools/commit/38e9a97231e9c1fcbd2e2991bb0f370e21c79432))
- implement table row click directive and table stop row click directive ([ca576e6](https://github.com/Eyhenij/rt-tools/commit/ca576e6f63604ccd6d377c9e97feabfcb3f57ef6))
- import debounce fn ([d912960](https://github.com/Eyhenij/rt-tools/commit/d912960c7288b5254ac70cc5aad514faec9ad831))
- init snackbar ([#50](https://github.com/Eyhenij/rt-tools/issues/50)) ([f55f01a](https://github.com/Eyhenij/rt-tools/commit/f55f01a7d856559df84a358d9c350e5d6ecffb6d))
- **rt:store:** add redux devtools integration ([e5f6081](https://github.com/Eyhenij/rt-tools/commit/e5f6081ffe0f3b64c5c97d8f5a7acd757a6a42f7))
- **rt:ui-kit:** add custom cells directive ([#72](https://github.com/Eyhenij/rt-tools/issues/72)) ([bfec9f5](https://github.com/Eyhenij/rt-tools/commit/bfec9f5ea81d8d90f4e499bcd78d3d0210939c48))
- **rt:ui-kit:** add custom sorting into dynamic selector component ([2051d89](https://github.com/Eyhenij/rt-tools/commit/2051d89d694db8be2f3258f3340c1c1cabbc637b))
- **rt:ui-kit:** add double click action for table ([#90](https://github.com/Eyhenij/rt-tools/issues/90)) ([c97cf11](https://github.com/Eyhenij/rt-tools/commit/c97cf11e2f27b0b048f8abe610ffbe71905c2304))
- **rt:ui-kit:** add dynamic input ([#81](https://github.com/Eyhenij/rt-tools/issues/81)) ([c5f6aa1](https://github.com/Eyhenij/rt-tools/commit/c5f6aa194a7592da6beb75f5f6cd859ff59fd2f5))
- **rt:ui-kit:** add dynamic selector ([#80](https://github.com/Eyhenij/rt-tools/issues/80)) ([95d8c27](https://github.com/Eyhenij/rt-tools/commit/95d8c270ba2c4896260e596ff26a5e8b97750f99))
- **rt:ui-kit:** add show hide scrollbar for table config aside ([#100](https://github.com/Eyhenij/rt-tools/issues/100)) ([63a918d](https://github.com/Eyhenij/rt-tools/commit/63a918d9aef338402220ff1d9cd878b56777a30d))
- **rt:ui-kit:** implement action bar ([69ac1a0](https://github.com/Eyhenij/rt-tools/commit/69ac1a0afb37d090a9fe11e3d662d8a7437d049b))
- **rt:ui-kit:** implement checkbox ([f12e94c](https://github.com/Eyhenij/rt-tools/commit/f12e94c7cd735f1931bfb59a4efbdd346886b412))
- **rt:ui-kit:** implement drag and drop for dynamic selectors ([#83](https://github.com/Eyhenij/rt-tools/issues/83)) ([a43319a](https://github.com/Eyhenij/rt-tools/commit/a43319aa128af289e12d7fe6f2d4207dd5e277eb))
- **rt:ui-kit:** implement dynamic list selectors directive ([#105](https://github.com/Eyhenij/rt-tools/issues/105)) ([9fe4aad](https://github.com/Eyhenij/rt-tools/commit/9fe4aad3accbec837489023e1e0e906c49902f6d))
- **rt:ui-kit:** implement image uploader ([#129](https://github.com/Eyhenij/rt-tools/issues/129)) ([f0b51a7](https://github.com/Eyhenij/rt-tools/commit/f0b51a7f552fa20aeb701c26feed6149c05fada0))
- **rt:ui-kit:** implement table config aside ([#95](https://github.com/Eyhenij/rt-tools/issues/95)) ([5429b9f](https://github.com/Eyhenij/rt-tools/commit/5429b9ff3f1437d7aaf13f2e1d9d02ef4fac8cb5))
- **rt:util:** add base mapper ([#77](https://github.com/Eyhenij/rt-tools/issues/77)) ([fa06185](https://github.com/Eyhenij/rt-tools/commit/fa06185c2d53ec50c20f00d3a101206e87e613e4))
- **util:** add icon directive and arrays validator ([#19](https://github.com/Eyhenij/rt-tools/issues/19)) ([46f3fe1](https://github.com/Eyhenij/rt-tools/commit/46f3fe18a6fa0fd241ce7c0bf8cc24962d0c344f))

### Reverts

- Revert "Refactor/use input types (#135)" ([4de980a](https://github.com/Eyhenij/rt-tools/commit/4de980ade8e805e596f74a15f6752c6a837d7ffe)), closes [#135](https://github.com/Eyhenij/rt-tools/issues/135)

## [0.0.9](https://github.com/Eyhenij/rt-tools/compare/0.0.8...0.0.9) (2026-04-03)

### Features

- **rt:ui-kit:** add custom sorting into dynamic selector component ([2051d89](https://github.com/Eyhenij/rt-tools/commit/2051d89))

Выпуски прежней линии номеров — `0.1.x`–`0.3.x` — лежат в `CHANGELOG-0.1-0.3.md` рядом.
