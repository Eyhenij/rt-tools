# Binding — reading the cargo from the intake

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The cargo is fetched by a command of the tree, not by a person's sign-in to the admin panel.** — `tools/cargo-pull.mjs:pull`
- **The reading is closed by the sign-in of a service account, not by the token of the tree.** — `tools/cargo-pull.mjs:login`
- **The pair of the account lies outside the repository.** — `tools/cargo-pull.mjs:accountOf`
- **A missing pair is refused before the network, and the refusal names where it lies and what it is created by.** — `tools/cargo-pull.mjs:pull`
- **An unknown kind of cargo is refused before the network and lists the known ones.** — `tools/cargo-pull.mjs:KINDS`
- **Next to a record the key it is marked by is printed.** — `tools/cargo-pull.mjs:listLine`
- **The key of a proposal is counted from its text by the same technique as at the intake.** — `tools/cargo-pull.mjs:KINDS`
- **A page reads the texts of the records through.** — `tools/cargo-pull.mjs:withTexts`
- **A record whose text was not read through does not drop out of the list.** — `tools/cargo-pull.mjs:withTexts`
- **The filter by state and by tree leaves in the request line, it is not sifted on one's own side.** — `tools/cargo-pull.mjs:query`
- **The reason of the quarantine is printed next to the record, in the row and in the record whole.** — `tools/cargo-pull.mjs:quarantineMark` and `tools/cargo-pull.mjs:fullLines`
- **An answer of the intake that did not parse differs from a refusal of the intake.** — `tools/cargo-pull.mjs:read`

The names of this tree: the reading command is `npm run cargo:pull`, the mark command is
`npm run cargo:mark`, the setting of the tree is `.claude/rt-kit.json` (the keys `intake` and
`account`), the scenarios are `projects/agent-kit/tests/cargo-pull.test.sh`, and
`npm run agent-kit:hooks` runs them.

The side of the intake the command speaks to lies in this same repository: the sign-in is
`libs/message-bus-api/accounts/feature/`, the reading of the lists is
`libs/message-bus-api/proposals/feature/` and `libs/message-bus-api/postmortems/feature/`. The shape
of counting the sign of a proposal is declared there too, in `libs/message-bus-api/proposals/util/`,
and is repeated here verbatim.

- **A record whose article already stands in the sources of the package is picked by the command, not by eye.** — `tools/cargo-fixed.mjs:fixed`
- **The pick goes by the title of the proposed article and by nothing beyond it.** — `tools/cargo-fixed.mjs:titleOf` and `tools/cargo-fixed.mjs:standsIn`
- **The pick writes nothing outward and prints the mark calls.** — `tools/cargo-fixed.mjs:fixed`
- **Two mark calls are printed: the order of the states is not skipped over.** — `tools/cargo-fixed.mjs:keys`
- **A record taken into work whose work has ended is picked by the same call.** — `tools/cargo-fixed.mjs:stalled`
- **A key from the archive is judged in full.** — `tools/cargo-fixed.mjs:archiveKeys` — the sample looks for sixty-four characters
