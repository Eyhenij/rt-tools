# @rt-tools/utils

[![npm](https://img.shields.io/npm/v/@rt-tools/utils?color=c00)](https://www.npmjs.com/package/@rt-tools/utils)
[![Angular](https://img.shields.io/badge/Angular-22%2B-dd0031?logo=angular&logoColor=white)](https://angular.dev)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE)

Utility functions, pipes, directives, validators, and services for Angular applications. Part of
the [rt-tools](https://github.com/Eyhenij/rt-tools) workspace.

## Installation

```bash
npm install @rt-tools/utils @rt-tools/core
# or
pnpm add @rt-tools/utils @rt-tools/core
```

## Features

### Functions

```typescript
import { isEqual, isEmpty, isString, isNumber, debounce } from '@rt-tools/utils';

// Check equality
isEqual(obj1, obj2);

// Check if value is empty
isEmpty(value);

// Type guards
isString(value);
isNumber(value);

// Debounce function calls
const debouncedFn = debounce(() => { /* ... */ }, 300);
```

### Pipes

```typescript
import { BreakStringPipe, SanitizePipe, EqualPipe, TernaryPipe } from '@rt-tools/utils';

@Component({
    imports: [BreakStringPipe, SanitizePipe, EqualPipe, TernaryPipe],
    template: `
        {{ 'camelCaseString' | breakString }}
        {{ htmlContent | sanitize }}
        {{ value | equal:compareValue }}
        {{ condition | ternary:'yes':'no' }}
    `
})
```

### Directives

```typescript
import { RtIconOutlinedDirective, ScrollToElementDirective } from '@rt-tools/utils';

@Component({
    imports: [RtIconOutlinedDirective, ScrollToElementDirective],
    template: `
        <mat-icon rtIconOutlined>settings</mat-icon>
        <div rtScrollToElement [scrollTarget]="target"></div>
    `
})
```

### Services

```typescript
import { BreakpointService, DeviceDetectorService } from '@rt-tools/utils';

@Component({ /* ... */ })
export class MyComponent {
    private breakpointService = inject(BreakpointService);
    private deviceDetector = inject(DeviceDetectorService);

    isMobile = this.breakpointService.isMobile;
    isDesktop = this.breakpointService.isDesktop;
}
```

### Providers

```typescript
import { provideRtUtils } from '@rt-tools/utils';

bootstrapApplication(RootComponent, {
    providers: [
        provideRtUtils()
    ]
});
```

## Requirements

- Angular `^22.0.0`
- `@rt-tools/core` `^0.0.5`
- RxJS `^7.8.0`

## License

[Apache-2.0](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE) © Yauheni Krumin
