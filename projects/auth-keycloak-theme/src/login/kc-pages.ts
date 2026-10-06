import { Type } from '@angular/core';

import { TKcPageId } from './kc-context';
import { RtKcErrorComponent } from './pages/error/rt-kc-error.component';
import { RtKcInfoComponent } from './pages/info/rt-kc-info.component';
import { RtKcLoginComponent } from './pages/login/rt-kc-login.component';
import { RtKcLogoutConfirmComponent } from './pages/logout-confirm/rt-kc-logout-confirm.component';
import { RtKcPageExpiredComponent } from './pages/page-expired/rt-kc-page-expired.component';
import { RtKcResetPasswordComponent } from './pages/reset-password/rt-kc-reset-password.component';
import { RtKcUpdatePasswordComponent } from './pages/update-password/rt-kc-update-password.component';
import { RtKcVerifyEmailComponent } from './pages/verify-email/rt-kc-verify-email.component';

/** The pages the theme draws with the second kit. */
const THEME_PAGES: Readonly<Partial<Record<TKcPageId, Type<unknown>>>> = Object.freeze({
    'login.ftl': RtKcLoginComponent,
    'login-reset-password.ftl': RtKcResetPasswordComponent,
    'login-update-password.ftl': RtKcUpdatePasswordComponent,
    'login-verify-email.ftl': RtKcVerifyEmailComponent,
    'info.ftl': RtKcInfoComponent,
    'error.ftl': RtKcErrorComponent,
    'logout-confirm.ftl': RtKcLogoutConfirmComponent,
    'login-page-expired.ftl': RtKcPageExpiredComponent,
});

/**
 * The theme component of a page, or `null` for a page the theme leaves to the standard
 * Keycloakify layout. A page Keycloak adds in a new version falls to the standard layout instead
 * of showing empty.
 */
export function themePageOf(pageId: TKcPageId): Type<unknown> | null {
    return THEME_PAGES[pageId] ?? null;
}
