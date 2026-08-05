# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

rt-tools is an Angular library providing utility types, functions, and UI components. It's published as `rt-tools` on npm (v0.3.14) and requires Angular 21+ with Angular Signals support.

## Commands

```bash
# Install dependencies (pnpm is required)
pnpm install

# Build the library
pnpm run build:ui-kit

# Run all tests
pnpm test

# Run a single test file
pnpm exec nx test @rt-tools/ui-kit --testFile=<path-to-spec>

# Lint all projects
pnpm run lint

# Format code
pnpm run prettier

# Run all checks (lint, test, build)
pnpm run check:all

# Run Storybook
pnpm run storybook

# View dependency graph
pnpm run graph

# Lay out the laws from @rt-tools/agent-kit / verify what is laid out
pnpm run agent-kit:sync
pnpm run agent-kit:check
```

## Laws and rules

Two layers, and they do not replace one another.

**Laws** live in `docs/constitution/` and say _what must be true_, without paths or file names.
They are laid out from `@rt-tools/agent-kit` by `pnpm run agent-kit:sync` and listed at session
start by `.claude/hooks/constitution-index.sh`. Read the whole law before a decision it touches.

**Rules** live in `.claude/skills/` and say _what that is called in this tree_ —
`rt-tools-component`, `rt-tools-styling`, `rt-tools-testing` and the rest. `.claude/hooks/skill-gate.sh`
blocks an edit until the matching rule is loaded.

Laid-out files carry a `rt-kit v… · <resource> · <digest>` header and are **not edited in place**:
an edit there is lost on the next sync, and `agent-kit sync` refuses the file instead of
overwriting it. Project additions go to `.claude/rt-kit/overrides/<resource>` and merge by `## `
section. What this repo opts out of is listed in `skip` in `.claude/rt-kit.json`.

## Architecture

### Monorepo Structure

This is an Nx-managed monorepo using pnpm workspaces. The main library is in `projects/ui-kit/`.

### Library Entry Points

The library exports from `projects/ui-kit/src/public-api.ts` with three main categories:

1. **Core Tools** (`src/lib/`)
    - `bem/` - BEM CSS methodology utilities (block, elem, mod directives)
    - `storage/` - Browser storage services (localStorage, sessionStorage, in-memory)
    - `store/` - Signal-based state management (`BaseStoreService`, `BaseAsyncStoreService`)
    - `idb-storage/` - IndexedDB storage service

2. **UI Kit** (`src/lib/ui-kit/`)
    - Components: modal, aside, buttons, table, spinner, toggle, checkbox, toolbar, header, popover, snack-bar, action-bar, dynamic-selectors, file-uploader, image-uploader, info-badge
    - All components use `rtui-` prefix (e.g., `rtui-button`, `rtui-spinner`)

3. **Utilities** (`src/lib/util/`)
    - Functions: sorting, comparison, type checking, array/object helpers
    - Pipes: equal, ternary, sanitize, break-string, is-email
    - Validators, directives, services, tokens

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

- Built with ng-packagr (`projects/ui-kit/ng-package.json`)
- Output to `dist/ui-kit/`
- SCSS styles inlined
- Assets include `src/styles` and all `.scss` files

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
- Run single test: `pnpm exec nx test @rt-tools/ui-kit --testFile=<relative-path>`

## Using RtIconOutlinedDirective

1. Add Google Fonts link to index.html for Material Symbols
2. Configure MatIconRegistry in app.component to use 'material-symbols-outlined'
3. Apply directive to mat-icon elements
