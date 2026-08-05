import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtRichEditorComponent } from '../../rt-rich-editor.component';
import { IRtRichEditorToolbar } from '../../rt-rich-editor.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-rich-editor',
    template: `
        <rt-rich-editor [placeholder]="placeholder" [toolbar]="toolbar" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtRichEditorComponent,
    ],
})
export class TestRtRichEditorComponent {
    public placeholder: string = 'Введите значение';
    public toolbar: IRtRichEditorToolbar = 'full';
}
