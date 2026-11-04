# Grill

## The owner request

> паралельно не нужно, потом бери RT-3086

Said when RT-3086 was offered as the parallel task while the checks of RT-3087 ran; RT-3087 is
handed in, and this is the next. The task body: the scenario check knows a scenario only by a prefix
of two to six capitals; a tree that installs the package writes prefixes of six to ten letters, and
the check recognised none of its 403 scenario headings. 203 more scenarios there are written as
table rows, which no width reads.

## What is already in the tree

- `projects/agent-kit/assets/checks/spec-common.mjs`: `SCENARIO_HEADING` and `SCENARIO_REFERENCE`
  hardwire `{2,6}`; settings come from `rt-kit-checks.config.mjs` with the tree's
  `.claude/rt-kit/checks.json` over the defaults.
- `spec-scenarios.mjs:unparsedHeadings` names a line begun as a scenario heading the template did
  not take; `check-specs.mjs` reports it. A table row is read by nothing.
- The spec of the checks is `docs/specs/agent-kit/checks/`: 486 scenario lines, room for one
  scenario.
- This tree's own `tools/spec-next-id.mjs` reads `{2,4}`: a tool of this tree, not of the package.

## Questions and answers

Closed by assumption, as the four tasks before it:

- **Does the task change the behaviour** — yes, of a package check; no application code.
- **Does it need an edit of a law or a rule** — no: one spec rule.
- **One task or several** — one.
- **What is not part of the task** — this tree's `spec-next-id.mjs`; reading table rows as
  scenarios.
- **What shows the task is closed** — a scenario: a heading with an eight-letter prefix is parsed,
  a width narrowed by the settings refuses it again, a table row beginning with a scenario number is
  named as a discrepancy; the specs suite is green.
- **The sample** — the unparsed-heading discrepancy next to it.

## Decisions

- **A table row is named, not read.** The task allows either; reading a row gives no promise line
  and no coverage marks, so a parsed row would be a scenario with nothing to check.
- **The width is a pair of numbers, `scenarioPrefixWidth: [2, 10]`.** The heading and the reference
  are built from one pair.
