import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { IDevToolsGlobalConfig, STORE_DEVTOOLS_CONFIG } from '../interfaces';
import { DevToolsManagerService } from '../services';

/**
 * @description Provides global DevTools configuration for all stores.
 * This function must be called in the root providers to ensure a single DevToolsManagerService
 * instance is shared across all lazy-loaded modules.
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
export function provideStoreDevTools(config: IDevToolsGlobalConfig): EnvironmentProviders {
    return makeEnvironmentProviders([{ provide: STORE_DEVTOOLS_CONFIG, useValue: config }, DevToolsManagerService]);
}
