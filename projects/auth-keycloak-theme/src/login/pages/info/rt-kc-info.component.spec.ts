import { ComponentFixture } from '@angular/core/testing';

import { kcContextOf, renderKcPage } from '../../../testing/kc-page-fixture';
import { TKcPageContext } from '../../kc-context';
import { RtKcInfoComponent } from './rt-kc-info.component';

function nextLinkOf(fixture: ComponentFixture<RtKcInfoComponent>): HTMLAnchorElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>('[qa-dataid="kc-info-next"]');
}

/**
 * The page Keycloak draws after an address is confirmed from a letter: the flow ran without an
 * entry, so it names no next step and tells the theme to skip the link.
 */
function confirmedOf(baseUrl: string | undefined): TKcPageContext<'info.ftl'> {
    return kcContextOf('info.ftl', {
        messageHeader: undefined,
        message: { type: 'info', summary: 'Your account has been updated.' },
        skipLink: true,
        pageRedirectUri: undefined,
        actionUri: undefined,
        client: { clientId: 'admin', baseUrl, attributes: {} },
    });
}

describe('RtKcInfoComponent', () => {
    it('SC-AUTH-99 — a page at the end of a flow without an entry leads back to the application', async () => {
        const link: HTMLAnchorElement | null = nextLinkOf(await renderKcPage(RtKcInfoComponent, confirmedOf('https://admin.example.com/')));

        expect(link?.getAttribute('href')).toBe('https://admin.example.com/');
        expect(link?.textContent?.trim() || link?.getAttribute('aria-label')).toBe('Back to Application');
    });

    it('SC-AUTH-99 — such a page never leads to the sign-in: outside an entry it opens an error page', async () => {
        const fixture: ComponentFixture<RtKcInfoComponent> = await renderKcPage(RtKcInfoComponent, confirmedOf(undefined));

        expect((fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="kc-title"]')).not.toBeNull();
        expect(nextLinkOf(fixture)).toBeNull();
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
});
