# The findings of the epic RT-2208

The findings accumulate here while the epic "The texts of the receiver are half Russian, half
English: there are no keys and no translations" goes: the owner reads them when the epic is over and
says which of them are right. The file lies next to the plan of the epic,
`docs/plans/receiver-texts-keys.md`.

## RT-2212 — the receiver answers a refusal by a code

- **A field added to the answer of a refusal is lost where the answer is assembled.** The receiver
  has one parse of failures for the whole application, and it built the body anew out of what it
  knew: every operation named the code, and the body carried none. Neither the linter nor the tests
  beside the operations saw it — three end-to-end tests fell at once. **Address:** rules layer — an
  article of the `observability` rule about the place where a field of an answer is added, and one
  of the `testing` rule about checking such a field over the whole set rather than beside one
  operation.
- **A click on closing a panel is not its disappearance.** While the panel leaves the screen it
  keeps its fields, its buttons and its anchors: the test filled the name in a panel that was
  already going away and stood until its time limit. It cost three runs of the suite and a read of
  the browser trace. **Address:** rules layer — a miss of the `testing-e2e` pattern: the absence of
  the node is awaited before the next action.
- **A popup that stays open after its item is chosen takes the neighbouring click for itself.** The
  profile popup held the screen after the language was chosen, and the screen answered as if the
  button had not been pressed. **Address:** the same miss of the `testing-e2e` pattern.
- **The rule gate does not demand the Angular rule for a factory of signals.** The derived text of a
  refusal lives in a file that is neither a component nor a store, so the gate gave it the language
  conventions; the first draft put the string into a kit signal from an `effect`, and the rule that
  forbids exactly that was loaded only on the fix. **Address:** rules layer — a layer of the gate by
  the text of the file: a call of `effect`, `computed` or `toSignal` in a `.ts` raises
  `angular-patterns`.
- **A table under `## Contract` is read by the audit as the list of procedures.** The set of 35
  codes standing there gave 36 discrepancies on a spec that was right. **Address:** rules layer — a
  miss of the `spec-driven-domain` pattern: under `## Contract` stands the table of procedures
  alone, a set of codes goes to `## Data`.
- **The guard of the place of an edit reads a quote line inside a heredoc body as a write.** A
  markdown line `> <path to a laid-out file>` inside the body of a command that writes nothing into
  the tree was refused twice in one session. **Address:** rules layer — the shared parse of the
  write targets cuts the heredoc bodies out of the shell parse.
- **The prose guard judges a scratch document outside the project root.** A fixture written to the
  system temp directory was refused over a word in it. **Address:** rules layer — the boundary of
  the judgement is the project root.
