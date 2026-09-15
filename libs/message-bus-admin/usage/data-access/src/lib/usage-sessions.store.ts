import { computed, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IReadFault } from '@rt/message-bus-admin/common/core/util';
import { IUsageSessionsAsked, UsageApiService } from '@rt/message-bus-admin/usage/api';
import { IUsage } from '@rt/message-bus-admin/usage/util';
import { BASE_INITIAL_STATE, BaseAsyncStoreService, IStateBase } from '@rt-tools/store';
import { catchError, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';

/** Что знает панель сессий: скил, его сессии за период, чем кончилось чтение. */
export interface IUsageSessionsState extends IStateBase.Async {
    readonly skill: string;
    readonly rows: readonly IUsage.Session.State[];
    readonly fault: IReadFault | null;
}

/** Сообщения шины стора: по ним панель узнаёт, что сессии прочитаны. */
export type TUsageSessionsMessage = 'sessions-read';

/** Чего просит панель: скил из адреса и сужение из той же выборки, какой читана таблица. */
export interface IUsageSessionsRead extends IUsageSessionsAsked {
    readonly skill: string;
}

const INITIAL_STATE: IUsageSessionsState = { ...BASE_INITIAL_STATE.ASYNC, skill: '', rows: [], fault: null };

/**
 * Сессии одного скила — то, что показывает панель сессий.
 *
 * Живёт отдельно от таблицы: строка таблицы несёт счёт сессий, а панель — сами сессии, и читаются
 * они разными операциями. Взять их из таблицы нельзя — там их нет.
 *
 * `switchMap`: человек открывает соседнюю строку, не дождавшись первой, и увидеть он должен ту,
 * которую назвал последней.
 */
@Injectable({ providedIn: 'root' })
export class UsageSessionsStore extends BaseAsyncStoreService<IUsageSessionsState, TUsageSessionsMessage> {
    readonly #api: UsageApiService = inject(UsageApiService);
    readonly #readSource: Subject<IUsageSessionsRead> = new Subject<IUsageSessionsRead>();

    public readonly skill: Signal<string> = computed(() => this.store().skill);
    public readonly rows: Signal<readonly IUsage.Session.State[]> = computed(() => this.store().rows);
    public readonly fault: Signal<IReadFault | null> = computed(() => this.store().fault);

    constructor() {
        super(INITIAL_STATE);

        this.#readSource
            .pipe(
                tap((asked: IUsageSessionsRead): void => {
                    this.patchState((state: IUsageSessionsState) => ({ ...state, skill: asked.skill, rows: [], fault: null }));
                    this.startLoading();
                }),
                switchMap((asked: IUsageSessionsRead): Observable<readonly IUsage.Session.State[]> =>
                    this.#api.sessions(asked.skill, asked).pipe(
                        tap((rows: readonly IUsage.Session.State[]): void => {
                            this.patchState((state: IUsageSessionsState) => ({ ...state, rows }));
                            this.setLoadingSuccess();
                            this.dispatch({ type: 'sessions-read' });
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
    }

    /** Прочитать сессии скила из адреса за сужение из того же адреса. */
    public read(asked: IUsageSessionsRead): void {
        this.#readSource.next(asked);
    }

    /**
     * Отказ в состояние.
     *
     * Основа зовётся без оповещения: отказ чтения человек видит на месте списка, и строка в
     * журнале браузера рядом с ним ничего не прибавляет.
     */
    #refuse(fault: IReadFault): void {
        this.patchState((state: IUsageSessionsState) => ({ ...state, rows: [], fault }));
        this.setLoadingFailureVoid(fault, { showNotification: false });
    }
}
