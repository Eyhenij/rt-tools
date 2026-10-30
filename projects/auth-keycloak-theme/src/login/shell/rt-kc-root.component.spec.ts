import { ComponentFixture, TestBed } from '@angular/core/testing';

import { kcContextOf, kcNode, renderKcPage } from '../../testing/kc-page-fixture';
import { RtKcLoginComponent } from '../pages/login/rt-kc-login.component';
import { RtKcRegisterComponent } from '../pages/register/rt-kc-register.component';
import { RtKcRootComponent } from './rt-kc-root.component';

describe('RtKcRootComponent', () => {
    it('SC-AUTH-64 — the language list and the theme switch stand inside the card', async () => {
        const fixture: ComponentFixture<RtKcRootComponent> = await renderKcPage(
            RtKcRootComponent,
            kcContextOf('login.ftl'),
            RtKcLoginComponent
        );
        const chrome: HTMLElement | null = kcNode(fixture, 'kc-chrome');
        const card: HTMLElement | null = kcNode(fixture, 'kc-card');

        expect(card).not.toBeNull();
        expect(chrome?.parentElement).toBe(card);
        expect(chrome?.querySelector('rt-theme-toggle')).not.toBeNull();
    });

    it('SC-AUTH-61 — the dot field stands behind the card', async () => {
        const fixture: ComponentFixture<RtKcRootComponent> = await renderKcPage(
            RtKcRootComponent,
            kcContextOf('login.ftl'),
            RtKcLoginComponent
        );
        const field: HTMLElement | null = kcNode(fixture, 'kc-dot-field');
        const card: HTMLElement | null = kcNode(fixture, 'kc-card');

        expect(field?.tagName.toLowerCase()).toBe('rt-dot-field');
        expect(card).not.toBeNull();
        expect(field?.parentElement).toBe(card?.parentElement);
    });

    it('SC-AUTH-57 — the language is chosen from a drop-down list, not a row of buttons', async () => {
        const fixture: ComponentFixture<RtKcRootComponent> = await renderKcPage(
            RtKcRootComponent,
            kcContextOf('login.ftl', {
                locale: {
                    currentLanguageTag: 'en',
                    supported: [
                        { languageTag: 'en', label: 'English', url: '/login?kc_locale=en' },
                        { languageTag: 'ru', label: 'Русский', url: '/login?kc_locale=ru' },
                    ],
                },
            }),
            RtKcLoginComponent
        );
        const chooser: HTMLElement | null = kcNode(fixture, 'kc-locales');

        expect(chooser?.tagName.toLowerCase()).toBe('rt-select');
        expect((fixture.nativeElement as HTMLElement).querySelectorAll('[qa-dataid="kc-locale"]').length).toBe(0);
    });
    it('SC-AUTH-83 — the card head shows the realm logo, or the realm name without one', async () => {
        const plain: ReturnType<typeof kcContextOf<'login.ftl'>> = kcContextOf('login.ftl');
        const branded: ReturnType<typeof kcContextOf<'login.ftl'>> = kcContextOf('login.ftl');
        Object.assign(branded, { realm: { ...branded.realm, displayNameHtml: '<img src="https://rt.localhost/logo.svg" alt="Rent">' } });
        const withLogo: ComponentFixture<RtKcRootComponent> = await renderKcPage(RtKcRootComponent, branded, RtKcLoginComponent);
        const logo: HTMLImageElement | null = kcNode<HTMLImageElement>(withLogo, 'kc-logo');

        expect(logo?.getAttribute('src')).toBe('https://rt.localhost/logo.svg');
        expect(logo?.getAttribute('alt')).toBe('Rent');
        expect(kcNode(withLogo, 'kc-brand')).toBeNull();

        TestBed.resetTestingModule();
        Object.assign(plain, { realm: { ...plain.realm, displayNameHtml: 'Rent' } });
        const withName: ComponentFixture<RtKcRootComponent> = await renderKcPage(RtKcRootComponent, plain, RtKcLoginComponent);

        expect(kcNode(withName, 'kc-logo')).toBeNull();
        expect(kcNode(withName, 'kc-brand')?.textContent).toBe(plain.realm.displayName || plain.realm.name);
    });

    it('SC-AUTH-87 — the frame loads the scripts Keycloak lists for the page, after the page content', async () => {
        const address: string = 'https://www.google.com/recaptcha/api.js?hl=en';
        const context: ReturnType<typeof kcContextOf<'register.ftl'>> = kcContextOf('register.ftl');
        Object.assign(context, { scripts: [address], recaptchaRequired: true, recaptchaVisible: true, recaptchaSiteKey: 'site-key' });
        let widgetOnLoad: boolean = false;
        const append: jest.SpyInstance = jest
            .spyOn(document.head, 'appendChild')
            .mockImplementation(<NODE extends Node>(node: NODE): NODE => {
                widgetOnLoad = document.querySelector('[qa-dataid="kc-recaptcha"]') !== null;

                return HTMLElement.prototype.appendChild.call(document.head, node) as NODE;
            });
        await renderKcPage(RtKcRootComponent, context, RtKcRegisterComponent);
        const added: HTMLScriptElement[] = Array.from(document.scripts).filter(
            (script: HTMLScriptElement): boolean => script.getAttribute('src') === address
        );
        append.mockRestore();
        added.forEach((script: HTMLScriptElement): void => script.remove());

        expect(added.length).toBe(1);
        expect(widgetOnLoad).toBe(true);
    });
});
