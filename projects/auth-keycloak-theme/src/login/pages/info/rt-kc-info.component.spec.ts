import { ComponentFixture } from '@angular/core/testing';

import { kcContextOf, renderKcPage } from '../../../testing/kc-page-fixture';
import { TKcPageContext } from '../../kc-context';
import { RtKcInfoComponent } from './rt-kc-info.component';

function nextLinkOf(fixture: ComponentFixture<RtKcInfoComponent>): HTMLAnchorElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>('[qa-dataid="kc-info-next"]');
}

describe('RtKcInfoComponent', () => {
    it('SC-AUTH-99 — a page that names no next step leads to the sign-in', async () => {
        const context: TKcPageContext<'info.ftl'> = kcContextOf('info.ftl', {
            messageHeader: undefined,
            message: { type: 'info', summary: 'Your email address has been verified.' },
            skipLink: false,
            pageRedirectUri: undefined,
            actionUri: undefined,
            client: { clientId: 'admin', baseUrl: undefined, attributes: {} },
        });

        const link: HTMLAnchorElement | null = nextLinkOf(await renderKcPage(RtKcInfoComponent, context));

        expect(link).not.toBeNull();
        expect(link?.getAttribute('href')).toBe(context.url.loginUrl);
        expect(link?.textContent?.trim() || link?.getAttribute('aria-label')).toBe('Back to Login');
    });

    it('SC-AUTH-99 — a page with a next step keeps it, and a page told to skip the link has none', async () => {
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
