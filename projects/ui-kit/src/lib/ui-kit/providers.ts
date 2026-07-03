import { Provider } from '@angular/core';

import { RtActionBarService } from './action-bar';
import { RtAsideService } from './aside';
import { IRtUiConfig, RT_UI_CONFIG } from './config';

/**
 * Returns a set of the necessary dependency injection providers for managing the UI.
 *
 * Optionally accepts an application-wide {@link RT_UI_CONFIG UI configuration} with
 * global theme/design defaults and per-component settings:
 *
 * ```typescript
 * bootstrapApplication(RootComponent, {
 *   providers: [
 *     provideRtUi({
 *       global: { theme: 'auto', design: 'custom' },
 *       components: { button: { design: 'material' } },
 *     })
 *   ]
 * });
 * ```
 *
 * @publicApi
 */
export function provideRtUi(config?: IRtUiConfig.Config): Provider[] {
    return [RtAsideService, RtActionBarService, { provide: RT_UI_CONFIG, useValue: config ?? {} }];
}
