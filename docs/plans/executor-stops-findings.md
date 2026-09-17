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

## Left unresolved

- **All of the above** — wait for the owner's word at the end of the epic; none is disputed.
