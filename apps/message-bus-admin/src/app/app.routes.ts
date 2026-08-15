import { Route } from '@angular/router';
import { authRoutes, sessionGuard } from '@rt/message-bus-admin/auth/shell';

/**
 * Маршруты админки.
 *
 * Экран входа стоит вне оболочки: меню и шапка невошедшему показывать нечего. Всё остальное
 * закрыто одним объявлением на корне закрытой ветки — проверка, выписанная у каждого раздела,
 * была бы вторым ответом на тот же вопрос и разошлась бы с первым на первом же новом разделе.
 *
 * Гвард назван дважды намеренно. На самой ветке он отрабатывает один раз за загрузку страницы и
 * переходов между разделами не видит: вход, оборвавшийся посреди работы, до перезагрузки
 * оставался бы принятым, и человек ходил бы по разделам, которым приёмник уже отвечает отказом.
 * На детях он проверяет каждый переход, но саму оболочку не закрывает — её держит первое
 * объявление.
 */
export const appRoutes: Route[] = [
    ...authRoutes,
    {
        path: '',
        canActivate: [sessionGuard],
        canActivateChild: [sessionGuard],
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
