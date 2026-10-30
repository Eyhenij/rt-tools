import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtIconButtonComponent } from '../../../../../../lib/components/icon-button/rt-icon-button.component';
import { RtMenuItemComponent } from '../../../../../../lib/components/menu/rt-menu-item.component';
import { StoryPresetsComponent } from '../../../../../../showcase/story-presets.component';
import { RtChatMessageActionsDirective, RtChatMessageButtonsDirective } from '../../rt-chat-message-actions.directive';
import { RtChatComponent } from '../../rt-chat.component';
import { IRtChat } from '../../rt-chat.model';
import { CHAT_MESSAGES } from './chat.fixture';

/**
 * Кнопки у реплики `<ng-template rtChatMessageButtons>` в виде мессенджера: частое действие стоит
 * кнопкой перед «…»-меню, и кнопка с меню собраны одной панелью у пузыря.
 *
 * Панель проявляется наведением, поэтому на ящике стоит признак состояния. Размеры ящика написаны
 * в разметке по той же причине, что у матрицы переписки: без высоты и ширины чат сжимается.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chat-message-buttons',
    template: `
        <app-story-presets caption="Кнопка «Ответить» и меню у реплики в виде мессенджера">
            <ng-template>
                <div
                    style="box-sizing: border-box; inline-size: 100%; block-size: 28rem; padding: 1rem; background-color: var(--rt-color-bg-page)"
                    [attr.data-story-state]="'hover'">
                    <rt-chat
                        style="height: 100%"
                        messenger
                        hasThread
                        title="№12 Анна Смирнова"
                        subtitle="WhatsApp · +66 81 234 5678"
                        placeholder="Написать сообщение"
                        [messages]="messages">
                        <ng-template rtChatMessageButtons>
                            <rt-icon-button icon="reply" variant="ghost" size="sm" ariaLabel="Ответить" />
                        </ng-template>
                        <ng-template rtChatMessageActions>
                            <rt-menu-item icon="copy" label="Скопировать текст" />
                        </ng-template>
                    </rt-chat>
                </div>
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtChatComponent,
        RtChatMessageActionsDirective,
        RtChatMessageButtonsDirective,
        RtIconButtonComponent,
        RtMenuItemComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtChatMessageButtonsComponent {
    public readonly messages: readonly IRtChat.Message[] = CHAT_MESSAGES;
}
