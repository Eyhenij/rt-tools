import { ComponentFixture } from '@angular/core/testing';

import { IKcSubmitted, kcContextOf, kcNode, renderKcPage, submitForm, typeInto } from '../../../testing/kc-page-fixture';
import { RtKcResetPasswordComponent } from '../reset-password/rt-kc-reset-password.component';
import { RtKcUpdatePasswordComponent } from './rt-kc-update-password.component';

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
});
