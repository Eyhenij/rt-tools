import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

@Injectable()
export class PlatformService {
    readonly #platformId: object = inject(PLATFORM_ID);
    public readonly isPlatformBrowser: boolean;

    constructor() {
        this.isPlatformBrowser = isPlatformBrowser(this.#platformId);
    }
}
