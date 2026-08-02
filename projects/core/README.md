# @rt-tools/core

[![npm](https://img.shields.io/npm/v/@rt-tools/core?color=c00)](https://www.npmjs.com/package/@rt-tools/core)
[![Angular](https://img.shields.io/badge/Angular-22%2B-dd0031?logo=angular&logoColor=white)](https://angular.dev)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE)

Everything in the [rt-tools](https://github.com/Eyhenij/rt-tools) workspace that needs Angular but
is not a UI component: directives, pipes, validators, platform and breakpoint services, storage, a
message bus and the BEM helpers the kit's templates are built on.

`@rt-tools/store` and `@rt-tools/ui-kit` build on it. The framework-free half — pure functions, list
models, type helpers — lives in [`@rt-tools/utils`](https://www.npmjs.com/package/@rt-tools/utils),
which this package depends on. Neither re-exports the other: `isNil` and `INullable` are imported
from `@rt-tools/utils`, always.

## Installation

```bash
pnpm add @rt-tools/core
# or
npm install @rt-tools/core
```

`@rt-tools/utils` comes along as a dependency.

## Setup

```typescript
import { provideRtUtils, provideRtStorage, provideRtIDBStorage } from '@rt-tools/core';

bootstrapApplication(RootComponent, {
    providers: [
        provideRtUtils(), // BreakpointService + PlatformService
        provideRtStorage(), // local / session / in-memory storage
        provideRtIDBStorage(), // IndexedDB storage
    ],
});
```

## What is in it

### Services

```typescript
import { BreakpointService, DeviceDetectorService, PlatformService, MessageBus } from '@rt-tools/core';

const breakpoints = inject(BreakpointService); // isMobile / isDesktop
const device = inject(DeviceDetectorService); // OS and device detection
const platform = inject(PlatformService); // isPlatformBrowser / isPlatformServer
```

`MessageBus` is a small typed event bus over RxJS — the same one `@rt-tools/store` dispatches
through:

```typescript
const bus = new MessageBus<'USER_LOGGED_IN' | 'USER_LOGGED_OUT'>();

bus.ofType('USER_LOGGED_IN').subscribe(() => {});
bus.emit({ type: 'USER_LOGGED_IN' });
```

### Storage

`StorageService` behind an injection token per backing store, with a pluggable converter
(`JsonConverter` by default), plus an IndexedDB service:

```typescript
import { StorageService, LOCAL_STORAGE, SESSION_STORAGE, IN_MEMORY_STORAGE, IDBStorageService } from '@rt-tools/core';

const storage: StorageService = inject(LOCAL_STORAGE);
storage.setItem('key', { any: 'value' });
```

`IN_MEMORY_STORAGE` is the fallback when the platform has no `Window`, so server-side rendering
keeps working instead of throwing.

### Directives

```typescript
import {
    RtIconOutlinedDirective, // Material Symbols outlined weight
    RtScrollToElementDirective,
    RtScrollDirective,
    RtNavigationDirective,
    RtTabQueryParamDirective, // tab index ↔ query parameter
    RtEscapeKeyDirective,
} from '@rt-tools/core';
```

### Pipes

```typescript
import {
    BreakStringPipe, // camelCase → readable
    SanitizePipe,
    EntityToStringPipe,
    EmptyToDashPipe,
    EqualPipe,
    EqualChainPipe,
    NotEqualPipe,
    NotEqualChainPipe,
    TernaryPipe,
    IsEmailPipe,
} from '@rt-tools/core';
```

```html
{{ 'camelCaseString' | breakString }} {{ htmlContent | sanitize }} {{ condition | ternary: 'yes' : 'no' }}
```

### Validators

```typescript
import { emailValidator, checkIsMatchingValues, arraysNotEmptyValidator } from '@rt-tools/core';

new FormControl('', [emailValidator]);
new FormGroup({ password, confirm }, { validators: checkIsMatchingValues('password', 'confirm') });
```

### BEM

The directives every `rtui-*` template uses to build class names, and what the kit's own lint rule
expects instead of hand-written `class` strings:

```typescript
import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
```

```html
<div rtBlock="card">
    <div rtElem="title" [rtMod]="{ compact: true }">…</div>
</div>
```

### Tokens and helpers

```typescript
import { WINDOW, NAVIGATOR, OVERLAY_POSITIONS, POSITION_ENUM, isHTMLElement } from '@rt-tools/core';

const win = inject(WINDOW); // safe on the server
```

## Requirements

| Requirement       | Version   |
| ----------------- | --------- |
| Angular           | `^22.0.0` |
| RxJS              | `^7.8.0`  |
| `@rt-tools/utils` | `^0.2.0`  |

`@angular/cdk`, `common`, `core`, `forms`, `platform-browser` and `router` are peer dependencies.

## License

[Apache-2.0](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE) © Yauheni Krumin
