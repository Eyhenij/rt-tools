# What it is carried out by — the single-column threshold of the workspace

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **Without the threshold input the workspace keeps the threshold of the styles.** — `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace.component.ts:singleColumnBreakpoint`; scenarios `SC-UKV-1241`, `SC-UKV-1247`
- **With the threshold input the workspace is one column only at a place not wider than the input.** — `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace.component.ts:singleColumn`; scenario `SC-UKV-1242`
- **Wider than the threshold the list and the centre stand side by side.** — `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace.component.ts:asideOverlay`; scenarios `SC-UKV-1243`, `SC-UKV-1247`
- **While the details panel has no column it opens over the window as a side panel of the given width.** — `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace-aside-overlay.component.ts:RtWorkspaceAsideOverlayComponent`; scenarios `SC-UKV-1243`, `SC-UKV-1246`
- **The panel over the window closes by the button «Close», by a press on the dimmed background and by the key Esc.** — `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace-aside-overlay.component.ts:close`; scenarios `SC-UKV-1244`, `SC-UKV-1245`
- **At a place not wider than the threshold the details panel opens as before.** — `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace.component.ts:asideOverlay`; scenario `SC-UKV-1242`
