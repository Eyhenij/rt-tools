# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Showcase, measurement and approval
- **Done:** the agreement lies in `docs/specs/ui-kit-v2/proposed/table-pinned-column/`, scenarios
  SC-UKV-1114 to SC-UKV-1121; the mockup is approved by «тень ок»; the plan is written.
- **Next step:** 3.2 — the row height 67 against 50 goes to the owner; the rest of the
  measurement matches.
- **Measured against the mockup** (`node tools/kit-match.mjs numbers`, frame start-0, the other
  five frames give the same numbers): 14 of 17 match — scroller 375, scroll range 185, columns
  150/140/140/130 (c480251fe, fixed layout in the story), padding 8/20, font 14/500, text and header
  colours, the problem row and the total row backgrounds, the total weight 600. Header, row and total
  heights are 67/67/66.5 against 50: the kit cell is `height: 50px` without its padding and border
  since 3e9fa507d.
- **Seen in the showcase on 2 November** (story `organisms-table-table--pinned-column`, :6007, Chrome):
  all six frames are 375 wide over a 560 table; the scroll is 0, 120, 0 and 185 as planned; the host
  modifiers and the shadow opacity match the mockup in every frame (shadow 1 at left-120, right-0
  and both dark frames, 0 at left-0 and right-end); the pinned cell hides the scrolled columns.
  Two differences from the mockup: the total row is 21.5 high and unpadded — `rt-table` styles no
  `cdk-footer-cell` at all; the guest names wrap into two lines (row 67 high) where the mockup cuts
  them with an ellipsis at a 150 column.
- **After the ellipsis fix** the guest name is cut and carries its full text in the cell title, but
  the row stays 67 high: every cell content is one line (18–22), the height is the kit cell itself —
  `height: 50px` plus the vertical padding plus the border, the same in every `rt-table` story. The
  Figma table cell is 50 high: that is a difference of the kit against its mockup, older than this
  task. The column widths come out 171/118/151/120 instead of 150/140/140/130: the table lays its
  columns out by content. Both go to the owner at the measurement instead of being fixed here.
- **Total row:** the owner chose «Только в истории (Recommended)»; the story wrapper gives the footer
  cells the kit cell height and padding, measured 66.5 high with 8/20 padding in all six frames
  (c0c693ff4). The Overview of `rt-table` got the section about the pinned column (120e1c160).
- **Shadow on every row and stronger** (owner: «с тенью только хедер и футер, при чем на футере
  плохо видно тень», then «Усилить (Recommended)»): the story's guest cell clipped the shadow by its
  own `overflow: hidden` — the ellipsis moved to an inner element and the Overview names the
  condition (f4d11deaf); the shadow token went 12% → 16% light and 48% → 64% dark, the four
  gradients of the mockup with it. Measured: shadow opacity and 0.16/0.64 on all five rows of every
  frame; caption gap 12, frame gaps 24 and 48 as in the mockup.
- **Waiting for the owner:** whether the kit row height 67 against 50 is fixed here or by a task of
  its own — the question went unanswered while the shadow was reported.
- **Mockup:** https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=7448-2186 — page Table,
  six frames of width 375: left and right pin, scroll start, middle and end, two in the dark theme.
- **Uncommitted:** nothing.
- **PR:** not open yet

## Steps

- [x] 1.1 Give every table row a background from a token, and make a pinned cell inherit it.
- [x] 1.2 Draw the edge shadow on the CDK border cell of each pin from shadow tokens, hidden by default.
- [x] 1.3 Name the new tokens in the component description next to the code.
- [x] 2.1 Write a pure function that says which pinned edge has hidden content, from the scroll position and the sizes.
- [x] 2.2 Make the table watch the nearest ancestor that scrolls sideways and mark the hidden edges by host modifiers.
- [x] 2.3 Cover the function by unit tests with the scenario ids.
- [x] 3.1 Add a story of the pinned column with the frames of the mockup.
- [>] 3.2 Measure the showcase against the mockup and make the numbers match.
- [ ] 3.3 Cover the browser scenarios by a visual snapshot of the story.
- [ ] 3.4 Show the showcase to the owner and record the answer.

## Decisions along the way

- **The shadow is 16% black light and 64% dark instead of the approved 12% and 48%.** The owner
  found it weak on the total row and chose «Усилить (Recommended)»; the mockup gradients follow.

- **The row of this working copy in the assignment table is rewritten to RT-2907.** The owner said
  «разрешаю» to that edit. The branch could not be taken while the row named a closed task.
- **Commits are signed `SVIATASLAU KHUTARNY <sviathut@gmail.com>`.** The owner set it by
  `git config` and said «добавь мой» about the signature list of the tree profile. The first commit
  was signed by another address, and it was made again under this one.
- **«тень ок» is recorded as the mockup approval.** The owner was asked whether the shadow suits,
  the rest of the frames repeats the kit look.

## Sessions

### 2026-11-02

- RT-2907 checked as untaken: no assignee, no branch, no PR, no folder, no comments.
- Assigned to `treble3d`, moved from Backlog to In progress.
- Exploration of `rt-table`: no rule styles a pinned cell; the background lives on the row.
- The mockup is drawn on page Table of the second kit's Figma file and approved.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2907-rt-table-sticky-column

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Showcase, measurement and approval
- **Next step:** 3.2 — the row height 67 against 50 goes to the owner; the rest of the
  measurement matches.
- **Measured against the mockup** (`node tools/kit-match.mjs numbers`, frame start-0, the other
  five frames give the same numbers): 14 of 17 match — scroller 375, scroll range 185, columns
  150/140/140/130 (c480251fe, fixed layout in the story), padding 8/20, font 14/500, text and header
  colours, the problem row and the total row backgrounds, the total weight 600. Header, row and total
  heights are 67/67/66.5 against 50: the kit cell is `height: 50px` without its padding and border
  since 3e9fa507d.
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2907-rt-table-sticky-column/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
cfc617bf6 feat(rt:ui-kit-v2): имя гостя в истории закреплённой колонки обрезается, как в макете
a68d09c6a docs: что показала витрина закреплённой колонки RT-2907
40943a58f feat(rt:ui-kit-v2): история закреплённой колонки rt-table по кадрам макета
723265a02 docs: передача сессии по RT-2907 перед этапом витрины
272c7c312 feat(rt:ui-kit-v2): тень у края закреплённой колонки rt-table следует прокрутке
f66110f9e feat(rt:ui-kit-v2): закреплённая ячейка rt-table берёт фон строки и тень у края
3fcb9d854 docs: план RT-2907 и одобрение макета закреплённой колонки
57cc785b3 docs: макет закреплённой колонки RT-2907 ждёт одобрения владельца
c2d5565a3 docs(rt:ui-kit-v2): договорённость о закреплённой колонке rt-table
825929e04 chore: адрес владельца в списке людей, подписывающих коммиты
bedafcbcd docs: задача RT-2907 взята, строка назначения копии и папка задачи
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
