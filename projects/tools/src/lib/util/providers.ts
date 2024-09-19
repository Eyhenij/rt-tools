import { Provider } from '@angular/core';

import { RtSnackBarService } from '../ui-kit/snack-bar';
import { BreakpointService, PlatformService } from './services';

/**
 * Returns a set of dependency injection providers for utility services.
 *
 * @usageNotes
 *
 * This function provides utility services that are commonly used across
 * an Angular application. Specifically, it provides the `BreakpointService`
 * for managing responsive design breakpoints and the `PlatformService` for
 * detecting the platform on which the application is running (e.g., browser or server).
 *
 * ```typescript
 * bootstrapApplication(RootComponent, {
 *   providers: [
 *     provideRtUtils()
 *   ]
 * });
 * ```
 *
 * @publicApi
 */
export function provideRtUtils(): Provider[] {
    return [BreakpointService, PlatformService, RtSnackBarService];
}
