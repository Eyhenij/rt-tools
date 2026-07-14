# @rt-tools/core

[![npm](https://img.shields.io/npm/v/@rt-tools/core?color=c00)](https://www.npmjs.com/package/@rt-tools/core)
[![Angular](https://img.shields.io/badge/Angular-22%2B-dd0031?logo=angular&logoColor=white)](https://angular.dev)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE)

The shared foundation of the [rt-tools](https://github.com/Eyhenij/rt-tools) workspace: framework
primitives used by `@rt-tools/store`, `@rt-tools/utils`, and `@rt-tools/ui-kit` — a `MessageBus`,
a `PlatformService`, the `WINDOW` injection token, and type guards.

## Installation

```bash
npm install @rt-tools/core
# or
pnpm add @rt-tools/core
```

## Features

### isNil
Type guard function for null/undefined checks.

```typescript
import { isNil } from '@rt-tools/core';

if (isNil(value)) {
    // value is null or undefined
}
```

### MessageBus
Event bus for component communication using RxJS.

```typescript
import { MessageBus } from '@rt-tools/core';

const bus = new MessageBus<'USER_LOGGED_IN' | 'USER_LOGGED_OUT'>();

// Subscribe to events
bus.ofType('USER_LOGGED_IN').subscribe(event => {
    console.log('User logged in');
});

// Emit events
bus.emit({ type: 'USER_LOGGED_IN' });
```

### PlatformService
Service for detecting browser/server platform.

```typescript
import { PlatformService } from '@rt-tools/core';

@Component({...})
export class MyComponent {
    private platform = inject(PlatformService);

    ngOnInit() {
        if (this.platform.isPlatformBrowser) {
            // Browser-only code
        }
    }
}
```

### WINDOW Token
Injection token for safe window access.

```typescript
import { WINDOW } from '@rt-tools/core';

@Component({...})
export class MyComponent {
    private window = inject(WINDOW);

    scrollToTop() {
        this.window.scrollTo(0, 0);
    }
}
```

## Requirements

- Angular `^22.0.0`
- RxJS `^7.8.0`

## License

[Apache-2.0](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE) © Yauheni Krumin
