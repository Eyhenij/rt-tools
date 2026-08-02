# @rt-tools/store

[![npm](https://img.shields.io/npm/v/@rt-tools/store?color=c00)](https://www.npmjs.com/package/@rt-tools/store)
[![Angular](https://img.shields.io/badge/Angular-22%2B-dd0031?logo=angular&logoColor=white)](https://angular.dev)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE)

Signal-based state management for Angular with a message bus and Redux DevTools support. Part of
the [rt-tools](https://github.com/Eyhenij/rt-tools) workspace.

## Installation

```bash
npm install @rt-tools/store @rt-tools/core
# or
pnpm add @rt-tools/store @rt-tools/core
```

## Features

### BaseStoreService

Synchronous state management with Angular Signals.

```typescript
import { Injectable } from '@angular/core';
import { BaseStoreService, IStoreConfig } from '@rt-tools/store';

interface CounterState {
    count: number;
}

type CounterAction = 'INCREMENT' | 'DECREMENT';

@Injectable({ providedIn: 'root' })
export class CounterStore extends BaseStoreService<CounterState, CounterAction> {
    constructor() {
        super({ count: 0 }, { name: 'CounterStore', devTools: true });
    }

    increment(): void {
        this.patchState(state => ({ ...state, count: state.count + 1 }), 'increment');
    }

    decrement(): void {
        this.patchState(state => ({ ...state, count: state.count - 1 }), 'decrement');
    }
}
```

### BaseAsyncStoreService

Extended store for async operations with loading states.

```typescript
import { Injectable } from '@angular/core';
import { BaseAsyncStoreService, BASE_INITIAL_STATE, IStateBase } from '@rt-tools/store';

interface UsersState extends IStateBase.Async {
    users: User[];
}

const INITIAL_STATE: UsersState = {
    ...BASE_INITIAL_STATE.ASYNC,
    users: [],
};

@Injectable({ providedIn: 'root' })
export class UsersStore extends BaseAsyncStoreService<UsersState, string> {
    constructor() {
        super(INITIAL_STATE, { name: 'UsersStore', devTools: true });
    }

    loadUsers(): void {
        this.startLoading();
        this.http.get<User[]>('/api/users').pipe(
            tap(users => {
                this.patchState(s => ({ ...s, users }), 'setUsers');
                this.setLoadingSuccess();
            }),
            catchError(error => this.setLoadingFailure(error))
        ).subscribe();
    }
}
```

#### Typing the failure

The failure methods (`handleError`, `set*Failure`, `set*FailureVoid`) carry whatever the transport
reports as an error. The store never inspects it, so the third type parameter defaults to `unknown`
and the base class stays independent of the transport.

Declare it to get a typed failure argument:

```typescript
interface TransportFailure {
    code: number;
    reason: string;
}

@Injectable({ providedIn: 'root' })
export class UsersStore extends BaseAsyncStoreService<UsersState, string, TransportFailure> {
    // handleError(error?: TransportFailure, callbackFn?: () => void): void
    // setLoadingFailure(error: TransportFailure, config?: ISetPropertiesConfig): Observable<never>
}
```

The failure is rethrown untouched by `set*Failure`, so downstream `catchError` receives the original
object.

### Selectors

```typescript
// In component
readonly loading = this.store.loading;
readonly users = computed(() => this.store.store().users);

// Template
@if (loading()) {
    <spinner />
} @else {
    @for (user of users(); track user.id) {
        <user-card [user]="user" />
    }
}
```

### Redux DevTools

Enable DevTools in config:

```typescript
super(INITIAL_STATE, {
    name: 'MyStore',
    devTools: true  // or { maxAge: 100, trace: true }
});
```

## Requirements

- Angular `^22.0.0`
- `@rt-tools/core` `^0.0.5`
- RxJS `^7.8.0`

## License

[Apache-2.0](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE) © Yauheni Krumin
