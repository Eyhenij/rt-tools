# [0.36.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.35.0...rt-agent-kit%400.36.0) (2026-11-09)

**Метрика выпуска:** нет. Починки проверок и выделка правила epic-flow

### Bug Fixes

- **rt:agent-kit:** заведение задачи после конца эпика пускает только согласие в меню ([0f3a758](https://github.com/Eyhenij/rt-tools/commit/0f3a75876d0f79b5f3e30d8e00d836df922fd1d6))
- **rt:agent-kit:** ответ владельца в меню пускает заведение задачи после конца эпика ([aa0661b](https://github.com/Eyhenij/rt-tools/commit/aa0661b5e88e03fc0fe3065bbe179d080fff2ed7))
- **rt:agent-kit:** проверка правил в рабочей копии и строка метрики выпуска ([0eb0846](https://github.com/Eyhenij/rt-tools/commit/0eb0846f7b1a96a41dadfd5caf0026c186f111e3))

# [0.35.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.34.0...rt-agent-kit%400.35.0) (2026-11-08)

**Метрика выпуска:** нет. Метрики только появились, базы ещё нет

### Bug Fixes

- **rt:agent-kit:** вторая проверка ролей по записи метрик ([78d9c92](https://github.com/Eyhenij/rt-tools/commit/78d9c92cb856c7d6d39b4025272450b5405d4c2a))
- **rt:agent-kit:** договорённость эпика не держит PR его задач ([f05fe69](https://github.com/Eyhenij/rt-tools/commit/f05fe69c78fe1f219255a106525eb93ad5cd1d24))
- **rt:agent-kit:** находки ролей по записи метрик ([335a33c](https://github.com/Eyhenij/rt-tools/commit/335a33cc217fbe14914b1e3e9bf601d9603733f9))
- **rt:agent-kit:** находки ролей по отправке чисел ([663c30f](https://github.com/Eyhenij/rt-tools/commit/663c30f5b5875a402adc449eb5a29a6d15f908ae))
- **rt:agent-kit:** отчёт называет прочитанные дни и удалённые файлы ([edc86bc](https://github.com/Eyhenij/rt-tools/commit/edc86bc277335b505672c5e40ea4d9dd56965d38))
- **rt:agent-kit:** поле метрики принимает только имена из отчётов ([13f6ff5](https://github.com/Eyhenij/rt-tools/commit/13f6ff512d2652769ca6d9baff5ef49dafe9aec9))
- **rt:agent-kit:** правила говорят то, что показал разбор эпика ([d784a43](https://github.com/Eyhenij/rt-tools/commit/d784a432c53105eb38ed5985f76de7681a34c9d0))
- **rt:agent-kit:** числа складываются по дням и не теряются на повторе ([f57c932](https://github.com/Eyhenij/rt-tools/commit/f57c9327546f13ce0435e60de8821df088c6dcdc))
- **rt:message-bus:** голова строки дня не несёт слов из дерева ([76ba46e](https://github.com/Eyhenij/rt-tools/commit/76ba46e5ddde92fd5f795df6af1636a67c95843f))

### Features

- **rt:agent-kit:** команда metrics считает качество пакета по наблюдениям дерева ([b1e4715](https://github.com/Eyhenij/rt-tools/commit/b1e471525d2585af02e2e2eec604b67a036b4785))
- **rt:agent-kit:** команда send шлёт строки дня ([5f04901](https://github.com/Eyhenij/rt-tools/commit/5f04901d8d54fb683a5160a28f3a90b46ee7f98b))
- **rt:agent-kit:** отчёт считает главную метрику ([1aa68ff](https://github.com/Eyhenij/rt-tools/commit/1aa68ff77e6a22e8e3357d1b8e4cd4eac15c8cc0))
- **rt:agent-kit:** отчёт считает запуски и потерянные минуты ([1a45235](https://github.com/Eyhenij/rt-tools/commit/1a452356219388d05bb4405449ff40e4b95233ae))
- **rt:agent-kit:** отчёт считает пустые отказы проверок ([4b5c6f9](https://github.com/Eyhenij/rt-tools/commit/4b5c6f9ebf489ba08973137f9b503594d41f627d))
- **rt:agent-kit:** отчёт считает роли, экзамены и правила ([8c58a31](https://github.com/Eyhenij/rt-tools/commit/8c58a31b1037c0ae0c48c5bd72c491842976e2cd))
- **rt:agent-kit:** передача на ревью и правки владельца ([c1b9f01](https://github.com/Eyhenij/rt-tools/commit/c1b9f01b64ac734c662e71549f60c475b0ef13e6))
- **rt:agent-kit:** правка называет метрику, а выпуск её требует ([b062187](https://github.com/Eyhenij/rt-tools/commit/b062187cf5452a3d87bf47ae48ff79f9ca5781c0))
- **rt:agent-kit:** три дня на правку после слияния и шире образцы правок ([6c21035](https://github.com/Eyhenij/rt-tools/commit/6c210359f133ce2905f763ff3679121c73b98e78))
- **rt:agent-kit:** числа уходят без команды человека ([68c5173](https://github.com/Eyhenij/rt-tools/commit/68c5173487fa959c44dea27ceb0b846e7c222445))
- **rt:message-bus:** приёмник хранит числа метрик по дням ([a799a5a](https://github.com/Eyhenij/rt-tools/commit/a799a5ac0fe94e0caa09d6c2ee356575a9b73082)), closes [#3155](https://github.com/Eyhenij/rt-tools/issues/3155)
- **rt:message-bus:** разбор несёт ресурс, смена шага записи остаётся в журнале ([92769eb](https://github.com/Eyhenij/rt-tools/commit/92769ebc95cf66664cd84808dfd0ba52a9acb207))

# [0.34.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.33.1...rt-agent-kit%400.34.0) (2026-11-06)

### Bug Fixes

- **rt:agent-kit:** feature требует разбор, настройки таблиц описаны в README ([c5f663a](https://github.com/Eyhenij/rt-tools/commit/c5f663aaf28d1edd8d0fb947c6817d32e9a9f432))
- **rt:agent-kit:** восстановление файлов без `--` не считается переключением ветки ([14bffea](https://github.com/Eyhenij/rt-tools/commit/14bffeadcb3ee3e7e473495cc5b713f9eb8ab0ed)), closes [#3083](https://github.com/Eyhenij/rt-tools/issues/3083)
- **rt:agent-kit:** диспетчер сводит ответы нескольких сторожей в один JSON ([71909f6](https://github.com/Eyhenij/rt-tools/commit/71909f6ea4f74c8bede999001ee5af934d562d6a))
- **rt:agent-kit:** заведение ветки принимает подпись человека из RT_HUMAN_EMAILS ([37dd587](https://github.com/Eyhenij/rt-tools/commit/37dd587953376df9ded51c111ec545d36047af53))
- **rt:agent-kit:** заголовок раздела критика без таблицы не открывает заявку ([e6355c1](https://github.com/Eyhenij/rt-tools/commit/e6355c156162015ea4b4db5be6feed5cc3c3f1e4))
- **rt:agent-kit:** конвейеры без критика падают, замечания читаются во всех местах ([8717482](https://github.com/Eyhenij/rt-tools/commit/87174821faf0edd11f7385323abb5066db2c143f))
- **rt:agent-kit:** набор перед пушем называет отсутствующий файл сценариев сторожей ([5bf5a14](https://github.com/Eyhenij/rt-tools/commit/5bf5a1422719b258794c7dbbf45b10ac62899932))
- **rt:agent-kit:** навык ревью интерфейса — заголовки владельца дословно, условная ссылка на карточки ([5dfb798](https://github.com/Eyhenij/rt-tools/commit/5dfb79818bfb44ac7d810c9567faed823809ab3b))
- **rt:agent-kit:** навык ревью интерфейса — текст владельца целиком, описания в пределе, спека ролей ([1584da6](https://github.com/Eyhenij/rt-tools/commit/1584da68e41ada1dd005c4c39eac016d9fa6c27a))
- **rt:agent-kit:** остальные места сторожей хода узнают glab, статьи в своих поддоменах ([c52aece](https://github.com/Eyhenij/rt-tools/commit/c52aeced39b0d30f0f6ac124fe494d8fca308f70))
- **rt:agent-kit:** открытие PR отбивается, пока договорённость из плана лежит невлитой ([8aef62a](https://github.com/Eyhenij/rt-tools/commit/8aef62a02c7db5cc13529d77eb0e44c8c096c762))
- **rt:agent-kit:** переключение ветки судится по точке старта новой ветки ([f7497ac](https://github.com/Eyhenij/rt-tools/commit/f7497ace6e70443969fb538a08372e24aa8fec91)), closes [#3083](https://github.com/Eyhenij/rt-tools/issues/3083)
- **rt:agent-kit:** правки правил по ревью — условие у проверки описаний, фраза о пределе короче ([9ab0e21](https://github.com/Eyhenij/rt-tools/commit/9ab0e21c2d152aeea5dab86b3d3e06040e2c430d))
- **rt:agent-kit:** проверка отправки и git-хук идут одним циклом с отметками main ([62f5c38](https://github.com/Eyhenij/rt-tools/commit/62f5c38f40ed927b9e5ca2e9e1cd40b513abbfa3))
- **rt:agent-kit:** проверка перед push разбирает команду как оболочка, а не шаблонами ([e6a94f2](https://github.com/Eyhenij/rt-tools/commit/e6a94f2e62869d03847ce211f9633de0a7884e58)), closes [#3083](https://github.com/Eyhenij/rt-tools/issues/3083)
- **rt:agent-kit:** проверка перед push узнаёт push по подкоманде git и стоит на вкладке терминала ([40e7445](https://github.com/Eyhenij/rt-tools/commit/40e744539af005615833f16cc4027b78cf764bf5))
- **rt:agent-kit:** проверка сценариев узнаёт длинные префиксы и называет сценарии строками таблицы ([9e03deb](https://github.com/Eyhenij/rt-tools/commit/9e03deb6b860e450814cc123e3fdee21b27cbb35))
- **rt:agent-kit:** пропуск паттерна в варианте хостинга засчитывается проверкой описаний ([a60ca70](https://github.com/Eyhenij/rt-tools/commit/a60ca70b1a1d1ea6d82f3bf21029f897d0075814))
- **rt:agent-kit:** пустой ход по уведомлению своей фоновой задачи отпускается, пока идёт вторая ([1e3488f](https://github.com/Eyhenij/rt-tools/commit/1e3488f96be8a3b260c25d75517c759819f0e2bd))
- **rt:agent-kit:** разбор push читает обёртки, функции, heredoc и переключение ветки как оболочка ([eb0cfb8](https://github.com/Eyhenij/rt-tools/commit/eb0cfb806a83a07737f08492b4aa5a244ddbeb16)), closes [#3083](https://github.com/Eyhenij/rt-tools/issues/3083)
- **rt:agent-kit:** сторож главной ветки берёт её имя из профиля дерева ([e728a9d](https://github.com/Eyhenij/rt-tools/commit/e728a9d0e8c64c79453f12502d19f58c9ad3aed7))
- **rt:agent-kit:** сторож посторонних драйверов браузера ловит драйверы из плагинов ([5d444a3](https://github.com/Eyhenij/rt-tools/commit/5d444a320e25dc6e787c444f114f3fc064274b18))
- **rt:agent-kit:** сторожа хода узнают команды glab ([bfa2319](https://github.com/Eyhenij/rt-tools/commit/bfa231989d62c5687b1aa93af43143e4f75de5dc))
- **rt:agent-kit:** стрелка в кавычках не считается записью в файл ([4898421](https://github.com/Eyhenij/rt-tools/commit/489842121882d1231c7fb42ecbe66fc18a69b925))
- **rt:agent-kit:** хук pre-push и проверка сессии гоняют набор одним кодом ([7be37a3](https://github.com/Eyhenij/rt-tools/commit/7be37a3d3a25ff5eff306d5c65a8320a2fdd322c)), closes [#3101](https://github.com/Eyhenij/rt-tools/issues/3101)
- **rt:agent-kit:** хук pre-push узнаёт удаление по нулям во всей строке, сценарий раскладки не зависит от времени исходников ([02b4e36](https://github.com/Eyhenij/rt-tools/commit/02b4e36452106204a61c44519e0f642d53e48310))
- **rt:agent-kit:** черновик PR отказывает на базе, где конвейер не запускается ([38d0638](https://github.com/Eyhenij/rt-tools/commit/38d063848f929cf16830cc56e6f34d1a0a713b06))

### Features

- **rt:agent-kit:** git-хук pre-push гонит набор проверок на любом push ([b4c801b](https://github.com/Eyhenij/rt-tools/commit/b4c801b4488eb892ab24acfa69fc7c1cb67b0022))
- **rt:agent-kit:** критик goal-critic сравнивает результат со словами владельца ([0a997ef](https://github.com/Eyhenij/rt-tools/commit/0a997ef3dfdefdc0befa040ebf7676a1adbfc83f))
- **rt:agent-kit:** набор перед push — от родительской ветки, по отметкам и заранее ([2089459](https://github.com/Eyhenij/rt-tools/commit/20894593b211769e5bda5c421c28f02ed16ffc88))
- **rt:agent-kit:** навык ревью интерфейса одной системой ([0c931ba](https://github.com/Eyhenij/rt-tools/commit/0c931bad307c3cbf43284c0aaa44de7d4a54995c))
- **rt:agent-kit:** проверка поставки требует таблицу точек в теле PR ([dae95e1](https://github.com/Eyhenij/rt-tools/commit/dae95e1cd8246621b0781f8084a23ddba2149624))
- **rt:agent-kit:** роль product-strategist сверяет работу с точкой и вехой ([12b3bf1](https://github.com/Eyhenij/rt-tools/commit/12b3bf162526c167bce642ed76a3f00f8375d5a6))

## [0.33.1](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.33.0...rt-agent-kit%400.33.1) (2026-10-22)

# [0.33.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.32.0...rt-agent-kit%400.33.0) (2026-10-22)

### Bug Fixes

- **rt:agent-kit:** две новые части проверок исполняемы, как соседние ([a9e7de0](https://github.com/Eyhenij/rt-tools/commit/a9e7de07311088e3bcad86a34ddc9c5b3afb24c1))

### Features

- **rt:agent-kit:** отказ назначений называет слово владельца переносом ([5cd454d](https://github.com/Eyhenij/rt-tools/commit/5cd454d8af1492f873e126a2ef689c4fe29cebbf))
- **rt:agent-kit:** отправка в ветку влитой заявки отбита ([fc346a1](https://github.com/Eyhenij/rt-tools/commit/fc346a1c14105a8f6072ba48d973572e51e172e7))
- **rt:agent-kit:** после отбитого меню список вариантов прозой тоже вопрос ([0fcd5f7](https://github.com/Eyhenij/rt-tools/commit/0fcd5f7dd0b284c9e91dcc23b379eb68de1d96db))

# [0.32.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.31.0...rt-agent-kit%400.32.0) (2026-10-16)

### Bug Fixes

- **rt:agent-kit:** отказ ветки при коде 2 дублируется в поток ошибок ([e8bee04](https://github.com/Eyhenij/rt-tools/commit/e8bee04a16c6970e3e3c48c9fddcf2e60cd4a94c))

### Features

- **rt:agent-kit:** влитый эпик не требуется основанием, отказы и проверки называют причину ([2a2c1db](https://github.com/Eyhenij/rt-tools/commit/2a2c1db08ebc2c3385c4f878c8e2488f42e6b8e4))
- **rt:agent-kit:** особенность «макеты» несёт закон, правило и образец про рисунки экранов ([df6dfd4](https://github.com/Eyhenij/rt-tools/commit/df6dfd429df8c2f8de0a0885f9246eec72b59240))
- **rt:agent-kit:** повторная постановка правил называет загруженные, чтение кодом не запись ([45e44b9](https://github.com/Eyhenij/rt-tools/commit/45e44b962e5046840d5c40bae19e1449ea85ecb1))

# [0.31.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.30.1...rt-agent-kit@0.31.0) (2026-10-10)

### Features

- **rt:agent-kit:** заявка не вливается при красном прогоне на вершине ([1ae70e3](https://github.com/Eyhenij/rt-tools/commit/1ae70e38421dc5c4b378fb95be55df996cec2c8e))
- **rt:agent-kit:** заявка не открывается без строки закрытия задачи ([5955a8b](https://github.com/Eyhenij/rt-tools/commit/5955a8b7c60c630751ac65a2f50e211e62fcf0fa))

## [0.30.1](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.30.0...rt-agent-kit@0.30.1) (2026-10-10)

### Bug Fixes

- **rt:agent-kit:** заведение задачи читает карточку прямым запросом и печатает «NO» только после окна ожидания ([705602a](https://github.com/Eyhenij/rt-tools/commit/705602ab55a070e8194a3b432040187ad29c3c1a))
- **rt:agent-kit:** наблюдения уходят по одному дню на запрос, отказ дня не держит остальной груз ([c1a7c8a](https://github.com/Eyhenij/rt-tools/commit/c1a7c8a9ae280e26b4ab3867168ec0b42e4b1bea))
- **rt:agent-kit:** пометка «отбито» с той же причиной в блок второй раз не пишется ([42a716b](https://github.com/Eyhenij/rt-tools/commit/42a716b62f9b1d7ca42025f47f5ee65025a4a54f))
- **rt:agent-kit:** последняя успешная выкатка ищется среди двадцати последних прогонов без фильтра по статусу ([8f25f98](https://github.com/Eyhenij/rt-tools/commit/8f25f98d222b9565c687bc0e9f66fda95c3b015f))
- **rt:agent-kit:** проверки конца эпика и разбора узнают ответ меню в обоих видах ([e69aea1](https://github.com/Eyhenij/rt-tools/commit/e69aea18b52bcffa338b3e67b619477210c994d4))
- **rt:agent-kit:** путь внутри записываемой строки не считается целью записи, отказ спрашивающей проверки называет область ([7301760](https://github.com/Eyhenij/rt-tools/commit/7301760fb5608da09b61578865ca03bac4a3b423))

# [0.30.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.29.4...rt-agent-kit@0.30.0) (2026-10-09)

### Bug Fixes

- **rt:agent-kit:** аудит называет повтор номера в таблице эпика, отчёт начинается с красного прогона ([e80d352](https://github.com/Eyhenij/rt-tools/commit/e80d352c230fe7b79aea99d4d6fd259e0874f2ac))
- **rt:agent-kit:** база PR из стопки того же эпика законна ([69ec2a8](https://github.com/Eyhenij/rt-tools/commit/69ec2a8ff254239bbe3a91b6b05fe0de884d5594))
- **rt:agent-kit:** вопрос после отказа уходит со строкой о сделанном ([9c96fd1](https://github.com/Eyhenij/rt-tools/commit/9c96fd1b62e9708676bced9dcf59500da21532cd))
- **rt:agent-kit:** вопрос с вариантом обхода проверки не уходит ([d58457b](https://github.com/Eyhenij/rt-tools/commit/d58457ba7225b1efebf0bd82247302ef009e8a0c))
- **rt:agent-kit:** запись диспетчера несёт предел времени, объявленный гардом ([0944731](https://github.com/Eyhenij/rt-tools/commit/0944731c1b3bbabd7fbd6372993a93901ff2fee3))
- **rt:agent-kit:** короткая команда владельца не отбивает новый вопрос ([72795a9](https://github.com/Eyhenij/rt-tools/commit/72795a97eaa3f8058b147dec81a3755f658953e9))
- **rt:agent-kit:** отказ проверки вопросов называет нужные правила ([8624394](https://github.com/Eyhenij/rt-tools/commit/86243944581e71ada6eb9fdf1019701fd78e3981))
- **rt:agent-kit:** охранник поставки снова короче предела в 500 строк ([679721d](https://github.com/Eyhenij/rt-tools/commit/679721d0e62ee8534a363179e56eeda6d64f1eb9)), closes [#2605](https://github.com/Eyhenij/rt-tools/issues/2605)
- **rt:agent-kit:** охранник поставки узнаёт чужое дерево по пути с тильдой и судит заголовок его формой ([3b33233](https://github.com/Eyhenij/rt-tools/commit/3b33233d6597872e7bbc9564c936f340ee752d77))
- **rt:agent-kit:** проверка вопросов не считает правками файлы вне дерева ([1531839](https://github.com/Eyhenij/rt-tools/commit/1531839623ed5c3677fa5ef306dd8a485b9182f3))
- **rt:agent-kit:** проверка конца хода принимает слово владельца и названную причину ([bef2f2b](https://github.com/Eyhenij/rt-tools/commit/bef2f2b43876aa77bc9892a74580202b4a527825))
- **rt:agent-kit:** проверка конца эпика принимает слово владельца с номером работы ([66251cd](https://github.com/Eyhenij/rt-tools/commit/66251cde4f640ba862aee89da658715bbd31633c))
- **rt:agent-kit:** проверка перед отправкой отбивает несколько отправок одной командой ([328efe3](https://github.com/Eyhenij/rt-tools/commit/328efe3d7061fc7fc206e69487b84276fd8215d1))
- **rt:agent-kit:** проверка привязок видит файлы, которые баррель подключает через .js ([b69b9f7](https://github.com/Eyhenij/rt-tools/commit/b69b9f7fecdda1a232bb769bcd0aeca500716f80))
- **rt:agent-kit:** проверка утверждений: граница слова, отрицание, описание ([1bb506e](https://github.com/Eyhenij/rt-tools/commit/1bb506efd2e1c603bdeda1aed99d6c67f836f4af))
- **rt:agent-kit:** сверка импортов читает входы пакета, переотданные по имени пакета ([ad27bc9](https://github.com/Eyhenij/rt-tools/commit/ad27bc9e306c76718def54167555bea686af9eca))
- **rt:agent-kit:** файл пятого признака проверки вопросов исполняемый ([2be40a8](https://github.com/Eyhenij/rt-tools/commit/2be40a8a31094f00e33a8ecf992b856898f7fec9))
- **rt:agent-kit:** флаг правки на месте узнаётся словом, модули аудита очереди — в карте правил ([b3f6dce](https://github.com/Eyhenij/rt-tools/commit/b3f6dce8537fe93d78efb3105a6f421c43c9404b))

### Features

- **rt:agent-kit:** раскладка отказывает на одноимённых ресурсах одного рода ([971fa14](https://github.com/Eyhenij/rt-tools/commit/971fa1401b430863b6fa00bcfc7de1032840b234))
- **rt:agent-kit:** сверка очереди работ называет папку задачи вне индекса ([8ecb2bd](https://github.com/Eyhenij/rt-tools/commit/8ecb2bd8c8c5e10959f744e860f383c901dbc013))
- **rt:message-bus:** команды груза входят токеном служебного клиента ([c5d1cb1](https://github.com/Eyhenij/rt-tools/commit/c5d1cb146a34b78eabe74e4509a6023c842ab964))

## [0.29.4](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.29.3...rt-agent-kit@0.29.4) (2026-10-02)

### Bug Fixes

- **rt:agent-kit:** проверка папки задачи судит ветку названного PR ([5b156d0](https://github.com/Eyhenij/rt-tools/commit/5b156d004a507f5c60c1d3d03819f6844e33d9d2))
- **rt:agent-kit:** сторож хода работы пропускает разрешение конфликта слияния ([88b77ba](https://github.com/Eyhenij/rt-tools/commit/88b77baf073ed32d38e5e09318723fbc076cd8b6))

## [0.29.3](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.29.2...rt-agent-kit@0.29.3) (2026-10-01)

### Bug Fixes

- **rt:agent-kit:** проверка покрытия судит папки пакета, а не переносимый текст ([142c8fe](https://github.com/Eyhenij/rt-tools/commit/142c8fe01d772c03517507044d5360cc6bc1d043))

## [0.29.2](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.29.1...rt-agent-kit@0.29.2) (2026-10-01)

### Bug Fixes

- **rt:agent-kit:** проверки отправки и поставки отличают чужой репозиторий от второй копии ([936edec](https://github.com/Eyhenij/rt-tools/commit/936edecc1fa855ad6fc5f3bb417cb624093d74c3))

### Features

- **rt:agent-kit:** проверка запрещает коммит и отправку в обход хуков гита ([d6f5311](https://github.com/Eyhenij/rt-tools/commit/d6f531102b9acb156128b1ce379a76e2b297282f))

## [0.29.1](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.29.0...rt-agent-kit@0.29.1) (2026-10-01)

### Bug Fixes

- **rt:agent-kit:** аудит очереди больше не требует папку задачи от веток эпиков ([785039a](https://github.com/Eyhenij/rt-tools/commit/785039a0c1eb80f592aa79a59321f40a69e67752))
- **rt:agent-kit:** гард разбора не принимает загруженное правило за реплику владельца ([f63a690](https://github.com/Eyhenij/rt-tools/commit/f63a6904356115636af455ab7ce5cf600c267e07))
- **rt:agent-kit:** заголовок PR читается по длинному ключу ([60cc137](https://github.com/Eyhenij/rt-tools/commit/60cc13714f0387e23b6f71fab56f61bfee683611))
- **rt:agent-kit:** запуск проверок от открытия PR тоже требует ожидания конца ([6b1927d](https://github.com/Eyhenij/rt-tools/commit/6b1927d2b6739cf28756cf81e6eedc89a39eb46e))
- **rt:agent-kit:** имя своего правила дерева не уезжает в приём, и отправка доходит до конца ([6d01588](https://github.com/Eyhenij/rt-tools/commit/6d0158825bfce5dbc0e17dd6f6e929a6d00ab9fc))
- **rt:agent-kit:** источник таблицы эпика больше не несёт шапку установки ([6b5224e](https://github.com/Eyhenij/rt-tools/commit/6b5224e956cc27d1e7d92e0ea24d873ad8e737d8))
- **rt:agent-kit:** план живого эпика читается из его ветки, а не с диска ([eb83f81](https://github.com/Eyhenij/rt-tools/commit/eb83f816c2a481a074a586ac9de5ac48ca3aeaf6)), closes [#2195](https://github.com/Eyhenij/rt-tools/issues/2195) [#2177](https://github.com/Eyhenij/rt-tools/issues/2177)
- **rt:agent-kit:** план эпика берётся из его ветки, а с диска — только если диск не старее ([abb5722](https://github.com/Eyhenij/rt-tools/commit/abb5722b9b517e0859a93ac3ad6edef5c80fe3ea)), closes [#2219](https://github.com/Eyhenij/rt-tools/issues/2219) [#1870](https://github.com/Eyhenij/rt-tools/issues/1870) [#2256](https://github.com/Eyhenij/rt-tools/issues/2256) [#2257](https://github.com/Eyhenij/rt-tools/issues/2257) [#2269](https://github.com/Eyhenij/rt-tools/issues/2269)
- **rt:agent-kit:** проверка выхода из хода не отпускает ход, где ход работы переписан и названный шаг не начат ([3591b96](https://github.com/Eyhenij/rt-tools/commit/3591b9634cfda0a2354b6430d9594aa0e4ae744a))
- **rt:agent-kit:** проверка ожидания не отпускает ход, запустивший CI без команды ожидания его конца ([3d5cefd](https://github.com/Eyhenij/rt-tools/commit/3d5cefd6fc61c79a60beedd70abefe9bde7ef488))
- **rt:agent-kit:** проверка расположения либ обходит список семей бэкенда и называет их в ответе ([5faecf0](https://github.com/Eyhenij/rt-tools/commit/5faecf0bb560baf1ba821981941bd0a051515072))
- **rt:agent-kit:** свежесть главной спрашивается и у основания ветки ([dbe80fb](https://github.com/Eyhenij/rt-tools/commit/dbe80fbd5076cd5f667896fec8c67aa319b270ed))
- **rt:agent-kit:** слияние сведено по длине текстов и по счёту задач эпика ([541f7f2](https://github.com/Eyhenij/rt-tools/commit/541f7f26ceda554cca869a45f1ba2a8f905ff711))
- **rt:agent-kit:** состав эпика считает задачи по столбцу задач, а не по всей строке ([3f3de7b](https://github.com/Eyhenij/rt-tools/commit/3f3de7b493424d7df710b58b149ecf4f5b851663)), closes [#2195](https://github.com/Eyhenij/rt-tools/issues/2195) [#2177](https://github.com/Eyhenij/rt-tools/issues/2177) [#2181](https://github.com/Eyhenij/rt-tools/issues/2181)
- команда отметки груза берёт признак дерева из модуля tree-mark и отказывает до сети на пустом признаке ([4eb925f](https://github.com/Eyhenij/rt-tools/commit/4eb925f8755b2ea81a4bd7a13a300290e49af3fd))

### Features

- **rt:agent-kit:** незакрытый эпик запрещает остановку хода ([64d9e85](https://github.com/Eyhenij/rt-tools/commit/64d9e858beea06b94c9aba660d7f229c41092332))
- **rt:agent-kit:** несделанный шаг замысла запрещает остановку хода ([00b6eb6](https://github.com/Eyhenij/rt-tools/commit/00b6eb6d53033a4a972b76875a1f139ae8fed0be))
- **rt:agent-kit:** отказ перед отправкой называет все красные проверки ([5a60df4](https://github.com/Eyhenij/rt-tools/commit/5a60df445105b55baa48306aea55aeb9179d8fe3))
- **rt:agent-kit:** проверка разговора отбивает третье меню после двух рекомендованных ответов, проверка конца хода не отпускает ход на запуске в фоне ([4d96fa8](https://github.com/Eyhenij/rt-tools/commit/4d96fa81c9a1817cda49dd01ceaaea97a9868aa7))
- **rt:agent-kit:** проверки перестали судить старый текст и чужие каталоги ([5173efb](https://github.com/Eyhenij/rt-tools/commit/5173efb7c8b9c83165d47f143cf352bed9315fb3))
- **rt:agent-kit:** ресурс без спеки не уезжает в пакет молча ([2ed5303](https://github.com/Eyhenij/rt-tools/commit/2ed53030513b7741df94eafd057d8f9ddbe99233))
- **rt:agent-kit:** шаги работы записаны перечнем и сверяются с замыслом ([dacb514](https://github.com/Eyhenij/rt-tools/commit/dacb514bf40764d9c873728f968935f56bae29ba))

# [0.29.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.28.0...rt-agent-kit@0.29.0) (2026-09-18)

### Bug Fixes

- **rt:agent-kit:** ветка эпика, названная планом, не читается проверкой выхода как задача без папки ([a8f36f8](https://github.com/Eyhenij/rt-tools/commit/a8f36f893d78c4ae44250a2cf0672021936edf66))
- **rt:agent-kit:** запускатель перед вызовом больше не прячет вызов от проверок ([3775d9f](https://github.com/Eyhenij/rt-tools/commit/3775d9f97bf091c5c405249fe0c6ebb71a915eb4))
- **rt:agent-kit:** конец эпика, прочитанный по таблице, отпускает ход целиком внутри отказа ([04dbd31](https://github.com/Eyhenij/rt-tools/commit/04dbd3171bc582a96d4ea6723000fac0e6289794))
- **rt:agent-kit:** отказ проверки на закрытие разговора не считается выходом из хода ([de3b8e0](https://github.com/Eyhenij/rt-tools/commit/de3b8e0e20c1657dd54ebfd290466da46aafc8ed))
- **rt:agent-kit:** правило о ходе и проверка выхода уложены в предел с учётом заголовка установки ([a1841a1](https://github.com/Eyhenij/rt-tools/commit/a1841a151aafc4a5e9f6e653049139d7d14a9c16))
- **rt:agent-kit:** разбор записи хода не читает служебные сообщения словом владельца и судит отказ по последнему результату ([c9862cb](https://github.com/Eyhenij/rt-tools/commit/c9862cb3919a0f2b1b9dd2b2a794055d504883d9))

### Features

- **rt:agent-kit:** аудит очереди одной строкой называет оба следствия базы вне главной ветки ([aee7d13](https://github.com/Eyhenij/rt-tools/commit/aee7d13149757d17e0bdb442c0795a2034b444d3))
- **rt:agent-kit:** назначенный эпик рабочей копии читается из одного файла ([4303e1a](https://github.com/Eyhenij/rt-tools/commit/4303e1affcd5415864e50ce08da859b5ab9961df))
- **rt:agent-kit:** последний запуск CI главной ветки читается на старте сессии одной строкой ([36855f1](https://github.com/Eyhenij/rt-tools/commit/36855f1629c297b856b183a24a060ee9ef27dde2))
- **rt:agent-kit:** проверка выхода из хода судит второй проход и ход с работой при открытом эпике ([385e155](https://github.com/Eyhenij/rt-tools/commit/385e155c15208159d72d3d8e3e16394f3e083285))
- **rt:agent-kit:** проверка пакета отклоняет вызов инструмента завершения разговора ([43e1bba](https://github.com/Eyhenij/rt-tools/commit/43e1bba293a9a12fdd44275a31d2aeb9190351f8))
- **rt:agent-kit:** проверка поставки запрещает ветку чужого эпика ([e5f9e26](https://github.com/Eyhenij/rt-tools/commit/e5f9e2626f290f798257630a549b9445c8e14a1e))
- **rt:agent-kit:** работу не берут мимо ветки без назначенного эпика ([9d2046c](https://github.com/Eyhenij/rt-tools/commit/9d2046cc3103034ca441df1fb872dc729545996c))
- **rt:agent-kit:** сверка доски говорит об открытой задаче в закрывающей колонке ([a63fb23](https://github.com/Eyhenij/rt-tools/commit/a63fb2396fc33512f6e61030e7017393f1a8ad52))
- **rt:agent-kit:** сверка очереди читает последний прогон главной ветки — красный и вытесненный названы строками ([14efffd](https://github.com/Eyhenij/rt-tools/commit/14efffd8d7ceb71b83eb720afb9073172104ac26))
- **rt:agent-kit:** слово владельца в кавычках в строке ожидания читает проверка выхода из хода ([3f839fc](https://github.com/Eyhenij/rt-tools/commit/3f839fc7e011ef11d6b570fcf51ea3e309ff6b5b))
- **rt:agent-kit:** строки наблюдений уезжают в приём четвёртым родом груза ([05689b9](https://github.com/Eyhenij/rt-tools/commit/05689b9f0436de79e23a71363680ea69e2ab2c2c))
- **rt:message-bus:** приём строк наблюдений — операция `POST /api/intake/observations` ([2efccba](https://github.com/Eyhenij/rt-tools/commit/2efccba01823e6eac5d7ea9a7f50545cde751bb5))
