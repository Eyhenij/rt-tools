# Project glossary

Words that mean something definite in this tree. Read before writing a spec, a rule, a comment,
a commit body or a PR description: a word from here is used in the meaning given here, and a word
that is not here is either added here by the same change or replaced with a plain one.

Terms of one domain live in the "Terminology" section of its spec; here are only those that run
through the whole project.

The sections below are shipped by the package: they are the words of the rules layer, and they
mean the same everywhere the layer is installed. Subject words are added by the tree in its own
sections through the override; they merge here by heading, and a package edit does not touch them.

## Rules layer

- **Law** — a file in the constitution directory: what must be true, without paths or file names. True for any application of this class
- **Application laws** — the layer of laws true only for this application: payments, locales, access. Subject matter is lawful there: it is their subject
- **Rule** — a skill with `kind: rule`. Binds a law to this tree: what it is called here and where it lives
- **Pattern** — a skill with `kind: pattern`. Ready-made code and a sequence of steps; stands next to a rule
- **Companion** — the `implementation.md` file next to a rule: names and paths of this tree. The package knows the technique and does not know the names; the project writes them
- **Spec** — a description of a domain: how it works. Speaks of what is settled, not of what is coming
- **Domain** — a subject with a spec of its own. A domain that has grown splits into subdomains, not into neighbouring domains
- **Scenario** — observable behaviour under the number `SC-<PREFIX>-<NUMBER>`. The number stands in the test title
- **Binding** — a `` `file:symbol` `` line in a companion or in a spec sidecar: the place where a statement is carried out
- **Sidecar** — a file next to a spec or a rule: a companion, a list of scenarios
- **Product agreement** — how the product will behave, written before the code: the only place where a spec speaks of the future. After the rollout it merges into the domain spec
- **Resource** — a unit of what the rules package ships: a law, a rule, a pattern, a guard, a check, a role, a command, a pipeline, a template, a default, a document
- **Layout** — the transfer of a resource from the package into the tree, by its kind and by the layer settings
- **Laid-out file** — a file in the tree with the package header. Edited through the override, not in place: an in-place edit is lost on the next layout
- **Override** — a file of the tree that merges with the laid-out file by section headings
- **Disabled role** — a role whose call the tree no longer treats as mandatory: the guard stays silent about it. Named in a list in the tree settings, not removed from the layout, and called by hand
- **Observation** — a line about an event of the rules layer: a rule was loaded, a gate refused, a guard declined. Written by a guard, lives in the tree, leaves as counters. Not called a log
- **Digest** — what the observations say over a span of days: what was used, what never was, what people stumbled on
- **Proposal** — a ready-made wording of a rules edit with an address: the package, a companion or the tree. A person sends it with a command
- **Remark** — a person's reply in the middle of work, about the rules layer: what gets in the way, what was missing, what went wrong. Lands as a block in the proposals file instead of living until the end of the session

## Work

- **Task** — a unit of work in the work queue. Created before the branch, and its number stands in the branch name and in the PR title
- **PR** — the request to merge: the same name as the task, turned into what was done. Not called a report or a pull request, neither in files nor in conversation
- **Work queue** — the board where the state of every task is visible. It does not see branches
- **Task folder** — one piece of work from grill to merge: the grill of the request, the plan, the progress. Dies with the merge: it is taken apart, and what explains a decision moves to the archive
- **Grill** — questioning the owner before the first edit. Written in the owner's words and never rewritten afterwards
- **Plan** — a file of the task folder: the task footprint and the stages with readiness signs. Not edited after it is written; the result is checked against it at acceptance
- **Progress** — a file of the task folder: "Where we stand", decisions along the way with reasons, session entries. The only place where done work is marked. Not called a log
- **Work state** — the unit by which work is conducted: each has a named entry, a mandatory action and an exit. Declared by a line in the "Where we stand" section of the progress, and the guard judges it, not the presence of files
- **Task footprint** — a section of the plan: which specs, laws, rules and parts of the code the work touches
- **Session** — one sitting of work on a task. Work lives longer than a session, and between sessions its state is held by the progress
- **Window fill** — the share of the session's room already taken: the input, the cache write, the cache read and the last reply's output, divided by the window size. Not "spend" and not "budget": it is about room, not cost
- **Handover** — the text that closes a session: working tree, branch, task, where the progress lies, what is done, the next step, what was special about the session. Placed outside the tree and not committed
- **Epic** — a series of tasks on one theme in an assigned order, wider than one branch. Lives in two places: a card with the epic label and a plan next to it. Not called a work line
- **Archive** — records of what has happened: what explains a closed decision. Not edited after the rollout

## Checks

- **Guard** — an agent hook that refuses an action before it is done and says what lifts the refusal
- **Gate** — a requirement that lets an action through once per session after it has been met: the rule is loaded, the checks have passed
- **Fail-open** — the design of a guard under which any breakage of the guard lets the action through. A broken guard has no right to stop work altogether
- **Run** — a launch of a set of scenarios. "Tests are run", not "put into work"
- **Audit** — a check that edits nothing and names discrepancies: of the layout against the package, of specs against the code, of the work queue against the branches
- **Measurement** — a number taken from the running application. A look at the screen is not a measurement

## Russian names

The layer names its notions in English, and the owner reads about them in Russian. By this table
a session writes a task, a PR description or a reply to the owner: one Russian name per English
one, so that the same notion does not arrive under three names.

| English           | Russian                   |
| ----------------- | ------------------------- |
| application laws  | законы приложения         |
| archive           | архив                     |
| audit             | аудит                         |
| binding           | привязка                  |
| check             | проверка                  |
| companion         | файл привязок                 |
| digest            | сводка                    |
| disabled role     | выключенная роль          |
| domain            | домен                     |
| draft             | черновик                  |
| epic              | эпик                      |
| executor          | исполнитель               |
| fail-open         | пропуск при ошибке            |
| gate              | проверка перед push           |
| grill             | уточнение задачи              |
| guard             | блокирующая проверка          |
| handover          | передача                  |
| hook              | хук                       |
| laid-out file     | файл, установленный из пакета |
| law               | закон                     |
| layout            | установка файлов из пакета    |
| measurement       | измерение                     |
| merge             | слияние                   |
| observation       | наблюдение                |
| override          | переопределение               |
| owner             | владелец                  |
| pattern           | паттерн                   |
| pipeline, step    | конвейер, шаг             |
| plan              | план                          |
| PR                | PR                            |
| product agreement | описание фичи                 |
| progress          | ход работы                |
| proposal          | предложение               |
| remark            | замечание                     |
| resource          | ресурс                    |
| role              | роль                      |
| rollout           | выкатка                   |
| rule              | правило                   |
| rules layer       | слой правил               |
| run               | запуск тестов                 |
| scenario          | сценарий                  |
| session           | сессия                        |
| sidecar           | соседний файл                 |
| skill             | навык                         |
| spec              | описание                      |
| stand             | стенд                     |
| task              | задача                    |
| task folder       | папка задачи              |
| task footprint    | что задача затрагивает        |
| tree              | дерево                    |
| window fill       | заполнение окна контекста     |
| work queue        | список задач                  |
| work state        | состояние работы          |

## Not written here

On the left is what is neither written nor said anywhere; on the right is what it is called here.

- **ticket** — task
- **pull request, merge request** — PR, and the action is a merge
- **issue (of a task)** — task; the issue is what the hosting keeps under the same number
- **report (of a PR)** — PR; a report is a summary of data, and the word is taken by it
- **job** — a pipeline step
- **context window** — the session window, and its share is the window fill
- **log (of observations or of the progress)** — observation, progress
- **spec (of a test file)** — test, a file next to its source; a spec is a document
- **skill (of a rule or a pattern)** — rule, pattern or a skill without a law, by what it really is

### Russian words for texts to the owner

Tasks, PR descriptions, commit bodies and chat replies are written in the owner's language, and
these words are not written or said there either.

- **спека (о тесте)** — тест — файл рядом с исходником; спек — документ. Одна буква разницы, а значения противоположны
- **таска, тикет** — задача
- **пул-реквест, мёрдж-реквест** — PR, а действие — слияние
- **отчёт (о заявке на слияние)** — PR; отчёт — сводка данных, и слово занято ею
- **джоба, пайплайн** — конвейер и его шаг
- **хендофф** — передача
- **бэклог** — очередь работ
- **линия работ** — эпик
- **контекст-виндоу** — окно захода, а его доля — заполнение окна
- **скилл, скиллы** — правило, паттерн или скил без закона — по тому, что это на самом деле
