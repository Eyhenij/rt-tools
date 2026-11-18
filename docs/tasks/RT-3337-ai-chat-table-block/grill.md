# Grill

## The owner request

> Делай эпик дальше

The task is #3337 of the epic RT-3346, the fifth row of the epic plan. Its body: a table in an
assistant answer arrives as markdown, and `rt-markdown-text` draws it with its own markup — numbers
aligned left, currencies and percents as raw text, a wide table breaks the feed width. The kit needs
a `table` block for `rt-ai-chat`:

- columns typed `text` / `number` / `percent` / `currency`, aligned by type;
- negative numbers with a minus sign and a colour from the tokens;
- a sticky head, horizontal scroll inside the block, the feed never widens;
- an optional total row;
- copying the table as CSV;
- the same look for markdown tables in `rt-markdown-text`.

Done when a 12-column table scrolls inside the block, numbers are aligned right and CSV copies; the
showcase has stories: narrow, wide, with a total, with negatives.

The owner's word on releases, 15.11.2026: «После 3337 + в конце» — the first kit release goes after
this task.

## What the tree already has

- Answer blocks: the model `rt-ai-chat.model.ts` has `markdown`, `notice` and an open custom block;
  the kit's own types are listed in `OWN_TYPES` of `rt-ai-chat-blocks.logic.ts`, other types come by
  the token `RT_AI_CHAT_BLOCK_RENDERERS` with a `toText` for the answer copy. `chart` is a custom
  block only because it needs d3; a table needs no d3.
- `rt-markdown-text` parses a markdown table into `head` and `rows` of inline nodes
  (`markdown-parse.ts:readTable`); the alignment markers `:--` and `--:` are validated, not read.
  Its markup is an own `<table>` in a scroll wrapper, full borders, left alignment; it has no domain
  spec, only `CONTEXT.md` and `Overview.mdx`.
- The chart data table of RT-3336 is plain markup with `native-ok`: a cell `{text, numeric}`, rows
  28, bottom borders, numbers right, scroll inside the block. Its spec names RT-3337 as the task that
  takes this markup. It has no sticky head, no total row, no colour for negatives.
- Number formats: only `rtAiChatChartFormat` in the chart entry (Intl: number, percent, currency).
  It cannot be imported into `rich-editor` without the d3 entry; shared pure helpers live in
  `@rt-tools/ui-kit-v2/core` next to the markdown utils.
- `rt-table` is CDK with declared columns, column settings in IndexedDB and narrow-screen cards;
  `rt-data-table` is entity-oriented. Neither takes a column set from data.
- Copy: CDK `Clipboard` with the labels `uiCopy` and `uiCopied`, the 2-second check of
  `rt-ai-chat-copy`. No CSV helper in the kit.
- A colour for negatives: no own token; `--rt-color-state-error-text` is the text colour of an
  error in both themes.
- The next free scenario id is SC-UKV-1396. The mockups of the epic live in the Figma file
  `vyV42sJXccfKNG8yFSCpSL`; the chart data table is node 8196-839.

## Questions closed by assumption

The owner took the recommended option in the last five menus of this session, so the six questions
close as decisions, and only the mockup goes to the owner.

- **Behaviour changes** — yes: a new block and a new look of markdown tables; a product agreement
  in `docs/specs/ui-kit-v2/proposed/ai-chat-table/`.
- **No law or rule edit.**
- **One task**, as the epic plan has it: the block and the markdown look share one table look, and
  apart they would diverge at once.
- **Not in the task:** sorting, filtering, pagination, column settings, narrow-screen cards, a total
  computed by the kit (the total row comes as data), editing.
- **Done signs** are the task's: a 12-column table scrolls inside the block, numbers right, CSV
  copies; stories narrow, wide, with a total, with negatives; plus a markdown table in the same
  look.
- **The sample** is the chart data table of RT-3336: the same markup, rows and alignment, with a
  sticky head, a total row and the negative colour added.
- **The block is a kit type, not a provider.** It needs no d3, so it stands next to `markdown` and
  `notice` in `rich-editor`; an application gets it without registering anything.
- **The cell format and the CSV are pure helpers in `core`**, so the block and the markdown share
  them; the chart keeps its own format function.
- **A markdown table reads `--:` as a right-aligned column** and takes the block's look; its cells
  stay inline nodes, no type detection by content.
- **Negatives take `--rt-color-state-error-text`**, the minus sign is the locale's.
- **«Copy CSV» is a text button under the table**, like «View data» under the chart; the answer copy
  gives the table as tab-separated lines, like a markdown table.
