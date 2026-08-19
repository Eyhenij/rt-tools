import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, Routes } from '@angular/router';

import { RtContainerComponent } from '../../../../lib/components/container/rt-container.component';
import {
    RtContainerContentDirective,
    RtContainerHeaderDirective,
    RtContainerRightSidenavDirective,
} from '../../../../lib/components/container/rt-container.directives';
import { RtPageHeaderComponent } from '../../../../lib/components/page-header/rt-page-header.component';
import { IRtPageHeader } from '../../../../lib/components/page-header/rt-page-header.model';
import { bookingsRoute } from '../../bookings/bookings.routes';

/**
 * Демонстрационная обёртка для витрины: каркас приложения, в котором живёт целый экран.
 *
 * Обёртка, а не сам экран: истории целят в неё по договорённости витрины, а экран внутри неё —
 * то же самое, что стоит у потребителя. Каркас нужен ей не для красоты: панель заведения и
 * правки открывается адресом в аутлете `ro`, а этот аутлет живёт в правом сайднаве каркаса — без
 * него панель не показалась бы вовсе.
 *
 * Верхняя навигация — тот же компонент кита, что стоит в приложении; данные для неё
 * демонстрационные. Левого меню у каркаса нет: разделы живут в шапке, и колонка слева отняла бы
 * у списка ширину, которой у него и так нет.
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

/** Адрес раздела: с него начинается показ, и по нему же узнаётся уже открытая панель. */
const SECTION_URL: string = '/bookings';

/** Разделы верхней навигации. Живой из них один — заявки; остальные показывают, как выглядит ряд. */
const HEADER_ITEMS: ReadonlyArray<IRtPageHeader.Item> = [
    { id: 'dashboard', label: 'Сводка', route: '/dashboard' },
    { id: 'bookings', label: 'Заявки', route: '/bookings' },
    { id: 'calendar', label: 'Календарь', route: '/calendar' },
    { id: 'properties', label: 'Объекты', route: '/properties' },
];

@Component({
    selector: 'app-bookings-template',
    template: `
        <!-- Высота каркаса не прибита к вьюпорту: страница растёт под содержимое и скроллится
             целиком, а не зонами по отдельности — иначе переключатель страниц уезжает под
             нижний край и достать его нечем. -->
        <rt-container>
            <ng-container *rtContainerHeader>
                <rt-page-header ariaLabel="Разделы" [items]="headerItems" [user]="user" />
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
        RtContainerRightSidenavDirective,
        RtPageHeaderComponent,
    ],
})
export class TestRtBookingsTemplateComponent implements OnInit {
    readonly #router: Router = inject(Router);
    readonly #location: Location = inject(Location);

    public readonly headerItems: ReadonlyArray<IRtPageHeader.Item> = HEADER_ITEMS;

    public readonly user: IRtPageHeader.User = { name: 'Мария Ветрова', avatar: 'М' };

    public ngOnInit(): void {
        // Маршруты вносятся в уже поднятый роутер: набор, объявленный при его создании, разбирался
        // бы вместе с настройкой показа и уронил бы витрину круговым импортом.
        this.#router.resetConfig(SHOWCASE_ROUTES);

        // Витрина открывает историю по своему адресу, а не по адресу раздела: без этого перехода
        // в аутлете каркаса не нарисовалось бы ничего, и история показала бы пустой каркас.
        // Уже набранный адрес при этом сохраняется: переход на раздел без разбора стирал бы
        // открытую панель, и на перезагрузке страницы она не возвращалась бы никогда.
        const requested: string = this.#location.path();

        void this.#router.navigateByUrl(requested.startsWith(SECTION_URL) ? requested : SECTION_URL);
    }
}
