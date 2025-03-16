import { inject, Injectable } from '@angular/core';

import { PlatformService } from '../util';
import { Nullable } from '../util/interfaces/nullable.type';
import { STORAGE_TYPES_ENUM, StorageType } from './enums/storage-types.enum';
import { IStorageConfig } from './interfaces/storage-config';
import { JsonConverter } from './json-converter';
import { CUSTOM_STORAGE } from './tokens/custom-storage.token';
import { IN_MEMORY_STORAGE } from './tokens/in-memory-storage.token';
import { LOCAL_STORAGE } from './tokens/local-storage.token';
import { SESSION_STORAGE } from './tokens/session-storage.token';

const defaultStorageConfig: IStorageConfig = {
    ctx: STORAGE_TYPES_ENUM.LOCAL,
    storageRef: null,
    converter: new JsonConverter(),
};

/**
 * A service for managing data storage across different storage types,
 * including `localStorage`, `sessionStorage`, and an in-memory storage fallback.
 * The service supports custom storage types and data conversion through configurable converters.
 *
 * @Injectable
 */
@Injectable()
export class StorageService {
    readonly #platformService: PlatformService = inject(PlatformService);
    readonly #localStorageRef: Storage = inject(LOCAL_STORAGE);
    readonly #sessionStorageRef: Storage = inject(SESSION_STORAGE);
    readonly #inMemoryStorageRef: Storage = inject(IN_MEMORY_STORAGE);
    readonly #customStorageRef: Nullable<Storage> = inject(CUSTOM_STORAGE, { optional: true });

    /**
     * Retrieves an item from the specified storage context.
     *
     * @param key - The key of the item to retrieve.
     * @param config - Optional configuration for the storage context and data conversion.
     * @returns The retrieved item, converted from storage if a converter is provided, or `null` if the item does not exist.
     */
    public getItem<T>(key: string, config?: Partial<IStorageConfig>): Nullable<T> {
        const fullConfig: IStorageConfig = { ...defaultStorageConfig, ...config };
        const item: Nullable<T> = this.#storage(fullConfig.ctx)?.getItem(key) as T;
        return fullConfig.converter?.convertFrom(item) ?? item ?? null;
    }

    /**
     * Stores an item in the specified storage context.
     *
     * @param key - The key to associate with the stored item.
     * @param data - The data to store, which will be converted if a converter is provided.
     * @param config - Optional configuration for the storage context and data conversion.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public setItem(key: string, data: any, config?: Partial<IStorageConfig>): void {
        const fullConfig: IStorageConfig = { ...defaultStorageConfig, ...config };
        const parsedValue: string = fullConfig.converter?.convertTo(data) ?? data;
        this.#storage(fullConfig.ctx)?.setItem(key, parsedValue);
    }

    /**
     * Checks if a given key exists in the specified storage context.
     *
     * @param key - The key to check for.
     * @param ctx - The storage context to search in (local, session, or in-memory).
     * @returns `true` if the key exists, `false` otherwise.
     */
    public hasKey(key: string, ctx: Nullable<StorageType> = defaultStorageConfig.ctx): boolean {
        return Object.prototype.hasOwnProperty.call(this.#storage(ctx), key);
    }

    /**
     * Executes callback functions based on whether a key exists in the specified storage context.
     *
     * @param key - The key to check for.
     * @param onHas - The callback to execute if the key exists.
     * @param onHasNot - The optional callback to execute if the key does not exist.
     * @param config - Optional configuration for the storage context and data conversion.
     */
    public onHasKey<T>(key: string, onHas: (value: Nullable<T>) => void, onHasNot?: () => void, config?: Partial<IStorageConfig>): void {
        const fullConfig: IStorageConfig = { ...defaultStorageConfig, ...config };

        if (this.hasKey(key, fullConfig.ctx)) {
            onHas(this.getItem<T>(key, fullConfig));
        } else if (onHasNot !== void 0) {
            onHasNot();
        }
    }

    /**
     * Removes an item from the specified storage context.
     *
     * @param key - The key of the item to remove.
     * @param ctx - The storage context from which to remove the item.
     */
    public removeItem(key: string, ctx: Nullable<StorageType> = defaultStorageConfig.ctx): void {
        this.#storage(ctx)?.removeItem(key);
    }

    /**
     * Clears all items from the specified storage context.
     *
     * @param ctx - The storage context to clear.
     */
    public clear(ctx: Nullable<StorageType> = defaultStorageConfig.ctx): void {
        this.#storage(ctx)?.clear();
    }

    /**
     * Returns the appropriate storage reference based on the storage context and platform.
     *
     * @param ctx - The storage context to use (local, session, custom, or in-memory).
     * @returns The corresponding `Storage` object, or `null` if not available.
     */
    #storage(ctx: Nullable<StorageType>): Nullable<Storage> {
        if (this.#platformService.isPlatformBrowser) {
            switch (ctx) {
                case 'local':
                    return this.#localStorageRef;

                case 'session':
                    return this.#sessionStorageRef;

                case 'custom':
                    return this.#customStorageRef;
            }
        }

        /**
         * Fallback to in-memory storage when the platform is not a browser (e.g., SSR).
         */
        return this.#inMemoryStorageRef;
    }
}
