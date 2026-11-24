import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, Routes } from '@angular/router';

import { RtContainerComponent } from '../../../container/rt-container.component';
import { RtContainerContentDirective, RtContainerRightSidenavDirective } from '../../../container/rt-container.directives';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtSelectComponent } from '../../../select/rt-select.component';
import { IRtSelect } from '../../../select/rt-select.model';
import { RtToolbarComponent, RtToolbarFiltersDirective, RtToolbarRightDirective } from '../../rt-toolbar.component';

const STATUS_OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { value: 'confirmed', label: 'Подтверждено' },
    { value: 'pending', label: 'Ждёт ответа' },
    { value: 'cancelled', label: 'Отменено' },
];

const PAYMENT_OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { value: 'paid', label: 'Оплачено' },
    { value: 'unpaid', label: 'Не оплачено' },
];

/** Маршрут панели отборов в аутлете `ro`, как его объявляет приложение. */
export const TOOLBAR_FILTERS_ROUTES: Routes = [
    {
        path: 'filters',
        outlet: 'ro',
        loadComponent: () =>
            import('../../filters-route-aside/rt-toolbar-filters-route-aside.component').then(
                (m: typeof import('../../filters-route-aside/rt-toolbar-filters-route-aside.component')) =>
                    m.RtToolbarFiltersRouteAsideComponent
            ),
    },
];

/**
 * Панель отборов в маршруте приложения — для витрины.
 *
 * Каркас `rt-container` с аутлетом `ro` в правой зоне, как у приложения: полоса с
 * `filtersPanel="app"` сообщает `filtersOpen`, страница переходит на маршрут
 * `rt-toolbar-filters-route-aside`, и панель приезжает в правую зону каркаса.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-toolbar-filters-route',
    templateUrl: './test-rt-toolbar-filters-route.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RouterOutlet,
        RtContainerComponent,
        RtContainerContentDirective,
        RtContainerRightSidenavDirective,
        RtToolbarComponent,
        RtToolbarFiltersDirective,
        RtToolbarRightDirective,
        RtIconButtonComponent,
        RtFieldComponent,
        RtSelectComponent,
    ],
})
export class TestRtToolbarFiltersRouteComponent implements OnInit {
    readonly #router: Router = inject(Router);

    protected readonly statusOptions: ReadonlyArray<IRtSelect.Option<string>> = STATUS_OPTIONS;
    protected readonly paymentOptions: ReadonlyArray<IRtSelect.Option<string>> = PAYMENT_OPTIONS;

    public ngOnInit(): void {
        // Маршруты вносятся в уже поднятый роутер витрины, и история открывается без панели
        this.#router.resetConfig(TOOLBAR_FILTERS_ROUTES);
        void this.#router.navigateByUrl('/');
    }

    protected openFilters(): void {
        void this.#router.navigate([{ outlets: { ro: ['filters'] } }]);
    }
}
