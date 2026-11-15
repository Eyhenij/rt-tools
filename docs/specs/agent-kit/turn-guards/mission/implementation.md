# The binding — the mission of the guards of the end of a turn

A statement of the spec and the tool of the day that carries it. The link goes by the text of the
statement. A tool is replaced by rebinding these lines: a rule that loses its tool goes to the open
questions of the spec, not into a binding nobody carries.

## The tools of the day

Three tools carry the rules on 15 November 2026, all three connected in `.claude/settings.json`.

1. A command hook on the event Stop. The dispatcher runs
   `projects/agent-kit/assets/hooks/turn-exit-guard.sh` with its neighbours in the same directory.
   It judges the calls of the turn and the tree.
2. An agent hook on the event Stop. It follows `projects/agent-kit/assets/hooks/turn-judge.md` and
   judges the turn by the owner's latest words and the reply; the state of the work it does not
   read, the command hook measures it. Its timeout in the settings is 120 s.
3. An agent hook on the call of the question tool. It follows
   `projects/agent-kit/assets/hooks/ask-judge.md`.

## Where the rules are carried out

- **A report, a summary or an announced intent does not end ordered work.** — `projects/agent-kit/assets/hooks/turn-judge.md:announcement` — the agent hook refuses a turn that ends with a promise, an announcement or a report while ordered steps remain; inside a task the command tier `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:rt_te_steps_deny` refuses it too.
- **A milestone of the flow is not a stop.** — `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:handover_re` — handed-in work ends a turn only with the next one begun; a taken task without work and a written plan not begun are refused by the tiers of the command hook before the lawful exits. Under an open epic handed-in work goes on to the next task by the tier of the open epic: `projects/agent-kit/assets/hooks/turn-exit-epic.sh:rt_te_epic_deny`.
- **Waiting for someone else's step is never the end of a turn.** — `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:wait_re` — a loop until a run is ready, watching it and a call of a sleep as the last action of a turn.
- **While steps of the task plan are not done, a turn ends only by a lawful stop.** — `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:rt_te_steps_deny` — the steps are counted by their marks in the progress; a question by the tool, a refusal of a guard, a handover and the quoted word of the owner release the tier.
- **Under an open epic a turn with work does not end on its own.** — `projects/agent-kit/assets/hooks/turn-exit-epic.sh:rt_te_epic_deny` — the unfinished tasks are read from the table of the epic; a closed epic releases the whole turn.
- **The owner's word to stop, quoted in the progress, ends the turn.** — `projects/agent-kit/assets/hooks/turn-exit-epic.sh:rt_te_owner_word_quoted` — the waiting line of the progress holds three characters and more inside « »; it releases the whole guard before any tier. Nothing refuses a quote older than the owner's latest order: Q-7 of the spec.
- **An answer to the owner in the middle of ordered work is followed by the next step.** — `projects/agent-kit/assets/hooks/turn-judge.md:swearing` — the agent hook refuses a turn that answers the owner and stops while the owner's latest word orders work the turn has not done; the steps of the plan are held by the command hook.
- **A quote of the owner older than their latest order releases nothing.** — **Not carried out by a machine:** the agent hook no longer reads the waiting line, and the command hook does not compare it with the owner's words; Q-7 of the spec.
- **A command that closes a session or writes a handover is not a word to stop.** — `projects/agent-kit/assets/hooks/turn-judge.md:cleanup` — the agent hook keeps open the work such a command does not mention.
- **A question to the owner leaves unless the owner already answered it or a rule answers it plainly.** — `projects/agent-kit/assets/hooks/ask-judge.md:already` — the agent hook holds a question only when the owner already answered the same decision, a rule answers it plainly, or the question offers to walk around a check.
- **A guard does not refuse the same turn twice for the same reason.** — `projects/agent-kit/assets/hooks/turn-judge.md:twice` — the agent hook reads the sign of a continued turn and lets it end when the reason of the previous refusal is addressed; the host ends the turn by itself after eight continuations in a row.
- **While ordered work is open, doubt is decided by a refusal, once.** — **Not carried out by a machine:** the agent hook no longer judges open work and lets a doubtful turn end; Q-10 of the spec.
- **A refusal names the next move the agent can make in the same turn.** — `projects/agent-kit/assets/hooks/turn-judge.md:action` — the reason of the agent hook names one action the agent can take in this turn; the refusals of the command hook end with the two moves of `projects/agent-kit/assets/hooks/turn-exit-guard.sh:rt_te_deny`.
