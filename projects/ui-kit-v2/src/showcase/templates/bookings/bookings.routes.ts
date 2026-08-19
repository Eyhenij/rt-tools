import { Route } from '@angular/router';

import { rtAsideUnsavedGuard } from '../../../lib/components/container/rt-route-aside.guard';
import { RtTableSettingsAsideComponent } from '../../../lib/components/table/settings-aside/rt-table-settings-aside.component';
import { BookingAsideComponent } from './booking-aside/booking-aside.component';
import { BookingsPageComponent } from './bookings-page/bookings-page.component';
import { BookingsStore } from './bookings.store';

/**
 * Ветка раздела заявок. Стор раздела объявлен на ней, а не на экране: список и панель делят одно
 * состояние, и провайдер обязан лежать на общем для них маршруте.
 *
 * Экран лежит на пустом пути внутри ветки, а не на самой ветке: из маршрута с непустым путём
 * относительная навигация в именованный аутлет не разрешается, и панель не открылась бы ни
 * кнопкой, ни кликом по строке.
 *
 * Заведение и правка — один компонент на два маршрута: поля у них одни и те же, а две панели
 * разошлись бы при первой правке.
 */
export const bookingsRoute: Route = {
    path: '',
    providers: [BookingsStore],
    children: [
        {
            path: 'add',
            outlet: 'ro',
            canDeactivate: [rtAsideUnsavedGuard],
            component: BookingAsideComponent,
        },
        {
            path: 'edit/:bookingId',
            outlet: 'ro',
            canDeactivate: [rtAsideUnsavedGuard],
            component: BookingAsideComponent,
        },
        {
            // Настройки колонок — компонент кита, и маршрут к нему заводит каждый раздел со
            // своей таблицей: панель открывается в правом сайднаве того каркаса, из которого её
            // позвали.
            path: 'table-settings',
            outlet: 'ro',
            canDeactivate: [rtAsideUnsavedGuard],
            component: RtTableSettingsAsideComponent,
        },
        {
            path: '',
            component: BookingsPageComponent,
        },
    ],
};
