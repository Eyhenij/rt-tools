# Grill

**Описание фичи:** не нужно — правка проверок остановки пакета правил и дерева; код приложений не меняется.

## The owner request

> продолжай RT-3471, эпик (четвёртая часть переделки проверок)

The owner's word of 21.11.2026; the task is row 7 of the plan of the epic RT-3471
`docs/plans/checks-rework-4.md`. Point B of the epic for this task and RT-3468: a refusal the
session cannot act on and the owner's «стоп» hold no turn. The milestone G: three working days in
a row of at least 1500 calls, each with fewer than five refusals per hundred and no dead end.

The card (issue #3419), filed 19.11 from the review of RT-3276: the owner says «стоп» or «не
сейчас» while steps of the plan are not done, and the turn exit check refuses the agent. The card
asks that a stop word release the turn in a task with undone steps too.

The owner redefined the task on 22.11, in two answers by menu:

> Что вообще значит этот стоп по задумке?

> Давай так: мне не нужна команда которая дает агенту права ничего не делать, мне нужна команда которая даст агенту право дождаться результата ci или других долгих процессов , но агент должен ждать и по окончанию агент должен продолжить работу по текущему шагу. Или есть какие-то другие кейсы которые я забыл?

The menu that followed offered «Ожидание, стоп как есть» and «Ожидание и убрать «стоп»». The owner
chose «Ожидание и убрать «стоп»», described there as: the same wait, and the word «стоп» no longer
releases a turn and leaves the menu; the agent is stopped by Esc only.

## What the tree already has

- **A stop word releases every turn.** The release case `stopWord` (`measure.owner.saidStop`)
  stands second in `projects/agent-kit/assets/task-flow/flow.js`. The engine reads the owner's last
  word over the whole record, and a notice of a background task carries no word. On 20.11 after
  «стоп» at 16:37 the session was woken 7 times and made 44 calls before the owner's next word.
- **The stop words.** `words.stop`, `words.stopExcept` and `words.holdAfter` of the description;
  `saysStop` in `checks/flow-data.mjs` reads them. The CI hold lets a fresh head pass after a stop
  word (`measure/ci.mjs`, SC-AK-1813).
- **The menu when stuck.** A step another check refused twice, or an idle stop, gives the owner one
  menu: «отложить RT-N», «стоп» (`words.menu`). The model check `ask-judge` lets only these two
  options through; the model check `turn-judge` lets a turn end on «стоп», «хватит», «потом».
- **The wait.** The release case `background` lets a stop go while a background task of the
  session runs, one stop per task. A task older than `BACKGROUND_BOUND`, 20 minutes, counts as no
  task. The notice of its end wakes the session, and an unread result holds the next stop until
  it is read.
- **A watch of a CI run is no wait.** The CI hold asks for it, and the next work goes on while it
  runs; its notice wakes the session, and a red run holds the stop until it is read.
- **Esc.** The owner's interrupt ends a turn with no stop check: the hook on Stop does not run. A
  notice of a background task started before it wakes the session again, and the engine judges
  that turn by the scenario.
- **The forecast.** `node tools/task-flow-script.mjs forecast --days 8 --until 2026-11-22` replays
  14–22.11: 169 stops held. With the bound at 90 minutes — 152; with the stop word removed too — 152.

## The records, 14–22.11

- Background tasks with a start and an end: 810. Longer than 20 minutes: 57 (agents 25, the push
  set 23, other commands 9). Longer than 90 minutes: 3, all agents. The longest command ran 58
  minutes, the push set 55 at the 99th percentile.
- A stop word began the owner's text 4 times and came as a menu answer twice; 3 since 15.11.

## Questions and answers

- **What a stop is for.** The owner: a command that lets the agent do nothing is not wanted; the
  agent waits for CI or another long process and goes on with the current step after it.
- **The stop word.** The owner chose to remove it: «стоп» releases no turn and leaves the menu;
  the agent is stopped by Esc.

## Decisions

- **The wait is bounded at 90 minutes, not 20.** The longest command of the records ran 58
  minutes; 3 of 810 tasks ran longer than 90, all agents. A task older than the bound counts as
  hung: the stop is held, and the agent deals with the task. The question about the bound was
  refused by `ask-judge` as the stuck menu itself. Цена ошибки: одно число в движке и один
  сценарий.
- **The stuck menu offers «отложить RT-N» and «подскажу путь».** The hold tells the agent to ask
  the owner to write the way in the free field of the same menu. A bare «подскажу путь» with no
  text lets one question with a free field through `ask-judge`, as part of the menu of the exit
  check; otherwise the next idle stop gives the same menu again, a dead end by the count of
  `record-count.mjs`. The question was refused by `ask-judge` for the same reason; the plan carries
  the choice to the owner's approval. Цена ошибки: одно слово в описании и в двух модельных
  проверках.
- **A watch of a CI run counts as a wait like any other background task.** The owner named CI
  first. CI runs only for a PR into main, which opens at the end of a scenario; there the end of
  the scenario releases the turn anyway, and in `работа-отдана` a wait releases nothing, so the
  next work goes on while CI runs. Dropping the exception changes nothing there and lets the agent
  wait for a deploy or a release run inside a stage.
- **Esc releases the turns a background notice wakes, until the owner's next word.** The record
  writes Esc as a `user` entry `[Request interrupted by user]`: 154 of them since the records begin.
  Over 14–22.11 after 53 Esc presses 11 notices came before the owner's next word, and the session
  made 2 calls. A release case `interrupted` takes the place of `stopWord`: the owner's last word is
  the interrupt mark. Цена ошибки: одна мера и один случай отпуска.
- **The model check `turn-judge` lets a turn end on a wait.** A turn ends while a background task
  of this turn runs, and the reply names the task and the step that goes on by its notice. Over
  14–22.11 at least 6 of 70 refusals of `turn-judge` refused such a wait: «Жду итога» on the push
  set, two roles in the background, the showcase building. Its list of stop words goes.
- **A hung task is named.** The hold over a task older than the bound names the task and its age,
  so the agent checks or stops it rather than waits.
- **A server is no wait.** `serve:*` and `storybook` never end by themselves, and a notice never
  comes; with the bound at 90 minutes such a wait would hold the session for an hour and a half.
- **The words of a push to go on stay.** `words.nudge` («продолжай», «почему стоишь») holds a turn
  with no write; it is not a stop word.
- **The scenarios of the stop word are removed, not rewritten.** SC-AK-1429, 1505, 1516 and 1813
  name behaviour that no longer exists; the history line of each spec names the removal. SC-AK-1761
  (the wait releases a stop) stays, and SC-AK-1762 keeps its number with the bound of 90 minutes.

## Other cases the owner asked about

The recorded scenarios hold three more cases of a stop by word:

- **«жди соседа»** — a wait for another session. It is a background command that ends together
  with the step of the other session, such as a polling loop; then it is a wait like any other.
- **«Остановись на логической точке»** — a soft stop after the commit of a step. Esc does not do
  that, and the case goes with the stop word; the owner answers it by the plan approval.
- **«на сегодня всё»** — Esc.

## What is left unclear

- Nothing for the owner.
