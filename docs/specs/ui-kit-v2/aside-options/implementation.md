# What it is carried out by — the options, focus, pending state and properties of the side panel

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **A panel or dialog disposed without closing finishes its result with nothing.** — `projects/ui-kit-v2/src/lib/components/aside/rt-aside-ref.ts:#finish`, `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog-ref.ts:#finish` — scenario `SC-UKV-603`
- **A panel or dialog closed with a result reports that result once.** — `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog-ref.ts:#isClosed` — scenario `SC-UKV-604`
- **A panel opened with an owner's injector takes the owner's providers and closes when the owner is destroyed.** — `projects/ui-kit-v2/src/lib/components/aside/rt-aside.service.ts:#destroyed` — scenario `SC-UKV-605`
- **A closing gesture the panel refused is reported as a close request.** — `projects/ui-kit-v2/src/lib/components/aside/rt-aside.service.ts:#answerCloseGesture` — scenario `SC-UKV-606`
- **A panel with a focus trap keeps Tab inside, takes focus on opening and returns it after leaving.** — `projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.ts:#holdFocus` — scenarios `SC-UKV-607`, `SC-UKV-608`
- **A pending panel is covered by a spinner layer and marked busy.** — `projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.ts:pending` — scenario `SC-UKV-609`
- **The header shows a row under its title across the whole header, and an empty row takes no room.** — `projects/ui-kit-v2/src/lib/components/aside/header/rt-aside-header.component.html:asideHeaderContent` — scenario `SC-UKV-610`
- **The panel's padding, footer layout, title line height and error margin come from properties.** — `projects/ui-kit-v2/src/lib/components/aside/footer/rt-aside-footer.component.scss:rt-aside-footer-justify` — scenario `SC-UKV-611`
- **Without the new options, inputs, slot and properties the panel draws as before.** — `projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.scss:rt-aside-content-inset` — scenario `SC-UKV-612`
