# The rules layer in English: a session reads the same texts three times cheaper

In one phrase: the laws, the rules, the patterns, the skills, the refusals of the checks and the
documents of the tree are written in English, a session spends three times less of the window on them,
and the owner reads the tasks, the requests and the replies in Russian, as now.

The card of the epic is the task RT-1846. The order of the tasks is held by this record.

## What the epic is grounded on

The former epic about the weight of the layer, RT-1125, was closed on 26 August 2026. It closed the
question about the language by the words "there is nothing to prove the saving by": the count of the
tokens lives at the model and costs money, and a third-party counter undercounts the number on the
Cyrillic. Ten days later the layer is heavier again than on the day of the closing.

| What                                 | 26 August | 6 September |
| ------------------------------------ | --------: | ----------: |
| The entry into the work, characters  |    38 431 |      41 052 |
| The heaviest rule with its companion |    36 103 |      52 887 |
| The whole layer, characters          |   927 115 |   1 156 277 |

The numbers were taken by the command `npm run agent-kit:cost` at the tip of the main branch. Cutting
the Russian text a second time is useless: the saving did not hold the last time either.

The count of the tokens turned out free. A session sees the remainder of its window after every call
of an instrument. The difference of the remainder before and after a reading of a file is its price in
the tokens for this model. So on 6 September 2026 two numbers were taken on slices of 12 000
characters:

| The slice                                    |  Tokens | Characters per token |
| -------------------------------------------- | ------: | -------------------: |
| The Russian text of the rule of the delivery | ≈ 7 400 |                ≈ 1.6 |
| An English text of the same nature           | ≈ 4 000 |                ≈ 3.0 |

The measurement is rough: the text of the turn itself falls into the difference too, so the English
slice has a spread from 3 000 to 5 000. The same meaning in English is shorter by another third: a
trial paragraph took 941 characters against 1 449 in Russian. Together this gives the price of an
English layer about three times lower than the Russian one. The exact number is taken by the first
task.

What the translation gives the process apart from the window is also checked by the first task. The
model writes in English more evenly, and the refusals of the check of the style should become fewer.
The price is in another thing: the owner reads in Russian, and every text a session translates for
them from the language of the layer.

## The order of the tasks

| №   | Task                                                                                             | Why here                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | RT-1847 · The price of the writing is taken on a trial translation of one family                 | one family of the texts is translated, the tokens are counted, the checks are run; the owner decides by its numbers          |
| 2   | RT-1848 · The rule about the two languages is written                                            | without it the translation will creep over the tasks and the requests the owner reads in Russian                             |
| 3   | RT-1849 · The checks of the style, of the glossary and of the descriptions judge an English text | today they count the Cyrillic; on English they either are silent or refuse everything                                        |
| 4   | RT-1850 · The glossary is translated, the table of the terms is nailed down                      | one word per notion for all the next tasks; the glossary is read in every session                                            |
| 5   | RT-1851 · The entry into the work in English                                                     | the descriptions of the skills and the output of the hooks of the start are paid in every session; the largest gain per task |
| 6   | RT-1852 · The laws in English                                                                    | the rules refer to the articles of the laws; a translated law sets the words for them                                        |
| 7   | RT-1853 · The rules and their cold parts in English                                              | the main cargo at a loading; it is taken after the laws the rules refer to                                                   |
| 8   | RT-1854 · The patterns in English                                                                | they are loaded by their name from the rules; they go after the rules whose words they repeat                                |
| 9   | RT-1855 · The skills, the commands, the roles and the samples in English                         | the remainder of the package texts; the samples of the task folder are read by every new work                                |
| 10  | RT-1856 · The refusals of the hooks and of the checks in English                                 | this is an edit of the code, not of a text; it goes after the texts the refusals refer to by a quotation                     |
| 11  | RT-1857 · What is this tree's own in English                                                     | the overrides, its own rules, its own hooks and checks; after the package, otherwise the merged text is bilingual            |
| 12  | RT-1858 · The documents of the tree in English                                                   | the specs, the plans, the decisions, the reviews of the incidents; the largest volume and the rarest in a session            |

The order is assigned and holds to the end of the epic. A reconsideration is a decision of the owner,
and it is written into the progress of the task that called it.

The branches of the tasks stand each from the main one, not as a stack: the tasks are merged one at a
time, and the next begins with the previous one merged. Two tasks are not taken into work at once:
they edit the same resources of the package.

**The tasks from the second to the twelfth waited for the word of the owner about the numbers of the
first.** The word was said on 6 September 2026: to translate everything, as planned — at a gain of
20%, not threefold. The numbers lie in the section "The first measurement" below, the decision is
written down in Q-1.

## What is not in the epic

- **The tasks, the requests, the commits and the replies to the owner stay Russian.** So the owner
  decided on 6 September 2026. What changes is the language of what a session reads, not of what a
  person reads.
- **The description of the past is not translated.** The records of the directory `docs/archive/` live
  a week and are removed by a check; there is no point translating what is removed.
- **Not a single requirement is lifted and not a single check weakens.** A translation is a rewriting
  by the meaning, not by the word; a lost article is a miss. That an article is in place is reconciled
  by the number of the articles before and after in every task.
- **The consumer trees are not translated here.** They get the English layer by the layout of a new
  edition of the package in the ordinary order; their overrides are their own work.
- **The code of the applications and of the kits is not touched.** The comments in the code of the
  packages stay as they are.

## What the end is seen by

The command `npm run agent-kit:cost` at the tip of the main branch finds in the resources of the
package not a single line of the Cyrillic, apart from the exceptions listed by name. The same
measurement of the tokens as in the first task, taken on the same files, gives a number lower than the
Russian one by not less than twice. All the checks of the tree are green, and in a task created after
the epic the body is written in Russian.

## The first measurement

Taken on 6 September 2026 by the task RT-1847 on the family of the law about the documentation of the
project: the law, the rule `doc-style`, its cold part and the pattern `doc-style-write`. Four files
were translated by the meaning, not by the word; the number of the articles coincided: 28, 23, 16.

**The way.** A file is read by the command `cat` by a call of its own; the remainder of the window
under a result shows the window before that result, so the price of a file is read under the next
call. An empty call costs 121 tokens, and that number is subtracted from every difference. The
measurement is repeated by the same pair of calls on any file.

| File                            | Characters ru | Tokens ru | Characters en | Tokens en | The difference |
| ------------------------------- | ------------: | --------: | ------------: | --------: | -------------: |
| `laws/project-documentation.md` |         8 148 |     3 870 |         8 843 |     2 713 |           −30% |
| `rules/doc-style.md`            |        14 801 |     6 113 |        15 902 |     5 078 |           −17% |
| `pitfalls/doc-style.md`         |         7 496 |     3 174 |         7 904 |     2 595 |           −18% |
| `patterns/doc-style-write.md`   |         9 362 |     3 917 |        10 302 |     3 260 |           −17% |
| In all                          |        39 807 |    17 074 |        42 951 |    13 646 |           −20% |

**The English layer is cheaper by a fifth part, not threefold.** The appraisal "threefold" from the
grounds above was wrong twice. The Russian text of the layer costs 2.3 characters per token, not 1.6:
the first measurement carried the noise of the text of the turn. A translation keeping every article
is longer than the original by 8%, not shorter by a third: shorter was a free retelling of a trial
paragraph, and its gain is a shortening, not the language.

Twenty per cent of a layer of 1 156 277 characters is about 100 000 tokens a session does not pay. The
owner on 6 September 2026 decided to bring the epic through whole by that number.

**The checks on an English text.** The limit of forty words per sentence works: a trial sentence of 46
words was refused. The list of the bureaucratese is Russian, and an English bureaucratic turn passes
silently. The glossary holds twelve Russian forbidden words and does not judge an English text. The
check of the descriptions and the length limit judge the characters and do not depend on the language.
The guard of the style let an edit of an English file through without a single refusal. The outcome:
two checks of five are silent on English, three work.

**What the translation gave the process.** Four files of 43 000 characters were written in one turn
without a refusal of the check of the style. The price is on the other side: the same family in
Russian already lies, and the translation cost a turn and the window; every text a session would
translate back for the owner.

## The second measurement: the entry into the work

Taken on 6 September 2026 by the task RT-1851 on the glue of the descriptions of 30 rules, 52 patterns
and 3 skills — by the same way as the first measurement. The Russian glue was read in two parts.

| The glue of the descriptions | Characters | Tokens | Characters per token |
| ---------------------------- | ---------: | -----: | -------------------: |
| Russian                      |     22 341 |  9 195 |                 2.43 |
| English                      |     23 393 |  7 875 |                 2.97 |

**The descriptions are cheaper by 14%, not by 20%.** A description is shorter than an article of a
law, and the share of the names of the files, the patterns and the code in it is higher: the names cost
the same in both languages, and the translation keeps every one. The English glue is longer than the
Russian one by 5% in characters.

The entry into the work by the command of the price of the layer after the tasks 4 and 5: 49 358
characters and 53 974 bytes against 41 052 characters and 69 510 bytes before them. The characters
became more — the glossary got the tables of the names, and an English text is longer in characters;
the bytes became less by 22%. The number of the characters of this command from this day does not
measure the price: it compares the bytes, and the exact number is given by the measurement of the
tokens.

## The third measurement: the laws

Taken on 6 September 2026 by the task RT-1852 over the fifteen files of the laws of the package, by the
bytes of the files before and after the translation.

| The laws |   Bytes |
| -------- | ------: |
| Russian  | 134 287 |
| English  |  80 507 |

**The laws are lighter by 40% in bytes.** An article of a law is prose without the names of the files
and the code, and on it the translation gives more than on the descriptions. The number of the
articles and of the questions in every law is equal to the former one: 283 articles and 4 open
questions.

The entry into the work after the task 6: 49 336 characters and 53 647 bytes; a law does not enter it,
and the number hardly moved.

## The fourth measurement: the rules and the cold parts

Taken on 7 September 2026 by the task RT-1853 over the thirty rules and the ten cold parts of the
package, by the bytes of the files before and after the translation.

| The rules and the cold parts |   Bytes |
| ---------------------------- | ------: |
| Russian                      | 673 092 |
| English                      | 426 599 |

**The rules are lighter by 36% in bytes.** The number of the articles of the section about the
application of the law is equal to the former one in every rule: 559 articles, 239 items of the cold
parts, 53 lines of `rt-when`. In the lines and the characters an English text is longer than a Russian
one, so the limit of the weight of a text is lifted to 330 lines and 24 000 characters: two rules and
one cold part went past 300 lines at the same number of the articles.

The entry into the work after the task 7 did not move: a rule is loaded on demand and does not enter
the entry.

## The fifth measurement: the patterns

Taken on 7 September 2026 by the task RT-1854 over the fifty-two patterns of the package, by the bytes
of the files before and after the translation.

| The patterns |   Bytes |
| ------------ | ------: |
| Russian      | 587 107 |
| English      | 399 540 |

**The patterns are lighter by 32% in bytes.** The number of the headings outside the fences and the
number of the fences in every pattern is equal to the former one; the ready code in the examples is not
touched, the prose and the comments are translated. In the characters an English text is longer by 7%:
the heaviest pattern is 17 877 characters at a limit of 24 000.

The whole layer after the task 8 is 1 468 014 bytes against 1 628 176 after the task 7. The entry into
the work did not move: a pattern is loaded by its name from a rule and does not enter the entry.

## The sixth measurement: the skills, the commands, the roles, the samples, the templates, the flows and the defaults

Taken on 7 September 2026 by the task RT-1855 over the thirty-five files of the seven directories of
the package, by the bytes of the files before and after the translation.

| The directories                   |   Bytes |
| --------------------------------- | ------: |
| Russian                           | 259 400 |
| English                           | 179 496 |
| Of them the texts `.md` — Russian | 165 772 |
| Of them the texts `.md` — English | 109 784 |

**The seven directories are lighter by 31% in bytes, the texts by 34%.** In the scenarios of the shell
and in the working flows the comments, the hints to the roles and the descriptions of the phases are
translated; the code is not touched. The Cyrillic stayed in the keys the hooks and the sending of the
proposals read, in the names of the states and in the samples of the Russian texts for the owner; they
are listed in the archive record of the task.

## The seventh measurement: the refusals of the hooks and of the checks

Taken on 7 September 2026 by the task RT-1856 over the sixty-four hooks and the forty-two checks of the
package, by the bytes of the files before and after the translation.

| The hooks and the checks |   Bytes | Lines with the Cyrillic |
| ------------------------ | ------: | ----------------------: |
| Russian                  | 654 666 |                   3 038 |
| English                  | 502 936 |                      83 |

| The checks |   Bytes | Lines with the Cyrillic |
| ---------- | ------: | ----------------------: |
| Russian    | 445 842 |                   2 154 |
| English    | 354 605 |                     123 |

**The hooks are lighter by 23% in bytes, the checks by 20%.** The comments, the introductions, the
texts of the refusals and of the digests together with the expectations of the sets are translated; the
code is not touched. The number of the probes of the set grew from the former one by four:
SC-AK-908…911 about the keys of the task folder.

The Cyrillic is left deliberately: the names of the states of the work, the Russian names of the keys
in the alternations (the keys of the task folder, the section of the handover, the keys of the
documents of the tree), the signs of the Russian speech of the owner and of the executor in the regular
expressions, the signs of the Russian style in the check of the texts and the samples of the Russian
texts for the owner. All of them are listed in the archive record of the task.

**The keys of the task folder are read under two names.** The samples of the task folder, the patterns,
the rule of the conduct of the work and the map of the turn carry the English keys — `## Where we
stand`, `**State:**`, `**Stage:**`, `**Next step:**`, `**Draft:**`, `**Behaviour:** unchanged`,
`**Task:**`, `**Branch:**`; six hooks and the command of the creation of a task read them on a par with
the Russian ones. The folders of the tree created before the translation work without an edit.

The whole layer after the task 10 is 1 450 197 bytes against 1 468 014 after the task 8. The entry into
the work is 57 987 bytes: a refusal of a hook does not enter the entry and is paid only in the minute
of the refusal.

## Open questions

- **Q-1. Whether the layer is translated whole. Closed on 6 September 2026: it is translated, as
  planned.** The owner decided that having seen the numbers of the first task: the gain is 20%, not
  threefold. The order of the tasks and the boundaries of the epic stay the former ones, all twelve
  tasks are in force.
- **Q-2. What a session translates a text for the owner by. Closed on 6 September 2026 by the task
  RT-1850: by a table of the names in the glossary.** The glossary of the package holds the section
  "Russian names" — one Russian name per English term; the override of the tree holds the same section
  under a name of its own for its own words. The table is one, in one direction: a session reads an
  English term and writes the owner the Russian name from the table. The reverse side is not needed: the
  owner does not write in English.
- **Q-3. What to do with a bilingual layer at a consumer.** The override of a consumer tree stays
  Russian until it is translated; the merged text of a rule comes out bilingual. Whether that is
  tolerable for the time of the transition is decided by the owner at the task 11.
