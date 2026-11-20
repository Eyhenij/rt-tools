import { Provider, Signal } from '@angular/core';

import { RT_KIT_LOCALE } from '@rt-tools/ui-kit-v2';
import { IRtAiChat, RT_AI_CHAT_BLOCK_RENDERERS } from '@rt-tools/ui-kit-v2/rich-editor';

import { RtAiChatChartComponent } from './components/block/rt-ai-chat-chart.component';
import { rtAiChatChartBlockText } from './ai-chat-chart.view';

/** Тип блока, который рисует график. */
export const RT_AI_CHAT_CHART_BLOCK_TYPE: string = 'chart';

/**
 * Подключает блок `chart` к `rt-ai-chat`. Регистрируется на том же уровне, что и прочие отрисовщики
 * блоков. Текст для копии ответа читает локаль кита в момент копирования, а не при регистрации.
 */
export function provideRtAiChatChart(): Provider {
    return {
        provide: RT_AI_CHAT_BLOCK_RENDERERS,
        multi: true,
        deps: [RT_KIT_LOCALE],
        useFactory: (locale: Signal<string>): IRtAiChat.BlockRenderer => ({
            type: RT_AI_CHAT_CHART_BLOCK_TYPE,
            component: RtAiChatChartComponent,
            toText: (block: IRtAiChat.Block): string => rtAiChatChartBlockText(block, locale()),
        }),
    };
}
