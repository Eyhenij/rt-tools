import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtPageHeader } from '../../rt-page-header.model';
import { RtPageHeaderComponent } from '../../rt-page-header.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type PageHeaderMatrixPart = 'items' | 'user' | 'themes' | 'panel';

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
        }
    `,
    styles: `
        /* Панель второго уровня уезжает в контейнер оверлеев и встаёт под полосой: без запаса
           снизу она вышла бы за нижний край окна. */
        .app-page-header-matrix__panel-slot {
            padding-bottom: 20rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtPageHeaderComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtPageHeaderMatrixComponent {
    public part: PageHeaderMatrixPart = 'items';

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

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
