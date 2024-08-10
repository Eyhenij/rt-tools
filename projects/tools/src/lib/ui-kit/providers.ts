import { Provider } from '@angular/core';

import { RtAsideService } from './aside';

/**
 * Returns a set of the necessary dependency injection providers for managing the UI.
 *
 * ```typescript
 * bootstrapApplication(RootComponent, {
 *   providers: [
 *     provideRtUi()
 *   ]
 * });
 * ```
 *
 * @publicApi
 */
export function provideRtUi(): Provider[] {
    return [RtAsideService];
}
