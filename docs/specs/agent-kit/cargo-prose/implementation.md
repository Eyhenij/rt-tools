# Binding — the wording of the cargo leaving for the intake

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The wording of a cargo record is judged before the send, not only on an edit of a file.** — `projects/agent-kit/src/lib/shipment.ts:propose`
- **A record is refused by name, and the rest of the batch leaves.** — `projects/agent-kit/src/lib/shipment.ts:refusalLines`
- **A refused record stays lying on the disk.** — `projects/agent-kit/src/lib/shipment.ts:markRefused`
- **Both kinds of records are judged — a proposal and an incident analysis.** — `projects/agent-kit/src/lib/cargo-prose.ts:refusedAnalysesOf`
- **A tree that has no wording check sends as before, and the send says so.** — `projects/agent-kit/src/lib/cargo-prose.ts:proseCheckOf`
- **The record is written by a role of its own, and it writes no files.** — **Not carried out.** Stage 4 of the task: the role stands next to `projects/agent-kit/assets/agents/prose-editor.md`
- **The role writes into the ready-made shape, not into one of its own.** — **Not carried out.** Stage 4 of the task: the shape lies in `projects/agent-kit/assets/templates/proposal.md`, and the machine judges it by `projects/agent-kit/src/lib/proposals.ts:parseProposals`
- **The role is asked for a text, not for a verdict on the work.** — **Not carried out.** Stage 4 of the task

The names of this tree: the wording check is `tools/check-prose-style.mjs`, the send is
`npm run agent-kit:propose`, the proposals lie in `.claude/rt-kit/proposals/`, and the scenarios are
`projects/agent-kit/src/lib/cargo-prose.spec.ts`.
