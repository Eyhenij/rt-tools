# The slots of the workspace and the panels that are not declared

**Status:** in force · **Revision:** 2026-09-15 · **Scenario prefix:** `SC-UKV`
**Depends on:** the three slot directives of the workspace and the handles that resize its panels
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

## Why

The workspace is a layout of three panels, and the consumer fills them by declaring a template for
each. Two of the three are optional: a screen with one pane declares the centre alone, a screen with
a list and a reading pane declares two.

A panel whose template the consumer did not declare has nothing to draw. Drawn anyway, it takes its
share of the width away from the panel that does have content, and puts between them a separator the
reader can drag. Nobody asked for either.

The subdomain says what an undeclared slot means and what the workspace does with the panel and the
handle that belong to it.

## Terminology

- **Slot** — one of the three places of the workspace: the list, the centre, the details. The
  consumer declares a slot by putting a template directive inside the workspace.
- **Declared slot** — the workspace found the directive of that slot among its content.
- **Handle** — the vertical separator between two panels; dragging it changes their widths.
- **Closed details** — a declared details panel in a state where it is not shown. It is not the same
  as an undeclared one, and the two are decided apart.

### What it is called in the interface

The person behind the screen sees neither slots nor directives. They see columns: a list on the
left, the content in the middle, the details on the right — and the strips between them they can
drag.

## Rules

- **A slot whose template is not declared draws no panel.** The panel has nothing to put in it, and
  drawn empty it takes width from the panel that has content: a workspace declaring the centre alone
  measured 212 points of centre out of 910, and 682 went to two empty panels and two separators.

- **The handle of an undeclared panel is not drawn either.** A separator resizes two panels, and
  with one of them gone there is nothing to resize. Left in place, it stays in the accessibility
  tree as a separator the reader is offered to drag, and dragging it changes nothing visible.

- **A declared but closed details panel stays drawn.** Closing is a state of a panel that exists;
  being undeclared is the absence of one. Folding the two together would take the panel away from
  the screen that merely collapsed it, and the way back would be gone.

- **The centre is not asked about its slot.** A workspace without a centre is not a layout of the
  remaining panels but an empty component, and the consumer learns of the miss by an empty frame
  rather than by a shifted one. The centre is drawn whatever is declared.

## What is out of scope

- The widths themselves and their storage key: an undeclared panel takes no width at all, and the
  bounds of the declared ones are untouched.
- The narrow-screen strip with the "back" and "details" buttons: a media query switches it on, not
  the declaring of a slot.
- The showcase of the family: how the slot cases are shown is the rule of the showcase, not this
  agreement.

## Contract

None: the workspace is a layout component and serves no procedure. The slots are declared by the
three content directives, and the workspace reads them as content children.

### Refusal codes

Not applicable: an undeclared slot is a lawful state of the layout, and the workspace refuses
nothing.

## Data

None of its own. The content of every panel belongs to the consumer, and the workspace stores only
the panel widths under the key the consumer names.

## Screens and states

| state                       | what is drawn                                                  |
| --------------------------- | -------------------------------------------------------------- |
| all three slots declared    | three panels and two handles                                   |
| list and centre declared    | two panels and the list handle; no details panel and no handle |
| centre alone declared       | one panel across the whole width; no handles                   |
| details declared and closed | all its panels; the details panel is drawn in its closed look  |

## Cross-cutting requirements

### Locales

None of its own: the workspace draws no text of its own except the labels of the handles, and a
handle that is not drawn needs no label.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

On a narrow screen the panels are laid out by a media query, and the rules of this subdomain hold
there unchanged: a panel that is not declared is not drawn at any width.

### Several objects

Not applicable: the workspace belongs to no owning entity.

## Decisions

- **The condition stands on the panel together with its handle, not on the handle alone.** A handle
  left without its panel resizes nothing, and a panel left without its handle keeps a width the
  reader cannot change. They are one piece and are taken away as one.

- **The rule is extended to the list slot on the same reading as the details slot.** The overview
  page of the family named only the details panel. The case is the same — no template, nothing to
  draw — and no text of the tree reads it the other way.

## Open questions

None.

## History of changes

- 2026-09-15 — written by the task RT-2102, which found the workspace drawing all three panels
  whatever was declared.
