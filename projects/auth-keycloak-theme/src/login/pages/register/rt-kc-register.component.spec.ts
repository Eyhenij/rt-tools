import { ComponentFixture } from '@angular/core/testing';

import { IKcSubmitted, kcContextOf, kcNode, renderKcPage, submitForm, typeInto } from '../../../testing/kc-page-fixture';
import { RtKcRegisterComponent } from './rt-kc-register.component';

type TRegisterContext = ReturnType<typeof kcContextOf<'register.ftl'>>;

/** The registration page of a realm that uses the address as the login. */
function registerPage(): TRegisterContext {
    const context: TRegisterContext = kcContextOf('register.ftl', { url: { registrationAction: 'http://kc/register' } });

    return Object.assign(context, { realm: { ...context.realm, registrationEmailAsUsername: true } });
}

/** The text under a field of the page: its error or its hint. */
function fieldText(fixture: ComponentFixture<unknown>, anchor: string): string {
    return kcNode(fixture, anchor)?.closest('rt-field')?.textContent ?? '';
}

describe('RtKcRegisterComponent', () => {
    it('SC-AUTH-77 — the registration form posts the address and both passwords by their standard names', async () => {
        const fixture: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, registerPage());
        await typeInto(fixture, 'kc-email', 'ann@rt.localhost');
        await typeInto(fixture, 'kc-password', 'n3w-Pass!');
        await typeInto(fixture, 'kc-password-confirm', 'n3w-Pass!');
        const sent: IKcSubmitted = await submitForm(fixture, 'kc-register-form');

        expect(sent).toEqual({
            sent: true,
            action: 'http://kc/register',
            fields: { email: 'ann@rt.localhost', password: 'n3w-Pass!', 'password-confirm': 'n3w-Pass!' },
        });
    });

    it('SC-AUTH-78 — a wrong address and two different passwords hold the form', async () => {
        const fixture: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, registerPage());
        await typeInto(fixture, 'kc-email', 'ann');
        await typeInto(fixture, 'kc-password', 'n3w-Pass!');
        await typeInto(fixture, 'kc-password-confirm', 'other-Pass!');
        const sent: IKcSubmitted = await submitForm(fixture, 'kc-register-form');
        fixture.detectChanges();

        expect(sent.sent).toBe(false);
        expect(fieldText(fixture, 'kc-email')).toContain('Invalid email address.');
        expect(fieldText(fixture, 'kc-password-confirm')).toContain("Password confirmation doesn't match.");
    });

    it('SC-AUTH-79 — an error Keycloak put on the address stands under the address field', async () => {
        const context: TRegisterContext = registerPage();
        Object.assign(context, {
            messagesPerField: {
                ...context.messagesPerField,
                existsError: (...fields: string[]): boolean => fields.includes('email'),
                get: (field: string): string => (field === 'email' ? 'Email already exists.' : ''),
            },
        });
        const fixture: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, context);
        fixture.detectChanges();

        expect(fieldText(fixture, 'kc-email')).toContain('Email already exists.');
        expect(fieldText(fixture, 'kc-password')).not.toContain('Email already exists.');
    });

    it('SC-AUTH-80 — the requirements stand under the confirmation, the address requirement once', async () => {
        const context: TRegisterContext = Object.assign(registerPage(), {
            passwordPolicies: { length: 8, notUsername: true, notEmail: true },
        });
        const fixture: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, context);
        const list: HTMLElement | null = kcNode(fixture, 'kc-password-rules');
        const confirm: Element | null = kcNode(fixture, 'kc-password-confirm')?.closest('rt-field') ?? null;
        const lines: string[] = Array.from(list?.querySelectorAll('[qa-dataid="kc-password-rule"]') ?? []).map(
            (line: Element): string => line.textContent?.trim() ?? ''
        );

        expect(confirm?.nextElementSibling).toBe(list);
        expect(lines).toEqual(['Length: at least 8', 'Not the same as the email']);
    });

    it('SC-AUTH-81 — the page carries the provider buttons and the link back to the sign-in', async () => {
        const context: TRegisterContext = Object.assign(registerPage(), {
            social: {
                displayInfo: true,
                providers: [{ alias: 'google', providerId: 'google', displayName: 'Google', loginUrl: '/broker/google' }],
            },
        });
        context.url.loginUrl = 'http://kc/login';
        const fixture: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, context);
        const provider: HTMLAnchorElement | null = kcNode<HTMLAnchorElement>(fixture, 'kc-provider');
        const back: HTMLAnchorElement | null = kcNode<HTMLAnchorElement>(fixture, 'kc-back-to-login');

        expect(provider?.getAttribute('href')).toBe('/broker/google');
        expect(provider?.classList.contains('login__provider--google')).toBe(true);
        expect(back?.getAttribute('href')).toBe('http://kc/login');
        expect(back?.textContent?.trim()).toBe('Back to Login');
    });
});
