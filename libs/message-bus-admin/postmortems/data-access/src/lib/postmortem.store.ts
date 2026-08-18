import { computed, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { detailsInitialState, IDetailsState, IReadFault } from '@rt/message-bus-admin/common/core/util';
import { PostmortemsApiService } from '@rt/message-bus-admin/postmortems/api';
import { IPostmortem } from '@rt/message-bus-admin/postmortems/util';
import { BaseAsyncStoreService } from '@rt-tools/store';
import { catchError, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';

/** Что знает панель подробностей: запись, чем кончилось её чтение. Общее объявление — в основании семейства. */
export type TPostmortemState = IDetailsState<IPostmortem.State>;

/** Сообщения шины стора: по ним панель узнаёт, что запись прочитана. */
export type TPostmortemMessage = 'postmortem-read';

const INITIAL_STATE: TPostmortemState = detailsInitialState<IPostmortem.State>();

/**
 * Одна запись разбора — то, что показывает панель подробностей.
 *
 * Живёт отдельно от списка: список несёт строки без текста, а панель — запись целиком, и
 * читаются они разными операциями. Взять запись из списка нельзя — текста там нет.
 *
 * `switchMap`: человек открывает соседнюю строку, не дождавшись первой, и увидеть он должен ту,
 * которую назвал последней.
 */
@Injectable({ providedIn: 'root' })
export class PostmortemStore extends BaseAsyncStoreService<TPostmortemState, TPostmortemMessage> {
    readonly #api: PostmortemsApiService = inject(PostmortemsApiService);
    readonly #readSource: Subject<string> = new Subject<string>();

    public readonly entity: Signal<IPostmortem.State | null> = computed(() => this.store().entity);
    public readonly fault: Signal<IReadFault | null> = computed(() => this.store().fault);

    constructor() {
        super(INITIAL_STATE);

        this.#readSource
            .pipe(
                tap((): void => {
                    this.patchState((state: TPostmortemState) => ({ ...state, entity: null, fault: null }));
                    this.startLoading();
                }),
                switchMap((id: string): Observable<IPostmortem.State> =>
                    this.#api.one(id).pipe(
                        tap((entity: IPostmortem.State): void => {
                            this.patchState((state: TPostmortemState) => ({ ...state, entity }));
                            this.setLoadingSuccess();
                            this.dispatch({ type: 'postmortem-read' });
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
        this.patchState((state: TPostmortemState) => ({ ...state, entity: null, fault }));
        this.setLoadingFailureVoid(fault, { showNotification: false });
    }
}
