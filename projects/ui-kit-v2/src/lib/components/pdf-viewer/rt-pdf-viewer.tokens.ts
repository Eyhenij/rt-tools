import { InjectionToken, Provider } from '@angular/core';

import { IRtPdfViewer } from './rt-pdf-viewer.model';

/**
 * Адрес воркера по умолчанию. Относительный: считается от `<base href>`, поэтому приложение под
 * своим префиксом не правит его руками. Файл туда кладёт сборка приложения — см. обзор компонента.
 */
export const RT_PDF_VIEWER_WORKER_SRC: string = 'assets/pdfjs/pdf.worker.min.mjs';

/**
 * Рисовальщик грузится только при открытии окна. Статический импорт положил бы `pdfjs-dist` в
 * бандл каждому, кто импортировал вход, даже если окно так и не открылось.
 */
function loadPdfJs(): Promise<IRtPdfViewer.PdfJs> {
    return import('pdfjs-dist');
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
