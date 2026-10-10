## [0.23.1](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.23.0...rt-ui-kit-v2@0.23.1) (2026-10-10)

# [0.23.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.22.1...rt-ui-kit-v2@0.23.0) (2026-10-09)

## [0.22.1](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.22.0...rt-ui-kit-v2@0.22.1) (2026-10-09)

### Bug Fixes

- **rt:ui-kit-v2:** строка 133 — эхо chosenEntities узнаётся по набору ключей, а не по порядку ([0381f27](https://github.com/Eyhenij/rt-tools/commit/0381f27485df8778323f5da5521ce1d355a15c16)), closes [#takeChosen](https://github.com/Eyhenij/rt-tools/issues/takeChosen)
- **rt:ui-kit-v2:** строки 129–130 приложения — перемер подсказки после роста папки, полоса доступна при поиске ([46826a7](https://github.com/Eyhenij/rt-tools/commit/46826a70095b0eb42a21c2a9a7f84ee0f5e66a7f))

### Features

- **rt:ui-kit-v2:** боковое меню — строки 122–128 приложения: папка Material, значки строк, нажатие строки, задержка закрытия ([f619233](https://github.com/Eyhenij/rt-tools/commit/f6192334e8d92f391a48a375bfea8999891d8f70))
- **rt:ui-kit-v2:** боковое меню получает вид первого кита входами и свойствами ([1508392](https://github.com/Eyhenij/rt-tools/commit/150839287b90d53ea6382bf12ab97903595ba5ec))
- **rt:ui-kit-v2:** строка 131 приложения — форма, размер и цвет кнопок строки подменю свойствами ([31e3806](https://github.com/Eyhenij/rt-tools/commit/31e3806562c06ee3215b52ce4972b69ec6f5fbc0))
- **rt:ui-kit-v2:** строка 132 — тост сообщает, почему ушёл без действия ([c3bed85](https://github.com/Eyhenij/rt-tools/commit/c3bed8500c1dc50a52783056cae8599e5d4f89bc))

# [0.22.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.21.0...rt-ui-kit-v2@0.22.0) (2026-10-09)

### Features

- **rt:ui-kit-v2:** меню действий беседы в списке бесед rt-ai-chat ([087b407](https://github.com/Eyhenij/rt-tools/commit/087b4079bb2c749ad24b90392c688c3ed01adc76)), closes [#2729](https://github.com/Eyhenij/rt-tools/issues/2729)

# [0.21.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.20.0...rt-ui-kit-v2@0.21.0) (2026-10-09)

### Bug Fixes

- **rt:ui-kit-v2:** ответ rt-ai-chat копируется текстом без разметки ([11526c9](https://github.com/Eyhenij/rt-tools/commit/11526c94a18ab838981207cd97cff9a6c5b91ef4)), closes [#2720](https://github.com/Eyhenij/rt-tools/issues/2720)

### Features

- **rt:ui-kit-v2:** значки шапки rt-ai-chat материальным набором без набора оформления ([f33b9b5](https://github.com/Eyhenij/rt-tools/commit/f33b9b5b374a8ac38110bf525832fa3fbf7fc0ae)), closes [#2722](https://github.com/Eyhenij/rt-tools/issues/2722)
- **rt:ui-kit-v2:** кнопка копирования у вопроса и ответа rt-ai-chat ([25226f2](https://github.com/Eyhenij/rt-tools/commit/25226f22c30d6ce0d89966ddecae057b4d4b2602)), closes [#2720](https://github.com/Eyhenij/rt-tools/issues/2720)

# [0.20.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.19.1...rt-ui-kit-v2@0.20.0) (2026-10-09)

### Bug Fixes

- **rt:ui-kit-v2:** красная главная — шаблоны витрин в файлах, спека таблицы поделена ([cbd1bb2](https://github.com/Eyhenij/rt-tools/commit/cbd1bb2f22b7fe5af1cb95b9a2fcb1dbcfe3e853))
- **rt:ui-kit-v2:** поле строк, приглашение и «Выбрать все» не задают display хостам компонентов кита ([43f4a84](https://github.com/Eyhenij/rt-tools/commit/43f4a847bead7973cb1c3fc2fd742c51768aa09d))
- **rt:ui-kit-v2:** при способе font имя кита, которое шрифт не нарисует, рисуется значком кита ([ea9e909](https://github.com/Eyhenij/rt-tools/commit/ea9e90965c1e352b544f3754f9622ed45c8850c8))
- **rt:ui-kit-v2:** пункт, отмеченный во время поиска, стоит на месте до смены запроса ([64a615e](https://github.com/Eyhenij/rt-tools/commit/64a615e0d99beb53068d829b00bb16f9b567a973))

### Features

- **rt:ui-kit-v2:** вход displayWith — подпись записи функцией у селектора и окна выбора ([fe16466](https://github.com/Eyhenij/rt-tools/commit/fe16466f1655eb7e9862b890d50181b316d87cae))
- **rt:ui-kit-v2:** зазоры списка выбора, поля и зазоры пустого состояния, без пустого списка под приглашением ([779cdc2](https://github.com/Eyhenij/rt-tools/commit/779cdc2df513b7bb2764f35e833adfe4bf6b8d7b))
- **rt:ui-kit-v2:** значки строк-превью пустого rt-thread-list задаёт вход emptyPreviewIcons ([f618126](https://github.com/Eyhenij/rt-tools/commit/f618126dd708afc1a0050a976467aa2c8c356501)), closes [#2714](https://github.com/Eyhenij/rt-tools/issues/2714)
- **rt:ui-kit-v2:** окно выбора берёт фокус поиска, строку пункта, зазор пустого результата и отступ низа ([620a584](https://github.com/Eyhenij/rt-tools/commit/620a584dc45946357a8fb50623a44b8f09980b2d))
- **rt:ui-kit-v2:** окно выбора подсвечивает совпадения с поиском и берёт подпись кнопки применения ([301460f](https://github.com/Eyhenij/rt-tools/commit/301460f8e4049a980954ceaaaa82f3758318612a))
- **rt:ui-kit-v2:** отступ полосы действий списка выбора справа ([a5726be](https://github.com/Eyhenij/rt-tools/commit/a5726be6cf9270a3f7b03183d5e3e3eea4d689d8))
- **rt:ui-kit-v2:** подпись пункта окна выбора идёт одной строкой, когда перенос выключен ([a803e36](https://github.com/Eyhenij/rt-tools/commit/a803e36b117aac079ae5637d73741a1cba0604dc))
- **rt:ui-kit-v2:** поле поиска окна выбора берёт шаг скругления из входа и настроек кита ([4255345](https://github.com/Eyhenij/rt-tools/commit/425534564292bcf9ae4a1136a55d60cc09317a7a))
- **rt:ui-kit-v2:** пустой список бесед rt-ai-chat рисует строки-превью со значками ассистента ([fd9f9c1](https://github.com/Eyhenij/rt-tools/commit/fd9f9c13de7b915d454ca9b85def4d02306f03a8)), closes [#2714](https://github.com/Eyhenij/rt-tools/issues/2714)
- **rt:ui-kit-v2:** разделитель между кнопками строки, отступы ручки и зазор до названия в списке выбора ([719cbcf](https://github.com/Eyhenij/rt-tools/commit/719cbcf7b5e554f458bbf335de7ddb156d863150))
- **rt:ui-kit-v2:** фон и скругление подсветки совпадений в окне выбора ([223a0e3](https://github.com/Eyhenij/rt-tools/commit/223a0e30febeccaf3e5d717256ad1cce8ec4af1c))
- **rt:ui-kit-v2:** шаг скругления у залитого поля, вид pill у полей и пункты окна выбора снова слева ([4748a6d](https://github.com/Eyhenij/rt-tools/commit/4748a6d895b87d40263d14134aeb7a5c8d846498))

## [0.19.1](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.19.0...rt-ui-kit-v2@0.19.1) (2026-10-08)

### Bug Fixes

- **rt:ui-kit-v2:** список открывается на выбранном пункте, сброс отбора держит фокус ([70f5e6e](https://github.com/Eyhenij/rt-tools/commit/70f5e6e7cecc6e6b17910068e402a78013cf7669)), closes [#2698](https://github.com/Eyhenij/rt-tools/issues/2698)

### Features

- **rt:ui-kit-v2:** блик хода работы медленнее и разноцветный ([0084758](https://github.com/Eyhenij/rt-tools/commit/008475803f723812c02231075a3f2d12fa13ab92)), closes [#2695](https://github.com/Eyhenij/rt-tools/issues/2695)
- **rt:ui-kit-v2:** крутилка хода работы переливается цветами блика ([ccde05e](https://github.com/Eyhenij/rt-tools/commit/ccde05e1e668c4335d2800fd55f3b02e953fbe30)), closes [#2695](https://github.com/Eyhenij/rt-tools/issues/2695)

# [0.19.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.18.0...rt-ui-kit-v2@0.19.0) (2026-10-08)

### Bug Fixes

- **rt:ui-kit-v2:** длинный заголовок плотной полосы переносится внутри колонки ([96af4ae](https://github.com/Eyhenij/rt-tools/commit/96af4ae9cf09fe2e50b032f1ac52bbd10b0b9946))
- **rt:ui-kit-v2:** ступени размера значка названы --rt-icon-step-*, а не именами первого кита ([302c9e5](https://github.com/Eyhenij/rt-tools/commit/302c9e594bca182c009bc8d3d34e77c93079c0d4))
- **rt:ui-kit-v2:** сценарий плотной панели получил свой номер SC-UKV-727 ([266a547](https://github.com/Eyhenij/rt-tools/commit/266a5476ee021c2d2d845c9235c408e222eeffb2))
- **rt:ui-kit-v2:** тело окна выбора занимает высоту, заданную наименьшей высотой окна ([ba91c79](https://github.com/Eyhenij/rt-tools/commit/ba91c794b246b41c66dae707a7d62a55c838d9b2))

### Features

- **rt:ui-kit-v2:** chosenEntities, titleWrap, свойства меню полосы и умолчания полей выбора из настроек кита ([b935099](https://github.com/Eyhenij/rt-tools/commit/b9350997e2b5dcea492706e1eb8c54ebf537a6c6))
- **rt:ui-kit-v2:** вид селектора, поля строк, полосы действий и значка задаёт приложение ([b031eff](https://github.com/Eyhenij/rt-tools/commit/b031effc2a17a20e22762ac2f2014f69d9a363b3))
- **rt:ui-kit-v2:** значение с кнопкой копирования rt-copy-value ([4365d43](https://github.com/Eyhenij/rt-tools/commit/4365d43d56f1bf1a721b297c92de6382cb094841)), closes [#2652](https://github.com/Eyhenij/rt-tools/issues/2652)
- **rt:ui-kit-v2:** значки искры и оценки ответа — sparkle, thumb-up, thumb-down ([0f2fa3e](https://github.com/Eyhenij/rt-tools/commit/0f2fa3e218a5ce7ed3f7a3bde5e2269b7ec4ceba)), closes [#2650](https://github.com/Eyhenij/rt-tools/issues/2650)
- **rt:ui-kit-v2:** карточка подсказки запроса rt-prompt-suggestion ([7784e37](https://github.com/Eyhenij/rt-tools/commit/7784e37d906aec0d5cfbbc4287e71e37f8dfbd95)), closes [#2653](https://github.com/Eyhenij/rt-tools/issues/2653)
- **rt:ui-kit-v2:** панель ИИ-ассистента rt-ai-chat ([0eb64dc](https://github.com/Eyhenij/rt-tools/commit/0eb64dcd8946200d7888ceb29379c61fc63d2036)), closes [#2654](https://github.com/Eyhenij/rt-tools/issues/2654)
- **rt:ui-kit-v2:** перенос названия строки задаётся в настройках кита для полей выбора ([3cc01c8](https://github.com/Eyhenij/rt-tools/commit/3cc01c81f3a45bacac026695e299c6b1c3cc74bd))
- **rt:ui-kit-v2:** поле новой строки у rt-dynamic-input получает подпись fieldLabel ([d589f56](https://github.com/Eyhenij/rt-tools/commit/d589f56975cab760d0efd8f34ac23cdc824770d5))
- **rt:ui-kit-v2:** строка хода работы ассистента rt-ai-run-status ([453acf6](https://github.com/Eyhenij/rt-tools/commit/453acf6579ed5aae94548aa1e09452b872fe6832)), closes [#2651](https://github.com/Eyhenij/rt-tools/issues/2651)
- **rt:ui-kit-v2:** шапка панели, сервис панели, тихая полоса и поле строк по второму списку приложения ([e5ba089](https://github.com/Eyhenij/rt-tools/commit/e5ba0898273776fdb8110106cf9c016cfc8131af))

# [0.18.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.17.0...rt-ui-kit-v2@0.18.0) (2026-10-07)

### Bug Fixes

- **rt:ui-kit-v2:** обёртка витрины поля точек в трёх файлах и история Presets ([14805b3](https://github.com/Eyhenij/rt-tools/commit/14805b33f3eb5d9f8d5b34aab6786b7f27a714ea))
- **rt:ui-kit-v2:** стили обёртки витрины поля точек в каскадном слое кита ([a208a4e](https://github.com/Eyhenij/rt-tools/commit/a208a4eb40ddf39f5326f74df75a49e64f575e4f))
- **rt:ui-kit-v2:** сценарии подписи полей получили свободные номера SC-UKV-687 и 688 ([6ce7fa6](https://github.com/Eyhenij/rt-tools/commit/6ce7fa601ac6f7dd6a914aba40ef701c5bf8c5c4))
- **rt:ui-kit-v2:** у текста в полях больше не срезаны хвосты букв ([59c73ab](https://github.com/Eyhenij/rt-tools/commit/59c73ab84de5fd27c385a305d3384dd5926675f1))

### Features

- **rt:ui-kit-v2:** каждый компонент собран своей точкой входа ([ea8a489](https://github.com/Eyhenij/rt-tools/commit/ea8a489c3f7aa76b81e43aa6efad2d921a65f9be))
- **rt:ui-kit-v2:** поле объявляет себя обязательным входом required ([f98f7eb](https://github.com/Eyhenij/rt-tools/commit/f98f7eb1af0e409df2711af992ccf98607f30228))
- **rt:ui-kit-v2:** поле точек rt-dot-field за карточкой экранов входа ([5859257](https://github.com/Eyhenij/rt-tools/commit/585925701b0c8c12c99daa5262bc1391369489ed))
- **rt:utils:** цвет текста по фону и затемнение цвета перенесены из первого кита ([923020b](https://github.com/Eyhenij/rt-tools/commit/923020b0d5ecd40cc05268dece90f911a01749d9)), closes [#rrggbb](https://github.com/Eyhenij/rt-tools/issues/rrggbb)

# [0.17.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.16.0...rt-ui-kit-v2@0.17.0) (2026-10-04)

### Bug Fixes

- **rt:ui-kit-v2:** длинная строка «печатает» не упирается в край ленты ([eddfde6](https://github.com/Eyhenij/rt-tools/commit/eddfde6a49afd8357fdb9ed01a7f16e5e3cb64bc))
- **rt:ui-kit-v2:** переключатель панели сброса селектора — обычный булев вход ([2b9ae06](https://github.com/Eyhenij/rt-tools/commit/2b9ae06786b470977f46c075f5e3ca7d610ebd96))
- **rt:ui-kit-v2:** пункт полосы бокового меню отдаёт своему шаблону имя и место ([781cd42](https://github.com/Eyhenij/rt-tools/commit/781cd42aa507838cb850dc064386de4e934f0cb4))
- **rt:ui-kit-v2:** семья шрифта лигатуры объявлена ручкой приложения ([d72cb09](https://github.com/Eyhenij/rt-tools/commit/d72cb09cb5a1eaef78a26518342041e5124c24b4))
- **rt:ui-kit-v2:** тег снова наследует межбуквенный интервал родителя ([4af30f7](https://github.com/Eyhenij/rt-tools/commit/4af30f7150773daad1b013fdc1febd77f18314fd))
- **rt:ui-kit-v2:** фон области прокрутки не перебивает фон элемента, который она собой занимает; снимки ([b697a88](https://github.com/Eyhenij/rt-tools/commit/b697a887de78ab02ecb4df8759c280f4a9d57a50))

### Features

- **rt:ui-kit-v2:** боковое меню без закрепления и подсказок, свой рисунок у кнопки строки ([27111a6](https://github.com/Eyhenij/rt-tools/commit/27111a6421517f767da942620866d721a4adb515))
- **rt:ui-kit-v2:** витрина переключателей бокового меню и вложенного рисунка кнопки-иконки ([4100831](https://github.com/Eyhenij/rt-tools/commit/4100831050203d6aa63e656cae900bbc886d172d))
- **rt:ui-kit-v2:** витрина переписки показывает строку «печатает» и событие набора ([3722c37](https://github.com/Eyhenij/rt-tools/commit/3722c37877a296211a7a9a99e6191470fdfb2515))
- **rt:ui-kit-v2:** владелец, отказанные жесты, ловушка фокуса, ожидание и свойства панели ([5a90044](https://github.com/Eyhenij/rt-tools/commit/5a9004439e2d8acc3beb1c0a0b62554a2df79cac))
- **rt:ui-kit-v2:** глиф у кнопки-значка, группы переключателей и заглушки ([21b5203](https://github.com/Eyhenij/rt-tools/commit/21b520392d739ed9d696524124f8635ba7179594))
- **rt:ui-kit-v2:** группа переключателей — свойства размеров на хосте ([897c0b8](https://github.com/Eyhenij/rt-tools/commit/897c0b8bfd7c5e85dca2d9aa4f77ceaa2b6cd77e))
- **rt:ui-kit-v2:** значок вращается и принимает размер в пикселях ([408abb4](https://github.com/Eyhenij/rt-tools/commit/408abb4be25dbadd26b24eb8157bba9ccda3e067))
- **rt:ui-kit-v2:** значок рисует имя Material глифом ([2cbe707](https://github.com/Eyhenij/rt-tools/commit/2cbe707481471537d448bede2c43ac7f45932a56))
- **rt:ui-kit-v2:** кнопка — подпись можно спрятать на время загрузки ([193a232](https://github.com/Eyhenij/rt-tools/commit/193a232c23eacef934f5c434f76d37999c750e92))
- **rt:ui-kit-v2:** кнопка рисует имя Material и материальный рисунок ([45e5906](https://github.com/Eyhenij/rt-tools/commit/45e5906343d3ccaac9b4d92f9f4311ab3d1d22d8))
- **rt:ui-kit-v2:** корзина, панель сброса, правки строк, начальный запрос и состояние выбора селектора ([dfff284](https://github.com/Eyhenij/rt-tools/commit/dfff2847d66eecb4e41cd8e69af44558d5c70940))
- **rt:ui-kit-v2:** область прокрутки — свойства отступов и фонов ([67495e9](https://github.com/Eyhenij/rt-tools/commit/67495e9e7866ded68bd37ab0ce164126ee500e6c))
- **rt:ui-kit-v2:** один разбор имени Material для значков кита ([a7d8284](https://github.com/Eyhenij/rt-tools/commit/a7d8284267472fd8e57d50c160f70e54ee9c81c3))
- **rt:ui-kit-v2:** панель действий — свойства цвета, отступов и шрифта, меню со скруглением и тенью ([6b89863](https://github.com/Eyhenij/rt-tools/commit/6b89863d5b77a4337947ede8116d090b54858e18))
- **rt:ui-kit-v2:** переключатель — подпись, прозрачность отключения, размеры на хосте ([cc65af0](https://github.com/Eyhenij/rt-tools/commit/cc65af06f96b9202d48d509abb4d58825f2b57d4))
- **rt:ui-kit-v2:** переписка сообщает о наборе текста и показывает, что печатает вторая сторона ([3c80876](https://github.com/Eyhenij/rt-tools/commit/3c808766d269c9209eccb67625e61349193d7988))
- **rt:ui-kit-v2:** подсказка слева и справа ([dc73ece](https://github.com/Eyhenij/rt-tools/commit/dc73ece9404e644bdcbac6420e5c3536f67523ab))
- **rt:ui-kit-v2:** размер и размытие кнопки скачивания, вид кнопки выбора, превью без зазора ([50b7cb6](https://github.com/Eyhenij/rt-tools/commit/50b7cb6aad19fecfd44da02411b7123f410ba91b))
- **rt:ui-kit-v2:** размер и фон кнопки-значка задаются с её тега, шаги xs и 2xs ([dfeb075](https://github.com/Eyhenij/rt-tools/commit/dfeb0758951db7381294362f7c3ca8e8f114a143))
- **rt:ui-kit-v2:** свой срок, полоса срока, значок, режим замены и цвета тоста ([a6aeb05](https://github.com/Eyhenij/rt-tools/commit/a6aeb05837a23edef6adabb18209bdf4f2c306fc))
- **rt:ui-kit-v2:** спиннер накрывает блок, встаёт на плашку и рисуется дугой ([ce8489a](https://github.com/Eyhenij/rt-tools/commit/ce8489a75b4cbef8863b20bd716a38511e73672e))
- **rt:ui-kit-v2:** тег — размеры на хосте, ручки цвета и отступов ([138cc6d](https://github.com/Eyhenij/rt-tools/commit/138cc6ddfe4d3a0fbe50da02b81dac92ff73de11))
- **rt:ui-kit-v2:** тулбар — свойства раскладки ([973b6eb](https://github.com/Eyhenij/rt-tools/commit/973b6eb9f221c5cbdc27d37a6d870de0039b1882))
- **rt:ui-kit-v2:** фокус, место перед заголовком, выравнивание подвала, тело и свойства диалога ([f3fec3c](https://github.com/Eyhenij/rt-tools/commit/f3fec3c39965b2ce4dae1d36aa771e870f9fa628))

# [0.16.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.15.0...rt-ui-kit-v2@0.16.0) (2026-10-02)

### Bug Fixes

- **rt:ui-kit-v2:** боковая панель в витрине на узкой ширине стоит в своей ячейке ([a71e450](https://github.com/Eyhenij/rt-tools/commit/a71e4507361c21c49c036c64d86bf152566ae2bc))
- **rt:ui-kit-v2:** витрина бокового меню влезает в половину темы и рисует значки Material ([1b1787b](https://github.com/Eyhenij/rt-tools/commit/1b1787bf5c08e45c35632f0fd86d2a9d8175c10d))
- **rt:ui-kit-v2:** динамический селектор — фон строки в руке, круглые кнопки, попап у «Добавить» ([8bce9ba](https://github.com/Eyhenij/rt-tools/commit/8bce9ba9d7bf3e303a72ea488d70d09643ae51c9))
- **rt:ui-kit-v2:** история загрузчика устроена как в первом ките ([43a51b5](https://github.com/Eyhenij/rt-tools/commit/43a51b5e433bb8368d0455ca4e18c18f1f36af4d))
- **rt:ui-kit-v2:** карточка таблицы на узком экране открывает запись ([67022bc](https://github.com/Eyhenij/rt-tools/commit/67022bc21879c46ee2d75e3baa1e5c6572474af6))
- **rt:ui-kit-v2:** кнопка демо-картинки в песочнице обрезки названа понятно ([59d66ce](https://github.com/Eyhenij/rt-tools/commit/59d66ce8bbb7928c609c0f22940d09fa12c10c01))
- **rt:ui-kit-v2:** кнопка скачивания загрузчика лежит на картинке в правом верхнем углу ([7cd8d0e](https://github.com/Eyhenij/rt-tools/commit/7cd8d0e8fa48f210eeda2c3915d8149e7170c623))
- **rt:ui-kit-v2:** меню телефона как у первого кита — окно 360, столбец 240, те же отступы ([0cd6afe](https://github.com/Eyhenij/rt-tools/commit/0cd6afee36d6d6f6a25d100fd733dab2e5f87622))
- **rt:ui-kit-v2:** номера сценариев эпика разведены с main, кнопка скачивания на входе radius ([89003e6](https://github.com/Eyhenij/rt-tools/commit/89003e6b851e19acba7e5bffe920af1dc1dbe6c2))
- **rt:ui-kit-v2:** обрезка берёт ширину коробки, обёртки витрины без своих стилей ([d6edaac](https://github.com/Eyhenij/rt-tools/commit/d6edaac4e095eac99379e1b80b96939a91c1ced4))
- **rt:ui-kit-v2:** обрезка в материальном наборе выглядит как в первом ките ([46e562d](https://github.com/Eyhenij/rt-tools/commit/46e562d2b8428a3ce8c791e8b94b128132344254))
- **rt:ui-kit-v2:** подпись кнопки демо-картинки в шаблоне песочницы ([cf803f8](https://github.com/Eyhenij/rt-tools/commit/cf803f8c075506434b5caf9c1ddb2d4471638fcf))
- **rt:ui-kit-v2:** подсказка всплывает от фокуса только с клавиатуры ([4385fed](https://github.com/Eyhenij/rt-tools/commit/4385fed9ef9b106ec4253aa15c50353f84f535e0))
- **rt:ui-kit-v2:** свойства ширины и глубины бокового меню объявлены в блоке, вход показа приводится ([a039110](https://github.com/Eyhenij/rt-tools/commit/a03911029dd7f543861ef5f36b9ecf9ce8b44af8))
- **rt:ui-kit-v2:** сторис бокового меню проходят проверку повторов и токенов ([4a71ba7](https://github.com/Eyhenij/rt-tools/commit/4a71ba7a1d03c7062ab97ea71f5d0935804d5a75))
- **rt:ui-kit-v2:** строка избранного в руке рисуется на фоне, а не прозрачной ([89dac55](https://github.com/Eyhenij/rt-tools/commit/89dac55f6f742d1b71fceef75be8d312e56b43fc))
- **rt:ui-kit-v2:** строку избранного снова можно тянуть за ручку ([b6ec496](https://github.com/Eyhenij/rt-tools/commit/b6ec496f1d1bfbcfb51f56dbc82a1e12d0396145))
- **rt:ui-kit-v2:** тень строки избранного в руке под своим именем, учёт показа панели ([af7bc23](https://github.com/Eyhenij/rt-tools/commit/af7bc232fefd131f58187b24754eb88b48aec645))
- **rt:ui-kit-v2:** шеврон и «+» бокового меню в одном столбце, кнопки строки круглые ([3852883](https://github.com/Eyhenij/rt-tools/commit/3852883e8dc222496b9133ecdf32eb06fb7ca295))

### Features

- **rt:ui-kit-v2:** блок ошибки запроса в боковой панели ([2e253ed](https://github.com/Eyhenij/rt-tools/commit/2e253eda39720f341d52df9c70a6accefa619589))
- **rt:ui-kit-v2:** витрина обрезки изображения — матрица, обзор, кадры ([6d5a87a](https://github.com/Eyhenij/rt-tools/commit/6d5a87ab8c747b6ecde3cac11ea867d99457f975))
- **rt:ui-kit-v2:** динамический селектор, всплывающий выбор, список выбранного и поле списка строк ([284a552](https://github.com/Eyhenij/rt-tools/commit/284a552d9e635ad7701881025aba9820519fefda))
- **rt:ui-kit-v2:** загрузчик изображения rt-image-upload на своей обрезке ([0ef44e6](https://github.com/Eyhenij/rt-tools/commit/0ef44e656220a108a0a6fc4d8fa65550a3b4f818))
- **rt:ui-kit-v2:** закрепление подменю бокового меню рисуется булавкой, как в первом ките ([c8f6e07](https://github.com/Eyhenij/rt-tools/commit/c8f6e074c0ed8a4868f450859a0fa83548f38289))
- **rt:ui-kit-v2:** значки бокового меню вне набора — пары Material и свой шаблон rtSideMenuIcon ([b79d575](https://github.com/Eyhenij/rt-tools/commit/b79d5755912f8a28f545cd3711e2fdf6ec504279))
- **rt:ui-kit-v2:** избранное бокового меню в обоих наборах, в матрице меню ([5f5fd99](https://github.com/Eyhenij/rt-tools/commit/5f5fd990f0dcaef41ac3ebd7292e2e375829dffd))
- **rt:ui-kit-v2:** избранное в боковом меню, как в первом ките, без Material ([38434d2](https://github.com/Eyhenij/rt-tools/commit/38434d22af26fb8c47d72b6f01a69c6ec86254da))
- **rt:ui-kit-v2:** кнопка скачивания загрузчика заходит за угол картинки и бывает круглой или квадратной ([37e49f5](https://github.com/Eyhenij/rt-tools/commit/37e49f5a1e53f3232572883c361c1a400aa5336b))
- **rt:ui-kit-v2:** компонент бокового меню rt-side-menu — полоса, подменю, поиск, закрепление, ширина ([2a34331](https://github.com/Eyhenij/rt-tools/commit/2a34331bef563e18ea55da8ac29ca2b8d643bfe2))
- **rt:ui-kit-v2:** компонент обрезки изображения и песочница на витрине ([a72ee69](https://github.com/Eyhenij/rt-tools/commit/a72ee69391609d61d49cbacffe72abc1c92bb793))
- **rt:ui-kit-v2:** логика бокового меню — поиск, подсветка, ширина, настройки ([281dd3f](https://github.com/Eyhenij/rt-tools/commit/281dd3ff51230394f4adaf043aaa4306e2e120bb))
- **rt:ui-kit-v2:** логика динамического селектора — поиск, «выбрать всё», сброс, очистка, перетаскивание, список строк ([f8d7b9f](https://github.com/Eyhenij/rt-tools/commit/f8d7b9fd100f094012ca15101b89361d11f3a26b))
- **rt:ui-kit-v2:** песочница обрезки — вариант с кнопкой и вариант с зоной загрузки ([2c7ce42](https://github.com/Eyhenij/rt-tools/commit/2c7ce42061874cbfa571a59c755a47459fe9f751))
- **rt:ui-kit-v2:** подсказка может показываться только у обрезанного текста ([ef6af24](https://github.com/Eyhenij/rt-tools/commit/ef6af240ed795ffe3701cd5c21cdec73ed0caec5))
- **rt:ui-kit-v2:** подсказка пустого поля обрезки, сценарий на витрине, язык подписей ([519adc7](https://github.com/Eyhenij/rt-tools/commit/519adc7843e032932a6d1ebb21480818b41061e4))
- **rt:ui-kit-v2:** пункт меню бывает ссылкой ([fa6d5c1](https://github.com/Eyhenij/rt-tools/commit/fa6d5c1984bf6fb6d3f62810e4fc3ad1095fbde0))
- **rt:ui-kit-v2:** пункт меню принимает свой значок ([b1b4bc8](https://github.com/Eyhenij/rt-tools/commit/b1b4bc87ac5e7668b39cee70de4fe2355f3d3e15))
- **rt:ui-kit-v2:** пункт меню рисует залитый значок по входу fill ([f2734b0](https://github.com/Eyhenij/rt-tools/commit/f2734b0f662ebc8e6f2ea2ed23c9e60a7c7bf6a7))
- **rt:ui-kit-v2:** раскрывающаяся панель rt-expansion-panel, папки и избранное бокового меню на ней ([6751a2e](https://github.com/Eyhenij/rt-tools/commit/6751a2e253ae42e92c675f0796010bec8f685e09))
- **rt:ui-kit-v2:** сервис настроек бокового меню — режим и ширина подменю в хранилище ([eaf9a94](https://github.com/Eyhenij/rt-tools/commit/eaf9a946c430743a835653c4c0e906154bfd5c68))
- **rt:ui-kit-v2:** сторис бокового меню на данных первого кита и с живым меню ([fcbf2dc](https://github.com/Eyhenij/rt-tools/commit/fcbf2dc248cc0ec6f3abd94a4972cad9f9055628))
- **rt:ui-kit-v2:** считающая часть обрезки изображения ([2a04d8c](https://github.com/Eyhenij/rt-tools/commit/2a04d8c83164d5d73d1af064c4b6a4a1ce6a8603))
- **rt:ui-kit-v2:** текст копии ошибки боковой панели ([6a137a9](https://github.com/Eyhenij/rt-tools/commit/6a137a95d0dc97a77bca3c5993ced56b1e1a0c43))
- **rt:ui-kit-v2:** цветовая схема data-rt-scheme, как в первом ките ([c6744d6](https://github.com/Eyhenij/rt-tools/commit/c6744d6e557cdc5a5ddfbc77e994b66b6f7790ed))
- **rt:ui-kit-v2:** шесть новых значков и десять пар Material — значки бокового меню из первого кита ([1b4be9b](https://github.com/Eyhenij/rt-tools/commit/1b4be9b39e59d9d0f67b5a2dac6e7bd4b498818b))

# [0.15.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.14.0...rt-ui-kit-v2@0.15.0) (2026-10-02)

### Bug Fixes

- **rt:ui-kit-v2:** половины пары тем на витрине переносятся по ширине содержимого ([3c1f0b5](https://github.com/Eyhenij/rt-tools/commit/3c1f0b5f0f44d2514b3281cc76ba186ddc3719a3))

### Features

- **rt:ui-kit-v2:** поле сообщения останавливает ответ, отдаёт черновик и ставит фокус ([61b78d3](https://github.com/Eyhenij/rt-tools/commit/61b78d36ff60f5b09abb4626bfcef00c353b985e))
