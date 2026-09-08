# What it is carried out by — a field of the set and a signal form

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The field works with both bindings.** — `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.ts:ngOnInit`; scenarios `SC-UKV-77`, `SC-UKV-83`
- **An absence of events at a control is never a fall.** — `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.ts:emitsEvents`; scenario `SC-UKV-77`
- **The state of the signal binding reaches the field whole.** — `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.ts:stateOf`; scenarios `SC-UKV-78`, `SC-UKV-80`, `SC-UKV-81`, `SC-UKV-82`
- **The unfitness is shown after a touch or an edit, not at once.** — `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.ts:stateOf`; scenario `SC-UKV-79`
- **The wrapper of a field takes the state from the field, not from the form.** — `projects/ui-kit-v2/src/lib/components/field/rt-field.component.ts:showError`; scenario `SC-UKV-80`
