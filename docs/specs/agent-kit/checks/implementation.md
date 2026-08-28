# Проверки дерева — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека рядом. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

Якорь здесь — слово, которое утверждение и держит. Сверка ищет его по всему файлу и любым словом
удовлетворяется, поэтому имя поля из чужой строки проходит её так же, как нужное предложение, — и
утверждение остаётся зелёным, когда сам текст роли переписан целиком.

- **Каталог чужого пакета ищется разрешением модуля, а не путём в каталоге зависимостей.** — `projects/agent-kit/assets/checks/check-dupes.mjs:resolveExternalDir`
- **Таблица соответствий считается повтором по доле совпавших пар, а не по полному равенству.** — `projects/agent-kit/assets/checks/check-dupes.mjs:tableOverlap` — доля считается от большей таблицы, порог `MIN_TABLE_SHARE`; сценарии SC-AK-596…598
- **Отсутствие чужого пакета проверку не роняет.** — `projects/agent-kit/assets/checks/check-dupes.mjs:holdersOf`
- **Предел длины объявлен одним числом на все роды файлов.** — `projects/agent-kit/assets/checks/check-file-size.mjs:LIMIT`
- **Накопленное до объявления предела перечислено поимённо.** — `projects/agent-kit/assets/checks/check-file-size.mjs:parseAllowlist`
- **Принятое и долг в перечне различаются.** — `projects/agent-kit/assets/checks/check-file-size.mjs:known`
- **Список принятого читает общий разбор, а не каждая проверка по-своему.** — `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:parseAllowlist`
- **У записи списка стоят своя причина и номер задачи, которой она внесена.** — `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:allowlistOf`
- **Сторона списка, записанная перечнем строк, отбивает разбор, и отказ показывает форму записи.** — `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:parseAllowlist`
- **Сторона, которую проверка читает, названа разбору перечнем.** — `projects/agent-kit/assets/checks/lib-common.mjs:allowlist` — перечень сторон включает плоские корни либ, и сбор берёт их разобранными
- **Списка нет вовсе — разбор отдаёт пустое и работу не отбивает.** — `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:parseAllowlist`
- **Данные из счёта длины выведены.** — `projects/agent-kit/assets/checks/check-file-size.mjs:JUDGED`
- **Описание прошлого и папка задачи из счёта выведены.** — `projects/agent-kit/assets/checks/check-file-size.mjs:SKIPPED_PREFIXES`
- **Сгенерированное выведено каталогом, а не именами.** — `projects/agent-kit/assets/checks/check-file-size.mjs:SKIPPED_PREFIXES`
- **Длина считается тем же способом, каким её считает линтер.** — `projects/agent-kit/assets/checks/check-file-size.mjs:lineCount`
- **Признак единообразия живёт данными, а не кодом проверки.** — `projects/agent-kit/assets/checks/signals.mjs:loadSignals`
- **Набор признаков режется по пакетам rt-tools.** — `projects/agent-kit/assets/checks/signals.mjs:BUNDLES_DIR`
- **Дерево получает признаки тех пакетов, которые назвало.** — `projects/agent-kit/assets/checks/signals.mjs:readBundle`
- **Дерево дописывает признаки, а не правит чужие.** — `projects/agent-kit/assets/checks/signals.mjs:byKey`
- **Признак называет свою область.** — `projects/agent-kit/assets/hooks/reuse-first-guard.sh:scope`
- **Пустое поле признака не съезжает в соседнее.** — `projects/agent-kit/assets/hooks/reuse-first-guard.sh:cancel`
- **Гард, не получивший ни одного признака, говорит об этом.** — `projects/agent-kit/assets/hooks/reuse-first-guard.sh:signals_seen`
- **Гард на правке и сплошная проверка читают у признака одни и те же поля.** — `projects/agent-kit/assets/hooks/reuse-first-guard.sh:rt_backend_roots`
- **Объявление, приехавшее подключённым пакетом, читается наравне со своим.** — `projects/agent-kit/assets/checks/check-styles.mjs:declarationsFromPackages`
- **Читается то, что приложение подключило само, и не глубже.** — `projects/agent-kit/assets/checks/check-styles.mjs:USE_RE`
- **Расхождение опознаётся по имени класса, а не по перечню файлов при нём.** — `projects/agent-kit/assets/checks/check-styles.mjs:knownByName`
- **Изменившийся перечень файлов называется своим родом.** — `projects/agent-kit/assets/checks/check-styles.mjs:changedFiles`
- **Имя элемента собирается из вложенности, а не читается одной строкой.** — `projects/agent-kit/assets/checks/check-styles.mjs:elementNames`
- **Пределов длины два: код и текст слоя правил.** — `projects/agent-kit/assets/checks/check-file-size.mjs:limitOf` — предел выбирается по корню файла; корни и второе число объявлены в `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:DEFAULTS`.
- **Привязка записывается двумя формами, и читаются обе.** — `projects/agent-kit/assets/checks/spec-anchors.mjs:cells` — строка списка разбирается тем же местом, что и строка таблицы; сценарии SC-AK-662…664
- **У текста слоя правил есть третий предел — вес в знаках.** — `projects/agent-kit/assets/checks/check-file-size.mjs:charCount` — знаки, а не байты: кириллица весит по два байта, и байтовый счёт судил бы язык, а не текст.
- **Спутники из счёта веса выведены.** — `projects/agent-kit/assets/checks/check-file-size.mjs:companion` — компаньон правила и перечень сценариев спека.
- **Дерево, не назвавшее числа веса или корней текста, судится одними строками.** — `projects/agent-kit/assets/checks/check-file-size.mjs:PROSE_CHARS` — ноль выключает счёт веса вовсе, и вторая цифра в сводке не печатается.
- **Проверка объявляет пропуск кодом возврата, а не строкой вывода.** — `projects/agent-kit/assets/checks/check-schema-drift.mjs:SKIP` — сценарий `SC-AK-678`
- **Пропущенная проверка называется вслух, но пуш не отбивает.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:rt_skip_code` — сценарий `SC-AK-679`
- **Проверка, не сумевшая отработать, отказывает, а не пропускает.** — `projects/agent-kit/assets/checks/check-schema-drift.mjs:main` — непредвиденный сбой и не отработавшее сравнение отдают ненулевой код; сценарий `SC-AK-549`
- **Пустое имя в настройке спрашивается отдельно от несуществующего файла.** — `projects/agent-kit/assets/checks/check-schema-drift.mjs:main` — незаданное имя схемы отвечает своей строкой и нулём; сценарий `SC-AK-549`
- **Дешёвая проверка предметом не делится и зовётся при любом составе правки.** — `.claude/rt-kit/project.sh:rt_push_checks` — проверки слоя оформления стоят в общем списке, а не среди тяжёлых шагов; сценарий `SC-AK-673`
- **Тяжёлый шаг набора зовётся по своему предмету, а не по признаку «ветка тронула код».** — `.claude/rt-kit/project.sh:rt_push_touched` — предметы объявлены путями, незнакомое и общее поднимают весь набор; сценарий `SC-AK-569`
- **Надстройка профиля, о которой молчит компаньон правила, — расхождение.** — `projects/agent-kit/assets/checks/check-profile-drift.mjs:unnamed` — имя ищется по всем `implementation.md` каталога правил; сценарии SC-AK-765, SC-AK-766
- **Замещением считается расхождение значения с умолчанием пакета, а не сама строка профиля.** — `projects/agent-kit/assets/checks/check-profile-drift.mjs:overridden`; сценарий SC-AK-767
