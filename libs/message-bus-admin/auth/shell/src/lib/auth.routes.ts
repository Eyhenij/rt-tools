import { Routes } from '@angular/router';

import { SIGN_IN_PATH } from './session.guard';

/**
 * Маршруты домена входа. Экран приезжает отложенной загрузкой: вошедший его не открывает
 * никогда, и класть его в первую сборку значило бы возить всем то, что нужно один раз.
 */
export const authRoutes: Routes = [
    {
        path: SIGN_IN_PATH,
        title: 'Вход',
        loadComponent: async () => (await import('@rt/message-bus-admin/auth/feature/sign-in')).AdminSignInComponent,
    },
];
