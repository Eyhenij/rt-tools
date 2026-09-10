# The second development server

**Status:** in force · **Revision:** 2026-09-10 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `work-conduct`
**Procedures:** none

## Why

The applications of the tree are already raised by the owner, and every look through the browser
goes there. A second instance takes another port, serves another build and leads the investigation
astray: the difference between two servers reads as a defect of the edit. On top of that, a build
started in passing kills the raised server without a word.

The subdomain names what counts as raising a server, what passes on a par with it and what the
refusal says instead. The guards of the edit and of the browser are neighbouring subdomains: the
subject there is the edit and the profile, not the ports of the machine.

## Terminology

- **Raising a server** — a command that starts a process listening on a port and keeps it running:
  the framework's serve, the package runner's dev script, a bundler, a static server over a build.
- **The stands of the tree** — the addresses at which the applications are already raised. They come
  from the tree profile; a tree that named none gets a general refusal text.
- **A ready run configuration** — a launch by the name of a saved configuration of the editor. The
  command line is not visible in it at all.
- **The universal executor** — a call of the editor that carries the real command as a nested
  string.

### What it is called in the interface

The guard has no interface: only the executor sees it — as the text of a refusal in their own turn.

## Rules

- **Everything that raises a server is refused, and everything else passes.** Builds, tests,
  linters, requests to the raised ports and a look at the listeners are the work itself, and a
  refusal at them would be paid for on every turn.
- **The refusal names the addresses at which the applications are already raised.** A refusal
  without an address is bypassed rather than carried out: the executor has nowhere to look instead.
- **A ready run configuration is judged by its name, and an unnamed one by the file it is made
  of.** The content is invisible there, and a second server costs more than an extra refusal; a
  launch straight from the manifest is refused for the same reason.
- **The nested command is parsed, not its wrapper.** Otherwise the runner name stands right after a
  quote, and no rule of the guard reaches it.
- **Calls of version control are let through except the one that listens on a port.** Git listens on
  nothing, while the texts of messages and branch names freely hold the words the guard looks for —
  that is how the guard caught its own commit about itself.
- **The start of a call is the start of the line or a command separator.** Without that boundary a
  search through the tree and killing a process by a pattern read as a start.
- **An unrecognised command passes.** The price of a miss here is a second server on a busy port;
  the price of a wrong refusal is a guard nobody keeps.

## What is out of scope

- Where the applications of the tree are raised and what the layout is measured with: the rule of
  verification in the browser and its patterns.
- The content of the page and the conclusions about it: the guard judges the command, not the
  screen.
- The stand of the end-to-end suite: it takes no working ports and is raised by its own command.

## Contract

The surface is the agent's event before a shell command, a terminal call of the editor, a ready run
configuration and the universal executor. The answer is a pass or a refusal by a non-zero exit code
with a text on the error stream.

### Refusal codes

Not applicable: the guard refuses a call before it is carried out, and such a refusal has no command
exit code of its own.

| What happened                              | How it ends      | What it says                          |
| ------------------------------------------ | ---------------- | ------------------------------------- |
| a server raised through the framework      | the call refused | the addresses of the raised ones      |
| a server raised through the package runner | the call refused | the addresses of the raised ones      |
| a static server over a build               | the call refused | the addresses of the raised ones      |
| a run configuration named like a raise     | the call refused | that the content is invisible by name |
| a launch of a script from the manifest     | the call refused | that the script itself is invisible   |
| a build, a test, a request to a port       | a pass           | nothing                               |

## Data

There is no storage of its own: the addresses of the stands are read from the tree profile, and the
command from the input of the call.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

The guard lets the action through when it is itself broken: no input parser, an unrecognised
command, a tree that named no stands — the call is allowed. A broken check has no right to jam the
work.

### Locales

Not applicable: the refusal texts are single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The guard is one for all trees, and the addresses of the stands arrive from the tree. A tree that
named none gets a refusal with a general text; the package has no addresses of its own.

## Decisions

- **A run configuration is judged by its name, though the name says nothing about the content.**
  Rejected: letting every configuration through — that is exactly how a server is raised by two
  clicks past the guard.
- **The word about a start is bounded by the start of a line or a separator.** Rejected: a search by
  substring — under it a search over the tree and a note about the raised server were refused.
- **An unrecognised command passes.** Rejected: refusing everything that holds the words of a raise
  — a guard that stands across the work is switched off on the first day.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-09-10 — the subdomain was created. The guard stood in the package with neither an article nor
  a probe: its behaviour was held by the code and by the comments in it.
