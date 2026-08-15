import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthApiService } from '@rt/message-bus-admin/auth/api';
import { ESignInFault, IAdminSession, ISignInPair, signInFault } from '@rt/message-bus-admin/auth/util';
import { BASE_INITIAL_STATE, BaseAsyncStoreService, IStateBase } from '@rt-tools/store';
import { catchError, EMPTY, exhaustMap, Observable, of, Subject, tap } from 'rxjs';

/** Что знает экран входа: кто вошёл и чем кончилась последняя попытка. */
export interface IAuthState extends IStateBase.Async {
    session: IAdminSession | null;
    fault: ESignInFault | null;
}

/** Сообщения шины стора: по ним экран узнаёт, что вход состоялся или оборвался. */
export type TAuthMessage = 'signed-in' | 'signed-out';

const INITIAL_STATE: IAuthState = {
    ...BASE_INITIAL_STATE.ASYNC,
    session: null,
    fault: null,
};

/**
 * Состояние входа админки.
 *
 * Попытки складываются в источник действия, а подписка на него объявлена один раз, в
 * конструкторе: `exhaustMap` роняет вторую попытку, пока идёт первая. Подписка на каждое
 * нажатие иначе даёт гонку ответов, и побеждает тот, что вернулся последним, а не тот, что
 * нажали последним.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore extends BaseAsyncStoreService<IAuthState, TAuthMessage> {
    public readonly session: Signal<IAdminSession | null> = computed(() => this.store().session);
    public readonly fault: Signal<ESignInFault | null> = computed(() => this.store().fault);
    public readonly signedIn: Signal<boolean> = computed(() => this.store().session !== null);

    readonly #api: AuthApiService = inject(AuthApiService);
    readonly #signInSource: Subject<ISignInPair> = new Subject<ISignInPair>();

    constructor() {
        super(INITIAL_STATE);

        this.#signInSource
            .pipe(
                tap((): void => {
                    this.patchState((state: IAuthState) => ({ ...state, fault: null }));
                    this.startLoading();
                }),
                exhaustMap((pair: ISignInPair): Observable<IAdminSession> =>
                    this.#api.signIn(pair).pipe(
                        tap((session: IAdminSession): void => {
                            this.patchState((state: IAuthState) => ({ ...state, session }));
                            this.setLoadingSuccess();
                            this.dispatch({ type: 'signed-in' });
                        }),
                        catchError((error: HttpErrorResponse): Observable<never> => {
                            this.#refuse(error);

                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe();
    }

    /** Отправить пару. Что делать с предыдущей попыткой, решает подписка, а не вызывающий. */
    public signIn(pair: ISignInPair): void {
        this.#signInSource.next(pair);
    }

    /**
     * Кто вошёл — по куке, а не по памяти вкладки. Спрашивается при подъёме приложения: вход
     * переживает перезагрузку, и без этого вопроса человек попадал бы на экран входа с живой
     * кукой в браузере.
     *
     * Отказ здесь не отказ работы: «не вошёл» — законный ответ, и экран входа его и ждёт.
     */
    public restore(): Observable<IAdminSession | null> {
        this.startFetching();

        return this.#api.session().pipe(
            tap((session: IAdminSession): void => {
                this.patchState((state: IAuthState) => ({ ...state, session }));
                this.setFetchingSuccess();
            }),
            catchError((): Observable<null> => {
                this.patchState((state: IAuthState) => ({ ...state, session: null }));
                this.setFetchingSuccess();

                return of(null);
            })
        );
    }

    /** Выход обрывает тот вход, которым пришли, и только его: два браузера — два входа. */
    public signOut(): Observable<void> {
        return this.#api.signOut().pipe(
            tap((): void => {
                this.patchState((state: IAuthState) => ({ ...state, session: null }));
                this.dispatch({ type: 'signed-out' });
            })
        );
    }

    #refuse(error: HttpErrorResponse): void {
        this.patchState((state: IAuthState) => ({ ...state, fault: signInFault(error.status), session: null }));
        this.setLoadingFailureVoid(error, { showNotification: false });
    }
}
