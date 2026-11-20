import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtAiChatBlocksComponent } from '../../../rt-ai-chat-blocks.component';

/** Исход открытия для контрола витрины: `none` — блок без поля `state`. */
export type TAiChatLinkState = 'none' | 'pending' | 'opened' | 'failed';

/**
 * Обёртка `Playground`: ширина ленты, тексты карточки и исход открытия — входы витрины.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-link',
    templateUrl: './test-ai-chat-link.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAiChatBlocksComponent,
    ],
})
export class TestRtAiChatLinkComponent {
    public width: number = 386;

    public title: string = 'Продажи за ноябрь';

    public section: string = 'Отчёты · Продажи';

    public icon: string = 'chart-bar';

    public state: TAiChatLinkState = 'opened';

    public reason: string = 'Нет доступа к разделу «Отчёты»';
}
