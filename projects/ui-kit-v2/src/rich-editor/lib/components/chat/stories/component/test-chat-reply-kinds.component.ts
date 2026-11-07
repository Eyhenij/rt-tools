import { afterNextRender, signal, viewChildren, ChangeDetectionStrategy, Component, Signal, WritableSignal } from '@angular/core';

import { RtChatComponent } from '../../rt-chat.component';
import { IRtChat } from '../../rt-chat.model';
import { TestRtChatEditBarComponent } from './test-chat-edit-bar.component';

const DRAFT: string = 'Поздний выезд подтверждаю.';

/** Время сегодняшнего дня: подпись «Сегодня» в кадре не зависит от дня съёмки. */
function today(hours: number, minutes: number): string {
    const date: Date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
}

/** Вид поля ответа в показе: заголовок и входы чата, которые его включают. */
interface IReplyKind {
    readonly title: string;
    readonly messenger: boolean;
    readonly rich: boolean;
}

/**
 * Три вида поля ответа рядом: слот над полем и строка с ответом `draftText()`. Черновик пишет
 * `setDraft`, читает `draftText`, поэтому в кадре видно, что метод отдаёт текст каждого вида.
 */
@Component({
    selector: 'app-chat-reply-kinds',
    imports: [RtChatComponent, TestRtChatEditBarComponent],
    templateUrl: './test-chat-reply-kinds.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestRtChatReplyKindsComponent {
    protected readonly chats: Signal<readonly RtChatComponent[]> = viewChildren(RtChatComponent);

    protected readonly drafts: WritableSignal<readonly string[]> = signal<readonly string[]>([]);

    public readonly kinds: readonly IReplyKind[] = [
        { title: 'Обычное поле', messenger: false, rich: false },
        { title: 'Компактный композер', messenger: false, rich: true },
        { title: 'Вид мессенджера', messenger: true, rich: false },
    ];

    public readonly messages: readonly IRtChat.Message[] = [
        { id: 1, author: 'Анна', own: false, text: 'Можно выехать в 14:00?', createdAt: today(13, 5), dateLabel: '13:05' },
    ];

    constructor() {
        // Кадр держит текст в поле, а курсор в кадр не попадает
        afterNextRender((): void => {
            for (const chat of this.chats()) {
                chat.setDraft(DRAFT);
            }
            (document.activeElement as HTMLElement | null)?.blur();
            this.drafts.set(this.chats().map((chat: RtChatComponent): string => chat.draftText()));
        });
    }
}
