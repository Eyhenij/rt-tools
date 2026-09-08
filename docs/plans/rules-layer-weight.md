# The rules layer costs a session cheaply: the text is cut, the meaning stays

In one phrase: a session spends twice less on the laws, the rules and the skills than today, and not
a single requirement is lost at that.

The card of the epic is the task RT-1125. The order of the tasks is held by this record.

## What the epic is grounded on

The measurements were taken on 25 August 2026 on this tree. The numbers are true for that day and are
recounted by the commands named next to them.

| What                                                                   | The volume |
| ---------------------------------------------------------------------- | ---------: |
| The descriptions of the skills — in the system prompt of every session |      41 KB |
| The glossary — by a hook at the start of a session                     |      30 KB |
| The map of the turn and the index of the laws — by hooks at the start  |       8 KB |
| One rule at a loading                                                  |   14–42 KB |
| The laws, all fourteen                                                 |     121 KB |
| The rules and the patterns, a hundred and eight files                  |    1.42 MB |

The weight of the layer — `find .claude/skills -name '*.md' -exec wc -c {} + | tail -1`, the same by
`docs/constitution`. The weight of the descriptions — `awk '/^description:/{s+=length($0)} END{print
s}'` over the files of the rules. The output of the hooks of the start — by a launch of the hooks
themselves with a ready input.

The session this plan was written in spent 79 KB at the start and 114 KB on four rules — before it
reached the first line of the work.

The epic about the price of the entry, closed on 23 August 2026, laid the text out over the files so
that a session takes a part, not everything. It did not cut the volume and wrote that into its own
section about what it does not do; the layer became heavier after it. This epic takes exactly what
that one excluded from itself.

## The order of the tasks

| №   | Task                                                             | Why here                                                                                                                                   |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | RT-1126 · The price of the entry is counted by a command         | without a number not a single next task will prove the gain                                                                                |
| 2   | RT-1131 · The descriptions of the skills are cut                 | 41 KB in every session without exception; it depends on nothing and gives the most per session                                             |
| 3   | RT-1132 · The shape of a compressed article is declared          | the mechanism the four next tasks stand on: what stays in the rule and what leaves for the cold                                            |
| 4   | RT-1133 · The showing rule is compressed whole                   | the sample for the rest and the first real number of the saving; the heaviest of the loaded ones is taken                                  |
| 5   | RT-1134 · The large rules are compressed by the sample           | the main volume; it needs the sample from the task 4                                                                                       |
| 6   | RT-1135 · The patterns are compressed by the sample              | done on 25 August: the technique was enough for 394 characters — the weight of the patterns lies outside the price of the entry, see below |
| 7   | RT-1136 · The laws are compressed                                | 121 KB; they go after the rules — an article of a law is edited when it is visible what it unfolds into below                              |
| 8   | RT-1137 · The glossary and the map of the turn are cut           | 38 KB at the start of every session; independent of the rest                                                                               |
| 9   | RT-1138 · The text of the refusal of a guard is shortened        | the refusal glues in the list of the articles over the rule that is loaded next; a compressed article is cheaper                           |
| 10  | RT-1139 · The length limit of a rule is recounted by the new one | it nails down what is achieved: without a limit the text grows back. Earlier it will turn red on what is not compressed                    |

The order is assigned and holds to the end of the epic. A reconsideration is a decision of the owner,
and it is written into the progress of the task that called it.

## What is not in the epic

- **Not a single requirement is lifted and not a single guard weakens.** A lost article is a miss, not
  a saving. The epic cuts an argument, an example and a retelling of an incident, not what is required.
- **The specs of the domains are not touched.** There are 1.64 MB of them, but they are not loaded into
  a session whole — they are read selectively, and the gain there is lower and the risk of losing the
  meaning higher.
- **The text is not laid out over new files.** The former epic did that, and the layer became heavier
  from it. Here the text is cut; the moving of an argument into the cold part is the mechanism of the
  task 3, not a way to count the gain.
- **The layout, the overrides and the gate map stay as they are.** The task about the refusal changes
  the text of the refusal, not what the guard judges.
- **The code of the application is not touched.** The resources of the package of the rules and the
  texts of the tree are edited.

The boundaries were reread on 26 August 2026, at the closing of the epic, and all five held. Two of
them are worth reading together with what they turned into.

The text was not laid out over new files, but the rules got cold parts — there are nine of them
(`ls .claude/skills/*/pitfalls.md`). That is the very mechanism of the task 3: an argument leaves the
rule that is always loaded for a file that is opened on demand. The gain at that was counted by the
entry into the work, not by how many characters moved.

The specs of the domains are not touched: they are 134 files and 1 642 676 bytes — `find docs/specs
-name '*.md' -exec wc -c {} + | tail -1` — that is, more than the whole rules layer. They are not
loaded into a session whole, and the epic did not touch them by a single task.

## The first measurement

Taken on 25 August 2026 on this tree by the command `npm run agent-kit:cost`; machine-readably — the
same one with the argument `--json`. The characters and the bytes are counted: what is taken in place,
without the network and without a payment.

| What                                       | Characters |     Bytes |
| ------------------------------------------ | ---------: | --------: |
| The entry into the work                    |     51 174 |    79 946 |
| The rule `git-workflow` with its companion |     57 843 |    88 274 |
| The whole layer, 122 files                 |    987 752 | 1 540 813 |

There are one and a half times more bytes than characters — that is the visible price of the Cyrillic.
It is named so that it is not taken for an argument for a translation: a byte is not a token, and it
says nothing about the price of the window.

## What it is seen by that the epic is over

The command from the task 1 in the week after the last task gives: the entry into the work and the
weight of one rule below the number assigned by the owner from the first measurement above. Not a
single check of the tree turns red at that, and the list of the accepted debt by the length is empty.

The number of the goal is assigned by the owner after the first task has learnt to count: to assign it
earlier would mean to invent it.

## What the epic ended with

Closed on 26 August 2026. All eleven tasks are merged; the measurement is taken by the same command
`npm run agent-kit:cost` as the first, at the tip of the main branch.

| What                                 | 25 August | 26 August | The difference |
| ------------------------------------ | --------: | --------: | -------------: |
| The entry into the work              |    51 174 |    38 431 |         −24.9% |
| The heaviest rule with its companion |    57 843 |    36 103 |         −37.6% |
| The whole layer                      |   987 752 |   927 115 |          −6.1% |

The numbers are in characters: the command names the bytes too, but they say nothing about the price
of the window.

The line of the rule on both days measures one quantity — the weight of the worst case: the command
itself takes the heaviest rule together with its companion, and on the day of the creation that was the
delivery, and on the day of the closing — the conduct of the work.

**The "twice" promised by the title did not come out.** The entry fell by a quarter, not by a half. By
a half fell something else — the price of a decision touching the heaviest rule: 57 843 characters
against 36 103, that is, almost twice. Where the rest went is visible by the section "What came to
light along the way": a session pays by the descriptions of the skills, the glossary and the map of the
turn, and the bodies of the patterns and the laws do not enter the price of the entry at all — cutting
them for the entry was useless, and three tasks of eleven gave the layer volume and the entry almost
nothing.

**The number of the goal was never assigned.** The owner postponed it at the first task and confirmed
the decision at the closing: the epic is closed by what is achieved. There is therefore nothing to
compare with — the section above is carried out by what there is: a measurement before and after by one
command.

**The entry is counted together with the handover of the past session.** The hook of the entry prints
it whole, and every branch has its own: on a branch with a handover the same measurement gave 42 594
characters against 38 431 on a branch without one. The number above was taken on a branch without a
handover — otherwise it would measure the length of a foreign text, not the weight of the layer. When
comparing the measurements of different days, the branch is looked at.

### What the epic did not give

The review was made on 26 August 2026 by the contribution of each of the eleven tasks: the contribution
is counted as the difference of the weight of the resources of the package before the merging of the
task and after it.

**The package itself got heavier by 5 123 bytes.** Five cutting tasks removed 12 014 bytes, six
declaring a mechanism — the shape of a compressed article, the limit of the weight, the text of the
refusal, the count of the price, the bindings — added 17 137. This one reproached the former epic with
exactly such an outcome. The difference is where the growth landed: it is in the cold part and in the
mechanics, not in what a session loads.

**12 634 bytes left the bodies of the rules, and 10 403 of them are not cut off but moved into the cold
parts.** A cut in the proper sense of the word turned out to be a fifth part; the rest is the moving of
an argument to where it is taken from on demand. For a session that is a real gain, but the word
"compressed" names it inexactly.

**The whole gain of the entry was given by two tasks of eleven.** The entry counts the descriptions of
the skills and the output of three hooks of the start: the descriptions were cut by RT-1131 (−4 354
characters), the glossary and the map of the turn — by RT-1137 (−9 327). The nine other tasks cut the
bodies of the rules, the laws and the patterns — what does not enter the price of the entry at all. The
order of the tasks was assigned before that became known, and the section above says so; here its price
is named by a number.

**The saving does not hold.** Over the same day foreign works appended into the bodies of the rules more
than the epic cut off: `spec-driven` +4 684 bytes, `turn-conduct` +3 004 against the cut-off
`git-workflow` −2 862 and `task-flow` −730; the sum of the bodies of the rules in the package grew by
9 835 bytes. The limit of the weight from RT-1139 — 22 000 characters at the heaviest rule of 20 950 —
forbids the growth but does not nail down what is achieved: between today's worst case and the limit a
sixth part of a free run is left, and under the limit itself another three quarters.

**A session gains less than the line about the worst case says.** The five rules loaded by the session
that closed the epic would have cost 78 093 characters on the day of the creation and cost 75 489 — 3.3%
less. The line "−37.6%" is true for a decision touching the heaviest rule, and only for it.

The list of the accepted debt by the descriptions is empty — `.claude/rt-kit/description-debt.json`,
`node tools/check-descriptions.mjs` says: the descriptions are 77, all inside the limit of 300
characters.

## Open questions

- **Q-1. Which language the layer will turn out in after the epic. Closed on 25 August 2026: the
  language does not change.** The owner allowed a translation if it saves — and there is nothing to
  prove the saving by. The difference between the writings is visible only by a count of the tokens, the
  count lives at the model and costs money, and the owner will not pay for it. A third-party offline
  counter does not fit: for this model it undercounts the more the further the text is from the Latin
  alphabet, that is, it misses exactly where the question would be decided. A translation without a
  number is a guess at the price of the whole layer, and the epic does not make it. The epic cuts the
  volume, not the writing.
- **Q-2. By which number the goal is set. Closed on 26 August 2026: it was not set by a number.** The
  owner postponed the assignment at the first task and at the closing of the epic confirmed the decision
  — to close by what is achieved. The price: the gain is named by numbers, and whether it coincided with
  the expectation there is nothing to say by. To assign a number after the fact is rejected: it would be
  fitted to the result already got and would check nothing.
- **Q-3. Whether an argument at an article leaves for the cold part whole or folds to a line. Closed on
  25 August 2026 on the showing rule: both outcomes are needed, and they divide almost in half.** The
  rule of the delivery is compressed whole: 24 415 characters became 20 052, 4 363 were removed. Of them
  2 033 left for the cold part — the cases, the numbers and the rejected medicines; the other 2 330 left
  for nowhere but folded to a line: that was a repetition of what the statement already said. A rule
  demanding one outcome would take the repetitions into the cold — and the cold part would grow faster
  than the rule slims.
- **Q-4. What to do with the check of the style if the layer leaves for another language. Closed
  together with Q-1: the layer stays Russian, and the check of the style works as before.**

## What came to light along the way

**The body of a pattern does not enter the price of the entry.** The count of the entry gathers the
descriptions of all the skills and the output of three hooks of the start — `glossary-load`,
`turn-entry-load`, `constitution-index`; the bodies of the rules, the patterns and the laws do not get
there. A rule pays by itself at a loading, a pattern — at a call by its name, a law comes into the entry
as one index, not as a text.

Hence the order of the price, and it is not the one that stood in the order of the tasks: the
descriptions (RT-1131, done) → the bodies of the loaded rules (RT-1133, RT-1134, done) → the index of
the laws and the glossary (RT-1137) → everything else. The tasks 6 and 7 stand last in that row, not
fifth and sixth: a session does not load a pattern and a law by their bodies.

**A third of the text travelling into the context is the spaces of the alignment of the tables.** The
formatter pads the columns to a common width, and these spaces travel into every session meaning
nothing: in the glossary they gave 6 616 characters of 20 809, with the lines of the separators — 8 241,
that is, forty per cent of the file. The moving of the same records into a list "- **term** — what it
is" cut the entry from 47 758 to 38 431 characters without touching a single word. Cutting the content
was at that almost not needed: the compression of six heavy records gave 200 characters against the nine
thousand taken by the form.

Hence a technique worth trying on the rest: before cutting the meaning, look at what the form costs. A
table is justified where the columns are more than two and they are compared by the eyes; a two-column
table is a list written four times dearer.

**Looking in the patterns for the same as in the rules is useless.** A search for the cases and the
numbers by the sample gave 13 candidates over 52 files — against eleven in the rule of the turn alone.
The weight of a pattern lies in the order of the actions and in the ready code, and that is exactly what
it is opened for.

**A third of the weight of a markdown table is the spaces of the alignment.** The formatter pads every
cell to the common width of the column, and on a long text that comes out dearer than the words
themselves. The moving of the same table into a list touches not a single word: the glossary lost 8 181
characters of 20 809, the map of the turn — 445, the bindings of the companions and of the companions of
the specs — 191 820 (RT-1169). The link at that goes by the text of the statement, not by the form of
the line, so the checking learns to read both forms and the moving goes file by file.

**A task born along an epic stands after the assigned order.** RT-1169 does not stand in the list above:
the technique was found at the eighth task, and the order was assigned before the first. The order is
not reconsidered from that — the task simply goes eleventh.

## How the edit is conducted

- **The source is the resources of the package of the rules, not the laid-out copies.** The order is
  always one and the same: the edit, the build, the layout.
- **Every task carries its own product agreement.** A decision of the owner: the rules layer is what the
  package carries to foreign trees, and an edit of its form is visible from outside.
- **The laws are edited without a separate show.** A decision of the owner; they look at them at the
  taking apart of the request.
