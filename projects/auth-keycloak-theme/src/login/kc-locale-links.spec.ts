import { kcContextOf } from '../testing/kc-page-fixture';
import { TKcPageContext } from './kc-context';
import { isLocaleChosen, withLocale, withLocaleLinks } from './kc-locale-links';

describe('withLocaleLinks', () => {
    it('SC-AUTH-98 — the links between the entry pages carry the language the person chose', () => {
        const context: TKcPageContext<'login.ftl'> = kcContextOf('login.ftl');

        const linked: TKcPageContext<'login.ftl'> = withLocaleLinks(context, 'ru', true) as TKcPageContext<'login.ftl'>;

        for (const href of [
            linked.url.registrationUrl,
            linked.url.loginUrl,
            linked.url.loginResetCredentialsUrl,
            linked.url.loginRestartFlowUrl,
        ]) {
            expect(new URL(href, 'http://host').searchParams.get('kc_locale')).toBe('ru');
        }
        // The form address is not a link: Keycloak takes the language of a post from the session.
        expect(linked.url.loginAction).toBe(context.url.loginAction);
    });

    it('SC-AUTH-98 — a language nobody chose leaves the links as they are', () => {
        const context: TKcPageContext<'login.ftl'> = kcContextOf('login.ftl');

        expect(withLocaleLinks(context, 'en', false)).toBe(context);
        expect(isLocaleChosen('?client_id=admin&ui_locales=en')).toBe(false);
        expect(isLocaleChosen('?client_id=admin&kc_locale=ru')).toBe(true);
    });

    it('SC-AUTH-98 — a link keeps its own parameters and replaces a former language', () => {
        expect(withLocale('/realms/rt/login-actions/registration?client_id=admin&kc_locale=en', 'ru')).toBe(
            '/realms/rt/login-actions/registration?client_id=admin&kc_locale=ru'
        );
        expect(withLocale('https://auth.example.com/realms/rt/protocol/openid-connect/auth?client_id=admin', 'de')).toBe(
            'https://auth.example.com/realms/rt/protocol/openid-connect/auth?client_id=admin&kc_locale=de'
        );
    });

    it('SC-AUTH-98 — the rest of a link stays as Keycloak wrote it', () => {
        expect(withLocale('/realms/rt/auth?scope=openid%20profile&redirect_uri=https://a.example/b#top', 'ru')).toBe(
            '/realms/rt/auth?scope=openid%20profile&redirect_uri=https://a.example/b&kc_locale=ru#top'
        );
        expect(withLocale('/realms/rt/login-actions/authenticate', 'zh-TW')).toBe('/realms/rt/login-actions/authenticate?kc_locale=zh-TW');
        expect(withLocale('#', 'ru')).toBe('?kc_locale=ru#');
    });
});
