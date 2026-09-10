<!-- rt-kit v0.27.0 · pitfalls/spec-driven.md · 3f67ded290ad · правится надстройкой, не здесь -->
# Project documentation — cold part

Pitfalls: traps already stepped on. Loaded not with the rule but on demand — an ordinary
decision does not need it.

The rule is `spec-driven`; the articles that hold the law stand there.

## Pitfalls

- **Do not create `tasks.md` in a spec.** Steps are a session artefact; their place is the branch
  or the PR description. As soon as "steps" appear in the directory, the spec becomes a plan
  again and dies after the merge.
- **A spec describes what is settled, not what is coming.** The only place where it speaks of the
  future is `proposed/<feature>/`. After the rollout its text merges into the domain spec, the
  directory is removed, the scenario identifiers do not change.
- **Nothing checks the semantics of fields.** The check knows procedure names, failure codes and
  the link between scenarios and tests; what an empty field means, it does not know. So a
  `.proto` edit pulls in the specs of every domain whose procedures it touched, in the same
  branch.
- **A symbol's liveness is counted as a name match over the whole tree, not as a call.** A second
  mention anywhere is enough for the symbol — in someone else's field with the same name, in a
  markup attribute. The place where the rule is actually carried out is confirmed only by
  reading the code.
- **An anchor in `tools/*.mjs` is checked by almost nothing:** liveness is counted only for
  `.ts`, and the sources are walked over `apps`, `libs` and `prisma`. So a rule bound to a check
  is read together with the check's body.
- **A green check does not mean the structure is right.** Sidecars with bindings first lay next
  to the laws, and the check was green precisely because the structure matched what the check
  itself expected.
- **A merge conflict in a spec is resolved by keeping both sides, not by choosing one.** Two
  branches append to the end of the same lists — scenarios, rules, binding lines — and both
  sides are right: the conflict here is not a dispute but two appends in one place. Scenario
  numbers are not renumbered on resolution: the identifier is the link key to the tests, and a
  shift of numbers breaks the audit for neighbours the edit did not touch. The order of the kept
  sides is held the same in `spec.md`, `scenarios.md` and `implementation.md`: otherwise a rule,
  its scenario and its binding stop being found by one another. After the resolution
  `npm run check:specs` is run — a conflict in a spec touches no code, and neither the build nor
  the linters will see it.
- **The union answers two appends, not a removal: a side with no text at all is also an edit.**
  A section moved out to the archive or folded into a rule comes back by the union — one
  paragraph stands in two editions, and the removed one reads as current. The case is not rare:
  it arrives exactly when the removal was demanded by the rules layer itself, and branches
  started earlier carry the previous edition. The sign is direct — one side has no text; then
  the conflict is settled by what was done with the section, not by the union. What was removed
  stays removed, and the other side's append moves to where the section went — or does not move
  at all, if it went because it became a rule.

- **Nothing checks the requirement line for a neighbouring resource, and the discrepancy shows
  only by counting.** A rule without it looks whole: the sections are in place, the bindings
  match, the completeness audit is green. It cannot be demanded from all — a rule with nothing to
  require does not write it — so the judge is not a check but two numbers side by side: how many
  rules are in the directory and how many of them declared a requirement.

    ```bash
    ls <rules directory> | wc -l
    grep -rl '^\*\*Requires:\*\*' <rules directory> | wc -l
    ```

    A discrepancy is not a refusal by itself. It names how many rules to read by eye, and that
    number falls as they are read. The count is rough: a line shown as a sample inside a fence
    counts on a par with a real one — the rule that teaches how to write it lands among those
    that declared.
- **A law that no rule named is judged by nobody, and it shows only by counting.** A rule's
  article without an address fails the spec audit — a binding is required of it. A law's article
  has no address by design: the law says what must be true and points at no code. This cannot
  be caught by a refusal — a law that has nothing to be carried out in this tree is a lawful
  state — and unnoticed it lives as long as it likes: two articles lay silent this way while two
  neighbouring rule articles were failing the audit with the address requirement. So two numbers
  side by side judge: how many laws are in the directory and which of them no rule named.

    ```bash
    ls <laws directory>/*.md | wc -l
    for law in <laws directory>/*.md; do
        grep -rqlF "constitution/$(basename "$law")" <rules directory>/*/SKILL.md || echo "$law"
    done
    ```

    The named list is read by eye: for a law the tree has nothing to carry out, this is a lawful
    state; for the rest — the forgotten half of the work. The count is rough here too: a law
    named by a rule in one line and not taken apart by any of its articles does not make the
    list — the link between an article and a rule is held by text, not by a key.

- **A binding is written by the article's text, not by the sense of a guard's name.** A guard
  whose name sounds like the same thing does not close the article: the article listed six
  actions taken only on the owner's explicit word — commit, push, opening a PR, writing to the
  wiki, creating a task, editing a law — and the guard placed against it holds none of them, and
  sending a proposal is not among the listed at all. The article's text is read whole, and the
  binding names the place that holds what the article named, not a neighbour by sense.
