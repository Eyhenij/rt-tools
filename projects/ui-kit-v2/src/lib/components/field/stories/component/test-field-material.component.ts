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

        <div data-preset="material" data-rt-density="-1">
            <app-story-row
                caption="Отключённые залитые поля — заливка Material, on-surface 4 %"
                [items]="disabledFillCases"
                [itemLabel]="caseLabel"
                [slotWidth]="fieldWidth">
                <ng-template let-fieldCase>
                    <ng-container *ngTemplateOutlet="field; context: { $implicit: fieldCase, preset: null }" />
                </ng-template>
            </app-story-row>
        </div>

        <div data-preset="material" data-rt-density="-1">
            <app-story-row
                caption="Крестик очистки — крестик первого кита: 19 px, значок 12 px, в 8 px от края и 4 px от текста"
                [items]="clearCases"
                [itemLabel]="caseLabel"
                [slotWidth]="fieldWidth">
                <ng-template let-fieldCase>
                    <ng-container *ngTemplateOutlet="field; context: { $implicit: fieldCase, preset: null }" />
                </ng-template>
            </app-story-row>
        </div>

        <app-story-row
            caption="Свой вид кита: крестик прежний, 32 px"
            [items]="kitClearCases"
            [itemLabel]="caseLabel"
            [slotWidth]="fieldWidth">
            <ng-template let-fieldCase>
                <ng-container *ngTemplateOutlet="field; context: { $implicit: fieldCase, preset: null }" />
            </ng-template>
        </app-story-row>

        <div data-preset="material" data-rt-density="-1">
            <app-story-row
                caption="Строка под полем — строка подсказки Material: 16 px и 4 px над ней"
                [items]="messageCases"
                [itemLabel]="caseLabel"
                [slotWidth]="fieldWidth">
                <ng-template let-fieldCase>
                    <ng-container *ngTemplateOutlet="field; context: { $implicit: fieldCase, preset: null }" />
                </ng-template>
            </app-story-row>
        </div>

        <app-story-row
            caption="Свой вид кита: строка под полем прежняя"
            [items]="kitMessageCases"
            [itemLabel]="caseLabel"
            [slotWidth]="fieldWidth">
            <ng-template let-fieldCase>
                <ng-container *ngTemplateOutlet="field; context: { $implicit: fieldCase, preset: null }" />
            </ng-template>
        </app-story-row>

        <div data-preset="material" data-rt-density="-1">
            <app-story-row
                caption="Область текста залитая — как залитое поле ввода"
                [items]="textCases"
                [itemLabel]="caseLabel"
                [slotWidth]="fieldWidth">
                <ng-template let-fieldCase>
                    <ng-container *ngTemplateOutlet="field; context: { $implicit: fieldCase, preset: null }" />
                </ng-template>
            </app-story-row>
        </div>

        <app-story-row
            caption="Свой вид кита: область текста залитая"
            [items]="kitTextCases"
            [itemLabel]="caseLabel"
            [slotWidth]="fieldWidth">
            <ng-template let-fieldCase>
                <ng-container *ngTemplateOutlet="field; context: { $implicit: fieldCase, preset: null }" />
            </ng-template>
        </app-story-row>

        <div data-preset="material" data-rt-density="-1">
            <app-story-row
                caption="Кнопка-значок на месте значка: значок в 12 px от края, текст с 40 px"
                [items]="actionCases"
                [itemLabel]="caseLabel"
                [slotWidth]="fieldWidth">
                <ng-template let-fieldCase>
                    <ng-container *ngTemplateOutlet="field; context: { $implicit: fieldCase, preset: null }" />
                </ng-template>
            </app-story-row>
        </div>

        <div data-preset="material" data-rt-density="-1">
            <app-story-row
                caption="Высота поля Material: выбор со своим шаблоном значения — 52 px, область текста в 4 строки — 124 px"
                [items]="heightCases"
                [itemLabel]="caseLabel"
                [slotWidth]="fieldWidth">
                <ng-template let-heightCase>
                    <rt-field label="Оформление" [reserveHintSpace]="true">
                        @if (heightCase.kind === 'select') {
                            <rt-select appearance="fill" [clearable]="false" [options]="schemes" [formControl]="heightCase.control">
                                <ng-template rtSelectOption let-option>
                                    <rt-icon name="check-circle" [style.color]="option.value" />
                                    {{ option.label }}
                                </ng-template>
                            </rt-select>
                        } @else {
                            <rt-textarea appearance="fill" [rows]="4" [formControl]="heightCase.control" />
                        }
                    </rt-field>
                </ng-template>
            </app-story-row>
        </div>

        <div data-preset="material" data-rt-density="-1">
            <app-story-row
                caption="Залитое поле без подписи: места под подпись нет, значение посередине, строка подсказки держится"
                [items]="unlabeledCases"
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
            <rt-field
                [label]="fieldCase.noLabel ? '' : 'Гостиница'"
                [hint]="fieldCase.hint ?? ''"
                [reserveHintSpace]="fieldCase.reserve ?? false"
                [attr.data-preset]="preset"
                [attr.data-story-state]="fieldCase.state">
                @if (fieldCase.kind === 'select') {
                    <rt-select
                        placeholder="Выберите"
                        [appearance]="fieldCase.appearance"
                        [options]="hotels"
                        [formControl]="fieldCase.control" />
                } @else if (fieldCase.kind === 'textarea') {
                    <rt-textarea
                        placeholder="Комментарий"
                        [appearance]="fieldCase.appearance === 'fill' ? 'fill' : 'outline'"
                        [formControl]="fieldCase.control" />
                } @else if (fieldCase.kind === 'number') {
                    <rt-input-number placeholder="0" [appearance]="fieldCase.appearance" [formControl]="fieldCase.control" />
                } @else {
                    <rt-input
                        placeholder="Название"
                        iconLeftTooltip="Найти"
                        iconRightTooltip="Найти"
                        [appearance]="fieldCase.appearance"
                        [iconLeft]="fieldCase.iconLeft"
                        [iconRight]="fieldCase.iconRight ?? null"
                        [iconLeftAction]="fieldCase.iconAction ?? false"
                        [iconRightAction]="fieldCase.iconAction ?? false"
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
