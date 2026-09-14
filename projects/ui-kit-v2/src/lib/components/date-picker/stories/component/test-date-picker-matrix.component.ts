import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { STORY_FIELD_WIDTH } from '../../../../../showcase/story-metrics';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { IStoryState, STORY_FIELD_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { IRtInput } from '../../../input/rt-input.model';
import { IRtDatePicker } from '../../rt-date-picker.model';
import { RtDatePickerComponent } from '../../rt-date-picker.component';

/** Дата, на которой показаны все состояния поля. */
const SAMPLE_DATE: string = '2026-03-15';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TDatePickerMatrixPart = 'size' | 'type' | 'filling' | 'bordered' | 'states' | 'presets' | 'themes';

/** Случай с подписью и своим значением — ISO-строкой, ровно такой, какую отдаёт нативное поле. */
interface IDatePickerCase {
    readonly name: string;
    readonly control: FormControl<string>;
}

/** Тип поля решает и вид календаря, и формат ISO-строки. */
interface IDatePickerTypeCase extends IDatePickerCase {
    readonly type: IRtDatePicker.Type;
}

/** Рамка покоя: снята она или нет. */
interface IDatePickerBorderedCase extends IDatePickerCase {
    readonly bordered: boolean;
}

/** Отключённость — единственное, что светло-тёмная пара меняет от ячейки к ячейке. */
interface IDatePickerThemeCase extends IDatePickerCase {
    readonly disabled: boolean;
}

/** Состояние, которое задаётся не псевдоклассом, а значением, формой или обёрткой. */
interface IDatePickerStateCase extends IDatePickerThemeCase {
    /** Плоский режим чтения включает вмещающее поле, поэтому ячейка обёрнута в `rt-field`. */
    readonly flat: boolean;
}

function iso(value: string): FormControl<string> {
    return new FormControl<string>(value, { nonNullable: true });
}

/**
 * Поле, уже подсвеченное ошибкой: касание проставляется здесь, потому что подсветка включается
 * по `invalid && (touched || dirty)` — до касания невалидное поле выглядит исправным.
 */
function invalid(): FormControl<string> {
    const control: FormControl<string> = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });
    control.markAsTouched();
    return control;
}

/**
 * Матрицы состояний `rt-date-picker` для витрины.
 *
 * Оси не перемножены: размер и тип меняют разные части поля.
 *
 * Что показывает витрина, зависит от браузера: календарь, раскладку и способ ввода рисует он,
 * а не кит. На другой платформе те же ячейки выглядят иначе — и это не расхождение, а контракт
 * компонента.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-date-picker-matrix',
    template: `
        @switch (part) {
            @case ('size') {
                <app-story-presets caption="Размер в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="sizes" [slotWidth]="fieldWidth">
                            <ng-template let-size>
                                <rt-date-picker ariaLabel="Размер" [size]="size" [formControl]="sizeValue" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('type') {
                <app-story-presets caption="Тип в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="typeCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-typeCase>
                                <rt-date-picker [type]="typeCase.type" [ariaLabel]="typeCase.name" [formControl]="typeCase.control" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('filling') {
                <app-story-presets caption="Наполненность и очистка в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="fillingCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-fillingCase>
                                <rt-date-picker [ariaLabel]="fillingCase.name" [formControl]="fillingCase.control" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('bordered') {
                <app-story-presets caption="Рамка в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="borderedCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-borderedCase>
                                <rt-date-picker
                                    [bordered]="borderedCase.bordered"
                                    [ariaLabel]="borderedCase.name"
                                    [formControl]="borderedCase.control" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('states') {
                <app-story-presets caption="Взаимодействие в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="states" [itemLabel]="stateLabel" [slotWidth]="fieldWidth">
                            <ng-template let-state>
                                <rt-date-picker ariaLabel="Состояние" [attr.data-story-state]="state.state" [formControl]="stateValue" />
                            </ng-template>
                        </app-story-row>

                        <app-story-row
                            caption="Значение, форма и обёртка"
                            [items]="stateCases"
                            [itemLabel]="caseLabel"
                            [slotWidth]="fieldWidth">
                            <ng-template let-stateCase>
                                @if (stateCase.flat) {
                                    <rt-field [readonly]="true">
                                        <rt-date-picker [ariaLabel]="stateCase.name" [formControl]="stateCase.control" />
                                    </rt-field>
                                } @else {
                                    <rt-date-picker
                                        [disabled]="stateCase.disabled"
                                        [ariaLabel]="stateCase.name"
                                        [formControl]="stateCase.control" />
                                }
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Поле в обоих наборах">
                    <ng-template>
                        @for (themeCase of themeCases; track themeCase.name) {
                            <rt-date-picker
                                [disabled]="themeCase.disabled"
                                [ariaLabel]="themeCase.name"
                                [formControl]="themeCase.control" />
                        }
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Поле в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                @for (themeCase of themeCases; track themeCase.name) {
                                    <rt-date-picker
                                        [disabled]="themeCase.disabled"
                                        [ariaLabel]="themeCase.name"
                                        [formControl]="themeCase.control" />
                                }
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtDatePickerComponent,
        RtFieldComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDatePickerMatrixComponent {
    public part: TDatePickerMatrixPart = 'size';

    public readonly fieldWidth: string = STORY_FIELD_WIDTH;
    public readonly sizes: readonly IRtInput.Size[] = ['sm', 'md', 'lg'];
    public readonly states: readonly IStoryState[] = STORY_FIELD_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    public readonly sizeValue: FormControl<string> = iso(SAMPLE_DATE);
    public readonly stateValue: FormControl<string> = iso(SAMPLE_DATE);

    public readonly typeCases: readonly IDatePickerTypeCase[] = [
        { name: 'date', type: 'date', control: iso(SAMPLE_DATE) },
        { name: 'datetime-local', type: 'datetime-local', control: iso('2026-03-15T09:30') },
        { name: 'time', type: 'time', control: iso('09:30') },
    ];

    public readonly fillingCases: readonly IDatePickerCase[] = [
        { name: 'пусто', control: iso('') },
        { name: 'со значением', control: iso(SAMPLE_DATE) },
    ];

    public readonly borderedCases: readonly IDatePickerBorderedCase[] = [
        { name: 'с рамкой', bordered: true, control: iso(SAMPLE_DATE) },
        { name: 'без рамки', bordered: false, control: iso(SAMPLE_DATE) },
    ];

    public readonly stateCases: readonly IDatePickerStateCase[] = [
        { name: 'ошибка', control: invalid(), disabled: false, flat: false },
        { name: 'отключено', control: iso(SAMPLE_DATE), disabled: true, flat: false },
        { name: 'только чтение', control: iso(SAMPLE_DATE), disabled: false, flat: true },
        { name: 'только чтение без значения', control: iso(''), disabled: false, flat: true },
    ];

    public readonly themeCases: readonly IDatePickerThemeCase[] = [
        { name: 'пустое', control: iso(''), disabled: false },
        { name: 'со значением', control: iso(SAMPLE_DATE), disabled: false },
        { name: 'ошибка', control: invalid(), disabled: false },
        { name: 'отключено', control: iso(SAMPLE_DATE), disabled: true },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: IDatePickerCase) => string = (value: IDatePickerCase): string => value.name;
}
