import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtAiChatBlocksComponent } from '../../../rt-ai-chat-blocks.component';
import { AI_CHAT_TABLE_REVENUE } from './ai-chat-table.fixture';

/**
 * Обёртка `Playground`: заголовок, итог и ширина ленты — входы витрины. Блок собирается из данных
 * макета «Выручка по типам номеров».
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-table',
    templateUrl: './test-ai-chat-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAiChatBlocksComponent,
    ],
})
export class TestRtAiChatTableComponent {
    protected readonly revenue: typeof AI_CHAT_TABLE_REVENUE = AI_CHAT_TABLE_REVENUE;

    public title: string = AI_CHAT_TABLE_REVENUE.title ?? '';

    public withTotal: boolean = true;

    public width: number = 328;
}
