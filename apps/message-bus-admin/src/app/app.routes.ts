import { Route } from '@angular/router';
import { authRoutes, sessionGuard } from '@rt/message-bus-admin/auth/shell';

/**
 * Маршруты админки.
 *
 * Экран входа стоит вне оболочки: меню и шапка невошедшему показывать нечего. Всё остальное
 * закрыто одним гвардом на корне закрытой ветки — проверка на каждом разделе была бы вторым
 * ответом на тот же вопрос и разошлась бы с первым на первом же новом разделе.
 */
export const appRoutes: Route[] = [
    ...authRoutes,
    {
        path: '',
        canActivate: [sessionGuard],
        loadComponent: async () => (await import('@rt/message-bus-admin/common/container/feature')).AdminContainerComponent,
        children: [
            {
                path: 'overview',
                title: 'Обзор',
                loadComponent: async () => (await import('@rt/message-bus-admin/common/container/feature')).AdminOverviewComponent,
            },
            { path: '', pathMatch: 'full', redirectTo: 'overview' },
        ],
    },
];
