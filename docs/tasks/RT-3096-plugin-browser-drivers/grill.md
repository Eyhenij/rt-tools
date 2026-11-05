# Grill

## The owner request

> бери след задачу

Said after three described tasks were offered: RT-3096, RT-3067 and RT-3095. RT-3067 turned out to
be a task of the neighbouring epic, so the first of the remaining two was taken. The task body: the
guard of outside browser drivers knows only `mcp__playwright__.*` and `mcp__chrome-devtools__.*`;
the same drivers installed as plugins are named `mcp__plugin_playwright_playwright__*` and
`mcp__plugin_chrome-devtools-mcp_chrome-devtools__*`, and the guard lets them through, so the
browser opens past the pinned profile.

## What is already in the tree

- `projects/agent-kit/assets/hooks/browser-guard-no-other-drivers.sh` — the `# rt-hook` line and the
  `case "$tool"` branch with the two driver names.
- The suite `projects/agent-kit/tests/browser-guard-drivers.test.sh` (101 lines); the spec
  `docs/specs/agent-kit/browser-guards/` (144 scenario lines).

## Questions and answers

Closed by assumption, as the tasks before it:

- **Does the task change the behaviour** — yes, of one package guard; no application code.
- **Does it need an edit of a law or a rule** — no: one spec rule.
- **One task or several** — one.
- **What is not part of the task** — other plugin tools than the two browser drivers.
- **What shows the task is closed** — scenarios: a call of each driver by its plain name and by its
  plugin name is refused; the pinned extension passes.
- **The sample** — the existing `case` branch.

## Decisions

- **The plugin names are matched by a sample, not by one exact prefix.** The plugin name and the
  server name inside it are chosen by whoever publishes the plugin; the sample takes any plugin
  whose server is the driver.
