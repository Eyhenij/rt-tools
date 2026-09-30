import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtDatePanelComponent } from '../../panel/rt-date-panel.component';
import { IRtDatePicker } from '../../rt-date-picker.model';

/**
 * «Сегодня» витрины. Панель сама читает часы, и кадр с рамкой сегодняшнего дня менялся бы
 * день ото дня; витрина задаёт момент входом `now`.
 */
const STORY_NOW: Date = new Date(2026, 2, 10, 10, 37);

/** День значения во всех случаях: месяц витрины — март 2026 года. */
const SAMPLE_DAY: string = '2026-03-15';
const SAMPLE_MOMENT: string = '2026-03-15T09:30';
const DATE: IRtDatePicker.Type = 'date';
const DATETIME: IRtDatePicker.Type = 'datetime-local';

/** Какую матрицу панели рисовать: у каждой своя история, и выбирает её этот вход. */
export type TDatePanelMatrixPart = 'types' | 'bounds' | 'months' | 'sheet' | 'themes';

/** Случай панели: тип, значение и границы. */
interface IDatePanelCase {
    readonly name: string;
    readonly type: IRtDatePicker.Type;
    readonly value: string;
    readonly min: string | null;
    readonly max: string | null;
}

/**
 * Панель `rt-date-picker` без поповера: поле открывает её в оверлее, за пределами блока истории,
 * и там её нет ни в паре наборов, ни в паре тем. Здесь она стоит в коробке с поверхностью
 * всплывающей панели — ту поверхность ей даёт поле.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-date-panel-matrix',
    templateUrl: './test-date-panel-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDatePanelComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDatePanelMatrixComponent {
    public part: TDatePanelMatrixPart = 'types';

    public readonly now: Date = STORY_NOW;

    /** Поверхность всплывающей панели: в поле её даёт обёртка поповера. */
    public readonly surface: string =
        'border: 1px solid var(--rt-color-border-subtle); border-radius: var(--rt-overlay-select-radius); ' +
        'background-color: var(--rt-color-bg-surface); box-shadow: var(--rt-overlay-select-shadow)';

    /** Ширина телефона и поверхность шторки. */
    public readonly sheetBox: string = 'inline-size: 22.5rem; background-color: var(--rt-color-bg-surface)';

    public readonly typeCases: readonly IDatePanelCase[] = [
        { name: 'date', type: DATE, value: SAMPLE_DAY, min: null, max: null },
        { name: 'time', type: 'time', value: '09:30', min: null, max: null },
        { name: DATETIME, type: DATETIME, value: SAMPLE_MOMENT, min: null, max: null },
    ];

    public readonly boundCases: readonly IDatePanelCase[] = [
        { name: 'дни до min и после max', type: DATE, value: SAMPLE_DAY, min: '2026-03-05', max: '2026-03-24' },
        { name: 'сегодня за границей', type: DATE, value: '', min: '2026-04-01', max: null },
        { name: 'время с 09:00 до 18:00', type: 'time', value: '18:00', min: '09:00', max: '18:00' },
    ];

    public readonly monthCases: readonly IDatePanelCase[] = [
        { name: 'выбор месяца', type: DATE, value: SAMPLE_DAY, min: null, max: null },
        { name: 'месяцы за границей', type: DATE, value: SAMPLE_DAY, min: '2026-02-10', max: '2026-10-20' },
    ];

    public readonly sheetCases: readonly IDatePanelCase[] = [
        { name: 'дата', type: DATE, value: SAMPLE_DAY, min: null, max: null },
        { name: 'дата со временем', type: DATETIME, value: SAMPLE_MOMENT, min: null, max: null },
    ];

    public readonly themeCases: readonly IDatePanelCase[] = [
        { name: 'date', type: DATE, value: SAMPLE_DAY, min: null, max: null },
        { name: DATETIME, type: DATETIME, value: SAMPLE_MOMENT, min: null, max: null },
    ];

    /** Подпись случая. */
    public readonly caseLabel: (value: IDatePanelCase) => string = (value: IDatePanelCase): string => value.name;
}
