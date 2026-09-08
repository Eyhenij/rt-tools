# The receiver of the cargo: so that it does not refuse silently

The receiver takes in the cargo from the trees and gives it out to a person from a screen. It was
created by the line of the observations — for the sake of the cargo having somewhere to arrive — and
everything that did not hinder the cargo from travelling stayed outside its boundary. This epic takes
apart what is left.

The tasks below have one thing in common: **the receiver promises more than is confirmed**. The
agreement about its node lies unmerged, although the node has worked for a month; the loading of a
dump is not checked once; a refusal of the storage leaves nothing in the logs it could be recognised
by; the build passes without the client of the storage and lays a broken bundle. Each of these apart
looks like a trifle, and together they mean that the state of the receiver cannot be judged by what
is written about it.

## What already stands and works

| What                              | Where                                                                   | The state                                                                                               |
| --------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| the receiver                      | a rented node, a name of its own, TLS from the proxy                    | it takes in the cargo of three kinds, it outlives a restart of the node                                 |
| the admin application             | three sections with a list, a selection by the tree and a panel         | the entry by a password, the accounts, an end-to-end set of 27 specs                                    |
| the rollout                       | a working flow from the main branch, an image by the hash of the commit | the first rollout was made by hand — by a right to the registry of the images                           |
| the dump                          | a scenario on the node: the unloading, the loading, a probe             | the probe was run on a copy of the composition of the production; there is no schedule of the unloading |
| the description of the production | the device, the path of a request, the taking apart of the silence      | the pair "the composition and its description" is guarded by the guard of the documents                 |
| the agreement                     | the spec of the domain and its companions                               | merged by the task RT-734: the rules, the scenarios and the bindings are in the spec                    |

## Decisions

- **The epic takes the receiver apart, it does not widen it.** There is not a single new capability
  here: everything that is done either confirms what is already promised or lifts the silence. The new
  goes by tasks of their own and after.
- **A promise not confirmed by a run is counted unconfirmed, not working.** The dump is unloaded every
  night, and that says nothing about it loading: the path of the loading has not gone once, and the
  guard of the destructive actions refuses it on a par with the removal of a volume.
- **A refusal that left no trace is dearer than a refusal.** By the logs of the receiver today an
  unavailable storage cannot be told from a wrong request: both sides are silent the same way.
- **The agreement is merged first, not last.** The section "proposed but not rolled out yet" describes
  what is rolled out, and the older it is, the more convincing it is. The rest of the tasks edit the
  code, and to merge the spec after them means to merge it rewritten a third time.

## The tasks

| №   | Task                                                                         | Why here                                                                                                                                                      |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | RT-734 — the agreement about the node is merged into the spec of the domain  | A text, it does not touch the code. It lifts the lie of the section "not rolled out" and gives the rest of the tasks something to check against               |
| 2   | A refusal of the storage is visible in the logs — #692                       | While the receiver is silent about the refusals, any next check measures the wrong thing. It demands the first one only by the text                           |
| 3   | The build does not pass without the client of the storage — #691             | A broken bundle leaves by the rollout silently. It rolls back by itself                                                                                       |
| 4   | RT-1839 — the loading of a dump and the rollout by the pipeline are run live | Two promises not confirmed once. They go last: before them the tree must build and log                                                                        |
| 5   | The spec of the domain is divided into subdomains                            | 800 lines in the spec and 692 in the scenarios at a limit of 500: they append to the end without rereading the beginning. It goes after the edits of the code |

The order holds to the end of the epic. A reconsideration is a decision of the owner, and it is
written into the progress of the task that called it.

### The first — the agreement about the node

The rules of the agreement are appended into the spec of the domain, the scenarios move with their
former numbers, the bindings are put onto the code that already exists. The directory of the proposed
is removed.

It is closed when there is no directory of the proposed in the spec of the domain, `npm run
check:specs` gives no new divergences, and the scenarios of the node refer to live places in the code.

### The second — a refusal of the storage is visible in the logs

Today a refusal of the storage leaves neither the class of the error nor the text: by the logs an
unavailable storage cannot be told from a wrong request. The task #692.

It is closed when a refusal of the storage writes the class of the error and its text, and there is a
spec for that.

### The third — the build without the client of the storage

The client of the storage is generated by the post-installation and does not travel into the history.
The build of the receiver at an empty directory of it passes green and lays a broken bundle — it
leaves by the rollout and falls already on the node. The task #691.

It is closed when the build at an empty directory of the client refuses and names the reason.

### The fourth — the dump and the rollout are run live

The loading of a dump is not checked once: the guard of the destructive actions refuses it, and the
removal of a volume, and the clearing of the tables. The path of the rollout by the pipeline is not
checked either — the first rollout was made by hand, because the token has no right of a write into
the registry of the images.

It is closed when the loading of a dump gives back a summary and the fitness of the issued tokens, and
the rollout is started from the main branch by the working flow and reached the node.

### The fifth — the spec of the domain is divided into subdomains

The spec grew to 800 lines at a limit of 500, the scenarios — to 692; longer than the limit the spec
was before the merging of the agreement about the node too, 588 lines. Not a single checking counts
the length of a document, so it can grow further: by the beginning of this task it added another
hundred lines against what stood here at the planning of the epic. It goes after the tasks editing the
code: to divide a text they will rewrite themselves means to divide it twice.

It is closed when not a single file of the spec is longer than the limit, the prefix of the scenarios
is not divided between the subdomains and `npm run check:specs` added no divergences.

## What this epic does not do

- It creates no new capabilities for the receiver: neither new kinds of the cargo nor new sections of
  the admin application.
- It does not touch the sending side — it is in the package of the rules and is closed by a line of
  its own.
- It does not take apart the branch `RT-585-accounts-login-backup`: the work there is brought to an
  end and waits for the word of the owner about a push, not for a finishing.
- It creates no second node and does not move the receiver: the node is rented and works.

## Open questions

None. Q-1 — what to confirm the loading of a dump by without spoiling what is taken in — is closed by
the task RT-1839: the probe goes on a disposable container next to it by the command `dump.sh probe`,
and the live storage is not touched.

## What the epic ends with

All five tasks are closed by records in the description of the past. The last step is a probe of the
dump on the node itself: `ssh message-bus 'bash /opt/message-bus/dump.sh probe'` after the rollout
that will bring the scenario; it coincided — the epic is over, and the card is closed by the owner.
The unloading by a schedule the plan spoke of did not stand on the node and is created as the task
RT-1840.
