import { InjectionToken, Provider } from '@angular/core';

import type { PageViewport, PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

import { IRtPdfViewer } from './rt-pdf-viewer.model';

/**
 * Адрес воркера по умолчанию. Относительный: считается от `<base href>`, поэтому приложение под
 * своим префиксом не правит его руками. Файл туда кладёт сборка приложения — см. обзор компонента.
 */
export const RT_PDF_VIEWER_WORKER_SRC: string = 'assets/pdfjs/pdf.worker.min.mjs';

/**
 * Свои типы просмотрщика уже типов `pdfjs-dist`: у пакета `render` принимает полный `PageViewport`
 * и узкий список видов вывода. Переходник сужает пакет до описанного кита, а не наоборот.
 */
function toPage(page: PDFPageProxy): IRtPdfViewer.PdfPage {
    return {
        getViewport: (params: { scale: number }): IRtPdfViewer.Viewport => page.getViewport(params),
        render: (params: IRtPdfViewer.RenderParams): IRtPdfViewer.RenderTask =>
            page.render({
                canvas: params.canvas,
                viewport: params.viewport as PageViewport,
                intent: params.intent === 'print' ? 'print' : 'display',
            }),
    };
}

function toDocument(doc: PDFDocumentProxy): IRtPdfViewer.PdfDocument {
    return {
        numPages: doc.numPages,
        getPage: (pageNumber: number): Promise<IRtPdfViewer.PdfPage> => doc.getPage(pageNumber).then(toPage),
        getData: (): Promise<Uint8Array> => doc.getData(),
    };
}

/**
 * Рисовальщик грузится только при открытии окна. Статический импорт положил бы `pdfjs-dist` в
 * бандл каждому, кто импортировал вход, даже если окно так и не открылось.
 */
async function loadPdfJs(): Promise<IRtPdfViewer.PdfJs> {
    const lib: typeof import('pdfjs-dist') = await import('pdfjs-dist');

    return {
        GlobalWorkerOptions: lib.GlobalWorkerOptions,
        getDocument: (params: IRtPdfViewer.DocumentParams): IRtPdfViewer.LoadingTask => {
            const task: PDFDocumentLoadingTask = lib.getDocument(params);

            return { promise: task.promise.then(toDocument), destroy: (): Promise<void> => task.destroy() };
        },
    };
}

/** Настройки рисовальщика просмотрщика. Без провайдера — умолчания выше. */
export const RT_PDF_VIEWER_CONFIG: InjectionToken<IRtPdfViewer.Config> = new InjectionToken<IRtPdfViewer.Config>('RT_PDF_VIEWER_CONFIG', {
    providedIn: 'root',
    factory: (): IRtPdfViewer.Config => ({ workerSrc: RT_PDF_VIEWER_WORKER_SRC, load: loadPdfJs }),
});

/**
 * Настраивает просмотрщик: адрес воркера и каталоги данных `pdfjs-dist`. Незаданное берётся из
 * умолчаний.
 *
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *     providers: [provideRtPdfViewer({ workerSrc: 'static/pdf.worker.min.mjs' })],
 * };
 * ```
 */
export function provideRtPdfViewer(config: Partial<IRtPdfViewer.Config>): Provider {
    return {
        provide: RT_PDF_VIEWER_CONFIG,
        useValue: { workerSrc: RT_PDF_VIEWER_WORKER_SRC, load: loadPdfJs, ...config } satisfies IRtPdfViewer.Config,
    };
}
