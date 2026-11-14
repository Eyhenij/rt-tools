import { IRtPdfViewer } from './rt-pdf-viewer.model';

/**
 * Печать и скачивание документа — то, что уходит за пределы окна просмотра.
 */

/** Блок печатного листа. Лист лежит в конце `<body>`, вне просмотрщика, и класс у него свой. */
export const RT_PDF_PRINT_BLOCK: string = 'rt-pdf-viewer-print';

/** Признак на корне страницы, пока идёт печать: под ним прячется всё, кроме листа. */
export const RT_PDF_PRINTING_FLAG: string = 'rt-pdf-viewer-printing';

/** Плотность печати: 150 точек на дюйм — текст чёткий, а лист в сотню страниц не выедает память. */
const PRINT_DPI: number = 150;

/** Байты документа в том виде, в каком их принимает `Blob`. */
function blobOf(bytes: Uint8Array | ArrayBuffer): Blob {
    const copy: Uint8Array<ArrayBuffer> = bytes instanceof ArrayBuffer ? new Uint8Array(bytes.slice(0)) : new Uint8Array(bytes);

    return new Blob([copy], { type: 'application/pdf' });
}

/**
 * Сохраняет файл под его именем. Байты уходят ссылкой на `Blob`: так браузер берёт имя из
 * `download`. Адрес без байтов отдаётся ссылкой как есть — чужой домен имя может и не принять, но
 * файл человек получит.
 */
export function downloadPdf(
    doc: Document,
    win: Window & typeof globalThis,
    file: Uint8Array | ArrayBuffer | string,
    fileName: string
): void {
    const anchor: HTMLAnchorElement = doc.createElement('a');
    const ownUrl: string | null = typeof file === 'string' ? null : win.URL.createObjectURL(blobOf(file));

    anchor.href = ownUrl ?? (typeof file === 'string' ? file : '');
    anchor.download = fileName;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';
    doc.body.append(anchor);
    anchor.click();
    anchor.remove();

    if (ownUrl) {
        // Отзыв сразу после щелчка обрывает скачивание в части браузеров: ссылка живёт ещё ход.
        win.setTimeout((): void => win.URL.revokeObjectURL(ownUrl), 0);
    }
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise<Blob>((resolve: (blob: Blob) => void, reject: (reason: Error) => void): void => {
        canvas.toBlob((blob: Blob | null): void => (blob ? resolve(blob) : reject(new Error('canvas is empty'))), 'image/png');
    });
}

/**
 * Готовит печатный лист: каждая страница рисуется в картинку и встаёт в разметку в конце `<body>`.
 *
 * Лист собирается из картинок, а не из `<iframe>` с самим файлом: встроенного показа PDF нет у
 * мобильных браузеров, а `print()` у кадра с PDF в части настольных печатает пустую страницу или
 * только первую. Картинки печатает любой браузер.
 */
export async function preparePrintSheet(
    pdf: IRtPdfViewer.PdfDocument,
    doc: Document,
    win: Window & typeof globalThis
): Promise<IRtPdfViewer.PrintSheet> {
    const sheet: HTMLDivElement = doc.createElement('div');
    const urls: string[] = [];
    const images: HTMLImageElement[] = [];
    sheet.classList.add(RT_PDF_PRINT_BLOCK);

    const dispose: () => void = (): void => {
        doc.documentElement.classList.remove(RT_PDF_PRINTING_FLAG);
        sheet.remove();
        for (const url of urls) {
            win.URL.revokeObjectURL(url);
        }
    };

    try {
        for (let pageNumber: number = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page: IRtPdfViewer.PdfPage = await pdf.getPage(pageNumber);
            const viewport: IRtPdfViewer.Viewport = page.getViewport({ scale: PRINT_DPI / 72 });
            const canvas: HTMLCanvasElement = doc.createElement('canvas');
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            await page.render({ canvas, viewport, intent: 'print' }).promise;

            const url: string = win.URL.createObjectURL(await canvasBlob(canvas));
            urls.push(url);
            // Холст печатной плотности весит десятки мегабайт: память отдаётся сразу, а не по уборке
            canvas.width = 0;
            canvas.height = 0;

            const image: HTMLImageElement = doc.createElement('img');
            image.classList.add(`${RT_PDF_PRINT_BLOCK}__page`);
            image.alt = '';
            image.src = url;
            images.push(image);
            sheet.append(image);
        }

        doc.body.append(sheet);
        // Печать до раскодирования картинок даёт пустые листы
        await Promise.all(images.map((image: HTMLImageElement): Promise<void> => image.decode().catch((): void => undefined)));
        doc.documentElement.classList.add(RT_PDF_PRINTING_FLAG);
    } catch (error: unknown) {
        dispose();
        throw error;
    }

    return { dispose };
}
