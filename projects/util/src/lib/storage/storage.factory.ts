import { inject } from '@angular/core';

import { Nullable } from '../interfaces';
import { PlatformService } from '../services';
import { InMemoryStorageService } from './in-memory-storage.service';

export function localStorageFactory(): Nullable<Storage> {
    return inject(PlatformService).isPlatformBrowser ? localStorage : null;
}

export function sessionStorageFactory(): Nullable<Storage> {
    return inject(PlatformService).isPlatformBrowser ? sessionStorage : null;
}

export function inMemoryStorageFactory(): Nullable<Storage> {
    return inject(PlatformService).isPlatformBrowser ? new InMemoryStorageService() : null;
}
