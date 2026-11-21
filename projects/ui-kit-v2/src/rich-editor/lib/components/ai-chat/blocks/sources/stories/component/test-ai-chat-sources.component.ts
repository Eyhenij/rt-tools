import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtAiChatBlocksComponent } from '../../../rt-ai-chat-blocks.component';

/**
 * Обёртка `Playground`: ширина ленты и тексты первого источника — входы витрины.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-sources',
    templateUrl: './test-ai-chat-sources.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAiChatBlocksComponent,
    ],
})
export class TestRtAiChatSourcesComponent {
    public width: number = 386;

    public title: string = 'Отчёт «Продажи»';

    public detail: string = 'Ноябрь 2026 · все филиалы';

    public icon: string = 'chart-bar';

    public url: string = '/reports/sales';
}
