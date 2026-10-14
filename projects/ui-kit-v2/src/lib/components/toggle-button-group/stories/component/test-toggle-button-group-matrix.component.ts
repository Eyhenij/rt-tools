import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_FIELD_WIDTH_WIDE } from '../../../../../showcase/story-metrics';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtIconComponent } from '../../../icon/rt-icon.component';
import { IRtToggleButtonGroup } from '../../rt-toggle-button-group.model';
import { RtToggleButtonGroupComponent } from '../../rt-toggle-button-group.component';
import { RtToggleButtonOptionDirective } from '../../rt-toggle-button-option.directive';
import { TestRtToggleButtonGroupFormsComponent } from './test-toggle-button-group-forms.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TToggleButtonGroupMatrixPart =
    | 'size'
    | 'options'
    | 'value'
    | 'fullWidth'
    | 'multiple'
    | 'disabledOption'
    | 'states'
    | 'forms'
    | 'optionTemplate'
    | 'layout'
    | 'presets'
    | 'themes';

/** Раскладка и ширина, в которую группа поставлена: перенос виден только в узком месте. */
interface IGroupLayoutCase {
    readonly name: string;
    readonly layout: IRtToggleButtonGroup.Layout;
    readonly width: string;
}

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

/** Форматы выгрузки: значок формата в сегменте нарисован своей разметкой. */
const FORMATS: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'pdf', label: 'PDF', icon: 'attach-pdf' },
    { value: 'xlsx', label: 'Excel', icon: 'attach-xlsx-xls' },
    { value: 'docx', label: 'Word', icon: 'attach-docx-doc' },
    { value: 'zip', label: 'Архив', icon: 'attach-zip-rar' },
];

const DAYS: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'mon', label: 'Понедельник' },
    { value: 'tue', label: 'Вторник' },
    { value: 'wed', label: 'Среда' },
    { value: 'thu', label: 'Четверг' },
    { value: 'fri', label: 'Пятница' },
    { value: 'sat', label: 'Суббота' },
    { value: 'sun', label: 'Воскресенье' },
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
                <app-story-presets caption="Размер в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="sizes">
                            <ng-template let-size>
                                <rt-toggle-button-group ariaLabel="Период" value="week" [options]="period" [size]="size" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('options') {
                <app-story-presets caption="Наполнение сегментов в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="optionCases" [itemLabel]="caseLabel">
                            <ng-template let-optionCase>
                                <rt-toggle-button-group
                                    [ariaLabel]="optionCase.name"
                                    [options]="optionCase.options"
                                    [value]="optionCase.value" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('value') {
                <app-story-presets caption="Выбранный сегмент в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="valueCases" [itemLabel]="caseLabel">
                            <ng-template let-valueCase>
                                <rt-toggle-button-group [ariaLabel]="valueCase.name" [options]="period" [value]="valueCase.value" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('fullWidth') {
                <app-story-presets caption="Ширина в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="widthNames" [slotWidth]="groupWidth">
                            <ng-template let-widthName>
                                <rt-toggle-button-group
                                    ariaLabel="Период"
                                    value="week"
                                    [options]="period"
                                    [fullWidth]="widthName === 'fullWidth'" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('multiple') {
                <app-story-presets caption="Множественный выбор в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="multipleCases" [itemLabel]="caseLabel">
                            <ng-template let-multipleCase>
                                <rt-toggle-button-group
                                    multiple
                                    [ariaLabel]="multipleCase.name"
                                    [options]="period"
                                    [values]="multipleCase.values" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('disabledOption') {
                <app-story-presets caption="Недоступный сегмент в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="disabledCases" [itemLabel]="caseLabel">
                            <ng-template let-disabledCase>
                                <rt-toggle-button-group ariaLabel="Период" value="day" [options]="disabledCase.options" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('states') {
                <app-story-presets caption="Взаимодействие с сегментом в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="states" [itemLabel]="stateLabel">
                            <ng-template let-state>
                                <rt-toggle-button-group
                                    ariaLabel="Период"
                                    value="week"
                                    [options]="period"
                                    [attr.data-story-state]="state.state" />
                            </ng-template>
                        </app-story-row>

                        <app-story-row caption="Отключение" [items]="valueCases" [itemLabel]="caseLabel">
                            <ng-template let-valueCase>
                                <rt-toggle-button-group
                                    disabled
                                    [ariaLabel]="valueCase.name"
                                    [options]="period"
                                    [value]="valueCase.value" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('forms') {
                <app-story-presets caption="Группа в форме в обоих наборах">
                    <ng-template>
                        <app-toggle-button-group-forms />
                    </ng-template>
                </app-story-presets>
            }

            @case ('optionTemplate') {
                <app-story-presets caption="Своя разметка сегмента в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="sizes">
                            <ng-template let-size>
                                <rt-toggle-button-group ariaLabel="Формат" value="xlsx" layout="wrap" [options]="formats" [size]="size">
                                    <ng-template rtToggleButtonOption let-option let-active="active">
                                        <span class="app-toggle-matrix__tile">
                                            <rt-icon size="xl" [name]="option.icon" />
                                            <span [class.app-toggle-matrix__tile-label--active]="active">{{ option.label }}</span>
                                        </span>
                                    </ng-template>
                                </rt-toggle-button-group>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('layout') {
                <app-story-presets caption="Раскладка в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="layoutCases" [itemLabel]="caseLabel">
                            <ng-template let-layoutCase>
                                <div class="app-toggle-matrix__frame" [style.inline-size]="layoutCase.width">
                                    <rt-toggle-button-group
                                        multiple
                                        ariaLabel="Дни"
                                        [layout]="layoutCase.layout"
                                        [options]="days"
                                        [values]="weekdays" />
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
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
                <app-story-presets caption="Группа в обеих темах и обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <rt-toggle-button-group ariaLabel="Период" value="week" [options]="period" />
                                <rt-toggle-button-group ariaLabel="Вид" value="grid" [options]="view" />
                                <rt-toggle-button-group disabled ariaLabel="Отключена" value="week" [options]="period" />
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    // native-ok: обёртка истории витрины — правила коробки живут рядом с показом, а не отдельным файлом
    styles: `
        .app-toggle-matrix__frame {
            outline: 1px dashed var(--rt-color-border-default);
        }

        .app-toggle-matrix__tile {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            padding-block: var(--rt-space-2);
            gap: var(--rt-space-1);
        }

        .app-toggle-matrix__tile-label--active {
            text-decoration: underline;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtIconComponent,
        RtToggleButtonGroupComponent,
        RtToggleButtonOptionDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
        TestRtToggleButtonGroupFormsComponent,
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
    public readonly formats: ReadonlyArray<IRtToggleButtonGroup.Option> = FORMATS;
    public readonly days: ReadonlyArray<IRtToggleButtonGroup.Option> = DAYS;
    public readonly weekdays: ReadonlyArray<string> = ['mon', 'wed', 'fri'];

    public readonly layoutCases: readonly IGroupLayoutCase[] = [
        { name: 'row, по содержимому', layout: 'row', width: 'auto' },
        { name: 'wrap, 22rem', layout: 'wrap', width: STORY_FIELD_WIDTH_WIDE },
        { name: 'column', layout: 'column', width: 'auto' },
    ];

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
