---
name: component-structure
kind: rule
law: frontend-application
description: Rule under the frontend-application law. Load when editing any *.component.ts and its template. Names the order of decorator properties, import grouping, template conventions and the mandatory qa-dataid. Ready-made code is in pattern component-structure-new.
---
<!-- rt-kit v0.37.0 · rules/component-structure.md · 02673ac83651 · правится надстройкой, не здесь -->

# Component file — how it works here

Rule under the law `docs/constitution/frontend-application.md`. Cold part: `pitfalls.md` — the whole
text, every section and article with its reasons.

## How the law applies here

- **The template calls no methods.**
- **Every interactive element carries `qa-dataid`.**
- **A component is allowed only an element selector.**
- **The block class hangs on the host, not on a wrapper inside the template.**

## Pitfalls

- **`href="#id"` in markup does not work.**
- **The same component in both branches of an `@if` is a conditional binding.**
- **A kit component that draws in an overlay is not addressed from the caller's host:** its markup lies
  outside the host, and `[qa-dataid="x"] button` does not reach the buttons.
- **`qa-dataid` does not replace `aria-label` and roles:** accessibility separately, the anchor
  separately.
- **Markup is edited by the edit tool, not by a script.**
- **A kit icon name is copied from its file, and an unknown name draws an empty frame.**
- **A component that grew past the file limit is split, not squeezed.**

## Names and techniques

- A computed view is `computed()` in the class, or a pure pipe for template context.
- `qa-dataid` is kebab-case by the element's meaning and stays when the layout changes.
- A directive takes an attribute selector; a technique on a foreign tag is a directive.
- Scroll to a fragment by `[routerLink]="[]" fragment="…"`, not `href="#id"`.
- Merge the two `@if` branches into one component with conditional inputs.
- Buttons of an overlay kit component carry their own anchors in the kit template.
- Own `role=alert`/`dialog`/`tablist`/`tooltip` or `<table>` bypasses the kit; use it.
- Decorator order, import grouping, self-closing tags follow the neighbouring file.

## This tree

- **Text that arrived from outside is drawn as nodes a pure parser built, never as a glued string.** Its markup list is closed inside; its one input is the text. Unknown markup stays visible text; a link leads out only by a known scheme. One component draws it for every section.
