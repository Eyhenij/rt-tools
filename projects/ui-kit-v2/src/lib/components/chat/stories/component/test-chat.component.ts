import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtChatComponent } from '../../rt-chat.component';
import { IRtChat } from '../../rt-chat.model';
import { IRtRichEditorToolbar } from '../../../rich-editor/rt-rich-editor.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-chat',
    template: `
        <rt-chat
            [messages]="messages"
            [loading]="loading"
            [fetching]="fetching"
            [canReply]="canReply"
            [replyBlockReason]="replyBlockReason"
            [sending]="sending"
            [placeholder]="placeholder"
            [title]="title"
            [emptyHint]="emptyHint"
            [hasThread]="hasThread"
            [attachments]="attachments"
            [accept]="accept"
            [richComposer]="richComposer"
            [formatting]="formatting"
            [formattingToolbar]="formattingToolbar"
            [fill]="fill"
            [showRefresh]="showRefresh"
            [showExpand]="showExpand" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtChatComponent,
    ],
})
export class TestRtChatComponent {
    public messages: readonly IRtChat.Message[] = [];
    public loading: boolean = false;
    public fetching: boolean = false;
    public canReply: boolean = false;
    public replyBlockReason: string | null = null;
    public sending: boolean = false;
    public placeholder: string = 'Введите значение';
    public title: string = 'Заголовок';
    public emptyHint: string = '';
    public hasThread: boolean = false;
    public attachments: boolean = false;
    public accept: string = '';
    public richComposer: boolean = false;
    public formatting: boolean = false;
    public formattingToolbar: IRtRichEditorToolbar = 'full';
    public fill: boolean = false;
    public showRefresh: boolean = false;
    public showExpand: boolean = false;
}
