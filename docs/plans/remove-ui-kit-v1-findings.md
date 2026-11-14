# Findings of the epic: the first kit removed from the repository

They accumulate here, next to the epic plan `docs/plans/remove-ui-kit-v1.md`. The owner reads them
when the epic is over.

## RT-3304 — the first kit, its specs, tools and checks removed

- **Removing the first kit barely shortens a push.** By the run log of 07–14.11 the first kit's
  snapshots took 6 minutes of about 1 900; the step ran only on an edit of the kit itself. The
  push time goes to the hook scenarios (720 min), the second kit's snapshots (381), `nx affected`
  (210), the admin end-to-end suite (207) and `check-kit-approval` (149). **Address:** names of
  this tree — the push set profile; the revision of the set is the owner's order of 14.11.
- **`check-kit-approval` greps every session transcript of the machine.** It looks for the
  owner's approval quote by `grep -r` over 6.7 GB in `~/.claude/projects`: 59 s on average, 241 s
  on 08.11, 151 runs a week. **Address:** names of this tree — `tools/check-kit-approval.mjs`.
- **The step limits carry no margin, and a branch touching the root cannot fit the set limit.**
  `agent-kit:check` refused at 6 s against 5, `lint:styles` at 8 against 5, `verify` at 4 against
  1 — each passed. A branch touching `package.json` and the lockfile must run every heavy step,
  about 15 minutes against the set limit of 440 s, and an over-limit set drops its marks, so such
  a branch cannot be pushed at all. **Address:** names of this tree —
  `.claude/rt-kit/project-budget.sh`; the limits are the owner's order of 13.11.
- **The table of push inputs recorded the agent's observation marks as reads of a step.** Every
  guard refusal writes a new mark, and the table check turned red after each. Closed by commit
  `937715e68`: the observations directory is left out of the record, scenario `SC-AK-1355`.
  **Address:** rules layer — `checks/push-inputs.mjs`.
- **A tree scenario run from inside the tests directory leaves marks there.** Sixty mark files lay
  in an ignored `projects/agent-kit/tests/.claude/` since 30.08; they reached the table record.
  **Address:** rules layer — the scenario harness `tests/lib.sh`.
- **The generated storage client lies outside history and goes stale silently.** `check:all` gave
  eight red typechecks of the receiver until `pnpm run prisma:generate`. **Address:** names of this
  tree — nothing in the set says the client is stale.

## Left unresolved

- **The npm deprecation of `@rt-tools/ui-kit`** — the owner's step: `npm view` shows the field
  empty.
- **The push limits for a branch touching the root** — waits for the owner's decision.
