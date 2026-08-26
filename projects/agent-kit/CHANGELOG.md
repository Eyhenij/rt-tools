# [0.16.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.15.0...rt-agent-kit@0.16.0) (2026-08-26)

### Features

- **rt:agent-kit:** срок хранения описания прошлого везёт пакет, а число называет дерево ([0efaed8](https://github.com/Eyhenij/rt-tools/commit/0efaed81358fbb132d31577ffb866b35bd1ec748))

# [0.15.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.14.0...rt-agent-kit@0.15.0) (2026-08-26)

### Bug Fixes

- **rt:agent-kit:** гард снятия черновика судит все свои заявки, а не одну текущую ([664ac81](https://github.com/Eyhenij/rt-tools/commit/664ac81a7055f759fec218472fff63af8b6adbe8))
- **rt:agent-kit:** записанный замысел перестал проходить стража насквозь ([030f8e3](https://github.com/Eyhenij/rt-tools/commit/030f8e3141a98115a35abcc9d57275972357429c))
- **rt:agent-kit:** не выпускать ход, кончившийся ожиданием чужого шага ([a0a564c](https://github.com/Eyhenij/rt-tools/commit/a0a564c7f474e894b79be1f7273522fdfce331a7))
- **rt:agent-kit:** описание правила об ответе о состоянии влезло в предел ([883ac1b](https://github.com/Eyhenij/rt-tools/commit/883ac1b25a38eca7dfec17d9f8d09fafea88cf83))
- **rt:agent-kit:** отделить признак разведки от признака работы у стража выходов хода ([0f8e93d](https://github.com/Eyhenij/rt-tools/commit/0f8e93d3ba5aab3c8f179581ed9bdce2e6fae84c))
- **rt:agent-kit:** паттерн ответа о состоянии назвал, когда его брать ([03f53da](https://github.com/Eyhenij/rt-tools/commit/03f53da6b1fe4e8ba87fdb9272374e739455f917))
- **rt:agent-kit:** перенумеровать сценарии предела описаний ([41095fa](https://github.com/Eyhenij/rt-tools/commit/41095fa605c16d74158d8f18f7c11c3487b231a2))
- **rt:agent-kit:** признак интерпретатора читается у заголовка heredoc ([74345f7](https://github.com/Eyhenij/rt-tools/commit/74345f7b3c775437736191105e413cb144585219))
- **rt:agent-kit:** признак повтора таблиц меряется долей совпавших пар ([5e3f6af](https://github.com/Eyhenij/rt-tools/commit/5e3f6af30528b1dee7152f9750f848305701698f))
- **rt:agent-kit:** проверки дерева перестали поднимать весь набор гейта ([72c83fe](https://github.com/Eyhenij/rt-tools/commit/72c83fe18433927e66d33ecf357729bdfd17297a))
- **rt:agent-kit:** пропавший прогон у конфликтующей заявки назван своей причиной ([05713fd](https://github.com/Eyhenij/rt-tools/commit/05713fd89cb5073df178e2a8fc8cc732301d104c))
- **rt:agent-kit:** сторона плоских корней перечислена разбору списка ([4c94fb9](https://github.com/Eyhenij/rt-tools/commit/4c94fb9e200bfa7b298825fc0495a46057c813a4))
- **rt:agent-kit:** страж выходов хода ловит взятую, но не начатую работу ([66bf768](https://github.com/Eyhenij/rt-tools/commit/66bf768588885ad451a9e9d49e76d8e03cff0c8b))
- **rt:agent-kit:** судить последнее действие хода, а не объём работы в нём ([a3d409a](https://github.com/Eyhenij/rt-tools/commit/a3d409a476dfc26f3075137d3be599fd3db1fe52))
- **rt:agent-kit:** холодная часть правила хода получила разделы своего рода ([8e27c3a](https://github.com/Eyhenij/rt-tools/commit/8e27c3a63d381229aa22c07152be0a42b7d8fe60))
- **rt:agent-kit:** якорь принимает приватное имя так, как оно объявлено в коде ([0dbef37](https://github.com/Eyhenij/rt-tools/commit/0dbef373ec0d8e016336057ad1f404698b11b311))

### Features

- **rt:agent-kit:** гард требует папку задачи в истории ветки ([98d1184](https://github.com/Eyhenij/rt-tools/commit/98d1184e9fe5eefe30c06f828f8ed458dbf79764))
- **rt:agent-kit:** задачи эпика заводятся все разом, тем же ходом, что и сам эпик ([2dffdce](https://github.com/Eyhenij/rt-tools/commit/2dffdceb513698aaeb9faffdb8ec545da0d6410e))
- **rt:agent-kit:** закрепить сжатый слой пределом веса в знаках ([1905cab](https://github.com/Eyhenij/rt-tools/commit/1905cab8d9d84f43113c63ace42d38f210e9afef))
- **rt:agent-kit:** описания правил обрезаны до трёхсот знаков, и предел считает проверка ([e46aeeb](https://github.com/Eyhenij/rt-tools/commit/e46aeeb235dba90472de22d6e83885e256650591))
- **rt:agent-kit:** ответ о состоянии работы стал правилом с таблицей и абзацем об эпике ([382418b](https://github.com/Eyhenij/rt-tools/commit/382418bb4d02bd1ab4bb37024243023d2ef45cb1))
- **rt:agent-kit:** подкоманда счёта, спека на девять сценариев и скрипт дерева ([8dced66](https://github.com/Eyhenij/rt-tools/commit/8dced661362858d1cc898dafbb50dfab2063c60f))
- **rt:agent-kit:** проверки слоя оформления встали в гейт пуша и конвейер ([256d016](https://github.com/Eyhenij/rt-tools/commit/256d016547a4222e8620cf7838fc445b3db763c7))
- **rt:agent-kit:** сверка спеков читает привязку строкой списка ([96c2f3e](https://github.com/Eyhenij/rt-tools/commit/96c2f3e139176a1ae79a26e41f3f992c68d178d7))
- **rt:agent-kit:** связка команд перестала считаться одним движением ([2635d1c](https://github.com/Eyhenij/rt-tools/commit/2635d1cb355920b2e3da178e0e29441fd7b52268))
- **rt:agent-kit:** счёт цены контекста — вход, правило и весь слой ([96c598e](https://github.com/Eyhenij/rt-tools/commit/96c598eae27330270ec0f7284202839abacadf90))
- **rt:agent-kit:** цена контекста считается на месте — символы и байты ([8316709](https://github.com/Eyhenij/rt-tools/commit/8316709d238ca4a00b9e19ce465fef1d31cd5ed0))
- **rt:agent-kit:** эпик ведётся по своему замыслу, а не по списку очереди работ ([6c05d78](https://github.com/Eyhenij/rt-tools/commit/6c05d78a39aecc6b9f1f25d024fd1984efca971f))

### Performance Improvements

- **rt:agent-kit:** отказ гейта называет статьи, а не пересказывает их ([6662c3e](https://github.com/Eyhenij/rt-tools/commit/6662c3ec1bbbbb5c608167519b8649c37adb67d2))
- **rt:agent-kit:** срезать вход в работу на девять тысяч знаков формой словаря ([b7acace](https://github.com/Eyhenij/rt-tools/commit/b7acace3db5c8b86b5bd1310ac5cdbf9cc828558))

# [0.14.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.13.0...rt-agent-kit@0.14.0) (2026-08-24)

### Bug Fixes

- **rt:agent-kit:** запись о правке говорит на языке дерева ([03c3222](https://github.com/Eyhenij/rt-tools/commit/03c3222cb32e12ad1d778c0495acbbdb11b6b448))
- **rt:agent-kit:** отданная работа не остаётся черновиком, а ожидание требует команды ([19f767a](https://github.com/Eyhenij/rt-tools/commit/19f767a8a6ac09a1d3eb6bd69063301385d54f36))
- **rt:agent-kit:** папку задачи собирает команда и снимает с копий шапку ([6972e46](https://github.com/Eyhenij/rt-tools/commit/6972e4616f7bb168f2e8128020c323463db7ee05))
- **rt:agent-kit:** стражи завершения хода перестали молчать на трёх дырах ([f8f4b69](https://github.com/Eyhenij/rt-tools/commit/f8f4b6905ae1c579b4684107d4a5557f3fcdd6ac))
- **rt:agent-kit:** сценарий места правки взял свободный номер ([63376be](https://github.com/Eyhenij/rt-tools/commit/63376bed5d7c70456bbfc8cd3f385c69848baf57))

### Features

- **rt:agent-kit:** признак необратимости берётся из списка, а не из довода ([f002458](https://github.com/Eyhenij/rt-tools/commit/f00245883ee445f9af7189b2c0ca13c160de8df7))
- **rt:agent-kit:** сверка очереди работ называет вытесненный из очереди прогон ([5644568](https://github.com/Eyhenij/rt-tools/commit/5644568cb98be4ad60bcf39ce309599613bdf080))

# [0.13.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.12.0...rt-agent-kit@0.13.0) (2026-08-24)

### Bug Fixes

- **rt:agent-kit:** папка задачи разбирается до открытия заявки, а не после одобрения ([166f3c0](https://github.com/Eyhenij/rt-tools/commit/166f3c09932fcc0cdc3e72579e0f2cd440fc817e))
- **rt:agent-kit:** признак вызова считает присваивания частью команды ([d153839](https://github.com/Eyhenij/rt-tools/commit/d1538396ae1589e73caff9c1c53682e9905900d4))
- **rt:agent-kit:** признак дерева считается одним приёмом на обеих сторонах ([ec98772](https://github.com/Eyhenij/rt-tools/commit/ec9877291d8b700b3e4fa040f56951d189c941b3))
- **rt:agent-kit:** пробник набора судит слова, а не их порядок ([966bfa7](https://github.com/Eyhenij/rt-tools/commit/966bfa7297dde2a52bb98b98c409ba961deef91a))
- **rt:agent-kit:** пути берутся у пишущего куска команды, а не у строки целиком ([5d7adb6](https://github.com/Eyhenij/rt-tools/commit/5d7adb6f1d179eea51828b45f69e19ea31365653))
- **rt:agent-kit:** сломанная обвязка сверки схемы перестала быть пропуском ([6e6f38a](https://github.com/Eyhenij/rt-tools/commit/6e6f38a5bd58a73cd3f74d4ad429b376196b11d4))
- **rt:agent-kit:** тяжёлые шаги гейта зовутся по своему предмету ([9a1e892](https://github.com/Eyhenij/rt-tools/commit/9a1e8920e0b6c03a73b39e3a217aff4bebce1de3))
- **rt:agent-kit:** чем запускается выкатка, называет дерево, а не правило ([4600fc8](https://github.com/Eyhenij/rt-tools/commit/4600fc82f5300c6ea37a682f737061349b937bc1))

### Features

- **rt:agent-kit:** затирание надстройки отличается от её правки ([f618c41](https://github.com/Eyhenij/rt-tools/commit/f618c41a72a6d845c78da6094dc125e80bbfd575))
- **rt:agent-kit:** правка разложенной копии отбивается в минуту правки ([e49037e](https://github.com/Eyhenij/rt-tools/commit/e49037ecc15ed8f308e84e3b74b0db68b6f15865))
- **rt:agent-kit:** предложение называет ближайшее утверждение ресурса ([e88ed3e](https://github.com/Eyhenij/rt-tools/commit/e88ed3e2143faf79adc62865bf59c3145396ef87))
- **rt:agent-kit:** сухой прогон и отправка не путаются в выводе ([4bce7b0](https://github.com/Eyhenij/rt-tools/commit/4bce7b0ecdac4b1b3da9e8b64a6b609650c26e70))

# [0.12.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.11.0...rt-agent-kit@0.12.0) (2026-08-23)

### Bug Fixes

- **rt:agent-kit:** готовому полю верят по признаку разбора ([53125f0](https://github.com/Eyhenij/rt-tools/commit/53125f0ef34da387dd082f6207296551bf2022eb))
- **rt:agent-kit:** личность вызова, открывающего заявку, судит гард поставки ([0bd5565](https://github.com/Eyhenij/rt-tools/commit/0bd5565b9c104fc414d9b19be06864b8c5742b06))
- **rt:agent-kit:** ложный конец хода судится и там, где нет ветки задачи ([1ac9458](https://github.com/Eyhenij/rt-tools/commit/1ac94584258ccddc82750f4a6b2ab1adf3b0b3fc))
- **rt:agent-kit:** набор снимает с окружения поля живого захода ([b50aee0](https://github.com/Eyhenij/rt-tools/commit/b50aee0aad9509f63500aadeb64484e9f58eef87))
- **rt:agent-kit:** проба на снятый перечень долга границы убрана ([b3de781](https://github.com/Eyhenij/rt-tools/commit/b3de7817c5ab39bfafd66e10c50ad56908ac1eaa))
- **rt:agent-kit:** проверка границы состояния правится в источнике ([e1b7d2c](https://github.com/Eyhenij/rt-tools/commit/e1b7d2cad6754e0b60ed06b358b10fe81072470a))
- **rt:agent-kit:** состояние разобранной папки ведёт свой паттерн ([a0338bd](https://github.com/Eyhenij/rt-tools/commit/a0338bd71727847bf0c2dfc64be2f45786ec44ec))
- **rt:agent-kit:** сценарии двух пределов сдвинуты за занятый диапазон ([995836d](https://github.com/Eyhenij/rt-tools/commit/995836d89f0789d94a63830ba4427c90bbc12050))
- **rt:agent-kit:** сценарии холодной части получили свободные номера ([a8888cf](https://github.com/Eyhenij/rt-tools/commit/a8888cf08c62c27742a232327fcca3af0914ae34))
- **rt:agent-kit:** сценарии холодной части сдвинуты за занятый диапазон ([ff98e74](https://github.com/Eyhenij/rt-tools/commit/ff98e74bec10e507990cde8c037bece89edfc507))

### Features

- **rt:agent-kit:** известный долг границы держится перечнем, а проверка встала в гейт ([c1361b8](https://github.com/Eyhenij/rt-tools/commit/c1361b8c52e982127ba4eca90dd9a298a5dfc965)), closes [#1011](https://github.com/Eyhenij/rt-tools/issues/1011)
- **rt:agent-kit:** настройка агента зовёт диспетчер, а не список гардов ([a5c865a](https://github.com/Eyhenij/rt-tools/commit/a5c865a8ee310df394ba7132ebf99b149dccc589))
- **rt:agent-kit:** отказ гейта печатает статью, под которую подпадает правка ([10dbd92](https://github.com/Eyhenij/rt-tools/commit/10dbd92a03e2cc5ad4cf5e071789df820b6d4882))
- **rt:agent-kit:** признак границы пакета объявлен правилом и проверяется машиной ([11a861b](https://github.com/Eyhenij/rt-tools/commit/11a861bc01addbefb85d7582967aa1eb9b872350)), closes [#1011](https://github.com/Eyhenij/rt-tools/issues/1011)
- **rt:agent-kit:** статьи трёх правил размечены признаком применимости ([d502933](https://github.com/Eyhenij/rt-tools/commit/d502933b510cd51aea197c9efc48d4217313269c))
- **rt:agent-kit:** статья правила говорит о своей применимости сама ([fed6ce4](https://github.com/Eyhenij/rt-tools/commit/fed6ce4d442871409c0874493aa05e30c03f9b64))
- **rt:agent-kit:** у текста слоя правил свой предел длины ([ab07e2d](https://github.com/Eyhenij/rt-tools/commit/ab07e2d507d12212eb374d8729fda6580a751367))
- **rt:agent-kit:** холодная часть правила объявлена родом ресурса ([4d51a28](https://github.com/Eyhenij/rt-tools/commit/4d51a28df4acdeecaf357f23c190a82ead4a903f))

### Performance Improvements

- **rt:agent-kit:** ввод хука разбирается один раз на событие ([e63bea3](https://github.com/Eyhenij/rt-tools/commit/e63bea38cdc1062c2d68ce64f07d907cd424c665))

# [0.11.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.10.0...rt-agent-kit@0.11.0) (2026-08-22)

### Bug Fixes

- **rt:agent-kit:** гард объявляет локаль исполнения, а не наследует пустую ([82af4d6](https://github.com/Eyhenij/rt-tools/commit/82af4d6a551c61bc21a2d7de72e2d12565dba4fd))
- **rt:agent-kit:** повтор раздела редакции снят, старые редакции уехали из журнала ([4dfbd5e](https://github.com/Eyhenij/rt-tools/commit/4dfbd5ec6503c3566c289957a93b1e6c160de089)), closes [#960](https://github.com/Eyhenij/rt-tools/issues/960)
- **rt:agent-kit:** пустое устройство и поток ошибок не считаются записью файла ([db3206d](https://github.com/Eyhenij/rt-tools/commit/db3206da53f7c422b07397480b2e6481f785813d))
- **rt:agent-kit:** пути берутся из заголовка команды, а не из тела документа на месте ([f51cb09](https://github.com/Eyhenij/rt-tools/commit/f51cb09ad4982a43c60172d67ac491b6f7f6ef3a))

### Features

- **rt:agent-kit:** дерево задаёт порог сжатия и сводит его с порогом остановки ([7b6de03](https://github.com/Eyhenij/rt-tools/commit/7b6de03d4e4321bfbafd02907b574c8d4c0db65c)), closes [#977](https://github.com/Eyhenij/rt-tools/issues/977)
- **rt:agent-kit:** закон, правило и карта хода развели предел окна и порог сжатия ([347906a](https://github.com/Eyhenij/rt-tools/commit/347906a8e6348beaf174902919b1f0b51dd9e112))
- **rt:agent-kit:** карта хода заведена ресурсом пакета ([0aa95a0](https://github.com/Eyhenij/rt-tools/commit/0aa95a0187d38e263a81dc4523d3a5f81c013f7d))
- **rt:agent-kit:** карта хода сверяется размером и полнотой ([2b0f20f](https://github.com/Eyhenij/rt-tools/commit/2b0f20f5e6ef5d48e5f58d67c3d4884b802e1edc))
- **rt:agent-kit:** команда отметки несёт версию выпуска доводом ([a8ca782](https://github.com/Eyhenij/rt-tools/commit/a8ca7820dda4f772d98a1842c2278b7117df257c))
- **rt:agent-kit:** команда отметки несёт текст починки доводом ([067091c](https://github.com/Eyhenij/rt-tools/commit/067091cdc67ddcd3660bff4f7c281269559304d6)), closes [#910](https://github.com/Eyhenij/rt-tools/issues/910)
- **rt:agent-kit:** отметка состояния груза командой строки запуска ([f1c20c7](https://github.com/Eyhenij/rt-tools/commit/f1c20c70bc8cfafe50ac885df86e1776755e929b))
- **rt:agent-kit:** передача захода пишется перед сжатием контекста ([c6da546](https://github.com/Eyhenij/rt-tools/commit/c6da5463d472cbd9a8b8b2440c88f0a3cd7d52b8))
- **rt:agent-kit:** передача и карта хода приходят в контекст на запуске ([a137fcb](https://github.com/Eyhenij/rt-tools/commit/a137fcbd15a50f90a9f63b391a115449cb033c5e))
- **rt:agent-kit:** пороги сжатия и остановки разведены, запас объявлен числом ([a73b472](https://github.com/Eyhenij/rt-tools/commit/a73b4729b58694e8e3ebabe4550bc40174f93965))
- **rt:agent-kit:** проверка читает строку следующего движения в каждом разделе ([8abd41d](https://github.com/Eyhenij/rt-tools/commit/8abd41dec775a6c50344b42f4e8c04d42c248212))
- **rt:agent-kit:** разбор приехавшего груза объявлен правилом с готовыми вызовами ([3b1139f](https://github.com/Eyhenij/rt-tools/commit/3b1139f82d741e910e9c6fd4544a4f32e1294fb2))
- **rt:agent-kit:** сверка порогов судит расстояние между ними, а не совпадение ([c2e85a7](https://github.com/Eyhenij/rt-tools/commit/c2e85a7349ec29ba8f6c4d8758bc1627ae8aeb6b))
- **rt:agent-kit:** сводка называет цену входа в работу и долю отбитий не на правке файла ([612a041](https://github.com/Eyhenij/rt-tools/commit/612a0416c2f4aebefa273a303c4a9846d216c8ae))
- **rt:agent-kit:** страж окна зовёт работать дальше там, где сжатие придёт само ([16bc442](https://github.com/Eyhenij/rt-tools/commit/16bc4426f315c1d0a30d88094047059046fc58e2))
- **rt:agent-kit:** у каждого состояния работы есть раздел, и это сторожит сверка ([cb431d5](https://github.com/Eyhenij/rt-tools/commit/cb431d5f871bce896ece60235910977cfb909a9d))

* **rt:agent-kit:** сводка наблюдений называет вес загруженного слоя правил и цену одного захода
* **rt:agent-kit:** доля отбитий гейта, пришедших не на правку файла, стоит в сводке своей строкой

# [0.10.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.9.1...rt-agent-kit@0.10.0) (2026-08-20)

### Bug Fixes

- **rt:agent-kit:** дыры новой проверки поставки закрыты, ложные отказы сняты ([2feaa13](https://github.com/Eyhenij/rt-tools/commit/2feaa139110b289c1f415d70ff28b55474032277))
- **rt:agent-kit:** имя обязательного раздела спека перестало быть канцеляритом ([0738acd](https://github.com/Eyhenij/rt-tools/commit/0738acd5485f1a3b2f019326c010e7de95d0ad35))
- **rt:agent-kit:** номера сценариев гарда утверждения разведены с чужими ([bc9e7e1](https://github.com/Eyhenij/rt-tools/commit/bc9e7e1b63eaa147c58793e3e1fba728524606b7))
- **rt:agent-kit:** отказ гарда утверждения зовёт общий хвост о двух ходах ([900749c](https://github.com/Eyhenij/rt-tools/commit/900749cc0d666350e8a2690fa2daaa6f4bca5d92))
- **rt:agent-kit:** проверка слога берёт решение главной ветки о слове «данные» ([6780ada](https://github.com/Eyhenij/rt-tools/commit/6780ada6a460fceab2ed5edbe7324e3fc806855e))
- **rt:agent-kit:** слово «данные» не канцелярит, а число в наборе печатается строкой ([d9f0293](https://github.com/Eyhenij/rt-tools/commit/d9f0293cb3f6df8624c7c8b62197613691960b0a))

### Features

- **rt:agent-kit:** гард при выключенной роли выходит молча ([f2c7a43](https://github.com/Eyhenij/rt-tools/commit/f2c7a431eab023df22156c5c0ca9b4a8b1e65f73))
- **rt:agent-kit:** гарды поставки отвечают одной формой отказа и живут своим поддоменом ([81d3ebd](https://github.com/Eyhenij/rt-tools/commit/81d3ebdef161cd379211a950a2e508a8d813b788))
- **rt:agent-kit:** дерево объявляет, какие роли слоя правил выключены ([ee3b623](https://github.com/Eyhenij/rt-tools/commit/ee3b623925717ccff40b96609515f048c0700374))
- **rt:agent-kit:** закрытый этап подтверждается выводом команды, а не словами ([2d02ff4](https://github.com/Eyhenij/rt-tools/commit/2d02ff4d01933fe632c8448d2daa800a43f5c3c4))
- **rt:agent-kit:** запись в списке принятого отвечает за себя сама ([c6bfc51](https://github.com/Eyhenij/rt-tools/commit/c6bfc5179904f803777c8121c71cad02a5554d96))
- **rt:agent-kit:** заход из передачи входит в работу тем же правилом, что и всякий другой ([95e3928](https://github.com/Eyhenij/rt-tools/commit/95e3928ec35cab57d29a71f65ce8982575c250f9))
- **rt:agent-kit:** канцелярит в новом тексте отбивается вместе с названной заменой ([e49c130](https://github.com/Eyhenij/rt-tools/commit/e49c13040a01078b314fc68f6615c9790d8011f8))
- **rt:agent-kit:** отказ гарда называет два законных хода и форму обхода ([3bd7b97](https://github.com/Eyhenij/rt-tools/commit/3bd7b97ae214fce99a97600a696538385f68aeb2))
- **rt:agent-kit:** отказ поставки называет несошедшееся целиком ([a899812](https://github.com/Eyhenij/rt-tools/commit/a899812ef3b5809b0f991bbd8d8506e89fd82205))
- **rt:agent-kit:** пакет знает состав правки и отбивает пуш с переключением ветки ([2acbac9](https://github.com/Eyhenij/rt-tools/commit/2acbac94cbee37085a522afba047a832a1384c78))
- **rt:agent-kit:** перезапуск упавшего задания ждёт прочитанного журнала ([d16bc05](https://github.com/Eyhenij/rt-tools/commit/d16bc05f09b877e71e3e017374e5ecf6f7d121f4))
- **rt:agent-kit:** сверка очереди работ называет конфликтующую заявку ([9ecda1f](https://github.com/Eyhenij/rt-tools/commit/9ecda1f0d4dd698fb9b13ea549d24e808d312302))
- **rt:agent-kit:** совесть называет промах, который повторяется прямо сейчас ([b24ef14](https://github.com/Eyhenij/rt-tools/commit/b24ef14d66af5caa01bcad5bfa3951f7db0178a7))
- **rt:agent-kit:** состояние работы объявляется строкой, и гард судит переход ([c3f1bc8](https://github.com/Eyhenij/rt-tools/commit/c3f1bc817c4c03dcfbaed2da52ec0b6349021f05))
- **rt:agent-kit:** списки принятого приведены к общей форме, проверки зовут разбор ([3e4c6a4](https://github.com/Eyhenij/rt-tools/commit/3e4c6a4ab8ba190e288ec48020d3c3010f781fd1))
- **rt:agent-kit:** страж не выпускает ход, в котором по работе не сделано ничего ([0fefb06](https://github.com/Eyhenij/rt-tools/commit/0fefb063a8e8c5dafe43a1f755c1d4f054fbb84e))
- **rt:agent-kit:** усвоение правил спрашивает роль экзаменатора, а вердикт судит гард ([cc87bc2](https://github.com/Eyhenij/rt-tools/commit/cc87bc2dda00428a4868503bb28f86cc58030cfd))
- **rt:agent-kit:** условия поставки спрашиваются там, где их ещё дёшево починить ([58b4453](https://github.com/Eyhenij/rt-tools/commit/58b445366dcb79cb8222e3aa907fd717897c52af))
- **rt:agent-kit:** утверждение владельцу о дереве подтверждается командой хода ([783a5b5](https://github.com/Eyhenij/rt-tools/commit/783a5b52df55c6dc82c02fc5a191e9e05e94079a))
- **rt:agent-kit:** черновик не снимается с конфликтующей заявки ([04d2d50](https://github.com/Eyhenij/rt-tools/commit/04d2d5065f043ff5aeccf9420ba7b2c777072947))

## [0.9.1](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.9.0...rt-agent-kit@0.9.1) (2026-08-19)

### Features

- **rt:agent-kit:** дерево заводится токеном, выданным в админке приёма ([a117d8a](https://github.com/Eyhenij/rt-tools/commit/a117d8a2889e2081e40451c2269166563df2db61))

# [0.9.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit@0.8.3...rt-agent-kit@0.9.0) (2026-08-18)

### Bug Fixes

- **rt:agent-kit:** гард проверок узнаёт пуш, идущий с ключами перед подкомандой ([8080ae5](https://github.com/Eyhenij/rt-tools/commit/8080ae58643d63c07b89fcab72397b2a0e12f00c))
- **rt:agent-kit:** гейт правил зовётся на вызовы браузера, а расхождение объявления находится сверкой ([1aff264](https://github.com/Eyhenij/rt-tools/commit/1aff2649e5969fab53ff24708d62d141e2e1ca5d))
- **rt:agent-kit:** готовый код пакета зовёт директивы кита, а не чужого дерева ([407161b](https://github.com/Eyhenij/rt-tools/commit/407161b00511d4480e9fe78ed0595246a38d898f)), closes [#771](https://github.com/Eyhenij/rt-tools/issues/771)
- **rt:agent-kit:** образец сообщения владельцу кончается взятым, а не обещанием ([0adbc54](https://github.com/Eyhenij/rt-tools/commit/0adbc5495407b5b95c0ce59b355d4bd0673f8f8a))
- **rt:agent-kit:** проверка классов вёрстки собирает имя из вложенности, а долг разобран до нуля ([95f28c8](https://github.com/Eyhenij/rt-tools/commit/95f28c83e4736061acfde8cc3a361a652513fff1))
- **rt:agent-kit:** проверка классов вёрстки читает пакетное правило и не путает разросшийся долг с новым ([a13cbab](https://github.com/Eyhenij/rt-tools/commit/a13cbab948b88ffb45a5ebe266c9f82e0de7eee8))
- **rt:agent-kit:** следы деления сняты по всему набору гейта ([16138fa](https://github.com/Eyhenij/rt-tools/commit/16138fa0f4607b1f97cb3bc03830844bc7123880))
- **rt:agent-kit:** у отказа от необратимого действия есть безопасная часть ([cad7a40](https://github.com/Eyhenij/rt-tools/commit/cad7a40ebbac4f81746cb8e10e4652f6e786b264))
- **rt:message-bus:** панель настройки столбцов открывается своим адресом у каждого раздела ([647df99](https://github.com/Eyhenij/rt-tools/commit/647df993170f8109b9c4414748c509013fbdcf89))
- **rt:message-bus:** стенд сквозной спеки берёт свои имена, а прогоны идут по очереди ([992e45a](https://github.com/Eyhenij/rt-tools/commit/992e45a3a53fe345b7ba0666b190497ebe72f594))

### Features

- **rt:agent-kit:** дерево заводит себя командой пакета по приглашению ([b6b641e](https://github.com/Eyhenij/rt-tools/commit/b6b641e39b1bcaa93e5d59e6da6af90bf804fec7))
- **rt:agent-kit:** запись предложения называет надстройки, которые снимет его правка ([24a182b](https://github.com/Eyhenij/rt-tools/commit/24a182bfe5c8b23e7ded8ae66af914ea7f993f18))
- **rt:agent-kit:** сверка очереди работ называет вершину открытого PR, за которой прогона нет ([02e5bd0](https://github.com/Eyhenij/rt-tools/commit/02e5bd077964f4a72ebade37c9daa32752387d30))
- **rt:agent-kit:** сверка очереди работ называет готовое, оставленное черновиком ([79cfd09](https://github.com/Eyhenij/rt-tools/commit/79cfd090adf057918eac03c4e7ef6a1e2d5bd360))
- **rt:agent-kit:** сверка раскладки стоит в наборе гейта пуша ([c9641ba](https://github.com/Eyhenij/rt-tools/commit/c9641ba190b8ca1a9fb9c33812ee8436a1a34c88))
- **rt:agent-kit:** ход о чужом шаге называет своё следующее действие и начинает его ([658a045](https://github.com/Eyhenij/rt-tools/commit/658a045f203ca7b6655043abce151e71907aba2f))
- **rt:agent-kit:** шесть находок эпика встали статьями и ловушками слоя правил ([3b252f4](https://github.com/Eyhenij/rt-tools/commit/3b252f4432380112d32459786811dae07414750b))
- **rt:message-bus:** дерево получает токен по приглашению, обращение закрыто пределом частоты ([bdc677a](https://github.com/Eyhenij/rt-tools/commit/bdc677a68429f14ff27c9b0ef53a3f86c7d5a55f))

---

Выпуски 0.1.0 … 0.8.3 вынесены в `projects/agent-kit/CHANGELOG-0.1-0.8.md`: журнал перерос предел
длины документа, а делится он по выпускам. Новый выпуск генератор дописывает сюда, в начало.
