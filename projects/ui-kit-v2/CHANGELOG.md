# [0.10.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.9.0...rt-ui-kit-v2@0.10.0) (2026-09-09)

# [0.9.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.8.1...rt-ui-kit-v2@0.9.0) (2026-09-09)

### Bug Fixes

- **rt:ui-kit-v2:** матрица наборов не режется краем половины, оба эталона сняты ([8948bed](https://github.com/Eyhenij/rt-tools/commit/8948bed26a69d7ae0d742e3d73a6647fdd489913))
- **rt:ui-kit-v2:** набор рисунков читается у разметки, а не выбирается стилями ([0cb0c0e](https://github.com/Eyhenij/rt-tools/commit/0cb0c0e570346bed8915dbfb758542ca4dd11231))
- **rt:ui-kit-v2:** не приехавший материальный рисунок закрывается своим ([25431f5](https://github.com/Eyhenij/rt-tools/commit/25431f56cd0aca0465c8deec10b578377b9e39ac))
- **rt:ui-kit-v2:** подложка закрытой панели не ловит нажатия у потребителя со слоями ([23aeb95](https://github.com/Eyhenij/rt-tools/commit/23aeb952d164c2068bbc0d0e7d2f43e8a2a55929))
- **rt:ui-kit-v2:** полоса прокрутки молчит в покое и проявляется наведением ([074b544](https://github.com/Eyhenij/rt-tools/commit/074b544caeb7bf2f6b94850c98544488fc1a50ad)), closes [#34](https://github.com/Eyhenij/rt-tools/issues/34)
- **rt:ui-kit-v2:** пояс и язык съёмки заданы обвязкой, а не машиной ([17dab22](https://github.com/Eyhenij/rt-tools/commit/17dab2288ea6c8032f28d6d4686f7baae290ec12))
- **rt:ui-kit-v2:** признак уровня записан в правило, обе разъехавшиеся пары выправлены ([fff16d9](https://github.com/Eyhenij/rt-tools/commit/fff16d994766577705fdf7a6f833743d007c0390))
- **rt:ui-kit-v2:** стили волны подключены к слою оформления кита ([4d2d2fc](https://github.com/Eyhenij/rt-tools/commit/4d2d2fc0e03bd21ac6f9354b1ed6d5f024f33210))
- **rt:ui-kit-v2:** у волны заглушки своя пара имён цвета, и в светлом виде они разведены ([193e3b8](https://github.com/Eyhenij/rt-tools/commit/193e3b84551b4164ffe27e7eb32ab365bd3c9ae5)), closes [#e0e0e0](https://github.com/Eyhenij/rt-tools/issues/e0e0e0) [#e0e0e0](https://github.com/Eyhenij/rt-tools/issues/e0e0e0)

### Features

- **rt:agent-kit:** сборщик слоя оформления печатает вывод по-английски ([1c7f447](https://github.com/Eyhenij/rt-tools/commit/1c7f44792df3d79b90665239b4e016a99fb7777b))
- **rt:core:** входы компонента, созданного в коде, проверяются сборкой ([61db5b1](https://github.com/Eyhenij/rt-tools/commit/61db5b189e083ca0ed5d89aa6e898b999cfa2e75)), closes [#7](https://github.com/Eyhenij/rt-tools/issues/7)
- **rt:ui-kit-v2:** в наборе значков двенадцать знаков соцсетей в фирменных цветах ([c70e337](https://github.com/Eyhenij/rt-tools/commit/c70e337904dadb83e2545d6f855422bbf70c1d88))
- **rt:ui-kit-v2:** витрина показывает один значок в двух наборах рядом ([07a6cec](https://github.com/Eyhenij/rt-tools/commit/07a6cec6276c8996a509134de7f64922685169a7))
- **rt:ui-kit-v2:** значку первого кита назначена пара в наборе второго ([919e719](https://github.com/Eyhenij/rt-tools/commit/919e719548c307b7080f837c285e3eb5a957f3dd))
- **rt:ui-kit-v2:** значок выбирает набор рисунков вместе с набором оформления ([898521a](https://github.com/Eyhenij/rt-tools/commit/898521a819805e6c9d337c7355a6cdd8cb318b4b))
- **rt:ui-kit-v2:** импорт Material во втором ките отбивается линтером ([ea31410](https://github.com/Eyhenij/rt-tools/commit/ea31410da10ad5612ac78fe1a9930eab9ea4d80c))
- **rt:ui-kit-v2:** кнопка и кнопка-значок отвечают на нажатие волной ([3940dd9](https://github.com/Eyhenij/rt-tools/commit/3940dd98c2e9cd7cc89332dbddb7556e30cd0157))
- **rt:ui-kit-v2:** кнопка с подписью знает своё положение ([fcf5285](https://github.com/Eyhenij/rt-tools/commit/fcf5285b4c718f2975c3e1e4abff396668a19171)), closes [#29](https://github.com/Eyhenij/rt-tools/issues/29)
- **rt:ui-kit-v2:** материальный набор оформления и признак набора на странице ([308bc73](https://github.com/Eyhenij/rt-tools/commit/308bc73439ca730a520a60997a8a79d95f9acd28))
- **rt:ui-kit-v2:** метка вкладки получила подсказку и подпись для чтения с экрана ([5659ae4](https://github.com/Eyhenij/rt-tools/commit/5659ae4d9f983e95b13f5a654d64c00c044864ab))
- **rt:ui-kit-v2:** молчание материального набора о цвете отбивается проверкой ([c6be55d](https://github.com/Eyhenij/rt-tools/commit/c6be55d73726fa70fa9ba773dcc37e178330e717))
- **rt:ui-kit-v2:** молчание набора у двух янтарных имён названо причиной ([d28e1a1](https://github.com/Eyhenij/rt-tools/commit/d28e1a15fd8dbb6da45fab09db05884ccdcc2c43))
- **rt:ui-kit-v2:** переключатель умеет множественный выбор и недоступный сегмент ([61b7262](https://github.com/Eyhenij/rt-tools/commit/61b7262837e6bf9ea94f9d77903ce01cb7b633fa)), closes [#88](https://github.com/Eyhenij/rt-tools/issues/88)
- **rt:ui-kit-v2:** порог читаемости считается и в материальном наборе ([0f66134](https://github.com/Eyhenij/rt-tools/commit/0f66134ab11411d0a54f6468c49e13c8a4bc5376))
- **rt:ui-kit-v2:** проверка полноты набора стоит в гарде и в конвейере ([1d8107a](https://github.com/Eyhenij/rt-tools/commit/1d8107a9d7b9c51ac1aac9f84cdab452a4df7f3e))
- **rt:ui-kit-v2:** рисунки Material легли в дерево вторым набором значков ([40d62d4](https://github.com/Eyhenij/rt-tools/commit/40d62d4433a516ebc680fc175bcf6cf16760e872))
- **rt:ui-kit-v2:** свой набор оформления и материальный стоят рядом в витрине ([1763a80](https://github.com/Eyhenij/rt-tools/commit/1763a8033b1ad5da1958a6422d9159a6faafdae0))
- **rt:ui-kit-v2:** сжатая полоса шапки показана витриной ([140b1d6](https://github.com/Eyhenij/rt-tools/commit/140b1d64a4f3b9022b6e437cce2ae01f17bbb604))
- **rt:ui-kit-v2:** скругление контрола стало назначением, набор ставит ему 1.5rem ([e3ae5b0](https://github.com/Eyhenij/rt-tools/commit/e3ae5b07626a2b75825fa33727a47133c4c4d058))
- **rt:ui-kit-v2:** словарь формы панели объявлен в ките ([eee0158](https://github.com/Eyhenij/rt-tools/commit/eee01588daa79e4441e798d6e6a49a657b2c27fc))
- **rt:ui-kit-v2:** словарь формы получил виды строки, элемента ряда и рамку записи ([7284f89](https://github.com/Eyhenij/rt-tools/commit/7284f8925dd7db2dbd92d27593906dae95d1b4c7))
- **rt:ui-kit-v2:** у кнопки-значка ровный ряд форм и своё свойство тени ([9dc1863](https://github.com/Eyhenij/rt-tools/commit/9dc1863e11cf1f7f93b67ce951532eb49cc0a332))
- **rt:ui-kit-v2:** у кнопки-значка четыре формы вместо двух ([abc2496](https://github.com/Eyhenij/rt-tools/commit/abc24968e003bc68ad4e064cf2cfbbb4e3ac4208))
- **rt:ui-kit-v2:** числовое поле умеет обходиться без разделителей разрядов ([018c366](https://github.com/Eyhenij/rt-tools/commit/018c366da1adcdc292b0ba4a3fbd0fa24b94f1ec))
- **rt:ui-kit-v2:** шапка липнет к верху и сжимается в полосу ([f7d76ad](https://github.com/Eyhenij/rt-tools/commit/f7d76ad249c6c69167a43c90e66cfd32236db300))

## [0.8.1](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.8.0...rt-ui-kit-v2@0.8.1) (2026-09-03)

### Bug Fixes

- **rt:ui-kit-v2:** зависимость на utils поднята до версии с EListSortOrder ([f4db77f](https://github.com/Eyhenij/rt-tools/commit/f4db77f23f0e1029288783e9248ff1deac85ca7b))

# [0.8.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.7.0...rt-ui-kit-v2@0.8.0) (2026-08-30)

### Bug Fixes

- **rt:ui-kit-v2:** поле берёт состояние формы обоих родов ([59afc06](https://github.com/Eyhenij/rt-tools/commit/59afc06284d28341b7dff47cc96c4d1ea6b83b28))

### Features

- **rt:ui-kit-v2:** исход мутации панель показывает внутри себя ([1129d1e](https://github.com/Eyhenij/rt-tools/commit/1129d1e0c3268c1bfe750c04c3394fb49af9a3b6))
- **rt:ui-kit-v2:** своё действие у реплики переписки объявляется шаблоном потребителя ([8614459](https://github.com/Eyhenij/rt-tools/commit/86144591f5db8c174e1f371dd4dc73a17f962f66))

# [0.7.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.6.0...rt-ui-kit-v2@0.7.0) (2026-08-26)

### Bug Fixes

- **rt:agent-kit:** правило приставки типа говорит про T, а узловые глобали доходят до серверных проектов ([a0bd361](https://github.com/Eyhenij/rt-tools/commit/a0bd361c1c6df5e8aeb3c5efc032b3dfc75fb1ce))
- **rt:agent-kit:** проверка классов вёрстки собирает имя из вложенности, а долг разобран до нуля ([95f28c8](https://github.com/Eyhenij/rt-tools/commit/95f28c83e4736061acfde8cc3a361a652513fff1))
- **rt:ui-kit-v2:** витрина второго кита снова собирается, а два эталона названы новыми именами ([5a83166](https://github.com/Eyhenij/rt-tools/commit/5a83166e00d115f75af290cbc213989e4b2e5e43))
- **rt:ui-kit-v2:** длинное значение обрезается многоточием и показывается подсказкой ([8e660f5](https://github.com/Eyhenij/rt-tools/commit/8e660f583051e954b0935497c6fab04bcca70a32))
- **rt:ui-kit-v2:** закрытая панель возвращает экран с его параметрами адреса ([d9b77f7](https://github.com/Eyhenij/rt-tools/commit/d9b77f7dd66e9b5706f375d9c2131aa7a8205adb))
- **rt:ui-kit-v2:** закрытая шторка каркаса не перехватывает нажатий по странице ([d30cd6a](https://github.com/Eyhenij/rt-tools/commit/d30cd6a2e4d35d9dd7409c11676ada90ebeb9511))
- **rt:ui-kit-v2:** имя в шапке показа выдумано, а не взято у машины ([c5955e2](https://github.com/Eyhenij/rt-tools/commit/c5955e27a76e6d5298969f33e77fcb4b46167b9f))
- **rt:ui-kit-v2:** кадр целой страницы снимается раздвинутым окном ([bf0d39c](https://github.com/Eyhenij/rt-tools/commit/bf0d39c8bc059d597e8e9a51a56e07d7a3be3514))
- **rt:ui-kit-v2:** нейтральный ряд перестал красить синевой три роли сразу ([561277e](https://github.com/Eyhenij/rt-tools/commit/561277e9bf135c524b2a4bb5c933c2b379d3ee92))
- **rt:ui-kit-v2:** подпись пункта витрины вернулась во множественное число ([a31d0b7](https://github.com/Eyhenij/rt-tools/commit/a31d0b7eec425037725ad7a5221b18e7b4dded89)), closes [#687](https://github.com/Eyhenij/rt-tools/issues/687)
- **rt:ui-kit-v2:** приглушённый текст тёмной темы взял порог контраста ([636eaf4](https://github.com/Eyhenij/rt-tools/commit/636eaf4b172f884c776bca3555a29d000e8f9923))
- **rt:ui-kit-v2:** раскладка экрана входа доезжает до потребителя ([3c249c9](https://github.com/Eyhenij/rt-tools/commit/3c249c943d5a35799ec56f4d9bb5f1ebaa7e6edf))
- **rt:ui-kit-v2:** съёмка витрины ждёт значок любой из двух разметок ([69e063d](https://github.com/Eyhenij/rt-tools/commit/69e063d32ab6a4ea3ab8839fdfcc0e83c5a4d02c))
- **rt:ui-kit-v2:** съёмка витрины ждёт компонент, чья начинка приезжает позже ([c268837](https://github.com/Eyhenij/rt-tools/commit/c2688370058fbb28c713c3449d87ed1d9041a2ec))
- **rt:ui-kit-v2:** тёмная тема отвечает на светло-серый фон поверхности ([6862bf9](https://github.com/Eyhenij/rt-tools/commit/6862bf998b0a6e3dc5bd6966f2ee557a79b490d9)), closes [#bfc7d6](https://github.com/Eyhenij/rt-tools/issues/bfc7d6) [#17181c](https://github.com/Eyhenij/rt-tools/issues/17181c)
- **rt:ui-kit-v2:** шаблон витрины перестал звать ступень отступа, которой нет ([8bcc4d1](https://github.com/Eyhenij/rt-tools/commit/8bcc4d16b11e266264b98c9fcf6e9cc6ccd076a5))
- **rt:ui-kit-v2:** экран витрины сходится с образцом раскладкой и показывает все три своих вида ([7c55ac9](https://github.com/Eyhenij/rt-tools/commit/7c55ac940e1e3d39ef596074dea0b98bc4f7ca17))

### Features

- **rt:message-bus:** админка заводится каркасом, входом и оболочкой с меню ([7736c6c](https://github.com/Eyhenij/rt-tools/commit/7736c6cf9f79e335c550ca5e41764ba265c23c75))
- **rt:ui-kit-v2:** витрина показывает целый экран раздела с панелями заведения и правки ([a25f6e9](https://github.com/Eyhenij/rt-tools/commit/a25f6e9ea76c8fb1677c7c4842013bcf68ac2170)), closes [#877](https://github.com/Eyhenij/rt-tools/issues/877)
- **rt:ui-kit-v2:** значок едет по запросу имени, а не всем набором вперёд ([a47087b](https://github.com/Eyhenij/rt-tools/commit/a47087b326361baa014f8974f17905f5cdea5f60))
- **rt:ui-kit-v2:** показ разметки виден на витрине шестью историями ([55e79bf](https://github.com/Eyhenij/rt-tools/commit/55e79bfef5f7a06ee71021ce1ea34ad229955da9)), closes [#912](https://github.com/Eyhenij/rt-tools/issues/912)
- **rt:ui-kit-v2:** слой оформления собирается из источника ([0b1769b](https://github.com/Eyhenij/rt-tools/commit/0b1769b718048696d2ac9144530d95815e083b09))
- **rt:ui-kit-v2:** текст разметкой показывается узлами, а не строкой ([d13a1ec](https://github.com/Eyhenij/rt-tools/commit/d13a1ecf5c3ad6fb6c231c0b0311a328a0b5be08)), closes [#912](https://github.com/Eyhenij/rt-tools/issues/912)
- **rt:ui-kit-v2:** у поля ввода есть тип адреса ([b7e42e2](https://github.com/Eyhenij/rt-tools/commit/b7e42e269ea2dcdc8a7e4da6706bb2eb7c4f1317))
- **rt:ui-kit-v2:** шапка показа целая — меню второго уровня и попап профиля ([1ce47bb](https://github.com/Eyhenij/rt-tools/commit/1ce47bb6fcb95a0a3a9915b46de248ce2d392df5))

### BREAKING CHANGES

- **rt:ui-kit-v2:** предзагрузки всего набора значков больше нет. `provideRtIcons(baseUrl?)`
  называет адрес набора и сам не грузит ничего: значок едет тогда, когда его попросила разметка,
  и страница платит за те значки, которые нарисовала. Потребитель, ждавший готовый спрайт к
  старту приложения, его не получит — значки появляются после первой отрисовки, каждый своим
  запросом. Приём снаружи прежний, правка сводится к обновлению версии.

    Замер на прод-сборке админки: страница входа рисует четыре значка и шлёт за ними четыре
    запроса на 4 КБ вместо трёхсот тридцати пяти на 291 КБ.

    Заодно ушёл край, на котором одно имя без файла гасило значки во всём приложении: отказ
    остаётся внутри реестра и виден пустым местом на месте своего значка.

- **rt:ui-kit-v2:** псевдонимы типа получили приставку `T`: в этом дереве `I` носит интерфейс, а `T` — псевдоним типа,
  и правило линтера требует именно её. Псевдонимов под прежними именами не оставлено — у символа одно имя, и переход
  состоит в правке импортов. Переименовано 17:

    - `IIconCategory` → `TIconCategory`
    - `IRtAsideContentLayout` → `TRtAsideContentLayout`
    - `IRtAsidePosition` → `TRtAsidePosition`
    - `IRtAsideSize` → `TRtAsideSize`
    - `IRtDialogSize` → `TRtDialogSize`
    - `IRtRichEditorToolbar` → `TRtRichEditorToolbar`
    - `IRtSkeletonRadius` → `TRtSkeletonRadius`
    - `IRtSkeletonShape` → `TRtSkeletonShape`
    - `IRtSkeletonSize` → `TRtSkeletonSize`
    - `IRtTableAriaSort` → `TRtTableAriaSort`
    - `IRtTextareaResize` → `TRtTextareaResize`
    - `RtConsumerHandleName` → `TRtConsumerHandleName`
    - `RtDesignTokenName` → `TRtDesignTokenName`
    - `RtKitLabelKey` → `TRtKitLabelKey`
    - `RtKitLabelMap` → `TRtKitLabelMap`
    - `RtKitLabelParams` → `TRtKitLabelParams`
    - `RtKitTranslator` → `TRtKitTranslator`

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
