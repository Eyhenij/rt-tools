## [Unreleased]

### Features

- **rt:agent-kit:** запись одного дня 24.11 проверяется по точкам: ночь без меню, одобрение плана после ролей, Esc и слова владельца после него, `Monitor` по своему фоновому. Выпуск кита гоняет этот набор и записанные ходы на собранном издании до коммита версии (RT-3594)
- **rt:agent-kit:** судья вопросов пускает вопрос о влитии ветки задачи, названной ключом, и держит влитие, которое снимает проверку, пропускает роли, обходится без действия владельца, дописывает своё снятие или отдаёт работу при готовом ходе. Повтор записанных ходов судьёй берёт пары одного хука (`--key ask`), модель (`--model`), ждёт вызов 90 с и один раз повторяет вызов за пределом, пустой ответ или ответ без вердикта; запуск без пар и флаг без значения дают код 1 (RT-3584)

# [0.42.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.41.1...rt-agent-kit%400.42.0) (2026-11-27)

**Метрика выпуска:** нет. Метрика эпика RT-3693 — обращения к владельцу на задачу, её считает команда owner:touches, в списке метрик выпуска её нет

### Bug Fixes

- **rt:agent-kit:** исполнитель сливает одной формой команды, иное слияние вне кавычек отбито после второго круга ревью (RT-3701) ([df17cd3](https://github.com/Eyhenij/rt-tools/commit/df17cd35c7dbe1611b576a0a9760a5865d03dfc4))
- **rt:agent-kit:** кавычки вокруг merge не прячут слияние, heredoc не судится, gh alias в границах (RT-3701) ([ebdf665](https://github.com/Eyhenij/rt-tools/commit/ebdf665e2a50bb4761256ce523eb0c72f67afb6b))
- **rt:agent-kit:** копии продолженной сессии и одной миллисекунды считаются один раз после первого круга ревью (RT-3696) ([a9807c8](https://github.com/Eyhenij/rt-tools/commit/a9807c8d912b9749e90d6c7525fde54f0ffbb1eb))
- **rt:agent-kit:** слова одной миллисекунды и копии на другой ветке считаются верно после второго круга ревью (RT-3696) ([eec7b68](https://github.com/Eyhenij/rt-tools/commit/eec7b689d42ccaf4420b29aa40099ca872b6851b))
- **rt:agent-kit:** сообщение посреди хода, повторённое записью, считается один раз (RT-3696) ([3ad9519](https://github.com/Eyhenij/rt-tools/commit/3ad95193d5f6ddafdd539a26faddfb1e48b490e4))
- **rt:agent-kit:** хук судит каждое слияние команды — полный путь, обёртка, номер после ключей, токен после первого круга ревью (RT-3701) ([6082a64](https://github.com/Eyhenij/rt-tools/commit/6082a64fcfb36d54ae086ca158d2454df1a7741b))

### Features

- **rt:agent-kit:** вид набранного сообщения, второй запуск хука не пишет строки повторно (RT-3696) ([e088d47](https://github.com/Eyhenij/rt-tools/commit/e088d4748198a6466a7c3e5c351d2d3f9d715d6f))
- **rt:agent-kit:** хук слияния знает базу PR и адрес автора, слияние в main — кнопка владельца (RT-3701) ([6864829](https://github.com/Eyhenij/rt-tools/commit/68648298edf72ef4c6f65b0830e93b3d457c74f1))

## [0.41.1](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.41.0...rt-agent-kit%400.41.1) (2026-11-26)

**Метрика выпуска:** нет. Исправление проверки хода работы при слиянии проверенной базы (RT-3691)

### Bug Fixes

- **rt:agent-kit:** выбор стороны при слиянии после второго круга ревью (RT-3691) ([c61bdab](https://github.com/Eyhenij/rt-tools/commit/c61bdab080a0a7b665e11516103e542407374a6d))
- **rt:agent-kit:** выбор стороны при слиянии после первого круга ревью (RT-3691) ([aa670ee](https://github.com/Eyhenij/rt-tools/commit/aa670ee5482032544065df1f454b4398c99e550a))

### Features

- **rt:agent-kit:** при слиянии проверенной базы проверка хода работы пропускает выбор стороны в блоке конфликта ([8b3ed7c](https://github.com/Eyhenij/rt-tools/commit/8b3ed7cd3e2873a56ff9f24fc06bb1bb68247211))

# [0.41.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.40.0...rt-agent-kit%400.41.0) (2026-11-26)

**Метрика выпуска:** минут впустую, вниз

### Bug Fixes

- **rt:agent-kit:** вопрос о PR до набора после второго круга ревью (RT-3628) ([5e12910](https://github.com/Eyhenij/rt-tools/commit/5e12910aa24794a031582bf40e999d1823691f77))
- **rt:agent-kit:** готовность PR до набора после первого круга ревью (RT-3628) ([5e3232c](https://github.com/Eyhenij/rt-tools/commit/5e3232cabe9595e4fe67d0987ab49d48b1079640))
- **rt:agent-kit:** единственная задача разбора после второго круга ревью (RT-3627) ([0276f6f](https://github.com/Eyhenij/rt-tools/commit/0276f6f2c202f87fe0a8b2872ac2df5e72236e08))
- **rt:agent-kit:** единственная задача разбора после первого круга ревью (RT-3627) ([d3ebc2b](https://github.com/Eyhenij/rt-tools/commit/d3ebc2bd841a6609e818baa2c4e4e0260bd7e7a9))
- **rt:agent-kit:** карточка, которой хостинг не знает, основу не судит (RT-3628) ([e21cef2](https://github.com/Eyhenij/rt-tools/commit/e21cef278362a366804cb78bfaa8ec14d03fae37))
- **rt:agent-kit:** ловушка пробы стража после первого круга ревью (RT-3683) ([f31393e](https://github.com/Eyhenij/rt-tools/commit/f31393e3759603ef25c97257cd04196a92a12df4))
- **rt:agent-kit:** набор рядом со вторым кругом после второго круга ревью (RT-3630) ([db9d4ab](https://github.com/Eyhenij/rt-tools/commit/db9d4ab83603d1266cc8fb8cb1ebae9b0db88299))
- **rt:agent-kit:** набор рядом со вторым кругом после первого круга ревью (RT-3630) ([0c48388](https://github.com/Eyhenij/rt-tools/commit/0c483881365bed97619a048937b338a7b4765cf8))
- **rt:agent-kit:** пробы стража dev-server-guard не зависят от скорости машины (RT-3683) ([07c74cf](https://github.com/Eyhenij/rt-tools/commit/07c74cf6f211771c1449282913c1a0e9ddbb0186))
- **rt:agent-kit:** путь ревью правки после второго круга ревью (RT-3626) ([941fc59](https://github.com/Eyhenij/rt-tools/commit/941fc59e676719c2b48093e0e241390b991fa578))
- **rt:agent-kit:** путь ревью правки после первого круга ревью (RT-3626) ([e218849](https://github.com/Eyhenij/rt-tools/commit/e21884966e71e0985abbb448bc1b166ba2cdf706))
- **rt:agent-kit:** слияние main в эпик укладывается в пределы длины (RT-3676) ([4823b70](https://github.com/Eyhenij/rt-tools/commit/4823b70aced0ac8d367ed111538f5e052eaff74f))
- **rt:agent-kit:** этап и архивная запись после второго круга ревью (RT-3631) ([3f2b086](https://github.com/Eyhenij/rt-tools/commit/3f2b08663261fbaf4aa5c3398ea5388f23f1b1e2))
- **rt:agent-kit:** этап и архивная запись после первого круга ревью (RT-3631) ([72d6a60](https://github.com/Eyhenij/rt-tools/commit/72d6a60d845adbff291bfc411e828e7fd8659c97))

### Features

- **rt:agent-kit:** ветка с одним кругом ревью получает строку времени по шагам (RT-3626) ([762376f](https://github.com/Eyhenij/rt-tools/commit/762376f99e6134ce09148735b1aa8ca678765ffe))
- **rt:agent-kit:** движок ведёт работу вне эпика дальше второго шага (RT-3627) ([4aaa89b](https://github.com/Eyhenij/rt-tools/commit/4aaa89b8acb96d1e03b22911abac00dee65df9ac))
- **rt:agent-kit:** единственная задача разбора заводится без эпика (RT-3627) ([d0ef55f](https://github.com/Eyhenij/rt-tools/commit/d0ef55f0c5c93e3f3084aee9ce95e8a602cc0999))
- **rt:agent-kit:** защиты знают единственную задачу разбора (RT-3627) ([b12263d](https://github.com/Eyhenij/rt-tools/commit/b12263d450456a516de5b2f442fc66abb37b40a6))
- **rt:agent-kit:** лёгкому плану одобрение даётся без вызова ролей (RT-3626) ([485183d](https://github.com/Eyhenij/rt-tools/commit/485183df8b02b479e654a7666b4b4ffdf8824139))
- **rt:agent-kit:** набор не начинается, пока PR не откроется (RT-3628) ([493ceb1](https://github.com/Eyhenij/rt-tools/commit/493ceb16dc4031303eee609759778cca256cc50a))
- **rt:agent-kit:** набор рядом со вторым кругом, честный итог и снятие запуска (RT-3630) ([8e12fcf](https://github.com/Eyhenij/rt-tools/commit/8e12fcf397b51091af2df3771af8bf35f4e753c2))
- **rt:agent-kit:** этап плана меряется и отмечается одним вызовом (RT-3631) ([50f656a](https://github.com/Eyhenij/rt-tools/commit/50f656a79259a86d1ad391aca2c2f31800c379b3))

# [0.40.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.39.1...rt-agent-kit%400.40.0) (2026-11-25)

**Метрика выпуска:** принято с первого раза, вверх

### Bug Fixes

- **rt:agent-kit:** защита слога, узнавание записи и заведение эпика после второго круга ревью (RT-3589) ([881d864](https://github.com/Eyhenij/rt-tools/commit/881d864405f6bdadf42a8632205d69837870ac17))
- **rt:agent-kit:** защиты, движок шагов и заведение эпика после первого круга ревью (RT-3589) ([b1d4c65](https://github.com/Eyhenij/rt-tools/commit/b1d4c65254dd9ca34443ac37b13ef8d5322586f5))
- **rt:agent-kit:** защиты, проверки и тексты после первого круга ревью (RT-3607) ([7d408e1](https://github.com/Eyhenij/rt-tools/commit/7d408e198b1a83197b4eda6d8759608001bc3c5c))
- **rt:agent-kit:** защиты, слияние и тексты после второго круга ревью (RT-3607) ([b296e2a](https://github.com/Eyhenij/rt-tools/commit/b296e2a49297103e3ed7a354ba42aea3dcd90050))
- **rt:agent-kit:** защиты, статьи и скрипты дерева по оставшимся находкам эпика (RT-3607) ([04168c4](https://github.com/Eyhenij/rt-tools/commit/04168c420df5f93f0d65e660aebf867fb142e6ed))
- **rt:agent-kit:** измерение зацепления после второго круга ревью (RT-3609) ([82b39ae](https://github.com/Eyhenij/rt-tools/commit/82b39ae2a2c57510859f2ecaa2b91cd1a3802430))
- **rt:agent-kit:** измерение зацепления после первого круга ревью (RT-3609) ([47939f3](https://github.com/Eyhenij/rt-tools/commit/47939f31ec99d37fb73b6c4416fd7a60b6b8c1d5))
- **rt:agent-kit:** мерило «Решения» после второго круга ревью (RT-3611) ([5efd92e](https://github.com/Eyhenij/rt-tools/commit/5efd92e00a03400391dde563643cf9273db02b32))
- **rt:agent-kit:** мерило «Решения» после первого круга ревью (RT-3611) ([590c7c0](https://github.com/Eyhenij/rt-tools/commit/590c7c06dff825b3634431dcc6ef18b2da9d21b6))
- **rt:agent-kit:** мерило «Решения» после третьего круга ревью (RT-3611) ([c9e9a55](https://github.com/Eyhenij/rt-tools/commit/c9e9a558e5f63f7e39fde2c4c64cd356f4b5dc40))
- **rt:agent-kit:** правило проектирования после второго круга ревью (RT-3608) ([096e776](https://github.com/Eyhenij/rt-tools/commit/096e7763f421a0597fe91f2c15fae8d4fcce45f6))
- **rt:agent-kit:** правило проектирования после первого круга ревью (RT-3608) ([713e896](https://github.com/Eyhenij/rt-tools/commit/713e89605c0c32f177f127ab8e0dcc093b8c319e))
- **rt:agent-kit:** правки после второго круга ревью (RT-3587) ([22137b3](https://github.com/Eyhenij/rt-tools/commit/22137b34b6c7923cba1699ac191e4076acf48426))
- **rt:agent-kit:** правки после первого круга ревью (RT-3587) ([60f710a](https://github.com/Eyhenij/rt-tools/commit/60f710aaaa84afcfc56eba404499588b547c9491))
- **rt:agent-kit:** признак копии, превышения и коммиты задачи после второго круга ревью (RT-3612) ([ae0013e](https://github.com/Eyhenij/rt-tools/commit/ae0013e3217b97866ee311966f4ce23a0997c529))
- **rt:agent-kit:** проверка состава набора читает профиль с корнем своего дерева (RT-3612) ([bd84ff2](https://github.com/Eyhenij/rt-tools/commit/bd84ff26f77a9accfe707aed846d5f4cc5a9abaf))
- **rt:agent-kit:** разбор зацепления отдельным модулем и ответ роли на новом тексте после третьего круга ревью (RT-3612) ([ea0861f](https://github.com/Eyhenij/rt-tools/commit/ea0861f3baf9aa9e048c2feb29d03a9e332df348))
- **rt:agent-kit:** разбор цели записи после второго круга ревью (RT-3615) ([3f8326c](https://github.com/Eyhenij/rt-tools/commit/3f8326c74c539d75f9df983f54f7bedf8d4f9f19))
- **rt:agent-kit:** разбор цели записи после первого круга ревью (RT-3615) ([1cfcf1c](https://github.com/Eyhenij/rt-tools/commit/1cfcf1c5d49cea47d2ff19113f15e813aa099f4d))
- **rt:agent-kit:** разбор цели записи после чтения плана ролями (RT-3615) ([10e48f8](https://github.com/Eyhenij/rt-tools/commit/10e48f8056599d1c1a7c5bcd82ea4cf73453727a))
- **rt:agent-kit:** раздел «Решение» после второго круга ревью (RT-3610) ([c64a23f](https://github.com/Eyhenij/rt-tools/commit/c64a23f903965ee23215930007095c8e989a408e))
- **rt:agent-kit:** раздел «Решение» после первого круга ревью (RT-3610) ([01f2dc9](https://github.com/Eyhenij/rt-tools/commit/01f2dc9e6c4162a471f9c25ff69ab65683fa056a))
- **rt:agent-kit:** роль, конвейер и команда после первого круга ревью (RT-3612) ([8512d92](https://github.com/Eyhenij/rt-tools/commit/8512d927118b1de2b4a32804ae9e3013926c5f83))
- **rt:agent-kit:** снятие бюджета не снимает удалённого места того же файла (RT-3611) ([8d413cb](https://github.com/Eyhenij/rt-tools/commit/8d413cbc0e8476facc1c3ce0894cc5711ace072a))
- **rt:agent-kit:** цель записи читает один разбор (RT-3615) ([72a819d](https://github.com/Eyhenij/rt-tools/commit/72a819d28fea6e2600aa6925eb376406d76a0f3d))

### Features

- **rt:agent-kit:** до границы ночи защиты дают умолчание вместо окна (RT-3587) ([d63f8c9](https://github.com/Eyhenij/rt-tools/commit/d63f8c97fa3562845a3ae41c871b6fad1eaed8d8))
- **rt:agent-kit:** зацепление модулей измеряется, а новый цикл, обход входа и рост отказаны (RT-3609) ([4b3735a](https://github.com/Eyhenij/rt-tools/commit/4b3735ac77f05dd5f4655dd1ab0624b407d678ff))
- **rt:agent-kit:** защиты и проверки пакета по находкам ревью эпика Angular Doctor (RT-3589) ([600f5d2](https://github.com/Eyhenij/rt-tools/commit/600f5d2eacdd84de2f9984845b8d7644019ca993))
- **rt:agent-kit:** мерило сравнивает код вершины с «Решением» плана (RT-3611) ([ff126de](https://github.com/Eyhenij/rt-tools/commit/ff126dea456e21162be31d3db60b1e98c7ee8397))
- **rt:agent-kit:** план без раздела «Решение» не записывается и не одобряется (RT-3610) ([ce15297](https://github.com/Eyhenij/rt-tools/commit/ce1529760c11a5baaa1612b20aea8bb14e5de18c))
- **rt:agent-kit:** правило проектирования кода и таблица приёмов (RT-3608) ([f339749](https://github.com/Eyhenij/rt-tools/commit/f339749b319e38818bad223e12a54cbce9fb3479))
- **rt:agent-kit:** правило проектирования приходит на разборе, плане и коде (RT-3608) ([e609f4a](https://github.com/Eyhenij/rt-tools/commit/e609f4a89bbe2b56a127557906a8d9fc1504f42c))
- **rt:agent-kit:** ревью смотрит структуру кода, команда считает переделки (RT-3612) ([afab7a9](https://github.com/Eyhenij/rt-tools/commit/afab7a992f2e0352bf00a01f6af254b25fca5a44))

### Performance Improvements

- **rt:agent-kit:** мерило «Решения» считает один раз на вершину и читает меньше версий (RT-3611) ([78d2be2](https://github.com/Eyhenij/rt-tools/commit/78d2be26ebff347da87f661c0caac32b608f9b9e))

### Reverts

- Revert "fix(rt:agent-kit): проверка состава набора читает профиль с корнем своего дерева (RT-3612)" ([aa8f225](https://github.com/Eyhenij/rt-tools/commit/aa8f225c43ba099d9193c99135db7a9f49b57b3c))

## [0.39.1](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.39.0...rt-agent-kit%400.39.1) (2026-11-24)

**Метрика выпуска:** отказов проверок turn-exit-guard, вниз

### Bug Fixes

- **rt:agent-kit:** одобрение плана засчитывается одним правилом для меню и чата (RT-3535) ([d02a15c](https://github.com/Eyhenij/rt-tools/commit/d02a15cda7790bc70565709e8b26050cf03456ec))
- **rt:agent-kit:** правило одобрения после второго круга ревью (RT-3535) ([9bdb778](https://github.com/Eyhenij/rt-tools/commit/9bdb7789d7994ef336227b32c978174b5b272f62))
- **rt:agent-kit:** правило одобрения после первого круга ревью (RT-3535) ([d1fdf5b](https://github.com/Eyhenij/rt-tools/commit/d1fdf5bd411f4d5322c37bc2d17bd0d11fc0a120))
- **rt:agent-kit:** правки после второго круга ревью (RT-3585) ([fae3527](https://github.com/Eyhenij/rt-tools/commit/fae352780f560d50629d3c017f658de6a7be80e9))
- **rt:agent-kit:** правки после первого круга ревью (RT-3585) ([1ba81b0](https://github.com/Eyhenij/rt-tools/commit/1ba81b0d5bc36593e1b717ce290d938762dad4e3))
- **rt:agent-kit:** проверка путей пропускает черновик под игнором и с кириллическим именем (RT-3528) ([b121994](https://github.com/Eyhenij/rt-tools/commit/b1219943cd641cefa09675330650628db9d207f5))
- **rt:agent-kit:** сборка графов удаляет graph.html (RT-3585) ([85816de](https://github.com/Eyhenij/rt-tools/commit/85816de2466ef97b0e84742eb5bcdd30db5ad974))
- **rt:agent-kit:** слово остановки владельца снова отпускает ход (RT-3592) ([f934719](https://github.com/Eyhenij/rt-tools/commit/f9347197da89a79100451ccea929da0c2b7c6bfe))
- **rt:agent-kit:** судья вопросов после второго круга ревью (RT-3591) ([ca608a7](https://github.com/Eyhenij/rt-tools/commit/ca608a79ca801e68ca12711f7389d89d64ea8d92))
- **rt:agent-kit:** судья вопросов после первого круга ревью (RT-3591) ([73abdd2](https://github.com/Eyhenij/rt-tools/commit/73abdd2fa7a4e53ce96acab66f048bc79c5c0b73))
- **rt:agent-kit:** судья вопросов пускает план эпика и держит приписанное действие после второго круга ревью (RT-3591) ([d756b3e](https://github.com/Eyhenij/rt-tools/commit/d756b3efbf6008130cf7f9baa39a8d5c2c043f9e))
- **rt:agent-kit:** судья вопросов пускает решение владельца, даже если оно меняет проверку (RT-3591) ([e1bcc44](https://github.com/Eyhenij/rt-tools/commit/e1bcc44ae96638e70a3e420cff69dff1e3197035))
- **rt:agent-kit:** сценарии не зависят от временного каталога машины (RT-3585) ([91dd620](https://github.com/Eyhenij/rt-tools/commit/91dd6209e3cacbb2e00ccbe29f58dc2c34f99f97))
- **rt:agent-kit:** сценарии стража выхода из хода не читают общую временную папку машины (RT-3528) ([544b67d](https://github.com/Eyhenij/rt-tools/commit/544b67d5ed3d561e3003f77a19f6ae5f30f2a7c4))
- **rt:ui-kit-v2:** правки после второго круга ревью (RT-3478) ([7e1ab5a](https://github.com/Eyhenij/rt-tools/commit/7e1ab5a9b9c41b2e988fb774ab3e9e2e1766357b))

# [0.39.0](https://github.com/Eyhenij/rt-tools/compare/rt-agent-kit%400.38.0...rt-agent-kit%400.39.0) (2026-11-23)

**Метрика выпуска:** отказов проверок turn-exit-guard, вниз

### Bug Fixes

- **rt:agent-kit:** «стоп» требует слежения за идущим запуском CI (RT-3467) ([4c2562a](https://github.com/Eyhenij/rt-tools/commit/4c2562a5c02d6e6297bad5c027c841d62b6d3a9f))
- **rt:agent-kit:** tee, оставленная папка и бюджет второго прогона — правки после второго круга ревью (RT-3434) ([d00c7fc](https://github.com/Eyhenij/rt-tools/commit/d00c7fcfbe6c108d87f6a7d65822a8d67eb6109d))
- **rt:agent-kit:** база набора перед отправкой — только ветки, которые держит хостинг (RT-3465) ([fe0fdde](https://github.com/Eyhenij/rt-tools/commit/fe0fdde1f145dab7a361829e6b47ff28f684a361))
- **rt:agent-kit:** более новая node той же версии, комментарии в .nvmrc, git-хук без node — правки после первого круга ревью (RT-3466) ([095b3a1](https://github.com/Eyhenij/rt-tools/commit/095b3a1bdc14ab31a5da937a8644c7a1fe479b3c))
- **rt:agent-kit:** ветка эпика с копией задачи остаётся базой набора (RT-3426) ([0399aff](https://github.com/Eyhenij/rt-tools/commit/0399affb8916a45a1deed762469f05e256ddf85a))
- **rt:agent-kit:** ветка, принявшая эту слиянием сессии, не база — правки после первого круга ревью (RT-3426) ([c4b164a](https://github.com/Eyhenij/rt-tools/commit/c4b164a0da94d90fa0181bfd0a0c250924a5145e))
- **rt:agent-kit:** влитая база со старой папкой не откатывает разобранную задачу (RT-3425) ([8811234](https://github.com/Eyhenij/rt-tools/commit/88112341194802728caa1bc925d96b2be2ac57b3))
- **rt:agent-kit:** возврат папки, второй прогон и отказы с номером шага — правки после первого круга ревью (RT-3434) ([67d2985](https://github.com/Eyhenij/rt-tools/commit/67d29852bfc2d542aa066e11eaf0021f440a65b1))
- **rt:agent-kit:** все родители слияния хоста, случай строки continue — правки после проверки второго круга свежим QA (RT-3426) ([7ebc1c0](https://github.com/Eyhenij/rt-tools/commit/7ebc1c0f028db13b26cca05bcd5e576e1688e051))
- **rt:agent-kit:** выбор удаления среди всех кандидатов — правки после первого круга ревью (RT-3425) ([4c17062](https://github.com/Eyhenij/rt-tools/commit/4c170622f1024b80bc978d57bac33dc344fb7c4f))
- **rt:agent-kit:** девять длинных правил помещаются в выдачу проверки правил — 43 строки пробы из 43 (RT-3427) ([98fe08d](https://github.com/Eyhenij/rt-tools/commit/98fe08dfccf1455e3f927c668a45cd4e6abe6257))
- **rt:agent-kit:** закреплённая ссылка базы названа числом, та же база после переписанного коммита — правки после второго круга ревью (RT-3465) ([045eb59](https://github.com/Eyhenij/rt-tools/commit/045eb59d3679545ccba81aa677b46a3aadcaed3c))
- **rt:agent-kit:** запись базы своя у ветки и подходит голове над записанной — правки после первого круга ревью (RT-3465) ([94e5491](https://github.com/Eyhenij/rt-tools/commit/94e5491246c75301155b0248eb6d4247e9f7c3ed))
- **rt:agent-kit:** имена отказов, веха и проверка шагов — правки после первого круга ревью (RT-3423) ([468aa23](https://github.com/Eyhenij/rt-tools/commit/468aa2395531b9e012cabe2f37d439e9f1f014db))
- **rt:agent-kit:** копия сессии из входа хука и правило плана о черновиках — правки после второго круга ревью (RT-3468) ([9dbdad4](https://github.com/Eyhenij/rt-tools/commit/9dbdad497827d61b72d7d50562d08573c296a73d))
- **rt:agent-kit:** ожидание своей фоновой задачи держится до 90 минут, зависшая задача названа (RT-3419) ([436565e](https://github.com/Eyhenij/rt-tools/commit/436565eea203c1b1660951336c647e4567842e5c))
- **rt:agent-kit:** отказ без решателя в проверке отправки, сравнение версий числами — правки после второго круга ревью (RT-3466) ([0b14790](https://github.com/Eyhenij/rt-tools/commit/0b147903f7f76de6232594a2efbc172f20556e24))
- **rt:agent-kit:** отказ проверки отправки без решателя несёт общий хвост — правка после набора перед отправкой (RT-3466) ([de42c3f](https://github.com/Eyhenij/rt-tools/commit/de42c3f9251e4a487870d43da2c0dac7bc1d0f99))
- **rt:agent-kit:** отказ чужой проверки остановки не зовёт меню простоя (RT-3468) ([8b89b85](https://github.com/Eyhenij/rt-tools/commit/8b89b850a38fdb7098a13396f82b825b3fce7029))
- **rt:agent-kit:** отметка Esc без блобов запроса, слово владельца по общему правилу, серверы и паузы — правки после второго круга ревью (RT-3419) ([5018415](https://github.com/Eyhenij/rt-tools/commit/5018415858472e335a23e558ba7dbda81ccf113d))
- **rt:agent-kit:** отправка берёт базу прогона вперёд для того же дерева, отказ называет обе базы (RT-3465) ([07d7fbc](https://github.com/Eyhenij/rt-tools/commit/07d7fbcb6f7efb5343efd1784844d06185831641))
- **rt:agent-kit:** отпуск по Esc, сообщение из очереди, сервер и зависшая задача — правки после первого круга ревью (RT-3419) ([d9a9f66](https://github.com/Eyhenij/rt-tools/commit/d9a9f66c8d047ebe2ef248d2773e745180d0c93e))
- **rt:agent-kit:** пересказ вслепую — шесть правил без потерь, 15 потерь трёх правил в находке (RT-3427) ([5d0a12a](https://github.com/Eyhenij/rt-tools/commit/5d0a12ac0b6a37221b6799fa8ea947600f6bba07))
- **rt:agent-kit:** потери epic-flow и task-delivery-loop возвращены, итог шага 3.2 закреплён — правки после первого круга ревью (RT-3427) ([80762ab](https://github.com/Eyhenij/rt-tools/commit/80762abf6c8c1e343753ed4d5221d049b490f50f))
- **rt:agent-kit:** проверка фонового набора вперёд — правки после второго круга ревью (RT-3469) ([4fbc8c7](https://github.com/Eyhenij/rt-tools/commit/4fbc8c750e86444a75d1fedec1df281d01f4e427))
- **rt:agent-kit:** проверка фонового набора вперёд — правки после первого круга ревью (RT-3469) ([b0d69dc](https://github.com/Eyhenij/rt-tools/commit/b0d69dceaf82d29dddc1fcd001bdf20f81bf4c02))
- **rt:agent-kit:** разбор папки, дыры проверки шагов и строка вехи — правки после второго круга ревью (RT-3423) ([dc257bc](https://github.com/Eyhenij/rt-tools/commit/dc257bc40303e62c02405a589f460aab8cafff6a))
- **rt:agent-kit:** разложенный flow-step.mjs укладывается в предел 500 строк (RT-3434) ([200059b](https://github.com/Eyhenij/rt-tools/commit/200059b641bf3f2bba4c69fb1cbafc5cbeb1442e))
- **rt:agent-kit:** слияние хоста с копией ищется во всей ветке эпика — правки после второго круга ревью (RT-3426) ([55e620a](https://github.com/Eyhenij/rt-tools/commit/55e620aab270bd4e06ca3f4aca9b73bf9ce460da))
- **rt:agent-kit:** слово владельца ход не отпускает, Esc отпускает, меню застревания — «подскажу путь» (RT-3419) ([7fa3262](https://github.com/Eyhenij/rt-tools/commit/7fa326285a68a612b75129e20b561ba11948ecf7))
- **rt:agent-kit:** собственный разбор ветки первым — правки после второго круга ревью (RT-3425) ([26d8d3a](https://github.com/Eyhenij/rt-tools/commit/26d8d3a600291abde117b57b58aa45461dceb04a))
- **rt:agent-kit:** строки doc-style-human и platform-access возвращены, RT-3510 на деление observability — правки после второго круга ревью (RT-3427) ([6a69a47](https://github.com/Eyhenij/rt-tools/commit/6a69a47b2c9f4e2250a5fd183d864f665ba42e85))
- **rt:agent-kit:** у холодных частей epic-flow, mockups и queue-audit есть раздел ловушек (RT-3427) ([b149d38](https://github.com/Eyhenij/rt-tools/commit/b149d3842fe521ccda13783f20dcd1af2370cf33))
- **rt:agent-kit:** удержание по CI после второго круга ревью (RT-3467) ([9a54cc7](https://github.com/Eyhenij/rt-tools/commit/9a54cc759642481cd864c6dc97a053aa9beb4c93))
- **rt:agent-kit:** удержание по CI после первого круга ревью (RT-3467) ([4614184](https://github.com/Eyhenij/rt-tools/commit/4614184003ddf3d5c6d3a47a61d35455057ec743))
- **rt:agent-kit:** чужой отказ и черновик своей копии — правки после первого круга ревью (RT-3468) ([ef7ccc8](https://github.com/Eyhenij/rt-tools/commit/ef7ccc8850d38dbc3ae617c04e9d79f8ba437bb2))
- **rt:agent-kit:** шаг после разбора папки меряется, перемер перед PR не снимает отметку с одного несовпадения (RT-3434) ([c37f34c](https://github.com/Eyhenij/rt-tools/commit/c37f34c7a335fb784ac4a74a0c40c80029a38556))
- **rt:agent-kit:** шаги набора идут от закреплённой ссылки базы — правки после второго круга ревью (RT-3465) ([f678cb4](https://github.com/Eyhenij/rt-tools/commit/f678cb463f7e7c5b14f597d36f3bfd5f7a179fc3))
- **rt:agent-kit:** шаги набора перед отправкой идут на node из .nvmrc (RT-3466) ([cc4283a](https://github.com/Eyhenij/rt-tools/commit/cc4283a2d12da0180af4ef21fb50ec987cbb84f0))

### Features

- **rt:agent-kit:** адаптер хостинга читает запуски CI вершины, события сессии — время и ветку (RT-3467) ([eded67a](https://github.com/Eyhenij/rt-tools/commit/eded67aba3004eee368c54c059f1d12892640ef9))
- **rt:agent-kit:** готовая форма набора вперёд в 13 текстах отказов и в шаблоне цикла (RT-3469) ([40b5b74](https://github.com/Eyhenij/rt-tools/commit/40b5b74552872aab55079735803540daa5d85895))
- **rt:agent-kit:** запуск набора вперёд, чей код не виден нигде, отказан с готовой формой (RT-3469) ([4a0baa5](https://github.com/Eyhenij/rt-tools/commit/4a0baa5accea5e56a3e1b76a97ec858159c1d055))
- **rt:agent-kit:** конец хода держит запуск CI без слежения и непрочитанный красный (RT-3467) ([2b29c57](https://github.com/Eyhenij/rt-tools/commit/2b29c57a4bed165f4894b96bc568aba031bbee74))
- **rt:agent-kit:** тупики по проверкам и веха в отчёте, имя каждому отказу, проверка шагов судит только запись (RT-3423) ([f03d976](https://github.com/Eyhenij/rt-tools/commit/f03d9762da66fd29228cc79766a80c6af285a1b8))

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
