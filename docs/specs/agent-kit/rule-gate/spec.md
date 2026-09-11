# The rules gate

**Status:** in force · **Revision:** 2026-09-10 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `work-conduct`
**Procedures:** none

## Why

A rule lying in the tree is read when it is remembered. The gate picks the rule under an edit
itself: by the path of the file — the domain one, and on top of it the layers by signs invisible in
the path. The subdomain names what a rule is picked by, where the gate's knowledge of the path ends
and what counts as a write and what as a read.

The guards judging the conduct of the work and the state are neighbouring subdomains: the subject
there is different.

## Terminology

- **The domain layer of the gate** — the choice of one rule by the path of the file: an edit has one
  subject, and one rule.
- **A layer on top** — a rule demanded in addition to the domain one by a sign visible not in the
  path but in the text of the edit.
- **The gate map** — a file of the tree that translates the path and the text of the command into the
  names of the rules.
- **A write** — what puts a file: an edit by a tool, a redirection, `tee`, `sed -i`, an interpreter
  with a body. Reading and searching do not count as a write.

### What it is called in the interface

The gate has no interface: only the executor sees it — as the text of a refusal in their own turn.

## Rules

- **The config of the linter demands a rule under it.** The bans in it are the carrying out of the
  rules about types and about styling, and the comments retell those rules by name.
- **The check of repeats demands the rule whose signs it carries out, and only it.** Two refusals in
  a row at an edit of two lines of a comment cost a session, and the second rule read is of no use.
- **The image, the proxy config and the sample of the production environment demand the rule of the
  rollout.** They speak of the server, the ports and the variables the image is raised with, and the
  rule about tasks and branches is silent about all three: it was demanded there because both live
  next to the merge. What is written into these files nobody sees until the rollout, and by then it
  is production that answers.
- **The pipeline demands two rules, and the rollout one goes first.** Its subject is double: which
  checks run before the merge, and what reaches production after it. The set before a push is
  written by the executor every day, while the rollout steps are read once and are the ones edited
  blindly.
- **Creating a working tree loads the rule of delivery.** A fresh tree looks ready and runs into the
  shortage not at once but at the first guard that needs a key.
- **The layers on top of the domain rule are declared by a file of their own, not by lines in the
  gate.** The domain rule is picked once by the path, and there are a dozen and a half layers on top
  of it: together they do not fit into a file that is read whole.
- **A layer demands a rule in addition, not instead of the domain one.** An edit whose subject is one
  and whose signs are several otherwise loses the domain rule — the very one that knows how this file
  is built.
- **A sign invisible in the path is judged by the text of the edit.** Access to the runtime
  environment is visible only in the content, and a gate that knows one path skips it silently.
- **A layer that has nothing to read the text of the edit with lets the action go.** The parse of the
  input is a side duty of the gate, and its breakage has no right to stop an edit.
- **The gate calls the file of the layers in its own shell, not as a separate process.** A layer
  answers by the same variables as the domain choice; a separate process would give them back through
  the disk.
- **The gate map counts as a command a call, not a mention.** A match by substring catches any
  mention: a line about a commit in the body of the commit itself was refused as a commit, and this
  was gone around by rewriting the text, not by the work.
- **A redirection into the empty device and into the error stream does not count as a write.** It
  writes no file, and it looks like a redirection into a file: that is how the output of a reading
  command is muted, and a search over the code with a muted stream demanded a rule on a par with an
  edit. A write next to a muted stream stays visible — what is removed is the redirection, not the
  whole command.
- **An interpreter is checked by its body, not by its name.** It writes by what was handed to it — a
  document at the input or code as an argument; the path standing as its first argument it reads. A
  check by the name made a write of every launch of a check of the tree by the path of its file: a
  session launching a check for the sake of diagnostics got a demand for the rule of common code
  while editing nothing in it; over two tasks about fifteen such refusals accumulated. The price of
  the narrowing: a script that writes files by its own body the gate no longer checks — it was
  checked when it was created, when it was put into the tree.
- **An arrow in the text of a command does not count as a redirection.** The sign in `->` and `=>` is
  the same as at a write into a file, and in the shell they mean nothing: a command printing a table
  with an arrow was declared writing and gave all its paths up to be judged. The closing bracket of a
  markup comment goes there too.
- **The target of a redirection looks like a path, not like a word in words.** A line of a markup
  quotation is indistinguishable from a write into a file by one sign, and only the target tells them
  apart. The price of the narrowing is named: a path typed not in Latin does not count as a write.
- **The paths are taken from the heading of the command, not from the body of a document in place.**
  The body holds the text the command puts into a file, and a foreign path named there in words
  demanded a rule for a write that does not exist. The exception is the interpreter: the code arrives
  to it as a body, and the path of the write stands exactly there.
- **The paths are taken at the writing piece of the command, not at the whole line.** A reading
  command chained with a write otherwise gives its paths up as targets of the write: a rule is
  demanded for the reading of a neighbouring file, and the refusals that fell not on an edit make up
  the majority. A piece is a top-level line, and inside it `;`, `&&` and `||`; the body of an
  interpreter is not torn from its command.
- **A command publishing the body of a task or a request demands the rule of the wording.** This text
  does not become a file of the tree, and a person reads it — and more often than any file: the gate
  checked the extension of the edited file and stayed silent at such a command.
- **Two signs are judged at once: the call of the client and the body in the arguments.** One word
  about a request is not enough — it is in the line of any command that writes about it.
- **The gate forgets the loaded rules when the text of the rules leaves the session.** The gate
  remembers a loading by the sign of the session, and compaction and clearing leave that sign as it
  was while carrying the rule text out: without forgetting, the gate would keep letting the area
  through while the work goes by a retelling.
- **The forgetting is told to the session in words.** A silent one reads as breakage: the summary
  says the rules are loaded, the gate answers that they are not, and the session spends a turn on
  which of the two is right.

## What is out of scope

- The choice of the domain rule by the tree: the gate map belongs to the tree, and the package does
  not write it.
- A rule under a linter config that is not in the tree: the gate stays silent about a rule that was
  not laid out.
- Parsing the shell for real: what looks like a path is taken out of the text, and the sign judges
  them; the surplus it sifts out itself.

## Contract

The surface is the events of the agent: editing a file and calling the shell. The answer of the gate
is either a pass or a refusal with the name of the rule, the law under it and the way to load it.

### Refusal codes

Not applicable: the gate refuses a call before it is carried out, and such a refusal has no command
exit code.

| What happened                                    | How it ends      | What it says                                               |
| ------------------------------------------------ | ---------------- | ---------------------------------------------------------- |
| an edit without the rule loaded                  | the call refused | the name of the rule, the law under it and how to load it  |
| a layer has nothing to read the text of the edit | a pass           | nothing: the side duty of the gate stays silent            |
| a path outside the tree                          | a pass           | nothing: the rules of the tree judge the files of the tree |

## Data

There is no storage of its own: what was loaded during the session is read from the record of the
turn, the map from a file of the tree.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the refusal texts are single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The gate is one for all the trees, and the map of the paths comes from the tree. A tree that laid out
no map gets no gate: the package has no paths of its own.

## Decisions

- **The branch of the rule and the pattern in the gate map stands before the branch of any
  document.** Otherwise they go under the rule of the wording, and that one is about words, not about
  how a thing is built.
- **The layers are moved into a file called from the gate, not into a separate guard.** A separate
  guard would repeat the parse of the input and would diverge from the gate silently.
- **The sign of a call lives in the map, not in the gate.** The gate gives the map the text of the
  command whole, and the parse of the boundaries of a call belongs to whoever judges by that text.
  Rejected: a parse of the command of its own in the shell of the gate — it would diverge from the map
  of the tree silently.
- **The writing piece of the command is picked by the same sign as the whole write.** Having
  diverged, the two checks would start counting different things as a write, and there is nothing to
  notice this by. Rejected: a sign of its own for the piece.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-09-10 — the forgetting of loaded rules on compaction was written down. The hook stood in the
  package with neither an article nor a probe.
- 2026-08-23 — the subdomain was split out of the subdomain of the edit guards, which had outgrown
  the length limit. The rules, scenarios and bindings of the gate moved here as they were: the
  scenario numbers were not recounted.
