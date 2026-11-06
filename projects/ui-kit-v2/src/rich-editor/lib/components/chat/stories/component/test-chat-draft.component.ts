import { ChangeDetectionStrategy, Component, Signal, viewChild } from '@angular/core';

import { RtButtonDirective } from '../../../../../../lib/components/button/rt-button.directive';
import { RtChatComponent } from '../../rt-chat.component';
import { IRtChat } from '../../rt-chat.model';

/** Какое поле ответа стоит в показе. */
export type TChatDraftField = 'classic' | 'rich' | 'formatting' | 'messenger';

/**
 * Показ метода `setDraft`: кнопка стоит снаружи чата, как у приложения с готовыми ответами.
 *
 * Пары наборов нет: показ проверяет метод, а вид чата уже показан в его историях.
 */
@Component({
    selector: 'app-chat-draft',
    template: `
        <button
            rtButton
            type="button"
            qa-dataid="story-chat-draft-insert"
            appearance="outlined"
            label="Подставить готовый ответ"
            aria-label="Подставить готовый ответ"
            (click)="insert()"></button>
        <rt-chat
            hasThread
            canReply
            title="Обращение"
            [messages]="messages"
            [richComposer]="field === 'rich' || field === 'formatting'"
            [formatting]="field === 'formatting'"
            [messenger]="field === 'messenger'" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // directives
        RtButtonDirective,

        // components
        RtChatComponent,
    ],
})
export class TestRtChatDraftComponent {
    protected readonly chat: Signal<RtChatComponent | undefined> = viewChild(RtChatComponent);

    public messages: readonly IRtChat.Message[] = [];
    public field: TChatDraftField = 'classic';

    protected insert(): void {
        this.chat()?.setDraft('Добрый день! Заявка принята, ответим сегодня.');
    }
}
