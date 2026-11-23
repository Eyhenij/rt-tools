import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet, Routes } from '@angular/router';

import { RtContainerComponent } from '../../../container/rt-container.component';
import { RtContainerContentDirective, RtContainerRightSidenavDirective } from '../../../container/rt-container.directives';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtSelectComponent } from '../../../select/rt-select.component';
import { IRtSelect } from '../../../select/rt-select.model';
import { RtToolbarFiltersRouteAsideComponent } from '../../filters-route-aside/rt-toolbar-filters-route-aside.component';
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

/** Список раздела: полоса с отборами, кнопка фильтров открывает маршрут панели. */
@Component({
    selector: 'app-toolbar-filters-route-list',
    template: `
        <rt-toolbar
            qa-dataid="story-toolbar-filters-route"
            filtersPanel="app"
            filtersActive
            style="--rt-toolbar-padding-top: 12px; --rt-toolbar-padding-bottom: 12px; --rt-toolbar-padding-inline: 12px"
            (filtersOpen)="openFilters()">
            <ng-template rtToolbarFilters let-place>
                @if (place === 'panel') {
                    <rt-field label="Статус">
                        <rt-select placeholder="Все" [options]="statusOptions" />
                    </rt-field>
                    <rt-field label="Оплата">
                        <rt-select placeholder="Любая оплата" [options]="paymentOptions" />
                    </rt-field>
                } @else {
                    <rt-select placeholder="Все" aria-label="Статус" [options]="statusOptions" />
                    <rt-select placeholder="Любая оплата" aria-label="Оплата" [options]="paymentOptions" />
                }
            </ng-template>

            <ng-template rtToolbarRight>
                <rt-icon-button icon="ico-plus" variant="primary" ariaLabel="Добавить" />
                <rt-icon-button icon="sync" variant="primary" ariaLabel="Обновить" />
            </ng-template>
        </rt-toolbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtToolbarComponent,
        RtToolbarFiltersDirective,
        RtToolbarRightDirective,
        RtIconButtonComponent,
        RtFieldComponent,
        RtSelectComponent,
    ],
})
export class TestRtToolbarFiltersRouteListComponent {
    readonly #router: Router = inject(Router);
    readonly #route: ActivatedRoute = inject(ActivatedRoute);

    protected readonly statusOptions: ReadonlyArray<IRtSelect.Option<string>> = STATUS_OPTIONS;
    protected readonly paymentOptions: ReadonlyArray<IRtSelect.Option<string>> = PAYMENT_OPTIONS;

    protected openFilters(): void {
        void this.#router.navigate([{ outlets: { ro: ['filters'] } }], { relativeTo: this.#route });
    }
}

const ROUTES: Routes = [
    { path: 'filters', outlet: 'ro', component: RtToolbarFiltersRouteAsideComponent },
    { path: '', component: TestRtToolbarFiltersRouteListComponent },
];

/**
 * Панель отборов в маршруте приложения — для витрины.
 *
 * Каркас `rt-container` с аутлетом `ro` в правой зоне, как у приложения: полоса с
 * `filtersPanel="app"` сообщает `filtersOpen`, список переходит на маршрут
 * `rt-toolbar-filters-route-aside`, и панель приезжает в правую зону каркаса.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-toolbar-filters-route',
    template: `
        <rt-container>
            <ng-container *rtContainerContent>
                <router-outlet />
            </ng-container>
            <ng-container *rtContainerRightSidenav>
                <router-outlet name="ro" />
            </ng-container>
        </rt-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet, RtContainerComponent, RtContainerContentDirective, RtContainerRightSidenavDirective],
})
export class TestRtToolbarFiltersRouteComponent implements OnInit {
    readonly #router: Router = inject(Router);

    public ngOnInit(): void {
        // Маршруты вносятся в уже поднятый роутер витрины, и история открывается со списка
        this.#router.resetConfig(ROUTES);
        void this.#router.navigateByUrl('/');
    }
}
