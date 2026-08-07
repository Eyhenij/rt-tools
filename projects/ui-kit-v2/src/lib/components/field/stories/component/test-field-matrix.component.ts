import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';

import { STORY_FIELD_WIDTH } from '../../../../../showcase/story-metrics';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtInputComponent } from '../../../input/rt-input.component';
import { RtFieldHintDirective } from '../../rt-field-hint.directive';
import { RtFieldComponent } from '../../rt-field.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type FieldMatrixPart = 'anatomy' | 'required' | 'error' | 'hint' | 'modes' | 'states' | 'themes';

/** Случай анатомии: какие части поля объявлены. */
interface IFieldAnatomyCase {
    readonly name: string;
    readonly label: string;
    readonly hint: string;
    readonly help: string;
    readonly control: FormControl<string>;
}

/** Случай ошибки: чем она вызвана и откуда берётся текст. */
interface IFieldErrorCase {
    readonly name: string;
    readonly hint: string;
    readonly reserve: boolean;
    readonly errors: Record<string, string>;
    readonly control: FormControl<string>;
}

/** Обязательность: есть ли валидатор и не заглушена ли звёздочка. */
interface IFieldRequiredCase {
    readonly name: string;
    readonly hideRequiredMark: boolean;
    readonly control: FormControl<string>;
}

/** Откуда берётся подсказка: строковый вход или проекция с разметкой. */
interface IFieldHintCase {
    readonly name: string;
    readonly projected: boolean;
    readonly control: FormControl<string>;
}

/** Режим поля: обычный, плоское чтение, заглушка на время загрузки. */
interface IFieldModeCase {
    readonly name: string;
    readonly readonly: boolean;
    readonly loading: boolean;
    readonly control: FormControl<string>;
}

function filled(text: string): FormControl<string> {
    return new FormControl<string>(text, { nonNullable: true });
}

/** Контрол с обязательностью: по нему поле само рисует звёздочку — входа для неё нет. */
function required(text: string): FormControl<string> {
    return new FormControl<string>(text, { nonNullable: true, validators: [Validators.required] });
}

/** Контрол, уже подсвеченный ошибкой: до касания невалидное поле выглядит исправным. */
function failing(validators: ValidatorFn[] = [Validators.required], value: string = ''): FormControl<string> {
    const control: FormControl<string> = new FormControl<string>(value, { nonNullable: true, validators });
    control.markAsTouched();
    return control;
}

/**
 * Матрицы состояний `rt-field` для витрины.
 *
 * У обёртки нет своих состояний взаимодействия: наведение и фокус принадлежат контролу внутри
 * и показаны в его матрице. Оси здесь другие — какие части анатомии объявлены и что стоит в
 * строке сообщений.
 *
 * Звёздочка и текст ошибки не задаются входами: поле читает их у спроецированного контрола,
 * поэтому в каждой ячейке живёт настоящий `FormControl` со своими валидаторами.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-field-matrix',
    template: `
        @switch (part) {
            @case ('anatomy') {
                <app-story-row caption="Анатомия" [items]="anatomyCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-anatomyCase>
                        <rt-field [label]="anatomyCase.label" [hint]="anatomyCase.hint" [help]="anatomyCase.help">
                            <rt-input placeholder="Москва" [formControl]="anatomyCase.control" />
                        </rt-field>
                    </ng-template>
                </app-story-row>
            }

            @case ('required') {
                <app-story-row caption="Обязательность" [items]="requiredCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-requiredCase>
                        <rt-field label="Город" [hideRequiredMark]="requiredCase.hideRequiredMark">
                            <rt-input placeholder="Москва" [formControl]="requiredCase.control" />
                        </rt-field>
                    </ng-template>
                </app-story-row>
            }

            @case ('error') {
                <app-story-row caption="Ошибка" [items]="errorCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-errorCase>
                        <rt-field label="Почта" [hint]="errorCase.hint" [errors]="errorCase.errors" [reserveHintSpace]="errorCase.reserve">
                            <rt-input type="email" placeholder="ivanov@example.com" [formControl]="errorCase.control" />
                        </rt-field>
                    </ng-template>
                </app-story-row>
            }

            @case ('hint') {
                <app-story-row caption="Подсказка" [items]="hintCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-hintCase>
                        @if (hintCase.projected) {
                            <rt-field label="Пароль">
                                <rt-input type="password" [passwordToggle]="true" [formControl]="hintCase.control" />
                                <span rtFieldHint>
                                    Не короче
                                    <strong>восьми</strong>
                                    символов
                                </span>
                            </rt-field>
                        } @else {
                            <rt-field label="Пароль" hint="Не короче восьми символов">
                                <rt-input type="password" [passwordToggle]="true" [formControl]="hintCase.control" />
                            </rt-field>
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('modes') {
                <app-story-row caption="Режимы" [items]="modeCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-modeCase>
                        <rt-field label="Город" hint="Как в адресе доставки" [readonly]="modeCase.readonly" [loading]="modeCase.loading">
                            <rt-input placeholder="Москва" [formControl]="modeCase.control" />
                        </rt-field>
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Строка сообщений" [items]="stateCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-stateCase>
                        <rt-field label="Почта" [hint]="stateCase.hint" [errors]="stateCase.errors" [reserveHintSpace]="stateCase.reserve">
                            <rt-input type="email" placeholder="ivanov@example.com" [formControl]="stateCase.control" />
                        </rt-field>
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Поле в обеих темах">
                    <ng-template>
                        <rt-field label="Город" hint="Как в адресе доставки">
                            <rt-input placeholder="Москва" [formControl]="themeNormal" />
                        </rt-field>
                        <rt-field label="Почта" [errors]="emailErrors">
                            <rt-input type="email" [formControl]="themeInvalid" />
                        </rt-field>
                        <rt-field label="Город" [readonly]="true">
                            <rt-input [formControl]="themeReadonly" />
                        </rt-field>
                        <rt-field label="Город" hint="Как в адресе доставки" [loading]="true">
                            <rt-input [formControl]="themeLoading" />
                        </rt-field>
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
        RtFieldHintDirective,
        RtInputComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtFieldMatrixComponent {
    public part: FieldMatrixPart = 'anatomy';

    public readonly fieldWidth: string = STORY_FIELD_WIDTH;
    public readonly emailErrors: Record<string, string> = { email: 'Проверьте адрес: нужен знак @' };

    public readonly hintCases: readonly IFieldHintCase[] = [
        { name: 'строка', projected: false, control: filled('') },
        { name: 'проекция с разметкой', projected: true, control: filled('') },
    ];

    public readonly themeNormal: FormControl<string> = filled('Москва');
    public readonly themeInvalid: FormControl<string> = failing([Validators.email], 'ivanov');
    public readonly themeReadonly: FormControl<string> = filled('Москва');
    public readonly themeLoading: FormControl<string> = filled('');

    public readonly anatomyCases: readonly IFieldAnatomyCase[] = [
        { name: 'только контрол', label: '', hint: '', help: '', control: filled('Москва') },
        { name: 'подпись', label: 'Город', hint: '', help: '', control: filled('Москва') },
        { name: 'подпись и подсказка', label: 'Город', hint: 'Как в адресе доставки', help: '', control: filled('Москва') },
        {
            name: 'подпись и пояснение',
            label: 'Город',
            hint: '',
            help: 'Совпадает с городом из документа',
            control: filled('Москва'),
        },
    ];

    public readonly requiredCases: readonly IFieldRequiredCase[] = [
        { name: 'не обязательно', hideRequiredMark: false, control: filled('Москва') },
        { name: 'обязательно', hideRequiredMark: false, control: required('Москва') },
        { name: 'звёздочка снята', hideRequiredMark: true, control: required('Москва') },
    ];

    public readonly errorCases: readonly IFieldErrorCase[] = [
        { name: 'умолчание кита', hint: '', reserve: false, errors: {}, control: failing() },
        {
            name: 'свой текст',
            hint: '',
            reserve: false,
            errors: { email: 'Проверьте адрес: нужен знак @' },
            control: failing([Validators.email], 'ivanov'),
        },
        {
            name: 'ошибка вместо подсказки',
            hint: 'Рабочая, не личная',
            reserve: false,
            errors: {},
            control: failing(),
        },
        {
            name: 'с резервом строки',
            hint: 'Рабочая, не личная',
            reserve: true,
            errors: {},
            control: failing(),
        },
    ];

    public readonly modeCases: readonly IFieldModeCase[] = [
        { name: 'обычный', readonly: false, loading: false, control: filled('Москва') },
        { name: 'только чтение', readonly: true, loading: false, control: filled('Москва') },
        { name: 'только чтение без значения', readonly: true, loading: false, control: filled('') },
        { name: 'загрузка', readonly: false, loading: true, control: filled('') },
    ];

    public readonly stateCases: readonly IFieldErrorCase[] = [
        { name: 'подсказка', hint: 'Рабочая, не личная', reserve: false, errors: {}, control: filled('ivanov@example.com') },
        { name: 'резерв без сообщения', hint: '', reserve: true, errors: {}, control: filled('ivanov@example.com') },
        { name: 'ошибка', hint: '', reserve: false, errors: {}, control: failing() },
        { name: 'ошибка поверх подсказки', hint: 'Рабочая, не личная', reserve: false, errors: {}, control: failing() },
        { name: 'ошибка с резервом', hint: 'Рабочая, не личная', reserve: true, errors: {}, control: failing() },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
