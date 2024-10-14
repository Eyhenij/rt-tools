import { IDBStorageService } from './idb-storage-service';

/**
 * Factory for creating `IDBStorageService`.
 * Returns a new instance of IDBStorageService.
 *
 * @returns a new instance of IDBStorageService
 */
export function iDBStorageService(): IDBStorageService<Record<string, unknown>> {
    return new IDBStorageService();
}
