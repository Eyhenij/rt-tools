import { InjectionToken } from '@angular/core';

import { IDBStorageService } from '../idb-storage-service';

/**
 * Injection token for IDBStorageService.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const IDB_STORAGE_SERVICE_TOKEN: InjectionToken<IDBStorageService<any>> = new InjectionToken<IDBStorageService<any>>(
    'IDB_STORAGE_SERVICE_TOKEN'
);
