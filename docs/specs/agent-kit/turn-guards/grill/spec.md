# The guard of the conversation

**Status:** in force · **Revision:** 2026-10-09 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`
**Procedures:** none

## Why

One guard of the domain "The guards of the end of a turn" judges the questions to the owner, and its
scenarios grew until the scenario file of the domain ran past the length limit. The subdomain is
split off so that the rules of this guard are read together: whether the rules were read before a
question, whether the owner has already answered it, and when the menus are over.

## Terminology

- **The first sign** — the rules layer was not read in the turn that asks a question.
- **The second sign** — the owner has already answered the question in a remark.
- **The third sign** — the owner took the recommended option twice in a row.
- **The fourth sign** — a question after a refusal carries nothing done without the answer.
- **A significant word** — a word of five letters and more, taken from the question and its options.

### What it is called in the interface

The guard has no interface: only the executor sees it — as the text of a refusal in their own turn.

## Rules

- **A turn in which a question is asked of the owner does not end until the laws and the rules were
  read during the same turn.** The requirement stands at the end of a turn, not at the tool of the
  question: questions are asked in prose more often than by a menu, and intercepting the menu does
  not close the hole.
- **What counts as reading is any of the three ways, not only the loading of a rule.** Demanding
  exactly the loading would mean driving to it where a search was enough: the guard would get in the
  way of the work instead of putting it right.
- **A turn with a question to the owner is checked at the tool of the question, not at the end of the
  turn.** The requirement "read the rules before asking" is executable only before the sending. The
  check at the end stays for a question asked in prose.
- **With edits in the turn the refusal of the first sign names the rules of their area.** The
  condition then accepts only those rules, and advice to search the directories sent the executor
  round in a circle. The refusal also says that a load before the owner's last remark does not count.
- **An edit outside the tree does not make up the area of the work.** A draft in the session scratch
  directory is not work of this tree, and the rules gate skips it too: taken into the area, it
  demanded a rule that answers no question to the owner. A relative path counts as a path of the tree.
- **To a question whose answer a remark of the owner has already given, the guard of the conversation
  answers with a refusal.** The first sign judges whether the rules were read, and at allowed work it
  stays silent; the miss is of another kind — the owner gave an instruction by a direct remark, the
  executor found a fact against its price and, instead of a line about the price, asked a menu where
  two options of three cancelled the owner's decision. What is judged is the overlap of the
  significant words of the topic of the question and of the last remark of the owner — and only where
  a call of a menu was already in the record of the turn: the analysis of a request goes by six
  questions about different subjects, and they do not reach the threshold. A remark of fewer than
  five significant words is a command, not a decision, and the sign does not judge by it: «take task
  N» shares the number and the words of the subject with any next question about that task.
- **A refusal by the second sign orders to go on with the work, not to ask again differently.** The
  miss here is not in the shape of the question but in the stopping of work that is already allowed: a
  refusal named by the shape is fixed by a second question of the same stopping.
- **Two answers «recommended» in a row close the remaining questions by assumption, and the
  guard of the conversation refuses the next menu.** Every menu carries a recommended option, and an
  owner who takes it twice running has shown that the decisions are not theirs: the tree answers
  these questions, and the menu only asks to confirm it. The third sign reads the last two answers
  of the question tool, each with every option taken marked as recommended; any other answer breaks
  the streak. The refusal orders to write the assumptions into the grill, name them to the owner in
  one line and look for a ready-made module of the same kind before that: a grill of five menus was
  closed by the owner naming such a module.
- **A question after a refusal in the same turn leaves only with the line of what was done without
  the answer and a working command after the refusal.** A question is a lawful exit of a turn, and a
  choice "fix or wait" brought right after a refusal stopped work no guard held. The menu and a
  question in prose are judged alike; the line is named by the tree profile; a read or a status
  command does not count as work. A turn without a refusal is not judged by this sign.
- **A question that offers the owner to walk around a check does not leave.** A "yes" to it still
  sends red work past the check. The menu with its options and a question in prose are judged alike:
  past the check, a bypass line, a disabled rule, a hook switched off. A question about how to fix
  the check itself passes.
- **The guard of the conversation lets the work through at any breakage.** There is no record of the
  turn, there is no parser of the record, the reading broke — the turn is allowed. A broken guard has
  no right to jam the conversation.

## What is out of scope

- The other guards of the end of a turn and a second pass over the same turn — the parent domain.
- The rules gate, which demands a rule at an edit — the subdomain of the guards of an edit.

## Contract

The surface is the file of the hook the tree calls at the end of a turn and at the tool of the
question. At the end of a turn the refusal comes as the decision `block`, at the tool as the
decision `deny`; silence means the turn or the call is allowed.

### Refusal codes

Not applicable: the guard answers with a decision and the text of a reason, not with a code.

## Data

The guard has no data of its own: it reads the record of the turn and the gate map of the tree.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The texts of the refusals are in the language of the tree.

### SEO

Not applicable: the guard gives nothing outward.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the guard judges one turn of one session.

## Decisions

- **Refusing in favour of the work.** At any breakage the guard lets the turn through, as the parent
  domain decides for all its guards.

## Open questions

None.

## History of changes

- 2026-10-09 — the subdomain was split out of the guards of the end of a turn: the scenario file of
  the domain ran past the length limit, and the guard of the conversation got two new scenarios.
