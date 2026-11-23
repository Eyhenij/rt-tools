import { NgComponentOutlet } from '@angular/common';
import { inject, ChangeDetectionStrategy, Component, Injector, InputSignal, Signal, Type, computed, input } from '@angular/core';

import { RtDialogRef } from '../../../dialog/rt-dialog-ref';
import { RT_DIALOG_DATA } from '../../../dialog/rt-dialog.tokens';
import { IRtPdfViewer } from '../../rt-pdf-viewer.model';
import { RtPdfViewerComponent } from '../../rt-pdf-viewer.component';
import { provideRtPdfViewer } from '../../rt-pdf-viewer.tokens';
import { STORY_DIALOG_REF, STORY_DOCUMENT } from './test-pdf-viewer.component';

/** Состояние просмотрщика в ячейке матрицы. */
export type TPdfViewerCase = 'loading' | 'error';

/** Рисовальщик, который не загружается никогда: индикатор стоит, сколько смотрят. */
function neverLoads(): Promise<IRtPdfViewer.PdfJs> {
    return new Promise<IRtPdfViewer.PdfJs>((): void => undefined);
}

/** Рисовальщик, который отказывает сразу, — так же выглядит и нечитаемый документ. */
function failsToLoad(): Promise<IRtPdfViewer.PdfJs> {
    return Promise.reject(new Error('the showcase refuses the document on purpose'));
}

/** Как загружается документ в каждом состоянии. */
const LOADERS: Record<TPdfViewerCase, () => Promise<IRtPdfViewer.PdfJs>> = {
    loading: neverLoads,
    error: failsToLoad,
};

/**
 * Одна ячейка матрицы `rt-pdf-viewer`: просмотрщик со своими данными окна и своим рисовальщиком.
 *
 * Данные приходят внедрением, поэтому у каждой ячейки свой инжектор, собранный по входу.
 * Документ грузится — полоса с именем уже видна, на месте страниц индикатор; документ не удалось
 * показать — заголовок, пояснение и белая кнопка скачивания.
 */
@Component({
    selector: 'app-pdf-viewer-case',
    templateUrl: './test-pdf-viewer-case.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgComponentOutlet],
})
export class TestRtPdfViewerCaseComponent {
    readonly #parent: Injector = inject(Injector);

    protected readonly viewer: Type<RtPdfViewerComponent> = RtPdfViewerComponent;

    protected readonly injector: Signal<Injector> = computed((): Injector =>
        Injector.create({
            parent: this.#parent,
            providers: [
                { provide: RtDialogRef, useValue: STORY_DIALOG_REF },
                { provide: RT_DIALOG_DATA, useValue: STORY_DOCUMENT },
                provideRtPdfViewer({ load: LOADERS[this.kind()] }),
            ],
        })
    );

    public readonly kind: InputSignal<TPdfViewerCase> = input.required<TPdfViewerCase>();
}
