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
import {
    DAYS,
    FORMATS,
    IGroupLayoutCase,
    IGroupMultipleCase,
    IGroupOptionsCase,
    IGroupValueCase,
    PERIOD,
    PERIOD_DISABLED_CHOSEN,
    PERIOD_WITH_DISABLED,
    VIEW,
} from './toggle-button-group-cases';

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
    | 'appearance'
    | 'chipsStates'
    | 'presets'
    | 'themes';

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

            @case ('appearance') {
                <app-story-presets caption="Вид группы в обоих наборах">
                    <ng-template>
                        <app-story-row caption="Вид" [items]="appearances">
                            <ng-template let-appearance>
                                <rt-toggle-button-group ariaLabel="Период" value="week" [appearance]="appearance" [options]="period" />
                            </ng-template>
                        </app-story-row>

                        <app-story-row caption="Чипы: галочка у выбранного" [items]="checkmarkNames">
                            <ng-template let-checkmarkName>
                                <rt-toggle-button-group
                                    multiple
                                    appearance="chips"
                                    ariaLabel="Период"
                                    [checkmark]="checkmarkName === 'с галочкой'"
                                    [options]="period"
                                    [values]="twoChosen" />
                            </ng-template>
                        </app-story-row>

                        <app-story-row caption="Чипы: размер, с галочкой" [items]="sizes">
                            <ng-template let-size>
                                <rt-toggle-button-group
                                    checkmark
                                    appearance="chips"
                                    ariaLabel="Период"
                                    value="week"
                                    [options]="period"
                                    [size]="size" />
                            </ng-template>
                        </app-story-row>

                        <app-story-row caption="Чипы: недоступный пункт" [items]="disabledCases" [itemLabel]="caseLabel">
                            <ng-template let-disabledCase>
                                <rt-toggle-button-group
                                    checkmark
                                    appearance="chips"
                                    ariaLabel="Период"
                                    value="day"
                                    [options]="disabledCase.options" />
                            </ng-template>
                        </app-story-row>

                        <app-story-row caption="Чипы: отключённая группа и значки" [items]="chipGroupCases" [itemLabel]="caseLabel">
                            <ng-template let-chipCase>
                                <rt-toggle-button-group
                                    checkmark
                                    appearance="chips"
                                    [ariaLabel]="chipCase.name"
                                    [disabled]="chipCase.name === 'отключена'"
                                    [options]="chipCase.options"
                                    [value]="chipCase.value" />
                            </ng-template>
                        </app-story-row>

                        <app-story-row caption="Чипы: раскладка" [items]="chipLayoutCases" [itemLabel]="caseLabel">
                            <ng-template let-layoutCase>
                                <div class="app-toggle-matrix__frame" [style.inline-size]="layoutCase.width">
                                    <rt-toggle-button-group
                                        multiple
                                        checkmark
                                        appearance="chips"
                                        ariaLabel="Дни"
                                        [fullWidth]="!!layoutCase.fullWidth"
                                        [layout]="layoutCase.layout"
                                        [options]="days"
                                        [values]="weekdays" />
                                </div>
                            </ng-template>
                        </app-story-row>

                        <app-story-row caption="Сегменты: недоступный пункт и галочка" [items]="disabledCases" [itemLabel]="caseLabel">
                            <ng-template let-disabledCase>
                                <rt-toggle-button-group checkmark ariaLabel="Период" value="day" [options]="disabledCase.options" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('chipsStates') {
                <app-story-presets caption="Взаимодействие с чипом в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="states" [itemLabel]="stateLabel">
                            <ng-template let-state>
                                <rt-toggle-button-group
                                    checkmark
                                    appearance="chips"
                                    ariaLabel="Период"
                                    value="week"
                                    [options]="period"
                                    [attr.data-story-state]="state.state" />
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
                        <rt-toggle-button-group checkmark appearance="chips" ariaLabel="Чипы" value="day" [options]="periodWithDisabled" />
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
                                <rt-toggle-button-group
                                    checkmark
                                    appearance="chips"
                                    ariaLabel="Чипы"
                                    value="day"
                                    [options]="periodWithDisabled" />
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
    public readonly appearances: readonly IRtToggleButtonGroup.Appearance[] = ['segmented', 'chips'];
    public readonly checkmarkNames: readonly string[] = ['без галочки', 'с галочкой'];
    public readonly twoChosen: ReadonlyArray<string> = ['day', 'month'];

    public readonly period: ReadonlyArray<IRtToggleButtonGroup.Option> = PERIOD;
    public readonly periodWithDisabled: ReadonlyArray<IRtToggleButtonGroup.Option> = PERIOD_WITH_DISABLED;
    public readonly view: ReadonlyArray<IRtToggleButtonGroup.Option> = VIEW;
    public readonly formats: ReadonlyArray<IRtToggleButtonGroup.Option> = FORMATS;
    public readonly days: ReadonlyArray<IRtToggleButtonGroup.Option> = DAYS;
    public readonly weekdays: ReadonlyArray<string> = ['mon', 'wed', 'fri'];

    public readonly layoutCases: readonly IGroupLayoutCase[] = [
        { name: 'row, по содержимому', layout: 'row', width: 'auto' },
        { name: 'wrap, 22rem', layout: 'wrap', width: STORY_FIELD_WIDTH_WIDE },
        { name: 'column', layout: 'column', width: 'auto' },
    ];

    /** Столбик чипов стоит в рамке: видно, что пункты тянутся на её ширину и с `fullWidth`. */
    public readonly chipLayoutCases: readonly IGroupLayoutCase[] = [
        ...this.layoutCases.filter((layoutCase: IGroupLayoutCase): boolean => layoutCase.layout !== 'column'),
        { name: 'column, 16rem', layout: 'column', width: '16rem' },
        { name: 'column, fullWidth, 16rem', layout: 'column', width: '16rem', fullWidth: true },
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

    public readonly chipGroupCases: readonly IGroupOptionsCase[] = [
        { name: 'отключена', options: PERIOD, value: 'week' },
        { name: 'иконка и подпись', options: VIEW, value: 'grid' },
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
