# Binding — text that does not fit its place

The agreement is written before the code, so there is not one `file:symbol` line here yet. Below
are the places where the work is foreseen, so that the move into the domain spec has somewhere to
look.

## Where the execution is foreseen

| Rule                                                       | Where it is foreseen                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| a text longer than its place declares the fate of the tail | the styles of the card of a file, the block `rt-file-card__name`     |
| a component takes the width its place gives                | the same styles, the root of the block                               |
| a component never paints outside its own box               | the styles of the area of dropping, the blocks `overlay` and `frame` |
| a hint of the kit fits or is drawn compact                 | the same styles, the block `label`, plus a compact modifier          |
| a component is shown on the long value                     | the matrices of both families in their story folders                 |

## What is not decided yet

By what the compact form of the hint is chosen — the open question `Q-1`. Until it is closed the
rule about the compact form has no place of execution at all: the agreement promises the outcome
and not the technique, and there is nothing to check yet.

## What holds this apart from the styles

Nothing counts this in the tree today. A width limit without the fate of the tail is invisible to
the linter, to the build and to a component test: the markup holds the whole text, and the
clipping belongs to the browser. What sees it is a measurement of the drawn node and the snapshot
of a showing laid out on the long value.
