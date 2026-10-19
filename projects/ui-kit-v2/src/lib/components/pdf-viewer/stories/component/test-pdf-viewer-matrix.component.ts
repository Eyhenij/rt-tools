import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtDialogRef } from '../../../dialog/rt-dialog-ref';
import { RT_DIALOG_DATA } from '../../../dialog/rt-dialog.tokens';
import { IRtPdfViewer } from '../../rt-pdf-viewer.model';
import { RtPdfViewerComponent } from '../../rt-pdf-viewer.component';
import { provideRtPdfViewer } from '../../rt-pdf-viewer.tokens';
import { STORY_DIALOG_REF, STORY_DOCUMENT, TestRtPdfViewerComponent } from './test-pdf-viewer.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TPdfViewerMatrixPart = 'loading' | 'error' | 'presets' | 'themes';

/** Рисовальщик, который не загружается никогда: индикатор стоит, сколько смотрят. */
function neverLoads(): Promise<IRtPdfViewer.PdfJs> {
    return new Promise<IRtPdfViewer.PdfJs>((): void => undefined);
}

/** Рисовальщик, который отказывает сразу, — так же выглядит и нечитаемый документ. */
function failsToLoad(): Promise<IRtPdfViewer.PdfJs> {
    return Promise.reject(new Error('the showcase refuses the document on purpose'));
}

/** Документ грузится: полоса с именем уже видна, на месте страниц — индикатор. */
@Component({
    selector: 'app-pdf-viewer-loading',
    templateUrl: './test-pdf-viewer-case.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPdfViewerComponent],
    providers: [
        { provide: RtDialogRef, useValue: STORY_DIALOG_REF },
        { provide: RT_DIALOG_DATA, useValue: STORY_DOCUMENT },
        provideRtPdfViewer({ load: neverLoads }),
    ],
})
class PdfViewerLoadingComponent {}

/** Документ не удалось показать: заголовок, пояснение и белая кнопка скачивания. */
@Component({
    selector: 'app-pdf-viewer-error',
    templateUrl: './test-pdf-viewer-case.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPdfViewerComponent],
    providers: [
        { provide: RtDialogRef, useValue: STORY_DIALOG_REF },
        { provide: RT_DIALOG_DATA, useValue: STORY_DOCUMENT },
        provideRtPdfViewer({ load: failsToLoad }),
    ],
})
class PdfViewerErrorComponent {}

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
        PdfViewerErrorComponent,
        PdfViewerLoadingComponent,
        TestRtPdfViewerComponent,

        // showcase
        StoryPresetsComponent,
        StoryThemesComponent,
    ],
})
export class TestRtPdfViewerMatrixComponent {
    public part: TPdfViewerMatrixPart = 'loading';
}
