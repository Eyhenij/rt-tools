# Grill

## The owner request

> Задачи вне эпиков

RT-2439 is the next single task of the queue: the rest of it is first-kit work, closed by the
owner's answer «Закрыть пять, взять RT-1889», and RT-1889 turned out done by an earlier commit.

The task text asks for two things: an output that says the person started and stopped typing in
the reply field, and an input with a line «the other side is typing» under the thread above the
reply field.

## What the tree already has

- `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.ts` — the
  correspondence; 497 lines against the limit of 500, so the new logic goes into a file of its own.
- The reply field has two modes: the classic form of the correspondence itself and
  `rt-message-composer` in the rich mode. The composer exposes no event per keystroke; both modes
  raise the native `input` event of a text area or of an editable node.
- `rt-chat__thread-viewport` is positioned, and the refresh overlay already stands over it.

## What the rules already say

- `frontend-application`: a control does not change size while its work runs — the same reason
  the line must not shift the thread.
- `reuse-first`: the line is part of the correspondence, not a primitive of its own.
- No spec or rule names the place of a «typing» line: searched by «печатает», «typing», «набира».

## Questions and answers

**What this copy takes next**
Задачи вне эпиков

**Where the «typing» line stands** — the question was refused twice by the conversation guard
before it left; the recommended option was taken, see below.

## Decisions

- Question closed by assumption: the line stands over the bottom edge of the thread as a small
  plate, not as a reserved row. It takes no room, so a correspondence without the line does not
  change by a pixel. Price: while the other side types, the plate may cover the bottom of the last
  reply. The owner is told this in the reply.
- Question closed by assumption: «stopped» is sent after 3 seconds without input, on an emptied
  field and on sending. One «started» and one «stopped» per stretch of typing.
- Question closed by assumption: the input is caught by the native `input` event of the reply
  area in both modes; the file picker is not text and does not count.
- Question closed by assumption: the live region stays in the markup even when empty, otherwise a
  screen reader does not announce the first line.

## What is left unclear

- Nothing.
