import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtCollapsibleTextComponent } from '../../rt-collapsible-text.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-collapsible-text',
    template: `
        <rt-collapsible-text [paragraphs]="paragraphs" [clampLines]="clampLines" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCollapsibleTextComponent,
    ],
})
export class TestRtCollapsibleTextComponent {
    public paragraphs: readonly string[] = ['Первый абзац.', 'Второй абзац.'];
    public clampLines: number = 6;
}
