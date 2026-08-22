import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtMarkdownTextComponent } from '../../rt-markdown-text.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook
 * вешает контролы. Вход кита сигнальный и извне не пишется — поэтому история целится сюда, а не
 * в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-markdown-text',
    template: `
        <rt-markdown-text [text]="text" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMarkdownTextComponent,
    ],
})
export class TestRtMarkdownTextComponent {
    public text: string | null = '# Заголовок\n\nАбзац с **жирным** и `кодом`.';
}
