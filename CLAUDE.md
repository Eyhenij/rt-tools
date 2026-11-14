# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

rt-tools is a set of packages under the `@rt-tools` scope: utility types and functions, signal-based stores, an Angular component kit, and the receiver applications built on them. The Angular packages require Angular 21+ with Angular Signals support.

## Commands

```bash
# Install dependencies (pnpm is required).
# The post-install also generates the storage client: it lies outside history, and without it
# the receiver does not build on a fresh checkout.
pnpm install

# Rebuild one storage client — after an edit of the schema, and also when the receiver's build
# stopped with a line about its absence: it names this command itself
pnpm run prisma:generate

# Build the component kit
pnpm run build:ui-kit-v2

# Run all tests
pnpm test

# Run a single test file
pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=<path-to-spec>

# Lint all projects
pnpm run lint

# Format code
pnpm run prettier

# Lint, types, tests, build and verify over every project, then the styles linter. It is not the
# push gate: the tree checks, the hook scenarios and the showcase snapshots run only before a push,
# and that set is printed by `rt_push_checks` in `.claude/rt-kit/project.sh`
pnpm run check:all

# Files, dependencies and exports nobody uses, by knip over every project; settings in `knip.json`.
# It is not in the push set and exits non-zero while findings remain
pnpm run check:unused

# Raise the applications on one's own machine. The database is needed only by the receiver;
# the admin panel proxies /api to port 3000, and without the receiver it shows empty lists and a
# read refusal — that is its honest state rather than a breakage.
pnpm run serve:db      # the database container, port 55432
pnpm run serve:api     # the receiver, port 3000, the local database
pnpm run serve:admin   # the admin panel, port 4200

# The end-to-end suite's stand: production builds on ports 3310 and 4310 with a seeded database
# of their own. It takes no working ports — on it one looks at what the working database lacks
pnpm run serve:stand

# Run Storybook
pnpm run storybook:ui-kit-v2   # the kit's showcase, port 6007

# View dependency graph
pnpm run graph

# Rebuild the code graphs: the root one and one per directory under projects/, apps/ and libs/.
# Only graph.json goes into history; how a session reads them is the pattern task-flow-graph
pnpm run graph:build

# Rebuild the graph of concepts and rules of the rules package and its report: what nothing links
# to, the rules nothing executes, unused glossary words, texts that state the same thing. graphify
# reads it with --graph projects/agent-kit/rules-graph/graph.json
pnpm run graph:rules

# Lay out the laws from @rt-tools/agent-kit / verify what is laid out
pnpm run agent-kit:sync
pnpm run agent-kit:check
```

## Laws and rules

Two layers, and they do not replace one another. Two languages as well: laws, rules, patterns,
skills, check refusals and tree documents are written in English; tasks, PR descriptions,
commit bodies and chat replies are written in the owner's language.

**Laws** live in `docs/constitution/` and say _what must be true_, without paths or file names.
They are laid out from `@rt-tools/agent-kit` by `pnpm run agent-kit:sync` and listed at session
start by `.claude/hooks/constitution-index.sh`. Read the whole law before a decision it touches.

**Rules** live in `.claude/skills/` and say _by which technique_ a law is kept — `component-structure`,
`styling-bem`, `testing`, `git-workflow` and the rest, laid out from the same package. What each of
them is called in this tree sits in `implementation.md` next to the rule; patterns
(`<rule>-<what>`) carry the ready-made code. Some rules are this tree's own, because the package
carries only what a tree that installs it can execute: `rt-tools-storybook` for the showcase,
`ui-component-tests` for the ready-made spec and the visual snapshot, `cargo-triage` with
`cargo-triage-mark` for the intake of reports, and `agent-kit-source` for editing the rule
package itself — alongside the `/agent-kit-digest` and `/rules-review` commands. What may live
in the package and what stays here is decided by the boundary test in
`docs/specs/agent-kit/package-boundary/`, and `npm run check:boundary` keeps it.

Work itself is kept in `docs/tasks/<branch>/` — the owner's request verbatim in `grill.md`, the
plan in `plan.md` (never edited after it is written), the running state in `progress.md`, the only
place where done work is marked. `.claude/hooks/task-context-load.sh` reads that state into the
session on startup and `.claude/hooks/task-flow-guard.sh` refuses code before a plan exists — both
written by this project. A domain here is a package under `projects/`, and its spec lives in
`docs/specs/<package>/`.

`.claude/hooks/skill-gate.sh` blocks an edit until the matching rule is loaded; the map from a
file to its rule is `.claude/rt-kit/gate-map.sh`, and the commands, stands and doc pairs the
guard hooks call are in `.claude/rt-kit/project.sh`. Both are written by this project, not laid
out from the package.

Laid-out files carry a `rt-kit v… · <resource> · <digest>` header and are **not edited in place**:
an edit there is lost on the next sync, and `agent-kit sync` refuses the file instead of
overwriting it. Project additions go to `.claude/rt-kit/overrides/<resource>` and merge by `## `
section. What this repo opts out of is listed in `skip` in `.claude/rt-kit.json`.

## Architecture

### Monorepo Structure

This is an Nx-managed monorepo using pnpm workspaces. The published packages live under
`projects/`, the applications under `apps/`, their libraries under `libs/`.

### Packages

- `projects/utils/` (`@rt-tools/utils`) — framework-free types and functions: sorting, comparison,
  type checking, array and object helpers.
- `projects/core/` (`@rt-tools/core`) — the Angular half: BEM directives (`rtBlock`, `rtElem`,
  `rtMod`), browser and IndexedDB storage services, pipes, validators, directives, tokens.
- `projects/store/` (`@rt-tools/store`) — signal-based stores (`BaseStoreService`,
  `BaseAsyncStoreService`).
- `projects/ui-kit-v2/` (`@rt-tools/ui-kit-v2`) — the component kit: selectors `rt-*`, its own
  design-token set, runtime services (theme, breakpoints, notification bus), an icon set under
  `src/assets/icons`, and eight-language labels in the `rtKit` namespace. See
  `projects/ui-kit-v2/README.md`.

### State Management Pattern

The library provides signal-based stores:

```typescript
// BaseStoreService - synchronous state management with message bus
abstract class BaseStoreService<STATE, MSG> {
    store: Signal<STATE>;
    dispatch(event: IAction<MSG>): void;
    onDispatch(msg: MSG): Observable<IAction<MSG>>;
    patchState(fn: (state: STATE) => STATE): void;
}

// BaseAsyncStoreService - extends with async loading states
```

### Build Configuration

- The Angular packages are built with ng-packagr (`projects/<package>/ng-package.json`)
- Output to `dist/<package>/`; the kit adds the ready-made token set by `pnpm run build:tokens-v2`

## Code Style Requirements

- **Explicit type annotations required** (enforced by ESLint `@typescript-eslint/typedef`)
- **Explicit function return types required** (`@typescript-eslint/explicit-function-return-type`)
- **Explicit member accessibility** (no implicit public on methods/properties)
- **Member ordering**: fields (private → protected → public), then constructor, then methods
- **Single quotes**, semicolons required
- **No console.log/debugger** in production code
- Template cyclomatic complexity limit: 8

## Testing

- Jest with jest-preset-angular
- Test files: `*.spec.ts` alongside source files
- Run single test: `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=<relative-path>`

## Using RtIconOutlinedDirective (`@rt-tools/core`)

1. Add Google Fonts link to index.html for Material Symbols
2. Configure MatIconRegistry in app.component to use 'material-symbols-outlined'
3. Apply directive to mat-icon elements
