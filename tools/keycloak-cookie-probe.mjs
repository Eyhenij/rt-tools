/**
 * The cookie probe of the local Keycloak, held back on the return from the entry form: one helper
 * for every end-to-end suite of an admin, next to the seeding of the stand people.
 *
 * Keycloak checks 3rd-party cookies by a frame of its own before the silent check. A probe that
 * answers later than the five seconds the start waits for the silent check cut the exchange of the
 * code, and the admin sent the person back to the form. The helper makes that probe late on demand.
 */

/** Longer than the five seconds the start waits for the silent check: a probe this late cuts it. */
export const LATE_PROBE_MS = 6_000;

/**
 * Holds back the cookie probe of Keycloak once armed. Armed before the entry form is sent, it
 * covers exactly the return trip: the start of the page before the form is not touched.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{ arm: () => void, calls: () => number }>} `arm` makes every next probe late,
 *     `calls` counts the probes the page asked for since `arm`
 */
export async function lateCookieProbe(page) {
    let armed = false;
    let calls = 0;
    await page.route('**/3p-cookies/step1.html', async (route) => {
        if (armed) {
            calls += 1;
            await new Promise((resolve) => {
                setTimeout(resolve, LATE_PROBE_MS);
            });
        }
        await route.continue();
    });
    return {
        arm: () => {
            armed = true;
        },
        calls: () => calls,
    };
}
