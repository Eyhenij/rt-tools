# Reference — formats & templates

## Unreleased CHANGELOG block

Prepend above the latest released `## [x.y.z](...)` heading. Use only the
sections that apply. Headings match conventional-changelog so a future release
can fold them in cleanly.

```md
## [Unreleased]

### Features

- **<scope>:** <what the user can now do, in this project's own terms>

### Bug Fixes

- **<scope>:** <what was broken and is now fixed>

### BREAKING CHANGES

- **<scope>:** <what was removed/renamed> + the migration path
```

Rules:

- `<scope>` mirrors the commit scope, e.g. `rt:ui-kit`.
- One bullet per user-visible change, not per commit. Collapse `style`/`chore`/
  `docs`-only commits — they don't earn a CHANGELOG line.
- If `## [Unreleased]` already exists, extend its sections instead of adding a
  second block.
- Commit message: `docs(<scope>): add unreleased notes for <short summary>`.

## PR body template

Write to the session scratchpad, then `--body-file` it.

```md
## Summary

<1–3 sentence what & why>

- **<headline change>** — <detail: new API surface, inputs, behavior>

## Changes

- <file-group level bullets: added / removed / updated>

## ⚠️ Breaking changes # omit the whole section if none

<what breaks> and how to migrate:

- `<old usage>` → `<new usage>`

## Test plan

- [ ] `pnpm run build:ui-kit`
- [ ] `pnpm test`
- [ ] `pnpm run lint`
- [ ] <visual / Storybook check if UI changed>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

If the PR resolves a board task, add `Closes #<issue>` to the body so merging
auto-closes the issue.

## Commit trailer

End every commit body with:

```
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

## Commands cheat sheet

```bash
scripts/gather-context.sh main

command git push -u origin "$(command git rev-parse --abbrev-ref HEAD)"

command git add projects/ui-kit/CHANGELOG.md
command git commit -m "docs(rt:ui-kit): add unreleased notes for ..."
command git push

command gh pr create --base main --head "<branch>" \
  --title "<conventional title>" --body-file <scratchpad>/pr-body.md

# update existing PR instead of duplicating
command gh pr edit <number> --body-file <scratchpad>/pr-body.md
```

## Pitfalls

- If bare `gh`/`git` errors with an account-selection message, prefix with
  `command`.
- `gh pr create` warns about uncommitted changes — fine as long as the dirty
  files are intentional leftovers, not part of this PR. Never `git add .`.
- Don't touch released CHANGELOG sections; only the `Unreleased` block.
