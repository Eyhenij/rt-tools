# @rt-tools/store

Signal-based state management for Angular with Redux DevTools support.

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

- Angular 21+
- @rt-tools/core ^0.0.1
- RxJS 7.8+

## License

Apache-2.0
