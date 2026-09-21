import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    inject,
    signal,
    Signal,
    untracked,
    WritableSignal,
} from '@angular/core';
import { ChatFeedStore, ChatTalksStore } from '@rt/message-bus-admin/chat/data-access';
import { AdminChatSiteFilterComponent, AdminChatStateFilterComponent, AdminChatTalkComponent } from '@rt/message-bus-admin/chat/ui';
import { ChatMessageMapper, chatKitThread, IChat, IChatSideLabels } from '@rt/message-bus-admin/chat/util';
import { AdminTextService } from '@rt/message-bus-admin/common/core/util';
import { BlockDirective, ElemDirective, WINDOW } from '@rt-tools/core';
import { CHAT_STREAM_PATH, EChatTalkState, IChatMessageEventRow } from '@rt/message-bus-common';
import { IRtChat, RtButtonDirective, RtChatComponent, RtEmptyStateComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-chat';

/** Сколько переписок читается за раз: список идёт страницей, как и в остальных разделах. */
const TALKS_PAGE_SIZE: number = 50;

/**
 * Раздел чата: список переписок слева, лента выбранного разговора справа, поле набора под лентой.
 *
 * Сужение по сайту и состоянию уходит в запрос списка, а не отбирается на экране: отсев после
 * чтения оставил бы соседский разговор в общем счёте строк.
 *
 * Отправленная реплика встаёт в ленту сразу, до ответа сервиса: оператор отвечает нескольким
 * разговорам подряд, и поле, которое ждёт сервис, читается как потерянная реплика. Держит это
 * стор ленты, а не экран.
 *
 * Поток событий открывается после первой отрисовки и закрывается вместе с экраном: до отрисовки
 * страницы его открывать некому — раздел рисуется в браузере, и средство потока живёт там же.
 * Пришедшая реплика встаёт в ленту, только если открыт её разговор: событий оператору приходит
 * столько, сколько у него сайтов.
 */
@Component({
    selector: 'admin-chat-panel',
    templateUrl: './admin-chat-panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        AdminChatSiteFilterComponent,
        AdminChatStateFilterComponent,
        AdminChatTalkComponent,
        RtButtonDirective,
        RtChatComponent,
        RtEmptyStateComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminChatPanelComponent {
    readonly #talks: ChatTalksStore = inject(ChatTalksStore);
    readonly #feed: ChatFeedStore = inject(ChatFeedStore);
    readonly #text: AdminTextService = inject(AdminTextService);
    // Тип сужен приведением: средство потока объявлено у глобального объекта, а не у окна
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #mapper: ChatMessageMapper = new ChatMessageMapper();

    protected readonly rows: Signal<readonly IChat.Talk.State[]> = this.#talks.rows;
    protected readonly messages: Signal<readonly IChat.Message.State[]> = this.#feed.messages;

    /** Идёт ли чтение ленты: на её месте кит рисует своё ожидание. */
    protected readonly feedReading: Signal<boolean> = this.#feed.loading;

    /** Выбранный разговор. Пусто — не выбран ни один, и лента просит выбрать. */
    protected readonly chosen: WritableSignal<string> = signal<string>('');

    /** Состояние, которым сужен список. Пусто — оба состояния. */
    protected readonly state: WritableSignal<string> = signal<string>('');

    /** Сайт, которым сужен список. Пусто — все сайты оператора. */
    protected readonly site: WritableSignal<string> = signal<string>('');

    /**
     * Сайты оператора: их называет непросуженный список.
     *
     * Второго чтения той же принадлежности заводить незачем — набор сайтов уже приехал строками,
     * и он же стоит в запросе на стороне приёмника.
     */
    protected readonly sites: WritableSignal<readonly string[]> = signal<readonly string[]>([]);

    protected readonly talksEmpty: Signal<string> = computed((): string => this.#text.text('chatTalksEmpty'));
    protected readonly talksEmptyFrom: Signal<string> = computed((): string => this.#text.text('chatTalksEmptyFrom'));
    protected readonly feedUnchosen: Signal<string> = computed((): string => this.#text.text('chatFeedUnchosen'));
    protected readonly sendPlaceholder: Signal<string> = computed((): string => this.#text.text('chatAnswerPlaceholder'));

    /** Подписи сторон для треда кита: кит о сторонах этого домена не знает ничего. */
    protected readonly sideLabels: Signal<IChatSideLabels> = computed((): IChatSideLabels => ({
        operator: this.#text.text('chatSideOperator'),
        visitor: this.#text.text('chatSideVisitor'),
    }));

    /** Лента разговора моделью кита: перевод лежит одним местом, в слое утилит раздела. */
    protected readonly thread: Signal<readonly IRtChat.Message[]> = computed((): readonly IRtChat.Message[] =>
        chatKitThread(this.messages(), this.sideLabels())
    );

    /** Выбранный разговор целиком: по нему подписывается кнопка состояния. */
    protected readonly talk: Signal<IChat.Talk.State | null> = computed(
        (): IChat.Talk.State | null => this.rows().find((row: IChat.Talk.State): boolean => row.id === this.chosen()) ?? null
    );

    /** Подпись кнопки состояния: закрыть живой разговор или открыть закрытый снова. */
    protected readonly stateLabel: Signal<string> = computed((): string =>
        this.#text.text(this.talk()?.state === EChatTalkState.Closed ? 'chatReopen' : 'chatClose')
    );

    constructor() {
        effect((): void => {
            const state: string = this.state();
            const site: string = this.site();

            untracked((): void => this.#talks.read({ page: 1, size: TALKS_PAGE_SIZE, site, state }));
        });

        // Сайты запоминаются по непросуженному списку: просуженный называет один, и отбор,
        // собранный по нему, потерял бы соседние сайты того же оператора
        effect((): void => {
            const rows: readonly IChat.Talk.State[] = this.rows();

            if (this.site() !== '' || this.state() !== '') {
                return;
            }

            untracked((): void => this.sites.set([...new Set(rows.map((row: IChat.Talk.State): string => row.siteId))]));
        });

        afterNextRender((): void => this.#listen());
    }

    /** Выбрать разговор: лента читается с начала, набранное в поле остаётся при экране. */
    protected choose(talkId: string): void {
        this.chosen.set(talkId);
        this.#feed.read(talkId);
    }

    /** Закрыть разговор или открыть его снова: список перечитывается ответом сервиса. */
    protected changeState(): void {
        const talk: IChat.Talk.State | null = this.talk();

        if (!talk) {
            return;
        }

        this.#talks.changeState(talk.id, talk.state === EChatTalkState.Closed ? EChatTalkState.Live : EChatTalkState.Closed);
    }

    /** Ответить посетителю. Пустая реплика не уходит: отбивать её обращением к сервису незачем. */
    protected send(payload: IRtChat.SendPayload): void {
        const text: string = payload.text.trim();

        if (!text || !this.chosen()) {
            return;
        }

        this.#feed.send(this.chosen(), text, new Date().toISOString());
    }

    /** Отправить отбитую реплику заново: её текст лежит в ленте, и набирать его снова незачем. */
    protected again(message: IRtChat.Message): void {
        if (!this.chosen()) {
            return;
        }

        this.#feed.resend(this.chosen(), String(message.id));
    }

    /**
     * Поток событий оператора.
     *
     * Открывается средством браузера, взятым из окна по признаку: своего обращения у потока нет —
     * он отвечает не одним ответом, а событиями. Закрывается вместе с экраном: подписку, которую
     * никто не закрыл, сервис держит открытой до обрыва связи.
     */
    #listen(): void {
        const stream: EventSource = new this.#window.EventSource(CHAT_STREAM_PATH, { withCredentials: true });

        stream.addEventListener('message', (event: MessageEvent<string>): void => this.#arrived(event.data));
        this.#destroyRef.onDestroy((): void => stream.close());
    }

    /** Пришедшее событие: реплика встаёт в ленту, если открыт её разговор. */
    #arrived(raw: string): void {
        const event: IChatMessageEventRow = JSON.parse(raw) as IChatMessageEventRow;

        if (event.conversationId !== this.chosen()) {
            return;
        }

        this.#feed.arrived(this.#mapper.mapFrom({ id: event.messageId, side: event.side, text: event.text, takenAt: event.takenAt }));
    }
}
