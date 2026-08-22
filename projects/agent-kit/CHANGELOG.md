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
