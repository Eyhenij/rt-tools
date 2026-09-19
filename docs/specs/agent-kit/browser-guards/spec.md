# The browser guards

**Status:** in force · **Revision:** 2026-09-10 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `work-conduct`
**Procedures:** none

## Why

The browser is driven by one pinned profile: it holds the sign-ins, the extensions and the settings
the tree looks at a page for at all. A neighbouring profile answers with an empty page or with a
foreign account, and output taken there speaks of a foreign browser. The subdomain names where the
sign of the pinned profile comes from, what a step aside is refused by — a question to the owner, a
foreign sign, a driver of one's own — and when the guards stay silent.

The other edit guards are a neighbouring subdomain: their subject is not the browser, and they grow
apart.

## Terminology

- **Pinned profile** — the sign of the browser device the tree is allowed to drive. It arrives by an
  environment variable or by a file of the tree.
- **An unconfigured tree** — a tree that named a profile by neither of the two ways. The guards stay
  silent at it: they have nothing to offer instead.
- **A driver of one's own** — raising the browser by a library from inside a script or from code
  passed as an argument, bypassing the extension.
- **The freshness mark** — the trace of a connection to the pinned profile that took place: by it
  the other browser calls learn that the choice is already made.

### What it is called in the interface

The guards have no interface: only the executor sees them — as the text of a refusal in their own
turn.

## Rules

- **The sign of the pinned profile is taken from the environment variable, and where there is none —
  from the file of the tree.** Two sources are needed so that a session can name the profile without
  editing the tree.
- **An unconfigured tree hears that it is unconfigured but loses no work.** The helper says into the
  error stream what is missing and leaves with zero: silence would read as permission to drive the
  browser by any profile.
- **The word about being unconfigured is said once per session.** A line on every call drowns in the
  output and stops being read.
- **A question to the owner about choosing a browser is refused.** The profile is pinned, and it can
  be the only answer; the refusal names the device sign itself, otherwise it is bypassed rather than
  carried out.
- **The word "browser" in the name of a rule or of a hook does not make a question a choice
  question.** Otherwise the refusal could be bypassed only by rewriting the question without that
  word, that is by distorting it.
- **Listing and switching browsers is refused: the profile is picked by the pinned sign alone.**
  The names a listing returns identify nothing and change from call to call, and a pick out of them
  lands in a profile nobody signed in to.
- **A foreign device sign is refused before the call, and the freshness mark is set by its
  outcome.** Before the call all that is known is that the profile was requested; the session is
  marked by a connection that took place.
- **Raising the browser by a driver of one's own is refused, and the refusal names the file.** In
  the command line such a launch is not visible at all — there stand only the interpreter name and a
  path.
- **Code passed to the interpreter as an argument is judged by the same sample as a file.** The
  sample is judged together with the interpreter name and its code flag, so a search for that same
  word across the tree passes.
- **Without a pinned profile the guards let through both the question and a driver of one's own.**
  They have nothing to offer instead, and a blind refusal would lead the work into a dead end.
- **The browser choice goes stale, and a call after a pause demands choosing anew.** The extension's
  active browser drifts away over the pause, and a choice made earlier is silent about it.
- **The reason for a refusal about the choice arrives as a field of the answer.** What is said into
  the error stream does not reach the executor at all: they see empty output and read the browser
  calls failing one after another as a breakage of the extension.

## What is out of scope

- Where the tree's applications are up and what the layout is measured with — the rule
  `browser-verification` and its patterns.
- The content of a page and the conclusions about it: the guards judge what the browser is driven
  by, not what is on the screen.

## Contract

The surface is the agent's events: calls of the browser extension, a question to the owner and a
shell command. The guard's answer is either a pass or a refusal with a text naming the pinned device
sign.

### Refusal codes

Not applicable: the guard refuses a call before it is carried out, and such a refusal has no command
exit code.

| What happened                               | How it ends      | What it says                               |
| ------------------------------------------- | ---------------- | ------------------------------------------ |
| a foreign device sign was requested         | the call refused | the pinned sign                            |
| a question to the owner about a browser     | the call refused | that the profile is pinned, and which one  |
| the browser raised by a driver of one's own | the call refused | the file or argument the entry point is in |
| a listing or a switch of browsers           | the call refused | the pinned sign to select by               |
| the profile is not named by the tree        | a pass           | once per session — what is missing         |
| the browser choice went stale               | the call refused | the age of the choice and the pinned sign  |

## Data

There is no storage of its own: the profile sign is read from an environment variable or a file of
the tree, the freshness mark lives in the temporary file directory and dies with the session.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

The guard lets the action through when it is itself broken: no input parser, empty input, an
unconfigured tree — the call is allowed. A broken check has no right to jam the work.

### Locales

Not applicable: the refusal texts are single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The guards are one set for all trees, and the profile sign arrives from the tree. A tree that did
not name it gets no guards at it; the package has no sign of its own.

## Decisions

- **The profile is read from the environment variable before the file of the tree.** A session that
  needs another profile names it by the environment and edits no tree. Rejected: one source, the
  file.
- **An unconfigured tree the guards let through, not refuse.** A refusal without a profile named
  instead leads the work into a dead end. Rejected: refusing everything while the profile is not
  named.
- **A question about the choice is judged by the words of the question, not by the intent.** The
  guard has no understanding of meaning, and the set of samples is the only thing that tells a
  question from a conversation about browsers. Rejected: judging by the topic of the turn.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-09-10 — the refusal of a listing and of a switch was written down. The guard stood in the
  package from the start with neither an article nor a probe: its behaviour was held by the code
  alone.
- 2026-09-04 — the freshness of the choice and the channel of the refusal reason were written down:
  the freshness guard stood in the package from the very beginning, and the spec was silent about it.
- 2026-09-03 — the subdomain was split off from the subdomain of the edit guards, which had outgrown
  the length limit. The scenarios moved here unchanged: the numbers were not recounted. The rules and
  the bindings were written down on the move — before that these guards had a list of scenarios and
  not a single article.
