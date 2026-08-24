import { computed, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CargoVersionsApiService } from '@rt/message-bus-admin/common/core/api';
import { ECargoKind } from '@rt/message-bus-common';
import { BASE_INITIAL_STATE, BaseAsyncStoreService, IStateBase } from '@rt-tools/store';
import { catchError, EMPTY, mergeMap, Observable, Subject, tap } from 'rxjs';

/** Что знает отбор: какие версии выпуска встретились у каждого рода груза. */
export interface ICargoVersionsState extends IStateBase.Async {
    /** Версии по роду груза. Рода, который ещё не читали, здесь нет вовсе. */
    byKind: Readonly<Partial<Record<ECargoKind, readonly string[]>>>;
}

/** Сообщения шины стора: по ним экран узнаёт, что версии прочитаны. */
export type TCargoVersionsMessage = 'versions-read';

const INITIAL_STATE: ICargoVersionsState = { ...BASE_INITIAL_STATE.ASYNC, byKind: {} };

/**
 * Версии выпуска для отбора. Один экземпляр на приложение, а набор у каждого рода груза свой:
 * версия, встретившаяся у разборов, в отборе предложений не стоит.
 *
 * `mergeMap`, а не `switchMap`: два раздела спрашивают разные наборы, и запрос второго не
 * отменяет первого — иначе переход между разделами оставлял бы один из отборов пустым.
 *
 * Отказ чтения версий экран не показывает — тем же приёмом, что и отказ чтения деревьев: отбор
 * при нём пуст, а список читается по-прежнему. Человек пришёл за грузом, а не за версиями.
 */
@Injectable({ providedIn: 'root' })
export class CargoVersionsStore extends BaseAsyncStoreService<ICargoVersionsState, TCargoVersionsMessage> {
    readonly #api: CargoVersionsApiService = inject(CargoVersionsApiService);
    readonly #readSource: Subject<ECargoKind> = new Subject<ECargoKind>();

    public readonly byKind: Signal<Readonly<Partial<Record<ECargoKind, readonly string[]>>>> = computed(() => this.store().byKind);

    constructor() {
        super(INITIAL_STATE);

        this.#readSource
            .pipe(
                tap((): void => this.startLoading()),
                mergeMap((kind: ECargoKind): Observable<readonly string[]> =>
                    this.#api.versions(kind).pipe(
                        tap((versions: readonly string[]): void => {
                            this.patchState((state: ICargoVersionsState) => ({ ...state, byKind: { ...state.byKind, [kind]: versions } }));
                            this.setLoadingSuccess();
                            this.dispatch({ type: 'versions-read' });
                        }),
                        catchError((fault: unknown): Observable<never> => {
                            this.setLoadingFailureVoid(fault, { showNotification: false });

                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe();
    }

    /** Прочитать версии рода груза. Зовётся списочным экраном раздела при входе в него. */
    public read(kind: ECargoKind): void {
        this.#readSource.next(kind);
    }
}
