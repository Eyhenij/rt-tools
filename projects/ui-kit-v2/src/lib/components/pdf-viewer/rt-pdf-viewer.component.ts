import { CdkTrapFocus } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    computed,
    inject,
    signal,
    viewChild,
    viewChildren,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    Injector,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

// rt-tools
import { BlockDirective, ElemDirective, WINDOW } from '@rt-tools/core';

import { rtKitLabel, RT_KIT_LABELS, TRtKitLabelMap, TRtKitLabelParams } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtDialogRef } from '@rt-tools/ui-kit-v2/dialog';
import { RT_DIALOG_DATA } from '@rt-tools/ui-kit-v2/dialog';
import { RtEmptyStateComponent } from '@rt-tools/ui-kit-v2/empty-state';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtSpinnerComponent } from '@rt-tools/ui-kit-v2/spinner';
import {
    anchoredScrollTop,
    canZoomIn,
    canZoomOut,
    fitWidthPercent,
    initialZoom,
    nextZoomStep,
    pageBoxes,
    pagesToRender,
    visiblePageIndex,
    zoomPercentLabel,
} from './rt-pdf-viewer.logic';
import { IRtPdfViewer } from './rt-pdf-viewer.model';
import { downloadPdf, preparePrintSheet } from './rt-pdf-viewer.output';
import { RT_PDF_VIEWER_CONFIG } from './rt-pdf-viewer.tokens';

const BEM_BLOCK: string = 'rt-pdf-viewer';

/** Сколько страниц сверх нарисованных держать холстами: дальше холст очищается ради памяти. */
const KEEP_OVERSCAN: number = 3;

/** Нарисованная страница: холст и масштаб, в котором он нарисован. */
interface IRenderedPage {
    readonly percent: number;
    readonly task: IRtPdfViewer.RenderTask;
}

/**
 * Полноэкранный просмотр документа PDF поверх `RtDialogService`.
 *
 * Страницы рисует `pdfjs-dist` — необязательная зависимость кита. Он грузится динамическим импортом
 * только при открытии окна, поэтому вход `@rt-tools/ui-kit-v2/pdf-viewer` не утяжеляет бандл, пока
 * окно не открыто. Рисуются только видимые страницы и их соседи, с плотностью точек экрана.
 *
 * `Esc`, блокировку прокрутки фона и затемнение даёт сам диалог; фокус после закрытия
 * просмотрщик возвращает туда, откуда его открыли.
 */
@Component({
    selector: 'rt-pdf-viewer',
    templateUrl: './rt-pdf-viewer.component.html',
    styleUrl: './rt-pdf-viewer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        CdkTrapFocus,

        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        RtButtonDirective,
        RtEmptyStateComponent,
        RtIconButtonComponent,
        RtIconComponent,
        RtSpinnerComponent,

        // transloco
    ],
    host: {
        class: BEM_BLOCK,
        role: 'dialog',
        'aria-modal': 'true',
        '[attr.aria-label]': 'fileName',
        // Клавиши слушает сам просмотрщик, поэтому фокус переводится на него сразу после открытия
        tabindex: '-1',
        '(keydown.escape)': 'close()',
        '(window:resize)': 'onResize()',
    },
})
export class RtPdfViewerComponent {
    readonly #data: IRtPdfViewer.Data = inject(RT_DIALOG_DATA) as IRtPdfViewer.Data;
    readonly #dialogRef: RtDialogRef<void> = inject(RtDialogRef<void>);
    readonly #config: IRtPdfViewer.Config = inject(RT_PDF_VIEWER_CONFIG);
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);
    readonly #document: Document = inject(DOCUMENT);
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;
    readonly #injector: Injector = inject(Injector);

    /** Откуда открыли: туда возвращается фокус после закрытия */
    readonly #opener: HTMLElement | null = this.#focusedElement();

    readonly #availableWidth: WritableSignal<number> = signal<number>(0);
    readonly #pageSizes: WritableSignal<readonly IRtPdfViewer.PageSize[]> = signal<readonly IRtPdfViewer.PageSize[]>([]);
    readonly #pageOfParams: Signal<TRtKitLabelParams> = computed((): TRtKitLabelParams => ({
        page: this.currentPage() + 1,
        total: this.#pageSizes().length,
    }));

    #loadingTask: IRtPdfViewer.LoadingTask | null = null;
    #pdf: IRtPdfViewer.PdfDocument | null = null;
    #pages: Map<number, Promise<IRtPdfViewer.PdfPage>> = new Map<number, Promise<IRtPdfViewer.PdfPage>>();
    #rendered: Map<number, IRenderedPage> = new Map<number, IRenderedPage>();
    #printSheet: IRtPdfViewer.PrintSheet | null = null;
    #destroyed: boolean = false;

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly scroller: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('scroller');
    protected readonly column: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('column');
    protected readonly pageNodes: Signal<readonly ElementRef<HTMLElement>[]> = viewChildren<ElementRef<HTMLElement>>('page');
    protected readonly canvases: Signal<readonly ElementRef<HTMLCanvasElement>[]> = viewChildren<ElementRef<HTMLCanvasElement>>('canvas');

    protected readonly fileName: string = this.#data.fileName;

    protected readonly status: WritableSignal<IRtPdfViewer.Status> = signal<IRtPdfViewer.Status>('loading');

    protected readonly printing: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly zoom: WritableSignal<IRtPdfViewer.Zoom> = signal<IRtPdfViewer.Zoom>({ kind: 'percent', percent: 100 });

    /** Масштаб на экране в процентах — и для «по ширине», который хранится режимом */
    protected readonly percent: Signal<number> = computed((): number => {
        const zoom: IRtPdfViewer.Zoom = this.zoom();

        return zoom.kind === 'fit' ? fitWidthPercent(this.#availableWidth(), this.#pageSizes()) : zoom.percent;
    });

    protected readonly isFit: Signal<boolean> = computed((): boolean => this.zoom().kind === 'fit');

    protected readonly zoomLabel: Signal<string> = computed((): string =>
        this.isFit() ? this.t().pdfViewerFitWidth : zoomPercentLabel(this.percent())
    );

    protected readonly canZoomIn: Signal<boolean> = computed((): boolean => canZoomIn(this.percent()));

    protected readonly canZoomOut: Signal<boolean> = computed((): boolean => canZoomOut(this.percent()));

    protected readonly boxes: Signal<IRtPdfViewer.PageBox[]> = computed((): IRtPdfViewer.PageBox[] =>
        pageBoxes(this.#pageSizes(), this.percent())
    );

    /** Видимая сейчас страница, с нуля */
    protected readonly currentPage: WritableSignal<number> = signal<number>(0);

    protected readonly counter: Signal<string> = computed((): string => `${this.currentPage() + 1} / ${this.#pageSizes().length}`);

    protected readonly pageOfLabel: Signal<string> = rtKitLabel('pdfViewerPageOf', this.#pageOfParams);

    constructor() {
        inject(DestroyRef).onDestroy((): void => this.#teardown());

        afterNextRender((): void => {
            this.#host.nativeElement.focus();
            void this.#open();
        });
    }

    public close(): void {
        this.#dialogRef.close();
    }

    protected zoomIn(): void {
        this.#setZoom({ kind: 'percent', percent: nextZoomStep(this.percent(), 1) });
    }

    protected zoomOut(): void {
        this.#setZoom({ kind: 'percent', percent: nextZoomStep(this.percent(), -1) });
    }

    protected fitWidth(): void {
        this.#measure();
        this.#setZoom({ kind: 'fit' });
    }

    protected onScroll(): void {
        this.#renderVisible();
    }

    protected onResize(): void {
        if (this.status() !== 'ready') {
            return;
        }
        this.#measure();
        if (this.isFit()) {
            this.#afterLayout((): void => this.#renderVisible());
        }
    }

    /** Байты уходят как пришли, а адрес — байтами документа, если он уже загружен */
    protected async download(): Promise<void> {
        const source: IRtPdfViewer.Source = this.#data.source;
        if (typeof source !== 'string') {
            downloadPdf(this.#document, this.#window, source, this.fileName);
            return;
        }
        const bytes: Uint8Array | null = this.#pdf ? await this.#pdf.getData().catch((): null => null) : null;
        downloadPdf(this.#document, this.#window, bytes ?? source, this.fileName);
    }

    /**
     * Печать документа целиком, без полосы и плашки: страницы рисуются картинками в отдельный лист,
     * и на время печати страница прячет всё, кроме него. Лист убирается после печати.
     */
    protected async print(): Promise<void> {
        const pdf: IRtPdfViewer.PdfDocument | null = this.#pdf;
        if (!pdf || this.printing()) {
            return;
        }
        this.printing.set(true);
        try {
            this.#printSheet?.dispose();
            const sheet: IRtPdfViewer.PrintSheet = await preparePrintSheet(pdf, this.#document, this.#window);
            if (this.#destroyed) {
                sheet.dispose();
                return;
            }
            this.#printSheet = sheet;
            this.#window.addEventListener(
                'afterprint',
                (): void => {
                    sheet.dispose();
                    if (this.#printSheet === sheet) {
                        this.#printSheet = null;
                    }
                },
                { once: true }
            );
            this.#window.print();
        } catch {
            this.#printSheet?.dispose();
            this.#printSheet = null;
        } finally {
            this.printing.set(false);
        }
    }

    async #open(): Promise<void> {
        try {
            const pdfjs: IRtPdfViewer.PdfJs = await this.#config.load();
            if (this.#destroyed) {
                return;
            }
            pdfjs.GlobalWorkerOptions.workerSrc = this.#config.workerSrc;
            this.#loadingTask = pdfjs.getDocument(this.#documentParams());
            const pdf: IRtPdfViewer.PdfDocument = await this.#loadingTask.promise;
            if (this.#destroyed) {
                return;
            }
            this.#pdf = pdf;

            // Размеры всех страниц нужны сразу: без них нет высоты столбца, и прокрутка прыгала бы
            // по мере того, как страницы рисуются
            const sizes: IRtPdfViewer.PageSize[] = await Promise.all(
                Array.from({ length: pdf.numPages }, async (_: unknown, index: number): Promise<IRtPdfViewer.PageSize> => {
                    const viewport: IRtPdfViewer.Viewport = (await this.#page(index)).getViewport({ scale: 1 });
                    return { width: viewport.width, height: viewport.height };
                })
            );
            if (this.#destroyed) {
                return;
            }
            // Масштаб выбирается до показа страниц: иначе на телефоне на кадр мелькал бы обрезанный
            // лист в 100%, и только потом — «по ширине»
            this.#measure();
            this.zoom.set(initialZoom(this.#host.nativeElement.clientWidth, this.#availableWidth(), sizes));
            this.#pageSizes.set(sizes);
            this.status.set('ready');
            this.#afterLayout((): void => this.#renderVisible());
        } catch {
            if (!this.#destroyed) {
                this.status.set('error');
            }
        }
    }

    #documentParams(): IRtPdfViewer.DocumentParams {
        const source: IRtPdfViewer.Source = this.#data.source;
        const data: Pick<IRtPdfViewer.DocumentParams, 'url' | 'data'> =
            typeof source === 'string'
                ? { url: source }
                : // Рисовальщик забирает буфер себе в поток — отдаётся копия, оригинал нужен для скачивания
                  { data: source instanceof ArrayBuffer ? new Uint8Array(source.slice(0)) : source.slice() };

        return {
            ...data,
            ...(this.#config.cMapUrl ? { cMapUrl: this.#config.cMapUrl, cMapPacked: true } : {}),
            ...(this.#config.standardFontDataUrl ? { standardFontDataUrl: this.#config.standardFontDataUrl } : {}),
            ...(this.#config.wasmUrl ? { wasmUrl: this.#config.wasmUrl } : {}),
        };
    }

    #page(index: number): Promise<IRtPdfViewer.PdfPage> {
        const pdf: IRtPdfViewer.PdfDocument | null = this.#pdf;
        if (!pdf) {
            return Promise.reject(new Error('document is not loaded'));
        }
        let page: Promise<IRtPdfViewer.PdfPage> | undefined = this.#pages.get(index);
        if (!page) {
            page = pdf.getPage(index + 1);
            this.#pages.set(index, page);
        }

        return page;
    }

    /**
     * Место, в которое страница встаёт «по ширине»: ширина окна прокрутки без полей столбца. Сам
     * столбец не меряется — увеличенная страница растягивает его шире окна.
     */
    #measure(): void {
        const scroller: HTMLElement | undefined = this.scroller()?.nativeElement;
        const column: HTMLElement | undefined = this.column()?.nativeElement;
        if (!scroller || !column) {
            return;
        }
        const style: CSSStyleDeclaration = this.#window.getComputedStyle(column);
        const padding: number = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
        this.#availableWidth.set(Math.max(0, scroller.clientWidth - padding));
    }

    /**
     * Смена масштаба держит на экране то же место той же страницы: после перестройки столбца
     * прокрутка ставится от новой высоты страницы, а не остаётся на прежнем числе пикселей.
     */
    #setZoom(zoom: IRtPdfViewer.Zoom): void {
        const scroller: HTMLElement | undefined = this.scroller()?.nativeElement;
        const current: number = this.currentPage();
        const node: HTMLElement | undefined = this.pageNodes()[current]?.nativeElement;
        const before: { top: number; height: number; scrollTop: number } | null =
            scroller && node ? { top: node.offsetTop, height: node.offsetHeight, scrollTop: scroller.scrollTop } : null;

        this.zoom.set(zoom);
        this.#afterLayout((): void => {
            const after: HTMLElement | undefined = this.pageNodes()[current]?.nativeElement;
            if (scroller && after && before) {
                scroller.scrollTop = anchoredScrollTop(before.top, before.height, before.scrollTop, after.offsetTop, after.offsetHeight);
            }
            this.#renderVisible();
        });
    }

    #afterLayout(callback: () => void): void {
        afterNextRender(callback, { injector: this.#injector });
    }

    /** Счётчик догоняет прокрутку, а видимые страницы и их соседи дорисовываются */
    #renderVisible(): void {
        const scroller: HTMLElement | undefined = this.scroller()?.nativeElement;
        const nodes: readonly ElementRef<HTMLElement>[] = this.pageNodes();
        if (!scroller || nodes.length === 0 || this.#destroyed) {
            return;
        }
        const tops: number[] = nodes.map((node: ElementRef<HTMLElement>): number => node.nativeElement.offsetTop);
        const heights: number[] = nodes.map((node: ElementRef<HTMLElement>): number => node.nativeElement.offsetHeight);
        const { scrollTop, clientHeight } = scroller;

        this.currentPage.set(visiblePageIndex(tops, heights, scrollTop, clientHeight));

        const keep: Set<number> = new Set<number>(pagesToRender(tops, heights, scrollTop, clientHeight, KEEP_OVERSCAN));
        for (const index of [...this.#rendered.keys()]) {
            if (!keep.has(index)) {
                this.#clearPage(index);
            }
        }
        for (const index of pagesToRender(tops, heights, scrollTop, clientHeight)) {
            void this.#renderPage(index);
        }
    }

    async #renderPage(index: number): Promise<void> {
        const percent: number = this.percent();
        const existing: IRenderedPage | undefined = this.#rendered.get(index);
        if (existing?.percent === percent) {
            return;
        }
        existing?.task.cancel();
        this.#rendered.delete(index);

        const canvas: HTMLCanvasElement | undefined = this.canvases()[index]?.nativeElement;
        const box: IRtPdfViewer.PageBox | undefined = this.boxes()[index];
        if (!canvas || !box) {
            return;
        }
        try {
            const page: IRtPdfViewer.PdfPage = await this.#page(index);
            if (this.#destroyed || this.percent() !== percent || this.#rendered.has(index)) {
                return;
            }
            // Холст в точках экрана, а не в CSS-пикселях: иначе на плотном экране текст мылится
            const ratio: number = this.#window.devicePixelRatio || 1;
            const viewport: IRtPdfViewer.Viewport = page.getViewport({ scale: (box.width / page.getViewport({ scale: 1 }).width) * ratio });
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const task: IRtPdfViewer.RenderTask = page.render({ canvas, viewport });
            this.#rendered.set(index, { percent, task });
            await task.promise;
        } catch {
            // Отменённая отрисовка — обычное дело при прокрутке; страница дорисуется при подходе
            if (this.#rendered.get(index)?.percent === percent) {
                this.#rendered.delete(index);
            }
        }
    }

    #clearPage(index: number): void {
        this.#rendered.get(index)?.task.cancel();
        this.#rendered.delete(index);
        const canvas: HTMLCanvasElement | undefined = this.canvases()[index]?.nativeElement;
        if (canvas) {
            canvas.width = 0;
            canvas.height = 0;
        }
    }

    #teardown(): void {
        this.#destroyed = true;
        for (const rendered of this.#rendered.values()) {
            rendered.task.cancel();
        }
        this.#rendered.clear();
        this.#printSheet?.dispose();
        this.#printSheet = null;
        void this.#loadingTask?.destroy().catch((): void => undefined);
        this.#pdf = null;
        if (this.#opener?.isConnected) {
            this.#opener.focus();
        }
    }

    #focusedElement(): HTMLElement | null {
        const active: Element | null = this.#document.activeElement;

        return active instanceof HTMLElement && active !== this.#document.body ? active : null;
    }
}
