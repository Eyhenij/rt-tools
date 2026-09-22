import { Route } from '@angular/router';
import { CHAT_ROUTE } from '@rt/message-bus-admin/chat/util';
import { adminTabTitle } from '@rt/message-bus-admin/common/core/util';

/**
 * Маршруты раздела чата.
 *
 * Экран один: список переписок и лента выбранного разговора стоят на нём рядом, и открытый
 * разговор назван в адресе — так он переживает перезагрузку и передаётся ссылкой.
 *
 * Экран приезжает отложенной загрузкой: приложение не знает его вовсе.
 */
export const chatRoutes: Route[] = [
    {
        path: CHAT_ROUTE,
        title: adminTabTitle('sectionChat'),
        loadComponent: async () => (await import('@rt/message-bus-admin/chat/feature/panel')).AdminChatPanelComponent,
    },
];
