# Plan

**Task:** RT-3339 · **Branch:** RT-3339-ai-chat-link-block
**Draft:** `docs/specs/ui-kit-v2/proposed/ai-chat-link/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** the assistant opens a page of the application by a tool call and writes about it in text;
  the reader does not see whether it opened and cannot open it again or in a new tab. The chat has
  no output a block can use.
- **This task reaches:** a developer of an application on the kit sees in the kit showcase that a
  `link` block of the answer draws a card of a page — icon, title, section, the status «Opening»,
  «Opened» or «Failed to open» with a reason — and that «Open» and «Open in new tab» make the chat
  emit `linkOpen` with the address. The person reading an answer gets it with the release at the
  end of the epic.
- **Sign:** the showcase stories of the `link` block in every state at 328, 386 and 640 and dark
  at 328, their play steps measuring the layout and catching the event; the table «mockup /
  showcase» in the progress with every number of the approved mockup 8339-452; the owner's word on
  the showcase in `approvals.md`; the specs of the block, the chat and the tag green.
- **Milestone G2 of the epic:** a published kit draws an answer with a card of a page, the sources,
  the interrupted mark and `Reply` without an application template; this task gives its card of a
  page. The owner set G2 on 19.11.2026: «Вторая веха G2».
- **Metric:** нет: new kit block, not a rule edit.

## Task footprint

| What  | Where                                                                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/proposed/ai-chat-link/`, `docs/specs/ui-kit-v2/ai-chat/`, `docs/specs/ui-kit-v2/tag/`                                    |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`, `docs/constitution/mockups.md`                               |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`                                    |
| Code  | `projects/ui-kit-v2/src/lib/util/`, `projects/ui-kit-v2/src/lib/components/tag/`, `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/`, `projects/ui-kit-v2/src/lib/i18n/`, `projects/ui-kit-v2/.storybook/` |
| Figma | the `Tag` component of the kit copy, file `vyV42sJXccfKNG8yFSCpSL`                                                                             |

## What counts as done

- An answer with a `link` block draws a card in each of the three states as the agreement says:
  the status tag, the reason only in `failed`, the buttons `aria-disabled` only in `pending`, no
  status without a state; a block without a title or an address is the plate.
- «Open» and «Open in new tab» make `rt-ai-chat` emit `linkOpen` synchronously with the message id,
  the address and `newTab`; the kit does not navigate; a change of the state keeps the focus and is
  announced through the feed with the card title.
- The answer copy gives the card as one tab-separated line; the kit exports the block schema
  without `state` and `reason`; the new labels are in the kit English set and the showcase Russian
  set.
- The tag `sm` draws 4 between all its parts and can turn its start icon; the tag references whose
  look changed are taken anew, and the Figma `Tag` `sm` variants take 4.
- A chat story shows the whole loop: a press sets `pending`, then `opened`, and on the second card
  `failed` with a reason; its play step presses and waits for the status to change.
- The contrast of the dark `failed` reason and tag is measured and written in the table «mockup /
  showcase»; the agreement names it below AA until the dark status colours task.
- The showcase holds every state of the agreement's table «Screens and states»; it matches the
  approved mockup by numbers and is approved by the owner.
- The agreement is merged into `docs/specs/ui-kit-v2/ai-chat-link/`, the chat and tag specs are
  edited as the agreement names, and the PR is open into `RT-3346-ai-chat-blocks`.

## Stages

### 1. The data of the block: the lenient function and the schema

- **Steps:**
    1. Write the lenient data function of a link block in `link-data.ts` next to `kpi-data.ts`: title and url required and trimmed, section, icon with `link` by default, state absent when unknown, reason only in `failed`.
    2. Write the JSON schema of the block in `link.schema.ts` next to `kpi.schema.ts` — `title`, `url`, `section`, `icon` — and export both from the util barrel.
    3. Write the specs of the data function and the schema with the scenario numbers of the agreement: SC-UKV-1488, 1489, 1497.
- **Readiness sign:** the link util specs run and pass.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/util/link --output-style=static --skip-nx-cache` — the line «Tests:» with every test passed and none failed.

### 2. The card and the event through the chat

- **Steps:**
    1. Add the `LinkBlock` type, the `link` view, the `LinkOpen` event type, `link` in `OWN_TYPES`, the data step in `toBlockViews` and the copy line in `blockText`.
    2. Write the `rt-ai-chat-link` component on `rt-tag`, `rtButton` and `rt-icon`: the row with the numbers of the agreement, the text column, the status, the reason, the two buttons with `aria-disabled` in `pending`, the announcement text of a state change for the feed, tokens only.
    3. Carry the press from the card through `rt-ai-chat-blocks` and the answer to a synchronous `linkOpen` output of `rt-ai-chat` that adds the message id.
    4. Add the labels «Opening», «Opened», «Failed to open», «Open», «Open in new tab» to the kit English set and the showcase Russian set.
    5. Set the gap of the tag `sm` to `--rt-space-1` and add the option that turns the start icon of the tag.
    6. Write the specs of the card, the logic, the copy, the chat output and the tag option: SC-UKV-1487, 1490–1496, 1499, 1501, 1502, 1506.
- **Readiness sign:** the ai-chat and tag specs run and pass.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/rich-editor/lib/components/ai-chat --output-style=static --skip-nx-cache` — the line «Tests:» with every test passed and none failed; `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/tag --output-style=static --skip-nx-cache` — the same, 35 tests today.

### 3. The showcase and the match with the mockup

- **Steps:**
    1. Write the stories of the block by the agreement's table «Screens and states»: pending, opened, failed, failed without a reason, no state, long title, no section, long button labels, 328, 386, 640, dark at 328, right to left, invalid.
    2. Write a chat story of the whole loop in the narrow panel and in the full-screen mode: a press logs `linkOpen` with `{ messageId, url, newTab }`, sets `pending`, then `opened`, and on the second card `failed` with a reason; put the handler code into the block `Overview.mdx`.
    3. Write the play steps that measure by `getBoundingClientRect` the icon box, the row gaps, the button row on one top, the wrapped buttons, the two-line title, the mirrored order and no text past the card, and that press a button and wait for the status to change: SC-UKV-1498, 1503, 1504.
    4. Write the `Overview.mdx` of the block and name the block and `linkOpen` in the chat Overview.
    5. Set the gap 4 in the `sm` variants of the Figma `Tag` and lift the instance overrides of the mockup 8339-452.
    6. Look at every story live, take the references of the block and anew those of the tag whose gap changed, sweep all the stories.
    7. Match the stories with the approved mockup by numbers into the table «mockup / showcase» in the progress, with the contrast of the dark reason and tag, show the showcase to the owner and write their word into `approvals.md`; SC-UKV-1500 and 1505 are held by this match.
- **Readiness sign:** the play steps pass; the snapshots match their references; the sweep finds no
  empty showing; the table counts every number of the mockup; the owner's word stands in
  `approvals.md`.
- **Verified by:** `pnpm run test:visual:v2` — every link and tag frame matched, none failed; `pnpm run test:stories:v2` — «There are no empty showings and no drawing errors».

### 4. Review rounds and closing

- **Steps:**
    1. Review round one by qa-engineer, product-strategist and goal-critic; fix the confirmed findings in one commit.
    2. Review round two by fresh readers; fix the confirmed findings in one commit.
    3. Merge the agreement into `docs/specs/ui-kit-v2/ai-chat-link/` with its bindings; edit the chat and tag specs and the kit spec indexes as the agreement names.
    4. Bring `CONTEXT.md` of ai-chat and the tag up to the block, the output and the gap.
    5. Mark row 7 of the epic plan, write the archive record, take the task folder apart.
    6. Run the push set, push, open the PR into `RT-3346-ai-chat-blocks`.
- **Readiness sign:** the spec audit has no refusal; the push set is green; the PR is open.
- **Verified by:** `node tools/check-specs.mjs` — exit 0 with no line about `ai-chat-link` or `tag`.

## What this work does not do

- Navigation and a tool of the protocol that opens a page: the application does both.
- A preview of the page, a breadcrumb drawn as links, a copy-the-address button.
- The section and the grid of a composed answer — RT-3342; the sources block — RT-3340.
- Translations of the new labels beyond the kit English set and the showcase Russian set.
