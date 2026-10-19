import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { firstValueFrom } from 'rxjs';

import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { RtDialogRef } from '../dialog/rt-dialog-ref';
import { RtDialogService } from '../dialog/rt-dialog.service';
import { IRtPdfViewer } from './rt-pdf-viewer.model';
import { RtPdfViewerComponent } from './rt-pdf-viewer.component';
import { provideRtPdfViewer } from './rt-pdf-viewer.tokens';

/** Подмена рисовальщика: документ из трёх листов A4, рисование ничего не трогает. */
interface IFakePdfJs extends IRtPdfViewer.PdfJs {
    readonly params: IRtPdfViewer.DocumentParams[];
}

function fakePage(): IRtPdfViewer.PdfPage {
    return {
        getViewport: ({ scale }: { scale: number }): IRtPdfViewer.Viewport => ({ width: 595 * scale, height: 842 * scale }),
        render: (): IRtPdfViewer.RenderTask => ({ promise: Promise.resolve(), cancel: (): void => undefined }),
    };
}

function fakePdfJs(fail: boolean = false): IFakePdfJs {
    const params: IRtPdfViewer.DocumentParams[] = [];
    const pdf: IRtPdfViewer.PdfDocument = {
        numPages: 3,
        getPage: (): Promise<IRtPdfViewer.PdfPage> => Promise.resolve(fakePage()),
        getData: (): Promise<Uint8Array> => Promise.resolve(new Uint8Array([1, 2, 3])),
    };

    return {
        params,
        GlobalWorkerOptions: { workerSrc: '' },
        getDocument: (documentParams: IRtPdfViewer.DocumentParams): IRtPdfViewer.LoadingTask => {
            params.push(documentParams);
            return {
                promise: fail ? Promise.reject(new Error('broken document')) : Promise.resolve(pdf),
                destroy: (): Promise<void> => Promise.resolve(),
            };
        },
    };
}

const BYTES: Uint8Array = new Uint8Array([37, 80, 68, 70]);

function open(load: () => Promise<IRtPdfViewer.PdfJs>, data: Partial<IRtPdfViewer.Data> = {}): RtDialogRef<void> {
    TestBed.configureTestingModule({
        providers: [...provideRtKitTesting(), provideRtPdfViewer({ workerSrc: 'static/pdf.worker.min.mjs', load })],
    });
    const ref: RtDialogRef<void> = TestBed.inject(RtDialogService).open<RtPdfViewerComponent, IRtPdfViewer.Data, void>(
        RtPdfViewerComponent,
        {
            data: { source: BYTES, fileName: 'Договор аренды.pdf', ...data },
        }
    );
    TestBed.inject(ApplicationRef).tick();
    return ref;
}

/** Загрузка идёт обещаниями: даём им отработать и перерисовываем окно. */
async function settle(): Promise<void> {
    for (let round: number = 0; round < 5; round++) {
        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, 0);
        });
        TestBed.inject(ApplicationRef).tick();
    }
}

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

function text(id: string): string {
    return (node(id)?.textContent ?? '').trim();
}

function control(id: string): HTMLButtonElement {
    return document.querySelector(`[qa-dataid="${id}"] [qa-dataid="icon-button-control"]`) as HTMLButtonElement;
}

async function press(id: string): Promise<void> {
    control(id).click();
    await settle();
}

describe('RtPdfViewerComponent', (): void => {
    let clickSpy: jest.SpyInstance;

    beforeEach((): void => {
        // jsdom не умеет ни ссылок на Blob, ни перехода по ссылке: щелчок ловится, а не исполняется
        Object.defineProperty(URL, 'createObjectURL', { configurable: true, writable: true, value: (): string => 'blob:pdf' });
        Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, writable: true, value: (): void => undefined });
        clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation((): void => undefined);
    });

    afterEach((): void => {
        clickSpy.mockRestore();
    });

    it('объявлен модальным окном, подписанным именем файла', (): void => {
        open((): Promise<IRtPdfViewer.PdfJs> => new Promise<IRtPdfViewer.PdfJs>((): void => undefined));

        const viewer: HTMLElement | null = document.querySelector('rt-pdf-viewer');
        expect(viewer?.getAttribute('role')).toBe('dialog');
        expect(viewer?.getAttribute('aria-modal')).toBe('true');
        expect(viewer?.getAttribute('aria-label')).toBe('Договор аренды.pdf');
    });

    describe('загрузка', (): void => {
        it('полоса с именем файла видна сразу, а на месте страниц — индикатор', (): void => {
            open((): Promise<IRtPdfViewer.PdfJs> => new Promise<IRtPdfViewer.PdfJs>((): void => undefined));

            expect(text('pdf-viewer-file-name')).toBe('Договор аренды.pdf');
            expect(node('pdf-viewer-spinner')).not.toBeNull();
            expect(node('pdf-viewer-toolbar')).toBeNull();
        });

        it('пока документ не загружен, печатать нечего, а скачать уже можно', (): void => {
            open((): Promise<IRtPdfViewer.PdfJs> => new Promise<IRtPdfViewer.PdfJs>((): void => undefined));

            expect(control('pdf-viewer-print').disabled).toBe(true);
            expect(control('pdf-viewer-download').disabled).toBe(false);
        });

        it('после загрузки рисует места под все страницы и счётчик', async (): Promise<void> => {
            const pdfjs: IFakePdfJs = fakePdfJs();
            open((): Promise<IRtPdfViewer.PdfJs> => Promise.resolve(pdfjs));
            await settle();

            expect(node('pdf-viewer-spinner')).toBeNull();
            expect(document.querySelectorAll('[qa-dataid="pdf-viewer-page"]').length).toBe(3);
            expect(text('pdf-viewer-counter')).toBe('1 / 3');
            expect(node('pdf-viewer-counter')?.getAttribute('aria-label')).toBe('Page 1 of 3');
        });

        it('воркер берётся по адресу из настроек', async (): Promise<void> => {
            const pdfjs: IFakePdfJs = fakePdfJs();
            open((): Promise<IRtPdfViewer.PdfJs> => Promise.resolve(pdfjs));
            await settle();

            expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe('static/pdf.worker.min.mjs');
        });

        it('байты уходят рисовальщику копией — оригинал остаётся для скачивания', async (): Promise<void> => {
            const pdfjs: IFakePdfJs = fakePdfJs();
            open((): Promise<IRtPdfViewer.PdfJs> => Promise.resolve(pdfjs));
            await settle();

            expect(pdfjs.params[0].data).not.toBe(BYTES);
            expect(Array.from(pdfjs.params[0].data ?? [])).toEqual(Array.from(BYTES));
        });

        it('адрес уходит рисовальщику адресом', async (): Promise<void> => {
            const pdfjs: IFakePdfJs = fakePdfJs();
            open((): Promise<IRtPdfViewer.PdfJs> => Promise.resolve(pdfjs), { source: '/files/contract.pdf' });
            await settle();

            expect(pdfjs.params[0]).toEqual({ url: '/files/contract.pdf' });
        });
    });

    describe('отказ', (): void => {
        it('нечитаемый документ показывает отказ с кнопкой скачивания', async (): Promise<void> => {
            open((): Promise<IRtPdfViewer.PdfJs> => Promise.resolve(fakePdfJs(true)));
            await settle();

            expect(node('pdf-viewer-error')?.textContent).toContain("Couldn't show the document");
            expect(node('pdf-viewer-error')?.textContent).toContain('You can download the file and open it on your computer.');
            expect(node('pdf-viewer-error-download')).not.toBeNull();
            expect(node('pdf-viewer-toolbar')).toBeNull();
        });

        it('рисовальщик, который не загрузился, — тот же отказ', async (): Promise<void> => {
            open((): Promise<IRtPdfViewer.PdfJs> => Promise.reject(new Error('no pdfjs-dist')));
            await settle();

            expect(node('pdf-viewer-error')).not.toBeNull();
        });

        it('кнопка отказа сохраняет файл под его именем', async (): Promise<void> => {
            open((): Promise<IRtPdfViewer.PdfJs> => Promise.resolve(fakePdfJs(true)));
            await settle();

            node('pdf-viewer-error-download')?.click();
            await settle();

            const anchor: HTMLAnchorElement = clickSpy.mock.contexts[0] as HTMLAnchorElement;
            expect(anchor.download).toBe('Договор аренды.pdf');
            expect(anchor.href).toBe('blob:pdf');
        });
    });

    describe('масштаб', (): void => {
        it('узкое окно открывается «по ширине»', async (): Promise<void> => {
            // jsdom не раскладывает разметку: ширина окна у него нулевая, то есть узкая
            open((): Promise<IRtPdfViewer.PdfJs> => Promise.resolve(fakePdfJs()));
            await settle();

            expect(text('pdf-viewer-zoom')).toBe('Fit to width');
        });

        it('«+» и «−» ходят по ступеням, а на нижней границе «−» выключен', async (): Promise<void> => {
            open((): Promise<IRtPdfViewer.PdfJs> => Promise.resolve(fakePdfJs()));
            await settle();

            await press('pdf-viewer-zoom-in');
            expect(text('pdf-viewer-zoom')).toBe('125%');

            await press('pdf-viewer-zoom-out');
            await press('pdf-viewer-zoom-out');
            await press('pdf-viewer-zoom-out');
            expect(text('pdf-viewer-zoom')).toBe('50%');
            expect(control('pdf-viewer-zoom-out').disabled).toBe(true);
        });

        it('на верхней границе выключен «+»', async (): Promise<void> => {
            open((): Promise<IRtPdfViewer.PdfJs> => Promise.resolve(fakePdfJs()));
            await settle();

            for (let step: number = 0; step < 6; step++) {
                await press('pdf-viewer-zoom-in');
            }

            expect(text('pdf-viewer-zoom')).toBe('300%');
            expect(control('pdf-viewer-zoom-in').disabled).toBe(true);
        });

        it('кнопка «По ширине» возвращает режим', async (): Promise<void> => {
            open((): Promise<IRtPdfViewer.PdfJs> => Promise.resolve(fakePdfJs()));
            await settle();
            await press('pdf-viewer-zoom-in');

            node('pdf-viewer-fit')?.click();
            await settle();

            expect(text('pdf-viewer-zoom')).toBe('Fit to width');
        });
    });

    describe('закрытие', (): void => {
        it('крестик закрывает окно', async (): Promise<void> => {
            const ref: RtDialogRef<void> = open((): Promise<IRtPdfViewer.PdfJs> => Promise.resolve(fakePdfJs()));
            const closed: Promise<void | undefined> = firstValueFrom(ref.afterClosed());

            await press('pdf-viewer-close');

            await expect(closed).resolves.toBeUndefined();
            expect(document.querySelector('rt-pdf-viewer')).toBeNull();
        });

        it('Escape закрывает так же', async (): Promise<void> => {
            const ref: RtDialogRef<void> = open((): Promise<IRtPdfViewer.PdfJs> => Promise.resolve(fakePdfJs()));
            const closed: Promise<void | undefined> = firstValueFrom(ref.afterClosed());

            document.querySelector('rt-pdf-viewer')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

            await expect(closed).resolves.toBeUndefined();
        });

        it('фокус возвращается туда, откуда окно открыли', async (): Promise<void> => {
            const opener: HTMLButtonElement = document.createElement('button');
            document.body.append(opener);
            opener.focus();

            const ref: RtDialogRef<void> = open((): Promise<IRtPdfViewer.PdfJs> => Promise.resolve(fakePdfJs()));
            await settle();
            expect(document.activeElement).not.toBe(opener);

            ref.close();
            await settle();

            expect(document.activeElement).toBe(opener);
            opener.remove();
        });
    });
});
