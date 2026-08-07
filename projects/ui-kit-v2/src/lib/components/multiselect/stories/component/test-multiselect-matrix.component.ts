import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { STORY_FIELD_WIDTH } from '../../../../../showcase/story-metrics';
import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_TRIGGER_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { IRtInput } from '../../../input/rt-input.model';
import { IRtSelect } from '../../../select/rt-select.model';
import { RtMultiselectComponent } from '../../rt-multiselect.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type MultiselectMatrixPart = 'size' | 'chips' | 'bordered' | 'states' | 'themes' | 'panel';

/** Что показывает открытая панель: набор вариантов или его отсутствие. */
export type MultiselectPanelCase = 'options' | 'empty';

/** Наполненность триггера: сколько фишек влезло и с какого места пошёл счётчик `+N`. */
interface IMultiselectChipsCase {
    readonly name: string;
    readonly maxChips: number;
    readonly control: FormControl<readonly string[] | null>;
}

/** Рамка покоя вместе с выбором: снятую видно только по тому, что от неё осталось. */
interface IMultiselectBorderedCase {
    readonly name: string;
    readonly bordered: boolean;
    readonly control: FormControl<readonly string[] | null>;
}

/** Состояние, которое задаётся не псевдоклассом, а значением, формой или обёрткой. */
interface IMultiselectStateCase {
    readonly name: string;
    readonly control: FormControl<readonly string[] | null>;
    readonly disabled: boolean;
    /** Плоский режим чтения включает вмещающее поле, поэтому ячейка обёрнута в `rt-field`. */
    readonly flat: boolean;
}

/** Что показывает светло-тёмная пара: подсказка, фишки, счётчик, ошибка и отключённый триггер. */
interface IMultiselectThemeCase {
    readonly name: string;
    readonly disabled: boolean;
    readonly control: FormControl<readonly string[] | null>;
}

/** Выбранные значения: собственного входа значения у контрола нет, его пишет `writeValue`. */
function chosen(values: readonly string[]): FormControl<readonly string[] | null> {
    return new FormControl<readonly string[] | null>(values);
}

/**
 * Список, уже подсвеченный ошибкой. Касание проставляется здесь, а не жестом: подсветка
 * включается по `invalid && (touched || dirty)`, и до касания исправный с виду триггер
 * показывал бы, что ошибки не бывает вовсе.
 */
function invalid(): FormControl<readonly string[] | null> {
    const control: FormControl<readonly string[] | null> = new FormControl<readonly string[] | null>([], [Validators.required]);
    control.markAsTouched();
    return control;
}

/**
 * Матрицы состояний `rt-multiselect` для витрины.
 *
 * Оси не перемножены: размер, число фишек и рамка меняют разные части триггера и вместе
 * ничего нового не показывают.
 *
 * **Панель — отдельная история, и открытая панель в истории ровно одна:** второй открытый
 * список закрыл бы первый. Виды опций — отмеченная, подсвеченная, отключённая — показаны
 * набором внутри одной панели.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-multiselect-matrix',
    template: `
        @switch (part) {
            @case ('size') {
                <app-story-row caption="Размер" [items]="sizes" [slotWidth]="fieldWidth">
                    <ng-template let-size>
                        <rt-multiselect
                            ariaLabel="Размер"
                            placeholder="Выберите города"
                            [size]="size"
                            [options]="options"
                            [formControl]="sizeControl" />
                    </ng-template>
                </app-story-row>
            }

            @case ('chips') {
                <app-story-row caption="Фишки и счётчик" [items]="chipsCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-chipsCase>
                        <rt-multiselect
                            placeholder="Выберите города"
                            [ariaLabel]="chipsCase.name"
                            [maxChips]="chipsCase.maxChips"
                            [options]="options"
                            [formControl]="chipsCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('bordered') {
                <app-story-row caption="Рамка" [items]="borderedCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-borderedCase>
                        <rt-multiselect
                            [ariaLabel]="borderedCase.name"
                            [bordered]="borderedCase.bordered"
                            [options]="options"
                            [formControl]="borderedCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" [items]="states" [itemLabel]="stateLabel" [slotWidth]="fieldWidth">
                    <ng-template let-state>
                        <rt-multiselect
                            ariaLabel="Состояние"
                            placeholder="Выберите города"
                            [options]="options"
                            [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>

                <app-story-row caption="Значение, форма и обёртка" [items]="stateCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-stateCase>
                        @if (stateCase.flat) {
                            <rt-field [readonly]="true">
                                <rt-multiselect [ariaLabel]="stateCase.name" [options]="options" [formControl]="stateCase.control" />
                            </rt-field>
                        } @else {
                            <rt-multiselect
                                placeholder="Выберите города"
                                [ariaLabel]="stateCase.name"
                                [disabled]="stateCase.disabled"
                                [options]="options"
                                [formControl]="stateCase.control" />
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Триггер в обеих темах">
                    <ng-template>
                        @for (themeCase of themeCases; track themeCase.name) {
                            <rt-multiselect
                                placeholder="Выберите города"
                                [ariaLabel]="themeCase.name"
                                [disabled]="themeCase.disabled"
                                [options]="options"
                                [formControl]="themeCase.control" />
                        }
                    </ng-template>
                </app-story-themes>
            }

            @case ('panel') {
                <div class="app-multiselect-matrix__panel-slot">
                    <rt-multiselect
                        ariaLabel="Открытый список"
                        placeholder="Выберите города"
                        [attr.data-story-trigger]="triggerAttribute"
                        [options]="panel === 'empty' ? noOptions : options"
                        [formControl]="panelControl" />
                </div>
            }
        }
    `,
    styles: `
        /* Панель уезжает в контейнер оверлеев и ложится поверх страницы: без запаса снизу
           она вышла бы за нижний край окна, и нижние опции пришлось бы искать прокруткой. */
        .app-multiselect-matrix__panel-slot {
            width: 15rem;
            padding-bottom: 18rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtFieldComponent,
        RtMultiselectComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtMultiselectMatrixComponent {
    public part: MultiselectMatrixPart = 'size';
    public panel: MultiselectPanelCase = 'options';

    public readonly fieldWidth: string = STORY_FIELD_WIDTH;
    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;
    public readonly sizes: readonly IRtInput.Size[] = ['sm', 'md', 'lg'];
    public readonly states: readonly IStoryState[] = STORY_TRIGGER_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    /** Пустой набор для истории пустой панели — вынесен в поле, чтобы шаблон не пересоздавал его. */
    public readonly noOptions: ReadonlyArray<IRtSelect.Option<string>> = [];

    /** Набор опций один на все матрицы: разойдись наборы, разница читалась бы как разница состояний. */
    public readonly options: ReadonlyArray<IRtSelect.Option<string>> = [
        { label: 'Москва', value: 'msk' },
        { label: 'Санкт-Петербург', value: 'spb' },
        { label: 'Новосибирск', value: 'nsk' },
        { label: 'Казань', value: 'kzn' },
        { label: 'Владивосток', value: 'vvo', disabled: true },
    ];

    /** Выбор ряда размеров: фишка нужна, чтобы высота триггера мерилась по содержимому. */
    public readonly sizeControl: FormControl<readonly string[] | null> = chosen(['msk']);

    /** Выбор открытой панели: по нему видно, чем отмеченная опция отличается от прочих. */
    public readonly panelControl: FormControl<readonly string[] | null> = chosen(['spb', 'nsk']);

    public readonly chipsCases: readonly IMultiselectChipsCase[] = [
        { name: 'пусто', maxChips: 3, control: chosen([]) },
        { name: 'одна фишка', maxChips: 3, control: chosen(['msk']) },
        { name: 'до предела', maxChips: 3, control: chosen(['msk', 'spb', 'nsk']) },
        { name: 'сверх предела', maxChips: 3, control: chosen(['msk', 'spb', 'nsk', 'kzn']) },
        { name: 'maxChips=1', maxChips: 1, control: chosen(['msk', 'spb', 'nsk']) },
    ];

    public readonly borderedCases: readonly IMultiselectBorderedCase[] = [
        { name: 'с рамкой', bordered: true, control: chosen(['msk']) },
        { name: 'без рамки', bordered: false, control: chosen(['msk']) },
    ];

    public readonly stateCases: readonly IMultiselectStateCase[] = [
        { name: 'ошибка', control: invalid(), disabled: false, flat: false },
        { name: 'отключено', control: chosen([]), disabled: true, flat: false },
        { name: 'отключено с выбором', control: chosen(['msk', 'spb']), disabled: true, flat: false },
        { name: 'только чтение', control: chosen(['msk', 'spb']), disabled: false, flat: true },
        { name: 'только чтение без выбора', control: chosen([]), disabled: false, flat: true },
    ];

    public readonly themeCases: readonly IMultiselectThemeCase[] = [
        { name: 'подсказка', disabled: false, control: chosen([]) },
        { name: 'с фишками', disabled: false, control: chosen(['msk', 'spb']) },
        { name: 'со счётчиком', disabled: false, control: chosen(['msk', 'spb', 'nsk', 'kzn']) },
        { name: 'ошибка', disabled: false, control: invalid() },
        { name: 'отключено', disabled: true, control: chosen(['msk']) },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
