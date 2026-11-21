# [0.38.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.37.1...rt-agent-kit%400.38.0) (2026-11-21)

**Метрика выпуска:** отказов проверок, вниз

### Bug Fixes

- **rt:agent-kit:** аудит очереди считает отставание прода без диффа, отказ сравнения — заметка (RT-3422) ([f8e4696](https://github.com/Eyhenij/rt-tools/commit/f8e46965763a647feb821d49dd94580329aa2dc9))
- **rt:agent-kit:** все наборы пакета зелёные, шаги задачи RT-3275 измерены ([a7d989a](https://github.com/Eyhenij/rt-tools/commit/a7d989a2d2785242204308f757f90b52da9e1e72)), closes [#3275](https://github.com/Eyhenij/rt-tools/issues/3275)
- **rt:agent-kit:** выход 12 при цепочке сверху вниз и одним заходом, после второго круга ревью (RT-3404) ([bbd3099](https://github.com/Eyhenij/rt-tools/commit/bbd309943df89a91eb307665f4691be2d4b0e36c))
- **rt:agent-kit:** выход 12 требует отметку у всех, кроме влитой последней, после первого круга ревью (RT-3404) ([890f4d3](https://github.com/Eyhenij/rt-tools/commit/890f4d33ff787618c74d21727f69b9dd6e2204d9))
- **rt:agent-kit:** движок не требует PR эпика, пока задачи эпика не взяты и не влиты ([5741209](https://github.com/Eyhenij/rt-tools/commit/5741209e4c78d1c7347ad245ebbb99647a33ea7a))
- **rt:agent-kit:** за порогом окна отказ называет закрытие сессии ([4ae7f8d](https://github.com/Eyhenij/rt-tools/commit/4ae7f8dfc08b81afbb97e8ff86aa86dbdcd806fb))
- **rt:agent-kit:** команды PR снова получают ядро git-workflow ([a5adb20](https://github.com/Eyhenij/rt-tools/commit/a5adb20e670fcc502d2eb783ec4c3482d35b7e87))
- **rt:agent-kit:** конец хода читается по записи после него (RT-3418) ([a7380fd](https://github.com/Eyhenij/rt-tools/commit/a7380fd227ff543dfa9b2c1990b21487040327a6))
- **rt:agent-kit:** конец эпика и одобрение кита спрашивают владельца окном ([7799b6c](https://github.com/Eyhenij/rt-tools/commit/7799b6c03647f98cfc2f28b41396253992b58771))
- **rt:agent-kit:** кончившаяся фоновая задача — ход «прочитать вывод», меню «стоп» над ней не предлагается (RT-3463) ([6e8b0c3](https://github.com/Eyhenij/rt-tools/commit/6e8b0c3c4381ff262fbf28bc5e760adb62794fcf))
- **rt:agent-kit:** набор хостинга запускает читателей без цвета ([7c0cdca](https://github.com/Eyhenij/rt-tools/commit/7c0cdca7a535dc14a4c50ae5f41243de6f043484))
- **rt:agent-kit:** наборы пакета зелёные на ветке результата работы ([f2b6670](https://github.com/Eyhenij/rt-tools/commit/f2b66707abf0acce8578e63c4aecdffaaf24a805))
- **rt:agent-kit:** описание пакета в пределе длины, новые файлы спрятаны от форматтера ([742d50a](https://github.com/Eyhenij/rt-tools/commit/742d50afa60ee50b370dd46a1a3a73f114f26971))
- **rt:agent-kit:** ответ «сделаю сам» в меню не спрашивает окно второй раз ([51487c4](https://github.com/Eyhenij/rt-tools/commit/51487c4efcf4f82edcde336dfe6fe8e56bf928ad))
- **rt:agent-kit:** отказ называет ход, разрешённый и в соседних областях ([6fe42a3](https://github.com/Eyhenij/rt-tools/commit/6fe42a38843a7488e2c2fc3d43182ceaf46a2b0d))
- **rt:agent-kit:** первый вызов за порогом окна пропускает правку progress ([1ee761e](https://github.com/Eyhenij/rt-tools/commit/1ee761e0399c84da7b6ed2602074f76705ac42b0))
- **rt:agent-kit:** перемер перед PR даёт проверке ход работы её замера ([4616b1a](https://github.com/Eyhenij/rt-tools/commit/4616b1afea6a40b85678cde78f17f4b00caa320f))
- **rt:agent-kit:** перемер перед PR идёт на node из .nvmrc дерева ([34c1104](https://github.com/Eyhenij/rt-tools/commit/34c11040cd565598456f8306db0a50b914c14c26))
- **rt:agent-kit:** правило testing снова называет три требования этого дерева ([a8293eb](https://github.com/Eyhenij/rt-tools/commit/a8293eb2c3a2f0e874253cbfa4349d927a49d319))
- **rt:agent-kit:** правка строки с пометкой «шаг владельца» после второго круга ревью (RT-3420) ([91b6df9](https://github.com/Eyhenij/rt-tools/commit/91b6df947ca8a5d6d6792e2a646523f6d34d0fc8))
- **rt:agent-kit:** правки после второго круга ревью (RT-3418) ([e889ce2](https://github.com/Eyhenij/rt-tools/commit/e889ce2ec1e993718d37bb59337b5133f4bf9a4c))
- **rt:agent-kit:** правки после второго круга ревью (RT-3421) ([41e378b](https://github.com/Eyhenij/rt-tools/commit/41e378bfd296be5fd6d70e17212f1a64da83cecd))
- **rt:agent-kit:** правки после второго круга ревью (RT-3422) ([b28a1c3](https://github.com/Eyhenij/rt-tools/commit/b28a1c3249dd4fdf4411bfb1611cfce329a64b8f))
- **rt:agent-kit:** правки после второго круга ревью (RT-3463) ([c03d25e](https://github.com/Eyhenij/rt-tools/commit/c03d25e3d1c80690edb8b759a04b13f649f865cc))
- **rt:agent-kit:** правки после второго круга ревью (RT-3473) ([442fbcf](https://github.com/Eyhenij/rt-tools/commit/442fbcf9bfc8230f5b7f449cbc45e7447a676f8e))
- **rt:agent-kit:** правки после первого круга ревью (RT-3418) ([5727617](https://github.com/Eyhenij/rt-tools/commit/5727617d9ba68a2952313ed12f928b98b6e73081))
- **rt:agent-kit:** правки после первого круга ревью (RT-3421) ([fdeea71](https://github.com/Eyhenij/rt-tools/commit/fdeea71eb7a89a180f3e24dcb3d2c10525b95e2e))
- **rt:agent-kit:** правки после первого круга ревью (RT-3422) ([e8c027d](https://github.com/Eyhenij/rt-tools/commit/e8c027d3e58ebcdbc9d08fab9a1bc4edc7ed0b9b))
- **rt:agent-kit:** правки после первого круга ревью (RT-3446) ([f2c1f4b](https://github.com/Eyhenij/rt-tools/commit/f2c1f4bb6ea9cdbadad64e393e47cf53f5053ef3))
- **rt:agent-kit:** правки после первого круга ревью (RT-3463) ([ed474c9](https://github.com/Eyhenij/rt-tools/commit/ed474c955517677706cdc21e2f12f7143484cc2c))
- **rt:agent-kit:** правки после первого круга ревью (RT-3473) ([0686760](https://github.com/Eyhenij/rt-tools/commit/06867603ed6358372e627c8c971742ebd5314425))
- **rt:agent-kit:** проба таблицы решений судит хук без переменных конвейера (RT-3473) ([5cf27aa](https://github.com/Eyhenij/rt-tools/commit/5cf27aa62521fd8d644da4dc680389c12df90f02))
- **rt:agent-kit:** проверка выхода мерит копию сессии, а не главную копию ([263bc95](https://github.com/Eyhenij/rt-tools/commit/263bc9555f8251d7c954df53728a633c627f890d))
- **rt:agent-kit:** проверка назначения читает номер эпика и под nx ([283bd9a](https://github.com/Eyhenij/rt-tools/commit/283bd9acf89d7d0af820455b6cf0538254ba713b))
- **rt:agent-kit:** проверки набора читают холодные части разбитых правил ([69b88ed](https://github.com/Eyhenij/rt-tools/commit/69b88ed16802f59241aa7fd92644310ec22afe17))
- **rt:agent-kit:** прогноз отказов печатается целым числом ([592857c](https://github.com/Eyhenij/rt-tools/commit/592857ce74b9c7ecb5ce3600cf40a9fe39f9ef50))
- **rt:agent-kit:** пропуски считаются среди всех остановок на ветке с движком ([cf961c3](https://github.com/Eyhenij/rt-tools/commit/cf961c3b683fcbdfd45103a7e712e92498938493))
- **rt:agent-kit:** пустой ход при открытом эпике судит только хук модели ([85a4d32](https://github.com/Eyhenij/rt-tools/commit/85a4d32487379345da539309a65b706f10cc38b8)), closes [#3276](https://github.com/Eyhenij/rt-tools/issues/3276)
- **rt:agent-kit:** след плана узнаёт голые имена, роль читается в копии сессии ([a976f0c](https://github.com/Eyhenij/rt-tools/commit/a976f0c9f4765cbcd9275ff8d1a81ca56e470056))
- **rt:agent-kit:** судья ищет ранние вызовы хода и сверяет шаблон объявления, после второго круга ревью (RT-3417) ([2e4b5b6](https://github.com/Eyhenij/rt-tools/commit/2e4b5b6d15cbb885123f28fb9bc82191aa29cfcb))
- **rt:agent-kit:** судья хода видит слово владельца и делает меньше кругов, после первого круга ревью (RT-3417) ([a086789](https://github.com/Eyhenij/rt-tools/commit/a086789069c5bfccf09ffd2065d90c0c847cad5d))
- **rt:agent-kit:** сценарий запуска тестов либы получает свободный номер SC-AK-1795 (RT-3455) ([9b313a5](https://github.com/Eyhenij/rt-tools/commit/9b313a5d5cfe2324f0620c1ca7aa85d1fd33ba9a))
- **rt:agent-kit:** счётчик записи в наборе печатает число без цвета ([7e73e66](https://github.com/Eyhenij/rt-tools/commit/7e73e6699509550bd46e12e257f516b423f043da))
- **rt:agent-kit:** счётчик метрики читает слово владельца из источника описания ([8edd264](https://github.com/Eyhenij/rt-tools/commit/8edd264b937a02a1221575d050b3924ab312e1c4))
- **rt:agent-kit:** тест снимка прежней редакции правит копию ресурсов, а не общий каталог пакета (RT-3421) ([8b23720](https://github.com/Eyhenij/rt-tools/commit/8b23720c94f49b1350fc77c7d5319ceff8216536))
- **rt:agent-kit:** ход работы замера берётся из истории, а не из метки шага ([c07a63f](https://github.com/Eyhenij/rt-tools/commit/c07a63fa7e269ac3a192b961726e8378217072fa))
- **rt:agent-kit:** хук на Stop держит ход, пока работа не кончена ([a3b68bb](https://github.com/Eyhenij/rt-tools/commit/a3b68bbe3b2515b1183b2be5f55e2c66ff3b455e)), closes [#3276](https://github.com/Eyhenij/rt-tools/issues/3276)
- **rt:agent-kit:** хук поставки в пределе длины, хеш из букв в снимке проб ([e8cb6b3](https://github.com/Eyhenij/rt-tools/commit/e8cb6b32608f9f684721c8b953c323ef352df085))

### Features

- **rt:agent-kit:** browser-verification в 2 996 байтах, doc-style после пересказа ([1b98424](https://github.com/Eyhenij/rt-tools/commit/1b98424e8dd9e09c19d20bbccc2122c4ca788176))
- **rt:agent-kit:** doc-style в 2 994 байтах ([f29e7e6](https://github.com/Eyhenij/rt-tools/commit/f29e7e66073e34d3dbba0f0ec7ebbccf8a560be1))
- **rt:agent-kit:** doc-style совпал на третьем круге, этап коротких правил закрыт ([ebc2fc5](https://github.com/Eyhenij/rt-tools/commit/ebc2fc541300fc04de5dd4c77409dd7733ac37ea))
- **rt:agent-kit:** git-workflow, проверка компонентов кита и agent-kit-extend в 3 000 знаков ([5a28ca0](https://github.com/Eyhenij/rt-tools/commit/5a28ca083af298909463adefabad73fce611edf1))
- **rt:agent-kit:** spec-driven сохраняет смысл в 2 997 байтах ([402373b](https://github.com/Eyhenij/rt-tools/commit/402373b2d7a48ef8a9b45b001c78679d3f27b314))
- **rt:agent-kit:** task-flow разбито на четыре части до 3 000 байт ([6d4cda9](https://github.com/Eyhenij/rt-tools/commit/6d4cda9d47359b74e690dbd0ca999809139d144a))
- **rt:agent-kit:** turn-exit и flow-step берут решение из таблицы ([3ae100a](https://github.com/Eyhenij/rt-tools/commit/3ae100acc9bdac8bfb65930ce7d54cede9407293))
- **rt:agent-kit:** вердикт роли несёт задачу своего момента ([15f3a1d](https://github.com/Eyhenij/rt-tools/commit/15f3a1d2eb8f8a74600d9bc645484ab34c9bcd1f))
- **rt:agent-kit:** все хуки решают по таблице, соседей никто не перезапускает ([6f22f4a](https://github.com/Eyhenij/rt-tools/commit/6f22f4a87535114c2a35deb712cc6631536d1975))
- **rt:agent-kit:** вторая холодная часть правила и spec-driven в 3000 байт ([4dfd735](https://github.com/Eyhenij/rt-tools/commit/4dfd735a2faae158d5754ce803f37629f389d1e1))
- **rt:agent-kit:** выбор шагов набора говорит, тронут ли предмет шага ([67b3945](https://github.com/Eyhenij/rt-tools/commit/67b394559e796294afbf8269c3876756c08b9210))
- **rt:agent-kit:** выпуск эпика по концу дня отчёта и минуты от взятия ([ba9cf11](https://github.com/Eyhenij/rt-tools/commit/ba9cf11e3a0413b907a91517def057ac9d6b09b8))
- **rt:agent-kit:** выходы хостинга task flow ([d26a56f](https://github.com/Eyhenij/rt-tools/commit/d26a56f37d5a32c793c7a3645271210199816f5f)), closes [#3329](https://github.com/Eyhenij/rt-tools/issues/3329)
- **rt:agent-kit:** движок task flow меряет ветку командой measure ([6af0564](https://github.com/Eyhenij/rt-tools/commit/6af0564b7885ba945fa47a0fa60faeb28e6f51d1)), closes [#3329](https://github.com/Eyhenij/rt-tools/issues/3329)
- **rt:agent-kit:** движок видит фоновые задачи сессии (RT-3418) ([ad01fdc](https://github.com/Eyhenij/rt-tools/commit/ad01fdca15b081ce68ea1582bda96c466179b8b6))
- **rt:agent-kit:** движок меряет шаг плана его проверкой ([d4781fc](https://github.com/Eyhenij/rt-tools/commit/d4781fcc33e95cd80cd2aee9f512f7b5ed5d3e29)), closes [#3329](https://github.com/Eyhenij/rt-tools/issues/3329)
- **rt:agent-kit:** движок не ищет цитаты владельца в записях разговора ([558322d](https://github.com/Eyhenij/rt-tools/commit/558322d450619a0a809bfdedb10adea99a39b50a))
- **rt:agent-kit:** действие вызова определяет решатель, окно и вход из передачи по таблице ([0a2f9c7](https://github.com/Eyhenij/rt-tools/commit/0a2f9c7a889144df4c6e8136f52df802a3ec5ac3))
- **rt:agent-kit:** день без записи хода в отчёте метрик ([c133a3e](https://github.com/Eyhenij/rt-tools/commit/c133a3ed7d7bbcba0b73b8784aff036d253b4c54))
- **rt:agent-kit:** длинные правила помещаются в выдачу проверки правил ([491c708](https://github.com/Eyhenij/rt-tools/commit/491c7080902b10165834697c4a6042a385133c46))
- **rt:agent-kit:** замену проверки и шаг владельца владелец подтверждает в окне ([de1f7a2](https://github.com/Eyhenij/rt-tools/commit/de1f7a2915228307a9507dbf0109ac33d43e053c))
- **rt:agent-kit:** запасное действие в решателе и обратная проба отказов ([644063e](https://github.com/Eyhenij/rt-tools/commit/644063ee56c4ca5e819662473e9f1da6e178e766))
- **rt:agent-kit:** измерители локальных выходов task flow ([bf8aaf4](https://github.com/Eyhenij/rt-tools/commit/bf8aaf4263203b2c1a22f16db85971b2c30ac73a)), closes [#3329](https://github.com/Eyhenij/rt-tools/issues/3329)
- **rt:agent-kit:** итог работы считает отказы проверки правил по причине ([e580d35](https://github.com/Eyhenij/rt-tools/commit/e580d356ec34054d2c0ce1c238d7dbb14f4fc7c0))
- **rt:agent-kit:** конец хода отпускается, пока идёт своя фоновая задача (RT-3418) ([786b4f9](https://github.com/Eyhenij/rt-tools/commit/786b4f9e078e3a87b3009bc9353a1b88e5c0e81a))
- **rt:agent-kit:** конец эпика доходит до PR эпика без отметки последней задачи ([d50f8aa](https://github.com/Eyhenij/rt-tools/commit/d50f8aa4f7c464132d637d4568b2343105cd160b))
- **rt:agent-kit:** меню отказа без варианта «сделаю сам», строка плана без «шага владельца» (RT-3420) ([7139335](https://github.com/Eyhenij/rt-tools/commit/7139335ad99ecb07acacaf47705eff8e417b756e))
- **rt:agent-kit:** модель описания task flow ([7336b75](https://github.com/Eyhenij/rt-tools/commit/7336b75cbc977be3f9331d1a10e2c1ef0ce4a16e)), closes [#3329](https://github.com/Eyhenij/rt-tools/issues/3329)
- **rt:agent-kit:** наблюдение взятия задачи и пересчёт по сессиям ([3c623ae](https://github.com/Eyhenij/rt-tools/commit/3c623aecb8471196d048c0d502a5085c266f3474))
- **rt:agent-kit:** надстройка описания task flow, заготовки и генерация текстов ([b1b8d62](https://github.com/Eyhenij/rt-tools/commit/b1b8d627e7f6854cab215c2c242b7fc7a57a9030))
- **rt:agent-kit:** оба исполнителя набора пишут строку запуска из семи полей ([8350b61](https://github.com/Eyhenij/rt-tools/commit/8350b61f61a8f1f3010e6d3cba9c252f126e3ad7))
- **rt:agent-kit:** общие факты хуков считает facts.sh ([7842394](https://github.com/Eyhenij/rt-tools/commit/7842394cf6e5b49bf1c03b42356daf9c3d5d3c71))
- **rt:agent-kit:** одобрение плана меряет проверки на дереве коммита плана ([f7e6748](https://github.com/Eyhenij/rt-tools/commit/f7e67481c407c904159122dde3ed6b7a109e96dd))
- **rt:agent-kit:** одобрение плана пишет движок, а не исполнитель ([309caa3](https://github.com/Eyhenij/rt-tools/commit/309caa3b70e7eaa8b44e55cb96f1b799e56052fb)), closes [#3329](https://github.com/Eyhenij/rt-tools/issues/3329)
- **rt:agent-kit:** одобрение плана проверяется по месту ответа в записях разговора ([76cc864](https://github.com/Eyhenij/rt-tools/commit/76cc864e4f3abfd413df4603ccb15cb060362d4d))
- **rt:agent-kit:** окна эпика по наблюдениям дерева ([fffa9cf](https://github.com/Eyhenij/rt-tools/commit/fffa9cf5123ac2e2a27f3801db1a75b18cfec0ae))
- **rt:agent-kit:** описание task flow пакета и команда states ([7e24a22](https://github.com/Eyhenij/rt-tools/commit/7e24a22e6b6099641ebc05fabfc50758dab1d2ed)), closes [#3329](https://github.com/Eyhenij/rt-tools/issues/3329)
- **rt:agent-kit:** опись хуков, программа таблицы решений, отказы браузера называют загрузку правила ([b2a0657](https://github.com/Eyhenij/rt-tools/commit/b2a06578a081ea710774cb11b7a3518467707408))
- **rt:agent-kit:** остановка без вызова после отказа называет меню владельцу ([04777ad](https://github.com/Eyhenij/rt-tools/commit/04777ad7412f5a393d438c5f9b52d8152157d865))
- **rt:agent-kit:** отказ выхода называет меню владельцу, когда шаг за ним ([8e88b30](https://github.com/Eyhenij/rt-tools/commit/8e88b30a2bc6feb151ee96df919728a4faff6412))
- **rt:agent-kit:** отказ шлюза называет причину, соседи не зовут загрузку доставляемого ([2819e06](https://github.com/Eyhenij/rt-tools/commit/2819e0682989822e392f75a0a521a98f2d496392))
- **rt:agent-kit:** отказы поставки называют разрешённый ход, перебор таблицы за доли секунды ([0f8551a](https://github.com/Eyhenij/rt-tools/commit/0f8551a15c366fde64f89770ceaee6cdcd154826)), closes [#3275](https://github.com/Eyhenij/rt-tools/issues/3275)
- **rt:agent-kit:** отказы хода работы называют разрешённый ход, цепочки таблицы записаны сценариями ([3402681](https://github.com/Eyhenij/rt-tools/commit/3402681a45e631f41b11be8f8bb6f382b883826b)), closes [#3275](https://github.com/Eyhenij/rt-tools/issues/3275)
- **rt:agent-kit:** отправка окон эпика своей записью ([2d97159](https://github.com/Eyhenij/rt-tools/commit/2d97159cee2b11d36e785e2bfd025ba29102bdd0))
- **rt:agent-kit:** отправка пересчитанных прошлых дней ([f02e28c](https://github.com/Eyhenij/rt-tools/commit/f02e28c7a06083fb4857b33f3c3e457148dfee4a))
- **rt:agent-kit:** отчёт за день не судит мёртвые правила ([59048d5](https://github.com/Eyhenij/rt-tools/commit/59048d55311206e12877397f7303cf24cdd9a347))
- **rt:agent-kit:** отчёт метрик за один день ([532ef00](https://github.com/Eyhenij/rt-tools/commit/532ef006e429fe4a0106da703be4a4193a7ce6e2))
- **rt:agent-kit:** отчёт метрик считает пользу каждой проверки набора ([23f1816](https://github.com/Eyhenij/rt-tools/commit/23f1816a475e3ca40f62fda1c55400867c2a9c0b))
- **rt:agent-kit:** парсер языка описания task flow ([5fa21cd](https://github.com/Eyhenij/rt-tools/commit/5fa21cd4616ecb5206ecd0a997b57f75fe1d039b)), closes [#3329](https://github.com/Eyhenij/rt-tools/issues/3329)
- **rt:agent-kit:** пары отказов, простой, переспросы и тупики в счётчике записи ([6c53b8e](https://github.com/Eyhenij/rt-tools/commit/6c53b8e27d19f00f5e75212367ce8745f242d8ac))
- **rt:agent-kit:** паттерны task-flow — указатель и холодная часть ([e07d31b](https://github.com/Eyhenij/rt-tools/commit/e07d31bc91344480e0804a074aa292efe30eba7b))
- **rt:agent-kit:** перед открытием PR все сделанные шаги меряются заново ([2fd4ea2](https://github.com/Eyhenij/rt-tools/commit/2fd4ea2e22f6acfe7b302f979581671b8d391995))
- **rt:agent-kit:** перемер читает строки замен проверок из последнего хода работы (RT-3446) ([2162ecc](https://github.com/Eyhenij/rt-tools/commit/2162ecc2c67c7a87452bda93bc1383936ff03e53))
- **rt:agent-kit:** пересказы doc-style и browser-verification, потери вернулись ([5f0cbed](https://github.com/Eyhenij/rt-tools/commit/5f0cbedb5653b5c6130dace53c887d178e6602c4))
- **rt:agent-kit:** пересчёт прошлых дней по сохранённым записям разговоров ([dd2c7d9](https://github.com/Eyhenij/rt-tools/commit/dd2c7d9beddac3b7134d9f63b669325ee71c66ab))
- **rt:agent-kit:** проверка выхода из хода спрашивает вердикт движка ([255244a](https://github.com/Eyhenij/rt-tools/commit/255244aeef34d2338dc2325bb69abd2188f66dba))
- **rt:agent-kit:** проверки пакета прогоняются на сохранённых настоящих данных ([5f564c2](https://github.com/Eyhenij/rt-tools/commit/5f564c25116db9bce0d5beb4db564a80ccc983b5))
- **rt:agent-kit:** проверки разговора заменены agent-хуками модели ([139ae2a](https://github.com/Eyhenij/rt-tools/commit/139ae2a059e3755004830361b4d576f231544705)), closes [#3276](https://github.com/Eyhenij/rt-tools/issues/3276)
- **rt:agent-kit:** прогноз отказов по записям разговоров — команда forecast ([ef90b3a](https://github.com/Eyhenij/rt-tools/commit/ef90b3a430689cbf8357ee5f7335f3a86993382f))
- **rt:agent-kit:** прогноз отпускает ожидание и называет самую длинную серию (RT-3418) ([bdc5d35](https://github.com/Eyhenij/rt-tools/commit/bdc5d35afa0379fee518849ea3711e7db49934d1))
- **rt:agent-kit:** раскладка пишет в настройку дерева записи двух модельных проверок (RT-3421) ([49c9799](https://github.com/Eyhenij/rt-tools/commit/49c979905132552046ce330dc61f5410f8f43b21))
- **rt:agent-kit:** решатель по таблице решений и rt_decide для хуков ([5c4372a](https://github.com/Eyhenij/rt-tools/commit/5c4372a65ab8618d10ba5e21437309c35ad72f27))
- **rt:agent-kit:** снимок ответов проб и переворот строк таблицы решений ([6188b4f](https://github.com/Eyhenij/rt-tools/commit/6188b4f7d92fa661ba6b8f1ef35499b9ffa9ab5d))
- **rt:agent-kit:** страж хода работы двигает сценарий только измерением ([9895c36](https://github.com/Eyhenij/rt-tools/commit/9895c36cd8a938b090a57a0bbb6e9ac11e83ca68))
- **rt:agent-kit:** строка вехи G в отчёте метрик ([ec07b19](https://github.com/Eyhenij/rt-tools/commit/ec07b193ac4bb4b616478ab38a8245b8b80f7b8e))
- **rt:agent-kit:** строка запуска шага набора несёт время, базу и предмет ([d1bdf0c](https://github.com/Eyhenij/rt-tools/commit/d1bdf0cefc6f059ad609892ea04876e1eb31df22))
- **rt:agent-kit:** строки результата работы в отчёте метрик ([8462d6a](https://github.com/Eyhenij/rt-tools/commit/8462d6ab248587a7a0b138c87e23e0ab2dd722fa))
- **rt:agent-kit:** строки таблицы решений несут полный текст отказа ([7de6f39](https://github.com/Eyhenij/rt-tools/commit/7de6f39179d22494a928a177183c568ff0aee738))
- **rt:agent-kit:** строки эпиков в отчёте метрик ([b2bf32a](https://github.com/Eyhenij/rt-tools/commit/b2bf32a6d7e0c525566b2fd6a6280146341edbe7))
- **rt:agent-kit:** судья записанных ходов работает без инструментов ([0b15d47](https://github.com/Eyhenij/rt-tools/commit/0b15d47ff9c1f3caba721a6fc96732274f81fb09))
- **rt:agent-kit:** судья хода не держит ругань без приказа и требует вывода на каждый факт ([74a8f43](https://github.com/Eyhenij/rt-tools/commit/74a8f43d949b4ab4a7b98ef77ed12e6318665db8))
- **rt:agent-kit:** судья хода читает короче и судит устойчиво (RT-3417) ([25750dc](https://github.com/Eyhenij/rt-tools/commit/25750dc281b6348c58c32ea5be214faa78d4b510))
- **rt:agent-kit:** сценарий task flow раскладывается каталогом ([65eb615](https://github.com/Eyhenij/rt-tools/commit/65eb61521d67fe89b4a05703fd5e72d7b2bce027))
- **rt:agent-kit:** счётчик записи разговора и пересобранный срез 13.11 ([90a9069](https://github.com/Eyhenij/rt-tools/commit/90a906938d268fc15e544155db7ab80d3bb74860))
- **rt:agent-kit:** счётчик подталкиваний, отказов и тупиков по записям разговоров ([361ac05](https://github.com/Eyhenij/rt-tools/commit/361ac05138a251ad6905212f6685acb0556fb027))
- **rt:agent-kit:** счётчик пропущенных концов хода после раскладки движка ([73cacfa](https://github.com/Eyhenij/rt-tools/commit/73cacfa58272df4881eb77cf1319a3a5cb9e309c))
- **rt:agent-kit:** тексты agent-хуков на конец хода и на вопрос владельцу ([3f2c015](https://github.com/Eyhenij/rt-tools/commit/3f2c0150d6ec74d2813de0e932fa3b10ca67f7fa)), closes [#3276](https://github.com/Eyhenij/rt-tools/issues/3276)
- **rt:agent-kit:** условия и данные описания task flow ([22654e0](https://github.com/Eyhenij/rt-tools/commit/22654e0f871ef699e952bf0cf8d255e7a675af6a)), closes [#3329](https://github.com/Eyhenij/rt-tools/issues/3329)
- **rt:agent-kit:** хук конца хода пишет события записи разговора наблюдениями ([435da62](https://github.com/Eyhenij/rt-tools/commit/435da622b036a6e2226f71e26299f57d5d9fe8e1))
- **rt:agent-kit:** хук меню пропускает меню отказа выхода и задерживает ослабление проверки ([b2d2470](https://github.com/Eyhenij/rt-tools/commit/b2d24708cbdd6337ecc87f922bc7a14e9cdbdcd9))
- **rt:agent-kit:** хук модели на Stop больше не судит открытую работу ([69d1d1e](https://github.com/Eyhenij/rt-tools/commit/69d1d1eaa798fa25ca61bb9ecb03a85edfd8e0dc))
- **rt:agent-kit:** хуки отправки и git решают по таблице ([404eda3](https://github.com/Eyhenij/rt-tools/commit/404eda370061568a695ec99d610dbe260aa6a653))
- **rt:agent-kit:** хуки хода работы решают по таблице ([74d7cc5](https://github.com/Eyhenij/rt-tools/commit/74d7cc5bd5e5f4480341e3b8ed1734abc7d245be))
- **rt:agent-kit:** числа результата работы в строке дня ([6a13182](https://github.com/Eyhenij/rt-tools/commit/6a1318215bb854b96e5ce60383687b647a548d74))
- **rt:agent-kit:** чтение слияний задач, эпиков и редакций пакетов ([e3a4659](https://github.com/Eyhenij/rt-tools/commit/e3a46595f9c8ab795802e7d6e6df2329c81579d2))
- **rt:agent-kit:** чтение слияний и редакций на машине со своей меткой ([66c5367](https://github.com/Eyhenij/rt-tools/commit/66c5367d3ee17bfcac8745ea403c121c77f1a988))
- **rt:agent-kit:** шаг плана несёт строку проверки ([58cdbae](https://github.com/Eyhenij/rt-tools/commit/58cdbae9e9f00415b24aaec9f31cd293a0af6fa6)), closes [#3329](https://github.com/Eyhenij/rt-tools/issues/3329)
- **rt:agent-kit:** шаг плана отмечает только движок ([7905131](https://github.com/Eyhenij/rt-tools/commit/7905131455a984461835dea8cf0740065758c83b))
- **rt:agent-kit:** шлюз правил кладёт правило в заход вместо отказа ([004f918](https://github.com/Eyhenij/rt-tools/commit/004f918ec4a9985e919960904649df47ade76368))
- **rt:agent-kit:** эпик копии и ветка вне сценария task flow ([431f542](https://github.com/Eyhenij/rt-tools/commit/431f5429adad6d50acc5300c8380d348bd840c6e)), closes [#3329](https://github.com/Eyhenij/rt-tools/issues/3329)

### Performance Improvements

- **rt:agent-kit:** перемер отмеченных шагов идёт параллельно и печатает итог ([507deeb](https://github.com/Eyhenij/rt-tools/commit/507deeb027b4c25e99437b94e378b5f2073a2b19))

## [0.37.1](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.37.0...rt-agent-kit%400.37.1) (2026-11-20)

**Метрика выпуска:** нет. Починен ложный отказ проверки библиотек

### Bug Fixes

- **rt:agent-kit:** аудит очереди считает отставание без отказа и называет PR без ревьюера ([ad86cea](https://github.com/Eyhenij/rt-tools/commit/ad86cea457330ae6748d401cf0eec5e75a98e533))
- **rt:agent-kit:** аудит очереди читает ревьюеров отдельным вызовом REST — не проверено ([6ef9a76](https://github.com/Eyhenij/rt-tools/commit/6ef9a76feefecf9a5ca5f184333c5e1a55faa801))
- **rt:agent-kit:** база набора перед push не зависит от устаревших ссылок и от сдвига веток на сервере ([aaa9299](https://github.com/Eyhenij/rt-tools/commit/aaa92994795aeb9ca51a783be12e281a6e66976d))
- **rt:agent-kit:** база набора перед push узнаёт свою копию по имени и не считает принесённое главной веткой ([69ee295](https://github.com/Eyhenij/rt-tools/commit/69ee295e030acbd93d85b9a96e9510ae6b2c1383))
- **rt:agent-kit:** ветка задачи сверяется со своей базой, а не с main ([938baee](https://github.com/Eyhenij/rt-tools/commit/938baeec6801143a8ec52522b59fb2479c3a6426))
- **rt:agent-kit:** ветка и план проверки берутся из копии, где лежит файл правки ([1eb19a7](https://github.com/Eyhenij/rt-tools/commit/1eb19a7a337e82b972110e6468ffdde27b1230f2))
- **rt:agent-kit:** граф правил читает все виды связей пакета, а отчёт не называет связанное несвязанным ([d7925c6](https://github.com/Eyhenij/rt-tools/commit/d7925c61e42dedcb4b2d8a2a3bddf65a2c381d2a))
- **rt:agent-kit:** допуска сверх предела времени нет ([dd39a21](https://github.com/Eyhenij/rt-tools/commit/dd39a219bc79088f2f9df5948dc255907e7de1b6))
- **rt:agent-kit:** линтер стилей не идёт на ветке без файлов стилей ([78b99c2](https://github.com/Eyhenij/rt-tools/commit/78b99c20ea82df7bb277042788d2df7db75e7bf9))
- **rt:agent-kit:** наблюдения агента во вложенных каталогах не входят в таблицу входов набора ([3bb56b0](https://github.com/Eyhenij/rt-tools/commit/3bb56b00ce99186c3e25b058661b76f8ab1419a9)), closes [#3304](https://github.com/Eyhenij/rt-tools/issues/3304)
- **rt:agent-kit:** наблюдения агента не входят в таблицу входов набора ([937715e](https://github.com/Eyhenij/rt-tools/commit/937715e683ae37afdbe9484e464a76a1cdde0c98)), closes [#3304](https://github.com/Eyhenij/rt-tools/issues/3304)
- **rt:agent-kit:** набор перед push считает ветку от ближайшей ветки сервера в её истории ([0c356e1](https://github.com/Eyhenij/rt-tools/commit/0c356e1be0b6b6de407f1b78a204ba7936088366))
- **rt:agent-kit:** набор перед отправкой не идёт на ветке без новых коммитов и без кода ([72d3fa6](https://github.com/Eyhenij/rt-tools/commit/72d3fa686ae76c485a7a9e358481422103b16fef))
- **rt:agent-kit:** набор сверх предела не проходит повтором, сценарии пакета идут по правке ([b2c2134](https://github.com/Eyhenij/rt-tools/commit/b2c2134dcbfc32daa695dce0c646dea80faf677c))
- **rt:agent-kit:** неотслеживаемый файл копии не отказывает пуш ([55e983c](https://github.com/Eyhenij/rt-tools/commit/55e983cf34e276818100130474eed3f62fc0f915))
- **rt:agent-kit:** образец папки задачи читают сценарии, упавший список файлов не даёт ключа отметки ([cae27cd](https://github.com/Eyhenij/rt-tools/commit/cae27cdb000383d9a6641cb053e163c2ac5b74b9))
- **rt:agent-kit:** отправка дольше предела всего набора валит отправку ([42667bd](https://github.com/Eyhenij/rt-tools/commit/42667bd545941105c5bdf654fd2bbe81368c7ee0))
- **rt:agent-kit:** правка обвязки снимков и тестов кита не поднимает снимки и сквозные наборы ([3914e7e](https://github.com/Eyhenij/rt-tools/commit/3914e7eacd1d340118a1d1bcfd5835a7b0a07021))
- **rt:agent-kit:** правка одних файлов сценариев пакета гонит только эти файлы ([5b93a19](https://github.com/Eyhenij/rt-tools/commit/5b93a19a4f141fcc4829fc2c96a48ad076b81769))
- **rt:agent-kit:** правки второго круга ревью семьи закона о ведении работы ([53cd336](https://github.com/Eyhenij/rt-tools/commit/53cd336d081501167eb347ded1fa076052633e78))
- **rt:agent-kit:** правки второго круга ревью семьи закона о документации ([54fcfa5](https://github.com/Eyhenij/rt-tools/commit/54fcfa5312612cfb0670dc771b67a5a7ee88ac84))
- **rt:agent-kit:** правки второго круга ревью семьи закона о поставке ([da5ef17](https://github.com/Eyhenij/rt-tools/commit/da5ef1785932e9d79ade99de921d6e15582c56aa))
- **rt:agent-kit:** правки второго круга ревью уборки кэша сборщика и проверки зависимостей ([8211632](https://github.com/Eyhenij/rt-tools/commit/8211632bd27f134cf088dfb4e733cbbb8cac298d))
- **rt:agent-kit:** правки первого круга ревью семьи закона о ведении работы ([fad2278](https://github.com/Eyhenij/rt-tools/commit/fad2278c1339c9ff007d147c9a8d37f1190700cb)), closes [#3221](https://github.com/Eyhenij/rt-tools/issues/3221)
- **rt:agent-kit:** правки первого круга ревью семьи закона о документации ([786f6a0](https://github.com/Eyhenij/rt-tools/commit/786f6a0b69cd232cfd6a2cf6416501374733bbd2))
- **rt:agent-kit:** правки первого круга ревью семьи закона о поставке ([230dcb5](https://github.com/Eyhenij/rt-tools/commit/230dcb5ed241ead145b5e21289cbeaa4bb35214c))
- **rt:agent-kit:** правки первого круга ревью уборки кэша сборщика и проверки зависимостей ([5868f49](https://github.com/Eyhenij/rt-tools/commit/5868f49c0b4e61b2a4eec66d5b070c53f3b20500))
- **rt:agent-kit:** проба набора перед пушем ждёт пустой набор для конвейера и пакета без потребителей ([e52109a](https://github.com/Eyhenij/rt-tools/commit/e52109afebace2592cd17d86b460aa7602048d08)), closes [#3387](https://github.com/Eyhenij/rt-tools/issues/3387)
- **rt:agent-kit:** проверка библиотек принимает запуск тестов сборщиком Angular (RT-3450) ([60805df](https://github.com/Eyhenij/rt-tools/commit/60805df789f5231eaaac3714466a79cbd36e62fa))
- **rt:agent-kit:** проверка конца хода снова в пределе длины файла ([8d6da5c](https://github.com/Eyhenij/rt-tools/commit/8d6da5cf361d1c7b72f7cc8a70bfdf700593a48d))
- **rt:agent-kit:** проверка конца эпика засчитывает согласие владельца на задачу без повтора ([0dcad0b](https://github.com/Eyhenij/rt-tools/commit/0dcad0bdaafa0ef1e406c16c9fcc72fa57e7c6e2))
- **rt:agent-kit:** проверка плана во второй рабочей копии судит эту копию ([3aeeffc](https://github.com/Eyhenij/rt-tools/commit/3aeeffcfc2418a010b9ecb86db0e8f6dcc7193e3))
- **rt:agent-kit:** проверки дерева не заходят в каталог графа кода ([9e4611d](https://github.com/Eyhenij/rt-tools/commit/9e4611d282f45ef06615816cbf686cec49c078ce))
- **rt:agent-kit:** роль без инструментов правки заканчивает ход отчётом ([bd02ffa](https://github.com/Eyhenij/rt-tools/commit/bd02ffa19d1111c17fe3ba12cc5ff9539a8c722d)), closes [#3140](https://github.com/Eyhenij/rt-tools/issues/3140)
- **rt:agent-kit:** сборка выкатки убирает кэш сборщика, у правила о зависимостях появилась проверка ([5ca2e60](https://github.com/Eyhenij/rt-tools/commit/5ca2e60cce1f7ae258a7e0aa008dfee8179b0cc2)), closes [#3220](https://github.com/Eyhenij/rt-tools/issues/3220)
- **rt:agent-kit:** сверка очереди считает отставание задачи от её базы, привязки поставки сверены с кодом ([a4288ae](https://github.com/Eyhenij/rt-tools/commit/a4288aea16962a6691af65da3f1f65a5f0db9f2d))
- **rt:agent-kit:** согласие владельца читается по вопросу меню, отказ — по каждой строке ([e588adb](https://github.com/Eyhenij/rt-tools/commit/e588adbeaf532f891ec956d70e329cfd03a768c7))
- **rt:agent-kit:** согласие на задачу требует слова о её создании, а не слова «задача» ([35821ec](https://github.com/Eyhenij/rt-tools/commit/35821ec81c0cdf96f5fd252304304c082d20bf33))
- **rt:agent-kit:** спеки не считаются текстом вне сборщика, выход «ничего нового» — только для текущей ветки ([46ce01e](https://github.com/Eyhenij/rt-tools/commit/46ce01ec035505033076e782945fb83fe11468d6))
- **rt:agent-kit:** таблица входов набора не зависит от файлов вне истории ([7378683](https://github.com/Eyhenij/rt-tools/commit/73786836ffe7ec3917129bc9757653bcbcaa10a2))
- **rt:agent-kit:** таблица входов не зависит от платформы и чужих настроек git ([e0a0d80](https://github.com/Eyhenij/rt-tools/commit/e0a0d8063b31311ffdc002542f7f302224ecb019))
- **rt:agent-kit:** текстовый коммит поверх проверенного кода не гонит шаги сборщика заново ([b3c014f](https://github.com/Eyhenij/rt-tools/commit/b3c014facba58c15a726b7ab96a286726b85b103))
- **rt:agent-kit:** файл чтения роли получил право на исполнение ([4e45259](https://github.com/Eyhenij/rt-tools/commit/4e45259d67c8c3ae3f0fa17da2504b59757bd574))
- **rt:agent-kit:** хвосты ревизии семьи о ведении работы, найденные ролями ([858d5cc](https://github.com/Eyhenij/rt-tools/commit/858d5cc31a1962f44b5f1a3b848bd61f8126d930))
- **rt:agent-kit:** шаг набора дольше своего замера валит отправку ([828d34a](https://github.com/Eyhenij/rt-tools/commit/828d34ad0192c0b00fe98c7173a24e825b4a5fb5))
- **rt:agent-kit:** явный отказ в меню не читается как согласие, аудит проверен на хостинге ([d72cb21](https://github.com/Eyhenij/rt-tools/commit/d72cb21e0aeb6409c769ce2396489f14cfeb2709))

### Features

- **rt:agent-kit:** граф понятий и правил пакета и его отчёт ([1348d6d](https://github.com/Eyhenij/rt-tools/commit/1348d6d5d8e082936a0d015099d22ad273dce8f8))
- **rt:agent-kit:** шаг набора идёт, только если правка задевает то, что он читает ([761fada](https://github.com/Eyhenij/rt-tools/commit/761fadaa76b333a82f2a41f06b21ad3f9b35cc82))

### Performance Improvements

- **rt:agent-kit:** сценарии пакета правил идут параллельно — 264 с вместо 1018 ([78b42e0](https://github.com/Eyhenij/rt-tools/commit/78b42e0bb5e0849712c3bf818748a8539e51877f))
- **rt:agent-kit:** сценарии хуков больше не гоняются второй раз из Jest ([37728ee](https://github.com/Eyhenij/rt-tools/commit/37728ee87d1b4d6497b8f0cf63ee094209c3abdc))
- **rt:agent-kit:** сценарий заведения эпика не ждёт доску по 30 с, .prettierignore не поднимает тяжёлые шаги ([0ada8e4](https://github.com/Eyhenij/rt-tools/commit/0ada8e46132e434169f08ccf798533ee55a14555))
- **rt:agent-kit:** шаг nx verify не идёт на правке текстов, хуков, пакета правил и tools ([89da9b8](https://github.com/Eyhenij/rt-tools/commit/89da9b8a13df618f7b6ef2e7f57ef20b1ab37f29))

# [0.37.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.36.0...rt-agent-kit%400.37.0) (2026-11-11)

**Метрика выпуска:** нет. Новая статья и паттерн для деревьев с графом кода, отчёты пакета не считают, открывал ли ход граф

### Bug Fixes

- **rt:agent-kit:** статья о графе кода короче, паттерн называет связи как инструмент ([6615e53](https://github.com/Eyhenij/rt-tools/commit/6615e53ed6eaf9f96f6d72b490ec577c11410979))
- **rt:agent-kit:** шаг графа кода задан свойством, разница читается до ответа ([95a482b](https://github.com/Eyhenij/rt-tools/commit/95a482b0098932f99faaa53bb4145f6b4f03a9f6))

### Features

- **rt:agent-kit:** разведка в дереве с графом кода начинается с графа ([d5e9ad4](https://github.com/Eyhenij/rt-tools/commit/d5e9ad4fd41dd47829a1d2c0c375e11566e9765f))
- **rt:agent-kit:** статья о графе кода называет свойство graph ([ec162af](https://github.com/Eyhenij/rt-tools/commit/ec162af0245aea849ab648cc238cc5574a144bf5))
- **rt:agent-kit:** статья о графе кода сверяет граф перед первой разведкой хода ([119df4f](https://github.com/Eyhenij/rt-tools/commit/119df4fdb9147ef4236bb7dfea5b4ff5c99d5c11))

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
