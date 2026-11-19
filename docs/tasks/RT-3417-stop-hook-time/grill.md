# Grill

**Описание фичи:** не нужно — правка хука на конце хода и его настройки; код приложений не меняется.

## The owner request

> продолжай работу по эпику

The owner's standing order for the epic RT-3302; the task is row 16 of the epic plan. The card
(issue #3417) was filed by the measurement of RT-3276: the agent hook on Stop thinks 37 seconds at
the median, against the bound of 20 seconds set by the plan of RT-3276. The card asks for a median
of at most 20 seconds over a week without losing the refusals of a promise with no work, and for
the ten recorded turns of step 2.5 of RT-3276 replayed with 0 divergences.

## What the tree already has

- **The hook.** `.claude/settings.json` declares on Stop an agent hook with the prompt «Read the
  file .claude/hooks/turn-judge.md … and follow it exactly», timeout 120 s, no `model`. The text
  `turn-judge.md` (5 860 bytes) is a package resource: `projects/agent-kit/assets/hooks/turn-judge.md`.
- **What it does.** One `Read` of its own text, then two rounds: two `Grep` counts, then a `Grep`
  of the owner's last words and a `Read` of the last 40 records of the transcript. At least three
  round trips of the model before the verdict, more when a refusal needs a proof.
- **The time on 19.11.2026.** By the records `stop_hook_summary` of the transcripts (field
  `durationMs` of the hook whose command names `turn-judge.md`): since the first run, 14.11 15:55
  UTC — 186 runs, median 37,1 s, the tenth decile 57,1 s, the longest 97,1 s; on 19.11 alone — 25
  runs, median 35,4 s.
- **The cases.** The ten recorded turns of step 2.5 of RT-3276 — five false refusals of the old
  checks and five true ones; after the edit of 15.11 only two were replayed.
- **What the host allows** (hooks reference of Claude Code, sections on prompt and agent hooks): an
  agent hook takes `prompt`, `model` and `timeout`; without `model` it runs on the model the host
  uses for background work; it has Read, Grep and Glob and at most 50 turns. What a timeout yields
  the reference does not say.

## Questions and answers

None: the owner told the executor to decide himself («делай всё сам»), and the card names the bound,
the cases and the condition — no refusal lost.

## Decisions

- **The time is cut by the round trips first, the model second.** The text of the judge goes into
  the prompt of the hook itself, so the first `Read` of its own file is gone; the rounds that read
  the transcript are kept to what a verdict needs.
- **A faster model is taken only if the replay of the ten turns keeps 0 divergences on it.** The
  quality of the verdict is the condition of the card; the bound of 20 s does not buy a lost refusal.
- **Measured by the same records** `stop_hook_summary` as the base, on the replay and on the live
  turns after the edit.

## What is left unclear

- What a timeout of an agent hook yields — allowed or refused. A replay with a short timeout shows it.
