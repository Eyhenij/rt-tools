# Binding — the judgement of a proposal against the spec

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A proposal is compared with the spec about its resource before it becomes work.** — `tools/cargo-mark.mjs:WORK_STATE` — the state the comparison stands before; the entry into the specs is a neighbouring subdomain.
- **The outcomes are three, and they are named in advance.** — **Not checked by anything.** The outcome is chosen by the executor reading the spec. The machine sees the move of the record and the named spec; the list of the outcomes lives in the rule `cargo-triage`.
- **The move of a proposal into work is refused while the spec it is compared with is not named.** — `tools/cargo-mark.mjs:SPEC_FLAG` — the refusal goes before the network; scenario `SC-AK-948`.
- **The named spec is checked for existence before the network.** — `tools/cargo-mark.mjs:mark` — the path is asked of the disk from the tree root; scenario `SC-AK-949`.
- **An incident analysis is not asked for a spec.** — `tools/cargo-mark.mjs:proposals` — only the records of the kind of a proposal are counted; scenario `SC-AK-951`.
- **The correctness of a proposal is not counted by a machine.** — **Not checked by anything.** There is no sign of correctness, and there will be none. It errs in silence, and the error reads as a verdict.
- **The outcome "the spec is silent" is not turned into work by the executor alone.** — `tools/cargo-mark.mjs:SPEC_FLAG` — the refusal names the lawful move: the question to the person. Scenario `SC-AK-948`.

The names of this tree: the mark command is `npm run cargo:mark`, the state of work is `in_work`,
the suite is `projects/agent-kit/tests/cargo-mark.test.sh`.
