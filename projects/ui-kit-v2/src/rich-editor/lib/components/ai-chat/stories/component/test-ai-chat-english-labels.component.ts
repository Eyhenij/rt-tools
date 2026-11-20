import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';

import { RT_KIT_LABELS_EN } from '../../../../../../lib/i18n/rt-kit-labels.en';
import { TRtKitLabelMap } from '../../../../../../lib/i18n/rt-kit-labels.model';
import { RT_KIT_LABELS } from '../../../../../../lib/i18n/rt-kit-labels.providers';

/**
 * Подписи прерванного ответа на английском — строка и «спросить снова»; остальные берутся у
 * витрины. Подменяет их поставщик этой обёртки, а не всей витрины: так английская ячейка стоит
 * рядом с русскими.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-english-labels',
    templateUrl: './test-ai-chat-english-labels.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: RT_KIT_LABELS,
            useFactory: (): Signal<TRtKitLabelMap> => {
                const labels: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS, { skipSelf: true });

                return computed((): TRtKitLabelMap => ({
                    ...labels(),
                    aiInterrupted: RT_KIT_LABELS_EN.aiInterrupted,
                    aiRetry: RT_KIT_LABELS_EN.aiRetry,
                }));
            },
        },
    ],
})
export class TestRtAiChatEnglishLabelsComponent {}
