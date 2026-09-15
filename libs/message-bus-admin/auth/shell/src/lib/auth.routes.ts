import { Routes } from '@angular/router';

import { SETUP_PATH, SIGN_IN_PATH } from '@rt/message-bus-admin/auth/util';

/**
 * Маршруты домена входа. Экраны приезжают отложенной загрузкой: вошедший их не открывает
 * никогда, и класть их в первую сборку значило бы возить всем то, что нужно один раз.
 */
export const authRoutes: Routes = [
    {
        path: SIGN_IN_PATH,
        title: 'Вход',
        loadComponent: async () => (await import('@rt/message-bus-admin/auth/feature/sign-in')).AdminSignInComponent,
    },
    {
        path: SETUP_PATH,
        title: 'Первая запись',
        loadComponent: async () => (await import('@rt/message-bus-admin/auth/feature/setup')).AdminSetupComponent,
    },
];
