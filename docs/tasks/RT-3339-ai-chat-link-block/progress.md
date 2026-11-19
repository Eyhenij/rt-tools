# Progress

## Where we stand

- **State:** `разбор-закрыт`
- **Stage:** 0 of — — the mockup before the agreement
- **Done:** the task is taken: assignee rt-tools-dev, the board column «In progress», the branch `RT-3339-ai-chat-link-block` from `RT-3338-ai-chat-kpi-block` (chain, PR #3429), the folder from the template. The exploration is written into the grill; the six questions and the design decisions are closed by assumption.
- **Next step:** the owner's word on the mockup 8339-452; after it the product agreement in `docs/specs/ui-kit-v2/proposed/ai-chat-link/` and the plan.
- **Uncommitted:** no
- **Waiting for the owner:** the word on the mockup 8339-452
- **PR:** not open yet; the base is `RT-3338-ai-chat-kpi-block` (#3429)

## Steps

The plan is not written yet.

## Decisions along the way

- **The mockup 8339-452 is drawn from the kit's own parts, measured in the pinned Chrome.** The
  button `sm`: height 32, padding 14, font 13/500, radius 10, gap 8; disabled — text #959595,
  outlined border #e0e0e0. The tag `sm`: height 16, padding 4, font 12/12, gap 2, a capsule;
  success #059669 on #ecfdf5, danger #dc2626 on #fef2f2, neutral #282828 on #e0e0e0; in the dark
  theme the status at 12% of its colour, neutral #fafafa on #17181c. The card takes the KPI frame:
  border 1 by `border/default`, radius 12, padding 12, gap 12. The row: an icon box 36 with radius
  8, the title 14/600 on 17, the section 12/16 muted, the status tag under them; the reason of
  `failed` is a line 12/16 in the error text colour (#c00111, #dc2626 in the dark theme). Drawn at
  328 and 386 (the side panel) and 640 (the full-screen reading column), the dark theme at 328.
- **The status tag stands under the section, not at the right of the title.** At the right it
  wrapped the title to two lines at 328.
- **The owner found defects in the mockup and asked for two review rounds with fixes after each.**
  Round 1: the dark cards and the disabled outlined button took the light border #e0e0e0 — now the
  dark `border/default` #33383d and the disabled text at 25% of #fafafa; the spinner was a filled
  dot — now the kit ring, a track and a quarter arc, 12; the icon box stood centred on a half pixel
  — now at the top of the text column; no long title was drawn — now a fourth card per column:
  the title wraps to two lines and ends with an ellipsis, the section keeps one line. Round 2: the
  reason of `failed` stood at the card edge, apart from its tag — now under the tag in the text
  column.
- **Measured by node bounds after round 2:** every card keeps its two buttons on one top; no frame
  overlaps another; cards are 127 high, 149 with a reason, 144 with a two-line title. The button
  labels stand on a half pixel (a 13 line in a 32 box), as the kit button draws them.
- **The owner's remark on the mockup: a wider gap between the icon and the text of a status tag.**
  The gap is 4 in all three tags; the kit tag `sm` draws 2, so the code is fitted to the mockup,
  as the owner set in RT-3338.

## Sessions

### 2026-11-19

- RT-3338 handed in by #3429; the next task of the epic plan is RT-3339.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/ai-chat-blocks
**Branch:** RT-3339-ai-chat-link-block

### Where we stand at the minute of the compaction

- **State:** `разбор-закрыт`
- **Stage:** 0 of — — the mockup before the agreement
- **Next step:** the owner's word on the mockup 8339-452; after it the product agreement in `docs/specs/ui-kit-v2/proposed/ai-chat-link/` and the plan.
- **PR:** not open yet; the base is `RT-3338-ai-chat-kpi-block` (#3429)

The progress in full — `docs/tasks/RT-3339-ai-chat-link-block/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
86ef3a47b docs(rt:ui-kit-v2): замер кита и макет карточки ссылки для RT-3339
c9e3e577b docs(rt:ui-kit-v2): план эпика отмечает RT-3338 влитой (#3429)
8c3cce2ca docs(rt:ui-kit-v2): находки разбора правил по RT-3338 у плана эпика
8608dc789 docs(rt:ui-kit-v2): задача RT-3339 взята, разбор закрыт допущениями
e3425d045 fix(rt:ui-kit-v2): строки дельты и периода карточки kpi по 16, как в макете (RT-3338)
0dfd86b8a fix(rt:ui-kit-v2): у элемента kpi в ленте блоков есть своё правило стилей (RT-3338)
3849347da docs(rt:agent-kit): записи описания прошлого старше недели убраны
8537dca81 docs(rt:ui-kit-v2): папка задачи RT-3338 разобрана в описание прошлого
845b2900b docs(rt:ui-kit-v2): макет kpi сведён с кодом, совпадение 28 из 28 (RT-3338)
70dc7d476 docs(rt:ui-kit-v2): договорённость о блоке kpi сведена в spec (RT-3338)
c08c82250 feat(rt:ui-kit-v2): значение компактной плитки мельчает, когда не входит в строку
a609495e8 fix(rt:ui-kit-v2): блок kpi после второго круга ревью (RT-3338)
0f80720c7 fix(rt:ui-kit-v2): блок kpi после первого круга ревью (RT-3338)
eea80eea0 Merge remote-tracking branch 'origin/RT-3346-ai-chat-blocks' into RT-3338-ai-chat-kpi-block
f5037fb8c feat(rt:ui-kit-v2): витрина блока kpi и числа плитки под rtl
c869db7e3 feat(rt:ui-kit-v2): блок kpi в ответе rt-ai-chat
1737ba4d0 Merge remote-tracking branch 'origin/main' into RT-3338-ai-chat-kpi-block
3d8e5d19c feat(rt:ui-kit-v2): плитка пишет дельту по языку кита, компактный размер
bb4d79585 feat(rt:ui-kit-v2): данные, запись значения и схема блока KPI
1b7111481 docs(rt:ui-kit-v2): план RT-3338 одобрен — данные, плитка, блок, витрина
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
