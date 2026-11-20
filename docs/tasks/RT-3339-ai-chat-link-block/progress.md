# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Review rounds and closing
- **Done:** the task is taken: assignee rt-tools-dev, the board column «In progress», the branch `RT-3339-ai-chat-link-block` from `RT-3338-ai-chat-kpi-block` (chain, PR #3429), the folder from the template. The exploration is written into the grill; the six questions and the design decisions are closed by assumption.
- **Stage 1 is done on 20.11.2026.** The epic branch is merged in: RT-3342 is merged (#3437), the epic PR into the main branch is open as a draft (#3438). `rtLinkData` and `RT_AI_CHAT_LINK_SCHEMA` are written and exported from the util barrel; `jest src/lib/util/link` gave 2 suites and 7 tests passed, the kit `typecheck` exited 0.
- **Stage 2, step 1 is done.** The block is in the chat model and in the feed logic; the copy line is written. `jest …/blocks/rt-ai-chat-blocks.link` gave 5 tests passed, the blocks folder 85 before it.
- **Stage 2 is done on 20.11.2026.** The card `rt-ai-chat-link` is written, the press reaches the chat output `linkOpen` with the message id, the labels are in both sets. The tag has the input `iconSpin` and the gap 4 at `sm`. The link schema stands among the section's own schemas.
- **Stage 2, the numbers.** `jest` over the chat, the tag, util and the labels gave 29 suites and 279 tests passed; the kit `typecheck` and `verify` exited 0.
- **Stage 3, steps 1–4 are done.** Eleven stories of the block and its overview page are written; the chat overview names the block and `linkOpen`. In the showcase on 6007 every story passed its `play` steps. The cards at 328 measured 127, 127, 149 and 144 high with 8 between them, as the mockup draws.
- **Stage 3 is done on 20.11.2026.** The Figma `Tag` `sm` variants take the gap 4. The match was redone from two independent readings and gave 530 of 530 numbers.
- **Stage 4, round one is read.** The three roles gave their findings; the confirmed ones are fixed and go as one commit.
- **Stage 4, round two is read.** No blocker. The confirmed findings are fixed and go as one commit with the snapshot references.
- **Next step:** stage 4, step 5 — the archive record and taking the task folder apart.
- **Uncommitted:** no
- **PR:** not open yet; the base is `RT-3346-ai-chat-blocks` — RT-3338 is merged into it (#3429)

## Steps

### 1. The data of the block: the lenient function and the schema

- [x] 1. Write the lenient data function of a link block in `link-data.ts` next to `kpi-data.ts`: title and url required and trimmed, section, icon with `link` by default, state absent when unknown, reason only in `failed`.
- [x] 2. Write the JSON schema of the block in `link.schema.ts` next to `kpi.schema.ts` — `title`, `url`, `section`, `icon` — and export both from the util barrel.
- [x] 3. Write the specs of the data function and the schema with the scenario numbers of the agreement: SC-UKV-1488, 1489, 1497.

### 2. The card and the event through the chat

- [x] 1. Add the `LinkBlock` type, the `link` view, the `LinkOpen` event type, `link` in `OWN_TYPES`, the data step in `toBlockViews` and the copy line in `blockText`.
- [x] 2. Write the `rt-ai-chat-link` component on `rt-tag`, `rtButton` and `rt-icon`: the row with the numbers of the agreement, the text column, the status, the reason, the two buttons with `aria-disabled` in `pending`, the announcement text of a state change for the feed, tokens only.
- [x] 3. Carry the press from the card through `rt-ai-chat-blocks` and the answer to a synchronous `linkOpen` output of `rt-ai-chat` that adds the message id.
- [x] 4. Add the labels «Opening», «Opened», «Failed to open», «Open», «Open in new tab» to the kit English set and the showcase Russian set.
- [x] 5. Set the gap of the tag `sm` to `--rt-space-1` and add the option that turns the start icon of the tag.
- [x] 6. Write the specs of the card, the logic, the copy, the chat output and the tag option: SC-UKV-1487, 1490–1496, 1499, 1501, 1502, 1506.

### 3. The showcase and the match with the mockup

- [x] 1. Write the stories of the block by the agreement's table «Screens and states»: pending, opened, failed, failed without a reason, no state, long title, no section, long button labels, 328, 386, 640, dark at 328, right to left, invalid.
- [x] 2. Write a chat story of the whole loop in the narrow panel and in the full-screen mode: a press logs `linkOpen` with `{ messageId, url, newTab }`, sets `pending`, then `opened`, and on the second card `failed` with a reason; put the handler code into the block `Overview.mdx`.
- [x] 3. Write the play steps that measure by `getBoundingClientRect` the icon box, the row gaps, the button row on one top, the wrapped buttons, the two-line title, the mirrored order and no text past the card, and that press a button and wait for the status to change: SC-UKV-1498, 1503, 1504.
- [x] 4. Write the `Overview.mdx` of the block and name the block and `linkOpen` in the chat Overview.
- [x] 5. Set the gap 4 in the `sm` variants of the Figma `Tag` and lift the instance overrides of the mockup 8339-452.
- [x] 6. Look at every story live, take the references of the block and anew those of the tag whose gap changed, sweep all the stories.
- [x] 7. Match the stories with the approved mockup by numbers into the table «mockup / showcase» in the progress, with the contrast of the dark reason and tag, show the showcase to the owner and write their word into `approvals.md`; SC-UKV-1500 and 1505 are held by this match.

### 4. Review rounds and closing

- [x] 1. Review round one by qa-engineer, product-strategist and goal-critic; fix the confirmed findings in one commit.
- [x] 2. Review round two by fresh readers; fix the confirmed findings in one commit.
- [x] 3. Merge the agreement into `docs/specs/ui-kit-v2/ai-chat-link/` with its bindings; edit the chat and tag specs and the kit spec indexes as the agreement names.
- [x] 4. Bring `CONTEXT.md` of ai-chat and the tag up to the block, the output and the gap.
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

## The match «mockup / showcase»

Taken on 20.11.2026 in the pinned Chrome from the story `Themes` of the showcase on 6007, the card
`failed` at 328; the mockup numbers are read from the frames 8339:498 and 8339:703. Positions are
counted from the corner of the card.

| what                     | mockup              | showcase               |
| ------------------------ | ------------------- | ---------------------- |
| card `pending`, `opened` | 328 by 127          | 328 by 127             |
| card `failed`            | 328 by 149          | 328 by 149.2           |
| card with the long title | 328 by 144          | 328 by 143.8           |
| between two cards        | 8                   | 8                      |
| frame: padding, radius   | 12, 12              | 12, 12                 |
| frame, light             | #ffffff, #e0e0e0    | #ffffff, #e0e0e0       |
| frame, dark              | #222629, #33383d    | #222629, #33383d       |
| icon box                 | x13 y13, 36 by 36   | x13 y13, 36 by 36      |
| icon box: radius, icon   | 8, 20 by 20         | 8, 20 by 20            |
| title                    | x61 y13, 14/17, 600 | x61 y13, 14/16.8, 600  |
| section                  | y32, 12/16          | y31.8, 12/16.2         |
| tag                      | y54, height 16      | y54, height 16         |
| tag: gap, padding, icon  | 4, 2 and 4, 12      | 4, 2 and 4, 12         |
| reason                   | y76, 12/16          | y76, 12/16.2           |
| reason colour, light     | #c00111             | #c00111                |
| reason colour, dark      | #dc2626             | #dc2626                |
| «Open»                   | x13 y104, 89 by 32  | x13 y104.2, 88.4 by 32 |
| «Open in new tab»        | x110, 166 by 32     | x109.4, 165.3 by 32    |
| button: font, radius     | 13, 10              | 13, 10                 |

The table above was typed by hand and is kept as the first look. It is not the match.

**The match was redone on 20.11.2026, and the first line «308 из 308» was not one.** That line came
from one script that held the same typed array for both sides. It covered one width and left out
the keys that differed. The owner approved the showcase by it.

The second match reads the two sides apart. The mockup side is read from the Figma layers of the
eight cards at 328. The showcase side is read from the computed styles of the story `Themes`. A
card gives 65 or 69 declared values: sizes, paddings, gaps, radii, colours and type.
`node tools/kit-match.mjs numbers` printed 500 of 530 on the first run. The thirty misses were four
things:

- **The disabled «Open» button had no border in the showcase.** The card's style named a class the
  kit button does not carry. This was a defect of the code. It is fixed, and the chat stories now
  assert the border in `pending`.
- **The line heights were 17 and 16 in the mockup against the kit steps 1.2 and 1.35.** The mockup
  texts now take 120% and 135%, as the kit declares them.
- **The icon of a success or danger tag was drawn in the text colour in the mockup.** The kit draws
  it in the colour of the label. The sixteen tag instances of the mockup are fixed. The Figma `Tag`
  set still gives a swapped icon its own colour; that is a defect of the kit copy.
- **The turning spinner measured 16.78 wide by its rotated box.** That was a miss of the
  measurement. The icon is now measured by its layout width, 12.

The second run printed 530 of 530.

**What the match does not hold.** Sizes that come from the text differ by up to 0.7. Figma snaps a
text box to whole pixels and shapes the text its own way. The buttons are 89 and 166 wide in the
mockup against 88.35 and 165.33 in the showcase. The title is 17 high against 16.8. The cards are
127, 149 and 144 high against 126.99, 149.19 and 143.79. Only 328 was matched; at 386 and 640 the
card differs by its width alone.

**The contrast, measured the same day.** Light: the reason 6.45, the section 5.66, the tag
`opened` 3.58, the tag `failed` 4.41, the disabled button label 3.0. Dark: the tag `pending` 16.99,
the tag `opened` 3.52, the tag `failed` 2.94, the reason 3.16. The dark reason and the dark tag
`failed` stand under 4.5. Both take the colours the approved mockup draws and the kit tokens give:
`--rt-color-state-error-text` and the tag palette `danger`. The card adds no colour of its own; the
numbers go to the owner with the showing.

## Round one of the review

- **The icon name the model writes went to `rt-icon` unchecked.** A name outside the kit set asked
  the server for a drawing by that name. Now the card checks the name by `isKitIconName` and draws
  `link`. The agreement said «an empty icon box»; that rule is rewritten.
- **The announcement was tied to the place in the feed.** A block put above the card made the card
  announce a change nobody made. Now the key is the address: another address at the same place
  starts silent.
- **A changed reason of the same failure was not announced.** Now it is.
- **The component drew any reason it was given.** Now only in `failed`.
- **The schema took a title or an address of spaces alone.** Now it refuses them, as the card does.
- **The agreement said the spinner stands still under reduced motion.** The kit slows every turning
  icon there and does not stop it. The rule is rewritten to what the kit does.
- **The handler in the overview compared the raw address and skipped sections.** The event carries
  the trimmed address. The example and the story now read the address by `rtLinkData` and walk a
  section. The chat stories hold a third card inside a section.
- **The overview now says the application checks the address before it opens it.** The model
  writes the address, and the kit neither checks nor opens it. Two cards of one message with one
  address get one outcome.
- **The agreement named the dark contrast 3.2 : 1.** The measured numbers are 2.94 and 3.16.
- **Not taken.** The schema keeps accepting unknown fields, as the KPI and section schemas do. One
  story `States` shows the four outcomes at once, by the showcase contract.
- **The grill differs from the code in three places, each decided in the agreement.** No state
  draws no status. The labels live in one English set. The frame is the card's own, not `rt-card`.
- **For the owner.** The epic sign «on the published version» cannot be met before the release.
  The epic has no task of the dark status colours.

## Round two of the review

Fixed:

- **The story `Widths` failed in the snapshot container at 640.** The long title fitted two lines
  there, so the ellipsis check failed. The 640 feed now gets a longer title, and the check stays as
  it was.
- **The copy line kept the line breaks U+2028, U+2029, VT and FF.** They become a space now, with a
  test.
- **No spec asserted that the card draws its title and section.** One does now.
- **The overview example opened the model's address unchecked.** It checks the address against the
  routes of the application first, and the overview says the application strips `state` and
  `reason` from the model's block.
- **The agreement named a task of the dark status colours that does not exist.** It says now that
  no such task exists. The agreement also named the title as 14/17 against the kit's 120% and 135%.
  It names the kit steps now, and the mockup draws the same.
- **The snapshot references of the chat were not compared after the chat template changed.** The
  confirming run takes `ai-chat-matrix` too.

Written off, each with its reason:

- **The outcome is announced twice by a screen reader: by the tag text and by the hidden line.**
  Not confirmed with a real reader. The hidden line is the only text that names the card, and it
  is kept; a reader test belongs to the owner's own check.
- **A card moved by a block inserted above it loses its announcement, and one false announcement
  is possible with two cards of one address.** The feed keeps blocks by place, so the card cannot
  tell a move from a new block. CONTEXT.md now says so.
- **A zero-width title or address passes as non-empty.** A model that writes one gets a card with
  an invisible title; the cost is not worth a second trim rule.
- **The schema accepts `state` and `reason` from the model.** The overview tells the application to
  strip them; the KPI and section schemas leave extra fields open in the same way.
- **The match covers 328 only.** The widths 386 and 640 are held by the play steps: width, 36, 12, 8.

For the owner:

- The mockup 8339-452 was changed after its approval: the line heights 120% and 135%, the colour of
  the tag icon. The code was right.
- No task of the dark status colours exists.
- The plan of the task names row 7 of the epic plan; the task stands in row 8.

## Sessions

### 2026-11-19

- RT-3338 handed in by #3429; the next task of the epic plan is RT-3339.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/ai-chat-blocks
**Branch:** RT-3339-ai-chat-link-block

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Review rounds and closing
- **Next step:** stage 4, step 5 — the archive record and taking the task folder apart.
- **PR:** not open yet; the base is `RT-3346-ai-chat-blocks` — RT-3338 is merged into it (#3429)

The progress in full — `docs/tasks/RT-3339-ai-chat-link-block/progress.md`; the plan lies next to it.

### Uncommitted

```
M  docs/specs/ui-kit-v2/proposed/ai-chat-link/spec.md
M  docs/tasks/RT-3339-ai-chat-link-block/approvals.md
M  docs/tasks/RT-3339-ai-chat-link-block/progress.md
 M projects/ui-kit-v2/.storybook/__snapshots__/atoms-tag--size.png
M  projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/CONTEXT.md
M  projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/link/Overview.mdx
M  projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/link/rt-ai-chat-link.component.spec.ts
MM projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/link/stories/component/ai-chat-link.fixture.ts
M  projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.link.spec.ts
M  projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatlink--full-screen.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatlink--invalid.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatlink--long-labels.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatlink--panel.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatlink--parts.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatlink--presets.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatlink--rtl.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatlink--states.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatlink--themes.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-chat-aichatlink--widths.png
```

### Commits over the main branch

```
770cd83a2 fix(rt:ui-kit-v2): карточка ссылки после первого круга ревью (RT-3339)
bb120577e docs(rt:ui-kit-v2): одобрение витрины карточки ссылки (RT-3339)
71571d2fd docs(rt:ui-kit-v2): сверка витрины карточки ссылки с макетом (RT-3339)
32f03344d feat(rt:ui-kit-v2): истории и страница обзора карточки ссылки (RT-3339)
c0864d598 feat(rt:ui-kit-v2): карточка ссылки в ответе чата и событие нажатия (RT-3339)
212421024 feat(rt:ui-kit-v2): блок ссылки в модели чата и в логике ленты (RT-3339)
db78420f3 feat(rt:ui-kit-v2): данные и схема блока ссылки на страницу (RT-3339)
bc1088482 chore(rt:ui-kit-v2): ветка эпика влита в ветку задачи (RT-3339)
869349424 [RT-3342] Блок секции и сетка составного ответа (#3437)
bc0febefa chore(rt:ui-kit-v2): главная ветка влита повторно, номера сценариев разведены (RT-3342)
2bd4be248 chore(rt:ui-kit-v2): главная ветка влита в ветку задачи (RT-3342)
a174a2147 docs(rt:ui-kit-v2): макет секции сведён с витриной, совпадение 24 из 24 (RT-3342)
b4223578b docs(rt:ui-kit-v2): папка задачи RT-3342 разобрана в описание прошлого
cc39e821e docs(rt:ui-kit-v2): договорённость о блоке секции сведена в spec (RT-3342)
4c9f02544 fix(rt:ui-kit-v2): блок секции после второго круга ревью (RT-3342)
28a8b57e3 fix(rt:ui-kit-v2): блок секции после первого круга ревью (RT-3342)
02f1402e5 feat(rt:ui-kit-v2): витрина блока секции — обзор месяца на четырёх ширинах и в чате
409dca611 feat(rt:ui-kit-v2): секция в ленте ответа — заголовок и сетка в две колонки
53ced96f8 feat(rt:ui-kit-v2): данные блока секции, его копия и схема для модели
8754015a0 docs(rt:ui-kit-v2): план RT-3342 одобрен — данные, сетка, витрина, ревью
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
