import { ComponentFixture } from '@angular/core/testing';

import { kcContextOf, kcNode, renderKcPage } from '../../testing/kc-page-fixture';
import { RtKcLoginComponent } from '../pages/login/rt-kc-login.component';
import { RtKcRootComponent } from './rt-kc-root.component';

describe('RtKcRootComponent', () => {
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
});
