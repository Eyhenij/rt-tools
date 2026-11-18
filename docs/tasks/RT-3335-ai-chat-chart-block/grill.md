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

## What the rules already say

<Filled in from the exploration.>

## Questions and answers

<Filled in after the exploration.>

## Decisions

- **The body of #3335 is rewritten away from echarts before the plan.** RT-2750 draws the chart
  with its own SVG, and the lines about echarts options and `light-dark()` describe a tool the kit
  does not use. Rejected: keeping the body — the plan would carry steps for a library that is gone.

## What is left unclear

- <after the exploration>
