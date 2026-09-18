# Binding — the state mark of a cargo record

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The mark is set by a command of the package, not by a request made by hand.** — `tools/cargo-mark.mjs:main`
- **One mark carries one state and any number of records.** — `tools/cargo-mark.mjs:itemsOf`
- **Records of both kinds leave by one request.** — `tools/cargo-mark.mjs:mark`
- **The records are named by the same keys they arrived by.** — `tools/cargo-mark.mjs:itemsOf`
- **The sign of a proposal is counted the same way as at the intake.** — `tools/cargo-mark.mjs:itemsOf`
- **The sign of the tree is counted by one technique on the send and on the mark.** — `tools/cargo-mark.mjs:treeSlug`
- **An empty sign of the tree is refused before the network.** — `tools/cargo-mark.mjs:mark` — the refusal stands before the token check; the sign comes from `tools/cargo-mark.mjs:treeSlug`
- **An unknown state is refused before the network.** — `tools/cargo-mark.mjs:mark`
- **A call without records is refused and names what is missing.** — `tools/cargo-mark.mjs:mark`
- **Without the token of the tree the command goes to no network.** — `tools/cargo-mark.mjs:mark`
- **A dry run prints what would leave and goes to no network.** — `tools/cargo-mark.mjs:mark`
- **The records the intake refused are printed by name, with a reason.** — `tools/cargo-mark.mjs:mark`
- **A mark that moved nothing ends with a non-zero code.** — `tools/cargo-mark.mjs:mark`
- **Neither the token of the tree nor the text of a record reaches the output.** — `tools/cargo-mark.mjs:callIntake`
- **The intake answers with a count, and the command retells it to the person.** — `tools/cargo-mark.mjs:mark`
- **The launch-line command carries the fix text as an argument.** — `tools/cargo-mark.mjs:FIX_FLAG` — the argument is read by the launch line and lands on every record of the call
- **The launch-line command carries the release version as an argument.** — `tools/cargo-mark.mjs:RELEASE_FLAG` — the argument is read by the launch line and lands on every record of the call
- **The launch-line command carries the reason of the quarantine as an argument.** — `tools/cargo-mark.mjs:QUARANTINE_FLAG` — the argument is read by the launch line and lands on every record of the call
