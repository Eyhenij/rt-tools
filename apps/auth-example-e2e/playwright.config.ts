import { defineConfig, devices } from '@playwright/test';

import { ADMIN_ORIGIN } from './stand/stand.mjs';

/**
 * The end-to-end suite of the entry module: a person goes through the example admin, Keycloak and
 * the example server on the stand.
 *
 * The suite takes no frames: it checks the entry, the session and the rights, not the look. So it
 * runs the browser of the machine, as the probes of the showcases do, and needs no browser image.
 *
 * One worker and no retries: the people of the stand are shared by every spec, and a failed test
 * here means a broken promise, not a busy machine.
 */
export default defineConfig({
    testDir: './src',
    fullyParallel: false,
    forbidOnly: Boolean(process.env['CI']),
    retries: 0,
    workers: 1,
    reporter: [['list']],
    timeout: 90_000,
    expect: { timeout: 15_000 },
    use: {
        baseURL: ADMIN_ORIGIN,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        locale: 'en-US',
        // The check anchor of the tree: `getByTestId` finds elements by it
        testIdAttribute: 'qa-dataid',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'node apps/auth-example-e2e/stand/up.mjs',
        url: ADMIN_ORIGIN,
        cwd: '../..',
        // Raised on every run: a stand of another branch would answer with its own builds and people
        reuseExistingServer: false,
        // Keycloak with its theme and both production builds take a few minutes on a cold cache
        timeout: 600_000,
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
