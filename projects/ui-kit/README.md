# @rt-tools/ui-kit

[![npm](https://img.shields.io/npm/v/@rt-tools/ui-kit?color=c00)](https://www.npmjs.com/package/@rt-tools/ui-kit)
[![Angular](https://img.shields.io/badge/Angular-22%2B-dd0031?logo=angular&logoColor=white)](https://angular.dev)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE)

Themeable, signal-based UI components for Angular. Every component is standalone, tree-shakeable,
and driven by CSS design tokens with built-in light / dark / auto theming and swappable brand
color schemes.

## Installation

```bash
pnpm add @rt-tools/ui-kit
# or
npm install @rt-tools/ui-kit
```

`@rt-tools/core`, `@rt-tools/store`, and `@rt-tools/utils` are installed automatically as dependencies.

**Peer requirements:** Angular `^22.0.0` (`@angular/core`, `common`, `forms`, `animations`,
`cdk`, `material`, `router`, `platform-browser`), `rxjs ^7.8.2`, `typescript ^6.0.0`.

## Setup

Provide the UI configuration once at bootstrap:

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

Import the design-token stylesheet so components and your own styles share the same `--rt-*` variables:

```scss
@use '@rt-tools/ui-kit/styles/tokens.css';
```

## Usage

Components are standalone — import only what you use:

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

## Components

All components use the `rtui-` prefix.

| Group | Components |
| --- | --- |
| **Actions & forms** | `rtui-button`, `rtui-multi-button`, `rtui-icon`, `rtui-checkbox`, `rtui-toggle`, `rtui-file-upload`, `rtui-image-upload` |
| **Overlays & feedback** | `rtui-modal`, `rtui-aside-container`, `rtui-aside-panel`, `rtui-popover-container`, `rtui-snack-bar`, `rtui-spinner`, `rtui-info-badge` |
| **Data display** | `rtui-table`, `rtui-dynamic-list`, `rtui-dynamic-selector`, `rtui-dynamic-input`, `rtui-multi-selector-popup`, `rtui-pagination` |
| **Layout & navigation** | `rtui-header`, `rtui-toolbar`, `rtui-side-menu`, `rtui-scrollable`, `rtui-action-bar` |

### `rtui-button`

The button is fully configurable through inputs (all with sensible defaults):

| Input | Type | Default |
| --- | --- | --- |
| `type` | `'icon' \| 'fab' \| 'pill'` | `'icon'` |
| `variant` | `'default' \| 'primary' \| 'danger' \| 'success' \| 'warning' \| 'accent'` | `'default'` |
| `appearance` | `'solid' \| 'outline' \| 'light' \| 'text'` | config / `'solid'` |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | config / `'md'` |
| `radius` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | config / `'full'` |
| `design` | `'custom' \| 'material'` | config / `'custom'` |
| `icon` / `iconPosition` | `string` / `'start' \| 'end'` | `''` / `'start'` |
| `iconSize` | `RtuiIconSizeType` | derived from `size` |
| `text` | `string` | `''` |
| `loading` / `disabled` | `boolean` | `false` |

```html
<rtui-button type="pill" variant="primary" appearance="outline" text="Confirm" icon="check" />
<rtui-button type="icon" icon="delete" variant="danger" />
<rtui-button type="pill" text="Loading" [loading]="true" />
```

## Theming

`RtThemeService` controls the active mode and brand palette from anywhere:

```typescript
import { inject } from '@angular/core';
import { RtThemeService } from '@rt-tools/ui-kit';

const theme = inject(RtThemeService);

theme.setTheme('dark'); // 'light' | 'dark' | 'auto'
theme.toggle();

// Register and activate a brand color scheme (tonal ramp, 0–100)
theme.registerColorScheme('teal', {
    primary: { 40: '#5cb8b5', 60: '#1a9d99', 100: '#008582' },
    brand: { 100: '#008582' },
});
theme.setColorScheme('teal'); // pass null to reset to the default palette
```

Accent roles a scheme may override: `primary`, `info`, `success`, `warning`, `danger`, `brand`.
One ramp serves both light and dark — the active mode selects the tone. The chosen theme and
scheme are persisted per user.

## Configuration resolution

Defaults are resolved most-specific-first:

1. the component input on a concrete instance,
2. `components.<name>` in `provideRtUi()`,
3. `global` in `provideRtUi()`,
4. the library default.

## Design modes

Design-aware controls render in one of two modes:

- **`custom`** — the native rt-tools look driven by design tokens (default).
- **`material`** — the control renders as a real Angular Material component, so it matches
  surrounding Material UI while you migrate.

```html
<rtui-button design="material" type="pill" text="Native Material" />
```

## Using Material Symbols icons

`rtui-icon` (and icon-bearing components) render [Material Symbols](https://fonts.google.com/icons):

1. Add the font to `index.html`:

   ```html
   <link rel="preconnect" href="https://fonts.gstatic.com" />
   <link
       href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
       rel="stylesheet" />
   ```

2. Set the default font set in your root component:

   ```typescript
   import { inject } from '@angular/core';
   import { MatIconRegistry } from '@angular/material/icon';

   inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
   ```

## Documentation

Full API references and live examples are available in **Storybook** (`pnpm run storybook` in the
[repository](https://github.com/Eyhenij/rt-tools)).

## License

[Apache-2.0](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE) © Yauheni Krumin
