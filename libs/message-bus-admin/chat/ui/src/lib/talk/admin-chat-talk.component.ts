import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { chatMomentText, chatTalkClosed, EChatSide, IChat } from '@rt/message-bus-admin/chat/util';
import { AdminLocaleService, AdminTextService } from '@rt/message-bus-admin/common/core/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { IRtTag, RtTagComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-chat-talk';

/**
 * Строка списка переписок: сайт, последняя реплика, минута и состояние разговора.
 *
 * Своего состояния не держит и своего нажатия тоже: строку рисует готовый список кита, и выбор —
 * его дело. Последняя реплика показана здесь же — без неё панель спрашивала бы по обращению на
 * каждую строку.
 *
 * Производные значения объявлены выше входов, как велит порядок членов; считаются они при
 * отрисовке, и входы к тому времени на месте.
 */
@Component({
    selector: 'admin-chat-talk',
    templateUrl: './admin-chat-talk.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        RtTagComponent,
    ],
    host: { class: BEM_BLOCK, 'qa-dataid': 'chat-talk' },
})
export class AdminChatTalkComponent {
    readonly #text: AdminTextService = inject(AdminTextService);
    readonly #locale: AdminLocaleService = inject(AdminLocaleService);

    /** Слово состояния: живой или закрытый. Оба лежат в словаре — на экране их читает человек. */
    protected readonly stateLabel: Signal<string> = computed((): string =>
        this.#text.text(chatTalkClosed(this.talk()) ? 'chatStateClosed' : 'chatStateLive')
    );

    /**
     * Цвет тега состояния. Живой разговор ждёт ответа и назван цветом внимания, закрытый —
     * спокойным: над полусотней строк состояние читается цветом раньше, чем словом.
     */
    protected readonly stateSeverity: Signal<IRtTag.Severity> = computed((): IRtTag.Severity =>
        chatTalkClosed(this.talk()) ? 'secondary' : 'success'
    );

    /** Минута последней реплики словами языка экрана. */
    protected readonly momentText: Signal<string> = computed((): string => chatMomentText(this.talk().lastMessageAt, this.#locale.tag()));

    /** Кто написал последнюю реплику: посетитель или оператор. */
    protected readonly sideLabel: Signal<string> = computed((): string =>
        this.#text.text(this.talk().lastMessageSide === EChatSide.Operator ? 'chatSideOperator' : 'chatSideVisitor')
    );

    /** Разговор строки. */
    public readonly talk: InputSignal<IChat.Talk.State> = input.required<IChat.Talk.State>();
}
