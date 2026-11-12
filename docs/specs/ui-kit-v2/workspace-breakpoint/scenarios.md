# Scenarios — the single-column threshold of the workspace

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through:
the titles of the tests refer to them.

### SC-UKV-1241 — without the threshold input the styles keep the view

Given the workspace has no threshold input
When the details panel is opened at a place 768 wide
Then the workspace carries no class of the threshold, and the details are drawn in their own column

Covered: `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace-breakpoint.spec.ts`.

### SC-UKV-1242 — a place not wider than the threshold is one column

Given the workspace has the threshold 600 and the place is 375 wide
When the details panel is opened
Then the workspace is one column, and the details open in place, not over the window

Covered: `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace-breakpoint.spec.ts`.

### SC-UKV-1243 — wider than the threshold the details open over the window

Given the workspace has the threshold 600 and the place is 768 wide
When the details panel is opened
Then the list and the centre stay side by side, and the details are drawn in a side panel with a dimmed background

Covered: `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace-breakpoint.spec.ts`.

### SC-UKV-1244 — the button «Close» closes the panel over the window

Given the details are open over the window
When a person presses the button «Close»
Then the workspace reports the panel as closed

Covered: `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace-breakpoint.spec.ts`.

### SC-UKV-1245 — the dimmed background and the key Esc close the panel over the window

Given the details are open over the window
When a person presses the dimmed background or the key Esc
Then the workspace reports the panel as closed

Covered: `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace-breakpoint.spec.ts`.

### SC-UKV-1246 — the width of the panel over the window comes from the input

Given the workspace has the panel width 420
When the details are opened over the window
Then the side panel is 420 wide and not wider than the window

Covered: `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace-breakpoint.spec.ts`.

### SC-UKV-1247 — the threshold input switches the rules of the threshold 768 off

Given the styles of the workspace are read
When the workspace carries the class of the threshold input
Then the rules of the threshold 768 do not match it, and the panel over the window keeps its width on a narrow window

Covered: `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace-breakpoint.spec.ts`.
