import { computed, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { detailsInitialState, IDetailsState, IReadFault } from '@rt/message-bus-admin/common/core/util';
import { ProposalsApiService } from '@rt/message-bus-admin/proposals/api';
import { IProposal } from '@rt/message-bus-admin/proposals/util';
import { BaseAsyncStoreService } from '@rt-tools/store';
import { catchError, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';

/** Что знает панель подробностей: запись, чем кончилось её чтение. Общее объявление — в основании семейства. */
export type TProposalState = IDetailsState<IProposal.State>;

/** Сообщения шины стора: по ним панель узнаёт, что запись прочитана. */
export type TProposalMessage = 'proposal-read';

const INITIAL_STATE: TProposalState = detailsInitialState<IProposal.State>();

/**
 * Одно предложение — то, что показывает панель подробностей.
 *
 * Живёт отдельно от списка: список несёт строки без текста, а панель — запись целиком, и
 * читаются они разными операциями. Взять запись из списка нельзя — ни текста, ни месяца там нет.
 *
 * `switchMap`: человек открывает соседнюю строку, не дождавшись первой, и увидеть он должен ту,
 * которую назвал последней.
 */
@Injectable({ providedIn: 'root' })
export class ProposalStore extends BaseAsyncStoreService<TProposalState, TProposalMessage> {
    readonly #api: ProposalsApiService = inject(ProposalsApiService);
    readonly #readSource: Subject<string> = new Subject<string>();

    public readonly entity: Signal<IProposal.State | null> = computed(() => this.store().entity);
    public readonly fault: Signal<IReadFault | null> = computed(() => this.store().fault);

    constructor() {
        super(INITIAL_STATE);

        this.#readSource
            .pipe(
                tap((): void => {
                    this.patchState((state: TProposalState) => ({ ...state, entity: null, fault: null }));
                    this.startLoading();
                }),
                switchMap((id: string): Observable<IProposal.State> =>
                    this.#api.one(id).pipe(
                        tap((entity: IProposal.State): void => {
                            this.patchState((state: TProposalState) => ({ ...state, entity }));
                            this.setLoadingSuccess();
                            this.dispatch({ type: 'proposal-read' });
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

    /** Прочитать запись по признаку из адреса. */
    public read(id: string): void {
        this.#readSource.next(id);
    }

    /**
     * Отказ в состояние.
     *
     * Род отказа панель показывает по-разному: записи нет — так и сказано, остальное — отказ
     * чтения. Пустой панели при этом не бывает ни в одном из случаев.
     */
    #refuse(fault: IReadFault): void {
        this.patchState((state: TProposalState) => ({ ...state, entity: null, fault }));
        this.setLoadingFailureVoid(fault, { showNotification: false });
    }
}
