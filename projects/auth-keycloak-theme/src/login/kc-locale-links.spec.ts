import { kcContextOf } from '../testing/kc-page-fixture';
import { TKcPageContext } from './kc-context';
import { withLocale, withLocaleLinks } from './kc-locale-links';

describe('withLocaleLinks', () => {
    it('SC-AUTH-98 — the links between the entry pages carry the language of the page', () => {
        const context: TKcPageContext<'login.ftl'> = kcContextOf('login.ftl');

        const linked: TKcPageContext<'login.ftl'> = withLocaleLinks(context, 'ru') as TKcPageContext<'login.ftl'>;

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

    it('SC-AUTH-98 — a link keeps its own parameters and replaces a former language', () => {
        expect(withLocale('/realms/rt/login-actions/registration?client_id=admin&kc_locale=en', 'ru')).toBe(
            '/realms/rt/login-actions/registration?client_id=admin&kc_locale=ru'
        );
        expect(withLocale('https://auth.example.com/realms/rt/protocol/openid-connect/auth?client_id=admin', 'de')).toBe(
            'https://auth.example.com/realms/rt/protocol/openid-connect/auth?client_id=admin&kc_locale=de'
        );
    });
});
