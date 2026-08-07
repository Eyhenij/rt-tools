import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { STORY_FIELD_WIDTH } from '../../../../../showcase/story-metrics';
import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_FIELD_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { RtIconComponent } from '../../../icon/rt-icon.component';
import { IRtInput } from '../../../input/rt-input.model';
import { RtAutocompleteComponent } from '../../rt-autocomplete.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type AutocompleteMatrixPart = 'size' | 'filling' | 'bordered' | 'states' | 'themes' | 'panel';

/** Что показывает открытая панель: подсказки, своя разметка подсказки, ничего не найдено. */
export type AutocompletePanelCase = 'suggestions' | 'template' | 'empty';

/** Наполненность поля: она решает, видно ли крестик очистки и текст вместо подсказки. */
interface IAutocompleteFillingCase {
    readonly name: string;
    readonly iconLeft: boolean;
    readonly control: FormControl<string | null>;
}

/** Рамка покоя вместе со значением: снятую видно только по тому, что от неё осталось. */
interface IAutocompleteBorderedCase {
    readonly name: string;
    readonly bordered: boolean;
    readonly control: FormControl<string | null>;
}

/** Состояние, которое задаётся не псевдоклассом, а значением, формой или обёрткой. */
interface IAutocompleteStateCase {
    readonly name: string;
    readonly control: FormControl<string | null>;
    readonly disabled: boolean;
    /** Плоский режим чтения включает вмещающее поле, поэтому ячейка обёрнута в `rt-field`. */
    readonly flat: boolean;
}

/** Что показывает светло-тёмная пара: подсказка, значение, ошибка и отключённое поле. */
interface IAutocompleteThemeCase {
    readonly name: string;
    readonly disabled: boolean;
    readonly control: FormControl<string | null>;
}

/** Выбранная подсказка: в форме лежит объект (здесь — строка), а не набранный текст. */
function picked(value: string | null): FormControl<string | null> {
    return new FormControl<string | null>(value);
}

/**
 * Поле, уже подсвеченное ошибкой. Касание проставляется здесь, а не жестом: подсветка
 * включается по `invalid && (touched || dirty)`, и до касания исправное с виду поле показывало
 * бы, что ошибки не бывает вовсе.
 */
function invalid(): FormControl<string | null> {
    const control: FormControl<string | null> = new FormControl<string | null>(null, [Validators.required]);
    control.markAsTouched();
    return control;
}

/**
 * Матрицы состояний `rt-autocomplete` для витрины.
 *
 * Оси не перемножены: размер, наполненность и рамка меняют разные части поля и вместе ничего
 * нового не показывают.
 *
 * **Панель — отдельная история, и открытая панель в истории ровно одна.** Открывает её
 * `play`-функция набором текста: щелчком поле с подсказками не раскрывается — оно считает длину
 * строки и только потом просит подсказки.
 *
 * Подсказки здесь не ищутся: обёртка держит готовый набор и на `(complete)` не отвечает. Искать
 * — дело потребителя, и подменять это витриной значило бы показывать поведение, которого у
 * компонента нет.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-autocomplete-matrix',
    template: `
        @switch (part) {
            @case ('size') {
                <app-story-row caption="Размер" [items]="sizes" [slotWidth]="fieldWidth">
                    <ng-template let-size>
                        <rt-autocomplete
                            ariaLabel="Размер"
                            placeholder="Начните вводить город"
                            [size]="size"
                            [suggestions]="suggestions"
                            [displayWith]="displayWith" />
                    </ng-template>
                </app-story-row>
            }

            @case ('filling') {
                <app-story-row caption="Наполненность и иконка" [items]="fillingCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-fillingCase>
                        <rt-autocomplete
                            placeholder="Начните вводить город"
                            [ariaLabel]="fillingCase.name"
                            [iconLeft]="fillingCase.iconLeft ? 'ico-search' : null"
                            [suggestions]="suggestions"
                            [displayWith]="displayWith"
                            [formControl]="fillingCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('bordered') {
                <app-story-row caption="Рамка" [items]="borderedCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-borderedCase>
                        <rt-autocomplete
                            [ariaLabel]="borderedCase.name"
                            [bordered]="borderedCase.bordered"
                            [suggestions]="suggestions"
                            [displayWith]="displayWith"
                            [formControl]="borderedCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" [items]="states" [itemLabel]="stateLabel" [slotWidth]="fieldWidth">
                    <ng-template let-state>
                        <rt-autocomplete
                            ariaLabel="Состояние"
                            placeholder="Начните вводить город"
                            [suggestions]="suggestions"
                            [displayWith]="displayWith"
                            [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>

                <app-story-row caption="Значение, форма и обёртка" [items]="stateCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-stateCase>
                        @if (stateCase.flat) {
                            <rt-field [readonly]="true">
                                <rt-autocomplete
                                    [ariaLabel]="stateCase.name"
                                    [suggestions]="suggestions"
                                    [displayWith]="displayWith"
                                    [formControl]="stateCase.control" />
                            </rt-field>
                        } @else {
                            <rt-autocomplete
                                placeholder="Начните вводить город"
                                [ariaLabel]="stateCase.name"
                                [disabled]="stateCase.disabled"
                                [suggestions]="suggestions"
                                [displayWith]="displayWith"
                                [formControl]="stateCase.control" />
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Поле в обеих темах">
                    <ng-template>
                        @for (themeCase of themeCases; track themeCase.name) {
                            <rt-autocomplete
                                placeholder="Начните вводить город"
                                iconLeft="ico-search"
                                [ariaLabel]="themeCase.name"
                                [disabled]="themeCase.disabled"
                                [suggestions]="suggestions"
                                [displayWith]="displayWith"
                                [formControl]="themeCase.control" />
                        }
                    </ng-template>
                </app-story-themes>
            }

            @case ('panel') {
                <div class="app-autocomplete-matrix__panel-slot">
                    <ng-template #richItem let-item>
                        <span class="app-autocomplete-matrix__item">
                            <rt-icon name="map" size="sm" color="muted" />
                            {{ item }}
                        </span>
                    </ng-template>

                    <rt-autocomplete
                        ariaLabel="Открытые подсказки"
                        placeholder="Начните вводить город"
                        [attr.data-story-trigger]="triggerAttribute"
                        [suggestions]="panel === 'empty' ? noSuggestions : suggestions"
                        [displayWith]="displayWith"
                        [itemTemplate]="panel === 'template' ? richItem : null" />
                </div>
            }
        }
    `,
    styles: `
        /* Панель уезжает в контейнер оверлеев и ложится поверх страницы: без запаса снизу
           она вышла бы за нижний край окна, и нижние подсказки пришлось бы искать прокруткой. */
        .app-autocomplete-matrix__panel-slot {
            width: 15rem;
            padding-bottom: 18rem;
        }

        .app-autocomplete-matrix__item {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtAutocompleteComponent,
        RtFieldComponent,
        RtIconComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtAutocompleteMatrixComponent {
    public part: AutocompleteMatrixPart = 'size';
    public panel: AutocompletePanelCase = 'suggestions';

    public readonly fieldWidth: string = STORY_FIELD_WIDTH;
    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;
    public readonly sizes: readonly IRtInput.Size[] = ['sm', 'md', 'lg'];
    public readonly states: readonly IStoryState[] = STORY_FIELD_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    /** Пустой набор для истории «ничего не найдено» — в поле, чтобы шаблон его не пересоздавал. */
    public readonly noSuggestions: ReadonlyArray<string> = [];

    /** Подсказки одни на все матрицы: разойдись наборы, разница читалась бы как разница состояний. */
    public readonly suggestions: ReadonlyArray<string> = ['Минск', 'Могилёв', 'Мозырь', 'Молодечно'];

    public readonly fillingCases: readonly IAutocompleteFillingCase[] = [
        { name: 'пусто', iconLeft: false, control: picked(null) },
        { name: 'со значением', iconLeft: false, control: picked('Минск') },
        { name: 'с иконкой', iconLeft: true, control: picked('Минск') },
    ];

    public readonly borderedCases: readonly IAutocompleteBorderedCase[] = [
        { name: 'с рамкой', bordered: true, control: picked('Минск') },
        { name: 'без рамки', bordered: false, control: picked('Минск') },
    ];

    public readonly stateCases: readonly IAutocompleteStateCase[] = [
        { name: 'ошибка', control: invalid(), disabled: false, flat: false },
        { name: 'отключено', control: picked(null), disabled: true, flat: false },
        { name: 'отключено со значением', control: picked('Минск'), disabled: true, flat: false },
        { name: 'только чтение', control: picked('Минск'), disabled: false, flat: true },
        { name: 'только чтение без значения', control: picked(null), disabled: false, flat: true },
    ];

    public readonly themeCases: readonly IAutocompleteThemeCase[] = [
        { name: 'подсказка', disabled: false, control: picked(null) },
        { name: 'со значением', disabled: false, control: picked('Минск') },
        { name: 'ошибка', disabled: false, control: invalid() },
        { name: 'отключено', disabled: true, control: picked('Минск') },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;

    /**
     * Как показать подсказку. Компонент обобщён по элементу списка; витрине довольно строки,
     * поэтому здесь возвращается само значение. Поле-стрелка линтер считает методом — оно и
     * стоит после остальных полей.
     */
    public readonly displayWith: (item: string | null) => string = (item: string | null): string => String(item ?? '');
}
