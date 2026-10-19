/**
 * Контракты полноэкранного просмотрщика документа PDF. Один корневой неймспейс с префиксом `I`.
 */
export namespace IRtPdfViewer {
    /**
     * Откуда взять документ: байты или адрес. Байты просмотрщик не отдаёт рисовальщику как есть —
     * тот забирает буфер себе в поток, и скачать файл после этого было бы нечем. Отдаётся копия.
     */
    export type Source = Uint8Array | ArrayBuffer | string;

    /**
     * Данные открытия: документ и имя файла.
     *
     * Имя показывается в полосе сверху и становится именем скачанного файла: адрес документа
     * часто бывает подписанной ссылкой, и имени в нём нет.
     */
    export interface Data {
        readonly source: Source;
        readonly fileName: string;
    }

    /** Что сейчас на месте страниц: индикатор, сами страницы или отказ. */
    export type Status = 'loading' | 'ready' | 'error';

    /**
     * Масштаб. «По ширине» хранится как режим, а не как число: окно меняет ширину, и страница
     * обязана подстроиться под новую, а не остаться на числе, посчитанном для прежней.
     */
    export type Zoom = { readonly kind: 'fit' } | { readonly kind: 'percent'; readonly percent: number };

    /** Размер страницы в пунктах документа — в единицах, в которых его пишет сам PDF. */
    export interface PageSize {
        readonly width: number;
        readonly height: number;
    }

    /** Размер места под страницу на экране, в CSS-пикселях. */
    export interface PageBox {
        readonly index: number;
        readonly width: number;
        readonly height: number;
    }

    /**
     * Настройки рисовальщика. Даёт их приложение через `provideRtPdfViewer()`: только оно знает,
     * куда при сборке положен файл воркера.
     */
    export interface Config {
        /**
         * Адрес файла воркера `pdf.worker.min.mjs`. Относительный адрес считается от `<base href>`
         * страницы. Версия воркера обязана совпадать с версией `pdfjs-dist`, поэтому файл копируется
         * из того же `node_modules`, а не берётся с чужого адреса.
         */
        readonly workerSrc: string;

        /** Как загрузить рисовальщик. Умолчание — динамический `import('pdfjs-dist')`. */
        readonly load: () => Promise<PdfJs>;

        /** Каталог `cmaps/` пакета — нужен документам с азиатскими шрифтами без вложенных карт. */
        readonly cMapUrl?: string;

        /** Каталог `standard_fonts/` пакета — нужен документам на стандартных шрифтах без вложения. */
        readonly standardFontDataUrl?: string;

        /** Каталог `wasm/` пакета — нужен документам со снимками в JPEG 2000. */
        readonly wasmUrl?: string;
    }

    /**
     * Та часть `pdfjs-dist`, которой пользуется просмотрщик. Описана своими типами, а не взята из
     * пакета: тогда типы кита не требуют пакета у того, кто просмотрщик не ставит, а в тесте
     * рисовальщик подменяется объектом из нескольких функций.
     */
    export interface PdfJs {
        readonly GlobalWorkerOptions: { workerSrc: string };
        getDocument(params: DocumentParams): LoadingTask;
    }

    export interface DocumentParams {
        readonly url?: string;
        readonly data?: Uint8Array;
        readonly cMapUrl?: string;
        readonly cMapPacked?: boolean;
        readonly standardFontDataUrl?: string;
        readonly wasmUrl?: string;
    }

    export interface LoadingTask {
        readonly promise: Promise<PdfDocument>;
        destroy(): Promise<void>;
    }

    export interface PdfDocument {
        readonly numPages: number;
        getPage(pageNumber: number): Promise<PdfPage>;
        getData(): Promise<Uint8Array>;
    }

    export interface PdfPage {
        getViewport(params: { scale: number }): Viewport;
        render(params: RenderParams): RenderTask;
    }

    export interface Viewport {
        readonly width: number;
        readonly height: number;
    }

    export interface RenderParams {
        readonly canvas: HTMLCanvasElement;
        readonly viewport: Viewport;
        readonly intent?: string;
    }

    export interface RenderTask {
        readonly promise: Promise<void>;
        cancel(): void;
    }

    /** Печатный лист: разметка страниц картинками и уборка за ней. */
    export interface PrintSheet {
        dispose(): void;
    }
}
