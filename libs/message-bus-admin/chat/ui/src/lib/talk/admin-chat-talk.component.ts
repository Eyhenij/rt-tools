import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { EChatSide, EChatTalkState, IChat } from '@rt/message-bus-admin/chat/util';
import { AdminTextService } from '@rt/message-bus-admin/common/core/util';

const BEM_BLOCK: string = 'admin-chat-talk';

/**
 * Строка списка переписок: сайт, последняя реплика, минута и состояние разговора.
 *
 * Своего состояния не держит: выбранный разговор приходит входом, нажатие уходит наверх
 * признаком. Последняя реплика показана здесь же — без неё панель спрашивала бы по обращению на
 * каждую строку.
 *
 * Производные значения объявлены выше входов, как велит порядок членов; считаются они при
 * отрисовке, и входы к тому времени на месте.
 */
@Component({
    selector: 'admin-chat-talk',
    templateUrl: './admin-chat-talk.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class AdminChatTalkComponent {
    readonly #text: AdminTextService = inject(AdminTextService);

    /** Слово состояния: живой или закрытый. Оба лежат в словаре — на экране их читает человек. */
    protected readonly stateLabel: Signal<string> = computed((): string =>
        this.#text.text(this.talk().state === EChatTalkState.Closed ? 'chatStateClosed' : 'chatStateLive')
    );

    /** Кто написал последнюю реплику: посетитель или оператор. */
    protected readonly sideLabel: Signal<string> = computed((): string =>
        this.#text.text(this.talk().lastMessageSide === EChatSide.Operator ? 'chatSideOperator' : 'chatSideVisitor')
    );

    /** Разговор строки. */
    public readonly talk: InputSignal<IChat.Talk.State> = input.required<IChat.Talk.State>();

    /** Выбран ли этот разговор: выбранное называет экран, а не строка. */
    public readonly chosen: InputSignal<boolean> = input<boolean>(false);

    public readonly choose: OutputEmitterRef<string> = output<string>();
}
