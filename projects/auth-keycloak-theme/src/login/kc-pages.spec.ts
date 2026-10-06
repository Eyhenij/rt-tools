import { TKcPageId } from './kc-context';
import { themePageOf } from './kc-pages';
import { RtKcLoginComponent } from './pages/login/rt-kc-login.component';
import { RtKcUpdatePasswordComponent } from './pages/update-password/rt-kc-update-password.component';

describe('themePageOf', () => {
    it('SC-AUTH-18 — the theme draws its own pages and leaves the rest to the standard layout', () => {
        const own: TKcPageId[] = [
            'login.ftl',
            'login-reset-password.ftl',
            'login-update-password.ftl',
            'login-verify-email.ftl',
            'info.ftl',
            'error.ftl',
            'logout-confirm.ftl',
            'login-page-expired.ftl',
        ];

        expect(own.every((pageId: TKcPageId): boolean => themePageOf(pageId) !== null)).toBe(true);
        expect(themePageOf('login.ftl')).toBe(RtKcLoginComponent);
        expect(themePageOf('login-update-password.ftl')).toBe(RtKcUpdatePasswordComponent);
        expect(themePageOf('login-config-totp.ftl')).toBeNull();
    });
});
