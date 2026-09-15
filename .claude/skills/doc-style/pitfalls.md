<!-- rt-kit v0.28.0 · pitfalls/doc-style.md · cda116aae1ad · правится надстройкой, не здесь -->
# Project texts — cold part

Pitfalls: traps already stepped on. Loaded not with the rule but on demand — an ordinary
decision does not need it.

The rule is `doc-style`; the articles that hold the law stand there.

## Pitfalls

- **A deviation from the request is named in the same report that shows the result.** Something
  done not the way it was asked differs from something done the asked way even when the answer
  matches, and the executor names the difference — one line: "did it not the way you said, here
  is how and why". Silence holds exactly until the request has to be repeated, and the price is
  trust in the whole report.
- **Remaining work is not written into a document; it is filed as a task.** `docs/BACKLOG.md`
  keeps only what never becomes a task: agreements and decisions that were decided not to change.
  The test — the statement stays if nobody intends to change it. "Do later" in a plan, a README or
  a spec is a second work list: it drifts from the board silently, and sorting it out later costs
  more than filing a task right away. Of a 1411-line document, 71 lines turned out to be current,
  and sorting the rest took a separate task. How to sort what has piled up — pattern
  `doc-style-sweep`.
- **The glossary applies to the conversation with the owner too, not only to files.** It enters
  the context at session start, so "did not read it" is never a ground. A word from the "we do
  not write" left column surfaced precisely in replies: it had already been purged from the tree,
  yet in the PR about the work it remained, and the owner read exactly the word that was dropped.
- **A term is taken from `docs/GLOSSARY.md`, not invented on the spot.** A word that is not there
  does not exist for the reader either: "application journal" stood in the mail spec until the
  owner asked what it was — it turned out to be backend logs, and "journal" here was already taken
  by the event journal. A new word is either added to the glossary together with the change or
  replaced with one that already exists.
- **A pass over the glossary by eye does not find the word.** "Wording aligned with the
  glossary" means exactly the lines that were being read at that moment: "speca" survived such a
  pass and stayed on the next line of the same file. A word from the left column of the "Not
  written here" table is purged by grep over the whole tree, not by proofreading. The form is set precisely: "spec" — the
  document — also inflects into the other forms, and legitimate matches by the stem outnumber the
  violations; the search is for phrases ("no spec for …", "the spec checks"), not the stem.
- **A dropped name is purged by one grep over the whole tree:** rules, their mirrors in skills,
  documents and comments. A description of what the code no longer has reads as a current
  instruction.
- **A dropped word's second meaning is restored after the blanket replacement, not worked around
  before it.** The word is dropped precisely because it stood over two things, and the second
  meaning stays legitimate. There is no way to pick it out in advance: which of the two meanings a
  line carries shows only from the text around it, and there may be hundreds of lines. The order
  is reversed — blanket replacement, then a full review of the change itself, and each second
  meaning found is restored by name. Of 353 replacements six came back this way, and the first two
  were breakage: the check printed the new name twice in a row, and a comment promised "breakage
  instead of a PR saying there is no debt". The change is reviewed, not the tree after it: in the
  tree both sides look equally right.
- **A search over the tree does not cover what has already gone outside.** The task title and
  body, the PR title and body, commit subjects live outside files, and text checks do not read
  them at all. Having purged a word in the tree, one walks the same places in the work queue and
  in history:

    ```bash
    <host client> api "<PR path>" --jq '.title, .body' | grep -i '<word>'
    <host client> api "<task path>" --jq '.title, .body' | grep -i '<word>'
    git log --format='%s%n%b' <base>..HEAD | grep -i '<word>'
    ```

    A PR title is fixed by a host call, a commit subject only by rewriting the branch, so it is
    checked before the push. An invented word was purged from three files and declared dropped,
    yet stayed in the PR title and the commit subject — the owner read exactly that.

- **A number in a text is recomputed by a command in the same commit that writes it.** It goes
  stale inside one branch: "sixteen pairs" became false two commits after it was written, and the
  owner found it, not a check. A number that will have to be recomputed on every edit is better
  not written at all. A number obtained by parsing text is verified on a sample by hand before it
  is stated: a parser that does not know a second notation fails silently — "51 items without a
  task" turned out to be six, because the id stood both on its own line and in a subsection
  heading.
- **A check named in a text is run, not retold.** "The check exists" and "the check passes" are
  different statements, and the second is usually absent from the text altogether. Of four checks
  named by a rule, three were not in the state the text described: one produced a dozen and a half
  findings, the second rewrote files by merely running, the third was red and took the overall
  summary down with it. None of the three was part of the release, so the silence was complete. A
  check that rewrites files is run on a clean tree: otherwise its edits leave in someone else's
  commit.
- **Doneness is read from the tree, not from the text written about it.** This holds both ways:
  the line about both libs' READMEs was struck out as done, yet the README kept the old importer
  count; a task reported to the owner as not done turned out to be half closed and covered by hook
  scenarios. A plan item and a task body describe the day they were written and have not changed
  since.
- **A comment in a file is a statement like a line in a document.** The justification "lines run
  the full panel width, otherwise the highlight breaks" was invented, lived three sessions and
  each time read as a ground not to touch the layout.
- **Other projects are not mentioned anywhere** — neither the repository name, nor "ported
  from", nor links to its files. What the code does here is described in this project's own
  terms.
- **A pattern replacement is silent when the pattern is wrong.** A stream editor may lack
  alternation in its pattern syntax: the expression matches nothing, the command exits zero and
  edits no line. Nothing in the exit code tells this from an applied edit — only the file itself
  shows it, usually later, by the headings of the assembled text. Text is edited with the edit
  tool; and if a replacement is called anyway, the place it promised to change is reread right
  after.
- **A number obtained from a command is not yet a measurement.** The requirement to recompute a
  number by a command is met literally — there was a command — and nobody asks whether it
  measured the number's subject. Output is false in different ways and silently: `grep -E` with
  the word boundary `\b` on BSD ignores part of the pattern and does not say so ("278
  occurrences" turned out to be 79, and twelve of those were about something else), a regex does
  not see where a block ends and attributes the find to a neighbour, and memory returns a number
  without remembering its origin — indistinguishable from a measurement. A number is written by
  the command that measures its subject, in the same turn the text is written.
- **The word boundary is asked from the command that knows it.** `grep -w`, `rg` and `python3`
  with `re` implement it, BSD `grep -E` does not; the check costs one command and is done before
  the number goes into the text.
