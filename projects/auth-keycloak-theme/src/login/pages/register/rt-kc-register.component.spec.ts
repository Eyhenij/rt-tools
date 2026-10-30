import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeService } from '@rt-tools/ui-kit-v2';

import { IRecaptchaApi, IRecaptchaParams } from '../../kc-recaptcha';
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

    it('SC-AUTH-88 — a visible reCAPTCHA stands right before the button and posts its answer with the form', async () => {
        const context: TRegisterContext = Object.assign(registerPage(), {
            recaptchaRequired: true,
            recaptchaVisible: true,
            recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UZPB09XzwthjWJrm',
            recaptchaAction: 'register',
        });
        const drawn: IRecaptchaParams[] = [];
        // The Google script draws the widget into the node it gets and puts its answer there.
        const api: IRecaptchaApi = {
            ready: (done: () => void): void => done(),
            render: (container: HTMLElement, params: IRecaptchaParams): number => {
                const answer: HTMLTextAreaElement = document.createElement('textarea');
                answer.name = 'g-recaptcha-response';
                answer.value = `token-${params.theme}`;
                container.appendChild(answer);
                drawn.push(params);

                return drawn.length;
            },
        };
        Reflect.set(window, 'grecaptcha', api);
        const fixture: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, context);
        const widget: HTMLElement | null = kcNode(fixture, 'kc-recaptcha');
        await typeInto(fixture, 'kc-email', 'ann@rt.localhost');
        await typeInto(fixture, 'kc-password', 'n3w-Pass!');
        await typeInto(fixture, 'kc-password-confirm', 'n3w-Pass!');
        const sent: IKcSubmitted = await submitForm(fixture, 'kc-register-form');
        Reflect.deleteProperty(window, 'grecaptcha');

        expect(drawn).toEqual([{ sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UZPB09XzwthjWJrm', theme: 'light', action: 'register' }]);
        expect(widget?.nextElementSibling).toBe(kcNode(fixture, 'kc-register-submit'));
        expect(sent.sent).toBe(true);
        expect(sent.fields['g-recaptcha-response']).toBe('token-light');
    });

    it('SC-AUTH-90 — the widget takes the scheme of the page theme and is drawn anew when it switches', async () => {
        const context: TRegisterContext = Object.assign(registerPage(), {
            recaptchaRequired: true,
            recaptchaVisible: true,
            recaptchaSiteKey: 'site-key',
        });
        const themes: string[] = [];
        const api: IRecaptchaApi = {
            ready: (done: () => void): void => done(),
            render: (container: HTMLElement, params: IRecaptchaParams): number => {
                const answer: HTMLTextAreaElement = document.createElement('textarea');
                answer.name = 'g-recaptcha-response';
                container.appendChild(answer);
                themes.push(params.theme);

                return themes.length;
            },
        };
        Reflect.set(window, 'grecaptcha', api);
        const fixture: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, context);
        TestBed.inject(ThemeService).setTheme('dark');
        await fixture.whenStable();
        const answers: number = kcNode(fixture, 'kc-recaptcha')?.querySelectorAll('textarea').length ?? 0;
        Reflect.deleteProperty(window, 'grecaptcha');

        expect(themes).toEqual(['light', 'dark']);
        expect(answers).toBe(1);
    });

    it('SC-AUTH-89 — no widget when the realm requires no reCAPTCHA or an invisible one', async () => {
        const none: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, registerPage());

        expect(kcNode(none, 'kc-register-submit')).not.toBeNull();
        expect(kcNode(none, 'kc-recaptcha')).toBeNull();

        TestBed.resetTestingModule();
        const invisible: TRegisterContext = Object.assign(registerPage(), {
            recaptchaRequired: true,
            recaptchaVisible: false,
            recaptchaSiteKey: 'site-key',
            recaptchaAction: 'register',
        });
        const hidden: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, invisible);

        expect(kcNode(hidden, 'kc-register-submit')).not.toBeNull();
        expect(kcNode(hidden, 'kc-recaptcha')).toBeNull();
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
