import { ChangeDetectionStrategy, Component, computed, input, InputSignal, Signal } from '@angular/core';
import { chatMomentText, chatTalkClosed, EChatSide, IChat, IChatTalkWords } from '@rt/message-bus-admin/chat/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { IRtTag, RtTagComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-chat-talk';

/**
 * Строка списка переписок: сайт, последняя реплика, минута и состояние разговора тегом.
 *
 * Своего состояния не держит и своего нажатия тоже: строку рисует готовый список кита, и выбор —
 * его дело. Последняя реплика показана здесь же — без неё панель спрашивала бы по обращению на
 * каждую строку.
 *
 * Слова и язык приезжают доводом, а не читаются службой: строку показывают два экрана — панель
 * оператора и встраиваемая страница потребителя, — и словарь у них разный. Читая словарь админки,
 * строка привела бы за собой и её выбор языка, то есть выбор, который на странице делает не тот
 * человек.
 *
 * Производные значения объявлены выше входов, как велит порядок членов; считаются они при
 * отрисовке, и входы к тому времени на месте.
 */
@Component({
    selector: 'admin-chat-talk',
    templateUrl: './admin-chat-talk.component.html',
    styleUrl: './admin-chat-talk.component.scss',
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
    /** Слово состояния: живой или закрытый. Оба приезжают со словами экрана. */
    protected readonly stateLabel: Signal<string> = computed((): string =>
        chatTalkClosed(this.talk()) ? this.words().stateClosed : this.words().stateLive
    );

    /**
     * Цвет тега состояния. Живой разговор ждёт ответа и назван цветом внимания, закрытый —
     * спокойным: над полусотней строк состояние читается цветом раньше, чем словом.
     */
    protected readonly stateSeverity: Signal<IRtTag.Severity> = computed((): IRtTag.Severity =>
        chatTalkClosed(this.talk()) ? 'secondary' : 'success'
    );

    /** Минута последней реплики словами языка экрана. */
    protected readonly momentText: Signal<string> = computed((): string => chatMomentText(this.talk().lastMessageAt, this.locale()));

    /** Кто написал последнюю реплику: посетитель или оператор. */
    protected readonly sideLabel: Signal<string> = computed((): string =>
        this.talk().lastMessageSide === EChatSide.Operator ? this.words().sideOperator : this.words().sideVisitor
    );

    /** Разговор строки. */
    public readonly talk: InputSignal<IChat.Talk.State> = input.required<IChat.Talk.State>();

    /** Слова экрана, на котором стоит строка. */
    public readonly words: InputSignal<IChatTalkWords> = input.required<IChatTalkWords>();

    /** Язык, которым называется минута последней реплики. */
    public readonly locale: InputSignal<string> = input<string>('ru-RU');
}
