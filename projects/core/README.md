# @rt-tools/core

Core utilities for Angular applications.

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

- Angular 21+
- RxJS 7.8+

## License

Apache-2.0
