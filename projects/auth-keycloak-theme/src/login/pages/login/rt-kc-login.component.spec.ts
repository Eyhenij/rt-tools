import { ComponentFixture } from '@angular/core/testing';

import { IKcSubmitted, kcContextOf, kcNode, renderKcPage, submitForm, typeInto } from '../../../testing/kc-page-fixture';
import { RtKcLoginComponent } from './rt-kc-login.component';

describe('RtKcLoginComponent', () => {
    it('SC-AUTH-19 — the login form is sent with the standard field names', async () => {
        const fixture: ComponentFixture<RtKcLoginComponent> = await renderKcPage(
            RtKcLoginComponent,
            kcContextOf('login.ftl', { url: { loginAction: 'http://kc/login-action' }, auth: { selectedCredential: 'cred-1' } })
        );
        await typeInto(fixture, 'kc-username', 'ann@rt.localhost');
        await typeInto(fixture, 'kc-password', 'secret');

        const submitted: IKcSubmitted = await submitForm(fixture, 'kc-login-form');

        expect(submitted.sent).toBe(true);
        expect(submitted.action).toBe('http://kc/login-action');
        expect(submitted.fields).toEqual({ username: 'ann@rt.localhost', password: 'secret', credentialId: 'cred-1' });
    });

    it('SC-AUTH-20 — an empty required field stops the form', async () => {
        const fixture: ComponentFixture<RtKcLoginComponent> = await renderKcPage(RtKcLoginComponent, kcContextOf('login.ftl'));
        await typeInto(fixture, 'kc-username', 'ann@rt.localhost');

        const submitted: IKcSubmitted = await submitForm(fixture, 'kc-login-form');
        const error: string | undefined = kcNode(fixture, 'kc-password')
            ?.closest('rt-field')
            ?.querySelector('[qa-dataid="field-error"]')?.textContent;

        expect(submitted.sent).toBe(false);
        expect(error?.trim()).toBe('Please specify password.');
    });

    it('SC-AUTH-55 — every field keeps the line for its error before an error appears', async () => {
        const fixture: ComponentFixture<RtKcLoginComponent> = await renderKcPage(RtKcLoginComponent, kcContextOf('login.ftl'));
        const fields: HTMLElement[] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('rt-field'));

        expect(fields.length).toBe(2);
        expect(fields.map((field: HTMLElement): boolean => field.querySelector('.rt-field__messages--reserved') !== null)).toEqual([
            true,
            true,
        ]);
    });

    it('SC-AUTH-56 — the fields and the submit button are of the large size', async () => {
        const fixture: ComponentFixture<RtKcLoginComponent> = await renderKcPage(RtKcLoginComponent, kcContextOf('login.ftl'));
        const submit: HTMLElement | null = kcNode(fixture, 'kc-login-submit');

        expect(kcNode(fixture, 'kc-username')?.classList.contains('rt-input--size--lg')).toBe(true);
        expect(kcNode(fixture, 'kc-password')?.classList.contains('rt-input--size--lg')).toBe(true);
        expect(submit?.className).toContain('lg');
    });

    it('SC-AUTH-59 — an empty field shows its name as a placeholder', async () => {
        const fixture: ComponentFixture<RtKcLoginComponent> = await renderKcPage(RtKcLoginComponent, kcContextOf('login.ftl'));
        const placeholders: (string | null | undefined)[] = ['kc-username', 'kc-password'].map(
            (anchor: string): string | null | undefined => kcNode(fixture, anchor)?.querySelector('input')?.getAttribute('placeholder')
        );

        expect(placeholders).toEqual(['Username or email', 'Password']);
    });

    it('SC-AUTH-22 — a Keycloak message stands above the form in the colour of its kind', async () => {
        const fixture: ComponentFixture<RtKcLoginComponent> = await renderKcPage(
            RtKcLoginComponent,
            kcContextOf('login.ftl', { message: { type: 'error', summary: 'Invalid username or password.' } })
        );
        const message: HTMLElement | null = kcNode(fixture, 'kc-message');
        const form: HTMLElement | null = kcNode(fixture, 'kc-login-form');

        expect(message?.textContent?.trim()).toBe('Invalid username or password.');
        expect(
            message?.classList.contains('rt-message--severity--danger') || message?.querySelector('.rt-message--severity--danger') !== null
        ).toBe(true);
        expect(message?.closest('rt-kc-message')?.nextElementSibling).toBe(form);
    });

    it('SC-AUTH-23 — every provider gets a button with its icon', async () => {
        const fixture: ComponentFixture<RtKcLoginComponent> = await renderKcPage(
            RtKcLoginComponent,
            kcContextOf('login.ftl', {
                social: {
                    displayInfo: true,
                    providers: [
                        { alias: 'google', providerId: 'google', displayName: 'Google', loginUrl: '/broker/google' },
                        { alias: 'apple', providerId: 'apple', displayName: 'Apple', loginUrl: '/broker/apple' },
                        { alias: 'corp', providerId: 'oidc', displayName: 'Corp SSO', loginUrl: '/broker/corp' },
                    ],
                },
            })
        );
        const buttons: HTMLAnchorElement[] = Array.from(
            (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('[qa-dataid="kc-provider"]')
        );

        expect(buttons.map((button: HTMLAnchorElement): string | null => button.getAttribute('href'))).toEqual([
            '/broker/google',
            '/broker/apple',
            '/broker/corp',
        ]);
        expect(buttons.map((button: HTMLAnchorElement): boolean => button.querySelector('.rt-button__icon') !== null)).toEqual([
            true,
            true,
            false,
        ]);
    });
});
