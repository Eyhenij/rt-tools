# The findings of the review of the closed works of the epic RT-2190

The findings accumulate here while the epic "The executor does not stop on its own until the epic
is closed" goes: the owner reads them at once when the epic is over and says which of them are
right. What they name is made into a proposal and leaves for the package. The file lies next to
the plan of the epic, `docs/plans/executor-stops.md`.

## RT-2191 — the exit guard judges a second pass and a turn with work under an open epic

- **The scenario number tool caps the numbers at three digits.** `tools/spec-next-id.mjs` matches
  `\d{1,3}` and answered "the next free is SC-AK-1000" while SC-AK-1112 was taken; seven numbers
  were issued twice and renumbered before the commit. **Address:** names of this tree — the regex
  and the grep pattern of the tool, a case in a tree test.
- **The entry into the specs reads only the list form of a binding.** `tools/specs-for.mjs`
  parses `- **statement** — address` and not the table row; a hook bound in
  `docs/specs/agent-kit/turn-guards/exit/implementation.md` read as one no spec speaks of, and a
  statement had to be doubled in the parent spec. **Address:** rules layer — the check reads both
  forms by the same parse as the anchors audit.
- **A new hook needs the executable bit, and nothing says so before the package suite runs.** The
  layout copies the bit as it finds it; the runtime calls hooks through `bash` and stays silent.
  **Address:** names of this tree — a pitfall of `agent-kit-source`, together with the shape of a
  split: a sourced neighbour named in `Requires:`, a `-lib.sh` next to a suite.
- **The push gate runs on the word `push` anywhere in the command.** A commit whose message named
  a push ran the whole gate set and was refused on a red check. **Address:** rules layer — the sign
  is the git subcommand after quoted text is cut out.
- **The dispatcher scenario stages the guard's neighbours by a hand-written list.** A new sourced
  neighbour turned the suite red without naming why. **Address:** rules layer — the suite reads the
  `Requires:` line of the guard.
- **The tree's banned words are not in the tree glossary.** Four Russian words of the layer's own
  jargon were learned from the refusal of the prose guard, not from the glossary read at session
  start. **Address:** override on top of the laid-out — a section of the glossary with the tree's
  half of "Not written here".
- **The shell door of the prose guard reads quotes away.** A jq or node program carrying `>` or an
  apostrophe reads as a redirect, and the whole command body is judged as prose: code tokens
  between two periods count as one sentence. **Address:** rules layer — a pitfall of `doc-style`.

## RT-2192 — the articles about stops in the package rules, the owner's word quoted in the waiting line

- **A chain PR inside an epic is described three ways.** The stack pattern says the base is the
  previous branch; the delivery rule and the guard `git-guard-delivery-epic.sh` accept the epic
  branch alone; the tree tool `board-epics.mjs` repeats the guard. The PRs of the stack went into
  the epic branch and show the lower branches' edits until those merge. **Address:** rules layer
  — the guard accepts a base that carries the epic branch and is not the main one; the rule and
  the pattern say the same; names of this tree — the board tool.
- **The prose check judges inline code.** The state token for a written plan, taken from the
  rule's own list, was refused in a progress file over a banned word inside backticks.
  **Address:** rules layer — the check blanks inline code spans before judging.
- **The size check weighs the layout header.** A source at the limit passes locally and the
  laid-out copy fails at the push gate by the header line; it cost two refused pushes.
  **Address:** rules layer — the check leaves the header line out of both counts; until then a
  source is kept a header below the limit.
- **The rule `turn-conduct` stands at its weight limit.** Every new article costs compressing a
  neighbour, and nothing announces the limit before the push gate. **Address:** rules layer — a
  line in `spec-driven` about measuring before the article is written; the rule is due for a
  split by the pattern's own sign.

## RT-2193 — the package guard of the closing tool

- **The refusal of the closing tool was read by the exit guard as a lawful exit.** A stop in two
  calls: call the closing tool, take the refusal, end the turn by "a guard's refusal". Fixed in
  the same branch: the refusal sample of the exit guard excludes the closing guard by name, the
  article of the rule says "only a refusal of work", scenario SC-AK-1122. **Address:** closed.
- **The guard conventions live in the hooks spec, and the rule for editing the package does not
  point there.** "Every guard fails in favour of the work" is stated in the hooks spec and audited
  by the hooks-kind suite; the first draft of the guard declared itself fail-closed and was
  reworded after the red suite. "No lawful bypass" and "fails in favour of the work" are two axes,
  and no text says so. **Address:** names of this tree — a pitfall of `agent-kit-source` pointing
  at the hooks spec; rules layer — a decision line in the hooks spec about the two axes.
- **The law on work conduct names what allows a stop, not who closes a session.** The rule
  article "the session is ended by the owner" stands on the law without a sentence about the
  owner. **Address:** rules layer — a clause in the law article about the executor's session; the
  law is edited by the owner.

## Left unresolved

- **All of the above but the closed one** — wait for the owner's word at the end of the epic; none is disputed.
