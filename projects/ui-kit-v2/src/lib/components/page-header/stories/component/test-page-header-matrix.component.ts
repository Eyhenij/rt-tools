import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtToggleButtonGroupComponent } from '../../../toggle-button-group/rt-toggle-button-group.component';
import { IRtToggleButtonGroup } from '../../../toggle-button-group/rt-toggle-button-group.model';
import { IRtPageHeader } from '../../rt-page-header.model';
import { RtPageHeaderComponent } from '../../rt-page-header.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TPageHeaderMatrixPart = 'items' | 'user' | 'themes' | 'panel' | 'compact';

/** Признак прокручиваемой обёртки сжатой истории: по нему шаг `play` прокручивает страницу. */
export const PAGE_HEADER_COMPACT_SCROLL_ATTRIBUTE: string = 'data-story-scroll';

/** Набор пунктов: вид пункта решают его собственные поля, а не входы шапки. */
interface IPageHeaderItemsCase {
    readonly name: string;
    readonly items: ReadonlyArray<IRtPageHeader.Item>;
}

/** Блок пользователя справа: с картинкой-инициалом, без неё, без блока вовсе. */
interface IPageHeaderUserCase {
    readonly name: string;
    readonly user: IRtPageHeader.User | null;
    readonly userTitle: string;
}

/**
 * Матрицы состояний `rt-page-header` для витрины.
 *
 * Панель второго уровня — отдельная история: она живёт в оверлее CDK, до наведения её в
 * документе нет вовсе, и открывает её `play`-функция наведением. Открытая панель в истории
 * ровно одна.
 *
 * Подсветку активного раздела даёт маршрутизатор (`routerLinkActive`), а не входы: в витрине
 * маршрут всегда корневой, и активным ни один раздел не станет. Это объявлено на
 * странице-обзоре.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-page-header-matrix',
    template: `
        @switch (part) {
            @case ('items') {
                <app-story-row caption="Виды пунктов" [items]="itemsCases" [itemLabel]="caseLabel" [slotWidth]="headerWidth">
                    <ng-template let-itemsCase>
                        <rt-page-header ariaLabel="Разделы" [items]="itemsCase.items" />
                    </ng-template>
                </app-story-row>
            }

            @case ('user') {
                <app-story-row caption="Блок пользователя" [items]="userCases" [itemLabel]="caseLabel" [slotWidth]="headerWidth">
                    <ng-template let-userCase>
                        <rt-page-header ariaLabel="Разделы" [items]="flatItems" [user]="userCase.user" [userTitle]="userCase.userTitle" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Полоса разделов в обеих темах">
                    <ng-template>
                        <rt-page-header ariaLabel="Разделы" [items]="mixedItems" [user]="user" />
                    </ng-template>
                </app-story-themes>
            }

            @case ('panel') {
                <div class="app-page-header-matrix__panel-slot">
                    <rt-page-header ariaLabel="Разделы" [items]="mixedItems" [user]="user" [attr.data-story-trigger]="triggerAttribute" />
                </div>
            }

            @case ('compact') {
                <div class="app-page-header-matrix__scroll" data-story-root [attr.data-story-scroll]="scrollAttribute">
                    <rt-page-header ariaLabel="Разделы" stickyCompact [items]="compactItems" [user]="user">
                        <span rtCompactLeft class="app-page-header-matrix__crumbs">Туры / Лето 2026 / Италия</span>
                        <rt-toggle-button-group rtCompactCenter ariaLabel="Отбор" value="all" [options]="filterOptions" />
                        <span rtCompactRight class="app-page-header-matrix__actions">
                            <rt-icon-button icon="search" ariaLabel="Поиск" size="sm" />
                            <rt-icon-button icon="filter" ariaLabel="Отбор" size="sm" />
                        </span>
                    </rt-page-header>
                    <div class="app-page-header-matrix__page"></div>
                </div>
            }
        }
    `,
    styles: `
        /* Панель второго уровня уезжает в контейнер оверлеев и встаёт под полосой: без запаса
           снизу она вышла бы за нижний край окна. */
        .app-page-header-matrix__panel-slot {
            padding-bottom: 20rem;
        }

        /* Сжатие наступает на прокрутке, поэтому шапка стоит в прокручиваемой обёртке, а
           под ней — высокая пустая страница, за которую и прокручивают. Обёртка низкая
           нарочно: в кадре видна полоса и ровно столько страницы, чтобы прокрутка читалась. */
        .app-page-header-matrix__scroll {
            height: 12rem;
            overflow-y: auto;
            background-color: var(--rt-color-bg-surface-subtle);
        }

        .app-page-header-matrix__page {
            height: 60rem;
        }

        .app-page-header-matrix__crumbs {
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-sm);
            white-space: nowrap;
        }

        .app-page-header-matrix__actions {
            display: inline-flex;
            gap: var(--rt-space-1);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtPageHeaderComponent,
        RtToggleButtonGroupComponent,
        RtIconButtonComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtPageHeaderMatrixComponent {
    public part: TPageHeaderMatrixPart = 'items';

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public readonly scrollAttribute: string = PAGE_HEADER_COMPACT_SCROLL_ATTRIBUTE;

    /** Варианты отбора в центральном слоте сжатой полосы — содержимое слота рисует потребитель. */
    public readonly filterOptions: ReadonlyArray<IRtToggleButtonGroup.Option<string>> = [
        { value: 'all', label: 'Все' },
        { value: 'active', label: 'Активные' },
        { value: 'archive', label: 'Архив' },
    ];

    /** Ширина ячейки: полоса тянется на всю ширину родителя и по содержимому схлопнулась бы. */
    public readonly headerWidth: string = '26rem';

    public readonly user: IRtPageHeader.User = { name: 'Иванов Иван', avatar: 'И' };

    /** Плоские пункты-ссылки: у каждого свой адрес, переходят они сами. */
    public readonly flatItems: ReadonlyArray<IRtPageHeader.Item> = [
        { id: 'tours', label: 'Туры', route: '/tours' },
        { id: 'orders', label: 'Заявки', route: '/orders', unread: true },
        { id: 'reports', label: 'Отчёты', route: '/reports', disabled: true },
    ];

    /** Раздел с панелью второго уровня: ему некуда вести, он раскрывает панель. */
    public readonly mixedItems: ReadonlyArray<IRtPageHeader.Item> = [
        { id: 'tours', label: 'Туры', route: '/tours' },
        {
            id: 'catalog',
            label: 'Справочники',
            icon: 'book',
            unread: true,
            columns: [
                {
                    id: 'left',
                    groups: [
                        {
                            id: 'geo',
                            label: 'География',
                            items: [
                                { id: 'countries', label: 'Страны', route: '/countries' },
                                { id: 'cities', label: 'Города', route: '/cities', unread: true },
                            ],
                        },
                    ],
                },
                {
                    id: 'right',
                    groups: [
                        {
                            id: 'money',
                            label: 'Финансы',
                            items: [
                                { id: 'rates', label: 'Курсы валют', route: '/rates' },
                                { id: 'taxes', label: 'Налоги', disabled: true },
                            ],
                        },
                    ],
                },
            ],
        },
        { id: 'reports', label: 'Отчёты', route: '/reports' },
    ];

    /**
     * Разделы для сжатой полосы: у первых двух есть иконка — они станут кругами, — у третьего
     * нет, и он остаётся только под кнопкой «ещё».
     */
    public readonly compactItems: ReadonlyArray<IRtPageHeader.Item> = [
        { id: 'tours', label: 'Туры', route: '/tours', icon: 'chart-bar' },
        { id: 'clients', label: 'Клиенты', route: '/clients', icon: 'users', unread: true },
        { id: 'reports', label: 'Отчёты', route: '/reports' },
        this.mixedItems[1],
    ];

    public readonly itemsCases: readonly IPageHeaderItemsCase[] = [
        { name: 'плоские ссылки', items: this.flatItems },
        { name: 'с панелью второго уровня', items: this.mixedItems },
    ];

    public readonly userCases: readonly IPageHeaderUserCase[] = [
        { name: 'без блока', user: null, userTitle: '' },
        { name: 'с инициалом', user: { name: 'Иванов Иван', avatar: 'И' }, userTitle: '' },
        { name: 'без инициала', user: { name: 'Петров Пётр' }, userTitle: 'Профиль' },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
