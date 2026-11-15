import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
    RtWorkspaceAsideDirective,
    RtWorkspaceCenterDirective,
    RtWorkspaceListDirective,
} from '../../../../../../lib/components/workspace/rt-workspace.directives';
import { RtWorkspaceComponent } from '../../../../../../lib/components/workspace/rt-workspace.component';
import { RtChatComponent } from '../../rt-chat.component';
import { ERtChatMessageStatus, IRtChat } from '../../rt-chat.model';
import { CHAT_PEER } from './chat.fixture';

/** Время постоянное: вычисленное на месте, оно уводило бы кадр каждый день. */
const NOW: string = '2026-03-14T16:02:00.000Z';

/** Длинная лента: сорок реплик по очереди, своих и собеседника. */
const LONG_THREAD: readonly IRtChat.Message[] = Array.from({ length: 40 }, (_: unknown, index: number): IRtChat.Message =>
    index % 2 === 0
        ? { id: index + 1, author: CHAT_PEER, own: false, text: `Реплика гостя № ${index + 1}`, createdAt: NOW }
        : { id: index + 1, author: 'Вы', own: true, status: ERtChatMessageStatus.Read, text: `Ответ № ${index + 1}`, createdAt: NOW }
);

/**
 * `rt-chat` с `fill` в центре рабочего места с карточками, во всю высоту окна. До 1080 над чатом
 * стоит полоса «назад / сведения», и чат делит с ней колонку флекс-ребёнком: поле ввода должно
 * остаться у низа колонки и с длинной лентой. Шире 1080 полосы нет, и раскладка прежняя.
 *
 * Пары наборов нет: кадр снимается во всю ширину окна, а пороги рабочего места считаются от окна —
 * половина пары их не сдвинула бы и показала бы ту же раскладку дважды.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chat-fill',
    templateUrl: './test-chat-fill.component.html',
    styleUrl: './test-chat-fill.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtChatComponent,
        RtWorkspaceComponent,

        // directives
        RtWorkspaceAsideDirective,
        RtWorkspaceCenterDirective,
        RtWorkspaceListDirective,
    ],
})
export class TestRtChatFillComponent {
    /** Длинная лента — сорок реплик; короткая — одна. */
    public long: boolean = true;

    public readonly longThread: readonly IRtChat.Message[] = LONG_THREAD;
    public readonly shortThread: readonly IRtChat.Message[] = [LONG_THREAD[0]];
}
