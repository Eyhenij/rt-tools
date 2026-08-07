import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { STORY_FIELD_WIDTH } from '../../../../../showcase/story-metrics';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_FIELD_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { IRtIcon } from '../../../icon/rt-icon.model';
import { IRtInput } from '../../../input/rt-input.model';
import { RtInputNumberComponent } from '../../rt-input-number.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type InputNumberMatrixPart = 'size' | 'prefix' | 'fraction' | 'filling' | 'bordered' | 'states' | 'themes';

/** Случай с подписью и своим значением: у числового поля значение приходит только формой. */
interface IInputNumberCase {
    readonly name: string;
    readonly control: FormControl<number | null>;
}

/** Что стоит слева от числа: иконка, текстовый префикс, оба или ничего. */
interface IInputNumberPrefixCase extends IInputNumberCase {
    readonly iconLeft: IRtIcon.Name | null;
    readonly prefix: string | null;
}

/** Границы дробной части: их видно только на числе с длинным хвостом. */
interface IInputNumberFractionCase extends IInputNumberCase {
    readonly minFractionDigits: number;
    readonly maxFractionDigits: number;
}

/** Рамка покоя: снята она или нет. */
interface IInputNumberBorderedCase extends IInputNumberCase {
    readonly bordered: boolean;
}

/** Отключённость — единственное, что светло-тёмная пара меняет от ячейки к ячейке. */
interface IInputNumberThemeCase extends IInputNumberCase {
    readonly disabled: boolean;
}

/** Состояние, которое задаётся не псевдоклассом, а значением, формой или обёрткой. */
interface IInputNumberStateCase extends IInputNumberThemeCase {
    /** Плоский режим чтения включает вмещающее поле, поэтому ячейка обёрнута в `rt-field`. */
    readonly flat: boolean;
}

function amount(value: number | null): FormControl<number | null> {
    return new FormControl<number | null>(value);
}

/**
 * Поле, уже подсвеченное ошибкой: касание проставляется здесь, потому что подсветка включается
 * по `invalid && (touched || dirty)` — до касания невалидное поле выглядит исправным.
 */
function invalid(): FormControl<number | null> {
    const control: FormControl<number | null> = new FormControl<number | null>(null, [Validators.required]);
    control.markAsTouched();
    return control;
}

/**
 * Матрицы состояний `rt-input-number` для витрины.
 *
 * Оси не перемножены: размер, префикс и дробная часть меняют разные части поля.
 *
 * Ноль показан отдельной ячейкой наполненности намеренно: это не пустое значение, но крестика
 * при нём нет — очистка числового поля и есть обнуление, и сбрасывать ноль не во что.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-input-number-matrix',
    template: `
        @switch (part) {
            @case ('size') {
                <app-story-row caption="Размер" [items]="sizes" [slotWidth]="fieldWidth">
                    <ng-template let-size>
                        <rt-input-number placeholder="0" ariaLabel="Размер" [size]="size" />
                    </ng-template>
                </app-story-row>
            }

            @case ('prefix') {
                <app-story-row caption="Иконка и префикс" [items]="prefixCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-prefixCase>
                        <rt-input-number
                            [iconLeft]="prefixCase.iconLeft"
                            [prefix]="prefixCase.prefix"
                            [ariaLabel]="prefixCase.name"
                            [formControl]="prefixCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('fraction') {
                <app-story-row caption="Дробная часть" [items]="fractionCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-fractionCase>
                        <rt-input-number
                            [minFractionDigits]="fractionCase.minFractionDigits"
                            [maxFractionDigits]="fractionCase.maxFractionDigits"
                            [ariaLabel]="fractionCase.name"
                            [formControl]="fractionCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('filling') {
                <app-story-row caption="Наполненность и очистка" [items]="fillingCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-fillingCase>
                        <rt-input-number placeholder="0" [ariaLabel]="fillingCase.name" [formControl]="fillingCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('bordered') {
                <app-story-row caption="Рамка" [items]="borderedCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-borderedCase>
                        <rt-input-number
                            [bordered]="borderedCase.bordered"
                            [ariaLabel]="borderedCase.name"
                            [formControl]="borderedCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" [items]="states" [itemLabel]="stateLabel" [slotWidth]="fieldWidth">
                    <ng-template let-state>
                        <rt-input-number placeholder="0" ariaLabel="Состояние" [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>

                <app-story-row caption="Значение, форма и обёртка" [items]="stateCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-stateCase>
                        @if (stateCase.flat) {
                            <rt-field [readonly]="true">
                                <rt-input-number prefix="₽" [ariaLabel]="stateCase.name" [formControl]="stateCase.control" />
                            </rt-field>
                        } @else {
                            <rt-input-number
                                placeholder="0"
                                [disabled]="stateCase.disabled"
                                [ariaLabel]="stateCase.name"
                                [formControl]="stateCase.control" />
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Поле в обеих темах">
                    <ng-template>
                        @for (themeCase of themeCases; track themeCase.name) {
                            <rt-input-number
                                placeholder="0"
                                prefix="₽"
                                [disabled]="themeCase.disabled"
                                [ariaLabel]="themeCase.name"
                                [formControl]="themeCase.control" />
                        }
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtFieldComponent,
        RtInputNumberComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtInputNumberMatrixComponent {
    public part: InputNumberMatrixPart = 'size';

    public readonly fieldWidth: string = STORY_FIELD_WIDTH;
    public readonly sizes: readonly IRtInput.Size[] = ['sm', 'md', 'lg'];
    public readonly states: readonly IStoryState[] = STORY_FIELD_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    public readonly prefixCases: readonly IInputNumberPrefixCase[] = [
        { name: 'без префикса', iconLeft: null, prefix: null, control: amount(1500) },
        { name: 'иконка', iconLeft: 'ico-bill', prefix: null, control: amount(1500) },
        { name: 'текстовый префикс', iconLeft: null, prefix: '₽', control: amount(1500) },
        { name: 'иконка и префикс', iconLeft: 'ico-bill', prefix: '₽', control: amount(1500) },
    ];

    public readonly fractionCases: readonly IInputNumberFractionCase[] = [
        { name: 'целые (0/0)', minFractionDigits: 0, maxFractionDigits: 0, control: amount(1234.567) },
        { name: 'умолчание (0/2)', minFractionDigits: 0, maxFractionDigits: 2, control: amount(1234.567) },
        { name: 'всегда две (2/2)', minFractionDigits: 2, maxFractionDigits: 2, control: amount(1234) },
    ];

    public readonly fillingCases: readonly IInputNumberCase[] = [
        { name: 'пусто', control: amount(null) },
        { name: 'ноль — крестика нет', control: amount(0) },
        { name: 'со значением', control: amount(1234567.89) },
    ];

    public readonly borderedCases: readonly IInputNumberBorderedCase[] = [
        { name: 'с рамкой', bordered: true, control: amount(1500) },
        { name: 'без рамки', bordered: false, control: amount(1500) },
    ];

    public readonly stateCases: readonly IInputNumberStateCase[] = [
        { name: 'ошибка', control: invalid(), disabled: false, flat: false },
        { name: 'отключено', control: amount(null), disabled: true, flat: false },
        { name: 'отключено со значением', control: amount(1500), disabled: true, flat: false },
        { name: 'только чтение', control: amount(1234567.89), disabled: false, flat: true },
        { name: 'только чтение без значения', control: amount(null), disabled: false, flat: true },
    ];

    public readonly themeCases: readonly IInputNumberThemeCase[] = [
        { name: 'пустое', control: amount(null), disabled: false },
        { name: 'со значением', control: amount(1234567.89), disabled: false },
        { name: 'ошибка', control: invalid(), disabled: false },
        { name: 'отключено', control: amount(1500), disabled: true },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: IInputNumberCase) => string = (value: IInputNumberCase): string => value.name;
}
