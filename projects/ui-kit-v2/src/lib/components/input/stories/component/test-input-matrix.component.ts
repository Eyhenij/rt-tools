import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { STORY_FIELD_WIDTH } from '../../../../../showcase/story-metrics';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_FIELD_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { IRtIcon } from '../../../icon/rt-icon.model';
import { RtInputComponent } from '../../rt-input.component';
import { IRtInput } from '../../rt-input.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type InputMatrixPart = 'size' | 'type' | 'icons' | 'filling' | 'bordered' | 'states' | 'themes';

/** Тип поля вместе с правдоподобным значением: пустое поле всех четырёх типов выглядит одинаково. */
interface IInputTypeCase {
    readonly name: string;
    readonly type: IRtInput.Type;
    readonly passwordToggle: boolean;
    readonly control: FormControl<string>;
}

/** Случай иконки — не значение оси, а различимая комбинация левой, правой и переключателя. */
interface IInputIconCase {
    readonly name: string;
    readonly iconLeft: IRtIcon.Name | null;
    readonly iconRight: IRtIcon.Name | null;
    readonly passwordToggle: boolean;
    readonly type: IRtInput.Type;
    readonly control: FormControl<string>;
}

/** Наполненность поля: она решает, показан ли крестик очистки. */
interface IInputFillingCase {
    readonly name: string;
    readonly clearable: boolean;
    readonly control: FormControl<string>;
}

/** Состояние, которое задаётся не псевдоклассом, а значением, формой или обёрткой. */
interface IInputStateCase {
    readonly name: string;
    readonly control: FormControl<string>;
    readonly disabled: boolean;
    /** Плоский режим чтения включает вмещающее поле, поэтому ячейка обёрнута в `rt-field`. */
    readonly flat: boolean;
}

/** Рамка и наличие значения: без рамки видно только по тому, что от неё осталось. */
interface IInputBorderedCase {
    readonly name: string;
    readonly bordered: boolean;
    readonly control: FormControl<string>;
}

/** Что показывает светло-тёмная пара: обычное поле, заполненное, ошибка и отключённое. */
interface IInputThemeCase {
    readonly name: string;
    readonly disabled: boolean;
    readonly control: FormControl<string>;
}

/** Поле с набранным значением. */
function filled(text: string): FormControl<string> {
    return new FormControl<string>(text, { nonNullable: true });
}

/**
 * Поле, которое уже подсвечено ошибкой. Касание проставляется здесь, а не жестом: подсветка
 * включается по `invalid && (touched || dirty)`, и до касания исправное с виду поле показывало
 * бы, что ошибки не бывает вовсе.
 */
function invalid(): FormControl<string> {
    const control: FormControl<string> = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });
    control.markAsTouched();
    return control;
}

/**
 * Матрицы состояний `rt-input` для витрины.
 *
 * Оси не перемножены: размер, тип, иконки и наполненность меняют разные части поля и вместе
 * ничего нового не показывают — умножение дало бы полсотни ячеек, отличающихся по одной.
 *
 * Значение поля приходит только через форму: собственного входа значения у контрола нет,
 * его пишет `writeValue`. Поэтому у каждой заполненной ячейки свой `FormControl`.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-input-matrix',
    template: `
        @switch (part) {
            @case ('size') {
                <app-story-row caption="Размер" [items]="sizes" [slotWidth]="fieldWidth">
                    <ng-template let-size>
                        <rt-input placeholder="Значение" ariaLabel="Размер" [size]="size" />
                    </ng-template>
                </app-story-row>
            }

            @case ('type') {
                <app-story-row caption="Тип" [items]="typeCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-typeCase>
                        <rt-input
                            [type]="typeCase.type"
                            [passwordToggle]="typeCase.passwordToggle"
                            [ariaLabel]="typeCase.name"
                            [formControl]="typeCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('icons') {
                <app-story-row caption="Иконки и постфикс" [items]="iconCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-iconCase>
                        <rt-input
                            [type]="iconCase.type"
                            [iconLeft]="iconCase.iconLeft"
                            [iconRight]="iconCase.iconRight"
                            [passwordToggle]="iconCase.passwordToggle"
                            [ariaLabel]="iconCase.name"
                            [formControl]="iconCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('filling') {
                <app-story-row caption="Наполненность и очистка" [items]="fillingCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-fillingCase>
                        <rt-input
                            placeholder="Введите значение"
                            [clearable]="fillingCase.clearable"
                            [ariaLabel]="fillingCase.name"
                            [formControl]="fillingCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('bordered') {
                <app-story-row caption="Рамка" [items]="borderedCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-borderedCase>
                        <rt-input [bordered]="borderedCase.bordered" [ariaLabel]="borderedCase.name" [formControl]="borderedCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" [items]="states" [itemLabel]="stateLabel" [slotWidth]="fieldWidth">
                    <ng-template let-state>
                        <rt-input placeholder="Введите значение" ariaLabel="Состояние" [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>

                <app-story-row caption="Значение, форма и обёртка" [items]="stateCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-stateCase>
                        @if (stateCase.flat) {
                            <rt-field [readonly]="true">
                                <rt-input [ariaLabel]="stateCase.name" [formControl]="stateCase.control" />
                            </rt-field>
                        } @else {
                            <rt-input
                                placeholder="Введите значение"
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
                            <rt-input
                                placeholder="Введите значение"
                                iconLeft="ico-search"
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
        RtInputComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtInputMatrixComponent {
    public part: InputMatrixPart = 'size';

    public readonly fieldWidth: string = STORY_FIELD_WIDTH;
    public readonly sizes: readonly IRtInput.Size[] = ['sm', 'md', 'lg'];
    public readonly states: readonly IStoryState[] = STORY_FIELD_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    public readonly typeCases: readonly IInputTypeCase[] = [
        { name: 'text', type: 'text', passwordToggle: false, control: filled('Иванов Иван') },
        { name: 'password', type: 'password', passwordToggle: true, control: filled('очень-секретно') },
        { name: 'email', type: 'email', passwordToggle: false, control: filled('ivanov@example.com') },
        { name: 'time', type: 'time', passwordToggle: false, control: filled('09:30') },
    ];

    public readonly iconCases: readonly IInputIconCase[] = [
        { name: 'без иконок', iconLeft: null, iconRight: null, passwordToggle: false, type: 'text', control: filled('Москва') },
        { name: 'слева', iconLeft: 'ico-search', iconRight: null, passwordToggle: false, type: 'text', control: filled('Москва') },
        { name: 'справа', iconLeft: null, iconRight: 'ico-calendar', passwordToggle: false, type: 'text', control: filled('12.05.2026') },
        {
            name: 'с обеих сторон',
            iconLeft: 'ico-search',
            iconRight: 'ico-calendar',
            passwordToggle: false,
            type: 'text',
            control: filled('12.05.2026'),
        },
        {
            name: 'переключатель пароля',
            iconLeft: null,
            iconRight: null,
            passwordToggle: true,
            type: 'password',
            control: filled('очень-секретно'),
        },
    ];

    public readonly fillingCases: readonly IInputFillingCase[] = [
        { name: 'пусто', clearable: true, control: filled('') },
        { name: 'со значением', clearable: true, control: filled('Москва') },
        { name: 'clearable=false', clearable: false, control: filled('Москва') },
    ];

    public readonly borderedCases: readonly IInputBorderedCase[] = [
        { name: 'с рамкой', bordered: true, control: filled('Москва') },
        { name: 'без рамки', bordered: false, control: filled('Москва') },
    ];

    public readonly stateCases: readonly IInputStateCase[] = [
        { name: 'ошибка', control: invalid(), disabled: false, flat: false },
        { name: 'отключено', control: filled(''), disabled: true, flat: false },
        { name: 'отключено со значением', control: filled('Москва'), disabled: true, flat: false },
        { name: 'только чтение', control: filled('Москва'), disabled: false, flat: true },
        { name: 'только чтение без значения', control: filled(''), disabled: false, flat: true },
    ];

    public readonly themeCases: readonly IInputThemeCase[] = [
        { name: 'пустое', disabled: false, control: filled('') },
        { name: 'со значением', disabled: false, control: filled('Москва') },
        { name: 'ошибка', disabled: false, control: invalid() },
        { name: 'отключено', disabled: true, control: filled('Москва') },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
