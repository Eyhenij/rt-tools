import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, Routes } from '@angular/router';

import { RtContainerComponent } from '../../../../lib/components/container/rt-container.component';
import {
    RtContainerContentDirective,
    RtContainerHeaderDirective,
    RtContainerLeftSidenavDirective,
    RtContainerRightSidenavDirective,
} from '../../../../lib/components/container/rt-container.directives';
import { RtPageHeaderComponent } from '../../../../lib/components/page-header/rt-page-header.component';
import { IRtPageHeader } from '../../../../lib/components/page-header/rt-page-header.model';
import { RtSectionNavComponent } from '../../../../lib/components/section-nav/rt-section-nav.component';
import { IRtSectionNav } from '../../../../lib/components/section-nav/rt-section-nav.model';
import { bookingsRoute } from '../../bookings/bookings.routes';

/**
 * Демонстрационная обёртка для витрины: каркас приложения, в котором живёт целый экран.
 *
 * Обёртка, а не сам экран: истории целят в неё по договорённости витрины, а экран внутри неё —
 * то же самое, что стоит у потребителя. Каркас нужен ей не для красоты: панель заведения и
 * правки открывается адресом в аутлете `ro`, а этот аутлет живёт в правом сайднаве каркаса — без
 * него панель не показалась бы вовсе.
 *
 * Верхняя навигация и левое меню — те же компоненты кита, что стоят в приложении; данные для них
 * демонстрационные.
 *
 * В пакет обёртка не уезжает: `src/showcase/**` исключён из сборки библиотеки.
 */

/**
 * Маршруты раздела. Объявляются здесь, а не в настройке показа: внесённые туда, они тянут
 * компоненты кита в момент разбора настройки — раньше, чем те успевают объявиться, — и витрина
 * падает на круговом импорте целиком, всеми историями сразу.
 *
 * Раздел лежит на непустом пути, а его ветка — на пустом внутри: из маршрута с непустым путём
 * относительная навигация в именованный аутлет не разрешается, и панель не открылась бы ни
 * кнопкой, ни кликом по строке.
 */
const SHOWCASE_ROUTES: Routes = [{ path: 'bookings', children: [bookingsRoute] }];

/** Разделы верхней навигации. Живой из них один — заявки; остальные показывают, как выглядит ряд. */
const HEADER_ITEMS: ReadonlyArray<IRtPageHeader.Item> = [
    { id: 'dashboard', label: 'Сводка', route: '/dashboard' },
    { id: 'bookings', label: 'Заявки', route: '/bookings' },
    { id: 'calendar', label: 'Календарь', route: '/calendar' },
    { id: 'properties', label: 'Объекты', route: '/properties' },
];

/** Пункты левого меню раздела. Открытый — заявки: именно его экран и показывает история. */
const NAV_ITEMS: ReadonlyArray<IRtSectionNav.Item> = [
    { id: 'bookings', label: 'Заявки', icon: 'inbox', active: true },
    { id: 'guests', label: 'Гости', icon: 'user', active: false },
    { id: 'payments', label: 'Платежи', icon: 'wallet', active: false },
];

@Component({
    selector: 'app-bookings-template',
    template: `
        <rt-container height="viewport">
            <ng-container *rtContainerHeader>
                <rt-page-header ariaLabel="Разделы" [items]="headerItems" [user]="user" />
            </ng-container>

            <ng-container *rtContainerLeftSidenav>
                <rt-section-nav [items]="navItems" />
            </ng-container>

            <ng-container *rtContainerContent>
                <router-outlet />
            </ng-container>

            <!-- Панель заведения и правки приезжает сюда: её маршрут объявлен в аутлете ro. -->
            <ng-container *rtContainerRightSidenav>
                <router-outlet name="ro" />
            </ng-container>
        </rt-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        RouterOutlet,

        // components
        RtContainerComponent,
        RtContainerContentDirective,
        RtContainerHeaderDirective,
        RtContainerLeftSidenavDirective,
        RtContainerRightSidenavDirective,
        RtPageHeaderComponent,
        RtSectionNavComponent,
    ],
})
export class TestRtBookingsTemplateComponent implements OnInit {
    readonly #router: Router = inject(Router);

    public readonly headerItems: ReadonlyArray<IRtPageHeader.Item> = HEADER_ITEMS;

    public readonly navItems: ReadonlyArray<IRtSectionNav.Item> = NAV_ITEMS;

    public readonly user: IRtPageHeader.User = { name: 'Евгения Крумина', avatar: 'Е' };

    public ngOnInit(): void {
        // Маршруты вносятся в уже поднятый роутер: набор, объявленный при его создании, разбирался
        // бы вместе с настройкой показа и уронил бы витрину круговым импортом.
        this.#router.resetConfig(SHOWCASE_ROUTES);

        // Витрина открывает историю по своему адресу, а не по адресу раздела: без этого перехода
        // в аутлете каркаса не нарисовалось бы ничего, и история показала бы пустой каркас.
        void this.#router.navigateByUrl('/bookings');
    }
}
