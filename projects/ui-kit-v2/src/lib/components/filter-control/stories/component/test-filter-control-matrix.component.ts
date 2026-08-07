import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_FIELD_WIDTH_WIDE } from '../../../../../showcase/story-metrics';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtFilterControl } from '../../rt-filter-control.model';
import { RtFilterControlComponent } from '../../rt-filter-control.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type FilterControlMatrixPart = 'size' | 'options' | 'value' | 'fullWidth' | 'narrow' | 'states' | 'themes';

/** Набор вариантов фильтра: с иконками и без, короткий и длинный. */
interface IFilterOptionsCase {
    readonly name: string;
    readonly options: ReadonlyArray<IRtFilterControl.Option>;
    readonly value: string;
}

/** Какой вариант выбран — «ничего не выбрано» у фильтра задаётся своей опцией, а не пустотой. */
interface IFilterValueCase {
    readonly name: string;
    readonly value: string | undefined;
}

const STATUS: ReadonlyArray<IRtFilterControl.Option> = [
    { value: 'all', label: 'Все' },
    { value: 'new', label: 'Новые' },
    { value: 'work', label: 'В работе' },
    { value: 'done', label: 'Готовы' },
];

const VIEW: ReadonlyArray<IRtFilterControl.Option> = [
    { value: 'list', label: 'Списком', icon: 'ico-listing', title: 'Показать списком' },
    { value: 'grid', label: 'Плиткой', icon: 'bars', title: 'Показать плиткой' },
];

/**
 * Матрицы состояний `rt-filter-control` для витрины.
 *
 * Главная ось здесь не вход, а ширина экрана: тот же набор рисуется сегментами на широком и
 * списком на узком. Узкое представление показывает отдельная история — она подменяет службу
 * брейкпоинтов, потому что ширину окна витрины историей не сузить.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-filter-control-matrix',
    template: `
        @switch (part) {
            @case ('size') {
                <app-story-row caption="Размер" [items]="sizes">
                    <ng-template let-size>
                        <rt-filter-control ariaLabel="Статус" value="work" [options]="status" [size]="size" />
                    </ng-template>
                </app-story-row>
            }

            @case ('options') {
                <app-story-row caption="Наполнение вариантов" [items]="optionCases" [itemLabel]="caseLabel">
                    <ng-template let-optionCase>
                        <rt-filter-control [ariaLabel]="optionCase.name" [options]="optionCase.options" [value]="optionCase.value" />
                    </ng-template>
                </app-story-row>
            }

            @case ('value') {
                <app-story-row caption="Выбранный вариант" [items]="valueCases" [itemLabel]="caseLabel">
                    <ng-template let-valueCase>
                        <rt-filter-control [ariaLabel]="valueCase.name" [options]="status" [value]="valueCase.value" />
                    </ng-template>
                </app-story-row>
            }

            @case ('fullWidth') {
                <app-story-row caption="Ширина" [items]="widthNames" [slotWidth]="controlWidth">
                    <ng-template let-widthName>
                        <rt-filter-control ariaLabel="Статус" value="work" [options]="status" [fullWidth]="widthName === 'fullWidth'" />
                    </ng-template>
                </app-story-row>
            }

            @case ('narrow') {
                <app-story-row caption="Узкий экран: тот же набор списком" [items]="narrowNames" [slotWidth]="controlWidth">
                    <ng-template>
                        <rt-filter-control ariaLabel="Статус" value="work" placeholder="Статус" [options]="status" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Отключение" [items]="valueCases" [itemLabel]="caseLabel">
                    <ng-template let-valueCase>
                        <rt-filter-control disabled [ariaLabel]="valueCase.name" [options]="status" [value]="valueCase.value" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Фильтр в обеих темах">
                    <ng-template>
                        <rt-filter-control ariaLabel="Статус" value="work" [options]="status" />
                        <rt-filter-control ariaLabel="Вид" value="grid" [options]="view" />
                        <rt-filter-control disabled ariaLabel="Отключён" value="work" [options]="status" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFilterControlComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtFilterControlMatrixComponent {
    public part: FilterControlMatrixPart = 'size';

    public readonly controlWidth: string = STORY_FIELD_WIDTH_WIDE;
    public readonly sizes: readonly IRtFilterControl.Size[] = ['sm', 'md', 'lg'];
    public readonly widthNames: readonly string[] = ['по содержимому', 'fullWidth'];
    /** Узкое представление одно — ряд из одной ячейки, чтобы подпись стояла как у остальных. */
    public readonly narrowNames: readonly string[] = ['список вместо сегментов'];

    public readonly status: ReadonlyArray<IRtFilterControl.Option> = STATUS;
    public readonly view: ReadonlyArray<IRtFilterControl.Option> = VIEW;

    public readonly optionCases: readonly IFilterOptionsCase[] = [
        { name: 'только подписи', options: STATUS, value: 'work' },
        { name: 'иконка и подпись', options: VIEW, value: 'grid' },
    ];

    public readonly valueCases: readonly IFilterValueCase[] = [
        { name: 'сброс — опция «Все»', value: 'all' },
        { name: 'средний', value: 'work' },
        { name: 'последний', value: 'done' },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
