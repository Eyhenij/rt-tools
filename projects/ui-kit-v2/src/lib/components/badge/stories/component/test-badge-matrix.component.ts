import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtIconComponent } from '../../../icon/rt-icon.component';
import { RtBadgeDirective } from '../../rt-badge.directive';
import { IRtBadge } from '../../rt-badge.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TBadgeMatrixPart = 'position' | 'color' | 'value' | 'presets' | 'themes';

/** Случай значения: что передали и как это подписать. */
interface IBadgeValueCase {
    readonly name: string;
    readonly value: IRtBadge.ValueInput;
    readonly hidden: boolean;
}

/**
 * Матрицы `rtBadge` для витрины.
 *
 * Перемножены угол и наложение — пара, у которой пузырёк меняет место по обеим осям сразу: поверх
 * угла значка и рядом с подписью. Цвет перемножен с размером: маленький пузырёк меняет кегль, и
 * читаемость надо видеть на каждой заливке.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-badge-matrix',
    templateUrl: './test-badge-matrix.component.html',
    // native-ok: раскладка ячеек витрины — пузырёк выходит за хост, и ячейке нужен запас по краям
    styles: `
        .app-badge-demo__cell {
            display: flex;
            align-items: center;
            padding: var(--rt-space-4) var(--rt-space-8);
            gap: var(--rt-space-10);
        }

        .app-badge-demo__label {
            font-size: var(--rt-text-sm);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtIconComponent,

        // directives
        RtBadgeDirective,

        // showcase
        StoryGridComponent,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtBadgeMatrixComponent {
    public part: TBadgeMatrixPart = 'position';

    public readonly overlaps: readonly boolean[] = [true, false];
    public readonly positions: readonly IRtBadge.Position[] = ['above-after', 'above-before', 'below-after', 'below-before'];
    public readonly sizes: readonly IRtBadge.Size[] = ['md', 'sm'];
    public readonly colors: readonly IRtBadge.Color[] = ['primary', 'secondary', 'info', 'success', 'warning', 'danger'];

    public readonly values: readonly IBadgeValueCase[] = [
        { name: 'число', value: 7, hidden: false },
        { name: 'ноль', value: 0, hidden: false },
        { name: 'строка 99+', value: '99+', hidden: false },
        { name: 'null — нет пузырька', value: null, hidden: false },
        { name: 'hidden — нет пузырька', value: 7, hidden: true },
    ];

    public readonly overlapLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'overlap — поверх значка' : 'рядом с подписью';

    public readonly valueLabel: (value: IBadgeValueCase) => string = (value: IBadgeValueCase): string => value.name;
}
