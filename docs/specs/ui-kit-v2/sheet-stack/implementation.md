# What it is carried out by — the sheet opened from a sheet

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenarios it is checked by; what exactly every scenario is covered by is said in
`scenarios.md`.

- **A sheet opened while another is open replaces it.** — `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.ts:covered`, `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.scss:--covered`; scenario `SC-UKV-1631`
- **Closing the top sheet shows the previous one again.** — `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-stack.service.ts:remove`; scenario `SC-UKV-1632`
