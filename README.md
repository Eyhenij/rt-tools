<div align="center">

# rt-tools

**A signal-first Angular toolkit — a themeable UI component kit, state management, and utilities in one workspace.**

[![npm](https://img.shields.io/npm/v/@rt-tools/ui-kit-v2?label=%40rt-tools%2Fui-kit-v2&color=c00)](https://www.npmjs.com/package/@rt-tools/ui-kit-v2)
[![Angular](https://img.shields.io/badge/Angular-22%2B-dd0031?logo=angular&logoColor=white)](https://angular.dev)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](./LICENSE)
[![Built with Nx](https://img.shields.io/badge/built%20with-Nx-143055?logo=nx&logoColor=white)](https://nx.dev)

</div>

---

rt-tools is a set of composable Angular packages built on **Angular Signals**. It gives you a
themeable component kit, a lightweight signal-based store, and a curated collection of
utilities — each publishable and installable on its own, with a consistent, standalone-component
API.

## Packages

| Package | Version | Description |
| --- | --- | --- |
| [`@rt-tools/ui-kit-v2`](./projects/ui-kit-v2) | [![npm](https://img.shields.io/npm/v/@rt-tools/ui-kit-v2?color=c00)](https://www.npmjs.com/package/@rt-tools/ui-kit-v2) | Signal-based UI components (`rt-*`) with a design-token system, light and dark themes, and brand color schemes. |
| [`@rt-tools/store`](./projects/store) | [![npm](https://img.shields.io/npm/v/@rt-tools/store?color=c00)](https://www.npmjs.com/package/@rt-tools/store) | Signal-based state management with a message bus and Redux DevTools support. |
| [`@rt-tools/core`](./projects/core) | [![npm](https://img.shields.io/npm/v/@rt-tools/core?color=c00)](https://www.npmjs.com/package/@rt-tools/core) | Everything Angular-bound that is not a component — directives, pipes, validators, platform/breakpoint services, storage, `MessageBus`, BEM helpers. |
| [`@rt-tools/utils`](./projects/utils) | [![npm](https://img.shields.io/npm/v/@rt-tools/utils?color=c00)](https://www.npmjs.com/package/@rt-tools/utils) | Pure functions, list models and type helpers. **No framework** — `tslib` is its only dependency. |
| [`@rt-tools/agent-kit`](./projects/agent-kit) | [![npm](https://img.shields.io/npm/v/@rt-tools/agent-kit?color=c00)](https://www.npmjs.com/package/@rt-tools/agent-kit) | A dev-time CLI that lays a portable layer of coding rules into a repository and keeps it in sync. Ships nothing to the browser. |

`@rt-tools/utils` is the base of the stack and carries no framework, so a Node script or code shared
between server and client can use it directly. `@rt-tools/core` adds everything that needs Angular,
and `store` and `ui-kit-v2` build on both. No package re-exports another, so every symbol has exactly
one home. Install only what you need.

`@rt-tools/agent-kit` stands apart from that stack: it is a development tool, not a runtime
dependency, and it is installed with `-D`. See [its README](./projects/agent-kit/README.md).

## Highlights

- 🎯 **Signal-first** — inputs, outputs, and state are built on Angular Signals throughout; no `NgModule`s, everything is standalone and tree-shakeable.
- 🎨 **Theming built in** — light / dark / auto modes and swappable brand color schemes, all driven by CSS design tokens with zero runtime style recompilation.
- 🧱 **Cascade layer** — the kit's styles live in the `rt-kit` cascade layer, so an application rule outside the layer wins without a specificity fight.
- 📦 **Modular** — every component is its own entry point (`@rt-tools/ui-kit-v2/table`, `…/calendar`), so a bundle carries only the components it imports.
- ♿ **Accessible & typed** — strict TypeScript, explicit types, and Angular CDK a11y primitives under the hood.

## Installation

```bash
# The component kit
pnpm add @rt-tools/ui-kit-v2 @rt-tools/core @rt-tools/utils

# …or pick individual packages
pnpm add @rt-tools/store   # pulls in core and utils
pnpm add @rt-tools/core    # pulls in utils
pnpm add @rt-tools/utils   # no dependencies beyond tslib, no Angular needed
```

> npm and yarn work too — swap `pnpm add` for `npm install` / `yarn add`.

## Quick start

**1. Provide the kit** once at bootstrap:

```typescript
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRtIDBStorage } from '@rt-tools/core';
import { provideRtIcons } from '@rt-tools/ui-kit-v2';

export const appConfig: ApplicationConfig = {
    providers: [provideHttpClient(), provideRtIcons(), provideRtIDBStorage()],
};
```

**2. Include the design tokens** in the application's entry stylesheet:

```scss
@use '@rt-tools/ui-kit-v2/styles/tokens.css';
```

**3. Import and use a component** — everything is standalone:

```typescript
import { Component } from '@angular/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';

@Component({
    selector: 'app-demo',
    imports: [RtButtonDirective],
    template: `<button rtButton label="Save" theme="primary" (click)="save()"></button>`,
})
export class DemoComponent {
    save(): void {
        /* ... */
    }
}
```

**4. Toggle the theme** from anywhere via `ThemeService`:

```typescript
import { inject } from '@angular/core';
import { ThemeService } from '@rt-tools/ui-kit-v2';

const theme = inject(ThemeService);

theme.setTheme('dark'); // 'light' | 'dark' | 'auto'
theme.toggle();
```

The whole setup — the optional entries for the text editor and the PDF viewer, the cascade layer,
the dark theme, color schemes — is described in the [kit's README](./projects/ui-kit-v2/README.md).
Explore the components, their inputs and live examples in **Storybook** (see
[Development](#development)).

## Compatibility

| Requirement | Version |
| --- | --- |
| Angular | `^22.0.0` |
| RxJS | `^7.8.0` |
| TypeScript | `^6.0.0` |
| Node | `>=22.22.3` |

## Development

This is an [Nx](https://nx.dev) monorepo managed with **pnpm** (required).

```bash
pnpm install                   # install dependencies

pnpm run build:ui-kit-v2       # build the component kit
pnpm run build:all             # build every package

pnpm test                      # run all unit tests (Jest)
pnpm run lint                  # lint all projects
pnpm run check:all             # lint + test + build everything, then knip
pnpm run check:unused          # files, dependencies and exports nobody uses (knip)

pnpm run storybook:ui-kit-v2   # run the kit's Storybook locally, port 6007
pnpm run graph                 # view the Nx project graph
```

Run a single test file:

```bash
pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=<path-to-spec>
```

## Contributing

Contributions are welcome. This repo uses [Conventional Commits](https://www.conventionalcommits.org/)
(enforced by commitlint) and runs lint, tests, and build in CI. Before opening a PR:

```bash
pnpm run check:all
```

## License

[Apache-2.0](./LICENSE) © Yauheni Krumin
