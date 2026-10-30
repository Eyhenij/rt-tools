# mockups — what is this tree's own

Names and bindings of this tree under the rule `SKILL.md` next to it.

The tree draws mockups only for its two kits. The order of approvals around a kit edit is the
tree's own rule `kit-approval`, standing under the same law.

## What it is called here

| In the rule     | Here                                                         |
| --------------- | ------------------------------------------------------------ |
| the design tool | Figma, reached by the session's Figma connection             |
| the kit copy    | the kit components on the Figma sheet of the kit             |
| the domain spec | `docs/specs/ui-kit-v2/` and `docs/specs/ui-kit/`             |
| approved        | the owner's answer quoted in the approval record of the task |

## Where it lives

| What                      | Where                          |
| ------------------------- | ------------------------------ |
| the approval record check | `tools/check-kit-approval.mjs` |
| the order of approvals    | `.claude/skills/kit-approval/` |

## Где исполняются статьи

| Article                                                                                | Where it is carried out                                                                                                                    |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| A kit component on a design-tool sheet is a copy of the kit, and the copy drifts.      | **Not checked by anything.** The Figma sheet is outside the tree; the drift is seen by the showcase match the rule `kit-approval` demands. |
| A mockup of behaviour the tree already has starts with reading the spec of its domain. | **Not checked by anything.** Reading leaves no trace a machine reads.                                                                      |
| The agreement is checked against the approved mockups before work by it.               | `tools/check-kit-approval.mjs:parseApprovals` — the mockup line of the record names the frame the agreement is checked against.            |
| A design-tool call asks the rules gate for this rule,                                  | `.claude/hooks/skill-gate.sh:design` — the call kind of the design tool; the package default of the gate map answers it with this rule.    |
| A mockup is measured by node coordinates before it is shown.                           | **Not checked by anything.** The technique is the pattern `mockups-measure`.                                                               |
