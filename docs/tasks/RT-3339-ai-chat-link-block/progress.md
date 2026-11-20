# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — The card and the event through the chat
- **Done:** the task is taken: assignee rt-tools-dev, the board column «In progress», the branch `RT-3339-ai-chat-link-block` from `RT-3338-ai-chat-kpi-block` (chain, PR #3429), the folder from the template. The exploration is written into the grill; the six questions and the design decisions are closed by assumption.
- **Stage 1 is done on 20.11.2026.** The epic branch is merged in: RT-3342 is merged (#3437), the epic PR into the main branch is open as a draft (#3438). `rtLinkData` and `RT_AI_CHAT_LINK_SCHEMA` are written and exported from the util barrel; `jest src/lib/util/link` gave 2 suites and 7 tests passed, the kit `typecheck` exited 0.
- **Next step:** stage 2, step 1 — the `LinkBlock` type, the `link` view and the copy line.
- **Uncommitted:** no
- **PR:** not open yet; the base is `RT-3346-ai-chat-blocks` — RT-3338 is merged into it (#3429)

## Steps

### 1. The data of the block: the lenient function and the schema

- [x] 1. Write the lenient data function of a link block in `link-data.ts` next to `kpi-data.ts`: title and url required and trimmed, section, icon with `link` by default, state absent when unknown, reason only in `failed`.
- [x] 2. Write the JSON schema of the block in `link.schema.ts` next to `kpi.schema.ts` — `title`, `url`, `section`, `icon` — and export both from the util barrel.
- [x] 3. Write the specs of the data function and the schema with the scenario numbers of the agreement: SC-UKV-1488, 1489, 1497.

### 2. The card and the event through the chat

- [ ] 1. Add the `LinkBlock` type, the `link` view, the `LinkOpen` event type, `link` in `OWN_TYPES`, the data step in `toBlockViews` and the copy line in `blockText`. ← now
- [ ] 2. Write the `rt-ai-chat-link` component on `rt-tag`, `rtButton` and `rt-icon`: the row with the numbers of the agreement, the text column, the status, the reason, the two buttons with `aria-disabled` in `pending`, the announcement text of a state change for the feed, tokens only.
- [ ] 3. Carry the press from the card through `rt-ai-chat-blocks` and the answer to a synchronous `linkOpen` output of `rt-ai-chat` that adds the message id.
- [ ] 4. Add the labels «Opening», «Opened», «Failed to open», «Open», «Open in new tab» to the kit English set and the showcase Russian set.
- [ ] 5. Set the gap of the tag `sm` to `--rt-space-1` and add the option that turns the start icon of the tag.
- [ ] 6. Write the specs of the card, the logic, the copy, the chat output and the tag option: SC-UKV-1487, 1490–1496, 1499, 1501, 1502, 1506.

### 3. The showcase and the match with the mockup

- [ ] 1. Write the stories of the block by the agreement's table «Screens and states»: pending, opened, failed, failed without a reason, no state, long title, no section, long button labels, 328, 386, 640, dark at 328, right to left, invalid.
- [ ] 2. Write a chat story of the whole loop in the narrow panel and in the full-screen mode: a press logs `linkOpen` with `{ messageId, url, newTab }`, sets `pending`, then `opened`, and on the second card `failed` with a reason; put the handler code into the block `Overview.mdx`.
- [ ] 3. Write the play steps that measure by `getBoundingClientRect` the icon box, the row gaps, the button row on one top, the wrapped buttons, the two-line title, the mirrored order and no text past the card, and that press a button and wait for the status to change: SC-UKV-1498, 1503, 1504.
- [ ] 4. Write the `Overview.mdx` of the block and name the block and `linkOpen` in the chat Overview.
- [ ] 5. Set the gap 4 in the `sm` variants of the Figma `Tag` and lift the instance overrides of the mockup 8339-452.
- [ ] 6. Look at every story live, take the references of the block and anew those of the tag whose gap changed, sweep all the stories.
- [ ] 7. Match the stories with the approved mockup by numbers into the table «mockup / showcase» in the progress, with the contrast of the dark reason and tag, show the showcase to the owner and write their word into `approvals.md`; SC-UKV-1500 and 1505 are held by this match.

### 4. Review rounds and closing

- [ ] 1. Review round one by qa-engineer, product-strategist and goal-critic; fix the confirmed findings in one commit.
- [ ] 2. Review round two by fresh readers; fix the confirmed findings in one commit.
- [ ] 3. Merge the agreement into `docs/specs/ui-kit-v2/ai-chat-link/` with its bindings; edit the chat and tag specs and the kit spec indexes as the agreement names.
- [ ] 4. Bring `CONTEXT.md` of ai-chat and the tag up to the block, the output and the gap.
- [ ] 5. Mark row 7 of the epic plan, write the archive record, take the task folder apart.
- [ ] 6. Run the push set, push, open the PR into `RT-3346-ai-chat-blocks`.

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
- **The owner asked why the cards were drawn without the kit atoms; they were — a miss.** The file
  holds the kit copy: `Tag`, `Button/Outlined`, `Button/Text`, `Icon/*`. Every card is rebuilt on
  instances: `Icon/chart-bar` in the icon box; `Tag` `sm` solid — neutral with `spinner`, success
  with `check`, danger with `exclamation-circle`; `Button/Outlined` and `Button/Text` `sm` primary,
  `Disabled` in `pending`, the text one with `external-link`. The card fill, border and texts are
  bound to the colour variables `bg/surface`, `border/default`, `bg/surface-subtle`,
  `text/primary`, `text/muted`, `state/error-text`; the columns take the modes Light and Dark
  explicitly. The card frame stays drawn: the kit `Card` has a title and content slots, not this
  layout. The tag gap 4 is an instance override until the kit tag `sm` takes it.
- **The kit copy was broken and is fixed once:** in the `Tag` set the 42 variants of sizes `sm`,
  `lg` and the dot did not wire `Value`, `Show icon`, `Icon`, `Closable` to their layers, so an
  instance showed «Статус» whatever was set. The label is wired in all of them; the icon and the
  close button only in `solid` and `outlined` — the dot draws neither, as in the code.
- **Measured after the rebuild:** 16 cards, four kit instances in each, no overlaps, the buttons
  of every card on one top.
- **The grill assumed the new labels in eight languages; the kit has one set.** The labels live in
  `rt-kit-labels.en.ts`, the showcase adds its Russian set, every other language comes from the
  application. The agreement takes English in the kit and Russian in the showcase.
- **The agreement was reviewed by spec-critic, goal-critic and product-strategist before the
  plan went to the owner.** Taken, each checked against the code or the mockup: no status when
  the block has no state (the grill's «opened» would claim an opening nobody made); the schema
  without `state` and `reason`; `aria-disabled` in `pending` so the focus stays; the synchronous
  event for a new tab; the turning spinner as a tag option (`rt-tag` does not pass `spin` to its
  icon); the announcement through the feed's polite region (`rt-ai-chat.component.html:79`); the
  row numbers from the mockup (icon 20 muted, gaps 12, 6, 2, buttons 8 apart, theme primary); the
  wrapping buttons; the dark contrast 3.2 : 1 named; the `sm` gap for all parts; the real reason
  not to take `rt-card` (a shadow, `--rt-space-lg`, `--rt-radius-xl`); the whole loop in a chat
  story; the Figma `Tag` `sm` variants at 4. Open for the owner: the epic milestone G holds no link
  card.
- **The first free scenario number is SC-UKV-1487, not 1486.** `pnpm run spec:next-id SC-UKV`
  found 1486 taken in a neighbouring branch.

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
- **Next step:** the product agreement for the link block, written into the kit's proposed specs, then the plan and the owner's word on it.
- **PR:** not open yet; the base is `RT-3338-ai-chat-kpi-block` (#3429)

The progress in full — `docs/tasks/RT-3339-ai-chat-link-block/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
3a8595f82 docs(rt:ui-kit-v2): макет карточки ссылки RT-3339 одобрен
8b1bf0276 docs(rt:ui-kit-v2): макет карточки ссылки RT-3339 на экземплярах кита
fc4cc0136 docs(rt:ui-kit-v2): отступ значка и текста в теге статуса макета RT-3339
fbfc58f86 docs(rt:ui-kit-v2): два круга ревью макета карточки ссылки RT-3339
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
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
