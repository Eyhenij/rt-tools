import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { STORY_FIELD_WIDTH } from '../../../../../showcase/story-metrics';
import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_TRIGGER_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { IRtInput } from '../../../input/rt-input.model';
import { RtSelectComponent } from '../../rt-select.component';
import { IRtSelect } from '../../rt-select.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type SelectMatrixPart = 'size' | 'filling' | 'bordered' | 'states' | 'themes' | 'panel';

/** Что показывает открытая панель: обычный список, список с фильтром, пустой набор. */
export type SelectPanelCase = 'options' | 'filter' | 'empty';

/** Наполненность триггера: она решает, видно ли крестик очистки и подпись вместо подсказки. */
interface ISelectFillingCase {
    readonly name: string;
    readonly clearable: boolean;
    readonly control: FormControl<string | null>;
}

/** Рамка покоя вместе со значением: снятую видно только по тому, что от неё осталось. */
interface ISelectBorderedCase {
    readonly name: string;
    readonly bordered: boolean;
    readonly control: FormControl<string | null>;
}

/** Состояние, которое задаётся не псевдоклассом, а значением, формой или обёрткой. */
interface ISelectStateCase {
    readonly name: string;
    readonly control: FormControl<string | null>;
    readonly disabled: boolean;
    /** Плоский режим чтения включает вмещающее поле, поэтому ячейка обёрнута в `rt-field`. */
    readonly flat: boolean;
}

/** Что показывает светло-тёмная пара: выбор, подсказка, ошибка и отключённый триггер. */
interface ISelectThemeCase {
    readonly name: string;
    readonly disabled: boolean;
    readonly control: FormControl<string | null>;
}

/** Выбранное значение: собственного входа значения у контрола нет, его пишет `writeValue`. */
function chosen(value: string | null): FormControl<string | null> {
    return new FormControl<string | null>(value);
}

/**
 * Список, уже подсвеченный ошибкой. Касание проставляется здесь, а не жестом: подсветка
 * включается по `invalid && (touched || dirty)`, и до касания исправный с виду триггер
 * показывал бы, что ошибки не бывает вовсе.
 */
function invalid(): FormControl<string | null> {
    const control: FormControl<string | null> = new FormControl<string | null>(null, [Validators.required]);
    control.markAsTouched();
    return control;
}

/**
 * Матрицы состояний `rt-select` для витрины.
 *
 * Оси не перемножены: размер, наполненность и рамка меняют разные части триггера и вместе
 * ничего нового не показывают.
 *
 * **Панель — отдельная история, и открытая панель в истории ровно одна.** Открывает её
 * `play`-функция; второй открытый список закрыл бы первый, поэтому виды опций (выбранная,
 * подсвеченная, отключённая) показаны не рядом стоящими панелями, а набором внутри одной.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-select-matrix',
    template: `
        @switch (part) {
            @case ('size') {
                <app-story-row caption="Размер" [items]="sizes" [slotWidth]="fieldWidth">
                    <ng-template let-size>
                        <rt-select ariaLabel="Размер" placeholder="Выберите" [size]="size" [options]="options" />
                    </ng-template>
                </app-story-row>
            }

            @case ('filling') {
                <app-story-row caption="Наполненность и очистка" [items]="fillingCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-fillingCase>
                        <rt-select
                            placeholder="Выберите город"
                            [ariaLabel]="fillingCase.name"
                            [clearable]="fillingCase.clearable"
                            [options]="options"
                            [formControl]="fillingCase.control" />
                    </ng-template>
                </app-story-row>

                <app-story-row caption="Иконка слева" [items]="iconCases" [itemLabel]="iconLabel" [slotWidth]="fieldWidth">
                    <ng-template let-withIcon>
                        <rt-select
                            ariaLabel="Иконка слева"
                            placeholder="Выберите город"
                            [iconLeft]="withIcon ? 'ico-search' : null"
                            [options]="options" />
                    </ng-template>
                </app-story-row>
            }

            @case ('bordered') {
                <app-story-row caption="Рамка" [items]="borderedCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-borderedCase>
                        <rt-select
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
                        <rt-select
                            ariaLabel="Состояние"
                            placeholder="Выберите город"
                            [options]="options"
                            [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>

                <app-story-row caption="Значение, форма и обёртка" [items]="stateCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                    <ng-template let-stateCase>
                        @if (stateCase.flat) {
                            <rt-field [readonly]="true">
                                <rt-select [ariaLabel]="stateCase.name" [options]="options" [formControl]="stateCase.control" />
                            </rt-field>
                        } @else {
                            <rt-select
                                placeholder="Выберите город"
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
                            <rt-select
                                placeholder="Выберите город"
                                [ariaLabel]="themeCase.name"
                                [disabled]="themeCase.disabled"
                                [options]="options"
                                [formControl]="themeCase.control" />
                        }
                    </ng-template>
                </app-story-themes>
            }

            @case ('panel') {
                <div class="app-select-matrix__panel-slot">
                    <rt-select
                        ariaLabel="Открытый список"
                        placeholder="Выберите город"
                        [attr.data-story-trigger]="triggerAttribute"
                        [filter]="panel === 'filter'"
                        [options]="panel === 'empty' ? noOptions : options"
                        [formControl]="panelControl" />
                </div>
            }
        }
    `,
    styles: `
        /* Панель уезжает в контейнер оверлеев и ложится поверх страницы: без запаса снизу
           она вышла бы за нижний край окна, и нижние опции пришлось бы искать прокруткой. */
        .app-select-matrix__panel-slot {
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
        RtSelectComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtSelectMatrixComponent {
    public part: SelectMatrixPart = 'size';
    public panel: SelectPanelCase = 'options';

    public readonly fieldWidth: string = STORY_FIELD_WIDTH;
    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;
    public readonly sizes: readonly IRtInput.Size[] = ['sm', 'md', 'lg'];
    public readonly states: readonly IStoryState[] = STORY_TRIGGER_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    /** Значения ряда иконки: без неё и с ней. */
    public readonly iconCases: readonly boolean[] = [false, true];

    /** Пустой набор для истории пустой панели — вынесен в поле, чтобы шаблон не пересоздавал его. */
    public readonly noOptions: ReadonlyArray<IRtSelect.Option<string>> = [];

    /**
     * Набор опций один на все матрицы: отключённая и выбранная нужны панели, а остальным
     * матрицам нужен правдоподобный список — разойдись наборы, разница читалась бы как
     * разница между состояниями.
     */
    public readonly options: ReadonlyArray<IRtSelect.Option<string>> = [
        { label: 'Москва', value: 'msk' },
        { label: 'Санкт-Петербург', value: 'spb' },
        { label: 'Новосибирск', value: 'nsk' },
        { label: 'Владивосток', value: 'vvo', disabled: true },
    ];

    /** Значение открытой панели: по нему видно, чем выбранная опция отличается от прочих. */
    public readonly panelControl: FormControl<string | null> = chosen('spb');

    public readonly fillingCases: readonly ISelectFillingCase[] = [
        { name: 'пусто', clearable: true, control: chosen(null) },
        { name: 'со значением', clearable: true, control: chosen('msk') },
        { name: 'clearable=false', clearable: false, control: chosen('msk') },
    ];

    public readonly borderedCases: readonly ISelectBorderedCase[] = [
        { name: 'с рамкой', bordered: true, control: chosen('msk') },
        { name: 'без рамки', bordered: false, control: chosen('msk') },
    ];

    public readonly stateCases: readonly ISelectStateCase[] = [
        { name: 'ошибка', control: invalid(), disabled: false, flat: false },
        { name: 'отключено', control: chosen(null), disabled: true, flat: false },
        { name: 'отключено со значением', control: chosen('msk'), disabled: true, flat: false },
        { name: 'только чтение', control: chosen('msk'), disabled: false, flat: true },
        { name: 'только чтение без значения', control: chosen(null), disabled: false, flat: true },
    ];

    public readonly themeCases: readonly ISelectThemeCase[] = [
        { name: 'подсказка', disabled: false, control: chosen(null) },
        { name: 'со значением', disabled: false, control: chosen('msk') },
        { name: 'ошибка', disabled: false, control: invalid() },
        { name: 'отключено', disabled: true, control: chosen('msk') },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;

    /** Подпись ряда иконки. */
    public readonly iconLabel: (value: boolean) => string = (value: boolean): string => (value ? 'с иконкой' : 'без иконки');
}
