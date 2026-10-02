# What it is carried out by — the focus, parts and properties of the dialog

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **A dialog opened with a focus trap keeps Tab inside it.** — `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog.service.ts:#holdFocus` — scenario `SC-UKV-594`
- **A dialog opened with focus restoring returns focus to the element that held it, after closing.** — `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog.service.ts:#releaseFocus` — scenario `SC-UKV-595`
- **A dialog opened with automatic focus moves focus to its frame or to its first control.** — `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog.service.ts:#focusFirstTabbable` — scenario `SC-UKV-596`
- **Without the focus options the dialog moves no focus.** — `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog.service.ts:#holdFocus` — scenario `SC-UKV-597`
- **The header shows a lead element before its title, and an empty slot takes no room.** — `projects/ui-kit-v2/src/lib/components/dialog/header/rt-dialog-header.component.html:rtDialogHeaderLead` — scenario `SC-UKV-598`
- **The footer aligns its content to the start, the centre, the end or both edges, and the end by default.** — `projects/ui-kit-v2/src/lib/components/dialog/footer/rt-dialog-footer.component.ts:align` — scenario `SC-UKV-599`
- **The content part pads and scrolls the body, and its padding and height cap come from properties.** — `projects/ui-kit-v2/src/lib/components/dialog/content/rt-dialog-content.component.scss:rt-dialog-content-padding` — scenario `SC-UKV-600`
- **The dialog's background, border, header, title and footer read their look from properties.** — `projects/ui-kit-v2/src/lib/components/dialog/header/rt-dialog-header.component.scss:rt-dialog-header-border-default` — scenario `SC-UKV-601`
- **Without the new options, parts and properties the dialog draws as before.** — `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog.component.scss:rt-dialog-bg` — scenario `SC-UKV-602`
