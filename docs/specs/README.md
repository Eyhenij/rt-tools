# The specs of the domains

**A domain here is a package in `projects/` or an application in `apps/`.** A directory per each:
`ui-kit`, `ui-kit-v2`, `core`, `store`, `utils`, `agent-kit`, `message-bus`.

The spec of a package describes the public surface — what it promises the consumer. The spec of an
application describes the subject area: what it takes in, what it keeps and what it refuses by. Both
are written before the code that carries the promise out. Written after, a spec is written by the code
and repeats its mistakes: there is nothing left for it to diverge with.

## The layout

```
docs/specs/<domain>/
    spec.md          — what the domain promises: the surface, the agreements, the boundaries
    scenarios.md     — the scenarios with identifiers; the titles of the tests refer to them
    implementation.md — what every promise is carried out by in the code
    proposed/<feature>/ — the agreement about an unclosed work; it outlives the merge and merges into spec.md
```

An agreement lies in `proposed/<feature>/` while the branch is not merged; by the last commit of the
work it merges into the spec of the domain, and the directory is removed.

The rule is `.claude/skills/spec-driven/`, the law is `docs/constitution/project-documentation.md`.
The conduct of the work is `.claude/skills/task-flow/`.

## What is already written

`agent-kit` — what the package promises the consumer at an installation from nothing, in which place
it is obliged to refuse instead of staying silent and what happens to the descendants of a rejected
law. Next to it is a subdomain about the taking apart of the cargo: what the arrived is read by, what
it means to take a report into work, when a record gets an answer to "what it is fixed by" and when —
to "where to look for the fix".

`message-bus` — the receiver of the cargo and the reading of what is taken in: what the receiver takes
in by four operations, what a tree presents itself by, what lies in the record of the month, what a
person presents themselves by and what they see after the entry — five sections of the admin
application with a list, a selection by the tree and a panel of the details. Next to it is a subdomain
about the shell: the sections in the top row, the popup of the profile, the choice of the theme and of
the language, the screen of the entry and one stack of the toasts. There too is where the receiver
stands: the name and the protected road, the raising of a ready image by a sha, the probe of the
liveness as a sign of a rollout that succeeded and the dump the node is outlived by. Next to it is a
subdomain about the edit of the state: a tree by one query moves its records of the cargo from state
to state, by the same line lays the acceptance of a fixing — what the shortcoming is fixed by — and
the version of the release — where to look for the fix — and an unfit line refuses itself, not the
package, and leaves into the journal of the receiver. The entry of a person stands as a subdomain of
its own: the name and the password, a cookie unavailable to the scripts, the term of the entry and the
commands of the node an account is created by. Next to it is a subdomain about the version of the
release in the lists: the column "В какой версии", a third filter in the strip and an order by the
numbers of the parts, not by the letters of the string. Next to it is a subdomain about the usage of
the rules: the observation lines a tree sends by the day, the counting of loads, sessions and gate
refusals by skill over a period, and the fifth section of the admin application with a table of
skills and a panel of the sessions behind one skill.

`chat` — the chat with the visitors of the sites: a space per client of the service, a key per site,
a list of the addresses the widget is called from, a sign the service issues to a visitor, one live
conversation per visitor and the two operations the first remark arrives by. The widget, the
notifications and the rollout arrive by the following tasks of the epic and are added to this text by
them. Next to it are three subdomains. The reading by the operator: who the operator is, what they
see of their sites and what they do not see at all, two states of a conversation and the reading of
the lists by pages. The stream of the events: how a new remark reaches a screen that is already
open — two subscriptions, the heartbeat while there are no events, and the reading of what was
missed by the minute of the last message. The panel of the operator: the section of the admin
application the operator reads the talks and answers them in — the right of its menu item, the list
with its two narrowings, the feed of one conversation and the remark shown before the service has
answered about it.

`ui-kit` — five subjects of the surface of the first kit, put together from the agreements written
before the code: the button of the copying at an empty cell of a table, the delay of the showing of a
spinner, what a curtain is closed by, the column of the sorting and the outcome of fast repeated
calls. Next to it are two subdomains: the second level of the side menu — the mode of the submenu, a
pinned panel and the search over a submenu; the look of a field of input in the setting of the kit —
where the components take the look of a field from and in which order the values are overridden. The
surfaces of the other components and services the spec does not describe yet.

`ui-kit-v2` — four subdomains. The snapshots of the showcase: what is shot, what a frame is held the
same between the runs by and where the run is obliged to refuse instead of being green. The leaving of
a route panel: whom the guard asks about the edits and where the leaving is cancelled instead of a
loss. The design of the kit: the brand, the graph of the tokens, the completeness of the dark theme
and the contrast. The field of input: what it declares the kind of the value to the browser by. The
surfaces of the other components and services the spec does not describe yet.

## The prefixes of the scenarios

| the domain | the prefix |
| ------------- | -------- |
| `agent-kit` | `SC-AK` |
| `ui-kit-v2` | `SC-UKV` |
| `message-bus` | `SC-MB` |
| `store` | `SC-ST` |
| `ui-kit` | `SC-UK` |

The prefix is one per domain and does not change after the merging: the titles of the tests refer to
the identifiers.

## What is proposed but not rolled out yet

`store` — the agreement that the store gives back no emptiness: the selectors answer by the declared
type even at a state without fields, and a refusal equal to a zero reaches the taking apart. The
domain is created by a word of the owner: until then it lies in `proposed/` and holds the scenarios
`SC-ST`.

## What is not here yet

The specs of the other four packages. The nearest thing that already is and works: the `CONTEXT.md`
next to the family of the components of the second kit and the agreement about the coverage of the
states on the showcase (`docs/adr/0002-ui-kit-v2-state-coverage.md`). The spec of a package does not
cancel them — it gathers the promise whole and ties the scenarios to the tests.
