import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtDateRangePanelComponent } from '../../panel/rt-date-range-panel.component';
import { IRtDateRange } from '../../rt-date-range.model';

/**
 * «Сегодня» витрины. Панель сама читает часы, и кадр с рамкой сегодняшнего дня и быстрыми
 * вариантами менялся бы день ото дня; витрина задаёт момент входом `now`.
 */
const STORY_NOW: Date = new Date(2026, 9, 20, 10, 37);

/** Диапазон макета: 12–15 октября 2026 года. */
const SAMPLE_RANGE: IRtDateRange.Value = { start: '2026-10-12', end: '2026-10-15' };

/** Какую матрицу панели рисовать: у каждой своя история, и выбирает её этот вход. */
export type TDateRangePanelMatrixPart = 'selected' | 'selecting' | 'bounds' | 'sheet' | 'themes';

/** Случай панели: значение и границы. */
interface IDateRangePanelCase {
    readonly name: string;
    readonly value: IRtDateRange.Value | null;
    readonly min: string | null;
    readonly max: string | null;
}

/**
 * Панель `rt-date-range` без поповера: поле открывает её в оверлее, за пределами блока истории,
 * и там её нет ни в паре наборов, ни в паре тем. Здесь она стоит в коробке с поверхностью
 * всплывающей панели — ту поверхность ей даёт поле.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-date-range-panel-matrix',
    templateUrl: './test-date-range-panel-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDateRangePanelComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDateRangePanelMatrixComponent {
    public part: TDateRangePanelMatrixPart = 'selected';

    public readonly now: Date = STORY_NOW;

    /** Поверхность всплывающей панели: в поле её даёт обёртка поповера. */
    public readonly surface: string =
        'border: 1px solid var(--rt-color-border-subtle); border-radius: var(--rt-overlay-select-radius); ' +
        'background-color: var(--rt-color-bg-surface); box-shadow: var(--rt-overlay-select-shadow)';

    /** Ширина телефона и поверхность шторки. */
    public readonly sheetBox: string = 'inline-size: 23.4375rem; background-color: var(--rt-color-bg-surface)';

    public readonly selectedCases: readonly IDateRangePanelCase[] = [
        { name: 'выбран диапазон', value: SAMPLE_RANGE, min: null, max: null },
        { name: 'выбран вариант «Последние 7 дней»', value: { start: '2026-10-14', end: '2026-10-20' }, min: null, max: null },
    ];

    /** Пустая панель: начало и будущий диапазон ставит шаг `play` истории — кликом и наведением. */
    public readonly selectingCases: readonly IDateRangePanelCase[] = [{ name: 'ждёт дату окончания', value: null, min: null, max: null }];

    public readonly boundCases: readonly IDateRangePanelCase[] = [
        { name: 'дни до min и после max', value: SAMPLE_RANGE, min: '2026-10-05', max: '2026-11-20' },
    ];

    public readonly sheetCases: readonly IDateRangePanelCase[] = [
        { name: 'последние 7 дней', value: { start: '2026-10-14', end: '2026-10-20' }, min: null, max: null },
        { name: 'пусто', value: null, min: null, max: null },
    ];

    public readonly themeCases: readonly IDateRangePanelCase[] = [{ name: 'выбран диапазон', value: SAMPLE_RANGE, min: null, max: null }];

    /** Подпись случая. */
    public readonly caseLabel: (value: IDateRangePanelCase) => string = (value: IDateRangePanelCase): string => value.name;
}
