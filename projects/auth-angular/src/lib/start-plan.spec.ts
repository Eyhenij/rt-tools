import { TEST_CONFIG } from '../testing/keycloak-double';
import { CODE_EXCHANGE_TIMEOUT_MS, SILENT_CHECK_TIMEOUT_MS } from './auth.config';
import { IRtAuthStartPlan, startPlan } from './start-plan';

const BASE_URI: string = 'https://admin.test/';
const SILENT_PAGE: string = 'https://admin.test/silent-check-sso.html';

describe('startPlan', () => {
    it('SC-AUTH-97 — an address with the code answer of Keycloak starts the adapter without the silent check', () => {
        const plan: IRtAuthStartPlan = startPlan(TEST_CONFIG, BASE_URI, `${BASE_URI}records#state=s-1&session_state=k-1&code=c-1`);

        expect(plan.options).not.toHaveProperty('silentCheckSsoRedirectUri');
        expect(plan.options.onLoad).toBe('check-sso');
        expect(plan.options.pkceMethod).toBe('S256');
        expect(plan.options.checkLoginIframe).toBe(false);
    });

    it('SC-AUTH-98 — the exchange of the code waits by a limit of its own, longer than the silent check', () => {
        const answer: string = `${BASE_URI}#state=s-1&code=c-1`;

        expect(startPlan(TEST_CONFIG, BASE_URI, answer).limitMs).toBe(CODE_EXCHANGE_TIMEOUT_MS);
        expect(CODE_EXCHANGE_TIMEOUT_MS).toBeGreaterThan(SILENT_CHECK_TIMEOUT_MS);
        expect(startPlan({ ...TEST_CONFIG, codeExchangeTimeoutMs: 7 }, BASE_URI, answer).limitMs).toBe(7);
    });

    it('SC-AUTH-26 — an address without the code answer keeps the silent check and its limit', () => {
        const plain: IRtAuthStartPlan = startPlan(TEST_CONFIG, BASE_URI, `${BASE_URI}records`);
        const halfAnswer: IRtAuthStartPlan = startPlan(TEST_CONFIG, BASE_URI, `${BASE_URI}records#code=c-1`);

        expect(plain.options.silentCheckSsoRedirectUri).toBe(SILENT_PAGE);
        expect(plain.limitMs).toBe(SILENT_CHECK_TIMEOUT_MS);
        expect(halfAnswer.options.silentCheckSsoRedirectUri).toBe(SILENT_PAGE);
    });
});
