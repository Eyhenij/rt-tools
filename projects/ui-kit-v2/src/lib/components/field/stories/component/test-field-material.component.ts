import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { STORY_FIELD_WIDTH } from '../../../../../showcase/story-metrics';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IRtIcon } from '../../../icon/rt-icon.model';
import { RtInputComponent } from '../../../input/rt-input.component';
import { IRtInput } from '../../../input/rt-input.model';
import { RtInputNumberComponent } from '../../../input-number/rt-input-number.component';
import { RtSelectComponent } from '../../../select/rt-select.component';
import { RtTextareaComponent } from '../../../textarea/rt-textarea.component';
import { IRtSelect } from '../../../select/rt-select.model';
import { RtFieldComponent } from '../../rt-field.component';

/** Контролы, которые показ кладёт в поле: ключи — имена случаев. */
interface IFieldKinds {
    readonly input: RtInputComponent;
    readonly select: RtSelectComponent<string>;
    readonly number: RtInputNumberComponent;
    readonly textarea: RtTextareaComponent;
}

/** Случай поля под материальным набором: контрол, вид, состояние и значки по сторонам. */
interface IFieldMaterialCase {
    readonly name: string;
    readonly kind: keyof IFieldKinds;
    readonly appearance: IRtInput.Appearance;
    readonly state: string | null;
    readonly iconLeft: IRtIcon.Name | null;
    readonly iconRight?: IRtIcon.Name;
    readonly control: FormControl<string | null> | FormControl<number | null>;
}

/** Случай ширины: что задано на предке и какое значение стоит в поле. */
interface IFieldWidthCase {
    readonly name: string;
    readonly style: Record<string, string>;
    readonly control: FormControl<string | null>;
}

const HOTELS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Гостиница у вокзала', value: 'station' },
    { label: 'Хостел', value: 'hostel' },
];

function value(text: string | null): FormControl<string | null> {
    return new FormControl<string | null>(text);
}

function amount(count: number | null): FormControl<number | null> {
    return new FormControl<number | null>(count);
}

/** Отключённое поле с заданным значением. */
function off(text: string | null): FormControl<string | null> {
    return new FormControl<string | null>({ value: text, disabled: true });
}

/** Обязательное тронутое поле без значения: звёздочка и отказ под полем. */
function failing(): FormControl<string | null> {
    const control: FormControl<string | null> = new FormControl<string | null>(null, { validators: [Validators.required] });
    control.markAsTouched();
    return control;
}

/**
 * Поле материального набора против поля Material: залитое и обведённое при плотности −1.
 *
 * Пары своего и материального набора здесь нет намеренно: показ проверяет, как набор доходит до
 * поля — признаком на самом поле, плотностью и своей высотой на предке. Половина своего набора
 * вокруг поля с признаком набора стала бы материальной и повторила бы вторую.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-field-material',
    template: `
        <div data-rt-density="-1">
            <app-story-row
                caption="Признак набора на самом поле, плотность −1 на предке"
                [items]="cases"
                [itemLabel]="caseLabel"
                [slotWidth]="fieldWidth">
                <ng-template let-fieldCase>
                    <ng-container *ngTemplateOutlet="field; context: { $implicit: fieldCase, preset: 'material' }" />
                </ng-template>
            </app-story-row>
        </div>

        <div data-preset="material" data-rt-density="-1">
            <app-story-row
                caption="Признак набора и плотность −1 на предке"
                [items]="cases"
                [itemLabel]="caseLabel"
                [slotWidth]="fieldWidth">
                <ng-template let-fieldCase>
                    <ng-container *ngTemplateOutlet="field; context: { $implicit: fieldCase, preset: null }" />
                </ng-template>
            </app-story-row>
        </div>

        <div [style]="ownHeight">
            <app-story-row
                caption="Своя высота приложения 30 px на предке сильнее набора на поле"
                [items]="lowCases"
                [itemLabel]="caseLabel"
                [slotWidth]="fieldWidth">
                <ng-template let-fieldCase>
                    <ng-container *ngTemplateOutlet="field; context: { $implicit: fieldCase, preset: 'material' }" />
                </ng-template>
            </app-story-row>
        </div>

        <div data-preset="material" data-rt-density="-1">
            <app-story-row
                caption="Обведённые поля: текст в 16 px от края, отключённые — без тусклости"
                [items]="outlineCases"
                [itemLabel]="caseLabel"
                [slotWidth]="fieldWidth">
                <ng-template let-fieldCase>
                    <ng-container *ngTemplateOutlet="field; context: { $implicit: fieldCase, preset: null }" />
                </ng-template>
            </app-story-row>
        </div>

        <app-story-row caption="Наименьшая ширина поля задана на предке или нет" [items]="widthCases" [itemLabel]="caseLabel">
            <ng-template let-widthCase>
                <div data-preset="material" data-rt-density="-1" [style]="widthCase.style">
                    <rt-select appearance="outline" placeholder="Гостиница" [options]="hotels" [formControl]="widthCase.control" />
                </div>
            </ng-template>
        </app-story-row>

        <app-story-row
            caption="Подпись на рамке у самого контрола, признак набора на его теге"
            [items]="ownCases"
            [itemLabel]="caseLabel"
            [slotWidth]="fieldWidth">
            <ng-template let-ownCase>
                @if (ownCase.kind === 'select') {
                    <rt-select
                        data-preset="material"
                        floatingLabel="Бюджет"
                        radius="sm"
                        [appearance]="ownCase.appearance"
                        [options]="hotels"
                        [formControl]="ownCase.control" />
                } @else {
                    <rt-input
                        data-preset="material"
                        floatingLabel="Бюджет"
                        radius="sm"
                        [appearance]="ownCase.appearance"
                        [formControl]="ownCase.control" />
                }
            </ng-template>
        </app-story-row>

        <ng-template #field let-fieldCase let-preset="preset">
            <rt-field label="Гостиница" [attr.data-preset]="preset" [attr.data-story-state]="fieldCase.state">
                @if (fieldCase.kind === 'select') {
                    <rt-select
                        placeholder="Выберите"
                        [appearance]="fieldCase.appearance"
                        [options]="hotels"
                        [formControl]="fieldCase.control" />
                } @else if (fieldCase.kind === 'textarea') {
                    <rt-textarea placeholder="Комментарий" [formControl]="fieldCase.control" />
                } @else if (fieldCase.kind === 'number') {
                    <rt-input-number placeholder="0" [appearance]="fieldCase.appearance" [formControl]="fieldCase.control" />
                } @else {
                    <rt-input
                        placeholder="Название"
                        [appearance]="fieldCase.appearance"
                        [iconLeft]="fieldCase.iconLeft"
                        [iconRight]="fieldCase.iconRight ?? null"
                        [formControl]="fieldCase.control" />
                }
            </rt-field>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        NgTemplateOutlet,
        ReactiveFormsModule,

        // components
        RtFieldComponent,
        RtInputComponent,
        RtInputNumberComponent,
        RtSelectComponent,
        RtTextareaComponent,

        // showcase
        StoryRowComponent,
    ],
})
export class TestRtFieldMaterialComponent {
    public readonly fieldWidth: string = STORY_FIELD_WIDTH;
    public readonly hotels: ReadonlyArray<IRtSelect.Option<string>> = HOTELS;
    public readonly ownHeight: Record<string, string> = { '--rt-input-height-app': '30px' };

    public readonly cases: readonly IFieldMaterialCase[] = [
        { name: 'залитое пустое', kind: 'input', appearance: 'fill', state: null, iconLeft: null, control: value(null) },
        { name: 'залитое в фокусе', kind: 'input', appearance: 'fill', state: 'focus-within', iconLeft: null, control: value('Вокзал') },
        { name: 'залитое со значением', kind: 'input', appearance: 'fill', state: null, iconLeft: null, control: value('Вокзал') },
        { name: 'залитое с отказом', kind: 'input', appearance: 'fill', state: null, iconLeft: null, control: failing() },
        { name: 'выбор залитый пустой', kind: 'select', appearance: 'fill', state: null, iconLeft: null, control: value(null) },
        { name: 'выбор залитый', kind: 'select', appearance: 'fill', state: null, iconLeft: null, control: value('station') },
        { name: 'обведённое со значком', kind: 'input', appearance: 'outline', state: null, iconLeft: 'search', control: value(null) },
        { name: 'залитое со значком', kind: 'input', appearance: 'fill', state: null, iconLeft: 'search', control: value('Вокзал') },
        { name: 'залитое, значок пустого', kind: 'input', appearance: 'fill', state: null, iconLeft: 'search', control: value(null) },
        {
            name: 'значок справа',
            kind: 'input',
            appearance: 'fill',
            state: null,
            iconLeft: null,
            iconRight: 'search',
            control: value('Вокзал'),
        },
        { name: 'число залитое пустое', kind: 'number', appearance: 'fill', state: null, iconLeft: null, control: amount(null) },
        { name: 'число залитое', kind: 'number', appearance: 'fill', state: null, iconLeft: null, control: amount(2) },
    ];

    public readonly outlineCases: readonly IFieldMaterialCase[] = [
        { name: 'поле', kind: 'input', appearance: 'outline', state: null, iconLeft: null, control: value('Вокзал') },
        { name: 'поле отключённое', kind: 'input', appearance: 'outline', state: null, iconLeft: null, control: off('Вокзал') },
        { name: 'отключённое пустое', kind: 'input', appearance: 'outline', state: null, iconLeft: null, control: off(null) },
        { name: 'выбор отключённый', kind: 'select', appearance: 'outline', state: null, iconLeft: null, control: off('station') },
        {
            name: 'число отключённое',
            kind: 'number',
            appearance: 'outline',
            state: null,
            iconLeft: null,
            control: new FormControl<number | null>({ value: 2, disabled: true }),
        },
        { name: 'текст отключённый', kind: 'textarea', appearance: 'outline', state: null, iconLeft: null, control: off('Поздний заезд') },
    ];

    public readonly lowCases: readonly IFieldMaterialCase[] = [
        { name: 'выбор обведённый', kind: 'select', appearance: 'outline', state: null, iconLeft: null, control: value('station') },
        { name: 'поле обведённое', kind: 'input', appearance: 'outline', state: null, iconLeft: null, control: value('Вокзал') },
    ];

    public readonly ownCases: readonly IFieldMaterialCase[] = [
        { name: 'выбор обведённый', kind: 'select', appearance: 'outline', state: null, iconLeft: null, control: value('station') },
        { name: 'выбор пустой', kind: 'select', appearance: 'outline', state: null, iconLeft: null, control: value(null) },
        { name: 'выбор залитый', kind: 'select', appearance: 'fill', state: null, iconLeft: null, control: value('station') },
        { name: 'поле обведённое', kind: 'input', appearance: 'outline', state: null, iconLeft: null, control: value('Вокзал') },
        { name: 'поле залитое', kind: 'input', appearance: 'fill', state: null, iconLeft: null, control: value('Вокзал') },
    ];

    public readonly widthCases: readonly IFieldWidthCase[] = [
        { name: 'по содержимому', style: {}, control: value('hostel') },
        { name: '212 px, короткое значение', style: { '--rt-input-min-width': '212px' }, control: value('hostel') },
        { name: '212 px, длинное значение', style: { '--rt-input-min-width': '212px' }, control: value('station') },
    ];

    /** Подпись случая: у всех наборов имя лежит в одном поле. */
    public readonly caseLabel: (item: { readonly name: string }) => string = (item: { readonly name: string }): string => item.name;
}
