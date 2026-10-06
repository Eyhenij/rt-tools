# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 — The sign-in screens
- **Done:** the kit component with its spec, story and overview; the theme puts it behind a glass card
- **Next step:** take the folder apart and open the PR into the branch of RT-2564
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The subdomain spec `dot-field` with scenarios is written
- [x] 1.2 The drawing logic and the component are written
- [x] 1.3 The component spec is written
- [x] 1.4 The story and `CONTEXT.md` are written
- [x] 2.1 The theme spec gets the rules of the background and the glass card
- [x] 2.2 The theme puts the field behind the card, the card becomes glass, a gradient lies under the dots
- [x] 2.3 The theme is checked on the stand in both themes

## Decisions along the way

- **The stories of the field are not shot.** The field moves, and a frame depends on the minute it
  was taken. Affected stage of the plan: 1.
- **The glass of the card is checked by the end-to-end scenario SC-AUTH-62.** A unit test does not
  compute styles. Affected stage of the plan: 2.
- **The stand takes a rebuilt theme only after the Keycloak container is recreated.** The jar is
  mounted as a single file. Affected stage of the plan: 2.

## Sessions

### 2026-10-06

- Kit: 7 specs of the field green, the types compile, the docs check matched 88 overview pages.
- Theme: 20 of 20 tests. On the stand, light theme: the canvas 5120x2578 at density 2, 227 952
  lit pixels, none under the card, two frames 3 s apart differ. The card background is white at
  0.78 with `blur(20px) saturate(1.4)`, the viewport carries the radial gradient. Dark theme: the
  same field over the dark gradient, the card dark at 0.78.
- Showcase: both canvases of `Themes` are drawn, 39 132 lit pixels each.
