import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';

import { SETUP_PATH, SIGN_IN_PATH } from '@rt/message-bus-admin/auth/util';
import { AdminTextService, TAdminLabelKey } from '@rt/message-bus-admin/common/core/util';

/**
 * Заголовок вкладки по ключу словаря.
 *
 * Строкой он стоял бы на одном языке: маршруты объявляются один раз при загрузке приложения, а
 * заголовок ставится на каждом переходе — и спрашивает словарь тогда же.
 */
function tabTitle(key: TAdminLabelKey): ResolveFn<string> {
    return (): string => inject(AdminTextService).text(key);
}

/**
 * Маршруты домена входа. Экраны приезжают отложенной загрузкой: вошедший их не открывает
 * никогда, и класть их в первую сборку значило бы возить всем то, что нужно один раз.
 */
export const authRoutes: Routes = [
    {
        path: SIGN_IN_PATH,
        title: tabTitle('signInTab'),
        loadComponent: async () => (await import('@rt/message-bus-admin/auth/feature/sign-in')).AdminSignInComponent,
    },
    {
        path: SETUP_PATH,
        title: tabTitle('setupTitle'),
        loadComponent: async () => (await import('@rt/message-bus-admin/auth/feature/setup')).AdminSetupComponent,
    },
];
