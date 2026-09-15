import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthApiService } from '@rt/message-bus-admin/auth/api';
import { ESignInFault, IAdminSession, ISetupState, ISignInPair, signInFault } from '@rt/message-bus-admin/auth/util';
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

    /** Права вошедшего, как их прислал приёмник. У невошедшего их нет ни одного. */
    public readonly rights: Signal<readonly string[]> = computed(() => this.store().session?.rights ?? []);

    /** Приехал ли ответ о вошедшем. Пока не приехал, права неизвестны, а не пусты. */
    public readonly rightsKnown: Signal<boolean> = computed(() => this.store().session !== null);

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

    /**
     * Показывать ли то, что закрыто правом.
     *
     * Пока ответ о вошедшем не приехал, не скрывается ничего: пустой набор прав до ответа прятал
     * бы разделы у того, у кого они есть, и человек видел бы пустую админку без выхода из неё.
     * Закрывает раздел приёмник, а этот ответ решает только, показывать ли пункт.
     */
    public allows(right: string): boolean {
        return !this.rightsKnown() || this.rights().includes(right);
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

    /**
     * Забыть вход, которого больше нет.
     *
     * Приёмника при этом не спрашивают: он и сказал, что вход кончился, — отозванный, выключенный
     * или просроченный, — и просить его оборвать уже оборванное значило бы отвечать отказом на
     * отказ. Состояние без этого осталось бы при вошедшем: гвард пускал бы по разделам, которым
     * приёмник уже отвечает отказом.
     */
    /**
     * Ждёт ли узел первой записи.
     *
     * Ответом приёмника, а не догадкой по отказу входа: отказ входа один на «я ошибся» и «заводить
     * некого», и экран входа по нему двух состояний не различит.
     */
    public setupState(): Observable<ISetupState> {
        return this.#api.setupState();
    }

    /**
     * Завести первую запись и войти ею.
     *
     * Потоком, а не источником действия: занятость и слово отказа держит экран, у которого они
     * свои — слово приёмника над полями, а не один из трёх родов отказа входа. Удача же кладёт
     * вход тем же способом, что и вход по паре: дальше это тот же вошедший.
     */
    public setUp(pair: ISignInPair): Observable<IAdminSession> {
        return this.#api.setUp(pair).pipe(
            tap((session: IAdminSession): void => {
                this.patchState((state: IAuthState) => ({ ...state, session, fault: null }));
                this.dispatch({ type: 'signed-in' });
            })
        );
    }

    public forget(): void {
        this.patchState((state: IAuthState) => ({ ...state, session: null }));
        this.dispatch({ type: 'signed-out' });
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
