# Находки ревью правил по задачам эпика RT-3597

Находки роли `skill-curator` по закрытым задачам. Ждут слова владельца; правка — задачами эпика
RT-3597.

## RT-3585

1. **Пакет, `pitfalls/task-flow.2.md`, после статьи о проверке каждого шага плана.** Проверка с
   ожиданием числа совпадает только при коде выхода 0, а `grep` без совпадений выходит с 1 и
   печатает `0`. Текст: «The run gives an exit code as well as output: every form but `exit N`
   matches only on code 0, and `grep` without a match exits 1 while printing `0`. Absence is written
   `grep -q … → exit 1`, never `grep -c … → = 0`.» Второй вариант: движок сам отказывает плану с
   проверкой `grep -c … = 0`.
2. **Пакет, `pitfalls/testing.md`, после статьи об ожидаемом значении теста.** В bash 3.2 подстановка
   `"$(… "…{a,b}…")"` раскрывает фигурные скобки с запятой внутри вложенных кавычек, и сценарий
   зовёт не ту команду. Код с такими скобками кладётся сначала в переменную.

## RT-3587

Правка — задачей RT-3607.

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
