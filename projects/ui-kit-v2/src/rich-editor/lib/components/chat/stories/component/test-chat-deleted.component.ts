import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { RtChatComponent } from '../../rt-chat.component';
import { ERtChatMessageStatus, IRtChat } from '../../rt-chat.model';

/** Время сегодняшнего дня: подпись «Сегодня» в кадре не зависит от дня съёмки. */
function today(hours: number, minutes: number): string {
    const date: Date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
}

/**
 * Снятые реплики в виде мессенджера, входящая и своя, в обеих темах рядом. Своя несёт знак
 * статуса: на пузыре без заливки он и время не должны остаться белыми.
 *
 * Чат стоит в ящике с размерами и поверхностью: размер ему даёт потребитель, в показе это ящик.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chat-deleted',
    templateUrl: './test-chat-deleted.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtChatComponent,

        // showcase
        StoryThemesComponent,
    ],
})
export class TestRtChatDeletedComponent {
    public readonly messages: readonly IRtChat.Message[] = [
        { id: 1, author: 'Анна', own: false, deleted: true, text: '', createdAt: today(12, 40) },
        {
            id: 2,
            author: 'Вы',
            own: true,
            deleted: true,
            text: '',
            createdAt: today(12, 40),
            status: ERtChatMessageStatus.Sent,
        },
    ];
}
