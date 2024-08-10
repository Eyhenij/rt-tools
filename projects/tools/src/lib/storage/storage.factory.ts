import { inject } from '@angular/core';

import { PlatformService } from '../util';
import { Nullable } from '../util/interfaces/nullable.type';
import { InMemoryStorageService } from './in-memory-storage.service';

/**
 * Factory for creating or returning `localStorage`.
 * Returns `localStorage` global object if the application is running in a browser,
 * otherwise returns null.
 *
 * @returns localStorage or null
 */
export function localStorageFactory(): Nullable<Storage> {
    return inject(PlatformService).isPlatformBrowser ? localStorage : null;
}

/**
 * Factory for creating or returning `sessionStorage`.
 * Returns `sessionStorage` global object if the application is running in a browser,
 * otherwise returns null.
 *
 * @returns sessionStorage or null
 */
export function sessionStorageFactory(): Nullable<Storage> {
    return inject(PlatformService).isPlatformBrowser ? sessionStorage : null;
}

/**
 * Factory for creating `InMemoryStorageService`.
 * Returns a new instance of InMemoryStorageService.
 *
 * @returns a new instance of InMemoryStorageService
 */
export function inMemoryStorageFactory(): Storage {
    return new InMemoryStorageService();
}
