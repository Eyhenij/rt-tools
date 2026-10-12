# What it is carried out by — the card stack

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **The stack draws the cards of its input in their order, each card overlapping its left neighbour, and an empty input draws no card.** — `projects/ui-kit-v2/src/lib/components/carousel/rt-carousel.component.ts:views`, `projects/ui-kit-v2/src/lib/components/carousel/rt-carousel.component.scss:rt-carousel-overlap`; scenario `SC-UKV-825`
- **A card is filled with its colour, `#rgb` or `#rrggbb`; a card without a colour or with any other value keeps the kit ground and the kit text colour.** — `projects/ui-kit-v2/src/lib/components/carousel/rt-carousel.logic.ts:carouselHex`; scenario `SC-UKV-826`
- **The label of a coloured card takes the dark tone on a light colour and the light tone on a dark one, by the brightness rule of the application.** — `projects/ui-kit-v2/src/lib/components/carousel/rt-carousel.logic.ts:carouselTone`; scenario `SC-UKV-827`
- **The pointer and the focus open a card: it rises, grows to its whole label and comes on top, and the cards after it move aside.** — `projects/ui-kit-v2/src/lib/components/carousel/rt-carousel.component.scss:rt-carousel-shift`, `projects/ui-kit-v2/src/lib/components/carousel/rt-carousel.component.html:tabindex`; scenario `SC-UKV-828`
- **The host keeps the width of the closed stack, and an open card goes past it on top.** — `projects/ui-kit-v2/src/lib/components/carousel/rt-carousel.component.ts:rt-carousel-count`, `projects/ui-kit-v2/src/lib/components/carousel/rt-carousel.component.scss:rt-carousel-count`; scenario `SC-UKV-846`
- **Every size, overlap, lift, shift, radius, shadow, type step, label case and duration of the stack is a `--rt-carousel-*` property, and without them the stack draws the kit look.** — `projects/ui-kit-v2/src/lib/components/carousel/rt-carousel.component.scss:rt-carousel-card-radius`; scenario `SC-UKV-829`
- **The material preset draws the application's look by the same properties, without Material packages: cards with small corners and a large shadow, a dark label in the Material text colour, a regular-weight label in title case, and a slower move.** — `projects/ui-kit-v2/src/lib/components/carousel/rt-carousel.component.scss:rt-carousel-label-transform`; scenario `SC-UKV-829`
