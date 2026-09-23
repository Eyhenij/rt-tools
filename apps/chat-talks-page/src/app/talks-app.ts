import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    OnInit,
    signal,
    Signal,
    untracked,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { chatKitTalks, chatKitThread, IChat, IChatKitTalkRow, IChatSideLabels } from '@rt/message-bus-admin/chat/util';
import { EChatTalkState, IPage } from '@rt/message-bus-common';
import { BlockDirective, ElemDirective, WINDOW } from '@rt-tools/core';
import {
    IRtChat,
    IRtThreadList,
    RtButtonDirective,
    RtChatComponent,
    RtEmptyStateComponent,
    RtThreadListComponent,
    RtThreadListRowDirective,
    RtThreadListSearchDirective,
} from '@rt-tools/ui-kit-v2';
import { catchError, concatMap, EMPTY, Observable, Subject, switchMap } from 'rxjs';

import { TalksApiService } from './talks-api.service';
import { chatPageEntryOf, ETalksEntry, IChatPageEntry } from './talks-entry.logic';
import { TalksEntryService } from './talks-entry.service';
import { TALKS_WORDS } from './talks-words';

const BEM_BLOCK: string = 'talks-page';

/** Сколько переписок читается за раз: список идёт страницей, как и в панели оператора. */
const PAGE_TALKS_SIZE: number = 50;

/** Сколько реплик читается за раз. */
const PAGE_FEED_SIZE: number = 100;

/** Подписи сторон для треда набора: набор о сторонах этого домена не знает ничего. */
const SIDE_LABELS: IChatSideLabels = { operator: TALKS_WORDS.sideOperator, visitor: TALKS_WORDS.sideVisitor };

/**
 * Страница переписок, как её видит человек потребителя.
 *
 * Своей оболочки у страницы нет: она стоит в рамке чужой админки и занимает её целиком. Ключ
 * площадки и адрес встроившей админки приезжают адресом рамки; без них открывать нечего, и страница
 * говорит об этом словами, а не пустым экраном.
 *
 * Выбора площадки на странице нет вовсе: сайт назван признаком страницы, и список читает его один.
 *
 * Список и лента — готовые части набора, те же, которыми нарисована панель оператора. Перевод строк
 * в модели набора берётся готовым: второй, написанный здесь, разошёлся бы с первым молча.
 *
 * Отказ любой операции разбирает служба входа: истёкший посреди чтения признак она меняет сама, а
 * прочее показывает человеку словами.
 */
@Component({
    selector: 'talks-root',
    templateUrl: './talks-app.html',
    host: { class: BEM_BLOCK },
    styleUrl: './talks-app.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtChatComponent,
        RtEmptyStateComponent,
        RtThreadListComponent,
        RtThreadListRowDirective,
        RtThreadListSearchDirective,
    ],
})
export class TalksApp implements OnInit {
    readonly #window: Window = inject(WINDOW);
    readonly #entrance: TalksEntryService = inject(TalksEntryService);
    readonly #api: TalksApiService = inject(TalksApiService);
    readonly #rows: WritableSignal<readonly IChat.Talk.State[]> = signal<readonly IChat.Talk.State[]>([]);
    readonly #messages: WritableSignal<readonly IChat.Message.State[]> = signal<readonly IChat.Message.State[]>([]);
    readonly #talksReading: WritableSignal<boolean> = signal<boolean>(false);
    readonly #feedReading: WritableSignal<boolean> = signal<boolean>(false);
    readonly #readSource: Subject<void> = new Subject<void>();
    readonly #feedSource: Subject<string> = new Subject<string>();
    readonly #sendSource: Subject<string> = new Subject<string>();
    readonly #stateSource: Subject<EChatTalkState> = new Subject<EChatTalkState>();

    /** Чем страница представляется сервису. Пусто — её встроили без ключа площадки или без адреса. */
    public readonly entry: IChatPageEntry | null = chatPageEntryOf(this.#window.location.search, this.#window.location.origin);

    /** Где стоит вход: идёт, открыт или отбит. */
    public readonly state: Signal<ETalksEntry> = this.#entrance.state;

    /** Слова отказа для человека. */
    public readonly refusalWords: Signal<string> = this.#entrance.refusalWords;

    /** Выбранный разговор. Пусто — не выбран ни один, и лента просит выбрать. */
    public readonly chosen: WritableSignal<string> = signal<string>('');

    /** Строки списка моделью набора. */
    public readonly talkRows: Signal<IChatKitTalkRow[]> = computed((): IChatKitTalkRow[] => chatKitTalks(this.#rows()));

    /** Лента разговора моделью набора. */
    public readonly thread: Signal<readonly IRtChat.Message[]> = computed((): readonly IRtChat.Message[] =>
        chatKitThread(this.#messages(), SIDE_LABELS)
    );

    /** Выбранный разговор целиком: по нему подписывается кнопка состояния. */
    public readonly talk: Signal<IChat.Talk.State | null> = computed(
        (): IChat.Talk.State | null => this.#rows().find((row: IChat.Talk.State): boolean => row.id === this.chosen()) ?? null
    );

    /** Подпись кнопки состояния: закрыть живой разговор или открыть закрытый снова. */
    public readonly stateLabel: Signal<string> = computed((): string =>
        this.talk()?.state === EChatTalkState.Closed ? TALKS_WORDS.reopen : TALKS_WORDS.close
    );

    public readonly talksReading: Signal<boolean> = this.#talksReading.asReadonly();
    public readonly feedReading: Signal<boolean> = this.#feedReading.asReadonly();
    public readonly words: Readonly<Record<string, string>> = TALKS_WORDS;
    /** Слово закрытого разговора: разметка сверяет строку с набором, а не с буквами в месте. */
    public readonly closed: EChatTalkState = EChatTalkState.Closed;

    public readonly opened: ETalksEntry = ETalksEntry.Opened;
    public readonly refused: ETalksEntry = ETalksEntry.Refused;

    constructor() {
        // Чтения переключаются: пока идёт прежнее, ответ на него уже не нужен — на экране стоит
        // то, что попросили последним
        this.#readSource
            .pipe(
                switchMap((): Observable<IPage<IChat.Talk.State>> => {
                    this.#talksReading.set(true);

                    return this.#api.talks({ sign: this.#entrance.sign(), page: 1, size: PAGE_TALKS_SIZE, state: '' }).pipe(this.#quiet());
                }),
                takeUntilDestroyed()
            )
            .subscribe((page: IPage<IChat.Talk.State>): void => {
                this.#rows.set(page.rows);
                this.#talksReading.set(false);
            });

        this.#feedSource
            .pipe(
                switchMap((talkId: string): Observable<IPage<IChat.Message.State>> => {
                    this.#feedReading.set(true);

                    return this.#api.feed(talkId, { sign: this.#entrance.sign(), page: 1, size: PAGE_FEED_SIZE }).pipe(this.#quiet());
                }),
                takeUntilDestroyed()
            )
            .subscribe((page: IPage<IChat.Message.State>): void => {
                this.#messages.set(page.rows);
                this.#feedReading.set(false);
            });

        // Реплики идут чередой: порядок сообщений в разговоре решает минута приёма сервисом, и
        // переключение отбросило бы ту, которую человек уже набрал и отправил
        this.#sendSource
            .pipe(
                concatMap((text: string): Observable<IChat.Message.State> =>
                    this.#api.answer(this.chosen(), this.#entrance.sign(), text).pipe(this.#quiet())
                ),
                takeUntilDestroyed()
            )
            .subscribe((message: IChat.Message.State): void =>
                this.#messages.update((feed: readonly IChat.Message.State[]): readonly IChat.Message.State[] => [...feed, message])
            );

        this.#stateSource
            .pipe(
                concatMap((asked: EChatTalkState): Observable<EChatTalkState> =>
                    this.#api.state(this.chosen(), this.#entrance.sign(), asked).pipe(this.#quiet())
                ),
                takeUntilDestroyed()
            )
            .subscribe((): void => this.#readSource.next());

        // Список читается, как только вход открыт, и перечитывается с новым признаком: истёкший
        // признак страница меняет сама, и чтение продолжается там же, где оборвалось
        effect((): void => {
            const sign: string = this.#entrance.sign();

            if (sign) {
                untracked((): void => this.#readSource.next());
            }
        });
    }

    public ngOnInit(): void {
        if (this.entry) {
            this.#api.at(this.entry.service);
            this.#entrance.start(this.entry);
        }
    }

    /** Выбрать разговор: лента читается с начала. */
    public choose(rowId: IRtThreadList.TRowId): void {
        const talkId: string = String(rowId);

        this.chosen.set(talkId);
        this.#feedSource.next(talkId);
    }

    /** Ответ посетителю: реплика уходит операцией и встаёт в ленту ответом сервиса. */
    public send(payload: IRtChat.SendPayload): void {
        const text: string = payload.text.trim();

        if (text && this.chosen()) {
            this.#sendSource.next(text);
        }
    }

    /** Закрыть разговор или открыть его снова. */
    public changeState(): void {
        const talk: IChat.Talk.State | null = this.talk();

        if (talk) {
            this.#stateSource.next(talk.state === EChatTalkState.Closed ? EChatTalkState.Live : EChatTalkState.Closed);
        }
    }

    /**
     * Отказ операции уходит службе входа и поток не рвёт.
     *
     * Оборванный поток перестал бы читать вовсе: истёкший признак меняется на новый, и следующее
     * чтение должно идти по тому же потоку.
     */
    #quiet<T>(): (source: Observable<T>) => Observable<T> {
        return (source: Observable<T>): Observable<T> =>
            source.pipe(
                catchError((fault: unknown): Observable<never> => {
                    this.#talksReading.set(false);
                    this.#feedReading.set(false);
                    this.#entrance.refused(fault);

                    return EMPTY;
                })
            );
    }
}
