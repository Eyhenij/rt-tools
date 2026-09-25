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
import {
    ChatMessageMapper,
    chatKitTalks,
    chatKitThread,
    chatTalkActions,
    chatTalkDetailRows,
    chatTalkStateAfter,
    chatTalkTitle,
    IChat,
    IChatKitTalkRow,
    IChatSideLabels,
    IChatTalkWords,
} from '@rt/message-bus-admin/chat/util';
import { AdminLocaleService, AdminTextService } from '@rt/message-bus-admin/common/core/util';
import { WINDOW } from '@rt-tools/core';
import { CHAT_STREAM_PATH, IChatMessageEventRow } from '@rt/message-bus-common';
import {
    IRtThreadList,
    IRtWorkspaceDetails,
    RtThreadListComponent,
    RtThreadListFiltersDirective,
    RtThreadListRowDirective,
    RtThreadListSearchDirective,
    RtWorkspaceAsideDirective,
    RtWorkspaceCenterDirective,
    RtWorkspaceComponent,
    RtWorkspaceDetailsComponent,
    RtWorkspaceListDirective,
} from '@rt-tools/ui-kit-v2';
import { IRtChat, RtChatComponent } from '@rt-tools/ui-kit-v2/rich-editor';

const BEM_BLOCK: string = 'admin-chat';

/** Сколько переписок читается за раз: список идёт страницей, как и в остальных разделах. */
const TALKS_PAGE_SIZE: number = 50;

/** Ключ, под которым рабочий стол помнит ширины колонок этого раздела. */
const WORKSPACE_STORAGE_KEY: string = 'admin-chat-workspace';

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
        // components
        AdminChatSiteFilterComponent,
        AdminChatStateFilterComponent,
        AdminChatTalkComponent,
        RtChatComponent,
        RtThreadListComponent,
        RtThreadListFiltersDirective,
        RtThreadListRowDirective,
        RtThreadListSearchDirective,
        RtWorkspaceAsideDirective,
        RtWorkspaceCenterDirective,
        RtWorkspaceComponent,
        RtWorkspaceDetailsComponent,
        RtWorkspaceListDirective,
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
    readonly #locale: AdminLocaleService = inject(AdminLocaleService);
    readonly #mapper: ChatMessageMapper = new ChatMessageMapper();

    /** Ключ, под которым стол помнит ширины колонок этого раздела. */
    protected readonly workspaceStorageKey: string = WORKSPACE_STORAGE_KEY;

    protected readonly rows: Signal<readonly IChat.Talk.State[]> = this.#talks.rows;

    /** Строки готового списка кита: разговор едет в шаблон строки целиком. */
    protected readonly talkRows: Signal<readonly IChatKitTalkRow[]> = computed((): readonly IChatKitTalkRow[] => chatKitTalks(this.rows()));

    /** Идёт ли чтение списка: на месте строк кит рисует заглушки. */
    protected readonly talksReading: Signal<boolean> = this.#talks.loading;
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

    /** Слова, которыми рабочий стол говорит о разговоре: их берут общие части раздела. */
    protected readonly talkWords: Signal<IChatTalkWords> = computed((): IChatTalkWords => ({
        site: this.#text.text('chatTalkSite'),
        state: this.#text.text('chatTalkState'),
        lastMessageAt: this.#text.text('chatTalkLastMessageAt'),
        stateLive: this.#text.text('chatStateLive'),
        stateClosed: this.#text.text('chatStateClosed'),
        close: this.#text.text('chatClose'),
        reopen: this.#text.text('chatReopen'),
        untitled: this.#text.text('chatTalkUntitled'),
        sideOperator: this.#text.text('chatSideOperator'),
        sideVisitor: this.#text.text('chatSideVisitor'),
    }));

    /** Язык экрана: им строка списка называет минуту последней реплики. */
    protected readonly locale: Signal<string> = computed((): string => this.#locale.tag());

    /** Заголовок панели подробностей. */
    protected readonly detailsTitle: Signal<string> = computed((): string => this.#text.text('chatTalkDetails'));

    /** Заголовок ленты — последняя реплика разговора одной строкой. */
    protected readonly feedTitle: Signal<string> = computed((): string => chatTalkTitle(this.talk(), this.talkWords()));

    /** Свойства выбранного разговора: площадка, состояние и минута последней реплики. */
    protected readonly detailRows: Signal<readonly IRtWorkspaceDetails.Row[]> = computed((): readonly IRtWorkspaceDetails.Row[] =>
        chatTalkDetailRows(this.talk(), this.talkWords(), this.#locale.tag())
    );

    /** Действия над разговором: закрыть живой или открыть закрытый снова. */
    protected readonly talkActions: Signal<readonly IRtWorkspaceDetails.Action[]> = computed((): readonly IRtWorkspaceDetails.Action[] =>
        chatTalkActions(this.talk(), this.talkWords())
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

    /**
     * Выбрать разговор: лента читается с начала, набранное в поле остаётся при экране.
     *
     * Номер строки приходит от кита числом или строкой — у разговора он строковый, и приводится
     * к нему на границе, а не разносится по экрану двумя видами.
     */
    protected choose(rowId: IRtThreadList.TRowId): void {
        const talkId: string = String(rowId);

        this.chosen.set(talkId);
        this.#feed.read(talkId);
    }

    /**
     * Перечитать ленту открытого разговора.
     *
     * Реплики приезжают потоком событий, и рукой ленту обновлять обычно незачем. Кнопка стоит на
     * случай оборванного потока: он рвётся молча, и без неё оператор перезагружал бы страницу.
     */
    protected refreshFeed(): void {
        if (this.chosen()) {
            this.#feed.read(this.chosen());
        }
    }

    /**
     * Нажатое действие подробностей: закрыть разговор или открыть его снова. Список
     * перечитывается ответом сервиса.
     */
    protected changeState(action: string): void {
        const talk: IChat.Talk.State | null = this.talk();

        if (!talk) {
            return;
        }

        this.#talks.changeState(talk.id, chatTalkStateAfter(action));
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
