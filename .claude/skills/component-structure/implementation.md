# component-structure — how it is arranged here

The names of this tree, next to the rule `SKILL.md` beside it. A file of its own because the rule
speaks by technique and travels between repositories whole, while everything below is true only
here and goes stale at every rename.

The tree holds two independent kits. They do not replace one another and share no code: different
selectors, their own token sets, their own component lists — so almost every line below is named
for both.

## What it is called here

- **In the rule** — Here
- **a component file** — a trio side by side: `<name>.component.ts` + `.html` + `.scss`
- **the component prefix** — `rtui-` in the first kit, `rt-` in the second
- **the anchor for specs** — the attribute `qa-dataid` — only in the second kit
- **the block class on the host** — `host: { class: BEM_BLOCK }`, where `BEM_BLOCK` is a constant next to the class
- **a ready value for the template** — `computed()`, the modifier record for `[rtMod]` included
- **an input, an output, a node reference** — `input()`, `output()`, `viewChild()` — no input and output decorators are started here

## Where it lives

- **the components of the first kit** — `projects/ui-kit/src/lib/ui-kit/<feature>/`
- **the components of the second kit** — `projects/ui-kit-v2/src/lib/components/<feature>/`
- **a sample component file** — `projects/ui-kit/src/lib/ui-kit/buttons/unified-button/rtui-button.component.ts`
- **the linter rules of this tree** — `tools/eslint-rules/rules/`, enabled in `eslint.config.mjs`
- **the anchor search in specs** — `projects/ui-kit-v2/src/testing/rt-kit-testing.ts` — `qa`, `qaAll`
- **the component defaults of the first kit** — `projects/ui-kit/src/lib/ui-kit/config/` — the token `RT_UI_CONFIG`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section «How the law applies
here» (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **The template calls no methods.** — `projects/ui-kit/src/lib/ui-kit/buttons/unified-button/rtui-button.component.ts:modifiers` — the modifier record is assembled by a computed value and bound once. It is not held by the linter: `@angular-eslint/template/no-call-expression` in `eslint.config.mjs` is switched off while there is nothing to silence a template warning spot by spot.
- **Every interactive element carries `qa-dataid`.** — `projects/ui-kit-v2/src/testing/rt-kit-testing.ts:qa` — the anchor finder; the anchors themselves stand in the templates of the second kit, and in the first there are none at all.
- **A component is allowed only an element selector.** — **Not checked.** There is no linter rule for the kind of selector in the config; every component of both kits is declared as an element, and a violation will be caught by review.
- **The block class hangs on the host, not on a wrapper inside the template.** — `tools/eslint-rules/rules/require-host-bem-block.ts:RULE_NAME` — the rule is declared as a warning but brings the run down on a par with a refusal — the `lint` target has `maxWarnings: 0`. In the first kit the host class is not everywhere: 39 disagreements, and the task #113 stands behind them.

## What else is worth knowing when reading the code

- Classes in a template are set by the directives `rtBlock` / `rtElem` / `[rtMod]` from
  `@rt-tools/core`, not by a string in an attribute. `rt/require-bem-directives` is declared as a
  warning, but with `maxWarnings: 0` it brings the run down: the 24 raw classes of the first kit are
  taken apart by the task #113.
- `rtMod` without `ModDirective` in `imports` builds silently, and the modifiers vanish in the
  finished build: that is exactly how 13 components lost them. Hence `rt/require-mod-directive-import`
  is a refusal, not a warning.
- The defaults of a first-kit component are resolved by the ladder «instance input →
  `components.<name>` → `global` → the library default» and only in a computed value: what is read
  in a class field the consumer can no longer override.
- `<ng-content />` is not repeated in different branches of a condition — the projected nodes bind
  to the first slot. It is declared once in an `<ng-template>` and unfolded through
  `[ngTemplateOutlet]`.
- The second kit is wholly on `ViewEncapsulation.None`; what follows from that for the styles is
  the rule `styling-bem` and its `implementation.md`.

## What this is checked by

- `pnpm exec nx lint @rt-tools/ui-kit` and `pnpm exec nx lint @rt-tools/ui-kit-v2` — the decorator
  and template rules and the tree own rules.
- `pnpm exec nx test @rt-tools/ui-kit --testFile=<path>` — the component spec; the stand build is
  zoneless, and a missed import brings the spec down rather than drawing emptiness.
