# The bar of mass actions

**Status:** in force · **Revision:** 2026-09-17 · **Scenario prefix:** `SC-UKV`
**Depends on:** the icon, button, menu and popover families of the kit, and the label set of the kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

## Why

A list where rows are picked by a checkbox has to say two things at once: how many are picked, and
what can be done to them. Written into the page, both take room the list needs and move with the
scroll away from the hand that picked. A person who picked a hundred rows on the third screen then
scrolls back up to find the button.

The bar says both above the page: the count on the left, the actions next to it, the cross on the
right. It appears the moment the first row is picked and leaves when the last is let go.

The family is carried over from the first kit, where it is `rtui-action-bar`. It is written anew on
the kit's own primitives; the first kit's directory is read as a sample and is not edited.

## Terminology

- **The bar** — what is drawn above the page: the count, the actions, the cross.
- **The holder** — the part that decides whether the bar stands in the markup at all and where above
  the page it is pinned. The bar itself knows nothing of that.
- **An action** — one press in the bar: a label, an optional icon, and either something to do or a
  nested list of actions.
- **The count** — the pair "how many are picked" and "how many there are in total".

### What it is called in the interface

The person behind the screen sees no holder and no config. They pick rows, and a strip slides up
from the bottom saying how many they picked out of how many, with the things they can do to them
next to it and a cross to let them all go.

## Rules

- **The bar is opened by the count of what is picked, not by a flag of its own.** Two sources of one
  sign diverge silently: a flag left true over an emptied selection keeps a bar above a page where
  nothing is picked, and there is nothing on the screen to explain it.
- **The count is shown as it stands, and zero is a number.** A counter that hides itself at zero
  makes the bar jump in width the moment the last row is let go — and that is the very moment the
  bar is leaving.
- **An action without a nested list does what it carries and closes the bar.** The selection is
  spent by the action, and a bar left standing over a list where nothing is picked any more says the
  opposite.
- **An action carrying a nested list opens it and does nothing else.** Such an action is a heading
  of a group, and firing it as well would fire a thing the person did not choose.
- **A press on an action of the nested list closes the bar the same as a press on a plain one.**
  Where the person pressed — in the bar or a step deeper — changes nothing about the selection being
  spent.
- **The cross reports a press outward and closes nothing by itself.** The selection belongs to
  whoever holds the list, and a component that drops it keeps a state that is not its own.
- **The bar stays in the markup for exactly as long as its leaving lasts.** The markup and the
  styling rule hold one number between them, so it lives in one place and the other reads it:
  diverged, the markup takes the bar away mid-flight, and the leaving is cut off.
- **The bar is pinned above the page by the holder, and the layer number comes from the scale.** A
  number written in the component's own file lands in no scale, and the next node above the page
  takes the same one without learning of it.
- **An action with an icon lets its label be taken away where the pointer is coarse, and the markup
  carries both.** The bar lives on the lower edge, and a finger needs the room the labels take —
  but which of the two is drawn is decided by a media query, not by a condition in the template: a
  condition there is styling that rode into the code. The action says by a modifier that it has an
  icon, and the rule reaches the label by that. An action with no icon keeps its label under any
  pointer: shown by nothing at all, it cannot be pressed on purpose.
- **Every label of the bar comes from the dictionary of the kit.** The count, the name of the cross
  for a reader who hears the screen — all of it. The first kit glued the count out of English words
  in its own template, and a consumer in another locale had no way to reach them.
- **The bar has a limit of its width, and the row of actions that did not fit it wraps.** The labels
  come from a consumer who cannot shorten them, and a bar without a limit grows past the window it
  is pinned to.
- **A single action wider than the place has its label wrapped, and the bar draws that label
  itself.** A row of one has nowhere to wrap to: a label left as one unbreakable line runs out of
  the bar and lies over the page beside it, and a limit of the width is named together with the fate
  of what did not fit it. The label is the bar's own markup, so the fate is the bar's to name.
- **The limit of the width stands on the element itself as well, not on the bar alone.** The
  containing block of the bar is the element, and without a limit there the element grows by its
  content — and a hundred per cent of the bar is then counted from the grown element.
- **The styles of the bar live in the cascade layer of the kit's components.** A consumer keeps the
  last word over them, and a rule that rode past the layer takes that away from them silently.

## What is out of scope

- **A style object on an action.** The first kit took one and put it on the node as a style string.
  A look arrives here by a name from the kit's set of button looks, not by a value: that is what the
  token layer exists for.
- **Holding the selection.** The bar neither counts the picked rows nor drops them: it is given the
  numbers and it reports the presses.
- **Confirming a destructive action.** The kit has a ready family for that, and an action that needs
  a question asks it by itself.
- **Cutting the label of an action by an ellipsis.** A cut label reads as the whole value, so it is
  owed the rest on hover, and a tooltip on a bar pinned to the lower edge of the window is a work of
  its own. Until it is done the label wraps, and none of the value is lost.

## Contract

The bar takes the config as a required input and reports two things outward: a press on an action
and a press on the cross. The holder reads the same config from the service the consumer provides
at their own level, and it is the holder that decides whether the bar is in the markup.

### Refusal codes

Not applicable: the family is a component of the kit and throws no refusals.

## Data

The config is three things: how many are picked, how many there are in total, and the list of
actions. An action is a label, an optional icon, an optional look, and either something to do or a
nested list of actions of the same shape.

## Screens and states

| State                 | What is drawn                                |
| --------------------- | -------------------------------------------- |
| nothing picked        | no node in the markup at all                 |
| something picked      | the count, the actions, the cross            |
| the bar is leaving    | the same, while the leaving rule plays       |
| an action is a group  | the same, with its nested list above the bar |
| the pointer is coarse | an action with an icon shows the icon alone  |

## Cross-cutting requirements

### Locales

Every label comes from the dictionary of the kit; the count is assembled by the dictionary's own
means, not by gluing words around the numbers.

### SEO

Not applicable: the kit's components are drawn inside applications behind a sign-in.

### Mobile layout

The bar keeps its place at the lower edge and loses the labels of actions that carry an icon. The
threshold is the coarse pointer, not the width of the window: a tablet in landscape is wider than
any width threshold and is still pressed by a finger.

### Several objects

The bar is one on a page: it speaks of the selection, and there is one selection. Two holders on one
page would draw two bars one over the other, and nothing in the kit prevents that — it is the
consumer's matter, as it is for any component pinned above the page.

## Decisions

- **The config arrives by a service rather than by an input of the holder.** The argument: whoever
  picks the rows and whoever draws the bar are different components at different depths of the
  screen, and passing the config down through them means every component in between knows about the
  bar. Rejected: an input on the holder — it moves the same passing onto the consumer.
- **The bar itself takes the config as an input all the same.** The argument: a component that can
  only be raised together with a service is shown by no story and checked by no test without one.
  Rejected: reading the service from the bar — that is what the holder is for.
- **The cross reports and does not close.** The argument: the same reason the bar does not hold the
  selection. Rejected: zeroing the count inside the bar — the list would keep its rows picked while
  the bar says nothing is.

## Open questions

- Whether an action needs a state of its own — unavailable while something in the selection forbids
  it. The first kit has no such thing, and the consumer that will migrate is not named yet.

## History of changes

- 2026-09-17 — the subdomain was started together with the family: the second kit had no bar of mass
  actions at all, and the overview page of the toolbar said so in words (RT-1880).
