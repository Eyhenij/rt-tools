import { Injectable } from '@angular/core';

/**
 * A service that implements the `Storage` interface using an in-memory map.
 * This service provides a fallback storage solution when `localStorage`
 * or `sessionStorage` is not available, such as in server-side rendering (SSR) scenarios.
 *
 * @Injectable
 */
@Injectable()
export class InMemoryStorageService implements Storage {
    /**
     * Private in-memory storage map used to store key-value pairs.
     * The keys are strings, the values are strings.
     * The map is private and cannot be accessed directly.
     * Instead, the public methods of the service should be used to interact with the storage.
     * The map is initialized as an empty map.
     *
     * @type {Map<string, string>}
     * @private
     * @internal
     * @readonly
     */
    readonly #storage: Map<string, string> = new Map<string, string>();

    /**
     * Returns the number of key-value pairs currently stored.
     *
     * @returns the number of items in storage
     * @public
     */
    public get length(): number {
        return this.#storage.size;
    }

    /**
     * Retrieves the value associated with the given key.
     *
     * @param key - The name of the key to retrieve the value for
     * @returns the value associated with the key, or `null` if the key does not exist
     * @public
     * @returns string | null
     */
    public getItem(key: string): string | null {
        return this.#storage.get(key) || null;
    }

    /**
     * Adds or updates the key-value pair in the storage.
     *
     * @param key - The name of the key to create or update
     * @param data - The value to associate with the key
     * @public
     * @returns void
     */
    public setItem(key: string, data: string): void {
        this.#storage.set(key, data);
    }

    /**
     * Retrieves the key at the specified index.
     *
     * @param index - The index of the key to retrieve
     * @returns the key at the specified index, or `null` if the index is out of bounds
     * @public
     * @returns string | null
     */
    public key(index: number): string | null {
        return Array.from(this.#storage.keys())[index] || null;
    }

    /**
     * Removes the key-value pair associated with the given key.
     *
     * @param key - The name of the key to remove
     * @public
     * @returns void
     */
    public removeItem(key: string): void {
        this.#storage.delete(key);
    }

    /**
     * Clears all key-value pairs from the storage.
     *
     * @public
     * @returns void
     */
    public clear(): void {
        this.#storage.clear();
    }
}
