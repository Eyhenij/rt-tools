# Grill

## The owner request

> мейн подтяни

Context: before the epic goes to main, the owner asked whether it breaks the kit. The epic was 9
commits behind main: the message field learned to stop a reply (RT-2466), and the overview check
started to count `model()` as a component input.

## Decisions

- **Both sides of the scenario index stay** — the epic's rows and main's numbers 537–539 of the
  message field; the epic's last number is 536, so nothing collides.
- **The two model inputs the check now sees are described in the overview tables** —
  `chosenEntities` of the dynamic selector and `expanded` of the expansion panel. Rejected:
  turning them into plain inputs — both are two-way bindings by design.
- **The merge commit stands on the local epic, the fix in this branch** — the epic branch takes no
  code edits of its own, and a task branch must be taken from an epic that carries main.
