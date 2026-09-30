import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { STORY_FIELD_WIDTH_WIDE } from '../../../../../showcase/story-metrics';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_FIELD_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { IRtInput } from '../../../input/rt-input.model';
import { RtDateRangeComponent } from '../../rt-date-range.component';
import { IRtDateRange } from '../../rt-date-range.model';

/** Первый день диапазона макета. */
const SAMPLE_START: string = '2026-10-12';

/** Диапазон, на котором показаны все состояния поля: он же стоит в макете. */
const SAMPLE_RANGE: IRtDateRange.Value = { start: SAMPLE_START, end: '2026-10-15' };

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TDateRangeMatrixPart = 'size' | 'filling' | 'bordered' | 'appearance' | 'states' | 'presets' | 'themes';

/** Случай с подписью и своим значением. */
interface IDateRangeCase {
    readonly name: string;
    readonly control: FormControl<IRtDateRange.Value | null>;
}

/** Рамка покоя: снята она или нет. */
interface IDateRangeBorderedCase extends IDateRangeCase {
    readonly bordered: boolean;
}

/** Два вида поля: рамка со всех сторон и залитое поле с чертой снизу. */
interface IDateRangeAppearanceCase extends IDateRangeCase {
    readonly appearance: IRtInput.Appearance;
}

/** Отключённость — единственное, что светло-тёмная пара меняет от ячейки к ячейке. */
interface IDateRangeThemeCase extends IDateRangeCase {
    readonly disabled: boolean;
}

/** Состояние, которое задаётся не псевдоклассом, а значением, формой или обёрткой. */
interface IDateRangeStateCase extends IDateRangeThemeCase {
    /** Плоский режим чтения включает вмещающее поле, поэтому ячейка обёрнута в `rt-field`. */
    readonly flat: boolean;
}

function range(value: IRtDateRange.Value | null): FormControl<IRtDateRange.Value | null> {
    return new FormControl<IRtDateRange.Value | null>(value);
}

/**
 * Поле, уже подсвеченное ошибкой: касание проставляется здесь, потому что подсветка включается
 * по `invalid && (touched || dirty)` — до касания невалидное поле выглядит исправным.
 */
function invalid(): FormControl<IRtDateRange.Value | null> {
    const control: FormControl<IRtDateRange.Value | null> = new FormControl<IRtDateRange.Value | null>(SAMPLE_RANGE, {
        validators: [(): { period: true } => ({ period: true })],
    });
    control.markAsTouched();
    return control;
}

/**
 * Матрицы состояний `rt-date-range` для витрины.
 *
 * Панель, которую открывает кнопка в конце поля, показывают истории раздела `DateRangePanel`: поле
 * кладёт её в поповер, за пределы блока истории.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-date-range-matrix',
    templateUrl: './test-date-range-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtDateRangeComponent,
        RtFieldComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDateRangeMatrixComponent {
    public part: TDateRangeMatrixPart = 'size';

    /** Две даты через тире шире одной: ячейке дана широкая мера поля. */
    public readonly fieldWidth: string = STORY_FIELD_WIDTH_WIDE;
    public readonly sizes: readonly IRtInput.Size[] = ['sm', 'md', 'lg'];
    public readonly states: readonly IStoryState[] = STORY_FIELD_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    public readonly sizeValue: FormControl<IRtDateRange.Value | null> = range(SAMPLE_RANGE);
    public readonly stateValue: FormControl<IRtDateRange.Value | null> = range(SAMPLE_RANGE);

    public readonly fillingCases: readonly IDateRangeCase[] = [
        { name: 'пусто', control: range(null) },
        { name: 'со значением', control: range(SAMPLE_RANGE) },
        { name: 'один день', control: range({ start: SAMPLE_START, end: SAMPLE_START }) },
    ];

    public readonly borderedCases: readonly IDateRangeBorderedCase[] = [
        { name: 'с рамкой', bordered: true, control: range(SAMPLE_RANGE) },
        { name: 'без рамки', bordered: false, control: range(SAMPLE_RANGE) },
    ];

    public readonly appearanceCases: readonly IDateRangeAppearanceCase[] = [
        { name: 'outline', appearance: 'outline', control: range(SAMPLE_RANGE) },
        { name: 'fill', appearance: 'fill', control: range(SAMPLE_RANGE) },
    ];

    public readonly stateCases: readonly IDateRangeStateCase[] = [
        { name: 'ошибка', control: invalid(), disabled: false, flat: false },
        { name: 'отключено', control: range(SAMPLE_RANGE), disabled: true, flat: false },
        { name: 'только чтение', control: range(SAMPLE_RANGE), disabled: false, flat: true },
        { name: 'только чтение без значения', control: range(null), disabled: false, flat: true },
    ];

    public readonly themeCases: readonly IDateRangeThemeCase[] = [
        { name: 'пустое', control: range(null), disabled: false },
        { name: 'со значением', control: range(SAMPLE_RANGE), disabled: false },
        { name: 'ошибка', control: invalid(), disabled: false },
        { name: 'отключено', control: range(SAMPLE_RANGE), disabled: true },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: IDateRangeCase) => string = (value: IDateRangeCase): string => value.name;
}
