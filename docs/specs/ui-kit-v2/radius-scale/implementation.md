# What it is carried out by — one rounding input for the second kit

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **The scale is one, and the step type names all nine steps.** — `projects/ui-kit-v2/src/lib/components/radius/rt-radius.model.ts:TRtRadius`. The list itself stands next to it, `RT_RADIUS_STEPS`
- **Every component with a surface takes the rounding by one input named `radius`.** — `projects/ui-kit-v2/src/lib/components/radius/rt-radius.directive.ts:radius`. The components take it as a host directive, and the list is checked at `projects/ui-kit-v2/src/lib/components/radius/rt-radius-contract.spec.ts:SURFACES`
- **An empty input keeps the component's own default, and the default is the one of the mockup.** — `projects/ui-kit-v2/src/lib/components/radius/rt-radius.directive.ts:data-rt-radius`. An empty input writes no attribute, and the default stays in the component's own style
- **The step reaches the component by an attribute on its host, not by an inherited property.** — `projects/ui-kit-v2/src/lib/components/radius/rt-radius.directive.ts:data-rt-radius`
- **The rule of a step reassigns the component's own property and nothing else.** — `projects/ui-kit-v2/src/styles/_mixins.scss:radius-steps`
- **A filled field with a step rounds all four corners and draws no underline.** — `projects/ui-kit-v2/src/lib/components/input/rt-input.component.scss:appearance--fill`; scenario `SC-UKV-765`
- **The pill look of a field is filled, rounded by the full step and drawn without an underline.** — `projects/ui-kit-v2/src/lib/components/input/rt-input.component.scss:appearance--pill`, `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.scss:appearance--pill`; scenario `SC-UKV-766`
- **A component whose surface lives in several parts gives the step to its main surface.** — `projects/ui-kit-v2/src/styles/_mixins.scss:radius-steps`. Each component names the one own property it gives the step to
- **The table gives the step to the card of its narrow view.** — `projects/ui-kit-v2/src/lib/components/table/rt-table.component.scss:rt-table` — the step reassigns `--rt-table-card-radius`, and the wide view takes no corners from it
- **No rounding of a component stands off the scale.** — `projects/ui-kit-v2/src/lib/components/radius/rt-radius-contract.spec.ts:off-scale`
- **The old shape inputs are gone, and their values map onto the steps.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.ts:RtRadiusDirective`. The same host directive stands on the icon button, the button and the skeleton
- **The skeleton keeps its geometry apart from the corners.** — `projects/ui-kit-v2/src/lib/components/skeleton/rt-skeleton.component.ts:shape`
- **The kit setting of the button's roundness names a step.** — `projects/ui-kit-v2/src/lib/config/rt-kit-config.model.ts:radius`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
