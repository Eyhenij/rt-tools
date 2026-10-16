import { FormControl, Validators } from '@angular/forms';

import { IRtIcon } from '../../../icon/rt-icon.model';
import { RtInputComponent } from '../../../input/rt-input.component';
import { IRtInput } from '../../../input/rt-input.model';
import { RtInputNumberComponent } from '../../../input-number/rt-input-number.component';
import { RtSelectComponent } from '../../../select/rt-select.component';
import { IRtSelect } from '../../../select/rt-select.model';
import { RtTextareaComponent } from '../../../textarea/rt-textarea.component';

/*
 * Случаи истории Molecules/Forms/Field → Material: значения полей и наборы строк. Отдельным файлом,
 * чтобы обёртка истории держалась под пределом длины файла. В пакет не уезжает.
 */

/** Контролы, которые показ кладёт в поле: ключи — имена случаев. */
export interface IFieldKinds {
    readonly input: RtInputComponent;
    readonly select: RtSelectComponent<string>;
    readonly number: RtInputNumberComponent;
    readonly textarea: RtTextareaComponent;
}

/** Случай поля под материальным набором: контрол, вид, состояние и значки по сторонам. */
export interface IFieldMaterialCase {
    readonly name: string;
    readonly kind: keyof IFieldKinds;
    readonly appearance: IRtInput.Appearance;
    readonly state: string | null;
    readonly iconLeft: IRtIcon.Name | null;
    readonly iconRight?: IRtIcon.Name;
    readonly iconAction?: boolean;
    readonly hint?: string;
    readonly reserve?: boolean;
    readonly control: FormControl<string | null> | FormControl<number | null>;
}

/** Случай ширины: что задано на предке и какое значение стоит в поле. */
export interface IFieldWidthCase {
    readonly name: string;
    readonly style: Record<string, string>;
    readonly control: FormControl<string | null>;
}

/** Цвета оформления: шаблон строки рисует перед подписью цветной значок. */
export const SCHEMES: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Синяя', value: '#1e88e5' },
    { label: 'Зелёная', value: '#43a047' },
];

export const HOTELS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Гостиница у вокзала', value: 'station' },
    { label: 'Хостел', value: 'hostel' },
];

/** Значение области текста. */
export const LATE_CHECKIN: string = 'Поздний заезд';

export function value(text: string | null): FormControl<string | null> {
    return new FormControl<string | null>(text);
}

export function amount(count: number | null): FormControl<number | null> {
    return new FormControl<number | null>(count);
}

/** Отключённое поле с заданным значением. */
export function off(text: string | null): FormControl<string | null> {
    return new FormControl<string | null>({ value: text, disabled: true });
}

/** Обязательное тронутое поле без значения: звёздочка и отказ под полем. */
export function failing(): FormControl<string | null> {
    const control: FormControl<string | null> = new FormControl<string | null>(null, { validators: [Validators.required] });
    control.markAsTouched();
    return control;
}

/** Поля с крестиком очистки: у каждой строки свои значения, крестик одной не очищает другую. */
export function clearing(): readonly IFieldMaterialCase[] {
    return [
        { name: 'залитое с крестиком', kind: 'input', appearance: 'fill', state: null, iconLeft: null, control: value('Вокзал') },
        { name: 'обведённое с крестиком', kind: 'input', appearance: 'outline', state: null, iconLeft: null, control: value('Вокзал') },
        { name: 'выбор залитый с крестиком', kind: 'select', appearance: 'fill', state: null, iconLeft: null, control: value('station') },
        {
            name: 'выбор обведённый с крестиком',
            kind: 'select',
            appearance: 'outline',
            state: null,
            iconLeft: null,
            control: value('hostel'),
        },
        { name: 'поиск пустой', kind: 'input', appearance: 'fill', state: null, iconLeft: 'search', control: value(null) },
        { name: 'поиск со значением', kind: 'input', appearance: 'fill', state: null, iconLeft: 'search', control: value('Вокзал') },
    ];
}

/** Строка под полем: резерв без сообщения, подсказка, отказ поверх подсказки. */
export function messages(): readonly IFieldMaterialCase[] {
    return [
        { name: 'резерв строки', kind: 'input', appearance: 'fill', state: null, iconLeft: null, reserve: true, control: value('Вокзал') },
        { name: 'подсказка', kind: 'input', appearance: 'fill', state: null, iconLeft: null, hint: 'Как в паспорте', control: value(null) },
        {
            name: 'отказ с резервом',
            kind: 'input',
            appearance: 'outline',
            state: null,
            iconLeft: null,
            hint: 'Как в паспорте',
            reserve: true,
            control: failing(),
        },
    ];
}

/** Области текста: залитая пустая, залитая со значением, обведённая. */
export function texts(): readonly IFieldMaterialCase[] {
    return [
        { name: 'текст залитый пустой', kind: 'textarea', appearance: 'fill', state: null, iconLeft: null, control: value(null) },
        { name: 'текст залитый', kind: 'textarea', appearance: 'fill', state: null, iconLeft: null, control: value(LATE_CHECKIN) },
        { name: 'текст обведённый', kind: 'textarea', appearance: 'outline', state: null, iconLeft: null, control: value(LATE_CHECKIN) },
    ];
}
