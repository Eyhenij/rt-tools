import { languageNameOf } from './kc-language-name';

describe('languageNameOf', () => {
    it('SC-AUTH-102 — every language is named by its own name with a capital letter', () => {
        expect(languageNameOf('ru', 'русский')).toBe('Русский');
        expect(languageNameOf('en', 'English')).toBe('English');
        expect(languageNameOf('hi', 'hi')).toBe('हिन्दी');
        expect(languageNameOf('ko', 'ko')).toBe('한국어');
        expect(languageNameOf('de', 'Deutsch')).toBe('Deutsch');
    });

    it('SC-AUTH-102 — a tag the browser does not know keeps the Keycloak name, capitalised', () => {
        expect(languageNameOf('zz-unknown', 'zzz')).toBe('Zzz');
    });
});
