import { computed, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TreesApiService } from '@rt/message-bus-admin/common/core/api';
import { ITreeChoice } from '@rt/message-bus-common';
import { BASE_INITIAL_STATE, BaseAsyncStoreService, IStateBase } from '@rt-tools/store';
import { catchError, EMPTY, exhaustMap, Observable, Subject, tap } from 'rxjs';

/** Что знает отбор: какие деревья присылали груз. */
export interface ITreesState extends IStateBase.Async {
    choices: readonly ITreeChoice[];
}

/** Сообщения шины стора: по ним экран узнаёт, что деревья прочитаны. */
export type TTreesMessage = 'trees-read';

const INITIAL_STATE: ITreesState = { ...BASE_INITIAL_STATE.ASYNC, choices: [] };

/**
 * Деревья для отбора. Один экземпляр на приложение: список один и тот же во всех трёх разделах,
 * и второй ответил бы на вопрос «какие деревья есть» иначе.
 *
 * `exhaustMap`, а не `switchMap`: три раздела просят один и тот же список, и повторный запрос,
 * пришедший, пока идёт первый, ничего нового не принесёт.
 *
 * Отказ чтения деревьев экран не показывает: отбор при нём пуст, а список читается по-прежнему.
 * Сказать о нём человеку нечего — он пришёл за грузом, а не за деревьями.
 */
@Injectable({ providedIn: 'root' })
export class TreesStore extends BaseAsyncStoreService<ITreesState, TTreesMessage> {
    readonly #api: TreesApiService = inject(TreesApiService);
    readonly #readSource: Subject<void> = new Subject<void>();

    public readonly choices: Signal<readonly ITreeChoice[]> = computed(() => this.store().choices);

    constructor() {
        super(INITIAL_STATE);

        this.#readSource
            .pipe(
                tap((): void => this.startLoading()),
                exhaustMap((): Observable<readonly ITreeChoice[]> =>
                    this.#api.choices().pipe(
                        tap((choices: readonly ITreeChoice[]): void => {
                            this.patchState((state: ITreesState) => ({ ...state, choices }));
                            this.setLoadingSuccess();
                            this.dispatch({ type: 'trees-read' });
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

    /** Прочитать деревья. Зовётся списочным экраном при входе в раздел. */
    public read(): void {
        this.#readSource.next();
    }
}
