import { computed, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { detailsInitialState, IDetailsState, IReadFault } from '@rt/message-bus-admin/common/core/util';
import { SummariesApiService } from '@rt/message-bus-admin/summaries/api';
import { IMonthRecord } from '@rt/message-bus-admin/summaries/util';
import { BaseAsyncStoreService } from '@rt-tools/store';
import { catchError, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';

/** Что знает панель подробностей: запись, чем кончилось её чтение. Общее объявление — в основании семейства. */
export type IMonthRecordState = IDetailsState<IMonthRecord.State>;

/** Сообщения шины стора: по ним панель узнаёт, что запись прочитана. */
export type TMonthRecordMessage = 'month-record-read';

const INITIAL_STATE: IMonthRecordState = detailsInitialState<IMonthRecord.State>();

/**
 * Одна запись месяца — то, что показывает панель подробностей.
 *
 * Живёт отдельно от списка: список несёт строки без сводки, а панель — запись целиком, и
 * читаются они разными операциями. Взять запись из списка нельзя — сводки там нет.
 *
 * `switchMap`: человек открывает соседнюю строку, не дождавшись первой, и увидеть он должен ту,
 * которую назвал последней.
 */
@Injectable({ providedIn: 'root' })
export class MonthRecordStore extends BaseAsyncStoreService<IMonthRecordState, TMonthRecordMessage> {
    readonly #api: SummariesApiService = inject(SummariesApiService);
    readonly #readSource: Subject<string> = new Subject<string>();

    public readonly entity: Signal<IMonthRecord.State | null> = computed(() => this.store().entity);
    public readonly fault: Signal<IReadFault | null> = computed(() => this.store().fault);

    constructor() {
        super(INITIAL_STATE);

        this.#readSource
            .pipe(
                tap((): void => {
                    this.patchState((state: IMonthRecordState) => ({ ...state, entity: null, fault: null }));
                    this.startLoading();
                }),
                switchMap((id: string): Observable<IMonthRecord.State> =>
                    this.#api.one(id).pipe(
                        tap((entity: IMonthRecord.State): void => {
                            this.patchState((state: IMonthRecordState) => ({ ...state, entity }));
                            this.setLoadingSuccess();
                            this.dispatch({ type: 'month-record-read' });
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
        this.patchState((state: IMonthRecordState) => ({ ...state, entity: null, fault }));
        this.setLoadingFailureVoid(fault, { showNotification: false });
    }
}
