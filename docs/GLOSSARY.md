<!-- rt-kit v0.26.0 · docs/GLOSSARY.md · d233a6cd0a18 · правится надстройкой, не здесь -->
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
| audit             | сверка                    |
| binding           | привязка                  |
| check             | проверка                  |
| companion         | компаньон                 |
| digest            | сводка                    |
| disabled role     | выключенная роль          |
| domain            | домен                     |
| draft             | черновик                  |
| epic              | эпик                      |
| executor          | исполнитель               |
| fail-open         | отказ в пользу работы     |
| gate              | гейт                      |
| grill             | разбор                    |
| guard             | гард                      |
| handover          | передача                  |
| hook              | хук                       |
| laid-out file     | разложенный файл          |
| law               | закон                     |
| layout            | раскладка                 |
| measurement       | замер                     |
| merge             | слияние                   |
| observation       | наблюдение                |
| override          | надстройка                |
| owner             | владелец                  |
| pattern           | паттерн                   |
| pipeline, step    | конвейер, шаг             |
| plan              | замысел                   |
| PR                | PR, заявка                |
| product agreement | договорённость о продукте |
| progress          | ход работы                |
| proposal          | предложение               |
| remark            | слово                     |
| resource          | ресурс                    |
| role              | роль                      |
| rollout           | выкатка                   |
| rule              | правило                   |
| rules layer       | слой правил               |
| run               | прогон                    |
| scenario          | сценарий                  |
| session           | заход                     |
| sidecar           | спутник                   |
| skill             | скил                      |
| spec              | спек                      |
| stand             | стенд                     |
| task              | задача                    |
| task folder       | папка задачи              |
| task footprint    | след задачи               |
| tree              | дерево                    |
| window fill       | заполнение окна           |
| work queue        | очередь работ             |
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

## Kits and showcase

- **Kit** — a package of components that ships to a consumer. There are two, `@rt-tools/ui-kit` and `@rt-tools/ui-kit-v2`; they are kept apart on purpose and share no code at all
- **Showcase** — the stand where the components of a kit are shown live. Each kit has its own, with its own port and its own harness; a technique taken from one is silently wrong on the other
- **Story** — one showing of a component on the showcase: the set of inputs under which it is drawn. Not a "case"
- **Wrapper** — a demonstration component next to a story. Holds the mutable state that a signal input of the kit cannot be given, and does not ship in the package
- **Axis** — one input of a component with all its values. A component is covered when every axis is shown in full, not when a value can be reached with a control
- **Matrix** — a showing in which the values of an axis are laid side by side and labelled. Axes are multiplied only where they visibly affect one another
- **Snapshot** — a frame of a story compared with its baseline. Answers "does it look the same as before" and says nothing about why it differs
- **Baseline** — the pinned frame a snapshot is compared with. Taken after the frame has been looked at with the eyes, and re-taken one at a time
- **Story sweep** — a run that opens every story and checks that the frame holds anything at all. Green snapshots do not answer this: an empty frame has become its own baseline
- **Token** — a styling variable `--rt-*`. Styling is taken by token, not by a value in place. A token of access to anything is called by its full name; the short word means styling only

## Incident review

- **Incident** — a session in which the executor did the wrong thing and the rules layer did not refuse it. A defect in code is not an incident: a test explains it
- **Postmortem** — a record of an incident in the cargo intake: the mechanism of the miss step by step, what was available before it, what caught it and what of this went into the rules layer
- **Mechanism** — a sequence that can be repeated: what was taken for granted, where it was taken from, what confirmed it. Written instead of an assessment of the executor: the rule is derived from it

## Domains of this tree

A domain here is a package under `projects/` or an application under `apps/`, and its spec lies
in `docs/specs/<domain>/`. A part of a package does not become a domain of its own: it is a
subdomain.

- **Public entry** — the `public-api.ts` file of a package. A symbol the consumer has no road to from here is not delivered, whatever it is marked in the source
- **Consumer** — an application that installed the package from the registry. It is not in the tree, and an edit cannot be checked on it: hence the showcase and the snapshots
- **Release** — sending a package to the registry. A separate decision of the owner, not the tail of the work: merging a package PR publishes nothing

## Cargo intake

- **Intake** — the service that accepts cargo from trees where the rules layer is installed. Closed: without a tree token it returns nothing but a liveness probe. The word "intake" also names the action of accepting cargo: the service is the intake, the action is an intake operation
- **Cargo** — what leaves a tree in one send run: the digest of observations with the override snapshot, the proposals and the incident reviews
- **Cargo kind** — one of three: digest, proposals, reviews. Each has its own intake operation: a common "accept anything" would push the parsing of the form onto the intake
- **Tree** — the repository the cargo comes from. Two working copies of one repository are one tree: trees are counted, not machines and not people
- **Tree mark** — the short value by which a tree names itself in the cargo. Computed as a hash of the repository address: the address cannot be recovered from it
- **Tree token** — what a tree presents itself with to the intake. The intake keeps only the hash; the token itself is printed once, at issue, and there is nowhere to show it a second time
- **Token revocation** — a note that the token is no longer accepted. The token is not deleted: the earlier cargo is read by it
- **Invitation** — a one-time code issued by the owner for one tree. By it the tree gets a token once; after that the invitation goes out
- **Token request** — what a tree asks for a token with: the invitation and the tree mark. There is no name in it; the intake takes the name from the invitation. Not called a PR: the PR here is one thing, the request to merge
- **Month record** — the summary of one tree for one calendar month. One per pair "tree and month": found, it is appended to; not found, it is created
- **Override snapshot** — the state of a tree at the moment of sending: which sections of which package resources it replaces, adds and removes. The content of the edits is not in it
- **Unselected** — a package resource the tree did not lay out at all. Declining a resource is as much an answer about the package text as editing its section

## Intake admin

- **Admin** — the application with which a person reads the accepted cargo. There are no cargo edits in it at all: the intake accepts, the admin reads
- **Account** — the name and password of one person. Created, changes its password and is disabled by the command line of the intake launcher; accounts are not created from the web
- **Sign-in** — the state in which the intake knows who is asking. Lives for a term, ends with a sign-out and does not replace the tree token
- **Section** — a screen of the admin with an address of its own. A menu item leads into a section, and the item is created together with its screen
- **List** — the page of a section: a row per record, a toolbar above it and a page switch below it. Assembled with the kit table, not with markup of its own
- **Toolbar** — the strip above the list: filter, search and actions on the list as a whole. There are no actions on a single record in it
- **Details panel** — a panel with one record in full, sliding out on a click on the row. Not a "modal" and not a "popup"
- **Filter** — a condition that narrows the list. It narrows what is shown, not the access: a signed-in person sees the cargo of all trees
- **Query** — the page, its size, the order and the filter together. Lives in the section address so that it survives a reload and can be passed as a link

## Russian names of this tree

The same table as "Russian names" above, for the words of this tree: one Russian name per
English one when a session writes to the owner.

| English           | Russian              |
| ----------------- | -------------------- |
| account           | учётная запись       |
| admin             | админка              |
| axis              | ось                  |
| baseline          | эталон               |
| cargo             | груз                 |
| cargo kind        | род груза            |
| consumer          | потребитель          |
| details panel     | панель подробностей  |
| filter            | отбор                |
| incident          | происшествие         |
| intake            | приёмник             |
| invitation        | приглашение          |
| kit               | кит                  |
| list              | список               |
| matrix            | матрица              |
| mechanism         | механизм             |
| month record      | запись месяца        |
| override snapshot | снимок надстроек     |
| postmortem        | постмортем           |
| public entry      | публичный вход       |
| query             | выборка              |
| release           | выпуск               |
| section           | раздел               |
| showcase          | витрина              |
| sign-in           | вход                 |
| snapshot          | снимок               |
| story             | история              |
| story sweep       | обход историй        |
| token             | токен                |
| token request     | обращение за токеном |
| token revocation  | отзыв токена         |
| toolbar           | тулбар               |
| tree mark         | признак дерева       |
| tree token        | токен дерева         |
| unselected        | невыбранное          |
| wrapper           | обёртка              |
