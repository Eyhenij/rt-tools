import { Injectable, inject } from '@angular/core';

import { PlatformService } from './platform.service';

/**
 * @description Timezone reported where the reader's own is not knowable.
 *
 * An empty string or a nullish answer would make every caller write its own fallback branch, and
 * those branches drift apart.
 */
export const FALLBACK_TIMEZONE: string = 'UTC';

/**
 * @description The timezone the reader's own system is set to.
 *
 * Only a browser can answer that. During server-side rendering the same call reports the timezone
 * of the machine running the server — an answer that looks genuine and lies silently: a difference
 * of a few hours is noticed only by the reader whose date slipped by a day. So the platform is
 * asked first, through `PlatformService` rather than by probing for a global, and off the browser
 * the service reports {@link FALLBACK_TIMEZONE} without asking the environment at all.
 *
 * The value is read on every call rather than resolved once: a reader travels, or fixes the system
 * setting, without reloading the tab.
 */
@Injectable({ providedIn: 'root' })
export class RtTimezoneService {
    readonly #platform: PlatformService = inject(PlatformService);

    public getCurrentTimezone(): string {
        if (!this.#platform.isPlatformBrowser) {
            return FALLBACK_TIMEZONE;
        }

        return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIMEZONE;
    }
}
