# Plan

**Task:** RT-3340 · **Branch:** RT-3340-ai-chat-sources-block
**Draft:** `docs/specs/ui-kit-v2/proposed/ai-chat-sources/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** the assistant writes numbers into an answer, and the reader does not see where they came
  from. The chat has a card of a page (`link`) but no list of the sources of an answer.
- **This task reaches:** a developer of an application on the kit sees in the showcase that a
  `sources` block draws a collapsed list «Sources» with the count, opens and closes it from the
  keyboard, and that a press on a source with an address makes the chat emit `sourceOpen` with the
  message id, the address and the title. The reader gets it with the release at the end of the epic.
- **Sign:** the showcase stories with one and with five sources, their play steps pressing the
  header with Enter and Space and catching the event; the table «mockup / showcase» in the progress
  with every number of the approved mockup; the owner's word on the showcase in `approvals.md`; the
  specs of the block and the chat green.
- **Milestone G2 of the epic:** a published kit draws an answer with the sources of its numbers
  without an application template; this task gives its list of sources.
- **Metric:** нет: new kit block, not a rule edit.

## Task footprint

| What  | Where                                                                                                                                          |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/proposed/ai-chat-sources/`, `docs/specs/ui-kit-v2/ai-chat/`, `docs/specs/ui-kit-v2/ai-chat-link/`                       |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`, `docs/constitution/mockups.md`                                |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`                                     |
| Code  | `projects/ui-kit-v2/src/lib/util/`, `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/`, `projects/ui-kit-v2/src/lib/i18n/`         |
| Figma | the second kit file `vyV42sJXccfKNG8yFSCpSL`, a frame of the sources block                                                                     |

## What counts as done

- An answer with a `sources` block draws a header «Sources» with the count of sources left after the
  dropping, collapsed at the first draw, opened and closed by a press, Enter and Space; a block
  without a usable source is the plate.
- A press on a source with an address makes `rt-ai-chat` emit `sourceOpen` synchronously with the
  message id, the address and the title; a source without an address is plain text.
- The answer copy gives a header line and a line per source; the kit exports the block schema, and
  the section schema holds it as its own.
- The label is in the kit English set and the showcase Russian set.
- The showcase holds every state of the agreement's table «Screens and states»; it matches the
  approved mockup by numbers and is approved by the owner.
- The agreement is merged into `docs/specs/ui-kit-v2/ai-chat-sources/`, the chat spec is edited as
  the agreement names, and the PR is open into `RT-3339-ai-chat-link-block` while that PR stands.

## Stages

### 1. The data of the block: the lenient function and the schema

- **Steps:**
    1. Write the lenient data function of a sources block in `sources-data.ts` next to `link-data.ts`: `items` as a list, a source with a trimmed title, a detail, an icon with `file` by default and an address, a source without a title dropped.
    2. Write the JSON schema of the block in `sources.schema.ts`, export both from the util barrel and add the schema to `OWN_SCHEMAS` of the section schema.
    3. Write the specs of the data function and the schema with the scenario numbers of the agreement: SC-UKV-1548, 1549, 1550, 1551, 1553.
- **Readiness sign:** the sources util specs and the section schema specs run and pass.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/util/sources --output-style=static --skip-nx-cache` — the line «Tests:» with every test passed and none failed.

### 2. The mockup and the owner's word

- **Steps:**
    1. Read the kit copy in the second file for the components the block takes: the expansion panel header, the icon, the text styles.
    2. Draw the frame of the sources block from kit instances: one and five sources, collapsed and expanded, a pressable and a plain source, a long title, at 328, 386 and 640, and dark at 328.
    3. Measure the frames by node coordinates and show them to the owner.
    4. Write the owner's word into `approvals.md` and add the rules of the drawn values to the agreement.
- **Readiness sign:** the owner has approved the mockup in words, and the agreement holds the rules of its numbers.
- **Verified by:** `node tools/check-kit-approval.mjs` — the exit code 0 with the mockup approval recorded.

### 3. The block, the event and the labels

- **Steps:**
    1. Add the `SourcesBlock` type, the `sources` view, the `SourceOpen` event type, `sources` in `OWN_TYPES`, the data step in `toBlockViews` and the copy lines in `leafText`.
    2. Write the `rt-ai-chat-sources` component on `rt-expansion-panel` and `rt-icon`: the header with the label and the count, the rows, the pressable rows as buttons, the numbers of the approved mockup.
    3. Carry the press through `rt-ai-chat-blocks` and the answer to a synchronous `sourceOpen` output of `rt-ai-chat` that adds the message id.
    4. Add the label «Sources» to the kit English set and the showcase Russian set.
    5. Write the specs of the component, the logic, the copy and the chat output: SC-UKV-1541, 1542, 1543, 1544, 1545, 1546, 1547, 1552, 1554, 1555, 1556, 1557.
- **Readiness sign:** the specs of the block, the chat and the labels run and pass, and the kit typechecks.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/rich-editor/lib/components/ai-chat --output-style=static --skip-nx-cache` — the line «Tests:» with every test passed and none failed.

### 4. The showcase, the match and the owner's word

- **Steps:**
    1. Write the stories of the block with one and with five sources, the states, the long texts, the right-to-left and the dark theme, with play steps that press and measure.
    2. Write the overview page of the block with the handler code of an application and the chat overview lines for `sourceOpen`.
    3. Run the stories in the showcase and measure them against the mockup by two independent readings; write the table in the progress.
    4. Show the showcase to the owner and write their word into `approvals.md`.
- **Readiness sign:** every story passes its play steps, the match is complete, and the owner has approved the showcase.
- **Verified by:** `node tools/kit-match.mjs numbers figma.json showcase.json` — every number of the mockup equal.

### 5. The review rounds and the closing

- **Steps:**
    1. Run the first review round with three roles, check every finding against the code and fix the confirmed ones as one commit.
    2. Run the second round and fix the same way.
    3. Merge the agreement into `docs/specs/ui-kit-v2/ai-chat-sources/` with its bindings and edit the chat spec and the indexes.
    4. Bring `CONTEXT.md` of the chat up to the block and the output.
    5. Mark the row of the epic plan, write the archive record and take the task folder apart.
    6. Run the push set, push and open the PR.
- **Readiness sign:** the push set is green and the PR is open with its reviewer.
- **Verified by:** `node tools/check-specs.mjs` — the exit code 0 after the merge of the agreement.
