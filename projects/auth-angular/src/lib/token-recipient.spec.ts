import { isTokenRecipient } from './token-recipient';

const BASE: string = 'https://admin.test/app/';

describe('isTokenRecipient', () => {
    it('SC-AUTH-28 — a path of the page origin takes its own segments only', () => {
        expect(isTokenRecipient('/api/orders', ['/api'], BASE)).toBe(true);
        expect(isTokenRecipient('/api', ['/api'], BASE)).toBe(true);
        expect(isTokenRecipient('/apis/orders', ['/api'], BASE)).toBe(false);
    });

    it('SC-AUTH-28 — another origin carries no token unless named', () => {
        expect(isTokenRecipient('https://api.test/v1/orders', ['/api'], BASE)).toBe(false);
        expect(isTokenRecipient('https://api.test/v1/orders', ['https://api.test'], BASE)).toBe(true);
        expect(isTokenRecipient('https://api.test.evil/v1', ['https://api.test'], BASE)).toBe(false);
    });
});
