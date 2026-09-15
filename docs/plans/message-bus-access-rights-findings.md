# Findings of the epic on access rights

They accumulate here, next to the plan `docs/plans/message-bus-access-rights.md`, and are read at
once when the epic is over. The owner says what of this is right; what they name is made into an
edit or a proposal outward. The file outlives the merge of the task branches: a task folder dies
with them.

At every finding an address is named: **the rules layer** — true for any tree of this class, **the
names of the tree** — true only here, **an override** — here it sounds different from the package.

## RT-1902 — the first record from a screen, the account commands removed

- **The transaction client of the storage is narrowed by a hand-written interface, and the tree
  already held one.** `IFirstAccountTransaction` in the accounts queries repeats
  `ITransactionClient` of the tree-invite queries with the same reason: the client's own type does
  not resolve here. Nothing named the precedent, and the second copy was written a domain away.
  A third one is the sign to move the narrowing into the persistence util as one declaration.
  **Address:** the names of the tree — the companion of the code-structure rule.
- **An admin screen spec never gets a silent `HttpTestingController`.** The kit icon registry
  fetches `/icons/*.svg` through the same client the screen queries the receiver with, and
  `verify()` fails on requests the screen never sent. Cost: one red run per new screen spec. The
  screen's requests are asserted one by one, and `verify()` is left out or preceded by draining
  the icon traffic. **Address:** the names of the tree — the companion of the testing rule.
- **The prose guard reads the whole shell command as the new text.** An edit that removes a banned
  word through an interpreter's replace call quotes the old text next to the new one, and the
  refusal names the very line the edit erases. Cost: two to three refusals per session; the way
  out is the edit tool, where only the new string is judged. **Address:** the rules layer — the
  cold part of the wording rule.
- **The rules gate names every rule the command will need, and the session loaded them one at a
  time.** Eight refusals in a row on one multi-file edit while the refusal already printed the
  whole list. The cold part of the layer skill says so, but it loads on demand. **Address:** the
  rules layer — the cold part of the layer skill, one sentence at the article about a shell write.
- **The duplicates check prints the finding in words, and the allowlist key form is guessed.** The
  form `value <text> @ <NAME> @ <lib> ~ <NAME> @ <lib>` was taken from a neighbouring entry after
  one refusal; `--baseline` prints the exact key, and nothing says so. The gate also sends the
  allowlist to a rule this tree skips, so the list is edited under no rule. **Address:** the names
  of the tree — the gate map and the companion of the uniformity rule; the rules layer — the
  shared-code pitfalls.
- **The epic branch carried two task folders, and the texts said not to touch one of them.** The
  closing pattern says a foreign folder that arrived by a merge is not touched, while the delivery
  guard refuses the epic's request on any folder under the tasks directory; and the delivery rule
  says the epic branch carries no edits of its own, which leaves no branch for the cleanup once the
  last task is merged. The way found: a second request from the last task branch into the epic
  (PR #2159). **Address:** the rules layer — the closing pattern and the delivery rule.
- **The board audit names a merged branch as one whose folder never travelled.** The line stands
  for `RT-1902-first-run` after the folder was committed, taken apart and merged. The cause is not
  established: the check reads the local ref, and it may judge a lagging one. **Address:** the
  rules layer — the board folders check, after the cause is read from the tree.

## Left unresolved

- **The transaction client narrowing** — waits for a third copy or the owner's word before it
  moves to the persistence util.
- **The board audit line for a merged branch** — the cause is to be read by a command in the tree
  where the line appeared before any text is edited.
