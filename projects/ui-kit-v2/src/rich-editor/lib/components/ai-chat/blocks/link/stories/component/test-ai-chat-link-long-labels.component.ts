import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal } from '@angular/core';

import { RT_KIT_LABELS } from '../../../../../../../../lib/i18n/rt-kit-labels.providers';
import { TRtKitLabelMap } from '../../../../../../../../lib/i18n/rt-kit-labels.model';

import { IRtAiChat } from '../../../../rt-ai-chat.model';
import { RtAiChatBlocksComponent } from '../../../rt-ai-chat-blocks.component';

/**
 * Лента с подписями кнопок длиннее ряда карточки: так пишет язык, где «Открыть» — три слова.
 * Подписи подменяет поставщик самого компонента, остальные берутся у витрины.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-link-long-labels',
    templateUrl: './test-ai-chat-link-long-labels.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAiChatBlocksComponent,
    ],
    providers: [
        {
            provide: RT_KIT_LABELS,
            useFactory: (): Signal<TRtKitLabelMap> => {
                const labels: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS, { skipSelf: true });

                return computed((): TRtKitLabelMap => ({
                    ...labels(),
                    aiLinkOpen: 'Открыть страницу отчёта',
                    aiLinkOpenNewTab: 'Открыть в новой вкладке браузера',
                }));
            },
        },
    ],
})
export class TestRtAiChatLinkLongLabelsComponent {
    public readonly blocks: InputSignal<readonly IRtAiChat.Block[]> = input.required<readonly IRtAiChat.Block[]>();
}
