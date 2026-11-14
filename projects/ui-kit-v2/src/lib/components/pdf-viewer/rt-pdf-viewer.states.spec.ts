import { ApplicationRef, ChangeDetectionStrategy, Component, Signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { RtDialogService } from '../dialog/rt-dialog.service';
import { RtPdfViewerErrorDirective } from './rt-pdf-viewer-error.directive';
import { IRtPdfViewer } from './rt-pdf-viewer.model';
import { RtPdfViewerComponent } from './rt-pdf-viewer.component';
import { provideRtPdfViewer } from './rt-pdf-viewer.tokens';

/** Хозяин держит шаблон своей ошибки, как держит его потребитель, открывающий окно. */
@Component({
    selector: 'rt-test-pdf-viewer-states-host',
    template: `
        <ng-template rtPdfViewerError let-text let-download="download">
            <p qa-dataid="own-error">своя ошибка: {{ text }}</p>
            <button qa-dataid="own-error-download" type="button" (click)="download()">скачать</button>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPdfViewerErrorDirective],
})
class StatesHostComponent {
    public readonly errorSlot: Signal<RtPdfViewerErrorDirective> = viewChild.required(RtPdfViewerErrorDirective);
}

/** Окно с рисовальщиком, который не загрузился: просмотрщик уходит в отказ. */
async function openBroken(withSlot: boolean): Promise<void> {
    TestBed.configureTestingModule({
        providers: [
            ...provideRtKitTesting(),
            provideRtPdfViewer({ load: (): Promise<IRtPdfViewer.PdfJs> => Promise.reject(new Error('no pdfjs-dist')) }),
        ],
    });
    const host: ComponentFixture<StatesHostComponent> = TestBed.createComponent(StatesHostComponent);
    host.detectChanges();

    TestBed.inject(RtDialogService).open<RtPdfViewerComponent, IRtPdfViewer.Data, void>(RtPdfViewerComponent, {
        data: {
            source: new Uint8Array([37, 80, 68, 70]),
            fileName: 'Договор аренды.pdf',
            errorTemplate: withSlot ? host.componentInstance.errorSlot().templateRef : undefined,
        },
    });
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

describe('RtPdfViewerComponent — свой вид ошибки', (): void => {
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

    it('SC-UKV-1292 — шаблон встаёт вместо заглушки и получает текст ошибки', async (): Promise<void> => {
        await openBroken(true);

        expect(node('own-error')?.textContent).toContain('своя ошибка: You can download the file and open it on your computer.');
        expect(node('pdf-viewer-error')).toBeNull();
    });

    it('SC-UKV-1292 — download из контекста сохраняет файл под его именем', async (): Promise<void> => {
        await openBroken(true);

        node('own-error-download')?.click();
        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, 0);
        });

        const anchor: HTMLAnchorElement = clickSpy.mock.contexts[0] as HTMLAnchorElement;
        expect(anchor.download).toBe('Договор аренды.pdf');
    });

    it('SC-UKV-1296 — без шаблона стоит заглушка кита с кнопкой «Скачать»', async (): Promise<void> => {
        await openBroken(false);

        expect(node('pdf-viewer-error')).not.toBeNull();
        expect(node('pdf-viewer-error-download')).not.toBeNull();
        expect(node('own-error')).toBeNull();
    });
});
