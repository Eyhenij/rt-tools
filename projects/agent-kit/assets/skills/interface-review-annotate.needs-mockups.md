---
name: interface-review-annotate
description: Puts the findings of an interface review on a Figma canvas as cards beside the frame: card anatomy, the Plugin API build sequence, placement, connectors. Load when a reviewed Figma frame is to be annotated. The review itself is in interface-review.
---

# Annotate the frame

## When to use

- An interface review by `interface-review` ran on a Figma frame, and its findings table is ready.
- The annotations of an earlier review are to be replaced after a re-run.

Every row in the findings table also lands on the canvas as a card. Cards go on one top-level layer
named `Interface review`, in the empty space to the left and right of the frame — never on top of
the design, and never overlapping the frame's own titles or chrome.

Never reparent, edit, lock, or restyle the frames under review. Annotations are additive; the review
is otherwise read-only.

## Card anatomy

Each card is a vertical auto-layout frame: `280px` fixed width, height hugging its contents, `12px`
padding, `8px` item spacing, `8px` corner radius, `oklch(1 0 0)` fill, `1px` `oklch(0 0 0 / 0.08)`
stroke.

Three stacked children, in order:

1. **Severity pill** — hug-width rounded rect, `4px` radius, `2px` vertical and `6px` horizontal
   padding, filled with the severity color below. Label is the severity word in uppercase, `9px`,
   weight `600`, `0.04em` letter-spacing.
2. **Title** — `#4 CTA contrast`. The finding number, then a three-to-five-word summary. `12px`,
   weight `600`, `oklch(0.15 0 0)`.
3. **Body** — one or two sentences: what is wrong, then what to do. `11px`, weight `400`,
   line-height `1.4`, `oklch(0.45 0 0)`. Cap at `240` characters; the full reasoning stays in the
   findings table.

| Severity | Pill fill | Pill text |
| --- | --- | --- |
| `HIGH` | `oklch(0.577 0.245 27.325)` red | `oklch(1 0 0)` white |
| `MEDIUM` | `oklch(0.705 0.213 47.604)` orange | `oklch(0.15 0 0)` near-black |
| `LOW` | `oklch(0.852 0.199 91.936)` yellow | `oklch(0.15 0 0)` near-black |

White on orange and yellow measures below 4.5:1; use the near-black. The pill names the severity in
words, so color never carries it alone and no separate legend is needed.

## Building the card

Hug sizing is not the default, and children only participate in auto-layout once appended. Follow
this sequence exactly:

```js
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
await figma.loadFontAsync({ family: "Inter", style: "Regular" });

const card = figma.createFrame();
card.layoutMode = "VERTICAL";            // must come before any sizing property
card.primaryAxisSizingMode = "AUTO";     // hug height
card.counterAxisSizingMode = "FIXED";    // fixed width
card.resize(280, card.height);
card.verticalPadding = 12;
card.horizontalPadding = 12;
card.itemSpacing = 8;

// Children must be appended to the card. Creating a node and setting its
// x/y puts it on the canvas as a sibling: the card then hugs to nothing
// and its contents float outside the frame.
card.appendChild(pill);
card.appendChild(title);
card.appendChild(body);

// Text wraps to the card width and grows downward
for (const text of [title, body]) {
  text.layoutAlign = "STRETCH";
  text.textAutoResize = "HEIGHT";
}

// The pill hugs its own label instead of stretching
pill.layoutMode = "HORIZONTAL";
pill.primaryAxisSizingMode = "AUTO";
pill.counterAxisSizingMode = "AUTO";
pill.layoutAlign = "INHERIT";
pillLabel.textAutoResize = "WIDTH_AND_HEIGHT";

// x and y are ignored on auto-layout children. Position the card only.
card.x = gutterX;
card.y = stackY;
```

Load every font with `figma.loadFontAsync` before setting `characters`. Text set with an unloaded
font measures at zero, so the card hugs to nothing.

Gate on the result before positioning anything else:

```js
if (card.children.length !== 3 || card.height < 56) {
  throw new Error(
    `Finding ${n}: card built empty — ${card.children.length} children, ${card.height}px tall`
  );
}
```

A correctly built card is at least `56px` tall. Anything near `26px` is padding with no content in
between.

| Symptom | Cause |
| --- | --- |
| Card hugs to ~`26px` with contents floating outside it | Children created but never `appendChild`ed to the card |
| Every card is the same height | `primaryAxisSizingMode` left at `FIXED` |
| Card is as wide as its longest line | `counterAxisSizingMode` left at `AUTO` |
| Body text runs off the card on one line | Text missing `layoutAlign = "STRETCH"` and `textAutoResize = "HEIGHT"` |
| Pill spans the full card width | Pill missing `AUTO` sizing on both axes |
| Children ignore the positions you set | Expected — auto-layout owns child position; set `x`/`y` on the card only |

## Placement

Cards sit in two gutters: one starting `80px` to the left of the frame, one `80px` to the right.
Assign each card to the gutter nearer its target node, then within a gutter sort by the target's
vertical position and stack top to bottom with `16px` between cards. If a stack would run past the
frame's bottom edge, move the overflow to the other gutter rather than shrinking cards or letting
them overlap.

Position cards only after all children are appended and sized; a card's final height is not known
until then.

Draw a `1.5px` dashed connector from the card's inner edge to the target node's nearest edge,
stroked in that finding's severity color, routed as a single elbow: horizontal out of the card, then
horizontal into the node. End it with a `4px` dot on the node, not an arrowhead. A finding that spans
the whole flow gets no connector.

Card and connector for one finding are grouped together and named `#4 MEDIUM Layout`.

## Scale

The values above assume a frame between `1000px` and `1600px` wide. Outside that range, multiply
every annotation dimension and type size by `frameWidth / 1400` so cards stay readable at the zoom
level where the whole frame fits on screen.

## Re-running

Delete the existing `Interface review` layer before drawing the new one. Annotations replace; they
never stack. If the file is view-only or the user asked for the report only, output the table alone
and say the frame was not annotated.
