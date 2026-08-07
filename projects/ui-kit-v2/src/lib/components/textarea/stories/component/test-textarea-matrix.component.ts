import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { STORY_FIELD_WIDTH_WIDE } from '../../../../../showcase/story-metrics';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_CONTROL_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { IRtInput } from '../../../input/rt-input.model';
import { IRtTextareaResize, RtTextareaComponent } from '../../rt-textarea.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TextareaMatrixPart = 'size' | 'rows' | 'resize' | 'filling' | 'bordered' | 'states' | 'themes';

/** Случай с подписью и своим значением: без набранного текста ось высоты не видно. */
interface ITextareaCase {
    readonly name: string;
    readonly control: FormControl<string>;
}

/** Высота в строках — вход `rows`; значение подобрано так, чтобы текст её заполнял. */
interface ITextareaRowsCase extends ITextareaCase {
    readonly rows: number;
}

/** Рамка покоя: снята она или нет. */
interface ITextareaBorderedCase extends ITextareaCase {
    readonly bordered: boolean;
}

/** Отключённость — единственное, что светло-тёмная пара меняет от ячейки к ячейке. */
interface ITextareaThemeCase extends ITextareaCase {
    readonly disabled: boolean;
}

/** Состояние, которое задаётся не псевдоклассом, а значением, входом или обёрткой. */
interface ITextareaStateCase extends ITextareaThemeCase {
    readonly readonlyControl: boolean;
    /** Плоский режим чтения включает вмещающее поле, поэтому ячейка обёрнута в `rt-field`. */
    readonly flat: boolean;
}

const SAMPLE: string = 'Договор подписан обеими сторонами. Скан отправлен в бухгалтерию.';

function filled(text: string): FormControl<string> {
    return new FormControl<string>(text, { nonNullable: true });
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
 * Матрицы состояний `rt-textarea` для витрины.
 *
 * Оси не перемножены: размер, число строк и политика растягивания меняют высоту тремя разными
 * способами, и вместе показывают ту же высоту, только дороже.
 *
 * У поля два разных «только чтение», и они не одно и то же: вход `readonly` оставляет коробку
 * и запрещает набор, а `[readonly]` на `rt-field` подменяет её плоским текстом. Показаны оба.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-textarea-matrix',
    template: `
        @switch (part) {
            @case ('size') {
                <app-story-row caption="Размер" [items]="sizes" [slotWidth]="fieldWidth">
                    <ng-template let-size>
                        <rt-textarea placeholder="Комментарий" ariaLabel="Размер" [size]="size" />
                    </ng-template>
                </app-story-row>
            }

            @case ('rows') {
                <app-story-row caption="Высота в строках" [items]="rowsCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-rowsCase>
                        <rt-textarea [rows]="rowsCase.rows" [ariaLabel]="rowsCase.name" [formControl]="rowsCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('resize') {
                <app-story-row caption="Растягивание" [items]="resizes" [slotWidth]="fieldWidth">
                    <ng-template let-resize>
                        <rt-textarea placeholder="Потяните за угол" ariaLabel="Растягивание" [resize]="resize" />
                    </ng-template>
                </app-story-row>
            }

            @case ('filling') {
                <app-story-row caption="Наполненность" [items]="fillingCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-fillingCase>
                        <rt-textarea placeholder="Комментарий" [ariaLabel]="fillingCase.name" [formControl]="fillingCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('bordered') {
                <app-story-row caption="Рамка" [items]="borderedCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-borderedCase>
                        <rt-textarea
                            [bordered]="borderedCase.bordered"
                            [ariaLabel]="borderedCase.name"
                            [formControl]="borderedCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" [items]="states" [itemLabel]="stateLabel" [slotWidth]="fieldWidth">
                    <ng-template let-state>
                        <rt-textarea placeholder="Комментарий" ariaLabel="Состояние" [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>

                <app-story-row caption="Значение, форма и обёртка" [items]="stateCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-stateCase>
                        @if (stateCase.flat) {
                            <rt-field [readonly]="true">
                                <rt-textarea [ariaLabel]="stateCase.name" [formControl]="stateCase.control" />
                            </rt-field>
                        } @else {
                            <rt-textarea
                                placeholder="Комментарий"
                                [disabled]="stateCase.disabled"
                                [readonly]="stateCase.readonlyControl"
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
                            <rt-textarea
                                placeholder="Комментарий"
                                [rows]="2"
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
        RtTextareaComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtTextareaMatrixComponent {
    public part: TextareaMatrixPart = 'size';

    public readonly fieldWidth: string = STORY_FIELD_WIDTH_WIDE;
    public readonly sizes: readonly IRtInput.Size[] = ['sm', 'md', 'lg'];
    public readonly resizes: readonly IRtTextareaResize[] = ['none', 'vertical'];
    public readonly states: readonly IStoryState[] = STORY_CONTROL_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    public readonly rowsCases: readonly ITextareaRowsCase[] = [
        { name: 'rows=2', rows: 2, control: filled(SAMPLE) },
        { name: 'rows=3 (умолчание)', rows: 3, control: filled(SAMPLE) },
        { name: 'rows=6', rows: 6, control: filled(SAMPLE) },
    ];

    public readonly fillingCases: readonly ITextareaCase[] = [
        { name: 'пусто', control: filled('') },
        { name: 'одна строка', control: filled('Согласовано.') },
        { name: 'несколько строк', control: filled(`${SAMPLE}\nОригинал придёт почтой.`) },
    ];

    public readonly borderedCases: readonly ITextareaBorderedCase[] = [
        { name: 'с рамкой', bordered: true, control: filled('Согласовано.') },
        { name: 'без рамки', bordered: false, control: filled('Согласовано.') },
    ];

    public readonly stateCases: readonly ITextareaStateCase[] = [
        { name: 'ошибка', control: invalid(), disabled: false, readonlyControl: false, flat: false },
        { name: 'отключено', control: filled(SAMPLE), disabled: true, readonlyControl: false, flat: false },
        { name: 'readonly у поля', control: filled(SAMPLE), disabled: false, readonlyControl: true, flat: false },
        { name: 'только чтение в rt-field', control: filled(SAMPLE), disabled: false, readonlyControl: false, flat: true },
        { name: 'только чтение без значения', control: filled(''), disabled: false, readonlyControl: false, flat: true },
    ];

    public readonly themeCases: readonly ITextareaThemeCase[] = [
        { name: 'пустое', control: filled(''), disabled: false },
        { name: 'со значением', control: filled(SAMPLE), disabled: false },
        { name: 'ошибка', control: invalid(), disabled: false },
        { name: 'отключено', control: filled(SAMPLE), disabled: true },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: ITextareaCase) => string = (value: ITextareaCase): string => value.name;
}
