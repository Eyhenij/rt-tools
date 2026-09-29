# Grill

## The owner request

> бери в работу эпик 2370, перетяни тикет на борде в колонку in progress, создавай ветку и выполняй задачи друг за другом, ветки делай каскадом чтобы при слиянии веток по очереди не было мерж-конфликтов

The task was found by the gate of RT-2372: two admin end-to-end tests are red on the epic branch
and green on `main`, so no branch of the epic can leave the machine.

## What the tree already has

- `apps/message-bus-admin-e2e/src/list-tree-filter.spec.ts` — SC-MB-359 counts the lines of an
  option by the client rects of a range over the whole option. Since the option tree task the label
  stands in its own `rt-select__option-label` node, and the selected option gets more rects on one
  line.
- `apps/message-bus-admin-e2e/src/sign-in-chrome.spec.ts` — SC-MB-148 compares the dark sign-in
  screen with a reference. The radius scale task moved the segment radius of the toggle group to a
  step of the scale on purpose, and the reference was not re-taken.

## What the rules already say

- `testing`: a test title promises what the body checks; the body is read with the title.
- `ui-component-tests`: a reference is re-taken after the frame has been looked at, one at a time.

## Decisions

- **The option is measured by its label** — the scenario is about the text fitting one line, and
  the label is exactly that text. Rejected: counting distinct line tops over the whole option, it
  still depends on the markup around the label.
- **The sign-in reference is re-taken** — the radius change is intended and already shipped in the
  showcase frames. Rejected: a threshold on the frame, it would let a real shift through.
