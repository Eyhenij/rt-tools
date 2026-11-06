import { Page, Route } from '@playwright/test';

/** Longer than the five seconds the start waits for the silent check: a probe this late cuts it. */
export const LATE_PROBE_MS: number = 6_000;

/** The cookie probe of Keycloak held back from the moment the person sends the entry form. */
export interface ILateCookieProbe {
    /** From now on every probe answers late, as on a slow Keycloak. */
    arm(): void;
    /** How many probes the page asked for since `arm`. */
    readonly calls: () => number;
}

/**
 * Holds back the 3rd-party cookie probe of Keycloak once armed. Armed before the entry form is
 * sent, it covers exactly the return trip: the start of the page before the form is not touched.
 */
export async function lateCookieProbe(page: Page): Promise<ILateCookieProbe> {
    let armed: boolean = false;
    let calls: number = 0;
    await page.route('**/3p-cookies/step1.html', async (route: Route): Promise<void> => {
        if (armed) {
            calls += 1;
            await new Promise<void>((resolve: () => void): void => {
                setTimeout(resolve, LATE_PROBE_MS);
            });
        }
        await route.continue();
    });
    return {
        arm: (): void => {
            armed = true;
        },
        calls: (): number => calls,
    };
}
