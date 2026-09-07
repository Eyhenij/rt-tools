# What it is carried out by — an icon on demand

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **An icon goes by a request of a name, not in advance.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts:request` — a call for one name, the file is taken only by it; scenario `SC-UKV-58`
- **A repeated request of the same name does not touch the network.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts:#requested` — the names that were already gone for; scenario `SC-UKV-59`
- **A refusal of one name puts out only its icon.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts:#load` — the refusal is put out inside its own stream; scenario `SC-UKV-60`
- **Both markups of an icon ask in the same way.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.component.ts:RtIconComponent`, `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts:#createIcon` — both call one and the same call of the registry; scenario `SC-UKV-61`
- **A symbol already lying in the sprite of the page gives no request.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts:RT_ICON_SYMBOL_ID_PREFIX` — the name of the symbol is looked for in the markup before the walk into the network; scenario `SC-UKV-63`
- **A change of the name at a drawn icon pulls the new name.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.component.ts:RtIconComponent` — the effect watches the input of the name; scenario `SC-UKV-62`
- **On the server the set is not loaded.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts:#platform` — an early exit by the sign of the environment; scenario `SC-UKV-64`
- **The kit has no preloading of the whole set.** — `projects/ui-kit-v2/src/lib/components/icon/rt-icon.providers.ts:provideRtIcons` — the intake gives only the address of the set and creates not a single step of the raising; scenario `SC-UKV-65`
