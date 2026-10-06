import { ComponentFixture } from '@angular/core/testing';

import { IKcSubmitted, kcContextOf, kcNode, renderKcPage, submitForm, typeInto } from '../../../testing/kc-page-fixture';
import { RtKcResetPasswordComponent } from '../reset-password/rt-kc-reset-password.component';
import { RtKcUpdatePasswordComponent } from './rt-kc-update-password.component';

/** The new password page of a realm with the policy of the stand. */
function pageWithPolicy(): ReturnType<typeof kcContextOf<'login-update-password.ftl'>> {
    return Object.assign(kcContextOf('login-update-password.ftl'), {
        passwordPolicies: { length: 8, upperCase: 1, lowerCase: 1, digits: 1, specialChars: 1, notUsername: true, notEmail: true },
    });
}

/** The requirement lines under the new password field: the text and whether it is marked as met. */
function ruleLines(fixture: ComponentFixture<unknown>): { text: string; met: boolean }[] {
    const lines: HTMLElement[] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[qa-dataid="kc-password-rule"]'));

    return lines.map((line: HTMLElement): { text: string; met: boolean } => ({
        text: line.textContent?.trim() ?? '',
        met: line.getAttribute('data-met') === 'true',
    }));
}

describe('the password forms', () => {
    it('SC-AUTH-21 — the forms of the reset and the new password keep their field names', async () => {
        const reset: ComponentFixture<RtKcResetPasswordComponent> = await renderKcPage(
            RtKcResetPasswordComponent,
            kcContextOf('login-reset-password.ftl', { url: { loginAction: 'http://kc/reset' } })
        );
        await typeInto(reset, 'kc-username', 'ann@rt.localhost');
        const resetSent: IKcSubmitted = await submitForm(reset, 'kc-reset-form');

        expect(resetSent).toEqual({ sent: true, action: 'http://kc/reset', fields: { username: 'ann@rt.localhost' } });
    });

    it('SC-AUTH-21 — the new password posts both fields and the sign-out of other sessions', async () => {
        const update: ComponentFixture<RtKcUpdatePasswordComponent> = await renderKcPage(
            RtKcUpdatePasswordComponent,
            kcContextOf('login-update-password.ftl', { url: { loginAction: 'http://kc/update' } })
        );
        await typeInto(update, 'kc-password-new', 'n3w-pass');
        await typeInto(update, 'kc-password-confirm', 'n3w-pass');
        const updateSent: IKcSubmitted = await submitForm(update, 'kc-update-form');

        expect(updateSent).toEqual({
            sent: true,
            action: 'http://kc/update',
            fields: { 'password-new': 'n3w-pass', 'password-confirm': 'n3w-pass', 'logout-sessions': 'on' },
        });
    });

    it('SC-AUTH-20 — the new password form with an empty confirmation stays on the page', async () => {
        const update: ComponentFixture<RtKcUpdatePasswordComponent> = await renderKcPage(
            RtKcUpdatePasswordComponent,
            kcContextOf('login-update-password.ftl')
        );
        await typeInto(update, 'kc-password-new', 'n3w-pass');

        expect((await submitForm(update, 'kc-update-form')).sent).toBe(false);
    });

    it('SC-AUTH-20 — leaving the action is not held by the empty fields', async () => {
        const update: ComponentFixture<RtKcUpdatePasswordComponent> = await renderKcPage(
            RtKcUpdatePasswordComponent,
            kcContextOf('login-update-password.ftl', { isAppInitiatedAction: true })
        );
        const cancel: HTMLElement | null = kcNode(update, 'kc-update-cancel');

        expect(cancel?.getAttribute('name')).toBe('cancel-aia');
        expect((await submitForm(update, 'kc-update-form', cancel ?? undefined)).sent).toBe(true);
    });

    it('SC-AUTH-66 — the new password page lists every requirement of the realm policy', async () => {
        const update: ComponentFixture<RtKcUpdatePasswordComponent> = await renderKcPage(RtKcUpdatePasswordComponent, pageWithPolicy());

        expect(kcNode(update, 'kc-password-rules')?.getAttribute('aria-label')).toBe('Password requirements');
        expect(ruleLines(update)).toEqual([
            { text: 'Length: at least 8', met: false },
            { text: 'Upper case letters: at least 1', met: false },
            { text: 'Lower case letters: at least 1', met: false },
            { text: 'Digits: at least 1', met: false },
            { text: 'Special characters: at least 1', met: false },
            { text: 'Not the same as the username', met: false },
            { text: 'Not the same as the email', met: false },
        ]);
    });

    it('SC-AUTH-67 — a requirement is marked as met while the person types', async () => {
        const update: ComponentFixture<RtKcUpdatePasswordComponent> = await renderKcPage(RtKcUpdatePasswordComponent, pageWithPolicy());
        await typeInto(update, 'kc-password-new', 'Abcdefgh');

        expect(ruleLines(update).map((line: { text: string; met: boolean }): boolean => line.met)).toEqual([
            true,
            true,
            true,
            false,
            false,
            true,
            true,
        ]);
    });

    it('SC-AUTH-68 — a realm without a policy shows no list', async () => {
        const update: ComponentFixture<RtKcUpdatePasswordComponent> = await renderKcPage(
            RtKcUpdatePasswordComponent,
            kcContextOf('login-update-password.ftl')
        );

        expect(kcNode(update, 'kc-password-new')).not.toBeNull();
        expect(kcNode(update, 'kc-password-rules')).toBeNull();
    });
});
