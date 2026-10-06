import { ComponentFixture } from '@angular/core/testing';

import { kcContextOf, kcNode, renderKcPage } from '../testing/kc-page-fixture';
import { kitTranslatorFor } from './kc-kit-labels';
import { RtKcLoginComponent } from './pages/login/rt-kc-login.component';

describe('the kit labels of the theme', () => {
    it('SC-AUTH-24 — the kit labels follow the page locale', async () => {
        const fixture: ComponentFixture<RtKcLoginComponent> = await renderKcPage(
            RtKcLoginComponent,
            kcContextOf('login.ftl', {
                locale: { currentLanguageTag: 'ru', supported: [{ languageTag: 'ru', label: 'русский', url: '/ru' }] },
            })
        );
        const toggle: HTMLElement | null = kcNode(fixture, 'kc-password')?.querySelector('[qa-dataid="input-password-toggle"]') ?? null;

        expect(toggle?.getAttribute('aria-label')).toBe('Показать пароль');
        expect(kcNode(fixture, 'kc-title')?.textContent?.trim()).toBe('Вход в учетную запись');
    });

    it('SC-AUTH-24 — a locale without its own labels takes the English of the kit', () => {
        expect(kitTranslatorFor('de')('uiShowPassword')).toBe('');
        expect(kitTranslatorFor('ru')('uiShowPassword')).toBe('Показать пароль');
    });
});
