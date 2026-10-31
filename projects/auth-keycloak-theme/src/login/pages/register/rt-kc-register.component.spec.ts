import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeService } from '@rt-tools/ui-kit-v2';

import { ERecaptchaTheme, IRecaptchaApi, IRecaptchaParams } from '../../kc-recaptcha';
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

/** The registration page of a realm that requires a visible reCAPTCHA. */
function recaptchaPage(): TRegisterContext {
    return Object.assign(registerPage(), {
        recaptchaRequired: true,
        recaptchaVisible: true,
        recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UZPB09XzwthjWJrm',
        recaptchaAction: 'register',
    });
}

/**
 * The Google script, loaded: it draws an answer field into the node it gets and keeps the params of
 * every draw. `answer` is what the person's tick put into the widget.
 */
function fakeRecaptcha(answer: string = ''): { api: IRecaptchaApi; drawn: IRecaptchaParams[] } {
    const drawn: IRecaptchaParams[] = [];
    const api: IRecaptchaApi = {
        ready: (done: () => void): void => done(),
        render: (container: HTMLElement, params: IRecaptchaParams): number => {
            const field: HTMLTextAreaElement = document.createElement('textarea');
            field.name = 'g-recaptcha-response';
            field.value = `token-${params.theme}`;
            container.appendChild(field);
            drawn.push(params);

            return drawn.length;
        },
        getResponse: (): string => answer,
    };
    Reflect.set(window, 'grecaptcha', api);

    return { api, drawn };
}

describe('RtKcRegisterComponent', () => {
    afterEach(() => {
        Reflect.deleteProperty(window, 'grecaptcha');
        // The kit remembers a switched theme in the browser storage, and the next page would start dark.
        localStorage.clear();
    });

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
        const { drawn } = fakeRecaptcha();
        const fixture: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, recaptchaPage());
        const widget: HTMLElement | null = kcNode(fixture, 'kc-recaptcha');
        await typeInto(fixture, 'kc-email', 'ann@rt.localhost');
        await typeInto(fixture, 'kc-password', 'n3w-Pass!');
        await typeInto(fixture, 'kc-password-confirm', 'n3w-Pass!');
        const sent: IKcSubmitted = await submitForm(fixture, 'kc-register-form');

        expect(drawn).toEqual([{ sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UZPB09XzwthjWJrm', theme: ERecaptchaTheme.Light }]);
        expect(widget?.nextElementSibling).toBe(kcNode(fixture, 'kc-register-submit'));
        expect(sent.sent).toBe(true);
        expect(sent.fields['g-recaptcha-response']).toBe('token-light');
    });

    it('SC-AUTH-88 — the place of the widget is held while the Google script is on its way', async () => {
        const fixture: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, recaptchaPage());
        const slot: Element | null = kcNode(fixture, 'kc-recaptcha')?.querySelector('.login__captcha-slot') ?? null;

        expect(slot).not.toBeNull();
        expect(slot?.children.length).toBe(0);
    });

    it('SC-AUTH-90 — the widget takes the scheme of the page theme and is drawn anew when it switches', async () => {
        const { drawn } = fakeRecaptcha();
        const fixture: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, recaptchaPage());
        TestBed.inject(ThemeService).setTheme('dark');
        await fixture.whenStable();
        const answers: number = kcNode(fixture, 'kc-recaptcha')?.querySelectorAll('textarea').length ?? 0;

        expect(drawn.map((params: IRecaptchaParams): ERecaptchaTheme => params.theme)).toEqual([
            ERecaptchaTheme.Light,
            ERecaptchaTheme.Dark,
        ]);
        expect(answers).toBe(1);
    });

    it('SC-AUTH-95 — a ticked widget keeps its answer when the theme switches', async () => {
        const { drawn } = fakeRecaptcha('ticked');
        const fixture: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, recaptchaPage());
        TestBed.inject(ThemeService).setTheme('dark');
        await fixture.whenStable();
        const answer: HTMLTextAreaElement | null = kcNode(fixture, 'kc-recaptcha')?.querySelector('textarea') ?? null;

        expect(drawn.map((params: IRecaptchaParams): ERecaptchaTheme => params.theme)).toEqual([ERecaptchaTheme.Light]);
        expect(answer?.value).toBe('token-light');
    });

    it('SC-AUTH-94 — a Keycloak that names neither the visibility nor the action gets the widget', async () => {
        const { drawn } = fakeRecaptcha();
        const context: TRegisterContext = Object.assign(registerPage(), { recaptchaRequired: true, recaptchaSiteKey: 'site-key' });
        const fixture: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, context);

        expect(kcNode(fixture, 'kc-recaptcha')).not.toBeNull();
        expect(drawn).toEqual([{ sitekey: 'site-key', theme: ERecaptchaTheme.Light }]);
    });

    it('SC-AUTH-92 — a page without reCAPTCHA does not watch the document for the Google script', async () => {
        const observe: jest.SpyInstance = jest.spyOn(MutationObserver.prototype, 'observe');
        const fixture: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, registerPage());
        const watched: number = observe.mock.calls.filter((call: unknown[]): boolean => call[0] === document.head).length;
        observe.mockRestore();

        expect(kcNode(fixture, 'kc-register-submit')).not.toBeNull();
        expect(watched).toBe(0);
    });

    it('SC-AUTH-92 — a page with reCAPTCHA stops watching the document when it is left', async () => {
        const observe: jest.SpyInstance = jest.spyOn(MutationObserver.prototype, 'observe');
        const disconnect: jest.SpyInstance = jest.spyOn(MutationObserver.prototype, 'disconnect');
        const fixture: ComponentFixture<RtKcRegisterComponent> = await renderKcPage(RtKcRegisterComponent, recaptchaPage());
        const watched: number = observe.mock.calls.filter((call: unknown[]): boolean => call[0] === document.head).length;
        fixture.destroy();
        const disconnected: number = disconnect.mock.calls.length;
        observe.mockRestore();
        disconnect.mockRestore();

        expect(watched).toBe(1);
        expect(disconnected).toBe(1);
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
