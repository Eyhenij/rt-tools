import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { RtAsideHeaderComponent } from '../../rt-aside-header.component';
import { IRtAsideHeader } from '../../rt-aside-header.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type AsideHeaderMatrixPart = 'heading' | 'badges' | 'states' | 'themes';

/** Заголовок вместе с надзаголовком: порознь они не бывают — надзаголовок стоит над заголовком. */
interface IAsideHeaderHeadingCase {
    readonly name: string;
    readonly title: string;
    readonly overline: string | null;
    readonly closable: boolean;
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

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtAsideHeaderMatrixComponent {
    public part: AsideHeaderMatrixPart = 'heading';

    /** Ширина ячейки: шапка занимает всю ширину панели, и по содержимому она бы схлопнулась. */
    public readonly headerWidth: string = '20rem';

    /** Бэйджи светло-тёмной пары: одна палитра неотличима от другой, пока они не рядом. */
    public readonly statusBadges: readonly IRtAsideHeader.Badge[] = [
        { value: 'Оплачен', severity: 'success' },
        { value: 'Горящий', severity: 'warning' },
    ];

    public readonly headingCases: readonly IAsideHeaderHeadingCase[] = [
        { name: 'заголовок', title: 'Тур в Сочи', overline: null, closable: true },
        { name: 'с надзаголовком', title: 'Тур в Сочи', overline: 'Заявка № 1024', closable: true },
        { name: 'без стрелки', title: 'Тур в Сочи', overline: 'Заявка № 1024', closable: false },
        {
            name: 'длинный заголовок',
            title: 'Тур в Сочи с перелётом, трансфером и экскурсионной программой',
            overline: 'Заявка № 1024',
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

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
