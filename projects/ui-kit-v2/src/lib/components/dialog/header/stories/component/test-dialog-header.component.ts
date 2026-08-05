import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtDialogHeaderComponent } from '../../rt-dialog-header.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-dialog-header',
    template: `
        <rt-dialog-header [title]="title" [closable]="closable" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDialogHeaderComponent,
    ],
})
export class TestRtDialogHeaderComponent {
    public title: string = 'Заголовок';
    public closable: boolean = true;
}
