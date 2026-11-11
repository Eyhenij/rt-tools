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

    it('SC-AUTH-102 — a tag the browser cannot read keeps the Keycloak name and draws the page', () => {
        expect(languageNameOf('pt_BR', 'português (Brasil)')).toBe('Português (Brasil)');
    });

    it('SC-AUTH-102 — Chinese is named by its script, not by the country', () => {
        expect(languageNameOf('zh-CN', '中文简体')).toBe('简体中文');
        expect(languageNameOf('zh-TW', '中文繁體')).toBe('繁體中文');
    });
});
