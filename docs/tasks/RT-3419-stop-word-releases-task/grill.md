# Grill

**Описание фичи:** не нужно — правка проверок остановки пакета правил и дерева; код приложений не меняется.

## The owner request

> продолжай RT-3471, эпик (четвёртая часть переделки проверок)

The owner's word of 21.11.2026; the task is row 7 of the plan of the epic RT-3471
`docs/plans/checks-rework-4.md`. Point B of the epic for this task and RT-3468: a refusal the
session cannot act on and the owner's «стоп» hold no turn. The milestone G: three working days in
a row of at least 1500 calls, each with fewer than five refusals per hundred and no dead end.

The card (issue #3419), filed 19.11 from the review of RT-3276 (a model of six turns of 14.11 and
the role `goal-critic`): the owner says «стоп» or «не сейчас» while steps of the plan are not
done, and the turn exit check refuses the agent, so the agent goes on with work the owner stopped.
The card asks: a stop word in the owner's last message releases the turn in a task with undone
steps too. The sign: a scenario of the turn exit check — «стоп» in the state `этап-идёт` gives an
exit with no refusal.

> дальше работай полностью самостоятельно в режиме ночной работы, я ухожу спать. не задавай вопросов и не останавливай сессию, все вопросы решай сам как посчитаешь наиболее правильным

The night of 21.11 writes the plan and runs the roles; the code waits for the owner's approval of
the plan in the morning.

## What the tree already has

- **The engine releases a stop word in every state.** The release case `stopWord`
  (`measure.owner.saidStop`) stands second in `projects/agent-kit/assets/task-flow/flow.md`, after
  the end of the scenario, since 15.11. A probe of `decide` with the state `этап-идёт`, a write and
  the stop word gives `{"release":"a stop word of the owner"}`, with an idle stop or a refusal of
  calls too. Only the CI hold of RT-3467 comes before it, by the owner's own choice of 21.11.
- **The stop words.** `words.stop` of the description: «стоп», «стой», «хватит», «остановись»,
  «прекрати», «не сейчас», «подожди», «погоди», «жди», «пауза», «отбой», «на сегодня всё», «stop»,
  «wait», «not now», «pause». «потом» is not among them; the words of the model check `turn-judge`
  name it.
- **The scenarios.** SC-AK-1429 releases a stop word by the measure and through the hook, but the
  hook case runs on a branch in the first state, `просьба-не-разобрана`; no scenario runs the hook
  in `этап-идёт`.
- **The other stop checks do not read the stop word.** The dispatcher on Stop runs
  `conscience-guard`, `cargo-mark-guard`, `git-guard-draft-ready`, `turn-exit-guard`, two record
  hooks, and the model check `turn-judge` runs beside it. Of them only the engine and the model
  check read the owner's last word. `conscience-guard` and `cargo-mark-guard` refuse a stop once a
  turn and let a repeated approach through; so does the draft check.
- **The records.** From 14.11 the owner's text began with a stop word four times and the menu
  answer «стоп» came twice; no stop check refused after any of them. The card is a model of 14.11,
  before the engine of 15.11.

## What the rules already say

- The law on work conduct and the rule `turn-conduct`: until the scenario is over a turn ends only
  by the owner's stop word or by a release case.
- The rule `task-flow`: the engine is the one source of the stop words; a check that needs them
  asks the engine.

## Questions and answers

No question was put to the owner: the card names the cause, the condition and the sign, and the
night order says to decide alone.

## Decisions

- **The sign of the card is proved through the hook on a branch in `этап-идёт`.** The engine
  already releases; the scenario it lacks is the hook run in a stage with undone steps. Спросить
  было некого: заход автономный. Цена ошибки: сценарий без правки кода, если владелец считал
  карточку уже закрытой.
- **The other stop checks of the dispatcher let a turn end after the owner's stop word.** A stop
  word that the engine releases and `conscience-guard`, `cargo-mark-guard` or the draft check
  refuse still makes the agent go on — the case of the card under another name. They ask the
  engine by a new command `said-stop`, not a word list of their own: the description stays the
  one source. No engine, no record or a broken answer — the check judges as before. Цена ошибки:
  одна команда движка и три проверки со сценарием каждая.
- **«потом» is not added to the stop words.** «сначала сделай RT-3342, потом вливаем» of 19.11 is
  an order of work; the engine reads a stop only when the word begins the message and nothing after
  it holds the turn. The model check keeps its wider list: it judges the meaning, not the word.
- **The CI hold stays before the stop word.** The owner chose it by menu on 21.11 for RT-3467.

## What is left unclear

- Whether the records hold a refusal after a stop word under a menu answer format the scan did not
  read. The roles count it on the records.
