import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { STORY_FIELD_WIDTH } from '../../../../../showcase/story-metrics';
import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { STORY_STATE_FOCUS_VISIBLE, STORY_STATE_FOCUS_WITHIN } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtMultiselectComponent } from '../../../multiselect/rt-multiselect.component';
import { RtSelectOptionDirective } from '../../../select/rt-select-option.directive';
import { RtSelectComponent } from '../../../select/rt-select.component';
import { IRtSelect } from '../../../select/rt-select.model';
import { RtInputComponent } from '../../rt-input.component';
import { IRtInput } from '../../rt-input.model';

/** Какую страницу рисовать: у каждого дополнения поля своя история, и выбирает её этот вход. */
export type TFieldExtrasPart = 'label' | 'label-toolbar' | 'label-themes' | 'option' | 'icon-actions' | 'clear';

/** Случай подписи на рамке: подпись ряда, вид рамки, иконка, состояние и значения двух полей. */
interface ILabelCase {
    readonly name: string;
    readonly appearance: IRtInput.Appearance;
    readonly icon: boolean;
    readonly state: string | null;
    readonly text: FormControl<string | null>;
    readonly color: FormControl<string | null>;
}

/** Группа случаев одного вида рамки. */
interface ILabelGroup {
    readonly caption: string;
    readonly cases: readonly ILabelCase[];
}

/** Случай нажимаемой иконки: подпись ряда, состояние иконки-кнопки и отключена ли она одна. */
interface IActionCase {
    readonly name: string;
    readonly state: string | null;
    readonly disabled: boolean;
    readonly tooltip: string;
}

/** Случай крестика: в порядке обхода он или нет. */
interface IClearCase {
    readonly name: string;
    readonly tabbable: boolean;
    readonly text: FormControl<string | null>;
    readonly color: FormControl<string | null>;
    readonly cities: FormControl<string[] | null>;
}

/** Города множественного выбора: четыре, чтобы за тремя чипами встал счётчик остальных. */
const CITIES: readonly IRtSelect.Option<string>[] = [
    { value: 'msk', label: 'Москва' },
    { value: 'kzn', label: 'Казань' },
    { value: 'nsk', label: 'Новосибирск' },
    { value: 'ekb', label: 'Екатеринбург' },
];

/** Все четыре города выбраны: крестик поля виден, и за чипами стоит «+1». */
function allCities(): FormControl<string[] | null> {
    return new FormControl<string[] | null>(CITIES.map((city: IRtSelect.Option<string>): string => city.value));
}

const COLORS: readonly IRtSelect.Option<string>[] = [
    { value: '#d32f2f', label: 'Красный' },
    { value: '#1976d2', label: 'Синий' },
    { value: '#388e3c', label: 'Зелёный' },
    { value: '#f9a825', label: 'Жёлтый' },
];

/** Контрол показа. Обязательный сразу тронут: иначе ошибку не видно. */
function control(value: string | null, required: boolean = false): FormControl<string | null> {
    const result: FormControl<string | null> = new FormControl<string | null>(value, required ? [Validators.required] : []);
    if (required) {
        result.markAsTouched();
    }
    return result;
}

function labelCases(appearance: IRtInput.Appearance): readonly ILabelCase[] {
    return [
        { appearance, name: 'пусто', icon: false, state: null, text: control(null), color: control(null) },
        { appearance, name: 'пусто, фокус', icon: false, state: STORY_STATE_FOCUS_WITHIN.state, text: control(null), color: control(null) },
        { appearance, name: 'значение', icon: false, state: null, text: control('120 000'), color: control('#1976d2') },
        { appearance, name: 'с иконкой', icon: true, state: null, text: control(null), color: control(null) },
        { appearance, name: 'с иконкой, значение', icon: true, state: null, text: control('Корпус 2'), color: control('#388e3c') },
        { appearance, name: 'ошибка', icon: false, state: null, text: control(null, true), color: control(null, true) },
    ];
}

/**
 * Обёртка страницы дополнений поля ввода и выбора: подпись на рамке, своя строка списка, иконки-
 * кнопки и крестик в порядке обхода. Отдельная от матриц полей: подпись на рамке — вход обеих семей,
 * и порознь ни одна страница не показала бы, что они поднимают её одинаково.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-test-field-extras',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        RtInputComponent,
        RtMultiselectComponent,
        RtSelectComponent,
        RtSelectOptionDirective,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        @switch (part) {
            @case ('label') {
                <app-story-presets caption="Подпись на рамке: поле ввода и выбор, обе рамки">
                    <ng-template>
                        @for (group of labelGroups; track group.caption) {
                            <app-story-row [caption]="group.caption" [items]="group.cases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                                <ng-template let-labelCase>
                                    <rt-input
                                        floatingLabel="Бюджет"
                                        placeholder="0 ₽"
                                        [appearance]="labelCase.appearance"
                                        [iconLeft]="labelCase.icon ? 'ico-search' : null"
                                        [formControl]="labelCase.text"
                                        [attr.data-story-state]="labelCase.state" />
                                </ng-template>
                            </app-story-row>
                            <app-story-row [items]="group.cases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                                <ng-template let-labelCase>
                                    <rt-select
                                        floatingLabel="Цвет темы"
                                        placeholder="Выберите цвет"
                                        [appearance]="labelCase.appearance"
                                        [iconLeft]="labelCase.icon ? 'ico-search' : null"
                                        [options]="colors"
                                        [formControl]="labelCase.color" />
                                </ng-template>
                            </app-story-row>
                        }
                    </ng-template>
                </app-story-presets>
            }

            @case ('label-toolbar') {
                <app-story-presets caption="Плотная панель: подпись на рамке не прибавляет высоты">
                    <ng-template>
                        <div class="app-field-extras-toolbar">
                            <rt-input size="sm" floatingLabel="Бюджет" [formControl]="toolbarBudget" />
                            <rt-select size="sm" floatingLabel="Корпус" [options]="colors" [formControl]="toolbarBuilding" />
                            <rt-input size="sm" ariaLabel="Без подписи" placeholder="Без подписи" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('label-themes') {
                <app-story-themes caption="Подпись на рамке в светлой и тёмной теме">
                    <ng-template>
                        <app-story-row [items]="themeCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-labelCase>
                                <rt-input floatingLabel="Бюджет" placeholder="0 ₽" [formControl]="labelCase.text" />
                            </ng-template>
                        </app-story-row>
                        <app-story-row [items]="themeCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-labelCase>
                                <rt-select floatingLabel="Цвет темы" [options]="colors" [formControl]="labelCase.color" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-themes>
            }

            @case ('option') {
                <div class="app-field-extras-field">
                    <rt-select
                        floatingLabel="Цвет темы"
                        [attr.data-story-trigger]="triggerAttribute"
                        [options]="colors"
                        [formControl]="optionColor">
                        <ng-template rtSelectOption let-option>
                            <span class="app-field-extras-dot" aria-hidden="true" [style.background]="option.value"></span>
                            {{ option.label }}
                        </ng-template>
                    </rt-select>
                </div>
            }

            @case ('icon-actions') {
                <app-story-presets caption="Левая иконка — кнопка с подсказкой; правая осталась картинкой">
                    <ng-template>
                        <app-story-row [items]="actionCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-actionCase>
                                <rt-input
                                    ariaLabel="Поиск"
                                    placeholder="Минимум 3 символа"
                                    iconLeft="ico-search"
                                    iconRight="ico-search"
                                    [iconLeftTooltip]="actionCase.tooltip"
                                    [iconLeftAction]="true"
                                    [iconLeftDisabled]="actionCase.disabled"
                                    [formControl]="searchControl"
                                    [attr.data-story-state]="actionCase.state"
                                    (iconLeftClick)="countSearch()" />
                            </ng-template>
                        </app-story-row>
                        <p class="app-field-extras-note">Нажатий на лупу: {{ searches() }}</p>
                    </ng-template>
                </app-story-presets>
            }

            @case ('clear') {
                <app-story-presets caption="Крестик по Tab: справа — с clearTabbable">
                    <ng-template>
                        <app-story-row [items]="clearCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-clearCase>
                                <rt-input
                                    ariaLabel="Имя"
                                    [clearTabbable]="clearCase.tabbable"
                                    [formControl]="clearCase.text"
                                    (cleared)="countClear()" />
                            </ng-template>
                        </app-story-row>
                        <app-story-row [items]="clearCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-clearCase>
                                <rt-select
                                    ariaLabel="Цвет"
                                    [clearTabbable]="clearCase.tabbable"
                                    [options]="colors"
                                    [formControl]="clearCase.color"
                                    (cleared)="countClear()" />
                            </ng-template>
                        </app-story-row>
                        <app-story-row [items]="clearCases" [itemLabel]="caseLabel" [slotWidth]="multiselectWidth">
                            <ng-template let-clearCase>
                                <rt-multiselect
                                    ariaLabel="Города"
                                    [clearTabbable]="clearCase.tabbable"
                                    [options]="cityOptions"
                                    [formControl]="clearCase.cities"
                                    (cleared)="countClear()" />
                            </ng-template>
                        </app-story-row>
                        <p class="app-field-extras-note">Событий cleared: {{ clears() }}</p>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    // native-ok: обёртка истории витрины — правила коробки живут рядом с показом, а не отдельным файлом
    styles: `
        .app-field-extras-toolbar {
            display: flex;
            align-items: center;
            padding-block-start: var(--rt-space-2);
            gap: var(--rt-space-4);
        }

        .app-field-extras-toolbar > * {
            inline-size: 10rem;
        }

        .app-field-extras-field {
            inline-size: 15rem;
        }

        .app-field-extras-dot {
            flex-shrink: 0;
            block-size: 0.75rem;
            inline-size: 0.75rem;
            border-radius: var(--rt-radius-full);
        }

        .app-field-extras-note {
            margin: 0;
        }
    `,
})
export class TestRtFieldExtrasComponent {
    public part: TFieldExtrasPart = 'label';

    public readonly fieldWidth: string = STORY_FIELD_WIDTH;
    public readonly colors: readonly IRtSelect.Option<string>[] = COLORS;
    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public readonly labelGroups: readonly ILabelGroup[] = [
        { caption: 'Рамка outline', cases: labelCases('outline') },
        { caption: 'Рамка fill', cases: labelCases('fill') },
    ];

    public readonly themeCases: readonly ILabelCase[] = labelCases('outline').filter(
        (labelCase: ILabelCase): boolean => labelCase.state === null && !labelCase.icon
    );

    public readonly toolbarBudget: FormControl<string | null> = control('120 000');
    public readonly toolbarBuilding: FormControl<string | null> = control(null);
    public readonly optionColor: FormControl<string | null> = control('#1976d2');

    public readonly actionCases: readonly IActionCase[] = [
        { name: 'обычное', state: null, disabled: false, tooltip: 'Найти на сервере' },
        { name: 'фокус с клавиши', state: STORY_STATE_FOCUS_VISIBLE.state, disabled: false, tooltip: 'Найти на сервере' },
        { name: 'кнопка отключена, поле нет', state: null, disabled: true, tooltip: 'Минимум 3 символа' },
    ];

    public readonly searchControl: FormControl<string | null> = control('офис');
    public readonly searches: WritableSignal<number> = signal<number>(0);

    public readonly clearCases: readonly IClearCase[] = [
        { name: 'как прежде', tabbable: false, text: control('Анна'), color: control('#d32f2f'), cities: allCities() },
        { name: 'clearTabbable', tabbable: true, text: control('Анна'), color: control('#d32f2f'), cities: allCities() },
    ];

    public readonly cityOptions: readonly IRtSelect.Option<string>[] = CITIES;

    /** Ширина множественного выбора по кадру: в 15rem чипы встают столбцом, в кадре — по два в строку. */
    public readonly multiselectWidth: string = '20rem';

    public readonly clears: WritableSignal<number> = signal<number>(0);

    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;

    public countSearch(): void {
        this.searches.update((count: number): number => count + 1);
    }

    public countClear(): void {
        this.clears.update((count: number): number => count + 1);
    }
}
