import { computed, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatApiService, IChatTalksAsked } from '@rt/message-bus-admin/chat/api';
import { IChat } from '@rt/message-bus-admin/chat/util';
import { IReadFault } from '@rt/message-bus-admin/common/core/util';
import { EChatTalkState, IPage } from '@rt/message-bus-common';
import { BASE_INITIAL_STATE, BaseAsyncStoreService, IStateBase } from '@rt-tools/store';
import { catchError, concatMap, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';

/** Что знает список переписок: строки, общий счёт, чем кончилось чтение. */
export interface IChatTalksState extends IStateBase.Async {
    readonly rows: readonly IChat.Talk.State[];
    readonly total: number;
    readonly fault: IReadFault | null;
}

/** Сообщения шины стора: по ним экран узнаёт, что список прочитан. */
export type TChatTalksMessage = 'talks-read';

/** Смена состояния одного разговора: какой и на какое. */
interface IStateChange {
    readonly talkId: string;
    readonly state: EChatTalkState;
}

const INITIAL_STATE: IChatTalksState = { ...BASE_INITIAL_STATE.ASYNC, rows: [], total: 0, fault: null };

/**
 * Список переписок оператора.
 *
 * Сужение по сайту и состоянию уходит в запрос, а не отбирается здесь: отсев после чтения
 * оставил бы соседский разговор в общем счёте строк, и число называло бы то, чего оператор
 * видеть не должен.
 *
 * `switchMap`: человек меняет сужение, не дождавшись прежнего ответа, и увидеть он должен то,
 * что назвал последним.
 */
@Injectable({ providedIn: 'root' })
export class ChatTalksStore extends BaseAsyncStoreService<IChatTalksState, TChatTalksMessage> {
    readonly #api: ChatApiService = inject(ChatApiService);
    readonly #readSource: Subject<IChatTalksAsked> = new Subject<IChatTalksAsked>();
    readonly #stateSource: Subject<IStateChange> = new Subject<IStateChange>();

    #asked: IChatTalksAsked | null = null;

    public readonly rows: Signal<readonly IChat.Talk.State[]> = computed(() => this.store().rows);
    public readonly total: Signal<number> = computed(() => this.store().total);
    public readonly fault: Signal<IReadFault | null> = computed(() => this.store().fault);

    constructor() {
        super(INITIAL_STATE);

        this.#readSource
            .pipe(
                tap((asked: IChatTalksAsked): void => {
                    this.#asked = asked;
                    this.patchState((state: IChatTalksState) => ({ ...state, fault: null }));
                    this.startLoading();
                }),
                switchMap((asked: IChatTalksAsked): Observable<IPage<IChat.Talk.State>> =>
                    this.#api.talks(asked).pipe(
                        tap((page: IPage<IChat.Talk.State>): void => {
                            this.patchState((state: IChatTalksState) => ({ ...state, rows: page.rows, total: page.total }));
                            this.setLoadingSuccess();
                            this.dispatch({ type: 'talks-read' });
                        }),
                        catchError((fault: IReadFault): Observable<never> => {
                            this.#refuse(fault);

                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe();

        this.#stateSource
            .pipe(
                concatMap((change: IStateChange): Observable<EChatTalkState> =>
                    this.#api.state(change.talkId, change.state).pipe(
                        tap((): void => {
                            if (this.#asked) {
                                this.#readSource.next(this.#asked);
                            }
                        }),
                        catchError((): Observable<never> => EMPTY)
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe();
    }

    /** Прочитать страницу переписок с названным сужением. */
    public read(asked: IChatTalksAsked): void {
        this.#readSource.next(asked);
    }

    /**
     * Закрыть разговор или открыть его снова.
     *
     * Список перечитывается ответом сервиса, а не правится на месте: сужение по состоянию стоит в
     * самом запросе, и закрытый разговор уходит из списка живых тем же чтением, каким он пришёл.
     */
    public changeState(talkId: string, state: EChatTalkState): void {
        this.#stateSource.next({ talkId, state });
    }

    /**
     * Отказ в состояние.
     *
     * Основа зовётся без оповещения: отказ чтения человек видит на месте списка, и строка в
     * журнале браузера рядом с ним ничего не прибавляет.
     */
    #refuse(fault: IReadFault): void {
        this.patchState((state: IChatTalksState) => ({ ...state, rows: [], total: 0, fault }));
        this.setLoadingFailureVoid(fault, { showNotification: false });
    }
}
