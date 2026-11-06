import { ComponentFixture } from '@angular/core/testing';

import { kcContextOf, renderKcPage } from '../../../testing/kc-page-fixture';
import { TKcPageContext } from '../../kc-context';
import { withLocaleLinks } from '../../kc-locale-links';
import { RtKcInfoComponent } from './rt-kc-info.component';

function nextLinkOf(fixture: ComponentFixture<RtKcInfoComponent>): HTMLAnchorElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>('[qa-dataid="kc-info-next"]');
}

/** A message page that names neither the application nor a next step, with the given sign-in address. */
function deadEndOf(loginUrl: string): TKcPageContext<'info.ftl'> {
    const context: TKcPageContext<'info.ftl'> = kcContextOf('info.ftl', {
        messageHeader: undefined,
        message: { type: 'info', summary: 'Your email address has been verified.' },
        skipLink: false,
        pageRedirectUri: undefined,
        actionUri: undefined,
        client: { clientId: 'admin', baseUrl: undefined, attributes: {} },
    });

    return { ...context, url: { ...context.url, loginUrl } };
}

describe('RtKcInfoComponent', () => {
    it('SC-AUTH-99 — a page that names no next step leads to the sign-in of its entry, in the chosen language', async () => {
        const context: TKcPageContext<'info.ftl'> = deadEndOf('/realms/rt/login-actions/authenticate?client_id=admin&tab_id=t1');

        const linked: TKcPageContext<'info.ftl'> = withLocaleLinks(context, 'ru', true) as TKcPageContext<'info.ftl'>;
        const link: HTMLAnchorElement | null = nextLinkOf(await renderKcPage(RtKcInfoComponent, linked));

        expect(link).not.toBeNull();
        const href: URL = new URL(link?.getAttribute('href') ?? '', 'http://host');
        expect(href.pathname).toBe('/realms/rt/login-actions/authenticate');
        expect(href.searchParams.get('tab_id')).toBe('t1');
        expect(href.searchParams.get('kc_locale')).toBe('ru');
        expect(link?.textContent?.trim() || link?.getAttribute('aria-label')).toBe('Back to Login');
    });

    it('SC-AUTH-99 — a page outside an open entry draws no button back to the sign-in', async () => {
        const context: TKcPageContext<'info.ftl'> = deadEndOf('/realms/rt/login-actions/authenticate');

        expect(nextLinkOf(await renderKcPage(RtKcInfoComponent, context))).toBeNull();
    });

    it('SC-AUTH-99 — a page with a next step keeps it', async () => {
        const proceed: TKcPageContext<'info.ftl'> = kcContextOf('info.ftl', {
            skipLink: false,
            pageRedirectUri: undefined,
            actionUri: '/realms/rt/login-actions/action-token?key=k',
        });
        expect(nextLinkOf(await renderKcPage(RtKcInfoComponent, proceed))?.getAttribute('href')).toBe(
            '/realms/rt/login-actions/action-token?key=k'
        );
    });

    it('SC-AUTH-99 — a page told to skip the link draws none', async () => {
        const skipped: TKcPageContext<'info.ftl'> = kcContextOf('info.ftl', { skipLink: true });
        const fixture: ComponentFixture<RtKcInfoComponent> = await renderKcPage(RtKcInfoComponent, skipped);

        expect((fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="kc-title"]')).not.toBeNull();
        expect(nextLinkOf(fixture)).toBeNull();
    });
});
