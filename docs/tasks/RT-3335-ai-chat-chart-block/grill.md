# Grill

## The owner request

> Делай эпик дальше

The task itself is #3335 of the epic RT-3346, written before RT-2750 chose d3 modules and its own
SVG over echarts. Its body asks for a `chart` block of `rt-ai-chat` on top of `rt-chart` that takes
a chart spec from a tool call: ten kinds, the fields of the spec, the limits, parsing from a JSON
string, a notice on an invalid spec, a placeholder while the arguments stream, a palette from the
kit tokens, a legend clear of the axis, fullscreen and PNG by the title, the JSON schema exported
from the kit, and copying the chart as text.

The owner's words on the drawing tool, from RT-2750: «нам нужна лёгкость и гибкость» and
«Модули d3 + свой SVG (Recommended)».

## What the tree already has

First findings, read by hand; the full exploration adds to them.

- The answer blocks of RT-3334 live in the rich editor entry of the kit:
  `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.logic.ts`
  holds `blocksToPlainText`, and the answer component reads the blocks. The chart block is
  registered there.
- The chat protocol package `projects/ai-chat-protocol` already has a browser tool registry
  (`ai-chat-tool-registry.ts`): a tool is a definition plus `execute`, arguments come as a JSON
  string. A chart tool definition with its JSON schema has a natural home next to it.
- The kit has a `dialog` component — a candidate for "open fullscreen".
- The last chart scenario of the kit spec is SC-UKV-1340; the block takes the next range.

From the full exploration:

- `rt-ai-chat` lives in the `rich-editor` entry. A block of a new type comes by
  `provideRtAiChatBlock(type, component, toText)`; the component gets one required input `block`,
  and the copy of the answer takes the text of `toText`. The spec of the blocks already uses a fake
  `chart` block in its test.
- `streaming` belongs to the whole message, not to a block: a renderer does not know that the
  arguments of its call are still coming.
- `rt-chart` takes five data shapes (cartesian, scatter, pie, heatmap, tree), `height` and `label`,
  and gives `toPng()` as a data URL. It has no title, no axis names, no file download. Grouped bars
  below zero are drawn from zero; a stack of negative values is not handled. Formats are functions,
  so number, percent and currency are built by the block with `Intl.NumberFormat`.
- The ten kinds of the task map onto it: line and bar series, grouped bars side by side, a stack by
  a shared `stack`, a histogram by `place: 'bins'`, the rest by their own shapes; `hierarchy` with
  `path` becomes nested nodes.
- The protocol package has `IAiChatToolDefinition.parameters` for a JSON schema and no chart types;
  the kit does not depend on it. The tree has no JSON schema library; validation is written by hand
  with `typeof` guards.
- Fullscreen: `RtDialogService` of the `dialog` entry with a width override; the photo viewer
  already opens full screen this way.
- The scenario index `docs/specs/ui-kit-v2/scenarios.md` lacks the chart range and the latest
  ai-chat ranges.

## What the rules already say

- The ai-chat spec: heavy blocks are drawn by registered renderers, and the `rich-editor` entry
  never imports a chart; all renderers are registered at one level.
- The chart spec: the main entry of the kit never imports d3; the chart block of the chat is left
  to the ai-chat subdomain.
- The protocol stays in the application: the kit gets messages, not a stream of events.
- The rule `kit-approval`: a visible kit edit needs a Figma mockup approved by the owner, then a
  showcase that matches it.

## Questions and answers

The owner took the recommended option in every menu of RT-2750 («Модули d3 + свой SVG
(Recommended)», «Отдельный вход chart (Recommended)», «Семь видов сразу (Recommended)»). The six
questions are therefore closed by assumption; each line names what is taken and where from.

- **Does the task change behaviour** — yes: a new block in the answer. An agreement is written into
  the ai-chat subdomain spec.
- **Does it need an edit of a law or a rule** — no: the block follows the existing renderer rules.
- **One task or several** — one. The data table under `View data` is RT-3336, the table block is
  RT-3337.
- **What is not part of the task** — calling the model, the server tool and the data table; a
  stack of negative values; a new drawing in `rt-chart` beyond a title row.
- **What closes the task** — the block draws all ten kinds from a spec in the showcase, negative
  `grouped_bar` bars go below zero, an invalid spec shows the notice, a pending spec shows the
  placeholder, the copy gives the title and the rows, the PNG downloads, the schema is exported.
- **Is there a sample** — the fake `chart` block in the blocks spec and the photo viewer for the
  fullscreen dialog.

## Decisions

- **The body of #3335 is rewritten away from echarts before the plan.** RT-2750 draws the chart
  with its own SVG, and the lines about echarts options and `light-dark()` describe a tool the kit
  does not use. Rejected: keeping the body — the plan would carry steps for a library that is gone.
- **The block lives in a new entry `ai-chat-chart` of the kit.** It needs both `rich-editor` (the
  block token) and `chart` (d3). In `rich-editor` it would make d3 a dependency of every editor
  consumer; in `chart` it would make the editor and Quill a dependency of every chart consumer.
  Rejected: either existing entry, for those reasons.
- **The spec types, the JSON schema and the validator live in the same entry, without a library.**
  The task asks for the schema exported from the kit, the tree has no schema library, and a
  hand-written guard matches the blocks code. Rejected: the protocol package — the kit does not
  depend on it, and its spec keeps it free of chart knowledge.
- **The block says itself that its arguments are still coming.** A `pending` field on the chart
  block shows the placeholder; `streaming` of the message cannot reach a renderer. Rejected:
  guessing by an unparsable string — an invalid spec and an unfinished one look the same.
- **The palette is the eight series tokens of RT-2750.** `rt-chart` reads them itself in both
  themes; the lines of the task about ready `rgb` values and `light-dark()` were for echarts.
- **A visible edit needs the owner's approval of a mockup and of the showcase.** By the rule
  `kit-approval`; the parent session carries both questions to the owner.

## What is left unclear

- The owner has not seen the decisions above; they go to the owner with the plan, through the
  parent session.
