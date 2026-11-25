import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { TestRtPhotoViewerCaseComponent } from './test-photo-viewer-case.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TPhotoViewerMatrixPart = 'start' | 'single' | 'presets' | 'themes';

/**
 * Матрицы состояний `rt-photo-viewer` для витрины.
 *
 * **Ряда из ячеек здесь нет и быть не может**: просмотрщик занимает весь показ целиком —
 * 100 vw на 100 dvh, — и два экземпляра рядом наложились бы друг на друга. Поэтому каждая
 * история показывает один случай на весь кадр, а сравнивают их переключением между историями.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-photo-viewer-matrix',
    template: `
        @switch (part) {
            @case ('start') {
                <app-photo-viewer-case kind="last" />
            }

            @case ('single') {
                <app-photo-viewer-case kind="single" />
            }

            @case ('presets') {
                <app-story-presets caption="Просмотрщик в обоих наборах">
                    <ng-template>
                        <div style="position: relative; width: 22rem; height: 16rem; overflow: hidden">
                            <app-photo-viewer-case kind="first" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Просмотрщик в обеих темах">
                    <ng-template>
                        <div style="position: relative; width: 22rem; height: 16rem; overflow: hidden">
                            <app-photo-viewer-case kind="first" />
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // cases
        TestRtPhotoViewerCaseComponent,

        // showcase
        StoryPresetsComponent,
        StoryThemesComponent,
    ],
})
export class TestRtPhotoViewerMatrixComponent {
    public part: TPhotoViewerMatrixPart = 'start';
}
