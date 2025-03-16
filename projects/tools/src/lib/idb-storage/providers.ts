import { Provider } from '@angular/core';

import { iDBStorageFactory } from './idb-storage.factory';
import { IDBStorageService } from './idb-storage-service';
import { IDB_STORAGE_SERVICE_TOKEN } from './token/idb-storage.token';

/**
 * Returns the set of dependency-injection providers
 * required to set up storages in an application.
 *
 * @usageNotes
 *
 * This function sets up the essential storage services needed for
 * working with `idb storage` solution.
 * It includes providers for each type of storage, ensuring that the appropriate
 * storage service is injected based on the platform or specific use case.
 *
 * ```typescript
 * bootstrapApplication(RootComponent, {
 *   providers: [
 *     provideRtIDBStorage()
 *   ]
 * });
 * ```
 *
 * @publicApi
 */
export function provideRtIDBStorage(): Provider[] {
    return [
        {
            provide: IDB_STORAGE_SERVICE_TOKEN,
            useFactory: iDBStorageFactory,
        },
        IDBStorageService,
    ];
}
