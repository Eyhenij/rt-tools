# Находки ревью правил по задачам эпика RT-3597

Находки роли `skill-curator` по закрытым задачам. Ждут слова владельца; правка — задачами эпика
RT-3597.

## RT-3585

1. **Исправлено в RT-3589.** **Пакет, `pitfalls/task-flow.2.md`, после статьи о проверке каждого шага плана.** Проверка с
   ожиданием числа совпадает только при коде выхода 0, а `grep` без совпадений выходит с 1 и
   печатает `0`. Текст: «The run gives an exit code as well as output: every form but `exit N`
   matches only on code 0, and `grep` without a match exits 1 while printing `0`. Absence is written
   `grep -q … → exit 1`, never `grep -c … → = 0`.» Второй вариант: движок сам отказывает плану с
   проверкой `grep -c … = 0`.
2. **Исправлено в RT-3589.** **Пакет, `pitfalls/testing.md`, после статьи об ожидаемом значении теста.** В bash 3.2 подстановка
   `"$(… "…{a,b}…")"` раскрывает фигурные скобки с запятой внутри вложенных кавычек, и сценарий
   зовёт не ту команду. Код с такими скобками кладётся сначала в переменную.

## RT-3587

Правка — задачей RT-3607, заведённой по слову «исправь все что нашел»; её план ждёт одобрения.

1. **Дерево, переопределение образца плана, раздел «Task footprint» потерял пометку «(правится)».**
   Строки таблицы — `Specs (правится)`, `Laws`, `Rules`, `Code (правится)`. Под ними абзац: «A row
   the work edits carries the mark «(правится)» after its name; a row read only for context carries
   none. The engine measures the end of the stages by the marked rows. The step guard refuses an edit
   of the description of the task flow or of its engine outside a path in backticks of a marked row.
   The plan is approved with its marks: a mark added later is a new approval.»
2. **Пакет, образец `spec-driven-rule`, «Common misses».** Блок команд проверен в bash, а исполняет
   его оболочка сессии: сравнение строк внутри `[ … ]` и шаблон без совпадений ломаются в zsh. Блок
   вырезает его сценарий и исполняет целиком в bash и в zsh, из корня и из подкаталога, с кавычками
   и второй строкой в значениях. Дерево, `agent-kit-source`, «Pitfalls»: «A shell block of a command
   or a pattern is run by its scenario in bash and in zsh.»
3. **Пакет, `pitfalls/doc-style.2.md`, статья о правке файла дерева инструментом.** Текст: «An edit
   script saved to a file and run by its path is the same write, and no guard reads it: the path an
   interpreter runs counts as a read.» Файл привязок правила `doc-style` называет то же. Кодом —
   защита записи читает файл, который исполняет интерпретатор.
4. **Дерево, защиты цикла задачи, раздел «Opening the PR».** Вызов открытия PR не кладётся в файл
   сценария: обёртка открывает его мимо всех условий. Кодом — защита доставки читает файл за
   `bash <файл>`.
5. **Пакет, образец `autonomous-work-run`, конец «The cycle of one piece of work».** Проверка вызовов
   до ухода владельца пересказана там в третий раз — вырезать.

## RT-3588

Правка — задачей RT-3607.

1. **Пакет, `pitfalls/task-flow-plan.md`, «Pitfalls».** Три статьи о проверке шага: «A check of absence
   is read by its hits, not by its number» — при записи плана поиск идёт с `-n`, живая статья под
   проверку не переименовывается; «A phrase a check looks for stands on one line of the file» — два-три
   слова или строки, склеенные через `tr -s`; «A check the plan got wrong is replaced, not worked
   around» — строкой «Check of step N.M replaced» в ходе работы.
2. **Пакет, тот же раздел.** «The edit that moves the state goes alone, before the edits that need it.»
   Двадцать отказов подряд пришли на правки, отправленные одним сообщением с правкой состояния.
3. **Дерево, `judge-replay.mjs` и описание его повтора.** Судья, который не запустился, — не расхождение:
   повтор встаёт на первом таком вызове, печатает ответ и кончается кодом 2. Сейчас истёкший вход
   читается как «0 of 21 match». В `agent-kit-source`: «A replay whose judge did not run leaves the
   hook text unmeasured.»
4. **Пакет, `hooks/write-targets.sh` и `hooks/prose-style-guard.sh`.** Ключ `-c`/`-e` ищется у своего
   интерпретатора, образец `sed -i` не идёт через `;` и `&&`, переменная с литералом из той же команды
   раскрывается до сравнения с корнем.
5. **Пакет, `task-flow/measure/session.mjs:running`.** Конец фоновой задачи считается от доставки
   уведомления: конец, вставший в очередь до остановки, съедает остановку соседней задачи. Сценарий —
   добавкой к SC-AK-1762.
6. **Пакет, `hooks/git-guard-draft-ready.sh:judge_abandoned`.** Черновик ветки, которую эта копия не
   брала, называется один раз на вершину за сессию и дальше ход не держит.
7. **Пакет, образец `spec-driven-rule`, «Common misses».** Статья, которая приказывает над чужим
   предметом — планом, ходом работы, PR, — сначала ищет его правило и цитирует ближайшее.

## RT-3589

Правка — задачей RT-3607.

1. **Пакет, записи хода 1455 и 1460.** Меню в них называет «стоп», а не «подскажу путь», как теперь
   требует текст судьи вопроса: читатели, которые судили их вместо `judge-replay.mjs`, разошлись.
2. **Пакет, `hooks/push-set.sh`, `rt_push_set_run`.** Набор отправки отдаёт шагам окружение своего
   вызова: `GIT_DIR` общего хранилища и `RT_HOOK_*`. Первое сделало хранилище bare, второе дало красное
   только внутри отправки. Сценарии потребителя остаются открыты.
3. **Дерево, `tools/tests/run.sh`.** Наборы кладут каталоги в общий TMPDIR и не убирают: в системном
   лежит больше 30 тысяч `tmp.*`. Набор пакета уже даёт каждому свой каталог.
4. **Дерево, `serve:auth`.** Контейнер Keycloak читает тему при старте, а `docker compose up` его не
   пересоздаёт. Стенд проверяет старую тему зелёным.
5. **Пакет, `checks/flow-plan.mjs:planProblems`.** Статью о `pipefail` и ноле `grep -c` никто не
   исполняет: план с такими проверками записывается.
6. **Пакет, `pitfalls/task-flow-archive.md`.** Запись архива кончается зелёным до последнего красного:
   починка после разбора папки в неё не попала.
7. **Дерево, `agent-kit-source`.** Новый ресурс пакета проходит до первого коммита две проверки, а
   краснели ещё две: `check-format-ignore.mjs` и `push-inputs.mjs verify`.
8. **Дерево, `agent-kit-source`.** Защита над командами оболочки называет безвредные части, а не
   пишущие: список пишущих оба круга ревью обошли обычными формами.
9. **Пакет, `rules/turn-conduct.md`.** Статьи о вопросах лежат в холодной части, хотя в правиле есть
   что вырезать: повтор о неверном выводе и оборванный конец статьи о повторе команды.
