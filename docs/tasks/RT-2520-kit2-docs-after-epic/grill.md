# Grill

## The owner request

> При приглашении полосы быть не должно

> Да, исправь

The second answer is to the question: "In main two small things are left in the second kit's
documentation: the handles table in Theming is cut into three parts, and your decision on the
selector (no bar under the invitation) is written nowhere. Take a task to fix them?"

## What the tree already has

- The epic RT-2472 is merged into main by PR #2513, and its plan table was fixed by PR #2515.
- The "Consumer handles" section of `projects/ui-kit-v2/docs/Theming.mdx` holds all 70 handles
  without repeats, but the merges left two extra table headers inside it: the page draws three
  tables in a row.
- The selector spec `docs/specs/ui-kit-v2/dynamic-selector-options/spec.md` already has the rule
  that with the panel switch on the bar gives its place to the invitation, as before. Why there is
  no third value of the switch — a bar under the invitation — is said nowhere.

## What the rules already say

- The end of an epic is a stop; new work is taken by the owner's word, and work outside an epic
  goes with that word named.
- A decision from a spec goes to the layer: the decision lives in the spec's "Decisions" section.

## Questions and answers

**Does the application need the bar under the invitation (the third value of the switch)?**
При приглашении полосы быть не должно

**Take a task to fix both?**
Да, исправь

## Decisions

- **The decision is written into the selector spec, not into the closed epic plan.** The spec is
  read by whoever edits the selector next; the plan of a closed epic is not.
- **The handles table is glued by removing the two extra headers, rows stay in their order.**
  Rejected: sorting the rows — a larger diff for no reader's gain.

## What is left unclear

- Nothing.
