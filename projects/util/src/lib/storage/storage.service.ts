import { inject, Injectable } from '@angular/core';

import { PlatformService } from '../services';
import { Nullable } from '../interfaces';

import { STORAGE_TYPES_ENUM, StorageType } from './enums/storage-types.enum';
import { IStorageConfig } from './interfaces/storage-config';

import { LOCAL_STORAGE } from './tokens/local-storage.token';
import { SESSION_STORAGE } from './tokens/session-storage.token';
import { IN_MEMORY_STORAGE } from './tokens/in-memory-storage.token';
import { CUSTOM_STORAGE } from './tokens/custom-storage.token';

import { JsonConverter } from './json-converter';


const defaultStorageConfig: IStorageConfig = {
    ctx: STORAGE_TYPES_ENUM.LOCAL,
    storageRef: null,
    converter: new JsonConverter(),
};

@Injectable()
export class StorageService {
    readonly #platformService: PlatformService = inject(PlatformService);
    readonly #localStorageRef: Storage = inject(LOCAL_STORAGE);
    readonly #sessionStorageRef: Storage = inject(SESSION_STORAGE);
    readonly #inMemoryStorageRef: Storage = inject(IN_MEMORY_STORAGE);
    readonly #customStorageRef: Nullable<Storage> = inject(CUSTOM_STORAGE, { optional: true });

    public getItem<T>(key: string, config?: Partial<IStorageConfig>): Nullable<T> {
        const fullConfig: IStorageConfig = { ...defaultStorageConfig, ...config };
        const item: Nullable<T> = this.#storage(fullConfig.ctx)?.getItem(key) as T;
        return fullConfig.converter?.convertFrom(item) ?? item ?? null;
    }

    public setItem(key: string, data: any, config?: Partial<IStorageConfig>): void {
        const fullConfig: IStorageConfig = { ...defaultStorageConfig, ...config };
        const parsedValue: string = fullConfig.converter?.convertTo(data) ?? data;
        this.#storage(fullConfig.ctx)?.setItem(key, parsedValue);
    }

    public hasKey(key: string, ctx: Nullable<StorageType> = defaultStorageConfig.ctx): boolean {
        return Object.prototype.hasOwnProperty.call(this.#storage(ctx), key);
    }

    public onHasKey<T>(
        key: string,
        onHas: (value: Nullable<T>) => void,
        onHasNot?: () => void,
        config?: Partial<IStorageConfig>,
    ): void {
        const fullConfig: IStorageConfig = { ...defaultStorageConfig, ...config }

        if (this.hasKey(key, fullConfig.ctx)) {
            onHas(this.getItem<T>(key, fullConfig));
        } else if (onHasNot !== void 0) {
            onHasNot();
        }
    }

    public removeItem(key: string, ctx: Nullable<StorageType> = defaultStorageConfig.ctx): void {
        this.#storage(ctx)?.removeItem(key);
    }

    public clear(ctx: Nullable<StorageType> = defaultStorageConfig.ctx): void {
        this.#storage(ctx)?.clear();
    }

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

        return this.#inMemoryStorageRef;
    }
}
