# What it is carried out by — the look of a field of input in the setting of the kit

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The look of a field is resolved by the same order as the rest of the defaults of the kit.** — `projects/ui-kit/src/lib/ui-kit/config/rt-ui-config.ts:DynamicSelectors`; scenario `SC-UK-54`
- **The default of the input is emptiness, and the former value stands at the end of the chain.** — `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/dynamic-selectors-directive.ts:DEFAULT_APPEARANCE`; scenario `SC-UK-53`
- **The resolved value is counted once, and the templates read it.** — `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/dynamic-selectors-directive.ts:resolvedAppearance`; scenario `SC-UK-55`
- **A nested component gets an already resolved value, it does not resolve it anew.** — `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/dynamic-selector/rtui-dynamic-selector.component.html:resolvedAppearance`; scenario `SC-UK-54`
