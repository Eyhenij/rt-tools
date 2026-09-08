# What it is carried out by — the leaving of a route panel

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **A panel that began a leaving itself does not ask about the edits.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:canDeactivate` reads the permission before the intent; scenario `SC-UKV-21`
- **The permission is issued at one point — before the panel calls the router.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.navigation.ts:allowed` — the single point, through it go `#navigateAway` and `#navigateRelated`; scenario `SC-UKV-23`
- **The permission works for exactly one leaving and does not outlive a navigation that did not take place.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.navigation.ts:consumeLeaveAllowance`, the lifting by the outcome of the promise in `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.navigation.ts:allowed`; scenarios `SC-UKV-22`, `SC-UKV-25`
- **About the edits the panel counted under the route of the leaving is asked.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.registry.ts:find`, `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.guard.ts:rtAsideUnsavedGuard`; scenarios `SC-UKV-24`, `SC-UKV-28`
- **A panel that is not in the count but that knows how to answer about the edits is asked all the same.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.guard.ts:fallbackPanel`; scenario `SC-UKV-30`
- **The answer about the edits does not depend on whether an intermediate route has a component.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.registry.ts:register` keys the record by the declaration of the route, `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.guard.ts:rtAsideUnsavedGuard` asks by it; scenario `SC-UKV-24`
- **A component that does not know how to answer about the edits does not fell the leaving.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.guard.ts:fallbackPanel`; scenario `SC-UKV-26`
- **An answer of a panel that refused cancels the leaving and takes the panel off the count.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.guard.ts:rtAsideUnsavedGuard` — `defer` and `catchError`, `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.registry.ts:forget`; scenario `SC-UKV-31`
- **A panel answers about the edits while it is on the screen and stops answering after it has left.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts` — the putting in the effect of the opening of the panel, the lifting at `DestroyRef`; `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.registry.ts:register`, `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.registry.ts:unregister`; scenario `SC-UKV-27`
- **A leaving the panel did not begin asks about the edits — wherever it came from.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:canDeactivate`; scenarios `SC-UKV-29`, `SC-UKV-34`
- **A leaving that came a second time while the window about the edits is open opens no second window.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.unsaved.ts:ask`; scenario `SC-UKV-32`
- **A leaving during a write is cancelled silently.** — `projects/ui-kit-v2/src/lib/components/aside/unsaved-dialog/rt-aside-unsaved.logic.ts:resolveCloseIntent` and the order of the checks in `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:canDeactivate`; scenario `SC-UKV-33`
- **The outcome of a mutation the panel shows inside itself.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:submitSuccess`
- **The success has a signal of its own, symmetrical to the signal of a refusal.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:submitSuccess`
- **The signal of the success is filled by an argument of the mutation of its own, not by the argument of the toast.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:runMutation`
- **Both signals go out at the start of every attempt.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:runMutation`
- **The outcomes put each other out.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:runMutation`
- **A panel of an edit stays open after a successful write.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:runMutation`
- **A panel of creating closes after a successful write, while the mutation has not said the opposite.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:runMutation`
- **The argument about the closing is above the mode of the panel.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:runMutation`
