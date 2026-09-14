# Grill

## The owner request

> введи ещё одну колонку to test между in review и done, перемести туда все задачи из done

## What the tree already has

- The board columns and their option ids live in `.claude/rt-kit/checks.json` under `board.statusOptions`; `tools/board.mjs` reads them for `npm run task:move`, `tools/check-board.mjs` for the audit, `tools/task-new.mjs` for the first column.
- The Status field of the board had seven options: New, Backlog, Ready, In progress, In review, Done, Deployed (Deployed is not in the config).
- Adding an option goes through `updateProjectV2Field` with the whole option list; GitHub re-created every option with a new id, every card lost its status, and the board's auto-archive workflow archived all 784 closed cards.

## What the rules already say

- Rule `git-workflow`: the column names of this tree are in `implementation.md`; the move command reads the config, not GraphQL from memory.
- Rule `agent-kit-extend`: `checks.json` is the tree's own data — an object merges key by key.

## Questions and answers

**Что делать с 756 закрытыми карточками в архиве доски (статус пустой)?**
Оставить в архиве (Recommended).

## Decisions

- **The board is restored from this session's own listing.** 49 visible cards returned to their former columns; 28 cards closed today and 2 from Deployed unarchived and put into To test; the other 756 archived stay as they are — the owner's word.
- **The config is edited, not the tools.** `to-test` is one more key of `statusOptions`; `board.mjs` accepts any key of the object.

## What is left unclear

- The Deployed column stays outside the config, as before: nothing in the tree moves cards there.
