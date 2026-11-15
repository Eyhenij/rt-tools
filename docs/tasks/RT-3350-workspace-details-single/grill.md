# Grill

## The owner request

> Задача в эпик, кит

> Да, по циклу

The request was handed over by the session that ran the conversation with the owner: on a phone the
details panel of `rt-workspace` with the threshold input opens as a narrow block inside the centre
column — 309 × 626 px, no header with «Сведения», no button «Закрыть», no dimmed background. At 768
and 1080 it opens right: the side panel over the window.

## What the tree already has

- `docs/specs/ui-kit-v2/workspace-breakpoint/spec.md` — the threshold subdomain. Its last rule
  says the opposite of the request: «At a place not wider than the threshold the details panel
  opens as before» (scenario `SC-UKV-1242`).
- `rt-workspace.component.ts:asideOverlay` —
  `singleColumnBreakpoint() !== null && narrow() && !singleColumn()`: one column is excluded.
- `rt-workspace.component.scss` already holds `.rt-aside-overlay.rt-workspace-aside-pane` under 768:
  `width: auto; max-width: 100dvw` — the panel of 540 takes the whole window of 375.
- Showcase: Organisms/Workspace/Breakpoint, stories `Phone`, `PhoneDark` show one column closed.
- Figma: the approved tablet frame 7817-3327 of the same side panel.

## What the rules already say

- `kit-approval`: a visible kit edit needs the owner's approval of the mockup and of the showcase,
  and the showcase matches the mockup by numbers.
- A session started by another session asks its questions to that session, not to the owner.

## Questions and answers

None: the request and the code close every question.

## Decisions

- **One column opens the details over the window as well** — the same `rt-workspace-aside-overlay`
  as with two columns, so the header, «Закрыть» and the dimmed background come with it. Rejected:
  a header of its own inside the column — a second view of the same panel.
- **Without the threshold input nothing changes** — the rule about the threshold of the styles
  stays; the request names only the input case.
- **The width is not touched** — the existing rule under 768 already gives the whole window.

## What is left unclear

- Nothing.
