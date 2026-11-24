import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject, Service } from '@angular/core';

/**
 * A service for detecting the platform on which the application is running.
 * This service is useful for checking if the application is running in a browser
 * environment or on the server-side.
 */
@Service()
export class PlatformService {
    readonly #platformId: object = inject(PLATFORM_ID);
    public readonly isPlatformBrowser: boolean;

    constructor() {
        this.isPlatformBrowser = isPlatformBrowser(this.#platformId);
    }
}
