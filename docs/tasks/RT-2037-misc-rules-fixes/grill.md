# Grill

## The owner request

> бери все жалобы и предложения из приёмника, верифицируй их по соотвтевию общему направлению
> развития пакетов, заведи эпик и под задачи и бери в работу

The epic is `RT-2028`, its plan is `docs/plans/cargo-intake.md`. This work is row 9 of its
makeup: what the earlier rows did not gather into one resource — scattered articles of rules,
patterns, one law and one hook.

## The cargo records taken here

Eleven records, by full key as the intake reading prints them. The epic plan names nine for this
row: the count was taken before the last two trees sent their cargo, and the row is corrected by
this work.

| #   | Key                                                                | Resource                       | Verdict                                              |
| --- | ------------------------------------------------------------------ | ------------------------------ | ---------------------------------------------------- |
| 1   | `a84bfd1613c3d0bfb0f51f6645f9de05d0b2828b34e576c79508cc8729b4bb05` | `rules/git-workflow.github.md` | becomes two articles                                 |
| 2   | `ade6b8d564c858b458bdc2ea6eae4760879c169f260e8a95d42c56164156f0cb` | `hooks/dev-server-guard.sh`    | becomes a profile key of the tree                    |
| 3   | `88d71d53430abf706a70bea680d3b94bcc40f1a333b568af794fee246db0729e` | `rules/lib-layers.md`          | becomes a pitfall                                    |
| 4   | `83f1b4b225cd0e88df7078183b08dfd2f3063858fbbe4c0e485d8ae33e724a76` | `patterns/task-flow-close.md`  | becomes a fourth place and a command line            |
| 5   | `5b26ec24e3141e343973a8a9bd1b6ab951329300a843f9b88b32f1e91a720677` | `rules/git-workflow.github.md` | already closed by this edition                       |
| 6   | `a827d7a36ecc32b47690755102eaaa45e575b1968fe7b64ddedb97ecb00ab5d0` | `rules/git-workflow.github.md` | rewrites the last sentence of an article             |
| 7   | `d6df9caf0d7a9b4a7c1024f5270bd3e89d954d780db53bb8b15e826616f59936` | `patterns/ts-procedure.md`     | becomes two misses                                   |
| 8   | `398faf25519742e8463f849f39f8b28d01b8f397973261499b880d90e4133022` | `laws/verifiability.md`        | becomes an article of the law                        |
| 9   | `0836eb34dfe5e916dfc9c3273cb1997bb786f5bdd94b69ee63ee06150e912e03` | `rules/doc-style.md`           | becomes an article                                   |
| 10  | `f9c4c3390051ff25c70d93bf5ee0f4e13df0705ee96be7246fc8c5fd1dc895a5` | `hooks/skill-gate.sh`          | the resource is right; only its promise is completed |
| 11  | `333c0f0230026284af3391edbf53f53c2212794008ba0bbeb7d4ce5de92f9285` | `rules/testing.md`             | becomes an article; the refusal mark on it is stale  |

## What the tree already has

Every record names a line of its resource, and every one of those lines is in place — checked by
a search over `projects/agent-kit/assets/`. So no record speaks of an edition older than this one.

The spec of each resource was asked by `node tools/specs-for.mjs <resource>`:

| Resource                                                  | Spec                                  |
| --------------------------------------------------------- | ------------------------------------- |
| `rules/git-workflow.github.md`                            | `docs/specs/agent-kit/delivery-gate/` |
| `hooks/dev-server-guard.sh`                               | `docs/specs/agent-kit/dev-server/`    |
| `rules/lib-layers.md`, `rules/testing.md`                 | `docs/specs/agent-kit/rules/`         |
| `patterns/task-flow-close.md`, `patterns/ts-procedure.md` | `docs/specs/agent-kit/patterns/`      |
| `laws/verifiability.md`                                   | `docs/specs/agent-kit/laws/`          |
| `rules/doc-style.md`                                      | `docs/specs/agent-kit/texts/`         |
| `hooks/skill-gate.sh`                                     | `docs/specs/agent-kit/rule-article/`  |

## What the rules already say

- **Record 5 is already carried out.** `rules/git-workflow.github.md` holds the article "The host
  client's active account is chosen per machine, not per tree; the machine account is substituted
  per call, never made active", and under it the very consequence the record describes: a login as
  the machine account hijacks every neighbouring session on the machine. The sending tree stands on
  an edition older than that article. No code is written for it.

- **Record 10 asks for the opposite of a deliberate decision.** The mark of a loaded rule is wiped
  on compaction by `hooks/skill-gate-rearm.sh`, and its header says why: compaction carries the
  text of the rule out of the session, and without the wipe the gate would keep letting the area
  through while the session works from a retelling. The record's price argument counts the second
  copy of the rule and does not count that the first copy is gone. What the record is right about
  is the promise: the header of `hooks/skill-gate.sh` says there are no repeats within a session
  and says nothing about the re-arming. The promise is completed; the behaviour stays.

- **Record 11 arrived with a refusal mark, and the mark is stale.** The record carries the line
  about a nearest named without a quote, while its nearest line does carry the quote in
  guillemets, and that quote is in `rules/testing.md` verbatim. The refusal was answered by the
  author and the mark was not cleared. The record is taken as an ordinary one.

## Decisions

- **Eleven records, not nine** — the epic plan's row was counted before the last two trees sent
  their cargo. The row is corrected by the same change. Rejected: leaving the row as it stands —
  the makeup is the only place where the record count is written down.
- **The dev server guard gets a profile key, not a removal** — the refusal it holds is right for a
  tree where the owner raises the stands, and it is the only thing that stops a second instance
  over a taken port. The key `owner` leaves the former behaviour, `session` leaves only the
  refusal on a taken port, and an unset key reads as `owner`. Rejected: dropping the guard from
  the package — the tree that complained had already dropped it by a `skip` line, and with it the
  refusal that was right.
- **Record 5 is marked fixed without code** — the same outcome as the sub-issue record of RT-2035.
  The reason goes into the description of the past and into the PR body.

## What is left unclear

- Whether the tree that dropped `hooks/dev-server-guard.sh` by a `skip` line will lift the drop
  after the key arrives. That is its own decision and it does not block this work: the key is
  written so that a tree which sets nothing keeps the behaviour it has today.
