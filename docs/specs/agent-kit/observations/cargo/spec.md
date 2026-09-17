# Cargo outward

**Status:** in force · **Revision:** 2026-09-14 · **Scenario prefix:** `SC-AK`
**Depends on:** `message-bus` (where the cargo goes and where the marking goes)
**Laws:** `observability`, `work-conduct`, `delivery`, `frontend-application`, `verifiability`
**Procedures:** none

## Why

What a tree learned about the rules layer is useful to whoever edits the layer, and they see only
what arrived. The subdomain names what goes outward and how: the digest with the snapshot of the
overrides, the proposals addressed "package" and the incident analyses; what a proposal lands on
disk by — the review of a closed task or a word mid-work; how a tree is created in the intake and
what it marks its records with after the review.

Nothing goes outward that a person did not send by a command: not one guard goes into the network.
The observations themselves, the digest and the snapshot of the overrides are the neighbouring
subdomain "Observations" next to it.

## Terminology

- **A proposal** — a ready wording of an edit with an address. It is brought by the role of the
  closed-work review, unloaded as a file by the main agent, sent by a person with a command.
- **The address of a proposal** — one of three: "package" — an edit of a resource, "companion" — the
  names of this tree at the rule, "tree" — an override.
- **A word** — a person's remark mid-work: what gets in the way, what was missing, what worked
  wrongly. It has no address until it is taken apart.
- **A block** — a proposal written into a file: a heading with the address and the resource, the
  place, the occasion, what it is closed by and the ready text.
- **The file of the day** — the file of proposals for one working day, not for one remark: the
  blocks of one day lie in it side by side.
- **A sending** — carrying the cargo away into the intake: the digests of the observations, the
  proposals addressed "package" and the incident analyses.
- **Cargo** — what goes away by a run of the sending.
- **The observation cargo** — the fourth kind of cargo: the observation lines of the window of the
  run, grouped by day, plus the kind of every loaded skill — a rule of the package, a pattern of the
  package, another skill of the package, a skill of the tree's own.
- **The working copy sign** — the checksum of the root of the working copy; one tree has several
  copies with one tree sign, and the intake tells their days apart by this sign.
- **The intake** — a closed service accepting the cargo by a request; one's own, not someone else's
  work queue.
- **The intake address** — the address of the intake service; declared by a setting of the tree, not
  nailed into the package code.
- **The tree token** — what the tree presents itself to the intake by; the registry holds only its
  hash.
- **A summing-up** — taking apart the accumulated records and observations into a list of resource
  edits.
- **An issued token** — a tree token a person got in the intake admin panel and holds in hand.
- **An exchange by code** — the former way of creating: the command carries a one-off code and gets
  a token in answer.
- **A marking** — one call of the command: the state and the cargo records it moves into it.
- **The key of a record** — what the tree names its record by: the file name for an incident
  analysis, the sign for a proposal.
- **A refused record** — a record the intake did not move: the tree does not have it, or the
  transition is not allowed.
- **A dry run** — a run that prints what would go away and does not go into the network.

### What it is called in the interface

| In the agreement                | In the launch line                                                  |
| ------------------------------- | ------------------------------------------------------------------- |
| the sending of the cargo        | `agent-kit propose [--dry-run]`                                     |
| creating by an exchange by code | `agent-kit enroll --code <code>`                                    |
| creating by an issued token     | `agent-kit enroll --token <token>`                                  |
| the summing-up                  | the summing-up command over a stretch of days                       |
| unloading the proposals         | a step of the closed-work review command                            |
| a word mid-work                 | the feedback command, a remark in prose                             |
| marking an analysis             | `agent-kit mark --state <state> --postmortem <file name>`           |
| marking a proposal              | `agent-kit mark --state <state> --proposal <sign>`                  |
| a dry run of the marking        | `agent-kit mark --state <state> --postmortem <file name> --dry-run` |

## Rules

- **A proposal is unloaded as a file with the address in the heading.** The closed-work review
  already gives every proposal one of the three addresses; the file keeps it by a heading a machine
  reads, not by a retelling.
- **The role of the closed-work review writes no files.** The unloading is done by the main agent as
  a step of the command. The ban on the role editing files holds the very thing it was created for:
  the rules act on all future sessions.
- **Only proposals addressed "package" go outward.** "Companion" and "tree" are about the names and
  overrides of this tree, and they have nothing to do in the intake.
- **The sending refuses if a tree address is found in the text of a proposal.** An absolute path, the
  root of the tree, a foreign namespace of the package — a refusal with the line number instead of
  the sending. The ban on naming a foreign tree is held by a check, not by the memory of whoever
  writes.
- **A sent proposal is marked by the month that accepted it and does not go a second time.**
  Otherwise a second launch of the command puts a second record about one edit into the intake.
- **Both runs name the blocks judged already sent, and zero of them is named too.** The mark field
  was read by its presence, and its value was of no concern: one written by hand — and it gets
  written by whoever fills the field out of habit — meant "gone", so the block never went, and the
  dry run did not show it either. Twenty-six blocks lay like that over nine days in one tree, and
  from outside it looked as if no reviews had happened at all. Silence about the skipped reads as
  "there was nothing to skip", and the reader has nothing to tell one from the other by.
- **A mark whose value the sending never writes is named as written by hand.** The sending writes
  its own value in one form; everything else in that field was put there by a person, and almost
  always it is the word "нет", meaning exactly the opposite of what it says. The form is declared
  once and next to its reader: an own copy of it would drift silently, and a block with a real mark
  would read as written by hand while a hand-written one stopped being named.
- **The intake address is read from a setting of the tree.** Nailed into the code, it would name a
  foreign tree in the package texts, and it would leave the tree no choice of where to send.
- **Nothing goes outward that a person did not send by a command.** Not one guard goes into the
  network, there is no background sending.
- **An unfamiliar argument ends the sending, it is not skipped silently.** The only action of this
  command is irreversible and goes outward, and "the argument is surplus" is here
  indistinguishable from "the command did nothing": a call with the help argument, made for the sake
  of the list of modes, sent everything accumulated into the intake. The refusal comes before the
  first network call and names the arguments of the command.
- **The summing-up tells what arrived from several trees from what arrived from one.** What repeated
  at two is an edit of the package; a one-off is an override of the tree, and the summing-up says
  this outright.
- **Releasing a version stays a separate decision of the owner.** The summing-up prepares the edits
  and a draft of the record in the changelog and ends at that.
- **The command puts the block on disk and does not go into the network.** The line starts no
  background sending, and a remark that went away instantly goes away before its author managed to
  re-read it. The sending stays a separate step, and the command names it aloud.
- **The block is assembled by the agent, not by the person.** The person speaks in prose; the
  address, the resource and the ready text of the edit are known to whoever has the rule itself in
  their context. Asking a person for the identifier of a resource means demanding they remember the
  very thing the rules layer was created for.
- **A word without a clear address does not turn into a block silently.** The address is a choice
  between an edit of the package, of the companion and of the tree's override, and a wrong one takes
  the edit into a foreign repository. An unclear address is asked of the person by one question, it
  is not assigned by a guess.
- **The block lands in the file of today, not in a file of its own.** The closed-work review and the
  remark mid-work have one addressee and one format; a second file next to it would mean the sending
  reads two places, and the person does not remember which their word lies in.
- **The file of the day is created from a sample if it does not exist yet.** The shape of the heading
  is no decoration: the sending picks by it what goes outward, and a block without an address in the
  heading goes nowhere.
- **The text of a block is checked for a tree address by the same thing everything else is checked
  by.** A remark mid-work names the files a person stumbled over more often than an analysis does:
  it is about "this thing here", not about the rule in general.
- **The command says where the block landed and what it will go away by.** Otherwise a word that
  landed on disk reads as sent, and the person waits for an answer nobody sent for.
- **The cargo goes away at every run of the sending, and the proposals — when there are any.** A run
  without remarks also says what was used, what was not used once and what the tree overrode; a
  sending built around a proposal lost these data.
- **The check for a tree address covers the digest, the proposals and the observation lines, but not
  an incident analysis.** An analysis by its nature names the files of the tree where the miss
  happened, and a check covering it would refuse every sending of it. The rest of the cargo is checked
  on the carrying-out side — the same place as before.
- **A proposal block names the nearest statement of the resource, and the quotation is checked.** An
  incident analysis ends with a proposal to append an article to the very resource the miss already
  described: the article stands, and the block proposes a second one about the same, and from outside
  such an analysis is indistinguishable from one that ended in a fix. The field is mandatory so that
  the resource is read; the quotation is looked for in it, and one not found refuses the block. There
  is no nearest one at all — that is said as a word.
- **Likeness of texts does not tell a repeat apart, and it is not judged by a threshold.** A
  measurement on live blocks: a lawful neighbourhood of two articles of one rule gives 0.345 of
  shared significant words, a lawful move of a good article to a neighbouring place gives 0.355. The
  ranges overlap, and a threshold would refuse edits instead of repeats. The named quotation is
  judged by fact: it is either in the resource or it is not.
- **A block is refused by name, and the neighbouring ones go.** One unread resource is no reason to
  hold up someone else's work: the refusal names the file, the line of the block and the reason.
- **A refused block stays on disk with a mark and a reason.** A deleted one is written anew by the
  next session — there is no trace of the analysis, and the repeat comes back. The mark holds both:
  it is visible that there was an analysis, and visible why it did not become an edit.
- **The check for a tree address judges all the ready blocks, not only the departing ones.** One
  refused by the quotation lies on disk and will go as soon as it is fixed — and a leak found in it
  refuses the whole sending and must be named at once, not hide behind the refusal.
- **A tree address found in the cargo refuses the whole sending, not its own block.** The refusal is
  taken apart by a person, and "two of three went" they will read as "everything is fine".
- **The cargo goes into a closed intake, not into an open work queue.** The digest speaks of the
  working habits of the team: what is used, what is stumbled over, how many times a miss was
  admitted. In an open queue that is laid out for all the world.
- **The intake address is declared by a setting of the tree, not nailed into the package code.**
  Nailed in, it would name a foreign tree in the package texts.
- **The tree presents itself to the intake by a token, and the registry holds only its hash.**
  Neither in the environment variables of the intake nor in its rollout are the tokens themselves: a
  leaked rollout gives no access.
- **The token is issued and revoked by commands of the receiver.** A revoked one stops being accepted
  at once, and the tree learns of this by a refusal of the sending, not by silence. The admin panel
  does not replace them: there is nothing to create the first account with anyway except a command.
- **One record per pair "tree — month": found — appended to, not found — created.** Otherwise the
  monthly picture of the tree scatters across the runs, and it can be gathered only by a query.
- **Cargo of each kind is accepted by an operation of its own.** The digest, a proposal and an
  incident analysis are built differently, and a shared operation "accept something" would shift the
  parse of the shape onto the receiver.
- **The switch of the observations puts out the sending whole too, together with the snapshot of the
  overrides.** The tree setting key switches the writing off whole, not in parts, and a snapshot
  going away with the writing switched off would bypass the switch in exactly the place it was
  created for.
- **A tree is created by two ways, and the person chooses by an argument.** An invitation code is
  exchanged for a token, an issued token is put as it is. One way for all would mean a token issued
  in the admin panel could not be applied by anything.
- **An issued token does not go into the network.** There is nothing to exchange it for, and the
  intake is not asked about it: the intake issued it. A call for confirmation would add a refusal
  where everything is right.
- **Two arguments together are refused.** These are two ways to one and the same, and a silent choice
  of one of them would hide from the person that they named the second in vain.
- **Not a single argument — the refusal names both ways.** A refusal naming only the former way makes
  the second one non-existent for the person.
- **The token lands on disk the same way, by whichever way it came.** The same file, the same rights
  "read and written by the file owner alone". Different rights at the two ways would mean security
  depends on how the tree was created.
- **A token that lies there is not overwritten silently by either of the ways.** A created tree would
  lose the link with its former cargo; a deliberate overwrite is declared by an argument of its own.
- **The checks shared by both ways stand before the fork.** A token that lies there and an unfilled
  file key are judged before the way is chosen: put after it, they would defend only one of them.
- **The intake address and the ban on the open way are demanded only by the exchange by code.** A
  token that goes nowhere is not read over the open way, and demanding TLS of a way without a network
  means refusing the creating where there is no threat.
- **A refusal about a not-found intake address names whom to ask for it.** The setting key answers
  "where to write it" and does not say where to take it from: the package does not know the address —
  the intake is raised by the owner, and every workshop has its own. An executor with the cargo ready
  and an invitation code got this refusal and did not know that the address had to be asked, and
  asked of the owner.
- **A real run names the list of the cargo before its results.** What will go and where is read
  before it has gone: otherwise a refusal at the second request leaves the person with one line about
  it and without the list showing what that refusal cost.
- **A dry run is declared by the first line, not by the ending of a verb.** "Went" and "would have
  gone" differ by two letters at the tail, and the lines under them are identical to the character:
  the output of a dry run reads as work done, and there is no trace outward at that. The first line
  says that nothing went outward, and names the call that really does it.

### The observation lines

- **Every line of the window leaves, of every event kind.** A load, a refusal of the rules gate, a
  refusal of a guard, an outcome of the push gate: the intake counts loads first, and a second
  edition of the cargo for the refusals would cost a second edition of the storage.
- **The lines leave grouped by day, and a day leaves whole.** The intake replaces a day whole; a day
  sent by halves would be replaced by its second half.
- **The cargo names the working copy it left from, by a checksum of its root.** One tree has several
  working copies with one tree sign and separate observation files; a day replaced by the tree alone
  would keep whichever copy sent last and drop the other. The path itself does not leave.
- **A load names the kind of its skill.** A rule of the package, a pattern of the package, another
  skill of the package, a skill of the tree's own: the kind is read from the layout of the package
  at the minute of sending — a name the package laid out is its kind, anything else the tree's own.
  The tree's own skills leave by name: the owner asked for what the trees wrote for themselves.
- **A line leaves as it lies, and nothing is added to it but the kind.** The session sign stays a
  checksum, the path is absent as before; the cargo carries no more about the tree than the digest.
- **A broken line does not leave and does not stop the cargo.** The reading of the day file skips it,
  as the digest does: an observation is a side record of a guard.
- **The cargo goes by the same request as the rest, with the tree token, and only by a command.** No
  background sending: the line "nothing goes outward that a person did not send by a command" holds.
- **The check for a tree address covers the observation cargo.** After the substitution below a
  resource name is always a package name, so what is left to judge are the free fields of a line.
- **A resource name the package does not ship leaves as a constant word, not as itself.** A tree
  names its own rules after itself — `rt-tools-storybook` in the tree `rt-tools` — and such a name
  carries the tree address into the cargo, where the leak check finds it and refuses the whole
  send: a tree with such names could send nothing, ever. The package has no use for the name of a
  rule it does not ship, and that a load was of the tree's own the intake reads from the kind
  beside it. A refusal line carries no kind, so the substitution covers every event, not the load
  alone.
- **The schema version of the cargo rises.** A tree on the former edition sends three kinds, and the
  intake takes them as before; the version says which edition the lines came from.
- **The dry run names the observation cargo with the number of lines and days.** What leaves is
  read from the print, not remembered.

## What is out of scope

- The sending and the summing-up under a second and a third hosting: they go in the same shape as the
  present tools of creating a task.
- Sending from the feedback command itself: only what was called separately goes outward.
- Editing blocks already lying there: what is said a second time lands as a second block, and whoever
  sends brings them together.
- A queue and a storage of its own at the feedback command: the file of proposals is the queue, and
  it empties by the sending.
- Taking a remark apart without a person's word: the command is called by hand and listens to nothing
  itself.
- **Editing the cargo from the web.** The receiver accepts, the admin panel reads; the text of a
  record is edited by neither side, and the state is edited by the tree with a marking.
- **An agent tool for the intake.** The cargo goes away by a launch line, and connecting the receiver
  to the agent in every tree is not required.
- **A separate periodic sending command.** Its place is taken by the step of the closed-work review:
  the person already has the command, and a second one they have to remember does not live to the
  second month.
- **Direct issuing of a token in the intake admin panel.** That is the receiver's side, its own work.
- **Removing the tree sign and checking it against the token.** Named by the owner as separate work.
- **Self-registration of a consumer.** A separate epic: a tree is created by a person, not by itself.
- **Bringing snapshots from several trees into one summary.** The shape of the summing-up is checked
  on live data when there are three trees; until then the cargo lies as records, and the summary is
  gathered one-off.
- **Choosing the records that have to be marked.** What the executor decides by what to take into
  work and what to mark is the task about the working order of taking the cargo apart.
- **Reading one's own cargo from the intake.** The marking goes by the named keys and reads no lists.
- **Accepting a fix and the release version at a record.** They land by the same way, but by tasks of
  their own.
- **Cargo in the marking.** It goes by a call of its own: the run of the sending does not carry it,
  and it carries no cargo.
- **Keeping what is marked in the tree.** What is already marked is remembered by the intake, not by a
  file in the tree.
- **The observations themselves, the digest and the snapshot of the overrides.** What a tree writes
  about itself and how it counts is the neighbouring subdomain "Observations".

## Contract

The sending carries into the intake the digest, the observation lines of the window, the proposals
addressed "package" and the incident analyses, and on a dry run prints what would go away and sends
nothing. The observation lines go by a request of their own, `POST /api/intake/observations`, with
the body `{ schema, tree, origin, days: [{ day, lines: [{ t, ev, res, kind?, sid, v, skill? }] }] }`;
the form is declared once, in the cargo module of the package, and the intake reads it from there. It exits with zero when the
work is done or there was nothing to do.

The marking takes the intake address and the tree token from the same setting as the sending, and
calls the operation of editing the state. It retells the intake's answer to the person: how many
records were moved, how many already stood in this state and which are refused.

The arguments of the marking:

- `--state <state>` — the state the records are moved into; one per call.
- `--postmortem <name>` — an incident analysis by the name of its file; the argument repeats.
- `--proposal <sign>` — a proposal by the sign of its text; the argument repeats.
- `--fix <what it was fixed by>` — the text of the fix; it lands at every record of the call, and
  without the argument the line goes as it was.
- `--release <release label>` — the release version; mandatory at the transition to "released" and
  not taken at the rest.
- `--dry-run` — a dry run: prints what would go away and does not go into the network.

The feedback command stands next to the launch line, not in it: its surface is a person's remark in
prose at the input and a line of answer at the output, where the path of the file of the day and what
the block will go away by are named. It has no exit code of its own, and it has no default address on
purpose — an unclear one is asked by a question. It does not go over the network once.

### Refusal codes

Not applicable: the answer is an exit code and text, not named codes.

| What happened                                             | Code | What it says                                                                         |
| --------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------ |
| there is no package setting in the tree                   | `1`  | to start with creating the setting                                                   |
| a tree address is found in the text of a proposal         | `1`  | the file, the line and what exactly was counted as an address                        |
| there are no proposals addressed "package"                | `0`  | how many there are with other addresses and where those go                           |
| the intake did not answer or did not accept the cargo     | `1`  | what went before the refusal, what the intake answered and what to do with the token |
| both arguments of creating together, or none              | `1`  | which arguments are named and which to keep, and without them — both ways            |
| the token file already lies there, no overwrite named     | `1`  | that the tree is created, and by which argument to overwrite deliberately            |
| there is no tree token in the setting, and a marking goes | `1`  | that the tree is not created, and what it is created by                              |
| the state of the marking is not named or unfamiliar       | `1`  | which states there are                                                               |
| not a single record in the arguments of the marking       | `1`  | that there is nothing to mark, and by which argument a record is named               |
| the intake refused at least one record of the marking     | `1`  | which records are refused and for what reason                                        |
| all the records of the marking are moved or stood so      | `0`  | how many were moved and how many already stood                                       |

## Data

**A proposal** — a block in the file of the day: the address, the package resource, the place in it,
the ready text, the occasion, what it is closed by — which overrides of the tree the arrived edit
will remove — and, after the sending, a link to the created record. It is put by two movements — the
closed-work review and the feedback command — and the file of both is one: the one for today.

**The marking** creates and edits no files of its own in the tree: it reads the intake address and
the tree token from the package setting, and the state of a record lives at the intake.

## Screens and states

The package has no screens. The feedback command has no screen of its own either: the person sees its
answer as a line.

| State                        | What it is visible by                                         |
| ---------------------------- | ------------------------------------------------------------- |
| the block landed             | the answer names the file path and the number of blocks in it |
| the address is unclear       | a question to the person before anything is written           |
| there was no file of the day | the answer says the file was created from a sample            |

## Cross-cutting requirements

### Locales

Not applicable: the output of the launch line is single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The cargo of one tree lies in the intake under its sign and token: the record for the pair "tree —
month" is its own for each, and a tree can neither read nor mark someone else's cargo.

## Decisions

- **The role of the closed-work review stays non-writing.** Rejected: giving it a writing tool — that
  would lift the ban the role was created for.
- **The cargo goes into a closed intake, not into a work queue and not by a PR.** The
  digest speaks of the working habits of the team, and in an open queue that is laid out for all the
  world; and the edit of a rule's text is made by whoever sees the other consumers — an agent from a
  foreign tree would write it blind. Rejected: a record in the package work queue; an automatic merge
  request into its repository.
- **The feedback command is carried by the package, not created by the tree.** The rules layer is one
  for all the trees of the workshop, and feedback about it is needed by every one.
- **The shape of the feedback is a command for the agent, not a subcommand of the launch line.**
  Parsing prose into an address and a resource is something whoever has the rule in their context can
  do; a program cannot do it at all.
- **The intake is worked by a closed service of its own, not by someone else's work queue.** The
  owner's decision. The work queue of the package repository is open to all the world, and the cargo
  in it would lay the team's working habits outward. A closed intake also removes the question of
  access: a token is issued to the tree, and nobody needs rights in the package repository. The role
  that took apart the need proposed the opposite — to replace the service with a private repository;
  the owner read the argument and confirmed the decision.
- **An issued token comes as an argument, not as a file or an environment variable** — the person
  holds it in hand right after it is issued, and a surplus step "put it into a file" would bring back
  the same problem. Rejected: reading from an environment variable — the token then stays in
  everyone's shell history.
- **There is no confirmation of an issued token at the intake** — the intake issued it. Rejected: a
  probing call — it demands the intake address and a network where neither is needed.
- **The intake and its admin panel live as applications of their own in this monorepo.** The cargo
  types are shared with the package, so the format will not drift apart silently.
- **The cargo was of three kinds: the digest, the proposals, the incident analyses.** The proposals
  the package could already send; the analyses went nowhere and lay only in the tree they happened
  in. The fourth kind, the observation lines, came with the usage statistics of the intake.
- **The cargo is the digest, and a proposal is attached to it.** The former order built the sending
  around a proposal, and a run without remarks lost the data about which rules were loaded and what
  the tree overrode.
- **The switch puts out the snapshot of the overrides too — an assumption of the executor.** The
  argument is taken from an article of the spec in force: the package stands with those we know
  nothing about too, and writing without the tree's knowledge is not allowed.
- **An updatable record for the pair "tree — month".** A new record for every run would scatter the
  monthly picture of the tree across the runs, and it could be gathered only by a query.
- **A separate periodic command is not created.** Its place is taken by the step of the closed-work
  review. Rejected: a gathering command of its own into the tracker.
- **The marking goes by a call of its own, not by an argument of the sending.** The argument: the
  sending carries the cargo outward by the schedule of the run, and the marking is put when the
  review is done. An argument at the sending was rejected.
- **One state per call, as many records as you like.** The argument: a review ends with a batch of
  records at one step, and the call is read whole. A list of lines from a file or a stream was
  rejected: its format will be needed by the working order of taking the cargo apart, and invented
  before its consumer it would diverge from it.
- **A refused record gives a non-zero exit code.** The argument: zero reads as work done, and a
  refused analysis would stay unmarked silently. Zero with a printout of the refused was rejected.
- **Raw lines, not a month block inside the digest.** The owner chose the raw lines; a block would
  keep the counts without the sessions and the days. Rejected: a month block, counted by the tree.
- **The kind is counted by the sender, not by the intake.** Only the tree knows its layout; the
  intake knows no package. Rejected: a list of package names at the intake.
- **The tree's own skills leave by name.** The owner's answer; the line of the observations cargo
  spec that only package names leave is reworded at the merge. Rejected: one line "own" with a count.
- **A day is the unit of replacement.** The day file is the unit on the disk, and the windows of
  runs overlap by days; the intake needs no sign of a run. Rejected: a run id and dedup by line.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-09-14 — the agreement of task RT-2098 about the observation lines leaving for the intake was
  merged in: ten rules, scenarios `SC-AK-1099`…`SC-AK-1103`, bindings on the reading of the days and
  the sending. The question of the window length of the observation cargo went to the domain spec.
- 2026-09-05 — the subdomain was split out of the observations spec, which had outgrown the length
  limit. The rules, scenarios and bindings of the proposals, the sending, the creating of a tree and
  the marking moved here as they were: the scenario numbers were not recounted.
- 2026-08-21 — one rule of the agreement of task RT-911 was merged in: the marking command carries the
  release version by the argument `--release`. The rule created no scenario of its own: the promise is
  checked by `SC-MB-207` of the receiver domain — the number was issued there and is tied to the test
  title. The rest of that agreement landed in the receiver specs.
- 2026-08-21 — one rule of the agreement of task RT-910 was merged in: the marking command carries the
  text of the fix by the argument `--fix`. The rule created no scenario of its own: the promise is
  checked by `SC-MB-191` of the receiver domain — the number was issued there and is tied to the test
  title, and recounting it would mean tearing that link. The rest of that agreement landed in the
  receiver specs.
- 2026-08-20 — the agreement of task RT-909 about the command of marking the cargo state was merged
  in: thirteen rules, scenarios `SC-AK-427`…`SC-AK-432`, bindings on the command and its arguments.
  The state of a record is edited by the tree, and the receiver guards the order of the transitions —
  the subdomain of editing the state at the receiver domain.
- 2026-08-19 — the agreement about creating a tree by an issued token was merged in: eight rules,
  scenarios `SC-AK-283`…`SC-AK-287`, bindings on the creating command.
