import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { chatMomentText, EChatSendState, EChatSide, IChat } from '@rt/message-bus-admin/chat/util';
import { AdminLocaleService, AdminTextService } from '@rt/message-bus-admin/common/core/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'admin-chat-message';

/**
 * Одно сообщение ленты: кто написал, что написал и когда.
 *
 * Отправленная и отбитая реплики показаны здесь же, а не убраны из ленты: отбитая, убранная с
 * экрана, уносит с собой набранный текст, и отправить его заново неоткуда.
 *
 * Производные значения объявлены выше входа, как велит порядок членов; считаются они при
 * отрисовке, и вход к тому времени на месте.
 */
@Component({
    selector: 'admin-chat-message',
    templateUrl: './admin-chat-message.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminChatMessageComponent {
    readonly #text: AdminTextService = inject(AdminTextService);
    readonly #locale: AdminLocaleService = inject(AdminLocaleService);

    /** Кто написал реплику. */
    protected readonly sideLabel: Signal<string> = computed((): string =>
        this.#text.text(this.message().side === EChatSide.Operator ? 'chatSideOperator' : 'chatSideVisitor')
    );

    /** Минута реплики словами языка экрана. */
    protected readonly momentText: Signal<string> = computed((): string => chatMomentText(this.message().takenAt, this.#locale.tag()));

    /** Слово об отбитой отправке. Пусто — реплика принята или ещё ждёт ответа сервиса. */
    protected readonly refusedLabel: Signal<string> = computed((): string =>
        this.message().send === EChatSendState.Refused ? this.#text.text('chatAnswerRefused') : ''
    );

    /** Сообщение ленты. */
    public readonly message: InputSignal<IChat.Message.State> = input.required<IChat.Message.State>();
}
