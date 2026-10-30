import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtServiceLogoComponent } from '../../rt-service-logo.component';
import { IRtServiceLogo } from '../../rt-service-logo.model';
import { PLACEHOLDER_MARK_BLOCK, PLACEHOLDER_MARK_ICON, PLACEHOLDER_MARK_BARS, PLACEHOLDER_ROWS } from './story-placeholder-marks';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TServiceLogoMatrixPart = 'size' | 'icon' | 'themes';

/** Случай знака значком: что передали и как подписать столбец. */
interface IServiceLogoIconCase {
    readonly name: string;
    readonly logos: readonly IRtServiceLogo.Item[];
}

/**
 * Матрицы `rt-service-logo` для витрины. Размер перемножен с числом знаков: шаг внахлёст и
 * размытие тени меняются вместе с кругом, и расхождение видно только на стыке. Знаки — безымянные
 * заглушки, а не логотипы компаний.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-service-logo-matrix',
    templateUrl: './test-service-logo-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtServiceLogoComponent,

        // showcase
        StoryGridComponent,
        StoryPresetsComponent,
        StoryThemesComponent,
    ],
})
export class TestRtServiceLogoMatrixComponent {
    public part: TServiceLogoMatrixPart = 'size';

    public readonly sizes: readonly IRtServiceLogo.Size[] = ['xs', 'sm', 'md', 'lg'];
    public readonly counts: readonly number[] = [1, 2, 3];
    public readonly rows: readonly (readonly IRtServiceLogo.Item[])[] = PLACEHOLDER_ROWS;

    public readonly iconCases: readonly IServiceLogoIconCase[] = [
        { name: 'один значок', logos: [PLACEHOLDER_MARK_ICON] },
        { name: 'значок поверх картинок', logos: [PLACEHOLDER_MARK_BLOCK, PLACEHOLDER_MARK_BARS, PLACEHOLDER_MARK_ICON] },
    ];

    public readonly mixedRow: readonly IRtServiceLogo.Item[] = [PLACEHOLDER_MARK_BLOCK, PLACEHOLDER_MARK_ICON];

    public readonly countLabel: (value: number) => string = (value: number): string => `знаков: ${value}`;

    public readonly iconCaseLabel: (value: IServiceLogoIconCase) => string = (value: IServiceLogoIconCase): string => value.name;
}
