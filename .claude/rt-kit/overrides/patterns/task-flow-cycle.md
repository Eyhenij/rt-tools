## The report in this tree

The package is built here from its sources and is not installed, so `npx agent-kit` finds no
command. The report is taken from the build:

```bash
pnpm run build:agent-kit && node dist/agent-kit/bin/agent-kit.js metrics --days 30
```
