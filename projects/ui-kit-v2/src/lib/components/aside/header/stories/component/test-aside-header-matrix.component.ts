import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtInputComponent } from '../../../../input/rt-input.component';
import { RtTagComponent } from '../../../../tag/rt-tag.component';
import { StoryRowComponent } from '../../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { RtAsideHeaderComponent } from '../../rt-aside-header.component';
import { IRtAsideHeader } from '../../rt-aside-header.model';

/** Заголовок записи, на которой показаны все состояния шапки. */
const TOUR_TITLE: string = 'Тур в Сочи';

/** Надзаголовок той же записи. */
const REQUEST_OVERLINE: string = 'Заявка № 1024';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAsideHeaderMatrixPart = 'heading' | 'badges' | 'states' | 'row' | 'properties' | 'themes';

/** Заголовок вместе с надзаголовком: порознь они не бывают — надзаголовок стоит над заголовком. */
interface IAsideHeaderHeadingCase {
    readonly name: string;
    readonly title: string;
    readonly overline: string | null;
    readonly closable: boolean;
}

/** Случай свойств шапки: значения ставятся на предка, как их ставит приложение. */
interface IAsideHeaderPropertiesCase {
    readonly name: string;
    readonly ancestorStyle: Readonly<Record<string, string>> | null;
    readonly heading: boolean;
}

/** Ряд бэйджей под заголовком: их вид задаётся не входами шапки, а самими бэйджами. */
interface IAsideHeaderBadgeCase {
    readonly name: string;
    readonly badges: readonly IRtAsideHeader.Badge[];
}

/**
 * Матрицы состояний `rt-aside-header` для витрины.
 *
 * Шапка показана без вмещающей панели: она самостоятельный компонент. Как она выглядит внутри
 * панели, показывает матрица `Aside → Size`.
 *
 * Ширина ячейки задана: шапка занимает всю ширину панели, и по содержимому она бы схлопнулась,
 * показывая не раскладку, а её отсутствие.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-aside-header-matrix',
    template: `
        @switch (part) {
            @case ('heading') {
                <app-story-row
                    caption="Заголовок и стрелка возврата"
                    [items]="headingCases"
                    [itemLabel]="caseLabel"
                    [slotWidth]="headerWidth">
                    <ng-template let-headingCase>
                        <rt-aside-header
                            class="app-aside-header-matrix__header"
                            [title]="headingCase.title"
                            [overline]="headingCase.overline"
                            [closable]="headingCase.closable" />
                    </ng-template>
                </app-story-row>
            }

            @case ('badges') {
                <app-story-row caption="Бэйджи под заголовком" [items]="badgeCases" [itemLabel]="caseLabel" [slotWidth]="headerWidth">
                    <ng-template let-badgeCase>
                        <rt-aside-header
                            class="app-aside-header-matrix__header"
                            title="Тур в Сочи"
                            overline="Заявка № 1024"
                            [badges]="badgeCase.badges" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Загрузка заголовка" [items]="loadingCases" [itemLabel]="caseLabel" [slotWidth]="headerWidth">
                    <ng-template let-loadingCase>
                        <rt-aside-header
                            class="app-aside-header-matrix__header"
                            title="Тур в Сочи"
                            overline="Заявка № 1024"
                            [loading]="loadingCase.loading" />
                    </ng-template>
                </app-story-row>
            }

            @case ('row') {
                <app-story-row caption="Строка под заголовком" [items]="rowCases" [itemLabel]="caseLabel" [slotWidth]="headerWidth">
                    <ng-template let-rowCase>
                        <rt-aside-header class="app-aside-header-matrix__header" title="Туристы" overline="Заявка № 1024">
                            @if (rowCase.row) {
                                <rt-input
                                    asideHeaderContent
                                    placeholder="Поиск по туристам"
                                    ariaLabel="Поиск по туристам"
                                    iconLeft="search" />
                            }
                        </rt-aside-header>
                    </ng-template>
                </app-story-row>
            }

            @case ('properties') {
                <app-story-row
                    caption="Свойства шапки с предка"
                    [items]="propertiesCases"
                    [itemLabel]="caseLabel"
                    [slotWidth]="headerWidth">
                    <ng-template let-propertiesCase>
                        <!-- Предок без своей коробки: значения свойств доходят до шапки наследованием,
                             а ширина ячейки достаётся ей самой. -->
                        <div style="display: contents" [style]="propertiesCase.ancestorStyle ?? {}">
                            <rt-aside-header class="app-aside-header-matrix__header" title="Тур в Сочи" subtitle="Заявка № 1024">
                                @if (propertiesCase.heading) {
                                    <rt-tag asideHeadingContent value="Оплачен" severity="success" />
                                }
                            </rt-aside-header>
                        </div>
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Шапка в обеих темах">
                    <ng-template>
                        <rt-aside-header title="Тур в Сочи" overline="Заявка № 1024" [badges]="statusBadges" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    styles: `
        /* Ячейка ряда центрирует содержимое, и шапка бралась по своей начинке: короткая
           сжималась вдвое, а длинный заголовок разрастался на 706 px в ячейке 320 и
           наезжал на соседнюю. Ширина ячейки должна доставаться шапке — только тогда
           видно, что длинный заголовок обрезается многоточием. */
        .app-aside-header-matrix__header {
            width: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAsideHeaderComponent,
        RtInputComponent,
        RtTagComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtAsideHeaderMatrixComponent {
    public part: TAsideHeaderMatrixPart = 'heading';

    /** Ширина ячейки: шапка занимает всю ширину панели, и по содержимому она бы схлопнулась. */
    public readonly headerWidth: string = '20rem';

    /** Бэйджи светло-тёмной пары: одна палитра неотличима от другой, пока они не рядом. */
    public readonly statusBadges: readonly IRtAsideHeader.Badge[] = [
        { value: 'Оплачен', severity: 'success' },
        { value: 'Горящий', severity: 'warning' },
    ];

    public readonly headingCases: readonly IAsideHeaderHeadingCase[] = [
        { name: 'заголовок', title: TOUR_TITLE, overline: null, closable: true },
        { name: 'с надзаголовком', title: TOUR_TITLE, overline: REQUEST_OVERLINE, closable: true },
        { name: 'без стрелки', title: TOUR_TITLE, overline: REQUEST_OVERLINE, closable: false },
        {
            name: 'длинный заголовок',
            title: 'Тур в Сочи с перелётом, трансфером и экскурсионной программой',
            overline: REQUEST_OVERLINE,
            closable: true,
        },
    ];

    public readonly badgeCases: readonly IAsideHeaderBadgeCase[] = [
        { name: 'без бэйджей', badges: [] },
        { name: 'один', badges: [{ value: 'Оплачен', severity: 'success' }] },
        { name: 'несколько', badges: this.statusBadges },
        {
            name: 'со ссылкой',
            badges: [{ value: 'Договор', severity: 'info', href: 'https://example.com' }],
        },
    ];

    public readonly loadingCases: readonly { readonly name: string; readonly loading: boolean }[] = [
        { name: 'загружено', loading: false },
        { name: 'загрузка', loading: true },
    ];

    /** Строка под заголовком: без неё шапка та же, что прежде, с ней поле встаёт на всю ширину. */
    public readonly rowCases: readonly { readonly name: string; readonly row: boolean }[] = [
        { name: 'без строки', row: false },
        { name: 'со строкой', row: true },
    ];

    /** Свойства шапки: без них, все с предка, и слот колонки заголовка под подписью. */
    public readonly propertiesCases: readonly IAsideHeaderPropertiesCase[] = [
        { name: 'по умолчанию', ancestorStyle: null, heading: false },
        {
            name: 'свойства с предка',
            ancestorStyle: {
                '--rt-aside-header-title-size': 'var(--rt-text-2xl)',
                '--rt-aside-header-title-weight': 'var(--rt-font-weight-semibold)',
                '--rt-aside-header-subtitle-size': 'var(--rt-text-md)',
                '--rt-aside-header-gap': 'var(--rt-space-md)',
                '--rt-aside-header-min-height': '96px',
                '--rt-aside-header-back-size': '36px',
                '--rt-aside-header-back-icon-size': '24px',
            },
            heading: false,
        },
        { name: 'слот колонки заголовка', ancestorStyle: null, heading: true },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
