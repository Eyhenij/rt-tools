# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 5 of 5 — Closing
- **Done:** the spec, the service, the widget list and head, the end-to-end checks and three frames
- **Next step:** run `pnpm run check:all`, take the folder apart, open the PR
- **Uncommitted:** nothing
- **Waiting for the owner:** the proposals of the rules reviews of RT-2373, RT-2366 and RT-2365
- **PR:** not open yet

## Steps

- [x] 1.1 Read the data model of the chat and the operators
- [x] 1.2 Write the decisions and the scenarios into the chat spec and the widget spec
- [x] 2.1 Give the visitor the list of their talks and a way to start a new one
- [x] 2.2 Give the site the operator's name and role at an answer
- [x] 2.3 Cover the procedures by the service tests
- [x] 3.1 Draw the list screen and the new-talk button
- [x] 3.2 Draw the head of a talk with the back arrow, the avatar, the name and the role
- [x] 3.3 Cover the new logic by the widget tests
- [x] 4.1 Write the end-to-end checks of the list and of the head
- [x] 4.2 Compare with the mockup frames and take the frames
- [>] 5.1 Run the full set of checks

## Decisions along the way

- The answer keeps the name of the account at the minute of the answer, not a link to the account:
  the chat does not touch the tables of the intake.
- The stream of the widget is subscribed by the visitor, not by one talk: an answer to another talk
  marks it unread in the list.
- The list frame is taken on a seeded visitor of the site outside the hours: talks made by the run
  carry the minute of the run, and the operator of the stand does not answer for that site.
- A closed talk shows the mark «Закрыто» and never the unread dot.

## Sessions

### 2026-09-30

- The mockup frames «Список обращений», «Разговор идёт» and «Без ответа» read: the avatar is drawn
  by initials, no frame shows a photo.
