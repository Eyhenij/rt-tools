<div align="center">

# rt-tools

**A signal-first Angular toolkit — a themeable UI component library, state management, and utilities in one workspace.**

[![npm](https://img.shields.io/npm/v/@rt-tools/ui-kit?label=%40rt-tools%2Fui-kit&color=c00)](https://www.npmjs.com/package/@rt-tools/ui-kit)
[![Angular](https://img.shields.io/badge/Angular-22%2B-dd0031?logo=angular&logoColor=white)](https://angular.dev)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](./LICENSE)
[![Built with Nx](https://img.shields.io/badge/built%20with-Nx-143055?logo=nx&logoColor=white)](https://nx.dev)

</div>

---

rt-tools is a set of composable Angular packages built on **Angular Signals**. It gives you a
themeable component library, a lightweight signal-based store, and a curated collection of
utilities — each publishable and installable on its own, sharing a single design-token system
and a consistent, standalone-component API.

## Packages

| Package | Version | Description |
| --- | --- | --- |
| [`@rt-tools/ui-kit`](./projects/ui-kit) | [![npm](https://img.shields.io/npm/v/@rt-tools/ui-kit?color=c00)](https://www.npmjs.com/package/@rt-tools/ui-kit) | Themeable, signal-based UI components (`rtui-*`) with light/dark/auto theming and brand color schemes. |
| [`@rt-tools/store`](./projects/store) | [![npm](https://img.shields.io/npm/v/@rt-tools/store?color=c00)](https://www.npmjs.com/package/@rt-tools/store) | Signal-based state management with a message bus and Redux DevTools support. |
| [`@rt-tools/core`](./projects/core) | [![npm](https://img.shields.io/npm/v/@rt-tools/core?color=c00)](https://www.npmjs.com/package/@rt-tools/core) | Everything Angular-bound that is not a component — directives, pipes, validators, platform/breakpoint services, storage, `MessageBus`, BEM helpers. |
| [`@rt-tools/utils`](./projects/utils) | [![npm](https://img.shields.io/npm/v/@rt-tools/utils?color=c00)](https://www.npmjs.com/package/@rt-tools/utils) | Pure functions, list models and type helpers. **No framework** — `tslib` is its only dependency. |
| [`@rt-tools/agent-kit`](./projects/agent-kit) | [![npm](https://img.shields.io/npm/v/@rt-tools/agent-kit?color=c00)](https://www.npmjs.com/package/@rt-tools/agent-kit) | A dev-time CLI that lays a portable layer of coding rules into a repository and keeps it in sync. Ships nothing to the browser. |

`@rt-tools/utils` is the base of the stack and carries no framework, so a Node script or code shared
between server and client can use it directly. `@rt-tools/core` adds everything that needs Angular,
and `store` and `ui-kit` build on both. No package re-exports another, so every symbol has exactly
one home. Install only what you need.

`@rt-tools/agent-kit` stands apart from that stack: it is a development tool, not a runtime
dependency, and it is installed with `-D`. See [its README](./projects/agent-kit/README.md).

## Highlights

- 🎯 **Signal-first** — inputs, outputs, and state are built on Angular Signals throughout; no `NgModule`s, everything is standalone and tree-shakeable.
- 🎨 **Theming built in** — light / dark / auto modes and swappable brand color schemes, all driven by CSS design tokens with zero runtime style recompilation.
- 🧩 **Two design modes per control** — render the native rt-tools look (`custom`) or delegate to Angular Material (`material`) so you can adopt the kit incrementally.
- ⚙️ **Configurable defaults** — set app-wide and per-component defaults once with `provideRtUi()`; override per instance via inputs.
- 📦 **Modular** — four independently versioned runtime packages so you pull in only the surface you use.
- ♿ **Accessible & typed** — strict TypeScript, explicit types, and Material CDK a11y primitives under the hood.

## Installation

```bash
# Full UI kit (pulls in core, store, and utils as dependencies)
pnpm add @rt-tools/ui-kit

# …or pick individual packages
pnpm add @rt-tools/store   # pulls in core and utils
pnpm add @rt-tools/core    # pulls in utils
pnpm add @rt-tools/utils   # no dependencies beyond tslib, no Angular needed
```

> npm and yarn work too — swap `pnpm add` for `npm install` / `yarn add`.

## Quick start

**1. Provide the UI configuration** once at bootstrap:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRtUi } from '@rt-tools/ui-kit';

bootstrapApplication(AppComponent, {
    providers: [
        provideRtUi({
            global: { theme: 'auto', design: 'custom' },
            components: { button: { size: 'md', appearance: 'solid' } },
        }),
    ],
});
```

**2. Import and use a component** — everything is standalone:

```typescript
import { Component } from '@angular/core';
import { RtuiButtonComponent } from '@rt-tools/ui-kit';

@Component({
    selector: 'app-demo',
    imports: [RtuiButtonComponent],
    template: `
        <rtui-button type="pill" variant="primary" text="Save" icon="check" (click)="save()" />
    `,
})
export class DemoComponent {
    save(): void {
        /* ... */
    }
}
```

**3. Toggle the theme** from anywhere via `RtThemeService`:

```typescript
import { inject } from '@angular/core';
import { RtThemeService } from '@rt-tools/ui-kit';

const theme = inject(RtThemeService);

theme.setTheme('dark'); // 'light' | 'dark' | 'auto'
theme.toggle();

// Register a brand palette and activate it
theme.registerColorScheme('teal', {
    primary: { 40: '#5cb8b5', 60: '#1a9d99', 100: '#008582' },
    brand: { 100: '#008582' },
});
theme.setColorScheme('teal');
```

## Theming

Theming is layered so you can adopt as much or as little as you need:

- **Modes** — `light`, `dark`, and `auto` (follows the OS). The active mode toggles attributes/classes on `<html>` and is persisted for the user.
- **Design tokens** — colors, spacing, radii, and typography are exposed as `--rt-*` CSS custom properties. Consume the token stylesheet to theme your own components with the same variables:

  ```scss
  @use '@rt-tools/ui-kit/styles/tokens.css';
  ```

- **Brand color schemes** — override accent roles (`primary`, `info`, `success`, `warning`, `danger`, `brand`) with a tonal ramp (`0–100`). One ramp serves both light and dark; unset tones fall back to the defaults.

## Components

All components use the `rtui-` prefix and are imported individually as standalone.

| Group | Components |
| --- | --- |
| **Actions & forms** | `rtui-button`, `rtui-multi-button`, `rtui-icon`, `rtui-checkbox`, `rtui-toggle`, `rtui-file-upload`, `rtui-image-upload` |
| **Overlays & feedback** | `rtui-modal`, `rtui-aside`, `rtui-popover`, `rtui-snack-bar`, `rtui-spinner`, `rtui-info-badge` |
| **Data display** | `rtui-table`, `rtui-dynamic-list`, `rtui-dynamic-selector`, `rtui-dynamic-input`, `rtui-pagination` |
| **Layout & navigation** | `rtui-header`, `rtui-toolbar`, `rtui-side-menu`, `rtui-scrollable`, `rtui-action-bar` |
| **Theming** | `RtThemeService`, `RtThemeDirective`, `provideRtUi()`, `RT_UI_CONFIG` |

Explore the full API, props, and live examples in **Storybook** (see [Development](#development)).

## Design modes: `custom` vs `material`

Design-aware controls (starting with `rtui-button`) render in one of two modes:

- **`custom`** — the native rt-tools look driven by design tokens. The default.
- **`material`** — the control renders as a real Angular Material component, so it blends with
  surrounding Material UI while you migrate.

Set the default globally, per component, or per instance — the most specific wins:

```typescript
provideRtUi({ global: { design: 'custom' }, components: { button: { design: 'material' } } });
```

```html
<rtui-button design="material" type="pill" text="Native Material" />
```

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
pnpm install              # install dependencies

pnpm run build:ui-kit     # build the UI kit
pnpm run build:all        # build every package

pnpm test                 # run all unit tests (Jest)
pnpm run lint              # lint all projects
pnpm run check:all         # lint + test + build everything

pnpm run storybook        # run Storybook locally
pnpm run graph            # view the Nx project graph
```

Run a single test file:

```bash
pnpm exec nx test @rt-tools/ui-kit --testFile=<path-to-spec>
```

## Contributing

Contributions are welcome. This repo uses [Conventional Commits](https://www.conventionalcommits.org/)
(enforced by commitlint) and runs lint, tests, and build in CI. Before opening a pull request:

```bash
pnpm run check:all
```

## License

[Apache-2.0](./LICENSE) © Yauheni Krumin
