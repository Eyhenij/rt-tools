# What it is carried out by — the options of a toast and the modes of the toaster

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The toaster's layer comes from its own property, on the kit's scale.** — `projects/ui-kit-v2/src/lib/components/toast/rt-toaster.component.scss:rt-toaster-z-index` — scenario `SC-UKV-579`
- **A toast lives its own duration when it has one, and the toaster's otherwise.** — `projects/ui-kit-v2/src/lib/components/toast/rt-toast.component.ts:lifetime` — scenario `SC-UKV-580`
- **A toast with no duration stays until the close button.** — `projects/ui-kit-v2/src/lib/components/toast/rt-toast.component.ts:lifetime` — scenario `SC-UKV-581`
- **A toast with a progress strip shrinks it over its duration, and the strip pauses with the timer.** — `projects/ui-kit-v2/src/lib/components/toast/rt-toast.component.ts:paused` — scenario `SC-UKV-582`
- **A toast that has no timer draws no progress strip.** — `projects/ui-kit-v2/src/lib/components/toast/rt-toast.component.ts:showProgress` — scenario `SC-UKV-583`
- **The toast and each of its filled kinds read their colours from handles.** — `projects/ui-kit-v2/src/lib/components/toast/rt-toast.component.scss:rt-toast-filled-info-bg` — scenario `SC-UKV-584`
- **The toaster in the replace mode lets the previous toasts leave when a new one arrives.** — `projects/ui-kit-v2/src/lib/components/toast/rt-toaster.component.ts:#replaced` — scenario `SC-UKV-585`
- **A toast shows its own icon when it has one, and no icon when the icon is turned off.** — `projects/ui-kit-v2/src/lib/components/toast/rt-toast.component.ts:icon` — scenario `SC-UKV-586`
- **The icons of the severities come from an injectable map.** — `projects/ui-kit-v2/src/lib/components/toast/rt-toaster.model.ts:RT_TOAST_SEVERITY_ICONS` — scenario `SC-UKV-587`
- **Without the new options, handles and mode the toaster behaves and draws as before.** — `projects/ui-kit-v2/src/lib/components/toast/rt-toaster.component.ts:mode` — scenario `SC-UKV-588`
