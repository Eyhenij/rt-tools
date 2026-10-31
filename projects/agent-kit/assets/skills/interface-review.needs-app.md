---
name: interface-review
description: Reviews an interface as one system: accessibility, layout, writing, typography and polish, in that order, into one ranked findings table and one verdict. Load when asked to review or audit a screen, a flow, a component or a Figma frame. The domain rules are in interface-review-principles.
---

# Review the interface as one system

A strong interface is not five independent audits stapled together. Position and spacing carry
hierarchy before a word is read, the words themselves do the explaining, type makes them legible,
and polish is what makes the result feel deliberate rather than assembled. Review the whole
experience, then consolidate into one prioritized verdict.

## When to use

- A screen, a flow, a feature or a whole repository is to be reviewed from the side of the person
  who uses it.
- A Figma frame is to be reviewed and annotated with the findings.
- Findings of an interface review are to be implemented — then the consolidated report is the
  change scope.

The principles each finding is judged by are in `interface-review-principles`. The cards on a Figma
frame are in `interface-review-annotate`; it is laid out only in a tree with mockups. Recipes:
surfaces — `interface-review-surfaces`, entrances and exits — `interface-review-motion`, icon swaps,
press feedback and page load — `interface-review-motion-states`, icons — `interface-review-icons`,
transitions and compositing — `interface-review-performance`.

## How to look

When reviewing, slow the interface down. Walk it as a keyboard-only user first — every flow must
complete without a mouse. Read the page instead of scanning the code: squint to check the hierarchy
holds, read one full paragraph for comfort, resize the viewport to catch bad wrapping and truncation
at real content lengths. Replay motion at 10% speed in the browser's Animations panel and walk every
state: hover, focus, active, loading, empty. What feels off at 10% speed is what's subtly wrong at
full speed.

**Match the project's styling system.** Before writing any fix, check how the codebase styles
things and express every change in that system: Tailwind utilities in a Tailwind project, plain
declarations in CSS, CSS Modules, styled-components or StyleX. Preserve the project's component
library, tokens, and density, and its established motion language except where a principle in
`interface-review-principles` prescribes an exact interaction pattern. Never introduce a second styling approach just to apply a
fix.

Treat numeric values as starting points for interfaces without an established density or spacing
system. Preserve deliberate platform chrome, compact professional tools, and project tokens when
they remain usable under hit-area, zoom, localization, and viewport stress tests.

Color notation, palette construction, and gamut are out of scope; this skill measures and reports
contrast but does not repaint the project.

## How to run a review

### Resolve scope and mode first

Infer the screen, flow, feature, or repository scope from the request and current workspace. State
the resolved scope in the output. Use `full` when no mode is supplied.

| Mode | Coverage | Finding cap |
| --- | --- | --- |
| `quick` | Primary user path and highest-traffic states; report only `HIGH` and `MEDIUM` issues | 5 |
| `full` | Entire requested scope across all five domains, including empty, loading, error, and narrow-width states when present | 15 |

If the requested scope is too large to inspect credibly, narrow it to the highest-traffic complete
flow and state the boundary. Never imply uninspected surfaces were reviewed.

### Recon before judgment

Identify the framework, styling system, component library, design tokens, supported viewports, and
available preview or test commands. For copy, inspect nearby interface text, the product's
terminology, localization conventions, and any voice or content style guide before proposing a
change.

### Review in this order

Foundational failures must not be hidden by polish:

1. Accessibility
2. Layout
3. Writing
4. Typography
5. UI polish

When two domains appear to cover the same issue, assign it to the one that owns the underlying rule
and mention secondary effects in the **Why** cell. Report it once.

### Require evidence

Every finding cites `path/to/file:line` and shows the current implementation. If the review
artifact has no source files, cite the exact screen and component. Do not report a code-level
finding from visual appearance alone, or a visual finding from source code alone when runtime
behavior determines the result.

### Review without mutating by default

Treat a review request as read-only. Do not edit source code unless the user also asks to implement
the findings. When implementation is requested, preserve the consolidated report as the change
scope and re-run the relevant verification afterward.

## Review output format

Always use the following sections.

### Scope and Coverage

State the mode, exact scope, stack and styling conventions, and any review boundary. Then show
coverage:

| Domain | Evidence inspected | Result |
| --- | --- | --- |
| Accessibility | Files, components, states, or checks | Findings count or `Clear` |

Include all five domains. `Clear` means inspected with no actionable finding; `Not reviewed` must
explain why.

### Findings

Use one table ordered by severity, then reach and payoff:

| # | Severity | Domain | Location | Before | After | Why |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | HIGH | Accessibility | `src/Dialog.tsx:42` | `<button><XIcon /></button>` | Add `aria-label="Close"` and hide the icon from the accessibility tree | The icon-only control has no accessible name |

Severity is one shared scale:

- `HIGH`: blocks a task, misleads the user, hides content or controls, causes data-loss risk, or
  creates a repeated systemic failure.
- `MEDIUM`: meaningfully harms comprehension, efficiency, adaptability, or consistency.
- `LOW`: isolated polish with limited task impact. Include only in `full` mode.

Within a severity, rank by reach and payoff. A token or shared-component fix outranks the same
symptom in one leaf component.

Each row is one root cause: list every confirmed location in the same row rather than producing a
row per occurrence. Respect the mode's finding cap, and never pad the report to reach it. If there
are no findings, omit the table and state "No actionable interface findings."

### Annotate the frame

Every row in the findings table also lands on the canvas as a card, by `interface-review-annotate`.
If the file is view-only or the user asked for the report only, output the table alone and say the
frame was not annotated.

### Considered but Rejected

Record candidates considered but deliberately rejected. A candidate is rejected when the principle in
`interface-review-principles` permits the current implementation, evidence is insufficient, the project convention is
intentional, or the proposed change would add complexity without user benefit.

Include 1–3 candidates in `quick` mode and 2–5 in `full` mode:

| Location | Candidate | Rejected because |
| --- | --- | --- |
| `src/Card.tsx:28` | Increase the shadow | Existing depth matches the shared surface token; changing one card would reduce consistency |

These are real candidates inspected during the review, not invented filler. If the scope genuinely
contains fewer borderline candidates, include the ones that exist and say so.

### Verification

Run safe, relevant checks available in the project. Inspect the rendered interface when runtime
behavior or visual judgment matters. List each check or interaction, the exact command or steps,
and the observed result. Separate checks that passed from checks marked **Not verified**; never
convert a verification gap into a finding.

### Verdict

End with exactly one:

- `Block` — one or more `HIGH` findings remain.
- `Needs changes` — only `MEDIUM` or `LOW` findings remain.
- `Approve` — no actionable findings remain and the claimed coverage was verified.

## Common mistakes

| Mistake | Fix |
| --- | --- |
| `outline: none` to remove the focus ring | Style `:focus-visible` instead; mouse clicks won't show it |
| `<div onClick>` for a button or link | `<button>` for actions, `<a href>` for navigation |
| Placeholder used as the only label | Add a visible `<label for>`; placeholders disappear on input |
| Positive `tabindex` to fix focus order | Fix the DOM order; only use `0` and `-1` |
| `aria-hidden="true"` on a focusable element | Remove it or make the element non-focusable |
| Submit disabled until the form is valid | Keep it enabled; validate on submit and focus the first error |
| Separator line where spacing would do | Remove the line, double the gap between groups |
| `margin-left` / `padding-right` in a localizable layout | `margin-inline-start` / `padding-inline-end` |
| Breakpoints at 768/1024 because they're the defaults | Break where the content actually stops fitting |
| Fixed-width text container sized to one language | `max-width` + wrapping; test pseudo-localization and representative locales |
| `OK` / `Yes` confirming a destructive dialog | Repeat the consequence: "Delete project" |
| "Click here" or bare "Learn more" link | Describe the destination: "Read the billing docs" |
| "Oops! Something went wrong." | Say what to do, next to the failing field |
| "Save Changes" beside "Discard changes" | One capitalization policy per element type |
| Hard-coded one-off font sizes | Use the type scale |
| `line-height: 24px` on scalable text | Unitless value (`1.5`) |
| Full-width paragraphs | Cap around 60–75 characters per line |
| Numbers cause layout shift | `tabular-nums` |
| Truncated text with no way to read it | Tooltip or expanded view for the full value |
| Inputs below `16px` zoom on iOS | `text-base sm:text-sm` |
| Six disconnected domain reports | Consolidate into one ranked findings table |
| Visual claim inferred only from source | Inspect the rendered state or mark it not verified |
| Review silently edits code | Stay read-only unless implementation was requested |
| "Approve" with pending actionable findings | Use `Needs changes` or `Block` |
