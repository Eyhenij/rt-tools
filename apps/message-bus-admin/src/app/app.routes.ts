import { Route } from '@angular/router';
import { PEOPLE_ROUTE, peopleRoutes, ROLES_ROUTE, rolesRoutes } from '@rt/message-bus-admin/accounts/shell';
import { authRoutes, landingPath, noSectionsGuard, sectionRightGuard, sessionGuard } from '@rt/message-bus-admin/auth/shell';
import { chatRoutes } from '@rt/message-bus-admin/chat/shell';
import { NO_SECTIONS_PATH } from '@rt/message-bus-admin/auth/util';
import { COLUMNS_ROUTE } from '@rt/message-bus-admin/common/core/util';
import { INVITES_ROUTE, invitesRoutes } from '@rt/message-bus-admin/invites/shell';
import { POSTMORTEMS_ROUTE, postmortemsRoutes } from '@rt/message-bus-admin/postmortems/shell';
import { PROPOSALS_ROUTE, proposalsRoutes } from '@rt/message-bus-admin/proposals/shell';
import { SUMMARIES_ROUTE, summariesRoutes } from '@rt/message-bus-admin/summaries/shell';
import { USAGE_ROUTE, usageRoutes } from '@rt/message-bus-admin/usage/shell';

/**
 * Панель настройки столбцов — своя у каждого раздела, и адрес её называет раздел.
 *
 * Одна панель на три таблицы не сказала бы по адресу, чьи столбцы настраивают: вернувшийся по
 * ссылке человек попадал бы в настройки того раздела, который открылся первым. Настраиваемую
 * таблицу кит берёт из своего реестра, но адрес — это ещё и место в истории браузера, и оно у
 * каждого списка своё.
 *
 * Объявление собрано здесь, а не тремя строками в маршрутах разделов: панель грузится из
 * оболочки админки, а раздел её либы не видит — граница раскладки говорит об этом прямо.
 */
function columnsRoute(section: string): Route {
    return {
        path: `${section}/${COLUMNS_ROUTE}`,
        pathMatch: 'full',
        outlet: 'ro',
        loadComponent: async () => (await import('@rt/message-bus-admin/common/container/feature')).adminColumnsAside(),
    };
}

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
 *
 * Рядом с ним на детях стоит проверка по праву: раздел закрыт правом своего пункта меню, и
 * читает она его оттуда же, откуда шапка берёт подпись и адрес. На самой ветке ей места нет по
 * той же причине — снятое посреди работы право держало бы раздел открытым до перезагрузки.
 *
 * Корень ведёт не в первый раздел списка, а в первый открытый: у того, кто первого раздела не
 * видит, переадресация на него кончалась бы отказом сразу после входа.
 */
export const appRoutes: Route[] = [
    ...authRoutes,
    {
        path: '',
        canActivate: [sessionGuard],
        canActivateChild: [sessionGuard, sectionRightGuard],
        loadComponent: async () => (await import('@rt/message-bus-admin/common/container/feature')).AdminContainerComponent,
        children: [
            // Впереди маршрутов разделов: у панели подробностей путь `<раздел>/:id`, и
            // объявленная после неё настройка столбцов досталась бы ему — с именем маршрута
            // вместо идентификатора записи
            columnsRoute(POSTMORTEMS_ROUTE),
            columnsRoute(PROPOSALS_ROUTE),
            columnsRoute(SUMMARIES_ROUTE),
            columnsRoute(USAGE_ROUTE),
            columnsRoute(INVITES_ROUTE),
            columnsRoute(PEOPLE_ROUTE),
            columnsRoute(ROLES_ROUTE),
            ...postmortemsRoutes,
            ...proposalsRoutes,
            ...summariesRoutes,
            ...usageRoutes,
            ...chatRoutes,
            ...invitesRoutes,
            ...peopleRoutes,
            ...rolesRoutes,
            {
                path: NO_SECTIONS_PATH,
                pathMatch: 'full',
                canActivate: [noSectionsGuard],
                loadComponent: async () => (await import('@rt/message-bus-admin/common/container/feature')).AdminNoSectionsComponent,
            },
            { path: '', pathMatch: 'full', redirectTo: (): string => landingPath() },
        ],
    },
];
