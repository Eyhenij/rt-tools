import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { STORY_FIELD_WIDTH_WIDE } from '../../../../../showcase/story-metrics';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { RtFileInputComponent } from '../../rt-file-input.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type FileInputMatrixPart = 'filling' | 'button' | 'states' | 'themes';

/** Случай с подписью и своим набором файлов: значение поля — массив `File`. */
interface IFileInputCase {
    readonly name: string;
    readonly control: FormControl<File[]>;
}

/** Подпись кнопки: своя или переведённое умолчание кита. */
interface IFileInputButtonCase extends IFileInputCase {
    readonly buttonLabel: string;
}

/** Отключённость — единственное, что светло-тёмная пара меняет от ячейки к ячейке. */
interface IFileInputThemeCase extends IFileInputCase {
    readonly disabled: boolean;
}

/** Состояние, которое задаётся не псевдоклассом, а значением, формой или обёрткой. */
interface IFileInputStateCase extends IFileInputThemeCase {
    /** Плоский режим чтения включает вмещающее поле, поэтому ячейка обёрнута в `rt-field`. */
    readonly flat: boolean;
}

/**
 * Правдоподобный файл нужного размера. Содержимое неважно — карточка показывает имя, тип по
 * расширению и объём, поэтому строка-заполнитель нужной длины даёт настоящий `size`.
 */
function sample(name: string, kilobytes: number): File {
    return new File(['x'.repeat(kilobytes * 1024)], name);
}

function files(value: File[]): FormControl<File[]> {
    return new FormControl<File[]>(value, { nonNullable: true });
}

/** Поле, уже подсвеченное ошибкой: до касания невалидное поле выглядит исправным. */
function invalid(): FormControl<File[]> {
    const control: FormControl<File[]> = new FormControl<File[]>([], { nonNullable: true, validators: [Validators.required] });
    control.markAsTouched();
    return control;
}

/**
 * Матрицы состояний `rt-file-input` для витрины.
 *
 * Ось здесь одна и главная — что уже выбрано: пусто, один файл, несколько. Остальное поле
 * показывает через кнопку и карточки, которые рисует не оно само, а
 * [`rt-file-card`](./?path=/docs/components-filecard--docs).
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-file-input-matrix',
    template: `
        @switch (part) {
            @case ('filling') {
                <app-story-row caption="Что выбрано" [items]="fillingCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-fillingCase>
                        <rt-file-input [multiple]="true" [ariaLabel]="fillingCase.name" [formControl]="fillingCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('button') {
                <app-story-row caption="Подпись кнопки" [items]="buttonCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-buttonCase>
                        <rt-file-input
                            [buttonLabel]="buttonCase.buttonLabel"
                            [ariaLabel]="buttonCase.name"
                            [formControl]="buttonCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Состояния" [items]="stateCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-stateCase>
                        @if (stateCase.flat) {
                            <rt-field [readonly]="true">
                                <rt-file-input [ariaLabel]="stateCase.name" [formControl]="stateCase.control" />
                            </rt-field>
                        } @else {
                            <rt-file-input
                                [multiple]="true"
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
                            <rt-file-input
                                [multiple]="true"
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
        RtFileInputComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtFileInputMatrixComponent {
    public part: FileInputMatrixPart = 'filling';

    public readonly fieldWidth: string = STORY_FIELD_WIDTH_WIDE;

    public readonly fillingCases: readonly IFileInputCase[] = [
        { name: 'пусто', control: files([]) },
        { name: 'один файл', control: files([sample('Договор №4512.pdf', 480)]) },
        {
            name: 'несколько файлов',
            control: files([sample('Договор №4512.pdf', 480), sample('Приложение 1.docx', 120), sample('Скан подписи.png', 64)]),
        },
    ];

    public readonly buttonCases: readonly IFileInputButtonCase[] = [
        { name: 'умолчание кита', buttonLabel: '', control: files([]) },
        { name: 'своя подпись', buttonLabel: 'Прикрепить договор', control: files([]) },
    ];

    public readonly stateCases: readonly IFileInputStateCase[] = [
        { name: 'ошибка', control: invalid(), disabled: false, flat: false },
        { name: 'отключено без файлов', control: files([]), disabled: true, flat: false },
        { name: 'отключено с файлом', control: files([sample('Договор №4512.pdf', 480)]), disabled: true, flat: false },
        { name: 'только чтение', control: files([sample('Договор №4512.pdf', 480)]), disabled: false, flat: true },
        { name: 'только чтение без файлов', control: files([]), disabled: false, flat: true },
    ];

    public readonly themeCases: readonly IFileInputThemeCase[] = [
        { name: 'пусто', control: files([]), disabled: false },
        { name: 'с файлом', control: files([sample('Договор №4512.pdf', 480)]), disabled: false },
        { name: 'отключено', control: files([sample('Договор №4512.pdf', 480)]), disabled: true },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: IFileInputCase) => string = (value: IFileInputCase): string => value.name;
}
