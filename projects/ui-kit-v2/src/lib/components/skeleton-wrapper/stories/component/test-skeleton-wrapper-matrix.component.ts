import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtSkeletonShape } from '../../../skeleton/rt-skeleton.component';
import { RtSkeletonWrapperComponent } from '../../rt-skeleton-wrapper.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type SkeletonWrapperMatrixPart = 'loading' | 'themes';

/**
 * Матрицы `rt-skeleton-wrapper` для витрины.
 *
 * Единственная собственная ось — `isLoading`, и показывать её надо парой: подмена полная,
 * содержимое во время загрузки не спрятано, а не отрисовано вовсе. Остальные входы обёртка
 * пробрасывает в `rt-skeleton` как есть — их матрицы стоят у него, и дублировать их здесь
 * значило бы завести вторую копию, расходящуюся молча.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-skeleton-wrapper-matrix',
    template: `
        @switch (part) {
            @case ('loading') {
                <app-story-grid caption="Загрузка × фигура заглушки" [rows]="loadingStates" [columns]="shapes" [rowLabel]="loadingLabel">
                    <ng-template let-loading let-shape="col">
                        <rt-skeleton-wrapper width="140px" height="16px" size="lg" [shape]="shape" [isLoading]="loading">
                            Данные пришли
                        </rt-skeleton-wrapper>
                    </ng-template>
                </app-story-grid>
            }

            @case ('themes') {
                <app-story-themes caption="Загрузка и содержимое в обеих темах">
                    <ng-template>
                        @for (loading of loadingStates; track loading) {
                            <rt-skeleton-wrapper width="140px" height="16px" [isLoading]="loading">Данные пришли</rt-skeleton-wrapper>
                        }
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtSkeletonWrapperComponent,

        // showcase
        StoryGridComponent,
        StoryThemesComponent,
    ],
})
export class TestRtSkeletonWrapperMatrixComponent {
    public part: SkeletonWrapperMatrixPart = 'loading';

    public readonly loadingStates: readonly boolean[] = [true, false];
    public readonly shapes: readonly IRtSkeletonShape[] = ['rectangle', 'circle', 'square'];

    public readonly loadingLabel: (value: boolean) => string = (value: boolean): string => (value ? 'загрузка' : 'содержимое');
}
