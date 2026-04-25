import { Provider } from '@angular/core';

import { InMemoryStorageService } from './in-memory-storage.service';
import { inMemoryStorageFactory, localStorageFactory, sessionStorageFactory } from './storage.factory';
import { StorageService } from './storage.service';
import { IN_MEMORY_STORAGE } from './tokens/in-memory-storage.token';
import { LOCAL_STORAGE } from './tokens/local-storage.token';
import { SESSION_STORAGE } from './tokens/session-storage.token';

/**
 * Returns the set of dependency-injection providers
 * required to setup storages in an application.
 *
 * @usageNotes
 *
 * This function sets up the essential storage services needed for
 * working with `localStorage`, `sessionStorage`, and an in-memory storage solution.
 * It includes providers for each type of storage, ensuring that the appropriate
 * storage service is injected based on the platform or specific use case.
 *
 * The function is particularly useful in scenarios where the application may be
 * running on the server-side (SSR). In such cases, instead of using `localStorage`
 * and `sessionStorage`, which are only available in the browser, the `InMemoryStorageService`
 * can be used as a fallback, ensuring that the application still functions correctly.
 *
 * ```typescript
 * bootstrapApplication(RootComponent, {
 *   providers: [
 *     provideRtStorage()
 *   ]
 * });
 * ```
 *
 * @publicApi
 */
export function provideRtStorage(): Provider[] {
    return [
        InMemoryStorageService,
        {
            provide: LOCAL_STORAGE,
            useFactory: localStorageFactory,
        },
        {
            provide: SESSION_STORAGE,
            useFactory: sessionStorageFactory,
        },
        {
            provide: IN_MEMORY_STORAGE,
            useFactory: inMemoryStorageFactory,
        },
        StorageService,
    ];
}
