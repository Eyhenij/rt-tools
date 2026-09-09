import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_FIELD_WIDTH_WIDE } from '../../../../../showcase/story-metrics';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtToggleButtonGroup } from '../../rt-toggle-button-group.model';
import { RtToggleButtonGroupComponent } from '../../rt-toggle-button-group.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TToggleButtonGroupMatrixPart =
    'size' | 'options' | 'value' | 'fullWidth' | 'multiple' | 'disabledOption' | 'states' | 'presets' | 'themes';

/** Набор сегментов: подписи, подписи с иконками, две штуки против пяти. */
interface IGroupOptionsCase {
    readonly name: string;
    readonly options: ReadonlyArray<IRtToggleButtonGroup.Option>;
    readonly value: string;
}

/** Что выбрано в множественной группе: пусто, один, часть, всё. */
interface IGroupMultipleCase {
    readonly name: string;
    readonly values: ReadonlyArray<string>;
}

/** Какой сегмент выбран: край группы и середина скругляются по-разному. */
interface IGroupValueCase {
    readonly name: string;
    readonly value: string | undefined;
}

const PERIOD: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'day', label: 'День' },
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
];

/** Недоступен средний сегмент: видно, что группа не схлопывается и края остаются прежними. */
const PERIOD_WITH_DISABLED: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'day', label: 'День' },
    { value: 'week', label: 'Неделя', disabled: true },
    { value: 'month', label: 'Месяц' },
];

/** Недоступен выбранный сегмент: подсветка выбранного и приглушённость показаны вместе. */
const PERIOD_DISABLED_CHOSEN: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'day', label: 'День', disabled: true },
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
];

const VIEW: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'list', label: 'Списком', icon: 'ico-listing', title: 'Показать списком' },
    { value: 'grid', label: 'Плиткой', icon: 'bars', title: 'Показать плиткой' },
];

/**
 * Матрицы состояний `rt-toggle-button-group` для витрины.
 *
 * Выбранный сегмент — отдельная ось: у крайних кнопок скругление своё, и подсветка первого,
 * среднего и последнего выглядит по-разному. Группа не держит состояния, поэтому в каждой
 * ячейке `value` задано снаружи и не меняется от нажатия — витрина показывает вид, а не работу.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-toggle-button-group-matrix',
    template: `
        @switch (part) {
            @case ('size') {
                <app-story-row caption="Размер" [items]="sizes">
                    <ng-template let-size>
                        <rt-toggle-button-group ariaLabel="Период" value="week" [options]="period" [size]="size" />
                    </ng-template>
                </app-story-row>
            }

            @case ('options') {
                <app-story-row caption="Наполнение сегментов" [items]="optionCases" [itemLabel]="caseLabel">
                    <ng-template let-optionCase>
                        <rt-toggle-button-group [ariaLabel]="optionCase.name" [options]="optionCase.options" [value]="optionCase.value" />
                    </ng-template>
                </app-story-row>
            }

            @case ('value') {
                <app-story-row caption="Выбранный сегмент" [items]="valueCases" [itemLabel]="caseLabel">
                    <ng-template let-valueCase>
                        <rt-toggle-button-group [ariaLabel]="valueCase.name" [options]="period" [value]="valueCase.value" />
                    </ng-template>
                </app-story-row>
            }

            @case ('fullWidth') {
                <app-story-row caption="Ширина" [items]="widthNames" [slotWidth]="groupWidth">
                    <ng-template let-widthName>
                        <rt-toggle-button-group
                            ariaLabel="Период"
                            value="week"
                            [options]="period"
                            [fullWidth]="widthName === 'fullWidth'" />
                    </ng-template>
                </app-story-row>
            }

            @case ('multiple') {
                <app-story-row caption="Множественный выбор" [items]="multipleCases" [itemLabel]="caseLabel">
                    <ng-template let-multipleCase>
                        <rt-toggle-button-group
                            multiple
                            [ariaLabel]="multipleCase.name"
                            [options]="period"
                            [values]="multipleCase.values" />
                    </ng-template>
                </app-story-row>
            }

            @case ('disabledOption') {
                <app-story-row caption="Недоступный сегмент" [items]="disabledCases" [itemLabel]="caseLabel">
                    <ng-template let-disabledCase>
                        <rt-toggle-button-group ariaLabel="Период" value="day" [options]="disabledCase.options" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие с сегментом" [items]="states" [itemLabel]="stateLabel">
                    <ng-template let-state>
                        <rt-toggle-button-group ariaLabel="Период" value="week" [options]="period" [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>

                <app-story-row caption="Отключение" [items]="valueCases" [itemLabel]="caseLabel">
                    <ng-template let-valueCase>
                        <rt-toggle-button-group disabled [ariaLabel]="valueCase.name" [options]="period" [value]="valueCase.value" />
                    </ng-template>
                </app-story-row>
            }

            @case ('presets') {
                <app-story-presets caption="Группа в обоих наборах">
                    <ng-template>
                        <rt-toggle-button-group ariaLabel="Период" value="week" [options]="period" />
                        <rt-toggle-button-group ariaLabel="Вид" value="grid" [options]="view" />
                        <rt-toggle-button-group disabled ariaLabel="Отключена" value="week" [options]="period" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Группа в обеих темах">
                    <ng-template>
                        <rt-toggle-button-group ariaLabel="Период" value="week" [options]="period" />
                        <rt-toggle-button-group ariaLabel="Вид" value="grid" [options]="view" />
                        <rt-toggle-button-group disabled ariaLabel="Отключена" value="week" [options]="period" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtToggleButtonGroupComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtToggleButtonGroupMatrixComponent {
    public part: TToggleButtonGroupMatrixPart = 'size';

    public readonly groupWidth: string = STORY_FIELD_WIDTH_WIDE;
    public readonly sizes: readonly IRtToggleButtonGroup.Size[] = ['sm', 'md', 'lg'];
    public readonly states: readonly IStoryState[] = STORY_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;
    public readonly widthNames: readonly string[] = ['по содержимому', 'fullWidth'];

    public readonly period: ReadonlyArray<IRtToggleButtonGroup.Option> = PERIOD;
    public readonly view: ReadonlyArray<IRtToggleButtonGroup.Option> = VIEW;

    public readonly optionCases: readonly IGroupOptionsCase[] = [
        { name: 'только подписи', options: PERIOD, value: 'week' },
        { name: 'иконка и подпись', options: VIEW, value: 'grid' },
        {
            name: 'пять сегментов',
            options: [
                { value: 'all', label: 'Все' },
                { value: 'new', label: 'Новые' },
                { value: 'work', label: 'В работе' },
                { value: 'done', label: 'Готовы' },
                { value: 'archive', label: 'Архив' },
            ],
            value: 'work',
        },
    ];

    public readonly multipleCases: readonly IGroupMultipleCase[] = [
        { name: 'ничего не выбрано', values: [] },
        { name: 'один', values: ['week'] },
        { name: 'два', values: ['day', 'month'] },
        { name: 'все', values: ['day', 'week', 'month'] },
    ];

    public readonly disabledCases: readonly IGroupOptionsCase[] = [
        { name: 'недоступен средний', options: PERIOD_WITH_DISABLED, value: 'day' },
        { name: 'недоступен выбранный', options: PERIOD_DISABLED_CHOSEN, value: 'day' },
    ];

    public readonly valueCases: readonly IGroupValueCase[] = [
        // eslint-disable-next-line sonarjs/no-undefined-assignment -- вход кита объявлен `string | undefined`, и «ничего не выбрано» на нём выражается только пустотой
        { name: 'ничего не выбрано', value: undefined },
        { name: 'первый', value: 'day' },
        { name: 'средний', value: 'week' },
        { name: 'последний', value: 'month' },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
