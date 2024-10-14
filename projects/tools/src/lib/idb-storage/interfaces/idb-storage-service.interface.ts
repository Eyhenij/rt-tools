import { Observable } from 'rxjs';

/**
 * Abstract StorageService class for interacting with a storage system.
 * Uses Observable to handle asynchronous operations.
 */
export interface IIDBStorageServiceInterface<T> {
    /**
     * Retrieves a value from storage by the given key.
     * @param key - The key to retrieve the value.
     * @returns An Observable that emits the value of type T or undefined if the key does not exist.
     */
    get(key: string): Observable<T | T[] | undefined>;

    /**
     * Saves a value in storage under the specified key.
     * @param key - The key to store the value under.
     * @param value - The value to be stored.
     * @returns An Observable that completes once the value is successfully saved.
     */
    set(key: string, value: T | T[]): Observable<void>;

    /**
     * Removes a value from storage by the specified key.
     * @param key - The key to remove the value from.
     * @returns An Observable that completes once the value is successfully removed.
     */
    remove(key: string): Observable<void>;
}
