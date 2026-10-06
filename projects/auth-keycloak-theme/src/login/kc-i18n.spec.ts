import { backLinkText, plainMessage } from './kc-i18n';

describe('plainMessage', () => {
    it('SC-AUTH-54 — an HTML entity of a Keycloak message becomes its character', () => {
        expect(plainMessage('&laquo; Назад ко входу')).toBe('« Назад ко входу');
        expect(plainMessage('Next &raquo;')).toBe('Next »');
    });

    it('SC-AUTH-54 — markup of a message is not inserted: only its text stays', () => {
        expect(plainMessage('<b>Bold</b> &amp; plain')).toBe('Bold & plain');
    });

    it('SC-AUTH-54 — a message without entities stays as it is', () => {
        expect(plainMessage('Sign in')).toBe('Sign in');
    });
});

describe('backLinkText', () => {
    it('SC-AUTH-65 — a link back is plain text without a chevron', () => {
        expect(backLinkText(plainMessage('&laquo; Back to Login'))).toBe('Back to Login');
        expect(backLinkText('« Назад ко входу')).toBe('Назад ко входу');
        expect(backLinkText('Back to Application')).toBe('Back to Application');
    });
});
