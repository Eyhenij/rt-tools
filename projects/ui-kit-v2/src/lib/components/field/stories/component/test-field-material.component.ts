import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { STORY_FIELD_WIDTH } from '../../../../../showcase/story-metrics';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { RtIconComponent } from '../../../icon/rt-icon.component';
import { RtInputComponent } from '../../../input/rt-input.component';
import { RtInputNumberComponent } from '../../../input-number/rt-input-number.component';
import { RtSelectOptionDirective } from '../../../select/rt-select-option.directive';
import { RtSelectComponent } from '../../../select/rt-select.component';
import { RtTextareaComponent } from '../../../textarea/rt-textarea.component';
import { IRtSelect } from '../../../select/rt-select.model';
import { RtFieldComponent } from '../../rt-field.component';
import {
    amount,
    clearing,
    failing,
    HOTELS,
    IFieldMaterialCase,
    IFieldWidthCase,
    LATE_CHECKIN,
    messages,
    off,
    SCHEMES,
    texts,
    unlabeled,
    value,
} from './field-material-cases';

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
    templateUrl: './test-field-material.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        NgTemplateOutlet,
        ReactiveFormsModule,

        // components
        RtFieldComponent,
        RtIconComponent,
        RtInputComponent,
        RtInputNumberComponent,
        RtSelectComponent,
        RtSelectOptionDirective,
        RtTextareaComponent,

        // showcase
        StoryRowComponent,
    ],
})
export class TestRtFieldMaterialComponent {
    public readonly fieldWidth: string = STORY_FIELD_WIDTH;
    public readonly hotels: ReadonlyArray<IRtSelect.Option<string>> = HOTELS;
    public readonly schemes: ReadonlyArray<IRtSelect.Option<string>> = SCHEMES;
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
        { name: 'текст отключённый', kind: 'textarea', appearance: 'outline', state: null, iconLeft: null, control: off(LATE_CHECKIN) },
    ];

    public readonly disabledFillCases: readonly IFieldMaterialCase[] = [
        { name: 'поле', kind: 'input', appearance: 'fill', state: null, iconLeft: null, control: off('Вокзал') },
        { name: 'выбор', kind: 'select', appearance: 'fill', state: null, iconLeft: null, control: off('station') },
        {
            name: 'число',
            kind: 'number',
            appearance: 'fill',
            state: null,
            iconLeft: null,
            control: new FormControl<number | null>({ value: 2, disabled: true }),
        },
        { name: 'текст', kind: 'textarea', appearance: 'fill', state: null, iconLeft: null, control: off(LATE_CHECKIN) },
    ];

    public readonly clearCases: readonly IFieldMaterialCase[] = clearing();
    public readonly kitClearCases: readonly IFieldMaterialCase[] = clearing();

    public readonly messageCases: readonly IFieldMaterialCase[] = messages();
    public readonly kitMessageCases: readonly IFieldMaterialCase[] = messages();
    public readonly unlabeledCases: readonly IFieldMaterialCase[] = unlabeled();
    public readonly textCases: readonly IFieldMaterialCase[] = texts();
    public readonly kitTextCases: readonly IFieldMaterialCase[] = texts();

    public readonly actionCases: readonly IFieldMaterialCase[] = [
        { name: 'значок слева', kind: 'input', appearance: 'outline', state: null, iconLeft: 'search', control: value('Вокзал') },
        {
            name: 'кнопка слева',
            kind: 'input',
            appearance: 'outline',
            state: null,
            iconLeft: 'search',
            iconAction: true,
            control: value('Вокзал'),
        },
        {
            name: 'кнопка слева, пустое',
            kind: 'input',
            appearance: 'fill',
            state: null,
            iconLeft: 'search',
            iconAction: true,
            control: value(null),
        },
        {
            name: 'кнопка справа',
            kind: 'input',
            appearance: 'outline',
            state: null,
            iconLeft: null,
            iconRight: 'search',
            iconAction: true,
            control: value('Вокзал'),
        },
    ];

    public readonly heightCases: readonly IFieldMaterialCase[] = [
        { name: 'выбор со своим шаблоном', kind: 'select', appearance: 'fill', state: null, iconLeft: null, control: value('#1e88e5') },
        { name: 'текст в 4 строки', kind: 'textarea', appearance: 'fill', state: null, iconLeft: null, control: value(LATE_CHECKIN) },
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
