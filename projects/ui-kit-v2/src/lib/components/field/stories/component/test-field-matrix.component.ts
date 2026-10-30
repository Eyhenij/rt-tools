import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';

import { STORY_FIELD_WIDTH } from '../../../../../showcase/story-metrics';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtColorPaletteComponent } from '../../../color-palette/rt-color-palette.component';
import { RtInputNumberComponent } from '../../../input-number/rt-input-number.component';
import { RtInputComponent } from '../../../input/rt-input.component';
import { IRtInput } from '../../../input/rt-input.model';
import { RtSelectComponent } from '../../../select/rt-select.component';
import { IRtSelect } from '../../../select/rt-select.model';
import { RtTextareaComponent } from '../../../textarea/rt-textarea.component';
import { RtFieldHintDirective } from '../../rt-field-hint.directive';
import { RtFieldComponent } from '../../rt-field.component';

/** Подсказка поля — одна на все ячейки матрицы. */
const HINT_TEXT: string = 'Рабочая, не личная';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TFieldMatrixPart = 'anatomy' | 'required' | 'error' | 'hint' | 'modes' | 'states' | 'presets' | 'themes' | 'inside' | 'density';

/** Случай плотности: шаг, вид поля и состояние взаимодействия. */
interface IFieldDensityCase {
    readonly name: string;
    readonly density: string;
    readonly appearance: IRtInput.Appearance;
    readonly state: string | null;
    readonly control: FormControl<string>;
}

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

/** Какой контрол стоит в поле. */
type TFieldInsideKind = 'input' | 'textarea' | 'number' | 'select' | 'palette';

/** Контрол подписи внутри поля: какой контрол стоит в поле, в каком он состоянии и размере. */
interface IFieldInsideCase {
    readonly name: string;
    readonly kind: TFieldInsideKind;
    readonly state: string | null;
    readonly appearance: IRtInput.Appearance;
    readonly control: FormControl<unknown>;
    readonly size?: IRtInput.Size;
}

const PALETTE: readonly string[] = ['#d32f2f', '#1976d2', '#388e3c', '#fbc02d'];

const CITIES: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Москва', value: 'msk' },
    { label: 'Казань', value: 'kzn' },
];

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
                <app-story-presets caption="Анатомия в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="anatomyCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-anatomyCase>
                                <rt-field [label]="anatomyCase.label" [hint]="anatomyCase.hint" [help]="anatomyCase.help">
                                    <rt-input placeholder="Москва" [formControl]="anatomyCase.control" />
                                </rt-field>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('required') {
                <app-story-presets caption="Обязательность в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="requiredCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-requiredCase>
                                <rt-field label="Город" [hideRequiredMark]="requiredCase.hideRequiredMark">
                                    <rt-input placeholder="Москва" [formControl]="requiredCase.control" />
                                </rt-field>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('error') {
                <app-story-presets caption="Ошибка в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="errorCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-errorCase>
                                <rt-field
                                    label="Почта"
                                    [hint]="errorCase.hint"
                                    [errors]="errorCase.errors"
                                    [reserveHintSpace]="errorCase.reserve">
                                    <rt-input type="email" placeholder="ivanov@example.com" [formControl]="errorCase.control" />
                                </rt-field>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('hint') {
                <app-story-presets caption="Подсказка в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="hintCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
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
                    </ng-template>
                </app-story-presets>
            }

            @case ('modes') {
                <app-story-presets caption="Режимы в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="modeCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-modeCase>
                                <rt-field
                                    label="Город"
                                    hint="Как в адресе доставки"
                                    [readonly]="modeCase.readonly"
                                    [loading]="modeCase.loading">
                                    <rt-input placeholder="Москва" [formControl]="modeCase.control" />
                                </rt-field>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('states') {
                <app-story-presets caption="Строка сообщений в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="stateCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-stateCase>
                                <rt-field
                                    label="Почта"
                                    [hint]="stateCase.hint"
                                    [errors]="stateCase.errors"
                                    [reserveHintSpace]="stateCase.reserve">
                                    <rt-input type="email" placeholder="ivanov@example.com" [formControl]="stateCase.control" />
                                </rt-field>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Поле в обоих наборах">
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
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Поле в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
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
                    </ng-template>
                </app-story-presets>
            }
            @case ('inside') {
                <app-story-presets caption="Подпись поля в обоих наборах: в материальном она внутри контрола">
                    <ng-template>
                        <app-story-row [items]="insideCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-insideCase>
                                <rt-field label="Город доставки" hint="Как в адресе" [attr.data-story-state]="insideCase.state">
                                    @switch (insideCase.kind) {
                                        @case ('textarea') {
                                            <rt-textarea placeholder="Комментарий" [formControl]="insideCase.control" />
                                        }
                                        @case ('number') {
                                            <rt-input-number
                                                placeholder="0"
                                                [appearance]="insideCase.appearance"
                                                [formControl]="insideCase.control" />
                                        }
                                        @case ('select') {
                                            <rt-select
                                                placeholder="Выберите"
                                                [size]="insideCase.size ?? 'md'"
                                                [appearance]="insideCase.appearance"
                                                [options]="cities"
                                                [formControl]="insideCase.control" />
                                        }
                                        @case ('palette') {
                                            <!-- У палитры места подсказки нет: подпись остаётся над ней и в материальном наборе. -->
                                            <rt-color-palette [colors]="palette" [formControl]="insideCase.control" />
                                        }
                                        @default {
                                            <rt-input
                                                placeholder="Москва"
                                                [size]="insideCase.size ?? 'md'"
                                                [appearance]="insideCase.appearance"
                                                [formControl]="insideCase.control" />
                                        }
                                    }
                                </rt-field>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }
            @case ('density') {
                <app-story-presets caption="Плотность и наведение: в материальном наборе поле 56 px и меньше на 4 px за шаг">
                    <ng-template>
                        <app-story-row [items]="densityCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-densityCase>
                                <rt-field
                                    label="Город доставки"
                                    [attr.data-rt-density]="densityCase.density"
                                    [attr.data-story-state]="densityCase.state">
                                    <rt-input
                                        placeholder="Москва"
                                        [appearance]="densityCase.appearance"
                                        [formControl]="densityCase.control" />
                                </rt-field>
                            </ng-template>
                        </app-story-row>
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
        RtFieldComponent,
        RtFieldHintDirective,
        RtColorPaletteComponent,
        RtInputComponent,
        RtInputNumberComponent,
        RtSelectComponent,
        RtTextareaComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtFieldMatrixComponent {
    public part: TFieldMatrixPart = 'anatomy';

    public readonly fieldWidth: string = STORY_FIELD_WIDTH;
    public readonly cities: ReadonlyArray<IRtSelect.Option<string>> = CITIES;
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
            hint: HINT_TEXT,
            reserve: false,
            errors: {},
            control: failing(),
        },
        {
            name: 'с резервом строки',
            hint: HINT_TEXT,
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
        { name: 'подсказка', hint: HINT_TEXT, reserve: false, errors: {}, control: filled('ivanov@example.com') },
        { name: 'резерв без сообщения', hint: '', reserve: true, errors: {}, control: filled('ivanov@example.com') },
        { name: 'ошибка', hint: '', reserve: false, errors: {}, control: failing() },
        { name: 'ошибка поверх подсказки', hint: HINT_TEXT, reserve: false, errors: {}, control: failing() },
        { name: 'ошибка с резервом', hint: HINT_TEXT, reserve: true, errors: {}, control: failing() },
    ];

    /**
     * Подпись внутри контрола: пустой, с фокусом и со значением у каждого контрола, плюс
     * обязательное тронутое поле — звёздочка в цвете подписи и в цвете ошибки. Свой вид кита в
     * левой половине держит подпись над полем, как прежде.
     */
    public readonly insideCases: readonly IFieldInsideCase[] = [
        { name: 'поле пустое', kind: 'input', state: null, appearance: 'outline', control: filled('') },
        { name: 'поле в фокусе', kind: 'input', state: 'focus-within', appearance: 'outline', control: filled('') },
        { name: 'поле со значением', kind: 'input', state: null, appearance: 'outline', control: filled('Москва') },
        { name: 'обязательное', kind: 'input', state: null, appearance: 'outline', control: required('Москва') },
        { name: 'обязательное с ошибкой', kind: 'input', state: null, appearance: 'outline', control: failing() },
        { name: 'текст пустой', kind: 'textarea', state: null, appearance: 'outline', control: filled('') },
        { name: 'текст со значением', kind: 'textarea', state: null, appearance: 'outline', control: filled('Позвонить за час') },
        { name: 'число пустое', kind: 'number', state: null, appearance: 'outline', control: new FormControl<number | null>(null) },
        { name: 'число со значением', kind: 'number', state: null, appearance: 'outline', control: new FormControl<number | null>(12) },
        { name: 'выбор пустой', kind: 'select', state: null, appearance: 'outline', control: new FormControl<string | null>(null) },
        { name: 'выбор со значением', kind: 'select', state: null, appearance: 'outline', control: new FormControl<string | null>('kzn') },
        { name: 'залитое пустое', kind: 'input', state: null, appearance: 'fill', control: filled('') },
        { name: 'залитое в фокусе', kind: 'input', state: 'focus-within', appearance: 'fill', control: filled('') },
        { name: 'залитое со значением', kind: 'input', state: null, appearance: 'fill', control: filled('Москва') },
        { name: 'залитое с ошибкой', kind: 'input', state: null, appearance: 'fill', control: failing() },
        { name: 'таблетка со значением', kind: 'input', state: null, appearance: 'pill', control: filled('Москва') },
        { name: 'число залитое', kind: 'number', state: null, appearance: 'fill', control: new FormControl<number | null>(12) },
        {
            name: 'выбор залитый',
            kind: 'select',
            state: null,
            appearance: 'fill',
            control: new FormControl<string | null>('kzn'),
        },
        { name: 'малое пустое', kind: 'input', state: null, appearance: 'outline', size: 'sm', control: filled('') },
        { name: 'малое со значением', kind: 'input', state: null, appearance: 'outline', size: 'sm', control: filled('Москва') },
        {
            name: 'малый выбор',
            kind: 'select',
            state: null,
            appearance: 'outline',
            size: 'sm',
            control: new FormControl<string | null>('kzn'),
        },
        { name: 'крупное пустое', kind: 'input', state: null, appearance: 'outline', size: 'lg', control: filled('') },
        { name: 'палитра', kind: 'palette', state: null, appearance: 'outline', control: new FormControl<string | null>('#1976d2') },
    ];

    public readonly palette: readonly string[] = PALETTE;

    /**
     * Плотность материального набора: шаги от 0 до −5 у обведённого поля, залитое поле при −1, как
     * у залитых полей приложения, и наведение. Свой вид кита в левой половине атрибута не замечает.
     */
    public readonly densityCases: readonly IFieldDensityCase[] = [
        { name: 'плотность 0', density: '0', appearance: 'outline', state: null, control: filled('Москва') },
        { name: 'плотность −1', density: '-1', appearance: 'outline', state: null, control: filled('Москва') },
        { name: 'плотность −2', density: '-2', appearance: 'outline', state: null, control: filled('Москва') },
        { name: 'плотность −3', density: '-3', appearance: 'outline', state: null, control: filled('Москва') },
        { name: 'плотность −4', density: '-4', appearance: 'outline', state: null, control: filled('Москва') },
        { name: 'плотность −5', density: '-5', appearance: 'outline', state: null, control: filled('01.10.2026') },
        { name: 'залитое, −1', density: '-1', appearance: 'fill', state: null, control: filled('Москва') },
        { name: 'наведение', density: '0', appearance: 'outline', state: 'hover', control: filled('Москва') },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
