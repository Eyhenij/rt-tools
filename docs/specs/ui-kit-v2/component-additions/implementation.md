# What it is carried out by — what the other parts of the kit give an application moving from Material

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenarios it is checked by; what exactly every scenario is covered by is said in
`scenarios.md`.

- **A button draws the focus ring only for focus not from the pointer.** — `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts:#focusMonitor`, `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.html:cdkMonitorElementFocus`, the ring by the source — `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.scss:cdk-mouse-focused`, `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.scss:cdk-mouse-focused`; scenario `SC-UKV-947`
- **A tooltip takes a show delay of its own.** — `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.ts:showDelay`, the shared delay — `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.ts:#showDelayDefault`; scenarios `SC-UKV-1017`, `SC-UKV-1018`
