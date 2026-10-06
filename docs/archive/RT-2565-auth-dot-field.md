# Grill

Task RT-2565 · the request — the PR into the branch of RT-2564 · merged —

## The owner request

> теперь добавь рябь на бэкграунд вокруг карточки как это сделано в [приложение-образец] на страницах ошибок и на странице maintenance

The name of the sample application is replaced by a placeholder: another tree is not named here.

## What the tree already has

- The theme of the sign-in screens draws every page inside `login__viewport` with the card
  `login__card` in its centre: `projects/auth-keycloak-theme/src/login/shell/rt-kc-root.component.html`.
- The viewport and the card are styled by the kit block `login` (`projects/ui-kit-v2/src/styles/_login.scss`),
  the outline and the shadow of the card — by the theme (`projects/auth-keycloak-theme/src/styles.scss`).
- The second kit has no animated background component. `rt-ripple` is the wave of a press and does
  not draw a background. `afterNextRender` and the `WINDOW` token are already used in the kit.
- The colour tokens a dot field and a glass card need exist: `--rt-color-action-primary`,
  `--rt-color-bg-subtle`, `--rt-color-bg-surface-auth-card`, `--rt-color-border-default`,
  `--rt-shadow-card`.

## What the rules already say

- `reuse-first`: a piece one application could take from another goes into the kit.
- `platform-access`: the global object is taken through DI, the drawing never runs on the server.
- `rt-tools-storybook`: a new kit component gets a story with every state it declares.

## Questions and answers

**Where does the dot field live?**
Компонент второго кита (Recommended)

**Does the card change together with the background?**
Стекло, как на страницах ошибок (Recommended)

**Is a soft radial gradient needed under the dots?**
Да, как там (Recommended)

## Decisions

- **The background is a kit component `rt-dot-field` in `@rt-tools/ui-kit-v2`.** — the owner's
  answer; other applications can put it behind their own pages. Rejected: a component inside the
  theme — nobody else could take it.
- **The field draws square dots on a 10px grid on a canvas.** A dot is lit where a slowly moving
  noise passes a threshold, and a 4x4 Bayer matrix breaks the threshold per cell. The clouds get
  ragged edges, and a frame is drawn every 90ms. Rejected: an animation in CSS alone — it gives no
  ragged edges.
- **The dot colour comes from CSS.** The host sets `color`, and the canvas reads the computed value
  on every frame: the dots follow the light and the dark theme without code.
- **The dots thin out in the centre, behind the card.** — the form stays readable.
- **With `prefers-reduced-motion: reduce` one frame is drawn and the animation stops.**
- **The card becomes glass: a semi-transparent background with a blur behind it.** The outline and
  the shadow stay. — the owner's answer.
- **Under the dots lies a soft radial gradient: lighter at the top centre, the page colour below.**
  — the owner's answer.
- Question closed by assumption: the behaviour changes — the look of every sign-in page.
- Question closed by assumption: no law or rule is edited.
- Question closed by assumption: one task — the component and its first consumer roll back together.
- Question closed by assumption: not part of the task — the error pages of the example admin.
- Question closed by assumption: the sample is the error and maintenance pages of the application
  the owner named; the technique is described in this tree's own terms.

## What is left unclear

- Nothing blocks the work.

## Decisions along the way

- **The stories of the field are not shot.** The field moves, and a frame depends on the minute it
  was taken. Affected stage of the plan: 1.
- **The glass of the card is checked by the end-to-end scenario SC-AUTH-62.** A unit test does not
  compute styles. Affected stage of the plan: 2.
- **The stand takes a rebuilt theme only after the Keycloak container is recreated.** The jar is
  mounted as a single file. Affected stage of the plan: 2.
