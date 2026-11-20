import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { RT_KIT_LABELS_EN } from '../../../../../../lib/i18n/rt-kit-labels.en';
import { TRtKitLabelMap } from '../../../../../../lib/i18n/rt-kit-labels.model';
import { RT_KIT_LABELS } from '../../../../../../lib/i18n/rt-kit-labels.providers';

/**
 * Все подписи кита на английском: строка прерванного ответа, «спросить снова», шапка и поле ввода.
 * Подменяет их поставщик этой обёртки, а не всей витрины: так английская ячейка стоит рядом с
 * русскими. Подпись строки хода приходит данными и остаётся как есть.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-english-labels',
    templateUrl: './test-ai-chat-english-labels.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: RT_KIT_LABELS, useValue: signal<TRtKitLabelMap>(RT_KIT_LABELS_EN).asReadonly() }],
})
export class TestRtAiChatEnglishLabelsComponent {}
