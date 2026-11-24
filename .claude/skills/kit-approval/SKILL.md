---
name: kit-approval
kind: rule
law: mockups
description: This tree's rule for a visible kit edit. A Figma mockup and the owner's approval come first, then the code and every state in the showcase. The showcase matches the mockup at 100% and is approved too. Only then a push, a PR and a release.
---

# A visible kit edit — the order of approvals

A rule of this tree under the law `docs/constitution/mockups.md`. The owner's word, 29 October
2026: «любая правка ui kit сначала должны быть сделана на макетах figma, затем нужно показать
человеку и получать его аппрув».

## What it is called here

| In the law          | Here                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------- |
| a visible edit      | a file of `projects/ui-kit-v2/src`; specs, stories, showcase pages, snapshot references, pure logic (`*.logic.ts`, `*.core.ts`), barrels (`index.ts`) and the storage files named in the check (the key registry, the settings services) are not one |
| the mockup          | a frame in Figma, named by its link with `node-id`                                      |
| approved            | the owner's answer to the question «одобряете?», written down word for word: a chat message or a choice in the question window; for an edit with no change of look — their approval of the plan |
| the approval record | the file approvals.md in the task folder, the same lines in the archive record after it |

## Where it lives

The table in `implementation.md` next to it.

## How the law applies here

- **A visible kit edit starts in Figma, not in code.** The frame is drawn first, measured by the
  pattern `mockups-measure` and shown to the owner with its link.
- **The owner is asked for the approval, and only their answer is written down.** An approval
  goes into the record word for word. A refusal is not written: the frame is fixed and shown again.
  The quotes are confirmed by the owner in the permission window that opening the PR shows; the
  records of the conversations are not searched for them. Before the boundary of an autonomous
  session the PR is refused instead and waits for the morning.
- **The code is written after the mockup approval, and every state is shown in the showcase.** The
  states are the ones the showcase contract of the kit names; a state not shown is not approved.
- **The showcase matches the mockup at 100%, and that is measured, not looked at.** The measurement
  and its number go to the owner together with the showcase.
- **The 100% is a match of numbers, and the overlay is the picture beside it.** Sizes, gaps, radii,
  colours and type of every Figma layer are compared with the computed styles of the same elements
  in the showcase. Every number must be equal. The overlay of the two frames shows the owner where
  they diverge; text is rastered differently by Figma and a browser, so its share is shown, not gated.
- **The whole block of components is compared at once, not one component by one.** A part that
  matches alone can still sit wrong next to its neighbours: the gaps, the alignment and the order
  live between components. The frame of the whole block in the showcase is laid over the frame of
  the whole block in Figma.
- **A redrawn page is built in the showcase whole and compared by overlay with its mockup.** The
  page is a story of its own, with every block the mockup draws, at the mockup's width. Its frame
  is laid over the Figma frame of the page, and the overlay goes to the owner with the showcase.
- **The showcase is shown to the owner and approved by a second answer.** The first approval was of
  a picture; the second is of the component a consumer will get.
- **A kit file edited without a change of look is judged by the executor, and the plan carries the
  judgement.** The owner's word, 23 November 2026: «ты сам должен понимать где нужны макеты а где
  нет». The check judges by the file, and a component class holds more than its look: the type an
  input takes is edited there too. Such an edit has no frame to draw and nothing to measure. The plan
  names every kit file the check counts and says that its look does not change; the line «Без вида»
  quotes the words by which the owner approved that plan, and it replaces all three lines. No question
  of its own is asked, neither with the plan nor at the push. A kit file the plan did not name, met
  later, goes into the progress as a decision along the way, and the line quotes the same approval.
  The line answers only for a branch whose every own kit edit keeps its look; one edit that may change
  the look takes the branch to the mockup. The window of the PR confirms the quote, it asks nothing new.
- **A branch with no kit edits of its own writes no approval line.** Kit files brought by a merge answer
  by the records of their own tasks; a quote of words said about anything else is a false record.
- **The push, the PR and the release go only after the approvals the record demands.** The check
  refuses all three while the record lacks the mockup and showcase quotes, or the no-look quote in
  their place. A release is judged by every merge since the last version
  bump of that kit.

## The record

```markdown
- **Макет:** «<the owner's words>» — https://www.figma.com/design/<file>?node-id=<node>
- **Совпадение:** <N> из <N> чисел
- **Витрина:** «<the owner's words>»
```

An edit without a change of look, named in the approved plan, carries one line instead of the three:

```markdown
- **Без вида:** «<the owner's words>»
```

The match line is printed by `node tools/kit-match.mjs numbers <figma.json> <showcase.json>`; the
overlay frame by `node tools/kit-match.mjs overlay <figma.png> <showcase.png> <diff.png>`.

The record moves into the archive record when the task folder is taken apart, with its lines
verbatim: the release check reads them there.

## What of the law is not here

The check sees that the owner wrote the quote, not what they were shown when they wrote it. The
executor answers for asking about this very frame and this very showcase.

Work merged before the check reached main is not judged: its edits were never asked about.

The gate map does not call this rule on a kit edit. A kit file already has its own rule there, and
the map gives one rule per edit. The rule is held by the push set and by the guard instead.
