import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtFileCardComponent } from '../../../file-card/rt-file-card.component';
import { RtFileListComponent } from '../../rt-file-list.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-file-list',
    template: `
        <rt-file-list>
            @for (file of files; track file.name) {
                <rt-file-card [name]="file.name" [sizeBytes]="file.sizeBytes" [showDownload]="showActions" [showRemove]="showActions" />
            }
        </rt-file-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFileListComponent,
        RtFileCardComponent,
    ],
})
export class TestRtFileListComponent {
    public readonly files: readonly { name: string; sizeBytes: number }[] = [
        { name: 'Договор №2024-118.pdf', sizeBytes: 184320 },
        { name: 'Приложение №1.docx', sizeBytes: 20480 },
    ];

    public showActions: boolean = true;
}
