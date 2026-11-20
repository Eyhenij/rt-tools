import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtAiChat } from '../../../../rt-ai-chat.model';
import { RtAiChatBlocksComponent } from '../../../rt-ai-chat-blocks.component';
import { AI_CHAT_KPI_MONTH } from './ai-chat-kpi.fixture';

/**
 * Обёртка `Playground`: ширина ленты и число карточек — входы витрины. Блок собирается из данных
 * макета «Обзор ноября».
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-kpi',
    templateUrl: './test-ai-chat-kpi.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAiChatBlocksComponent,
    ],
})
export class TestRtAiChatKpiComponent {
    protected readonly items: readonly IRtAiChat.KpiItem[] = AI_CHAT_KPI_MONTH.items;

    public width: number = 386;

    public count: number = 4;
}
