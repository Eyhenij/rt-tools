import { InjectionToken, Provider } from '@angular/core';

import { IDevToolsConfig } from '../interfaces/devtools.interface';

export interface IDevToolsGlobalConfig extends IDevToolsConfig {
    /** Enable DevTools globally (default: false) */
    enabled: boolean;
}

export const STORE_DEVTOOLS_CONFIG: InjectionToken<IDevToolsGlobalConfig> = new InjectionToken<IDevToolsGlobalConfig>(
    'Global configuration for store DevTools integration'
);

/**
 * @description Provides global DevTools configuration for all stores.
 * @example
 * ```typescript
 * // app.config.ts
 * import { provideStoreDevTools } from '@rt-tools/store';
 * import { isDevMode } from '@angular/core';
 *
 * export const appConfig: ApplicationConfig = {
 *     providers: [
 *         provideStoreDevTools({
 *             enabled: isDevMode(),
 *             maxAge: 25,
 *             trace: true,
 *         }),
 *     ],
 * };
 * ```
 */
export function provideStoreDevTools(config: IDevToolsGlobalConfig): Provider {
    return {
        provide: STORE_DEVTOOLS_CONFIG,
        useValue: config,
    };
}
