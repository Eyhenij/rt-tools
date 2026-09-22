# Cargo outward — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

The anchor here is the word that holds the statement. The audit looks for it across the whole file
and is satisfied by any word, so the name of a field from a foreign line passes it the same way the
needed sentence does — and the statement stays green when the text of the role itself is rewritten
whole.

- **A proposal is unloaded as a file with the address in the heading.** — `projects/agent-kit/src/lib/proposals.ts:parseProposals`
- **The role of the closed-work review writes no files.** — `projects/agent-kit/assets/commands/skill-curator.md:proposals`
- **Only proposals addressed "package" go outward.** — `projects/agent-kit/src/lib/shipment.ts:propose`
- **The sending refuses if a tree address is found in the text of a proposal.** — `projects/agent-kit/src/lib/proposals.ts:leaksIn`
- **Both runs name the blocks judged already sent, and zero of them is named too.** — `projects/agent-kit/src/lib/proposals.ts:skippedAsSentLines` — the selection is split in two by `projects/agent-kit/src/lib/shipment.ts:skipped`, and the lines go into the output of both runs; scenario SC-AK-1090
- **A mark whose value the sending never writes is named as written by hand.** — `projects/agent-kit/src/lib/proposals.ts:ownMark` — the form is written by `markProposals` and read by `OWN_MARK` in the same module; scenario SC-AK-1090
- **A sent proposal is marked by the month that accepted it and does not go a second time.** — `projects/agent-kit/src/lib/proposals.ts:markSent`
- **The intake address is read from a setting of the tree.** — `projects/agent-kit/src/lib/config.ts:intake`
- **Nothing goes outward that a person did not send by a command.** — `projects/agent-kit/src/lib/shipment.ts:propose`
- **An unfamiliar argument ends the sending, it is not skipped silently.** — `projects/agent-kit/src/lib/argv.ts:unknownFlagsIn`
- **The summing-up tells what arrived from several trees from what arrived from one.** — `.claude/commands/agent-kit-digest.md:overrides`
- **Releasing a version stays a separate decision of the owner.** — `.claude/commands/agent-kit-digest.md:ARGUMENTS`
- **The command puts the block on disk and does not go into the network.** — `projects/agent-kit/assets/commands/feedback.md:propose`
- **The block is assembled by the agent, not by the person.** — `projects/agent-kit/assets/commands/feedback.md:ARGUMENTS`
- **A word without a clear address does not turn into a block silently.** — `projects/agent-kit/assets/commands/feedback.md:ARGUMENTS`
- **The block lands in the file of today, not in a file of its own.** — `projects/agent-kit/assets/commands/feedback.md:date`
- **The file of the day is created from a sample if it does not exist yet.** — `projects/agent-kit/assets/commands/feedback.md:cp`
- **The text of a block is checked for a tree address by the same thing everything else is checked by.** — `projects/agent-kit/src/lib/proposals.ts:leaksIn`
- **The command says where the block landed and what it will go away by.** — `projects/agent-kit/assets/commands/feedback.md:dry-run`
- **The cargo goes away at every run of the sending, and the proposals — when there are any.** — `projects/agent-kit/src/lib/shipment.ts:shipmentsOf`
- **The check for a tree address covers the digest, the proposals and the observation lines, but not an incident analysis.** — `projects/agent-kit/src/lib/shipment.ts:leaksOfCargo`
- **A tree address found in the cargo refuses the whole sending, not its own block.** — `projects/agent-kit/src/lib/shipment.ts:propose`
- **The cargo goes into a closed intake, not into an open work queue.** — `projects/agent-kit/src/lib/ship.ts:intakeUrl`
- **The intake address is declared by a setting of the tree, not nailed into the package code.** — `projects/agent-kit/src/lib/shipment.ts:IShipOptions`
- **The tree presents itself to the intake by a token, and the registry holds only its hash.** — `projects/agent-kit/src/lib/cargo.ts:TREE_TOKEN_HEADER`
- **The token is issued and revoked by commands of the receiver.** — `projects/agent-kit/src/lib/shipment.ts:readToken`
- **One record per pair "tree — month": found — appended to, not found — created.** — `projects/agent-kit/src/lib/cargo.ts:IIntakeAccepted`
- **Cargo of each kind is accepted by an operation of its own.** — `projects/agent-kit/src/lib/ship.ts:httpShip`
- **The switch of the observations puts out the sending whole too, together with the snapshot of the overrides.** — `projects/agent-kit/src/lib/observations.ts:OBSERVATIONS_DIR`
- **A tree is created by two ways, and the person chooses by an argument.** — `projects/agent-kit/src/lib/enroll.ts:pathChosen`
- **An issued token does not go into the network.** — `projects/agent-kit/src/lib/enroll.ts:accept`
- **Two arguments together are refused.** — `projects/agent-kit/src/lib/enroll.ts:pathChosen`
- **Not a single argument — the refusal names both ways.** — `projects/agent-kit/src/lib/enroll.ts:pathChosen`
- **The token lands on disk the same way, by whichever way it came.** — `projects/agent-kit/src/lib/enroll.ts:lay`
- **A token that lies there is not overwritten silently by either of the ways.** — `projects/agent-kit/src/lib/enroll.ts:enroll`
- **The checks shared by both ways stand before the fork.** — `projects/agent-kit/src/lib/enroll.ts:enroll`
- **The intake address and the ban on the open way are demanded only by the exchange by code.** — `projects/agent-kit/src/lib/enroll.ts:intakeAllowed`
- **A proposal block names the nearest statement of the resource, and the quotation is checked.** — `projects/agent-kit/src/lib/proposals.ts:nearestMissing`
- **Likeness of texts does not tell a repeat apart, and it is not judged by a threshold.** — `projects/agent-kit/src/lib/proposals.ts:NEAREST`
- **A block is refused by name, and the neighbouring ones go.** — `projects/agent-kit/src/lib/shipment.ts:propose`
- **A refused block stays on disk with a mark and a reason.** — `projects/agent-kit/src/lib/shipment.ts:markRefused`
- **The check for a tree address judges all the ready blocks, not only the departing ones.** — `projects/agent-kit/src/lib/shipment.ts:leaksOfCargo`
- **A real run names the list of the cargo before its results.** — `projects/agent-kit/src/lib/shipment.ts:manifest`
- **A dry run is declared by the first line, not by the ending of a verb.** — `projects/agent-kit/src/lib/shipment.ts:propose`
- **A refusal about a not-found intake address names whom to ask for it.** — `projects/agent-kit/src/lib/enroll.ts:intakeReady` and `projects/agent-kit/src/lib/shipment.ts:refusal` — both refusals name the owner of the intake and the pair "code and address"; scenario `SC-AK-855`
- **Every line of the window leaves, of every event kind.** — `projects/agent-kit/src/lib/observations-cargo.ts:parseObservationLine` — the four kinds are the closed list `OBSERVATION_EVENTS` of the cargo module
- **The lines leave grouped by day, and a day leaves whole.** — `projects/agent-kit/src/lib/observations-cargo.ts:readObservationDays` — one entry per day file of the window, the lines of the file whole
- **The cargo names the working copy it left from, by a checksum of its root.** — `projects/agent-kit/src/lib/observations-cargo.ts:originOf`
- **A load names the kind of its skill.** — `projects/agent-kit/src/lib/observations-cargo.ts:skillKindOf` — the kind by the layout the send reads, `own` for a name the layout does not carry
- **A line leaves as it lies, and nothing is added to it but the kind.** — `projects/agent-kit/src/lib/observations-cargo.ts:linesOfDay` — the kind is added to a load only
- **A broken line does not leave and does not stop the cargo.** — `projects/agent-kit/src/lib/observations-cargo.ts:parseObservationLine` — `null` for a broken or foreign line, and the reader skips it
- **The cargo goes by the same request as the rest, with the tree token, and only by a command.** — `projects/agent-kit/src/lib/shipment.ts:shipmentsOf` — the fourth shipment next to the digest, sent by the same command
- **The check for a tree address covers the observation cargo.** — `projects/agent-kit/src/lib/shipment.ts:leaksOfCargo` — the lines are walked on a par with the digest
- **A resource name the package does not ship leaves as a constant word, not as itself.** — `projects/agent-kit/src/lib/observations-cargo.ts:OWN_RESOURCE` — the name is judged against the laid-out assets by `packaged` and substituted in `linesOfDay`, for every event kind
- **The schema version of the cargo rises.** — `projects/agent-kit/src/lib/cargo.ts:CARGO_SCHEMA_VERSION`
- **The dry run names the observation cargo with the number of lines and days.** — `projects/agent-kit/src/lib/shipment.ts:describe` — the line `observations — строк N за D дн.`
