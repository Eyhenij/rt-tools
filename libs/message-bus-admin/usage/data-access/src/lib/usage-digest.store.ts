import { computed, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IReadFault } from '@rt/message-bus-admin/common/core/util';
import { IUsageSessionsAsked, UsageApiService } from '@rt/message-bus-admin/usage/api';
import { IUsage } from '@rt/message-bus-admin/usage/util';
import { BASE_INITIAL_STATE, BaseAsyncStoreService, IStateBase } from '@rt-tools/store';
import { catchError, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';

/** Что знает сводка: прочитанная сводка, чем кончилось чтение. */
export interface IUsageDigestState extends IStateBase.Async {
    readonly digest: IUsage.Digest.State | null;
    readonly fault: IReadFault | null;
}

/** Сообщения шины стора: по ним экран узнаёт, что сводка прочитана. */
export type TUsageDigestMessage = 'digest-read';

const INITIAL_STATE: IUsageDigestState = { ...BASE_INITIAL_STATE.ASYNC, digest: null, fault: null };

/**
 * Сводка периода — то, что стоит над таблицей: график по дням и три списка.
 *
 * Живёт отдельно от таблицы: та меняется с порядком и номером страницы, сводка — только с
 * деревом и периодом, и читать её на каждую сортировку незачем. Экран зовёт чтение, когда
 * меняется сужение, и не зовёт, когда меняется порядок.
 *
 * Прежняя сводка при перечитывании остаётся на месте под признаком чтения: пустые карточки на
 * каждую смену периода мигали бы.
 *
 * `switchMap`: человек переключил период, не дождавшись первого ответа, и увидеть он должен
 * последний названный.
 */
@Injectable({ providedIn: 'root' })
export class UsageDigestStore extends BaseAsyncStoreService<IUsageDigestState, TUsageDigestMessage> {
    readonly #api: UsageApiService = inject(UsageApiService);
    readonly #readSource: Subject<IUsageSessionsAsked> = new Subject<IUsageSessionsAsked>();

    public readonly digest: Signal<IUsage.Digest.State | null> = computed(() => this.store().digest);
    public readonly fault: Signal<IReadFault | null> = computed(() => this.store().fault);

    constructor() {
        super(INITIAL_STATE);

        this.#readSource
            .pipe(
                tap((): void => {
                    this.patchState((state: IUsageDigestState) => ({ ...state, fault: null }));
                    this.startLoading();
                }),
                switchMap((asked: IUsageSessionsAsked): Observable<IUsage.Digest.State> =>
                    this.#api.digest(asked).pipe(
                        tap((digest: IUsage.Digest.State): void => {
                            this.patchState((state: IUsageDigestState) => ({ ...state, digest }));
                            this.setLoadingSuccess();
                            this.dispatch({ type: 'digest-read' });
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

    /** Прочитать сводку за дерево и период из адреса. Без дерева читать нечего: сводка снимается. */
    public read(asked: IUsageSessionsAsked): void {
        if (asked.tree === '') {
            this.patchState((state: IUsageDigestState) => ({ ...state, digest: null, fault: null }));

            return;
        }
        this.#readSource.next(asked);
    }

    /** Отказ в состояние; без оповещения — отказ виден на месте карточек. */
    #refuse(fault: IReadFault): void {
        this.patchState((state: IUsageDigestState) => ({ ...state, digest: null, fault }));
        this.setLoadingFailureVoid(fault, { showNotification: false });
    }
}
