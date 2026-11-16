# Grill

## The owner request

Задача #3275 эпика RT-3302, её текст:

> В пакете 93 файла проверок на bash. Каждая написана под один случай и не знает об отказах
> соседних. Опись нашла шестнадцать цепочек, где выход одной проверки запрещает другая. Проверить,
> что из любого состояния есть законный ход, сейчас нечем.
>
> Правила, которые останутся после задач о хостинге, git-хуках и окне разрешения, собрать в одну
> программу с таблицей решений: состояние и действие дают «разрешено», «запрещено» или «спросить
> владельца». Тест перебирает все состояния и падает, если в каком-то не осталось ни одного
> разрешённого хода. Отказ называет ход, который таблица разрешает.
>
> - Тест перебора состояний зелёный и стоит в конвейере.
> - Каждая из шестнадцати цепочек описи записана случаем этого теста.
> - Число файлов проверок в пакете названо до и после.

The owner ordered the epic on: «делай эпик дальше» (16.11.2026).

## What the tree already has

- `ls projects/agent-kit/assets/hooks/*.sh | wc -l` — 82 hooks, all 82 declare `rt-hook:`; 25 carry
  an explicit `deny` or `block` word.
- The inventory of sixteen chains is nowhere: a search for «шестнадцать цепочек», «16 цепочек» and
  «sixteen chains» over `docs`, `projects` and `.claude` finds nothing.
- A ready-made sample of a state table: the engine `tools/task-flow-script.mjs` measures thirteen
  states with exits, and `projects/agent-kit/tests/hooks-kind.test.sh` already walks every hook file.
- RT-3271 turned `epic-stop-guard.sh` into an ask-only guard; its decisions are a third value beside
  allow and deny.

## Questions and answers

**Откуда брать цепочки, если описи нет?**
Собрать заново (Recommended): прочитать все проверки пакета и записать пары «выход одной
запрещает другая».

**Что кладётся в таблицу решений?**
Все 82 хука.

**Одной задачей или разбить?**
Две задачи (Recommended): RT-3275 — опись цепочек, таблица решений по всем 82 хукам и тест
перебора в конвейере. Новая задача эпика — хуки зовут таблицу, число файлов до и после.

## Decisions

**Behaviour:** unchanged — the work is a model and a test of the rules package; no path under
`apps/` or `libs/` changes, and the hooks keep deciding as before until RT-3355.

- **Behaviour of an application does not change** — the work is in the rules package and its tests.
  Closed by exploration: no path under `apps/` or `libs/`.
- **No law is edited.** The scenarios and the spec of the package domain are edited in the branch;
  closed by assumption, a wrong one costs an edit of the plan.
- **The done sign of RT-3275 is narrowed by the owner's split:** the test is green in the pipeline,
  every chain of the new inventory is a case of it, the hooks are not yet rewired. The file count
  before and after goes to the second task.
- **The sample is the engine's state table and `hooks-kind.test.sh`** — closed by exploration.
- **Not part of the task:** rewiring hooks to call the table and removing files — task RT-3355,
  row 4.1 of the epic plan.

## What is left unclear

- How many chains the new inventory finds; the number is written when it is counted, not guessed.
