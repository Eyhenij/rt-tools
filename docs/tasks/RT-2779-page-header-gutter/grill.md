# Grill

## The owner request

> меняй стили пакета в rt-worktree-2

It is the answer to a choice. An application put `rt-page-header` into the header zone of
`rt-container` and asked why the header looks different from the showcase. The answer was that the
showcase spaces the header with a layout layer of its own, which is not in the package. Three ways
out were offered: move that layer into the package, give the margin in the application, or leave it.
The owner took the first one.

## What the tree already has

- `projects/ui-kit-v2/src/showcase/templates/styles/_shell.scss` gives the header its margin:
  `app-bookings-template .rt-page-header { margin: var(--rt-space-5) var(--rt-space-5) 0; }`. The
  rule hangs on the showcase wrapper's tag, so an application built on the kit gets none of it.
- `rt-page-header` has no margin of its own, by design. Its `CONTEXT.md` says the one who places the
  header sets its distance from the page edges.
- `rt-container` places the header: the header zone renders whatever the application projects into
  it. The zone has no padding today.
- Only the showcase template puts `rt-page-header` straight into the header zone. The
  message-bus admin wraps it in a header component of its own, and the container stories put a plain
  band there.
- The `templates-list-page--*` snapshots show the header with the margin. The container's own
  snapshots show a band with no margin.

## What the rules already say

- The application-uniformity law: only the owner decides to depart from the shared look. Here the
  owner moves part of the shared look into the package.
- The kit styling rule: styling is taken as a token. The margin stays `--rt-space-5`.

## Questions and answers

**Как вернуть вид как в ките?**
Перенести слой в кит (Recommended)

**Где менять?**
меняй стили пакета в rt-worktree-2

## Decisions

- **The container gives the margin to a page header projected straight into its header zone** — the
  container is the one that places the header, as the header's own description demands. Rejected:
  padding on the whole header zone — a full-width bar such as `rt-header` would get it too. Rejected:
  a margin on `rt-page-header` itself — a header standing inside an application's own bar would
  get it.
- **The showcase drops its own rule** — the package now gives the same margin, and two sources of one
  value drift apart. The showcase keeps only its column rule.
- **Behaviour changes, a spec line is written** — the container's look changes for applications that
  project the page header. Closed by assumption.
- **No law or rule edit** — closed by assumption.
- **One task** — closed by assumption.
- **Done when** — the container with `rt-page-header` in the header zone shows the header 20px from
  the top, left and right edges. The `templates-list-page--*` snapshots stay the same. The styles
  linter and the container tests are green.
- **Sample** — the showcase rule itself.

## What is left unclear

- The profile menu of the showcase is a component of the showcase, not a style. Moving it into the
  package is a component of its own with labels in eight languages. It is a separate task, offered to
  the owner after this one.
