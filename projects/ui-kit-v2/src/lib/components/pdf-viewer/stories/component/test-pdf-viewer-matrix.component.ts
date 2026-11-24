import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { TestRtPdfViewerCaseComponent } from './test-pdf-viewer-case.component';
import { TestRtPdfViewerComponent } from './test-pdf-viewer.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TPdfViewerMatrixPart = 'loading' | 'error' | 'presets' | 'themes';

/**
 * Матрицы состояний `rt-pdf-viewer` для витрины.
 *
 * **Ряда из ячеек здесь нет и быть не может**: просмотрщик занимает весь показ целиком —
 * 100 vw на 100 dvh, — и два экземпляра рядом наложились бы друг на друга. Поэтому каждая
 * история показывает одно состояние на весь кадр, а сравнивают их переключением между историями.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-pdf-viewer-matrix',
    templateUrl: './test-pdf-viewer-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // cases
        TestRtPdfViewerCaseComponent,
        TestRtPdfViewerComponent,

        // showcase
        StoryPresetsComponent,
        StoryThemesComponent,
    ],
})
export class TestRtPdfViewerMatrixComponent {
    public part: TPdfViewerMatrixPart = 'loading';
}
