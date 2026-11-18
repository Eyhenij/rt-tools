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

<Filled in from the exploration.>

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
