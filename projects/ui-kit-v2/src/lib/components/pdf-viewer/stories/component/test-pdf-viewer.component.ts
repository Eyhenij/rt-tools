import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtDialogRef } from '../../../dialog/rt-dialog-ref';
import { RT_DIALOG_DATA } from '../../../dialog/rt-dialog.tokens';
import { IRtPdfViewer } from '../../rt-pdf-viewer.model';
import { RtPdfViewerComponent } from '../../rt-pdf-viewer.component';
import { storyPdf } from './story-pdf';

/** Три страницы: по ним видно и счётчик, и просвет между листами, и прокрутку. */
export const STORY_DOCUMENT: IRtPdfViewer.Data = { source: storyPdf(3), fileName: 'Годовой отчёт за 2025 год.pdf' };

/** Ссылка на окно, ничего не закрывающая: настоящая убрала бы показ от первого нажатия. */
export const STORY_DIALOG_REF: Pick<RtDialogRef, 'close'> = { close: (): void => undefined };

/**
 * Демонстрационная обёртка для витрины. Входов у просмотрщика нет вовсе — документ приходит
 * данными открытия, то есть внедрением, поэтому его раздаёт обёртка. В пакет обёртка не уезжает.
 *
 * Рисовальщик настоящий: воркер витрина отдаёт статикой по адресу умолчания.
 */
@Component({
    selector: 'app-pdf-viewer',
    templateUrl: './test-pdf-viewer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtPdfViewerComponent,
    ],
    providers: [
        { provide: RtDialogRef, useValue: STORY_DIALOG_REF },
        { provide: RT_DIALOG_DATA, useValue: STORY_DOCUMENT },
    ],
})
export class TestRtPdfViewerComponent {}
