import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtSkeletonRadius, IRtSkeletonShape, IRtSkeletonSize, RtSkeletonComponent } from '../../rt-skeleton.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type SkeletonMatrixPart = 'shape' | 'radius' | 'animation' | 'themes';

/**
 * Матрицы `rt-skeleton` для витрины.
 *
 * Перемножены две пары, и обе — по делу. Фигура с размером: круг и квадрат берут из размера
 * сторону, а прямоугольник его игнорирует, и одной строкой это не показать. Фигура со
 * скруглением: `null` значит «по фигуре», и у прямоугольника с квадратом это разные значения.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-skeleton-matrix',
    template: `
        @switch (part) {
            @case ('shape') {
                <app-story-grid caption="Фигура × размер" [rows]="shapes" [columns]="sizes">
                    <ng-template let-shape let-size="col">
                        <rt-skeleton width="120px" [shape]="shape" [size]="size" />
                    </ng-template>
                </app-story-grid>
            }

            @case ('radius') {
                <app-story-grid caption="Фигура × скругление" [rows]="shapes" [columns]="radii" [columnLabel]="radiusLabel">
                    <ng-template let-shape let-radius="col">
                        <rt-skeleton width="120px" height="24px" size="lg" [shape]="shape" [borderRadius]="radius" />
                    </ng-template>
                </app-story-grid>
            }

            @case ('animation') {
                <app-story-row caption="Мерцание" [items]="animations" [itemLabel]="animationLabel">
                    <ng-template let-value>
                        <rt-skeleton width="160px" height="16px" [animation]="value" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Фигуры в обеих темах">
                    <ng-template>
                        @for (shape of shapes; track shape) {
                            <rt-skeleton width="160px" height="24px" size="lg" [shape]="shape" />
                        }
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtSkeletonComponent,

        // showcase
        StoryGridComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtSkeletonMatrixComponent {
    public part: SkeletonMatrixPart = 'shape';

    public readonly shapes: readonly IRtSkeletonShape[] = ['rectangle', 'circle', 'square'];
    public readonly sizes: readonly IRtSkeletonSize[] = ['sm', 'md', 'lg'];

    /** `null` — не отсутствие значения, а «по фигуре»: у него своя ячейка. */
    public readonly radii: readonly (IRtSkeletonRadius | null)[] = [null, 'xs', 'sm', 'md', 'lg', 'xl'];

    public readonly animations: readonly boolean[] = [true, false];

    public readonly radiusLabel: (value: IRtSkeletonRadius | null) => string = (value: IRtSkeletonRadius | null): string =>
        value === null ? 'по фигуре' : value;

    public readonly animationLabel: (value: boolean) => string = (value: boolean): string => (value ? 'включено' : 'выключено');
}
